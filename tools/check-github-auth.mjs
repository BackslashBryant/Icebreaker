#!/usr/bin/env node

/**
 * Check GitHub authentication health and detect common issues
 * 
 * This script detects:
 * - GITHUB_TOKEN in .env file (breaks GitHub CLI)
 * - User-level GITHUB_TOKEN env var (blocks keyring)
 * - Invalid/expired tokens
 * 
 * Run: node tools/check-github-auth.mjs
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

let hasIssues = false;

console.log('🔍 Checking GitHub authentication health...\n');

// Check 1: .env file
const envPath = path.join(repoRoot, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  if (envContent.match(/^\s*GITHUB_TOKEN\s*=\s*.+$/m)) {
    console.error('❌ CRITICAL: GITHUB_TOKEN found in .env file');
    console.error('   This breaks GitHub CLI authentication!');
    console.error('   Action: Remove GITHUB_TOKEN from .env file');
    console.error('   GitHub CLI uses keyring - no .env token needed\n');
    hasIssues = true;
  } else {
    console.log('✅ .env file: No GITHUB_TOKEN found (good)');
  }
} else {
  console.log('✅ .env file: Does not exist (good)');
}

// Check 2: User-level env var (Windows)
if (process.platform === 'win32') {
  try {
    const userToken = execSync(
      'powershell -Command "[System.Environment]::GetEnvironmentVariable(\'GITHUB_TOKEN\', \'User\')"',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    ).trim();
    
    if (userToken) {
      console.error('❌ CRITICAL: User-level GITHUB_TOKEN found');
      console.error('   This blocks GitHub CLI keyring authentication!');
      console.error('   Action: Clear it with:');
      console.error('   powershell -Command "[System.Environment]::SetEnvironmentVariable(\'GITHUB_TOKEN\', $null, \'User\')"');
      console.error('   Then run: gh auth login\n');
      hasIssues = true;
    } else {
      console.log('✅ User-level env var: No GITHUB_TOKEN found (good)');
    }
  } catch (error) {
    console.log('✅ User-level env var: No GITHUB_TOKEN found (good)');
  }
}

// Check 3: GitHub CLI auth status
try {
  const output = execSync('gh auth status', {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: { ...process.env, GITHUB_TOKEN: undefined },
  });
  
  if (output.includes('Logged in')) {
    console.log('✅ GitHub CLI: Authenticated');
  } else {
    console.error('❌ GitHub CLI: Not authenticated');
    console.error('   Action: Run: gh auth login\n');
    hasIssues = true;
  }
} catch (error) {
  const errorMsg = error.message || error.stderr?.toString() || '';
  if (errorMsg.includes('GITHUB_TOKEN environment variable')) {
    console.error('❌ GitHub CLI: Blocked by GITHUB_TOKEN env var');
    console.error('   Action: Clear blocking token (see above)\n');
    hasIssues = true;
  } else {
    console.error('❌ GitHub CLI: Not authenticated');
    console.error('   Action: Run: gh auth login\n');
    hasIssues = true;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasIssues) {
  console.error('❌ GitHub authentication issues detected!');
  console.error('   Fix the issues above before proceeding.');
  process.exit(1);
} else {
  console.log('✅ All GitHub authentication checks passed!');
  process.exit(0);
}

