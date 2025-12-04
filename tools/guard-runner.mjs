#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const task = process.argv[2];

if (!task) {
  console.log('Usage: node tools/guard-runner.mjs <lint|type|test>');
  process.exit(1);
}

function hasBin(bin) {
  const binPath = path.join(repoRoot, 'node_modules', '.bin', bin + (process.platform === 'win32' ? '.cmd' : ''));
  return existsSync(binPath);
}

function run(cmd, args) {
  // On Windows, use shell: false to avoid path truncation issues with spaces
  // Use absolute paths for Node.js scripts to handle spaces correctly
  const useShell = false;
  const result = spawnSync(cmd, args, { 
    stdio: 'inherit', 
    cwd: repoRoot, 
    shell: useShell 
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

switch (task) {
  case 'lint': {
    if (!hasBin('eslint')) {
      console.log('eslint not installed; skipping lint step.');
      process.exit(0);
    }
    run('npx', ['--no-install', 'eslint', '.', '--max-warnings=0']);
    break;
  }
  case 'type': {
    if (!hasBin('tsc')) {
      console.log('TypeScript (tsc) not installed; skipping typecheck.');
      process.exit(0);
    }
    run('npx', ['--no-install', 'tsc', '-p', 'tsconfig.json', '--noEmit']);
    break;
  }
  case 'test': {
    const runTestsScript = path.join(repoRoot, 'scripts', 'run-tests.mjs');
    if (existsSync(runTestsScript)) {
      // Use absolute path to handle spaces in directory names
      const absoluteScriptPath = path.resolve(runTestsScript);
      run('node', [absoluteScriptPath]);
    } else if (hasBin('jest')) {
      run('npx', ['--no-install', 'jest', '--runInBand']);
    } else if (existsSync(path.join(repoRoot, 'scripts', 'verify-all'))) {
      run('npm', ['run', 'verify']);
    } else {
      console.log('No test runner detected; skipping tests.');
    }
    break;
  }
  default:
    console.error(`Unknown task: ${task}`);
    process.exit(1);
}
