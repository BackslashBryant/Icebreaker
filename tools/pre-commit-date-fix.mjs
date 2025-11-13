#!/usr/bin/env node

/**
 * Pre-commit date auto-fix helper
 * Automatically fixes placeholder dates in staged files before commit
 * 
 * Usage:
 *   node tools/pre-commit-date-fix.mjs  # Auto-fix staged files
 * 
 * This can be run manually before committing, or integrated into git hooks
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function main() {
  try {
    // Check if there are staged files
    const stagedOutput = execSync('git diff --cached --name-only', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const stagedFiles = stagedOutput.trim().split('\n').filter(Boolean);

    if (stagedFiles.length === 0) {
      console.log('No staged files to check.');
      process.exit(0);
    }

    // Check for placeholder dates in staged files
    console.log('Checking for placeholder dates in staged files...');
    const checkResult = execSync('node tools/check-dates.mjs --staged --json', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const result = JSON.parse(checkResult);
    
    if (result.ok || result.count === 0) {
      console.log('✓ No placeholder dates found in staged files.');
      process.exit(0);
    }

    // Auto-fix placeholder dates
    console.log(`Found ${result.count} placeholder date violation(s) in staged files.`);
    console.log('Auto-fixing...\n');

    execSync('node tools/check-dates.mjs --staged --fix --yes', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'inherit',
    });

    console.log('\n✓ Placeholder dates fixed. Files have been updated.');
    console.log('Please review the changes and stage them if needed:');
    console.log('  git add -u');
    console.log('  git commit');
    
    process.exit(0);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // If check-dates fails with violations, try to fix
    if (error.stdout) {
      try {
        const result = JSON.parse(error.stdout);
        if (result.violations && result.violations.length > 0) {
          console.log(`Found ${result.violations.length} placeholder date violation(s).`);
          console.log('Auto-fixing...\n');
          
          execSync('node tools/check-dates.mjs --staged --fix --yes', {
            cwd: repoRoot,
            encoding: 'utf8',
            stdio: 'inherit',
          });
          
          console.log('\n✓ Placeholder dates fixed.');
          process.exit(0);
        }
      } catch (parseError) {
        // Not JSON, continue with error
      }
    }
    
    console.error('Error checking/fixing dates:', errorMsg);
    process.exit(1);
  }
}

main();

