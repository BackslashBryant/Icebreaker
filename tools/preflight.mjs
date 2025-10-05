#!/usr/bin/env node

/**
 * Preflight runner for the stack-agnostic Cursor template.
 * Delegates to the platform-specific check-prerequisites script (PowerShell or Bash)
 * and normalises CLI flags so `npm run preflight` works anywhere.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const powershellScript = path.join(repoRoot, '.specify', 'scripts', 'powershell', 'check-prerequisites.ps1');
const bashScript = path.join(repoRoot, '.specify', 'scripts', 'bash', 'check-prerequisites.sh');

const rawArgs = process.argv.slice(2);
const forwardedArgs = rawArgs.filter(arg => arg !== '--ci');
const wantsJson = rawArgs.includes('--ci') || rawArgs.includes('--json');

const psFlagMap = new Map([
  ['--json', '-Json'],
  ['--require-tasks', '-RequireTasks'],
  ['--include-tasks', '-IncludeTasks'],
  ['--paths-only', '-PathsOnly'],
  ['--help', '-Help'],
]);

function translateArgsForPowerShell(args) {
  const mapped = [];
  for (const arg of args) {
    mapped.push(psFlagMap.get(arg) ?? arg);
  }
  if (wantsJson && !mapped.includes('-Json')) {
    mapped.push('-Json');
  }
  return mapped;
}

function translateArgsForBash(args) {
  const mapped = [...args];
  if (wantsJson && !mapped.includes('--json')) {
    mapped.push('--json');
  }
  return mapped;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 0;
}

function runPowerShell() {
  const args = ['-NoProfile', '-File', powershellScript, ...translateArgsForPowerShell(forwardedArgs)];
  try {
    return run('pwsh', args);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return run('powershell', args);
    }
    throw error;
  }
}

function runBash() {
  const args = [bashScript, ...translateArgsForBash(forwardedArgs)];
  return run('bash', args);
}

function main() {
  let exitCode = 0;

  if (process.platform === 'win32' && existsSync(powershellScript)) {
    exitCode = runPowerShell();
  } else if (existsSync(bashScript)) {
    exitCode = runBash();
  } else if (existsSync(powershellScript)) {
    exitCode = runPowerShell();
  } else {
    console.error('No check-prerequisites script found. Ensure .specify/scripts are present.');
    exitCode = 1;
  }

  process.exit(exitCode);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}