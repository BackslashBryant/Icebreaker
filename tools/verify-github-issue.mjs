#!/usr/bin/env node

/**
 * Verify GitHub issue number before creating
 * Checks if issue number exists, returns next available number
 * Usage: node tools/verify-github-issue.mjs [issueNumber]
 */

import { getRepo, getHighestIssueNumber, issueExists } from './lib/github-api.mjs';

async function main() {
  const args = process.argv.slice(2);
  const requestedNumber = args[0] ? parseInt(args[0], 10) : null;
  
  const repo = getRepo();
  
  const highestNumber = await getHighestIssueNumber(repo);
  const nextAvailable = highestNumber + 1;
  
  if (requestedNumber !== null) {
    const exists = await issueExists(repo, requestedNumber);
    if (exists) {
      console.error(`❌ Issue #${requestedNumber} already exists on GitHub`);
      process.exit(1);
    }
    if (requestedNumber < nextAvailable) {
      console.warn(`⚠️  Warning: Issue #${requestedNumber} is lower than highest issue (#${highestNumber}). This may create gaps.`);
    }
    console.log(`✅ Issue #${requestedNumber} is available`);
    console.log(`Next available: #${nextAvailable}`);
  } else {
    console.log(`Next available issue number: #${nextAvailable}`);
    console.log(`Highest existing issue: #${highestNumber}`);
  }
  
  // Return next available for scripts
  if (!requestedNumber) {
    console.log(`\nUse this number for new issues: ${nextAvailable}`);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});

