#!/usr/bin/env node

/**
 * Validate flake tracking: Check that all flakes are owned and not stale
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const FLAKE_LOG = 'Docs/testing/FLAKY_TESTS.md';

const errors = [];
const warnings = [];

/**
 * Parse flake log entries
 */
function parseFlakeLog(content) {
  const flakes = [];
  const lines = content.split('\n');
  let currentFlake = null;
  
  lines.forEach((line, index) => {
    // Start of new flake entry
    if (line.startsWith('### Test Name:')) {
      if (currentFlake) {
        flakes.push(currentFlake);
      }
      currentFlake = {
        name: line.replace('### Test Name:', '').trim(),
        line: index + 1,
        fields: {},
      };
    } else if (currentFlake && line.trim().startsWith('- **')) {
      // Parse field: - **Field Name**: value
      const match = line.match(/- \*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        const fieldName = match[1].trim().toLowerCase();
        const value = match[2].trim();
        currentFlake.fields[fieldName] = value;
      }
    }
  });
  
  if (currentFlake) {
    flakes.push(currentFlake);
  }
  
  return flakes;
}

/**
 * Validate flake entry
 */
function validateFlake(flake) {
  const fields = flake.fields;
  
  // Check for owner
  if (!fields.owner || fields.owner === 'unassigned' || fields.owner === 'none') {
    errors.push(`Flake "${flake.name}" (line ${flake.line}) has no owner assigned`);
  }
  
  // Check for status
  if (!fields.status) {
    warnings.push(`Flake "${flake.name}" (line ${flake.line}) missing status field`);
  } else if (fields.status.toLowerCase() === 'active' && !fields.owner) {
    errors.push(`Active flake "${flake.name}" (line ${flake.line}) must have owner`);
  }
  
  // Check for stale flakes (> 1 week old, active, no fix date)
  if (fields['first identified'] && fields.status && fields.status.toLowerCase() === 'active') {
    const firstIdentified = fields['first identified'];
    const fixDate = fields['fix date'];
    
    if (!fixDate && /^\d{4}-\d{2}-\d{2}$/.test(firstIdentified)) {
      const [year, month, day] = firstIdentified.split('-').map(Number);
      const identifiedDate = new Date(year, month - 1, day);
      const now = new Date();
      const daysOld = Math.floor((now - identifiedDate) / (1000 * 60 * 60 * 24));
      
      if (daysOld > 7) {
        errors.push(`Flake "${flake.name}" (line ${flake.line}) is ${daysOld} days old and still active. Assign owner or quarantine.`);
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const strictMode = args.includes('--strict');
  
  const flakeLogPath = path.join(repoRoot, FLAKE_LOG);
  
  if (!existsSync(flakeLogPath)) {
    console.log('⚠️  Flake log file not found. Creating template...');
    // File will be created by first flake entry
    process.exit(0);
  }
  
  try {
    const content = readFileSync(flakeLogPath, 'utf8');
    const flakes = parseFlakeLog(content);
    
    if (flakes.length === 0) {
      console.log('✅ No flakes tracked (or log format needs update)');
      process.exit(0);
    }
    
    flakes.forEach(flake => {
      validateFlake(flake);
    });
    
    if (errors.length > 0) {
      console.error('❌ Flake Tracking Validation Failed:\n');
      errors.forEach(e => console.error(`  ${e}`));
      process.exit(1);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Flake Tracking Warnings:\n');
      warnings.forEach(w => console.warn(`  ${w}`));
      if (strictMode) {
        process.exit(1);
      }
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✅ Flake tracking validation passed (${flakes.length} flakes tracked)`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('Error validating flake tracking:', error.message);
    process.exit(1);
  }
}

main();

