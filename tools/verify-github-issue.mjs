#!/usr/bin/env node

/**
 * Verify GitHub issue number before creating
 * Checks if issue number exists, returns next available number
 * Usage: node tools/verify-github-issue.mjs [issueNumber]
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Load .env file if it exists
function loadEnvFile() {
  const envPath = path.join(repoRoot, '.env');
  if (!existsSync(envPath)) {
    return;
  }
  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

function getToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('Set GITHUB_TOKEN (or GH_TOKEN) with repo scope before running this script.');
  }
  return token;
}

function parseRepoFromRemote(remote) {
  if (!remote) {
    throw new Error('Unable to determine GitHub repository. Set GITHUB_REPO=owner/name.');
  }
  const sshMatch = remote.match(/^git@github\.com:(.+?)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`;
  }
  const httpsMatch = remote.match(/^https:\/\/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`;
  }
  throw new Error(`Unrecognised GitHub remote format: ${remote}`);
}

function getRepo() {
  if (process.env.GITHUB_REPO) {
    return process.env.GITHUB_REPO;
  }
  try {
    const remote = execSync('git config --get remote.origin.url', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    return parseRepoFromRemote(remote);
  } catch (error) {
    throw new Error('Failed to read remote.origin.url. Set GITHUB_REPO=owner/name and retry.');
  }
}

async function getHighestIssueNumber(repo, token) {
  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${repo}/issues?state=all&per_page=1&sort=number&direction=desc`;
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status}): ${await response.text()}`);
    }
    
    const data = await response.json();
    if (data.length === 0) {
      return 0;
    }
    return data[0].number;
  } catch (error) {
    console.error('Error fetching issues:', error.message);
    throw error;
  }
}

async function checkIssueExists(repo, token, issueNumber) {
  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${repo}/issues/${issueNumber}`;
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status}): ${await response.text()}`);
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('404')) {
      return false;
    }
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const requestedNumber = args[0] ? parseInt(args[0], 10) : null;
  
  const token = getToken();
  const repo = getRepo();
  
  const highestNumber = await getHighestIssueNumber(repo, token);
  const nextAvailable = highestNumber + 1;
  
  if (requestedNumber !== null) {
    const exists = await checkIssueExists(repo, token, requestedNumber);
    if (exists) {
      console.error(`❌ Issue #${requestedNumber} already exists on GitHub`);
      process.exit(1);
    }
    if (requestedNumber < nextAvailable) {
      console.warn(`⚠️  Warning: Issue #${requestedNumber} is lower than highest issue (#${highestNumber}). This may create gaps.`);
    }
    console.log(`✅ Issue #${requestedNumber} is available`);
    console.log(`Next available: #${nextAvailable}`);
  } else {
    console.log(`Next available issue number: #${nextAvailable}`);
    console.log(`Highest existing issue: #${highestNumber}`);
  }
  
  // Return next available for scripts
  if (!requestedNumber) {
    console.log(`\nUse this number for new issues: ${nextAvailable}`);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});

