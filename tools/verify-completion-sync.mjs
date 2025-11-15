#!/usr/bin/env node
/**
 * Verify Issue Completion Status Sync
 * 
 * Ensures completion status is properly synced across:
 * - Plan-status files on main branch
 * - current.json status
 * - Branch plan-status files
 * 
 * Prevents confusion about what's actually complete.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function getPlanFiles() {
  const plansDir = join(PROJECT_ROOT, 'Docs', 'plans');
  const files = execSync(`ls "${plansDir}/Issue-*-plan-status*.md" 2>/dev/null || echo ""`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  return files.map(file => {
    const match = file.match(/Issue-(\d+)-plan-status-([^.]+)\.md/);
    if (match) {
      return { issue: parseInt(match[1]), status: match[2], path: file };
    }
    return null;
  }).filter(Boolean);
}

function readPlanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
    const overallMatch = content.match(/\*\*Overall Status\*\*:\s*(.+)/);
    const finalMatch = content.match(/\*\*Final Status\*\*:\s*(.+)/);
    
    return {
      status: statusMatch?.[1]?.trim(),
      overallStatus: overallMatch?.[1]?.trim(),
      finalStatus: finalMatch?.[1]?.trim(),
      content
    };
  } catch {
    return null;
  }
}

function readCurrentJson() {
  try {
    const path = join(PROJECT_ROOT, '.notes', 'features', 'current.json');
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function checkPlanOnMain(issueNumber) {
  try {
    const result = execSync(
      `git show main:Docs/plans/Issue-${issueNumber}-plan-status-COMPLETE.md 2>/dev/null || echo ""`,
      { encoding: 'utf-8' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function main() {
  console.log('🔍 Verifying Issue Completion Status Sync...\n');
  
  const currentBranch = getCurrentBranch();
  const planFiles = getPlanFiles();
  const currentJson = readCurrentJson();
  
  let errors = [];
  let warnings = [];
  
  // Check completed plan files
  const completedPlans = planFiles.filter(p => 
    p.status === 'COMPLETE' || 
    p.status === 'complete' ||
    p.path.includes('COMPLETE')
  );
  
  console.log(`Found ${completedPlans.length} completed plan files:\n`);
  
  for (const plan of completedPlans) {
    const planInfo = readPlanFile(plan.path);
    const onMain = checkPlanOnMain(plan.issue);
    
    console.log(`  Issue #${plan.issue}:`);
    console.log(`    File: ${plan.path}`);
    console.log(`    Status: ${plan.status}`);
    console.log(`    On main: ${onMain ? '✅' : '❌'}`);
    
    // Check if status is actually COMPLETE (not "TESTING COMPLETE" or similar)
    const actualStatus = planInfo?.status || planInfo?.overallStatus || planInfo?.finalStatus || '';
    if (actualStatus && !actualStatus.includes('COMPLETE') && !actualStatus.includes('complete')) {
      warnings.push(`Issue #${plan.issue}: Plan file status "${actualStatus}" doesn't indicate completion`);
    }
    
    if (!onMain) {
      errors.push(`Issue #${plan.issue}: Plan-status file not on main branch`);
    }
  }
  
  // Check current.json
  if (currentJson) {
    console.log(`\nCurrent feature: Issue #${currentJson.githubIssue} (${currentJson.status})`);
    
    if (currentJson.status === 'complete') {
      const planOnMain = checkPlanOnMain(currentJson.githubIssue);
      if (!planOnMain) {
        errors.push(`current.json shows Issue #${currentJson.githubIssue} complete but plan file not on main`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All completion statuses are properly synced!');
    process.exit(0);
  } else {
    if (errors.length > 0) {
      console.log('\n❌ ERRORS (must fix):');
      errors.forEach(e => console.log(`  - ${e}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(w => console.log(`  - ${w}`));
    }
    console.log('\n💡 To fix: Run `/whats-next sync` or manually sync plan files to main');
    process.exit(1);
  }
}

main();

