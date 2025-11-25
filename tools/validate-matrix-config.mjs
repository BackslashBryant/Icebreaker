#!/usr/bin/env node

/**
 * Validate GitHub Actions matrix matches Playwright project names
 * Ensures no duplicate projects and no legacy/deprecated projects
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const CI_WORKFLOW = '.github/workflows/ci.yml';
const PLAYWRIGHT_CONFIG = 'tests/playwright.config.ts';
const PLAYWRIGHT_SMOKE_CONFIG = 'tests/playwright.config.smoke.ts';

const errors = [];
const warnings = [];

/**
 * Extract matrix browsers from CI workflow
 */
function extractMatrixBrowsers(workflowContent) {
  const matrices = [];
  
  // Find all matrix: browser: [...] patterns
  const matrixRegex = /matrix:\s*\n\s*browser:\s*\[([^\]]+)\]/g;
  let match;
  while ((match = matrixRegex.exec(workflowContent)) !== null) {
    const browsers = match[1]
      .split(',')
      .map(b => b.trim().replace(/['"]/g, ''))
      .filter(Boolean);
    matrices.push({ browsers, context: match[0] });
  }
  
  return matrices;
}

/**
 * Extract Playwright projects from config
 */
function extractPlaywrightProjects(configContent) {
  const projects = [];
  
  // Find all project definitions: name: 'project-name'
  const projectRegex = /name:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = projectRegex.exec(configContent)) !== null) {
    projects.push(match[1]);
  }
  
  return projects;
}

/**
 * Check if matrix browsers have corresponding projects
 */
function validateMatrixProjects(matrixBrowsers, projects, configName) {
  matrixBrowsers.forEach(browser => {
    // Check for browser-desktop and browser-mobile projects
    const desktopProject = `${browser}-desktop`;
    const mobileProject = `${browser}-mobile`;
    
    if (!projects.includes(desktopProject)) {
      errors.push(`Matrix browser "${browser}" missing project "${desktopProject}" in ${configName}`);
    }
    
    // Mobile is optional for health-mvp (desktop-only)
    // But should exist for full suite
    if (configName.includes('playwright.config.ts') && !projects.includes(mobileProject)) {
      warnings.push(`Matrix browser "${browser}" missing mobile project "${mobileProject}" in ${configName}`);
    }
  });
}

/**
 * Check for duplicate projects
 */
function checkDuplicates(projects, configName) {
  const seen = new Set();
  const duplicates = [];
  
  projects.forEach(project => {
    if (seen.has(project)) {
      duplicates.push(project);
    }
    seen.add(project);
  });
  
  if (duplicates.length > 0) {
    errors.push(`Duplicate projects found in ${configName}: ${duplicates.join(', ')}`);
  }
}

/**
 * Check for legacy projects that should be removed
 */
function checkLegacyProjects(projects, configName) {
  const legacyProjects = ['chromium', 'firefox', 'msedge', 'stateless'];
  const foundLegacy = projects.filter(p => legacyProjects.includes(p));
  
  if (foundLegacy.length > 0 && configName.includes('playwright.config.ts')) {
    warnings.push(`Legacy projects found in ${configName}: ${foundLegacy.join(', ')}. Consider removing when matrix projects are stable.`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const strictMode = args.includes('--strict');
  
  try {
    // Read CI workflow
    const workflowPath = path.join(repoRoot, CI_WORKFLOW);
    const workflowContent = readFileSync(workflowPath, 'utf8');
    
    // Read Playwright configs
    const playwrightPath = path.join(repoRoot, PLAYWRIGHT_CONFIG);
    const playwrightContent = readFileSync(playwrightPath, 'utf8');
    
    const smokePath = path.join(repoRoot, PLAYWRIGHT_SMOKE_CONFIG);
    const smokeContent = readFileSync(smokePath, 'utf8');
    
    // Extract matrices and projects
    const matrices = extractMatrixBrowsers(workflowContent);
    const playwrightProjects = extractPlaywrightProjects(playwrightContent);
    const smokeProjects = extractPlaywrightProjects(smokeContent);
    
    // Validate each matrix
    matrices.forEach(({ browsers, context }) => {
      // Determine which config to check based on context
      if (context.includes('health-mvp')) {
        validateMatrixProjects(browsers, playwrightProjects, PLAYWRIGHT_CONFIG);
      } else if (context.includes('persona-full')) {
        validateMatrixProjects(browsers, playwrightProjects, PLAYWRIGHT_CONFIG);
      } else if (context.includes('persona-smoke')) {
        // Smoke uses explicit projects, not matrix
        // Just check that smoke projects exist
      }
    });
    
    // Check for duplicates
    checkDuplicates(playwrightProjects, PLAYWRIGHT_CONFIG);
    checkDuplicates(smokeProjects, PLAYWRIGHT_SMOKE_CONFIG);
    
    // Check for legacy projects
    checkLegacyProjects(playwrightProjects, PLAYWRIGHT_CONFIG);
    
    // Report results
    if (errors.length > 0) {
      console.error('❌ Matrix/Config Validation Failed:\n');
      errors.forEach(e => console.error(`  ${e}`));
      process.exit(1);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Matrix/Config Warnings:\n');
      warnings.forEach(w => console.warn(`  ${w}`));
      if (strictMode) {
        process.exit(1);
      }
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Matrix/Config validation passed');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error validating matrix/config:', error.message);
    process.exit(1);
  }
}

main();

