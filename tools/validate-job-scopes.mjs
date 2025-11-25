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
    allowed: ['lint', 'type', 'unit', 'check', 'guard', 'date', 'token', 'connection', 'git'],
    banned: ['e2e', 'playwright', 'test:e2e', 'test:smoke'],
    description: 'Lint, typecheck, unit tests ONLY',
  },
  'persona-smoke': {
    allowed: ['test:smoke', 'playwright', 'smoke', 'summarize', 'telemetry'],
    description: 'Minimal, time-bounded matrix (< 3 min)',
  },
  'persona-full': {
    allowed: ['test', 'playwright', 'npm test', 'summarize', 'telemetry'],
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
 * Extract job steps from workflow using proper YAML-aware parsing
 */
function extractJobSteps(workflowContent, jobName) {
  const lines = workflowContent.split('\n');
  const steps = [];
  let inJob = false;
  let jobIndent = -1;
  let currentRun = '';
  let runIndent = -1;
  
  // Known job-level keys that are NOT sibling jobs
  const JOB_LEVEL_KEYS = ['runs-on', 'needs', 'if', 'env', 'steps', 'strategy', 'matrix', 
                          'timeout-minutes', 'continue-on-error', 'container', 'services',
                          'outputs', 'permissions', 'environment', 'concurrency'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Check for job start (looking for "  jobName:" pattern under jobs:)
    if (trimmed === `${jobName}:` || trimmed.startsWith(`${jobName}:`)) {
      // Make sure we're at job level (typically 2 spaces under "jobs:")
      inJob = true;
      jobIndent = indent;
      continue;
    }
    
    // If we're in the job
    if (inJob) {
      // Check if we've exited to a sibling job - a line at same indent as job name
      // that looks like a new job definition (word followed by colon, not a job-level key)
      if (indent === jobIndent && trimmed.match(/^[\w-]+:\s*$/)) {
        const keyName = trimmed.replace(':', '').trim();
        if (!JOB_LEVEL_KEYS.includes(keyName)) {
          // This is a new job, stop parsing
          inJob = false;
          break;
        }
      }
      
      // Look for run: commands at any indentation within the job
      if (trimmed.startsWith('run:')) {
        // Save any previous multi-line run command
        if (currentRun) {
          steps.push(currentRun.trim());
          currentRun = '';
        }
        
        const runContent = trimmed.replace(/^run:\s*/, '').trim();
        runIndent = indent;
        
        // Handle single-line run (not starting with | or >)
        if (runContent && !runContent.startsWith('|') && !runContent.startsWith('>')) {
          steps.push(runContent);
          runIndent = -1;
        } else {
          // Multi-line run, will collect content on subsequent lines
          currentRun = '';
        }
        continue;
      }
      
      // Collect multi-line run content (more indented than run:)
      if (runIndent >= 0 && indent > runIndent && trimmed) {
        currentRun += (currentRun ? ' ' : '') + trimmed;
        continue;
      } else if (runIndent >= 0 && indent <= runIndent) {
        // End of multi-line run
        if (currentRun) {
          steps.push(currentRun.trim());
        }
        currentRun = '';
        runIndent = -1;
      }
    }
  }
  
  // Don't forget last run command
  if (currentRun) {
    steps.push(currentRun.trim());
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
  const debugMode = args.includes('--debug');
  
  try {
    const workflowPath = path.join(repoRoot, CI_WORKFLOW);
    const workflowContent = readFileSync(workflowPath, 'utf8');
    
    Object.keys(JOB_SCOPES).forEach(jobName => {
      const steps = extractJobSteps(workflowContent, jobName);
      if (debugMode) {
        console.log(`\n[DEBUG] Job "${jobName}" steps:`);
        steps.forEach((s, i) => console.log(`  ${i + 1}. ${s.substring(0, 80)}...`));
      }
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

