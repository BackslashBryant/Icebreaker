#!/usr/bin/env node

/**
 * Seeds a starter set of GitHub issues for a new project.
 *
 * Usage:
 *   npm run github:init
 *   npm run github:init -- --force   # recreate even if titles already exist
 *
 * Requires:
 *   - GitHub CLI authenticated (gh auth login) OR GITHUB_TOKEN env var
 *   - GITHUB_REPO (owner/name) or git remote origin pointing at GitHub
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getRepo, listIssues, createIssue } from './lib/github-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

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
- [ ] Plan stored in Docs/plans/Issue-<#>-plan-status.md
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
  const force = process.argv.includes('--force');
  const repo = getRepo();

  console.log(`Seeding starter issues for ${repo}...`);
  console.log(force ? '(--force: will recreate existing issues)' : '');

  // Get existing issue titles
  const existingIssues = force
    ? []
    : await listIssues(repo, { state: 'open', per_page: 100 });
  const existingTitles = new Set(existingIssues.map(issue => issue.title));

  const created = [];
  for (const issue of DEFAULT_ISSUES) {
    if (!force && existingTitles.has(issue.title)) {
      console.log(`- Skipping (already exists): ${issue.title}`);
      continue;
    }
    const response = await createIssue(repo, issue);
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
