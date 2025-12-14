#!/usr/bin/env node

/**
 * GitHub API utilities
 * 
 * Provides token retrieval (GitHub CLI keyring first, then env vars)
 * and REST API helpers for GitHub operations.
 * 
 * Uses REST API as primary method (more reliable than GraphQL).
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

/**
 * Check if .env file contains GITHUB_TOKEN and warn/remove it
 * This is the PRIMARY source of auth issues - .env files are auto-loaded
 */
function checkAndRemoveEnvFileToken() {
  try {
    const fs = require('fs');
    const envPath = path.join(repoRoot, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const tokenMatch = envContent.match(/^\s*GITHUB_TOKEN\s*=\s*.+$/m);
      if (tokenMatch) {
        console.error('❌ CRITICAL: GITHUB_TOKEN found in .env file - this breaks GitHub CLI authentication!');
        console.error('   Removing GITHUB_TOKEN from .env file...');
        const newContent = envContent.replace(/^\s*GITHUB_TOKEN\s*=\s*.+$/gm, 
          '# GitHub MCP - DO NOT SET GITHUB_TOKEN HERE\n' +
          '# GitHub CLI uses keyring authentication (gh auth login)\n' +
          '# Setting GITHUB_TOKEN in .env breaks GitHub CLI authentication\n' +
          '# MCP servers should call \'gh auth token\' to get token when needed'
        );
        fs.writeFileSync(envPath, newContent, 'utf8');
        console.error('   ✅ Removed GITHUB_TOKEN from .env file');
        console.error('   Run "gh auth login" to authenticate with GitHub CLI keyring');
      }
    }
  } catch (error) {
    // Ignore errors - best effort
  }
}

/**
 * Clear user-level GITHUB_TOKEN on Windows if it's blocking GitHub CLI keyring
 * Also checks .env file for GITHUB_TOKEN (PRIMARY source of issues)
 */
function clearBlockingUserToken() {
  // FIRST: Check .env file (most common source of issues)
  checkAndRemoveEnvFileToken();
  
  if (process.platform === 'win32') {
    try {
      // Check if user-level token exists
      const userToken = execSync(
        'powershell -Command "[System.Environment]::GetEnvironmentVariable(\'GITHUB_TOKEN\', \'User\')"',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
      ).trim();
      
      if (userToken) {
        // Clear user-level token (one-time fix)
        execSync(
          'powershell -Command "[System.Environment]::SetEnvironmentVariable(\'GITHUB_TOKEN\', $null, \'User\')"',
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
        );
        console.warn('⚠️  Cleared user-level GITHUB_TOKEN that was blocking GitHub CLI keyring');
        console.warn('   This was a one-time fix. Future sessions will use keyring token automatically.');
      }
    } catch (error) {
      // Ignore errors - clearing is best-effort
    }
  }
}

/**
 * Get GitHub token from GitHub CLI keyring first, then fall back to env vars
 * This prevents issues with expired/invalid GITHUB_TOKEN env vars
 * Automatically clears blocking user-level tokens on Windows
 */
export function getGitHubToken() {
  // Try GitHub CLI keyring first (most reliable)
  try {
    // Clear process-level GITHUB_TOKEN to ensure gh CLI uses keyring
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    
    const tokenOutput = execSync('gh auth token', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      env: { ...process.env, GITHUB_TOKEN: undefined },
    }).trim();
    
    // Check if gh CLI complained about env var blocking
    if (tokenOutput.includes('GITHUB_TOKEN environment variable') || 
        tokenOutput.includes('environment variable is being used')) {
      // User-level token is blocking - clear it automatically
      clearBlockingUserToken();
      // Retry after clearing
      const retryToken = execSync('gh auth token', {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
        env: { ...process.env, GITHUB_TOKEN: undefined },
      }).trim();
      
      if (retryToken && (retryToken.startsWith('gho_') || retryToken.startsWith('ghp_'))) {
        return retryToken;
      }
    }
    
    // Check if token looks valid (starts with gho_ or ghp_)
    if (tokenOutput && (tokenOutput.startsWith('gho_') || tokenOutput.startsWith('ghp_'))) {
      return tokenOutput;
    }
    
    // Restore original token if we had one
    if (originalToken) {
      process.env.GITHUB_TOKEN = originalToken;
    }
  } catch (error) {
    // Check if error message indicates env var blocking
    const errorMsg = error.message || error.stderr?.toString() || '';
    if (errorMsg.includes('GITHUB_TOKEN environment variable') || 
        errorMsg.includes('environment variable is being used')) {
      // User-level token is blocking - clear it automatically
      clearBlockingUserToken();
      // Retry after clearing
      try {
        const retryToken = execSync('gh auth token', {
          cwd: repoRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          encoding: 'utf8',
          env: { ...process.env, GITHUB_TOKEN: undefined },
        }).trim();
        
        if (retryToken && (retryToken.startsWith('gho_') || retryToken.startsWith('ghp_'))) {
          return retryToken;
        }
      } catch (retryError) {
        // GitHub CLI not authenticated or not available, fall through to env vars
      }
    }
    // GitHub CLI not authenticated or not available, fall through to env vars
  }
  
  // Fall back to environment variables, but validate format
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (envToken) {
    // Validate token format - if invalid, ignore it and try keyring again
    if (envToken.startsWith('gho_') || envToken.startsWith('ghp_')) {
      // Token format looks valid, but check if it's actually working
      // We'll let the API call fail if it's invalid rather than blocking here
      return envToken;
    } else {
      // Invalid token format - clear user-level token and try keyring again
      console.warn('⚠️  GITHUB_TOKEN env var has invalid format, attempting auto-recovery...');
      clearBlockingUserToken();
      
      // Try keyring one more time after clearing
      try {
        const keyringToken = execSync('gh auth token', {
          cwd: repoRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          encoding: 'utf8',
          env: { ...process.env, GITHUB_TOKEN: undefined },
        }).trim();
        if (keyringToken && (keyringToken.startsWith('gho_') || keyringToken.startsWith('ghp_'))) {
          console.log('✅ Auto-recovery successful: using GitHub CLI keyring token');
          return keyringToken;
        }
      } catch (error) {
        // Keyring still not available
      }
      // If we get here, env token is invalid format and keyring failed
      throw new Error(
        'GitHub token not found or invalid. Either:\n' +
        '  1. Run "gh auth login" to authenticate GitHub CLI (recommended)\n' +
        '  2. Set valid GITHUB_TOKEN or GH_TOKEN environment variable (must start with gho_ or ghp_)\n' +
        '  3. Run: node tools/fix-github-auth.ps1 (automatically clears blocking tokens)'
      );
    }
  }
  
  // No token found
  throw new Error(
    'GitHub token not found. Either:\n' +
    '  1. Run "gh auth login" to authenticate GitHub CLI (recommended)\n' +
    '  2. Set GITHUB_TOKEN or GH_TOKEN environment variable'
  );
}

