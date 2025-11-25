#!/usr/bin/env node
/**
 * Branch Pruning Script
 * 
 * Cleans up merged local branches and prunes stale remote tracking refs.
 * Run: npm run branches:prune
 * 
 * @see .cursor/rules/09-workflow-guardrails.mdc - Branch Hygiene section
 */

import { execSync } from 'child_process';

const PROTECTED_BRANCHES = ['main', 'master', 'develop'];

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return '';
  }
}

function getCurrentBranch() {
  return run('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
}

function getMergedBranches() {
  const output = run('git branch --merged main', { silent: true });
  return output
    .split('\n')
    .map(b => b.trim().replace(/^\* /, ''))
    .filter(b => b && !PROTECTED_BRANCHES.includes(b));
}

function pruneRemote() {
  console.log('\n🔄 Pruning stale remote tracking refs...');
  run('git fetch origin --prune');
  console.log('✅ Remote refs pruned');
}

function deleteLocalBranches(branches) {
  if (branches.length === 0) {
    console.log('✅ No merged branches to delete');
    return;
  }

  console.log(`\n🗑️  Deleting ${branches.length} merged local branches...`);
  
  for (const branch of branches) {
    try {
      run(`git branch -d "${branch}"`, { silent: true });
      console.log(`  ✓ Deleted: ${branch}`);
    } catch (error) {
      console.log(`  ✗ Failed to delete: ${branch} (may not be fully merged)`);
    }
  }
}

function main() {
  console.log('🧹 Branch Pruning Script\n');
  console.log('This script will:');
  console.log('  1. Prune stale remote tracking refs');
  console.log('  2. Delete local branches already merged to main\n');

  const currentBranch = getCurrentBranch();
  console.log(`📍 Current branch: ${currentBranch}`);

  // Ensure we're not on a branch that might be deleted
  if (!PROTECTED_BRANCHES.includes(currentBranch)) {
    console.log('⚠️  Warning: Not on a protected branch. Some operations may skip current branch.');
  }

  // Prune remote
  pruneRemote();

  // Get and delete merged branches
  const mergedBranches = getMergedBranches().filter(b => b !== currentBranch);
  deleteLocalBranches(mergedBranches);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`  - Remote refs pruned: ✓`);
  console.log(`  - Merged branches deleted: ${mergedBranches.length}`);
  console.log(`  - Current branch: ${currentBranch}`);
  
  // List remaining branches
  const remainingBranches = run('git branch', { silent: true })
    .split('\n')
    .map(b => b.trim().replace(/^\* /, ''))
    .filter(b => b);
  
  console.log(`  - Remaining local branches: ${remainingBranches.length}`);
  remainingBranches.forEach(b => console.log(`    - ${b}`));
  
  console.log('\n✅ Branch pruning complete!');
}

main();

