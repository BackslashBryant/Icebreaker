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

console.error('\n🚫 Non-app logic files must be committed on `main`.');
violations.forEach((file) => console.error(` - ${file}`));
console.error('\nFix:');
console.error('  1. git reset <file>');
console.error('  2. git checkout main');
console.error('  3. Apply change + commit on main');
console.error('  4. Rebase/merge main back into your feature branch');
console.error('\nSee `.cursor/rules/01-workflow.mdc` for policy details.');
process.exit(1);
