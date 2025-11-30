#!/usr/bin/env node

/**
 * Copies Git hooks into .git/hooks.
 * Safe to run repeatedly; use --force to overwrite existing hooks.
 * Installs: pre-commit, commit-msg, post-merge, pre-push, post-checkout
 */

import { copyFileSync, existsSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gitHooksDir = path.join(repoRoot, '.git', 'hooks');

const hooks = [
  {
    name: 'pre-commit',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'pre-commit.sample'),
    target: path.join(gitHooksDir, 'pre-commit'),
  },
  {
    name: 'commit-msg',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'commit-msg.sample'),
    target: path.join(gitHooksDir, 'commit-msg'),
  },
  {
    name: 'post-merge',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'post-merge.sample'),
    target: path.join(gitHooksDir, 'post-merge'),
  },
  {
    name: 'post-commit',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'post-commit.sample'),
    target: path.join(gitHooksDir, 'post-commit'),
  },
  {
    name: 'pre-push',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'pre-push.sample'),
    target: path.join(gitHooksDir, 'pre-push'),
  },
  {
    name: 'post-checkout',
    sample: path.join(repoRoot, 'scripts', 'hooks', 'post-checkout.sample'),
    target: path.join(gitHooksDir, 'post-checkout'),
  },
];

function installHook(hook, force) {
  if (!existsSync(hook.sample)) {
    console.warn(`⚠ ${hook.name} hook sample not found at ${hook.sample}`);
    return false;
  }

  if (existsSync(hook.target) && !force) {
    console.log(`  ${hook.name}: Already exists (use --force to overwrite)`);
    return false;
  }

  copyFileSync(hook.sample, hook.target);

  try {
    chmodSync(hook.target, 0o755);
  } catch (error) {
    // chmod may fail on Windows; warn but continue.
    console.warn(`Warning: unable to set execute bit on ${hook.name} hook. Set it manually if needed.`);
  }

  console.log(`✓ Installed ${hook.name} hook`);
  return true;
}

function main() {
  const force = process.argv.includes('--force');

  if (!existsSync(path.join(repoRoot, '.git'))) {
    console.error('This repository has no .git directory. Initialise git first.');
    process.exit(1);
  }

  console.log('Installing Git hooks...\n');

  let installed = 0;
  for (const hook of hooks) {
    if (installHook(hook, force)) {
      installed++;
    }
  }

  if (installed === 0 && !force) {
    console.log('\nAll hooks already installed. Use --force to overwrite.');
  } else {
    console.log(`\n✓ Installed ${installed} hook(s)`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
}
