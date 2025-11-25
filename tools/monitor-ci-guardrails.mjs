#!/usr/bin/env node

/**
 * Monitor CI runs for guardrail validation and browser matrix performance
 * Usage: node tools/monitor-ci-guardrails.mjs [branch-name]
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const branch = process.argv[2] || 'agent/vector/15-suite-matrix';
const workflow = 'Guardrails CI';

function getLatestRun() {
  try {
    const output = execSync(`gh run list --branch ${branch} --workflow "${workflow}" --limit 1 --json databaseId,status,conclusion,displayTitle,createdAt`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const runs = JSON.parse(output);
    return runs[0] || null;
  } catch (error) {
    return null;
  }
}

function getRunDetails(runId) {
  try {
    const output = execSync(`gh run view ${runId} --json status,conclusion,jobs`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return JSON.parse(output);
  } catch (error) {
    return null;
  }
}

function checkJobStatus(jobs, jobName) {
  const job = jobs.find(j => j.name === jobName);
  if (!job) return 'NOT_FOUND';
  return {
    status: job.status,
    conclusion: job.conclusion,
    url: job.url,
  };
}

function main() {
  console.log(`🔍 Monitoring CI for branch: ${branch}\n`);
  
  const latestRun = getLatestRun();
  if (!latestRun) {
    console.log('❌ No CI runs found for this branch.');
    console.log('   Push changes to trigger CI run.');
    process.exit(1);
  }
  
  console.log(`📋 Latest Run: ${latestRun.displayTitle}`);
  console.log(`   Status: ${latestRun.status}`);
  console.log(`   Conclusion: ${latestRun.conclusion || 'pending'}`);
  console.log(`   Created: ${latestRun.createdAt}`);
  console.log(`   URL: https://github.com/BackslashBryant/Icebreaker/actions/runs/${latestRun.databaseId}\n`);
  
  if (latestRun.status === 'completed') {
    const details = getRunDetails(latestRun.databaseId);
    if (details && details.jobs) {
      console.log('📊 Job Status:\n');
      
      const workflowValidation = checkJobStatus(details.jobs, 'workflow-validation');
      const smoke = checkJobStatus(details.jobs, 'persona-smoke');
      const full = checkJobStatus(details.jobs, 'persona-full');
      const healthMvp = checkJobStatus(details.jobs, 'health-mvp');
      
      console.log(`  workflow-validation: ${workflowValidation.status} ${workflowValidation.conclusion || ''}`);
      console.log(`  persona-smoke: ${smoke.status} ${smoke.conclusion || ''}`);
      console.log(`  persona-full: ${full.status} ${full.conclusion || ''}`);
      console.log(`  health-mvp: ${healthMvp.status} ${healthMvp.conclusion || ''}\n`);
      
      if (workflowValidation.conclusion === 'success') {
        console.log('✅ Guardrail scripts passed');
      } else if (workflowValidation.conclusion === 'failure') {
        console.log('❌ Guardrail scripts failed - check validation output');
      }
      
      if (smoke.conclusion === 'success') {
        console.log('✅ Smoke suite passed (4 projects: chromium/webkit desktop+mobile)');
      } else if (smoke.conclusion === 'failure') {
        console.log('❌ Smoke suite failed - check test output');
      }
      
      if (full.conclusion === 'success') {
        console.log('✅ Full suite passed (stateful + 8 browser/viewport projects)');
      } else if (full.conclusion === 'failure') {
        console.log('❌ Full suite failed - check test output');
      }
      
      if (healthMvp.conclusion === 'success') {
        console.log('✅ Health MVP passed (4 browsers: chromium/firefox/webkit/msedge)');
      } else if (healthMvp.conclusion === 'failure') {
        console.log('❌ Health MVP failed - check test output');
      }
      
      // Check for msedge-mobile specific issues
      if (full.conclusion === 'failure' || healthMvp.conclusion === 'failure') {
        console.log('\n⚠️  Check msedge-mobile project for viewport-only quirks');
        console.log('   If issues found, consider adding userAgent/deviceScaleFactor');
      }
    }
  } else {
    console.log(`⏳ CI run still ${latestRun.status}. Check back later.`);
    console.log(`   Monitor: gh run watch ${latestRun.databaseId}`);
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Monitor for flakes - log to Docs/testing/FLAKY_TESTS.md');
  console.log('   2. Review artifact sizes/timings after first full run');
  console.log('   3. Watch Dec 1 production health check (09:00 UTC)');
}

main();

