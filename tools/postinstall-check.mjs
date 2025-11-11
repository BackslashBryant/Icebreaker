#!/usr/bin/env node

/**
 * Postinstall Setup Automation
 *
 * 1. Bootstraps personal config (~/.cursor-personal/config.json)
 * 2. Seeds the default webapp preset
 * 3. Auto-runs `npm run setup` (hands-free) when permitted
 * 4. Falls back to a reminder when automation is skipped
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadPersonalConfig } from './lib/personal-config.mjs';
import { detectRepoMode, setRepoMode } from './lib/repo-mode.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const setupStatePath = path.join(repoRoot, '.cursor', 'setup-state.json');
const depsHashPath = path.join(repoRoot, '.cursor', 'deps-hash.json');

function computeDependencyFingerprint() {
  const candidates = [
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'package.json',
  ];

  const contents = [];
  for (const file of candidates) {
    const filePath = path.join(repoRoot, file);
    if (existsSync(filePath)) {
      contents.push(readFileSync(filePath, 'utf8'));
    }
  }

  if (contents.length === 0) {
    return null;
  }

  const hash = createHash('sha256');
  contents.forEach(value => hash.update(value));
  return hash.digest('hex');
}

function installPrecommitHook(isCI) {
  if (isCI) {
    return;
  }

  const result = spawnSync('node', ['tools/install-agent-hook.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    console.warn('[warn] Failed to install pre-commit hook automatically. Run `npm run agents:install-hook` if you need template guardrails.');
  }
}

function refreshBrainsIfNeeded(isCI) {
  const fingerprint = computeDependencyFingerprint();
  if (!fingerprint) {
    return;
  }

  const cursorDir = path.join(repoRoot, '.cursor');
  if (!existsSync(cursorDir)) {
    mkdirSync(cursorDir, { recursive: true });
  }

  let previous = null;
  if (existsSync(depsHashPath)) {
    try {
      previous = JSON.parse(readFileSync(depsHashPath, 'utf8'));
    } catch {
      previous = null;
    }
  }

  if (previous?.hash === fingerprint) {
    return;
  }

  if (isCI) {
    writeFileSync(depsHashPath, JSON.stringify({ hash: fingerprint }, null, 2), 'utf8');
    console.log('[info] Dependency fingerprint changed (CI). Run `npm run brains:refresh` locally to regenerate automation helpers.');
    return;
  }

  console.log('\n[info] Dependency footprint changed. Auto-refreshing Cursor helpers...\n');
  const result = spawnSync('node', ['tools/brains-refresh.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    console.warn('[warn] brains:refresh exited with non-zero status. Run `npm run brains:refresh` manually.\n');
    return;
  }

  writeFileSync(depsHashPath, JSON.stringify({ hash: fingerprint }, null, 2), 'utf8');
}

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

async function main() {
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

  refreshBrainsIfNeeded(isCI);
  installPrecommitHook(isCI);

  // Auto-heal MCP config if needed
  if (!isCI) {
    try {
      const healResult = spawnSync('node', ['tools/mcp-self-heal.mjs'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: 'inherit',
      });
      if (healResult.status === 0) {
        console.log('[info] MCP config health check completed.\n');
      }
    } catch (error) {
      console.warn('[warn] MCP self-heal check failed:', error instanceof Error ? error.message : error);
    }
  }

  // Auto-detect and fix repo mode if needed
  if (!isCI) {
    try {
      const currentMode = detectRepoMode();
      const packageJsonPath = path.join(repoRoot, 'package.json');
      let looksLikeApp = false;

      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
          const name = (packageJson.name || '').toLowerCase();
          const description = (packageJson.description || '').toLowerCase();
          
          if (!name.includes('template') && !description.includes('template')) {
            looksLikeApp = true;
          }
        } catch {
          // Ignore
        }
      }

      if (currentMode === 'template' && looksLikeApp) {
        console.log('\n[info] Detected app repository in template mode. Auto-converting to app mode...\n');
        await setRepoMode('app');
        const convertResult = spawnSync('node', ['tools/convert-to-app.mjs'], {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: 'inherit',
        });
        if (convertResult.status === 0) {
          console.log('[info] Repository converted to app mode.\n');
        }
      }
    } catch (error) {
      console.warn('[warn] Failed to auto-detect repo mode:', error instanceof Error ? error.message : error);
    }
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
