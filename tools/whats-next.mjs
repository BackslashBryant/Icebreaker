#!/usr/bin/env node

/**
 * What's Next - Project Status & Next Action Command
 * 
 * Checks vision, plans, git, issues, and current feature to provide
 * comprehensive project status and immediate next action.
 * 
 * Usage:
 *   npm run whats-next              # Human-readable output
 *   npm run whats-next -- --json    # JSON output for CI
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Load .env file if it exists
function loadEnvFile() {
  const envPath = path.join(repoRoot, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

const status = {
  vision: null,
  currentFeature: null,
  activePlan: null,
  git: null,
  githubIssue: null,
  nextAction: null,
};

// Check vision.md
function checkVision() {
  const visionPath = path.join(repoRoot, 'docs', 'vision.md');
  if (!existsSync(visionPath)) {
    status.vision = {
      exists: false,
      message: 'docs/vision.md is missing',
      action: 'Create docs/vision.md before starting work',
    };
    return;
  }

  try {
    const stats = statSync(visionPath);
    const content = readFileSync(visionPath, 'utf8');
    const hasContent = content.trim().length > 100; // Basic check for meaningful content

    status.vision = {
      exists: true,
      lastModified: stats.mtime,
      hasContent,
      message: hasContent 
        ? `Vision file exists (updated ${formatDate(stats.mtime)})`
        : 'Vision file exists but appears empty',
      action: hasContent ? null : 'Update docs/vision.md with project vision',
    };
  } catch (error) {
    status.vision = {
      exists: false,
      message: `Error reading vision.md: ${error.message}`,
      action: 'Fix docs/vision.md',
    };
  }
}

// Check current feature
function checkCurrentFeature() {
  const currentJsonPath = path.join(repoRoot, '.notes', 'features', 'current.json');
  if (!existsSync(currentJsonPath)) {
    status.currentFeature = {
      exists: false,
      message: 'No active feature tracked',
      action: 'Run: npm run feature:new',
    };
    return;
  }

  try {
    const feature = JSON.parse(readFileSync(currentJsonPath, 'utf8'));
    status.currentFeature = {
      exists: true,
      slug: feature.slug,
      issue: feature.githubIssue,
      branch: feature.branch,
      status: feature.status,
      message: `Active feature: ${feature.slug} (Issue #${feature.githubIssue || 'N/A'})`,
      action: null,
    };
  } catch (error) {
    status.currentFeature = {
      exists: false,
      message: `Error reading current.json: ${error.message}`,
      action: 'Fix .notes/features/current.json',
    };
  }
}

// Check active plan
function checkActivePlan() {
  const plansDir = path.join(repoRoot, 'docs', 'plans');
  if (!existsSync(plansDir)) {
    status.activePlan = {
      exists: false,
      message: 'docs/plans directory missing',
      action: 'Create docs/plans directory',
    };
    return;
  }

  // If we have a current feature, look for matching plan
  if (status.currentFeature?.issue) {
    const planPath = path.join(plansDir, `Issue-${status.currentFeature.issue}.md`);
    if (existsSync(planPath)) {
      try {
        const planContent = readFileSync(planPath, 'utf8');
        const stats = statSync(planPath);
        
        // Check for key sections
        const hasResearch = planContent.includes('## Research') || planContent.includes('# Research');
        const hasTeamReview = planContent.includes('Team Review') || planContent.includes('## Team Review');
        const isApproved = planContent.includes('Team Review: ✅ APPROVED') || 
                          planContent.includes('✅ APPROVED');
        const hasProgress = planContent.includes('## Progress') || planContent.includes('# Progress');

        status.activePlan = {
          exists: true,
          issue: status.currentFeature.issue,
          path: planPath,
          lastModified: stats.mtime,
          hasResearch,
          hasTeamReview,
          isApproved,
          hasProgress,
          message: `Plan exists for Issue #${status.currentFeature.issue}`,
          action: !hasResearch 
            ? 'Complete Research section in plan file'
            : !hasTeamReview || !isApproved
            ? 'Complete Team Review and get approval'
            : null,
        };
      } catch (error) {
        status.activePlan = {
          exists: true,
          issue: status.currentFeature.issue,
          message: `Error reading plan: ${error.message}`,
          action: 'Fix plan file',
        };
      }
      return;
    }
  }

  // No matching plan found
  status.activePlan = {
    exists: false,
    message: status.currentFeature?.issue 
      ? `No plan found for Issue #${status.currentFeature.issue}`
      : 'No active plan (no current feature)',
    action: status.currentFeature?.issue
      ? `Create docs/plans/Issue-${status.currentFeature.issue}.md`
      : 'Set current feature first',
  };
}

// Check git status
function checkGit() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const statusOutput = execSync('git status --porcelain', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const uncommitted = statusOutput 
      ? statusOutput.split('\n').filter(line => line.trim())
      : [];

    // Check if branch matches current feature
    const branchMatches = status.currentFeature?.branch === branch;
    const branchIssue = extractIssueFromBranch(branch);

    status.git = {
      branch,
      branchIssue,
      uncommittedCount: uncommitted.length,
      uncommittedFiles: uncommitted.slice(0, 5), // First 5 files
      branchMatches,
      message: `On branch ${branch}${uncommitted.length > 0 ? ` (${uncommitted.length} uncommitted)` : ''}`,
      action: !branchMatches && status.currentFeature?.branch
        ? `Switch to branch: ${status.currentFeature.branch}`
        : uncommitted.length > 0
        ? 'Review uncommitted changes and commit if ready'
        : null,
    };
  } catch (error) {
    status.git = {
      error: error.message,
      message: 'Git check failed',
      action: 'Ensure you are in a git repository',
    };
  }
}

// Check GitHub issue
async function checkGitHubIssue() {
  if (!status.currentFeature?.issue) {
    status.githubIssue = {
      exists: false,
      message: 'No issue number available',
      action: null,
    };
    return;
  }

  const issueNumber = status.currentFeature.issue;
  
  // Try GitHub CLI first
  try {
    const ghOutput = execSync(`gh issue view ${issueNumber} --json number,title,state,labels,body`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const issue = JSON.parse(ghOutput);
    const labels = issue.labels.map(l => l.name);
    
    status.githubIssue = {
      exists: true,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels,
      url: `https://github.com/${getRepo()}/issues/${issue.number}`,
      message: `Issue #${issue.number}: ${issue.title} (${issue.state})`,
      action: issue.state === 'CLOSED'
        ? 'Issue is closed - consider creating new issue or reopening'
        : null,
    };
  } catch (error) {
    // GitHub CLI failed, try to infer from current feature
    const repo = getRepo();
    status.githubIssue = {
      exists: 'unknown',
      number: issueNumber,
      url: repo ? `https://github.com/${repo}/issues/${issueNumber}` : null,
      message: `Issue #${issueNumber} (unable to fetch details)`,
      action: 'Check GitHub issue manually or ensure gh CLI is authenticated',
      error: error.message,
    };
  }
}

// Determine next action
function determineNextAction() {
  const actions = [];

  // Priority 1: Vision missing
  if (!status.vision?.exists || !status.vision?.hasContent) {
    actions.push({
      priority: 1,
      message: status.vision?.action || 'Create/update docs/vision.md',
      reason: 'Vision file is required before starting work',
    });
  }

  // Priority 2: No current feature
  if (!status.currentFeature?.exists) {
    actions.push({
      priority: 2,
      message: status.currentFeature?.action || 'Set current feature',
      reason: 'No active feature tracked',
    });
    status.nextAction = actions[0];
    return;
  }

  // Priority 3: Plan missing or incomplete
  if (!status.activePlan?.exists) {
    actions.push({
      priority: 3,
      message: status.activePlan?.action || 'Create plan file',
      reason: 'Plan file required before implementation',
    });
  } else if (!status.activePlan?.hasResearch) {
    actions.push({
      priority: 3,
      message: 'Complete Research section in plan file',
      reason: 'Research must be complete before planning',
    });
  } else if (!status.activePlan?.isApproved) {
    actions.push({
      priority: 3,
      message: 'Complete Team Review and get approval',
      reason: 'Plan must be approved before implementation',
    });
  }

  // Priority 4: Branch mismatch
  if (status.git && !status.git.branchMatches && status.currentFeature?.branch) {
    actions.push({
      priority: 4,
      message: `Switch to branch: ${status.currentFeature.branch}`,
      reason: 'Current branch does not match active feature',
    });
  }

  // Priority 5: Uncommitted changes
  if (status.git && status.git.uncommittedCount > 0) {
    actions.push({
      priority: 5,
      message: `Review and commit ${status.git.uncommittedCount} uncommitted change(s)`,
      reason: 'Uncommitted changes detected',
      details: status.git.uncommittedFiles,
    });
  }

  // Priority 6: Issue closed
  if (status.githubIssue?.state === 'CLOSED') {
    actions.push({
      priority: 6,
      message: 'Issue is closed - verify if work should continue',
      reason: 'Active issue appears to be closed',
    });
  }

  // If plan is approved and branch matches, suggest next checkpoint
  if (status.activePlan?.isApproved && status.git?.branchMatches && status.git?.uncommittedCount === 0) {
    actions.push({
      priority: 7,
      message: 'Ready to implement - check plan file for next checkpoint',
      reason: 'All prerequisites met',
    });
  }

  status.nextAction = actions.length > 0 ? actions[0] : {
    priority: 0,
    message: 'All systems ready - check plan file for next steps',
    reason: 'No blockers detected',
  };
}

// Helper functions
function extractIssueFromBranch(branchName) {
  const match = branchName.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function getRepo() {
  try {
    const remote = execSync('git config --get remote.origin.url', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    // Extract owner/repo from various URL formats
    const match = remote.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : null;
  } catch {
    return null;
  }
}

function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Print human-readable output
function printHuman() {
  console.log('\n🎯 WHAT\'S NEXT - Project Status\n');
  console.log('═'.repeat(60));

  // Vision
  console.log('\n📋 Vision:');
  console.log(`   ${status.vision?.message || 'Unknown'}`);
  if (status.vision?.action) {
    console.log(`   ⚠️  Action: ${status.vision.action}`);
  }

  // Current Feature
  console.log('\n🎯 Current Feature:');
  console.log(`   ${status.currentFeature?.message || 'None'}`);
  if (status.currentFeature?.action) {
    console.log(`   ⚠️  Action: ${status.currentFeature.action}`);
  }

  // Active Plan
  console.log('\n📝 Active Plan:');
  console.log(`   ${status.activePlan?.message || 'None'}`);
  if (status.activePlan?.hasResearch === false) {
    console.log('   ⚠️  Research section missing');
  }
  if (status.activePlan?.isApproved === false) {
    console.log('   ⚠️  Plan not approved');
  }
  if (status.activePlan?.action) {
    console.log(`   ⚠️  Action: ${status.activePlan.action}`);
  }

  // Git Status
  console.log('\n🔀 Git Status:');
  console.log(`   ${status.git?.message || 'Unknown'}`);
  if (status.git?.branchMatches === false) {
    console.log(`   ⚠️  Branch mismatch: expected ${status.currentFeature?.branch}`);
  }
  if (status.git?.uncommittedCount > 0) {
    console.log(`   📝 Uncommitted files:`);
    status.git.uncommittedFiles.forEach(file => {
      console.log(`      - ${file.substring(0, 50)}`);
    });
    if (status.git.uncommittedCount > 5) {
      console.log(`      ... and ${status.git.uncommittedCount - 5} more`);
    }
  }
  if (status.git?.action) {
    console.log(`   ⚠️  Action: ${status.git.action}`);
  }

  // GitHub Issue
  console.log('\n🐙 GitHub Issue:');
  console.log(`   ${status.githubIssue?.message || 'Unknown'}`);
  if (status.githubIssue?.url) {
    console.log(`   🔗 ${status.githubIssue.url}`);
  }
  if (status.githubIssue?.state === 'CLOSED') {
    console.log('   ⚠️  Issue is closed');
  }
  if (status.githubIssue?.action) {
    console.log(`   ⚠️  Action: ${status.githubIssue.action}`);
  }

  // Next Action
  console.log('\n' + '═'.repeat(60));
  console.log('\n🚀 NEXT ACTION:');
  console.log(`   ${status.nextAction?.message || 'Unknown'}`);
  console.log(`   Reason: ${status.nextAction?.reason || 'N/A'}`);
  if (status.nextAction?.details) {
    console.log(`   Details:`);
    status.nextAction.details.forEach(detail => {
      console.log(`      - ${detail}`);
    });
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

// Print JSON output
function printJson() {
  console.log(JSON.stringify(status, null, 2));
}

// Main
async function main() {
  checkVision();
  checkCurrentFeature();
  checkActivePlan();
  checkGit();
  await checkGitHubIssue();
  determineNextAction();

  const rawArgs = process.argv.slice(2);
  const wantsJson = rawArgs.includes('--json') || rawArgs.includes('--ci');

  if (wantsJson) {
    printJson();
  } else {
    printHuman();
  }

  // Exit code based on whether there are blockers
  const hasBlockers = status.nextAction?.priority > 0 && status.nextAction?.priority < 7;
  process.exit(hasBlockers ? 1 : 0);
}

try {
  main();
} catch (error) {
  console.error('Error:', error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
}

