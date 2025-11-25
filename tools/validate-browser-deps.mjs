#!/usr/bin/env node

/**
 * Validate browser dependencies: Each matrix browser must have install step
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const CI_WORKFLOW = '.github/workflows/ci.yml';

const errors = [];

/**
 * Extract matrix browsers from CI workflow
 */
function extractMatrixBrowsers(workflowContent) {
  const jobMatrices = [];
  
  // Find job definitions with matrix
  const jobRegex = /(\w+):\s*\n\s*runs-on:[^\n]+\n\s*strategy:\s*\n\s*matrix:\s*\n\s*browser:\s*\[([^\]]+)\]/g;
  let match;
  while ((match = jobRegex.exec(workflowContent)) !== null) {
    const jobName = match[1];
    const browsers = match[2]
      .split(',')
      .map(b => b.trim().replace(/['"]/g, ''))
      .filter(Boolean);
    jobMatrices.push({ jobName, browsers });
  }
  
  return jobMatrices;
}

/**
 * Check if install step exists for browsers
 */
function checkInstallSteps(workflowContent, jobName, browsers) {
  // Find the job's steps
  const jobStart = workflowContent.indexOf(`${jobName}:`);
  if (jobStart === -1) return;
  
  // Find next job or end of file
  const nextJobMatch = workflowContent.substring(jobStart).match(/\n\s+(\w+):\s*\n\s*runs-on:/);
  const jobEnd = nextJobMatch ? jobStart + nextJobMatch.index : workflowContent.length;
  const jobContent = workflowContent.substring(jobStart, jobEnd);
  
  // Check for install step
  const installStepMatch = jobContent.match(/Install Playwright browsers[\s\S]*?run:\s*npx playwright install[^\n]*/);
  if (!installStepMatch) {
    errors.push(`Job "${jobName}" has matrix browsers but no "Install Playwright browsers" step`);
    return;
  }
  
  const installCommand = installStepMatch[0];
  
  // Check each browser is in install command
  browsers.forEach(browser => {
    // Handle matrix variable: ${{ matrix.browser }}
    if (installCommand.includes('${{ matrix.browser }}')) {
      // Dynamic install - OK
      return;
    }
    
    // Check if browser is explicitly listed
    if (!installCommand.includes(browser)) {
      errors.push(`Job "${jobName}" matrix browser "${browser}" not found in install command`);
    }
  });
}

function main() {
  try {
    const workflowPath = path.join(repoRoot, CI_WORKFLOW);
    const workflowContent = readFileSync(workflowPath, 'utf8');
    
    const jobMatrices = extractMatrixBrowsers(workflowContent);
    
    jobMatrices.forEach(({ jobName, browsers }) => {
      checkInstallSteps(workflowContent, jobName, browsers);
    });
    
    // Also check non-matrix jobs that install browsers
    // persona-smoke, persona-full install browsers without matrix
    const nonMatrixJobs = [
      { name: 'persona-smoke', browsers: ['chromium', 'webkit'] },
      { name: 'persona-full', browsers: ['chromium', 'firefox', 'webkit', 'msedge'] },
    ];
    
    nonMatrixJobs.forEach(({ name, browsers }) => {
      checkInstallSteps(workflowContent, name, browsers);
    });
    
    if (errors.length > 0) {
      console.error('❌ Browser Dependency Validation Failed:\n');
      errors.forEach(e => console.error(`  ${e}`));
      process.exit(1);
    }
    
    console.log('✅ Browser dependency validation passed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error validating browser dependencies:', error.message);
    process.exit(1);
  }
}

main();

