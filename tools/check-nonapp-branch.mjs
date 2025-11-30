#!/usr/bin/env node

/**
 * Guard rail: prevent committing non-app logic files outside `main`.
 */

import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function getBranch() {
  try {
    return run('git rev-parse --abbrev-ref HEAD');
  } catch {
    return 'HEAD';
  }
}

function getStaged() {
  try {
    const output = execSync('git diff --name-only --cached', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const NON_APP_PATTERNS = [
  /^\.cursor\/rules\//,
  /^\.cursor\/templates\//,
  /^\.cursor\/mcp\.json$/,
  /^\.cursor\/config\.json$/,
  /^tools\//,
  /^Docs\/migration\//,
  /^\.notes\/features\/README\.md$/,
];

const branch = getBranch();
if (branch === 'main' || branch === 'HEAD') {
  process.exit(0);
}

const staged = getStaged();
if (staged.length === 0) {
  process.exit(0);
}

const violations = staged.filter((file) =>
  NON_APP_PATTERNS.some((pattern) => pattern.test(file)),
);

if (violations.length === 0) {
  process.exit(0);
}

console.warn('\n[check-nonapp-branch] Notice: Non-app logic files staged on branch', branch);
violations.forEach((file) => console.warn(`  • ${file}`));
console.warn('\nAllowed when the work unblocks the active issue, but keep commits scoped.');
console.warn('Before merging, run `node tools/categorize-files.mjs --status` to split');
console.warn('global workflow tweaks from issue-specific changes. See `.cursor/rules/01-workflow.mdc`.');
process.exit(0);
