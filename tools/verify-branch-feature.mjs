#!/usr/bin/env node
/**
 * Branch-Feature Verification Script
 * 
 * Verifies that current branch matches the active feature in .notes/features/current.json
 * Prevents working on wrong branch or committing changes to wrong issue.
 * 
 * Usage: node tools/verify-branch-feature.mjs [--fix]
 * 
 * Exit codes:
 * - 0: Branch matches feature or --fix successfully moved changes
 * - 1: Branch mismatch detected
 * - 2: Error reading files or git operations
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function getCurrentBranch() {
  try {
    return execSync("git branch --show-current", { 
      cwd: rootDir, 
      encoding: "utf-8" 
    }).trim();
  } catch (error) {
    console.error("❌ Error getting current branch:", error.message);
    process.exit(2);
  }
}

function getCurrentFeature() {
  const currentJsonPath = join(rootDir, ".notes", "features", "current.json");
  if (!existsSync(currentJsonPath)) {
    console.warn("⚠️  .notes/features/current.json not found - skipping feature check");
    return null;
  }

  try {
    const content = readFileSync(currentJsonPath, "utf-8");
    const current = JSON.parse(content);
    return {
      issue: current.githubIssue,
      branch: current.branch,
      slug: current.slug,
      status: current.status,
    };
  } catch (error) {
    console.error("❌ Error reading current.json:", error.message);
    process.exit(2);
  }
}

function extractIssueFromBranch(branchName) {
  // Match pattern: agent/<agent>/<issue>-<slug>
  const match = branchName.match(/agent\/\w+\/(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

function checkUncommittedChanges() {
  try {
    const status = execSync("git status --porcelain", { 
      cwd: rootDir, 
      encoding: "utf-8" 
    });
    return status.trim().split("\n").filter(line => line.trim());
  } catch (error) {
    console.error("❌ Error checking git status:", error.message);
    process.exit(2);
  }
}

function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes("--fix");

  console.log("🔍 Verifying branch-feature alignment...\n");

  const currentBranch = getCurrentBranch();
  const currentFeature = getCurrentFeature();
  const branchIssue = extractIssueFromBranch(currentBranch);
  const uncommitted = checkUncommittedChanges();

  console.log(`� branch: ${currentBranch}`);
  if (currentFeature) {
    console.log(`📋 feature: Issue #${currentFeature.issue} (${currentFeature.slug})`);
    console.log(`🎯 expected branch: ${currentFeature.branch}`);
  }
  console.log(`📝 uncommitted changes: ${uncommitted.length} files\n`);

  // If no feature tracking, skip check (but warn)
  if (!currentFeature) {
    console.log("⚠️  No feature tracking - skipping branch verification");
    return 0;
  }

  // If no uncommitted changes, branch check is less critical
  if (uncommitted.length === 0) {
    console.log("✅ No uncommitted changes - branch check passed");
    return 0;
  }

  // Check if branch matches feature
  const branchMatches = currentBranch === currentFeature.branch;
  const issueMatches = branchIssue === currentFeature.issue;

  if (branchMatches && issueMatches) {
    console.log("✅ Branch matches current feature - OK to commit");
    return 0;
  }

  // Mismatch detected
  console.error("❌ BRANCH MISMATCH DETECTED!");
  console.error(`   Current branch: ${currentBranch} (Issue #${branchIssue || "unknown"})`);
  console.error(`   Current feature: Issue #${currentFeature.issue} (${currentFeature.branch})`);
  console.error(`   Uncommitted files: ${uncommitted.length}`);

  if (fixMode) {
    console.log("\n🔧 Fix mode: Creating correct branch and moving changes...");
    
    // Check if correct branch exists
    try {
      const branchExists = execSync(
        `git branch --list ${currentFeature.branch}`,
        { cwd: rootDir, encoding: "utf-8" }
      ).trim();

      if (branchExists) {
        console.log(`✅ Branch ${currentFeature.branch} exists - switching...`);
        execSync(`git checkout ${currentFeature.branch}`, { cwd: rootDir, stdio: "inherit" });
      } else {
        console.log(`📝 Creating branch ${currentFeature.branch}...`);
        execSync(`git checkout -b ${currentFeature.branch}`, { cwd: rootDir, stdio: "inherit" });
      }
      
      console.log("✅ Switched to correct branch");
      console.log("⚠️  Review your changes and commit when ready");
      return 0;
    } catch (error) {
      console.error("❌ Error switching branch:", error.message);
      return 2;
    }
  } else {
    console.error("\n💡 To fix automatically, run:");
    console.error(`   node tools/verify-branch-feature.mjs --fix`);
    console.error("\n⚠️  Or manually:");
    console.error(`   1. Create/switch to branch: git checkout -b ${currentFeature.branch}`);
    console.error(`   2. Review changes: git status`);
    console.error(`   3. Commit when ready`);
    return 1;
  }
}

process.exit(main());