/**
 * Parse repository owner/name from git remote URL
 */
export function parseRepoFromRemote(remote) {
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

/**
 * Get repository owner/name from git config or env var
 */
export function getRepo() {
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

/**
 * Get GitHub API base URL
 */
export function getApiBase() {
  return process.env.GITHUB_API_URL || 'https://api.github.com';
}

/**
 * Make a REST API request to GitHub
 * Uses REST API (not GraphQL) for reliability
 * Automatically retries with keyring token if env var token fails
 */
export async function githubApiRequest(endpoint, options = {}, retryCount = 0) {
  let token;
  try {
    token = getGitHubToken();
  } catch (error) {
    // If token retrieval failed and we haven't retried, try clearing blocking tokens
    if (retryCount === 0 && process.platform === 'win32') {
      clearBlockingUserToken();
      // Retry once after clearing
      token = getGitHubToken();
    } else {
      throw error;
    }
  }
  
  const apiBase = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
  
  const {
    method = 'GET',
    body,
    headers = {},
  } = options;
  
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'cursor-agent-template',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    
    // If 401 and we haven't retried, try clearing blocking tokens and retry
    if (response.status === 401 && retryCount === 0 && process.platform === 'win32') {
      console.warn('⚠️  GitHub API returned 401, attempting auto-recovery...');
      clearBlockingUserToken();
      // Retry once with fresh token
      return githubApiRequest(endpoint, options, retryCount + 1);
    }
    
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

/**
 * List issues (REST API)
 */
export async function listIssues(repo, options = {}) {
  const {
    state = 'open',
    per_page = 30,
    page = 1,
    labels,
    sort = 'created',
    direction = 'desc',
  } = options;
  
  const params = new URLSearchParams({
    state,
    per_page: per_page.toString(),
    page: page.toString(),
    sort,
    direction,
  });
  
  if (labels) {
    params.append('labels', Array.isArray(labels) ? labels.join(',') : labels);
  }
  
  const endpoint = `/repos/${repo}/issues?${params.toString()}`;
  return githubApiRequest(endpoint);
}

/**
 * Get a single issue (REST API)
 */
export async function getIssue(repo, issueNumber) {
  const endpoint = `/repos/${repo}/issues/${issueNumber}`;
  return githubApiRequest(endpoint);
}

/**
 * Create an issue (REST API)
 */
export async function createIssue(repo, { title, body, labels = [] }) {
  const endpoint = `/repos/${repo}/issues`;
  return githubApiRequest(endpoint, {
    method: 'POST',
    body: { title, body, labels },
  });
}

/**
 * Update an issue (REST API)
 */
export async function updateIssue(repo, issueNumber, updates) {
  const endpoint = `/repos/${repo}/issues/${issueNumber}`;
  return githubApiRequest(endpoint, {
    method: 'PATCH',
    body: updates,
  });
}

/**
 * Add a comment to an issue (REST API)
 */
export async function addIssueComment(repo, issueNumber, body) {
  const endpoint = `/repos/${repo}/issues/${issueNumber}/comments`;
  return githubApiRequest(endpoint, {
    method: 'POST',
    body: { body },
  });
}

/**
 * Create a pull request (REST API)
 */
export async function createPullRequest(repo, { title, body, head, base, draft = false }) {
  const endpoint = `/repos/${repo}/pulls`;
  return githubApiRequest(endpoint, {
    method: 'POST',
    body: { title, body, head, base, draft },
  });
}

/**
 * Get highest issue number (REST API)
 */
export async function getHighestIssueNumber(repo) {
  const issues = await listIssues(repo, {
    state: 'all',
    per_page: 1,
    sort: 'number',
    direction: 'desc',
  });
  
  if (issues.length === 0) {
    return 0;
  }
  
  return issues[0].number;
}

/**
 * Check if an issue exists (REST API)
 */
export async function issueExists(repo, issueNumber) {
  try {
    await getIssue(repo, issueNumber);
    return true;
  } catch (error) {
    if (error.message.includes('404')) {
      return false;
    }
    throw error;
  }
}

