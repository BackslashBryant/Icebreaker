#!/usr/bin/env node

/**
 * Complete GitHub issue workflow
 * 
 * Updates GitHub issue with completion comment and labels.
 * Handles authentication issues with clear error messages.
 * 
 * Usage:
 *   node tools/github-issue-complete.mjs <issue-number> [commit-hash]
 *   node tools/github-issue-complete.mjs 23
 */

import { execSync } from 'node:child_process';
import { getRepo, addIssueComment, updateIssue } from './lib/github-api.mjs';

const issueNumber = parseInt(process.argv[2]);
const commitHash = process.argv[3] || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

if (!issueNumber || isNaN(issueNumber)) {
  console.error('Error: Issue number required');
  console.error('Usage: node tools/github-issue-complete.mjs <issue-number> [commit-hash]');
  process.exit(1);
}

const commentBody = `## ✅ Issue #${issueNumber} Complete

**Status**: All steps completed successfully

**Branch**: \`${branch}\`
**Commit**: \`${commitHash}\`

See \`Docs/plans/Issue-${issueNumber}-plan-status-COMPLETE.md\` for full details.`;

async function completeIssue() {
  try {
    const repo = getRepo();
    console.log(`Updating issue #${issueNumber}...`);
    
    // Add comment
    console.log('Adding completion comment...');
    await addIssueComment(repo, issueNumber, commentBody);
    console.log('✅ Comment added');
    
    // Update labels
    console.log('Updating labels...');
    await updateIssue(repo, issueNumber, { labels: ['status:done'] });
    console.log('✅ Labels updated');
    
    console.log(`\n✅ Issue #${issueNumber} marked complete!`);
  } catch (error) {
    const errorMsg = error.message || String(error);
    
    if (errorMsg.includes('401') || errorMsg.includes('Bad credentials')) {
      console.error('❌ Authentication failed');
      console.error('\n💡 Fix authentication:');
      console.error('   1. Run: gh auth login');
      console.error('   2. Select: GitHub.com');
      console.error('   3. Select: HTTPS');
      console.error('   4. Authenticate with browser');
      console.error('\n   Or set GITHUB_TOKEN environment variable (User-level on Windows)');
    } else if (errorMsg.includes('404')) {
      console.error(`❌ Issue #${issueNumber} not found`);
      console.error('   Verify issue number and repository access');
    } else {
      console.error('❌ Error:', errorMsg);
    }
    
    process.exit(1);
  }
}

completeIssue();

