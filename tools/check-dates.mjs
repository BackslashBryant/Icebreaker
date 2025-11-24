#!/usr/bin/env node

/**
 * Date validation tool - Checks for placeholder dates that violate Time MCP usage rules.
 * Detects common placeholder patterns like "2025-01-27", "2025-01-XX", "2025-XX-XX"
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Placeholder date patterns to detect
const PLACEHOLDER_PATTERNS = [
  // Common placeholder dates mentioned in rules
  /2025-01-27/g,
  /2025-01-XX/g,
  /2025-XX-XX/g,
  // Any date with XX placeholders
  /\d{4}-XX-\d{2}/g,
  /\d{4}-\d{2}-XX/g,
  /\d{4}-XX-XX/g,
  // Common placeholder range: 2025-01 through 2025-09
  /2025-0[1-9]-\d{2}/g,
];

// Binary file extensions to skip
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv',
  '.db', '.sqlite', '.sqlite3',
]);

// Directories to skip
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  '.cache',
  'coverage',
  '.nyc_output',
  'test-results',
  'playwright-report',
  'artifacts',
  '.turbo',
  '.vercel',
]);

const violations = [];

/**
 * Check if a file should be skipped (binary or ignored)
 */
function shouldSkipFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }

  // Skip the check-dates.mjs file itself (contains example patterns)
  const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  if (relativePath === 'tools/check-dates.mjs') {
    return true;
  }

  // Skip .cursor/rules files (contain examples of placeholder dates in rule text)
  if (relativePath.startsWith('.cursor/rules/')) {
    return true;
  }

  // Check if file is in .gitignore
  try {
    const result = execSync(`git check-ignore "${filePath}"`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return result.trim() !== '';
  } catch (error) {
    // Git not available or file not ignored - continue checking
    return false;
  }
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

/**
 * Scan a file for placeholder dates
 */
function scanFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return;
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      PLACEHOLDER_PATTERNS.forEach(pattern => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const date = match[0];
          const column = match.index;
          
          violations.push({
            file: path.relative(repoRoot, filePath),
            line: index + 1,
            column: column + 1,
            date: date,
            context: line.trim().substring(0, 100), // First 100 chars for context
          });
        }
      });
    });
  } catch (error) {
    // Skip files that can't be read (binary, permissions, etc.)
    if (error.code !== 'EISDIR' && error.code !== 'ENOENT') {
      // Silently skip unreadable files
    }
  }
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dirPath, stagedFiles = null) {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        scanDirectory(fullPath, stagedFiles);
      }
    } else if (entry.isFile()) {
      // If stagedFiles provided, only check staged files
      if (stagedFiles) {
        const relativePath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');
        if (stagedFiles.includes(relativePath)) {
          scanFile(fullPath);
        }
      } else {
        scanFile(fullPath);
      }
    }
  }
}

/**
 * Get staged files from git
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Get changed files from git (compared to base branch)
 */
function getChangedFiles() {
  try {
    // Try to get base branch from CI environment or default to main
    const baseRef = process.env.GITHUB_BASE_REF || 'main';
    const output = execSync(`git diff --name-only origin/${baseRef}...HEAD 2>&1`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const files = output.trim().split('\n').filter(Boolean);
    // Filter out error messages
    return files.filter(f => !f.includes('fatal:') && !f.includes('error:'));
  } catch (error) {
    // If base branch doesn't exist or git fails, try main
    try {
      const output = execSync('git diff --name-only origin/main...HEAD 2>&1', {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const files = output.trim().split('\n').filter(Boolean);
      return files.filter(f => !f.includes('fatal:') && !f.includes('error:'));
    } catch (error2) {
      return [];
    }
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const stagedOnly = args.includes('--staged');
  const changedOnly = args.includes('--changed');

  violations.length = 0; // Reset violations

  if (stagedOnly) {
    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      if (jsonMode) {
        console.log(JSON.stringify({ ok: true, violations: [] }, null, 2));
      } else {
        console.log('No staged files to check.');
      }
      process.exit(0);
    }
    // Check each staged file
    stagedFiles.forEach(relativePath => {
      const fullPath = path.join(repoRoot, relativePath);
      if (existsSync(fullPath)) {
        const stat = statSync(fullPath);
        if (stat.isFile()) {
          scanFile(fullPath);
        }
      }
    });
  } else if (changedOnly) {
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      if (jsonMode) {
        console.log(JSON.stringify({ ok: true, violations: [] }, null, 2));
      } else {
        console.log('No changed files to check.');
      }
      process.exit(0);
    }
    // Check each changed file
    changedFiles.forEach(relativePath => {
      const fullPath = path.join(repoRoot, relativePath);
      if (existsSync(fullPath)) {
        const stat = statSync(fullPath);
        if (stat.isFile()) {
          scanFile(fullPath);
        }
      }
    });
  } else {
    // Scan all files
    scanDirectory(repoRoot);
  }

  if (jsonMode) {
    const result = {
      ok: violations.length === 0,
      violations: violations,
      count: violations.length,
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (violations.length === 0) {
      console.log('✓ No placeholder dates found.');
      process.exit(0);
    } else {
      console.error(`✗ Found ${violations.length} placeholder date violation(s):\n`);
      violations.forEach(v => {
        console.error(`  ${v.file}:${v.line}:${v.column} - Found "${v.date}"`);
        console.error(`    ${v.context}`);
      });
      console.error('\nUse Time MCP to get accurate dates. See .cursor/rules/04-integrations.mdc for details.');
      process.exit(1);
    }
  }

  process.exit(violations.length === 0 ? 0 : 1);
}

try {
  main();
} catch (error) {
  console.error('Error checking dates:', error instanceof Error ? error.message : error);
  process.exit(1);
}

