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
 * Get GitHub token from GitHub CLI keyring first, then fall back to env vars
 * This prevents issues with expired/invalid GITHUB_TOKEN env vars
 */
export function getGitHubToken() {
  // Try GitHub CLI keyring first (most reliable)
  try {
    const token = execSync('gh auth token', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    }).trim();
    
    // Check if token looks valid (starts with gho_ or ghp_)
    if (token && (token.startsWith('gho_') || token.startsWith('ghp_'))) {
      return token;
    }
  } catch (error) {
    // GitHub CLI not authenticated or not available, fall through to env vars
  }
  
  // Fall back to environment variables
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error(
      'GitHub token not found. Either:\n' +
      '  1. Run "gh auth login" to authenticate GitHub CLI (recommended)\n' +
      '  2. Set GITHUB_TOKEN or GH_TOKEN environment variable'
    );
  }
  
  return token;
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
 */
export async function githubApiRequest(endpoint, options = {}) {
  const token = getGitHubToken();
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

