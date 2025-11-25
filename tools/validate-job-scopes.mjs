#!/usr/bin/env node

/**
 * Validate CI job scopes: checks job should not run E2E, smoke should be minimal, etc.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const CI_WORKFLOW = '.github/workflows/ci.yml';

const errors = [];
const warnings = [];

/**
 * Job scope definitions
 */
const JOB_SCOPES = {
  'checks': {
    allowed: ['lint', 'type', 'unit'],
    banned: ['e2e', 'playwright', 'test:e2e'],
    description: 'Lint, typecheck, unit tests ONLY',
  },
  'persona-smoke': {
    allowed: ['test:smoke', 'playwright', 'smoke'],
    description: 'Minimal, time-bounded matrix (< 3 min)',
  },
  'persona-full': {
    allowed: ['test', 'playwright', 'npm test'],
    description: 'Full matrix, nightly runs',
  },
  'health-mvp': {
    allowed: ['health', 'e2e/health', 'playwright'],
    description: 'Health endpoint validation',
  },
  'performance-budgets': {
    allowed: ['performance', 'e2e/performance'],
    description: 'Performance metrics only',
  },
  'ui-visual-a11y': {
    allowed: ['visual', 'golden', 'accessibility', 'a11y'],
    description: 'Visual regression and accessibility',
  },
};

/**
 * Extract job steps from workflow
 */
function extractJobSteps(workflowContent, jobName) {
  const jobStart = workflowContent.indexOf(`${jobName}:`);
  if (jobStart === -1) return [];
  
  // Find next job or end of file
  const nextJobMatch = workflowContent.substring(jobStart).match(/\n\s+(\w+):\s*\n\s*runs-on:/);
  const jobEnd = nextJobMatch ? jobStart + nextJobMatch.index : workflowContent.length;
  const jobContent = workflowContent.substring(jobStart, jobEnd);
  
  // Extract run: commands
  const runMatches = jobContent.matchAll(/run:\s*([^\n]+(?:\n\s+[^\n]+)*)/g);
  const steps = [];
  for (const match of runMatches) {
    steps.push(match[1].trim());
  }
  
  return steps;
}

/**
 * Validate job scope
 */
function validateJobScope(jobName, steps) {
  const scope = JOB_SCOPES[jobName];
  if (!scope) return; // Unknown job, skip
  
  steps.forEach(step => {
    const stepLower = step.toLowerCase();
    
    // Check banned patterns
    if (scope.banned) {
      scope.banned.forEach(banned => {
        if (stepLower.includes(banned.toLowerCase())) {
          errors.push(`Job "${jobName}" violates scope: "${banned}" is banned. ${scope.description}`);
        }
      });
    }
    
    // Warn if step doesn't match allowed patterns (not strict, just warning)
    if (scope.allowed && !scope.allowed.some(allowed => stepLower.includes(allowed.toLowerCase()))) {
      // Don't warn for setup/install steps
      if (!stepLower.includes('install') && !stepLower.includes('checkout') && !stepLower.includes('setup')) {
        warnings.push(`Job "${jobName}" step may be out of scope: "${step.substring(0, 50)}..."`);
      }
    }
  });
}

function main() {
  const args = process.argv.slice(2);
  const strictMode = args.includes('--strict');
  
  try {
    const workflowPath = path.join(repoRoot, CI_WORKFLOW);
    const workflowContent = readFileSync(workflowPath, 'utf8');
    
    Object.keys(JOB_SCOPES).forEach(jobName => {
      const steps = extractJobSteps(workflowContent, jobName);
      if (steps.length > 0) {
        validateJobScope(jobName, steps);
      }
    });
    
    if (errors.length > 0) {
      console.error('❌ Job Scope Validation Failed:\n');
      errors.forEach(e => console.error(`  ${e}`));
      process.exit(1);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Job Scope Warnings:\n');
      warnings.forEach(w => console.warn(`  ${w}`));
      if (strictMode) {
        process.exit(1);
      }
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Job scope validation passed');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error validating job scopes:', error.message);
    process.exit(1);
  }
}

main();

