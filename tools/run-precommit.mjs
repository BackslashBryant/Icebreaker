#!/usr/bin/env node

/**
 * Runs the standard guardrail checks (status, date validation, lint) and
 * captures their output in artifacts/verification.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const logDir = path.join(repoRoot, 'artifacts', 'verification');

const steps = [
  {
    name: 'status',
    description: 'npm run status -- --ci',
    command: process.execPath,
    args: [path.join(__dirname, 'health-check.mjs'), '--ci'],
  },
  {
    name: 'check-dates',
    description: 'node tools/check-dates.mjs --changed',
    command: process.execPath,
    args: [path.join(__dirname, 'check-dates.mjs'), '--changed'],
  },
  {
    name: 'guard:lint',
    description: 'node tools/guard-runner.mjs lint --changed',
    command: process.execPath,
    args: [path.join(__dirname, 'guard-runner.mjs'), 'lint', '--changed'],
  },
];

const results = [];

function runStep(step) {
  console.log(`[precommit] Running ${step.description}`);
  const proc = spawnSync(step.command, step.args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (proc.stdout) {
    process.stdout.write(proc.stdout);
  }
  if (proc.stderr) {
    process.stderr.write(proc.stderr);
  }

  results.push({
    name: step.name,
    description: step.description,
    exitCode: proc.status,
    stdout: proc.stdout,
    stderr: proc.stderr,
  });

  if (proc.status !== 0) {
    throw new Error(`${step.description} failed with exit code ${proc.status}`);
  }
}

function writeLog() {
  mkdirSync(logDir, { recursive: true });
  const timestamp = new Date().toISOString();
  const payload = { timestamp, steps: results };
  const logPath = path.join(logDir, `precommit-${timestamp.replace(/[:.]/g, '-')}.json`);
  writeFileSync(logPath, JSON.stringify(payload, null, 2));
  writeFileSync(path.join(logDir, 'latest.json'), JSON.stringify(payload, null, 2));
  console.log(`[precommit] Wrote verification log to ${logPath}`);
}

try {
  for (const step of steps) {
    runStep(step);
  }
  writeLog();
} catch (error) {
  writeLog();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
