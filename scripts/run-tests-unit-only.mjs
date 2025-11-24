#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from './test-logger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const steps = [
  {
    name: 'backend unit tests',
    type: 'unit',
    cwd: path.join(repoRoot, 'backend'),
    command: 'npm',
    args: ['run', 'test'],
  },
  {
    name: 'frontend unit tests',
    type: 'unit',
    cwd: path.join(repoRoot, 'frontend'),
    command: 'npm',
    args: ['run', 'test'],
  },
];

const logger = createLogger('unit-tests');

for (const step of steps) {
  logger.log(`\n▶️  Running ${step.name}...`);
  const stepLogger = createLogger(step.type);
  
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    stdio: 'pipe', // Capture output for logging
    shell: process.platform === 'win32',
    encoding: 'utf8',
  });

  // Log output
  if (result.stdout) {
    stepLogger.log(result.stdout);
    logger.log(result.stdout);
  }
  if (result.stderr) {
    stepLogger.error(result.stderr);
    logger.error(result.stderr);
  }

  const logPath = stepLogger.close();
  logger.log(`Logs written to: ${logPath}`);

  if (result.status !== 0) {
    logger.error(`❌ ${step.name} failed.`);
    const finalLogPath = logger.close();
    console.error(`\nTest logs available at: ${finalLogPath}`);
    process.exit(result.status ?? 1);
  }

  logger.log(`✅ ${step.name} passed.`);
}

logger.log('\n🎉 All unit test suites passed.');
const finalLogPath = logger.close();
console.log(`\nTest logs available at: ${finalLogPath}`);

