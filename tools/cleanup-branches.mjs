#!/usr/bin/env node
/**
 * Branch Cleanup Script
 *
 * Organizes uncommitted changes into correct branches based on issue.
 *
 * Usage: node tools/cleanup-branches.mjs
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// File categorization by issue
const FILE_CATEGORIES = {
  issue18: [
    "tests/e2e/visual/radar.spec.ts",
    "tests/e2e/visual/welcome.spec.ts",
    "tests/utils/multi-persona.ts",
    "docs/testing/persona-feedback.md",
  ],
  issue20: [
    "tests/e2e/performance.spec.ts",
  ],
  issue22: [
    ".notes/features/monitoring-observability-error-tracking/progress.md",
  ],
  process: [
    ".cursor/rules/",
    "docs/Plan.md",
    ".notes/features/current.json",
    "docs/troubleshooting/",
    "tools/",
  ],
};

function getCurrentBranch() {
  return execSync("git branch --show-current", {
    cwd: rootDir,
    encoding: "utf-8"
  }).trim();
}

function getModifiedFiles() {
  const status = execSync("git status --porcelain", {
    cwd: rootDir,
    encoding: "utf-8"
  });
  return status.trim().split("\n")
    .filter(line => line.trim())
    .map(line => line.substring(3).trim()); // Remove status prefix
}

function categorizeFile(file) {
  // Check exact matches first
  if (FILE_CATEGORIES.issue18.some(pattern => file === pattern || file.startsWith(pattern))) {
    return "issue18";
  }
  if (FILE_CATEGORIES.issue20.some(pattern => file === pattern || file.startsWith(pattern))) {
    return "issue20";
  }
  if (FILE_CATEGORIES.issue22.some(pattern => file === pattern || file.startsWith(pattern))) {
    return "issue22";
  }
  if (FILE_CATEGORIES.process.some(pattern => file.startsWith(pattern))) {
    return "process";
  }
  return "unknown";
}

function ensureBranch(branchName) {
  try {
    const exists = execSync(`git branch --list ${branchName}`, {
      cwd: rootDir,
      encoding: "utf-8"
    }).trim();

    if (exists) {
      console.log(`✅ Branch ${branchName} exists`);
      return false; // Already exists
    } else {
      console.log(`📝 Creating branch ${branchName}...`);
      execSync(`git checkout -b ${branchName}`, {
        cwd: rootDir,
        stdio: "inherit"
      });
      return true; // Created
    }
  } catch (error) {
    console.error(`❌ Error with branch ${branchName}:`, error.message);
    throw error;
  }
}

function stashChanges() {
  console.log("💾 Stashing all changes...");
  execSync('git stash push -m "Cleanup: organizing changes by issue"', {
    cwd: rootDir,
    stdio: "inherit",
    shell: true
  });
}

function applyStash() {
  console.log("📦 Applying stashed changes...");
  execSync("git stash pop", {
    cwd: rootDir,
    stdio: "inherit"
  });
}

function addFiles(files) {
  if (files.length === 0) return;
  // Quote each file path for safety
  const quotedFiles = files.map(f => `"${f}"`).join(" ");
  execSync(`git add ${quotedFiles}`, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true
  });
}

function main() {
  console.log("🧹 Branch Cleanup Script\n");

  const currentBranch = getCurrentBranch();
  console.log(`Current branch: ${currentBranch}\n`);

  const modifiedFiles = getModifiedFiles();
  console.log(`Found ${modifiedFiles.length} modified files\n`);

  // Categorize files
  const categorized = {
    issue18: [],
    issue20: [],
    issue22: [],
    process: [],
    unknown: [],
  };

  modifiedFiles.forEach(file => {
    const category = categorizeFile(file);
    categorized[category].push(file);
  });

  console.log("📊 File categorization:");
  console.log(`  Issue #9: ${categorized.issue18.length} files`);
  console.log(`  Issue #10: ${categorized.issue20.length} files`);
  console.log(`  Issue #12: ${categorized.issue22.length} files`);
  console.log(`  Process/Infra: ${categorized.process.length} files`);
  console.log(`  Unknown: ${categorized.unknown.length} files\n`);

  if (categorized.unknown.length > 0) {
    console.log("⚠️  Unknown files (need manual review):");
    categorized.unknown.forEach(f => console.log(`    - ${f}`));
    console.log();
  }

  // Stash all changes
  stashChanges();

  // Process Issue #9 (current branch - already complete)
  if (categorized.issue18.length > 0) {
    console.log("\n📋 Issue #9 files (current branch - already complete)");
    console.log("   These should be committed on current branch or discarded");
    categorized.issue18.forEach(f => console.log(`    - ${f}`));
  }

  // Process Issue #10
  if (categorized.issue20.length > 0) {
    console.log("\n📋 Issue #10: Creating branch and moving files...");
    ensureBranch("agent/pixel/10-performance-verification");
    applyStash();
    addFiles(categorized.issue20);
    console.log(`✅ Issue #10 files staged on branch agent/pixel/10-performance-verification`);
    console.log("   Ready to commit: git commit -m 'feat: Issue #10 Step 1 - Chat start performance test'");
    stashChanges(); // Re-stash remaining changes
  }

  // Process Issue #12
  if (categorized.issue22.length > 0) {
    console.log("\n📋 Issue #12: Switching to branch and moving files...");
    ensureBranch("agent/nexus/12-monitoring");
    applyStash();
    addFiles(categorized.issue22);
    console.log(`✅ Issue #12 files staged on branch agent/nexus/12-monitoring`);
    console.log("   Ready to commit: git commit -m 'docs: Issue #12 - Update progress tracking'");
    stashChanges(); // Re-stash remaining changes
  }

  // Process process/infrastructure files
  if (categorized.process.length > 0) {
    console.log("\n📋 Process/Infrastructure files:");
    console.log("   These can be committed on any branch or main");
    categorized.process.forEach(f => console.log(`    - ${f}`));
    console.log("\n   Options:");
    console.log("   1. Commit on current branch (Issue #9)");
    console.log("   2. Commit on main branch");
    console.log("   3. Commit separately on each issue branch");
  }

  // Restore to original branch
  console.log(`\n🔄 Restoring to original branch: ${currentBranch}`);
  execSync(`git checkout ${currentBranch}`, {
    cwd: rootDir,
    stdio: "inherit"
  });

  // Apply remaining stash
  try {
    applyStash();
  } catch {
    console.log("   (No remaining changes to apply)");
  }

  console.log("\n✅ Cleanup complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Review categorized files");
  console.log("   2. Switch to each branch and commit appropriate files");
  console.log("   3. Run: node tools/verify-branch-feature.mjs --fix");
}

try {
  main();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

