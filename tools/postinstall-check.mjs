#!/usr/bin/env node

/**
 * Postinstall Setup Automation
 *
 * 1. Bootstraps personal config (~/.cursor-personal/config.json)
 * 2. Seeds the default webapp preset
 * 3. Auto-runs `npm run setup` (hands-free) when permitted
 * 4. Falls back to a reminder when automation is skipped
 */

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadPersonalConfig } from './lib/personal-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const setupStatePath = path.join(repoRoot, '.cursor', 'setup-state.json');

function runPersonalBootstrap() {
  const result = spawnSync('node', ['tools/personal-bootstrap.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error('Personal bootstrap failed');
  }
}

function runPresetWebapp() {
  const result = spawnSync('node', ['tools/preset-webapp.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.warn('\n[warn] Webapp preset generation exited with non-zero status. Run `npm run preset:webapp` manually.\n');
  }
}

function runSetupWizard() {
  const result = spawnSync('npm', ['run', 'setup'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_SETUP_PROMPT: 'true', // avoid recursion if npm install runs again
      CURSOR_AUTO_SETUP: 'true',
    },
  });
  if (result.status !== 0) {
    console.warn('\n[warn] Automated setup exited with non-zero status. Re-run `npm run setup` manually.\n');
  }
}

function printReminder() {
  console.log('');
  console.log('+--------------------------------------------+');
  console.log('| Cursor Workspace Setup Required            |');
  console.log('| Run `npm run setup` to complete onboarding |');
  console.log('| (creates agents, configures MCP, etc.)     |');
  console.log('+--------------------------------------------+\n');
  console.log('Set SKIP_SETUP_PROMPT=true to disable this reminder.\n');
}

function main() {
  if (process.env.SKIP_SETUP_PROMPT === 'true') {
    return;
  }

  const isCI =
    process.env.CI === 'true' ||
    process.env.NODE_ENV === 'production' ||
    process.env.npm_config_global === 'true';

  let personalConfig = loadPersonalConfig();
  if (!personalConfig) {
    console.log('\n[info] Personal config not found for', os.userInfo().username);
    if (isCI) {
      console.log('[info] Skipping personal bootstrap in CI.');
      return;
    }
    runPersonalBootstrap();
    personalConfig = loadPersonalConfig();
  }

  if (!isCI) {
    runPresetWebapp();
  }

  if (existsSync(setupStatePath)) {
    return; // setup already completed previously
  }

  if (isCI) {
    console.log('\n[info] Cursor setup required. Run `npm run setup` locally when ready.');
    return;
  }

  if (personalConfig?.autoSetupOnInstall) {
    console.log('\n[info] Auto-running Cursor setup (personal preference enabled)...\n');
    runSetupWizard();
    return;
  }

  printReminder();
}

try {
  main();
} catch (error) {
  console.error(
    'Postinstall check failed:',
    error instanceof Error ? error.message : error,
  );
}
