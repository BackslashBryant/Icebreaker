#!/usr/bin/env node

/**
 * Pre-merge checklist runner
 * Validates all guardrails before merging
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const checks = [];
let failed = false;

function runCheck(name, command, required = true) {
  try {
    execSync(command, { cwd: repoRoot, stdio: 'pipe' });
    checks.push({ name, status: '✅ PASS', required });
    return true;
  } catch (error) {
    checks.push({ name, status: '❌ FAIL', required });
    if (required) {
      failed = true;
    }
    return false;
  }
}

function main() {
  console.log('🔍 Pre-Merge Checklist\n');
  console.log('Validating workflow guardrails...\n');
  
  // Required checks
  runCheck('Matrix ≡ Config', 'node tools/validate-matrix-config.mjs --strict', true);
  runCheck('Browser Dependencies', 'node tools/validate-browser-deps.mjs', true);
  runCheck('Job Scopes', 'node tools/validate-job-scopes.mjs', true);
  runCheck('Placeholder Dates', 'node tools/check-dates.mjs --changed', true);
  
  // Optional checks (warnings)
  runCheck('Flake Tracking', 'node tools/validate-flake-tracking.mjs', false);
  
  // Report results
  console.log('\n📋 Checklist Results:\n');
  checks.forEach(check => {
    const marker = check.required ? '' : '(optional)';
    console.log(`  ${check.status} ${check.name} ${marker}`);
  });
  
  if (failed) {
    console.log('\n❌ Pre-merge checklist FAILED');
    console.log('Fix required checks before merging.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Pre-merge checklist PASSED');
    console.log('Ready to merge!\n');
    process.exit(0);
  }
}

main();

