#!/usr/bin/env node

/**
 * Seeds a starter set of GitHub issues for a new project.
 *
 * Usage:
 *   npm run github:init
 *   npm run github:init -- --force   # recreate even if titles already exist
 *
 * Requires:
 *   - GITHUB_TOKEN (repo scope)
 *   - GITHUB_REPO (owner/name) or git remote.origin.url pointing at GitHub
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

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
  const remote = execSync('git config --get remote.origin.url', {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  }).trim();
  return parseRepoFromRemote(remote);
}

async function fetchJson(url, { token, method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cursor-template-init',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }
  return response.json();
}

async function listExistingIssueTitles({ repo, token }) {
  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${repo}/issues?state=open&per_page=100`;
  const data = await fetchJson(endpoint, { token });
  return new Set(data.map(issue => issue.title));
}

async function createIssue({ repo, token, title, body, labels }) {
  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${repo}/issues`;
  return fetchJson(endpoint, {
    token,
    method: 'POST',
    body: { title, body, labels },
  });
}

const DEFAULT_ISSUES = [
  {
    title: '[Spec] Capture project vision & MVP scope',
    labels: ['status:plan', 'agent:vector'],
    body: `## Goal
- Document vision in docs/vision.md
- Fill out docs/architecture/ARCHITECTURE_TEMPLATE.md
- Seed MVP DoD in .notes/features/<slug>/spec.md

## Checklist
- [ ] Vision drafted
- [ ] Architecture template filled
- [ ] MVP DoD agreed
- [ ] /session-summary logged`
  },
  {
    title: '[Plan] Break work into checkpoints',
    labels: ['status:plan', 'agent:vector'],
    body: `## Goal
- Use /vector-plan to create 3-5 numbered steps
- Map each MVP DoD item to a step/owner
- Log acceptance tests for Pixel

## Checklist
- [ ] Plan stored in docs/Plan.md
- [ ] Checkpoints mapped to owners
- [ ] Pixel test strategy confirmed
- [ ] /session-summary appended`
  },
  {
    title: '[Build] Implement planned checkpoints',
    labels: ['status:build'],
    body: `## Goal
- Work checkpoint-by-checkpoint with Plan → Act flow
- Run targeted tests after each change
- Update docs/ConnectionGuide.md when services change

## Checklist
- [ ] Checkpoint 1 complete (tests GREEN)
- [ ] Checkpoint 2 complete
- [ ] Checkpoint 3 complete
- [ ] Current Issues logged as needed`
  },
  {
    title: '[Verify] Tests, docs, and deployment',
    labels: ['status:verify', 'agent:pixel', 'agent:muse', 'agent:nexus'],
    body: `## Goal
- Pixel re-runs full test suite and logs GREEN
- Muse updates CHANGELOG + README
- Nexus ensures CI/preview ready

## Checklist
- [ ] Tests GREEN (run npm run verify)
- [ ] docs/context.md updated via /session-summary
- [ ] docs/ConnectionGuide.md reflects final state
- [ ] PR created with npm run github:pr`
  }
];

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const token = getToken();
  const repo = getRepo();

  console.log(`Seeding starter issues for ${repo}...`);

  const existingTitles = force
    ? new Set()
    : await listExistingIssueTitles({ repo, token });

  const created = [];
  for (const issue of DEFAULT_ISSUES) {
    if (!force && existingTitles.has(issue.title)) {
      console.log(`- Skipping (already exists): ${issue.title}`);
      continue;
    }
    const response = await createIssue({ repo, token, ...issue });
    created.push(response.html_url);
    console.log(`- Created: ${response.html_url}`);
  }

  if (created.length === 0) {
    console.log('No new issues created. Use --force to recreate.');
  } else {
    console.log('\nStarter issues ready!');
    console.log('Next steps:');
    console.log(' 1. Open the Spec issue and fill in the docs referenced.');
    console.log(' 2. Use /session-summary to keep docs/context.md current.');
    console.log(' 3. Progress issues as checkpoints turn GREEN.');
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
