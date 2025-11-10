#!/usr/bin/env node

/**
 * Repo mode detection utility
 * Determines if repository is in "template" mode (allows Cursor files) or "app" mode (blocks them)
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const REPO_MODE_FILE = path.join(repoRoot, '.repo-mode');
const PACKAGE_JSON_PATH = path.join(repoRoot, 'package.json');

/**
 * Detects the repository mode (template or app)
 * @returns {'template'|'app'} The detected mode
 */
export function detectRepoMode() {
  // Check for explicit .repo-mode file first
  if (existsSync(REPO_MODE_FILE)) {
    try {
      const mode = readFileSync(REPO_MODE_FILE, 'utf8').trim().toLowerCase();
      if (mode === 'template' || mode === 'app') {
        return mode;
      }
    } catch (error) {
      // Fall through to package.json check
    }
  }

  // Fallback: check package.json for "template" indicators
  if (existsSync(PACKAGE_JSON_PATH)) {
    try {
      const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
      const name = (packageJson.name || '').toLowerCase();
      const description = (packageJson.description || '').toLowerCase();

      // If name or description contains "template", it's a template repo
      if (name.includes('template') || description.includes('template')) {
        return 'template';
      }
      
      // If name/description don't contain "template", it's likely an app repo
      // Default to app mode for application repositories
      return 'app';
    } catch (error) {
      // Fall through to default
    }
  }

  // Default to app mode (most repos are apps, not templates)
  return 'app';
}

/**
 * Sets the repository mode explicitly
 * @param {'template'|'app'} mode - The mode to set
 */
export async function setRepoMode(mode) {
  if (mode !== 'template' && mode !== 'app') {
    throw new Error(`Invalid mode: ${mode}. Must be 'template' or 'app'`);
  }

  const fs = await import('node:fs/promises');
  await fs.writeFile(REPO_MODE_FILE, mode, 'utf8');
  return mode;
}
