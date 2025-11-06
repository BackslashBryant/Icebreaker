#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const steps = [
  {
    name: 'backend unit tests',
    cwd: path.join(repoRoot, 'backend'),
    command: 'npm',
    args: ['run', 'test'],
  },
  {
    name: 'frontend unit tests',
    cwd: path.join(repoRoot, 'frontend'),
    command: 'npm',
    args: ['run', 'test'],
  },
  {
    name: 'e2e tests',
    cwd: path.join(repoRoot, 'tests'),
    command: 'npm',
    args: ['test'],
  },
];

for (const step of steps) {
  console.log(`\n▶️  Running ${step.name}...`);
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`❌ ${step.name} failed.`);
    process.exit(result.status ?? 1);
  }

  console.log(`✅ ${step.name} passed.`);
}

console.log('\n🎉 All test suites passed.');
