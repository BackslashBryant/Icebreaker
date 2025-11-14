#!/usr/bin/env node

/**
 * UI Token Enforcement Script
 * 
 * Checks for violations of design token usage rules:
 * - Blocks border-accent, bg-accent/*, rounded-xl outside whitelist
 * - Allows accent only for: primary buttons, H1 headings, focus rings, critical alerts
 * 
 * Usage: node tools/check-ui-tokens.mjs [--fix]
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Whitelist: Files/components where accent usage is allowed
const ACCENT_WHITELIST = [
  // Primary buttons (retro-button class)
  'retro-button',
  'bg-accent', // Primary button backgrounds
  'text-accent-foreground', // Primary button text
  
  // H1 headings (glow-accent class)
  'glow-accent',
  'text-accent', // H1 headings only
  
  // Focus rings (correct usage)
  'ring-accent',
  'focus-visible:ring-accent',
  'focus:ring-accent',
  
  // Critical alerts (panic dialogs, destructive states)
  'border-destructive', // Critical alerts use destructive, not accent
  'bg-destructive',
  'text-destructive',
  
  // Progress bars (legitimate use)
  'border-accent/50', // Progress bar border (BootSequence)
  'bg-accent', // Progress bar fill
];

// Patterns to flag as violations
const VIOLATION_PATTERNS = [
  // Accent borders (except whitelisted)
  { pattern: /border-accent(?:\/[0-9]+)?/g, message: 'border-accent used outside primary button/whitelist', checkWhitelist: true },
  
  // Accent backgrounds (except whitelisted)
  { pattern: /bg-accent\/(?:5|10|20|30)/g, message: 'bg-accent/* used for non-primary elements', checkWhitelist: true },
  
  // rounded-xl (should be rounded-md for callouts, rounded-2xl for buttons)
  { pattern: /rounded-xl/g, message: 'rounded-xl used (should be rounded-md for callouts, rounded-2xl for buttons)', checkWhitelist: false },
];

// Files to check
const FRONTEND_SRC = join(projectRoot, 'frontend', 'src');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const violations = [];
  
  // Check each violation pattern
  VIOLATION_PATTERNS.forEach(({ pattern, message, checkWhitelist = true }) => {
    const matches = content.matchAll(pattern);
    
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1];
      
      // For rounded-xl, check if it's in a className with rounded-2xl (button context)
      if (pattern.source === 'rounded-xl') {
        // Extract className string - handle both single-line and template literals
        // Look for className="..." or className={`...`} or className={'...'}
        const classNameMatch = line.match(/className=(?:["'`]([^"'`]+)["'`]|{`([^`]+)`}|{["']([^"']+)["']})/);
        if (classNameMatch) {
          const classNameStr = (classNameMatch[1] || classNameMatch[2] || classNameMatch[3] || '').trim();
          // If rounded-2xl is in the same className, it's valid (button)
          if (classNameStr.includes('rounded-2xl')) {
            continue; // Skip - this is a button, rounded-xl is acceptable
          }
        } else {
          // Check if it's a template literal spanning multiple lines
          // Look backwards and forwards for className start/end
          const beforeMatch = content.substring(Math.max(0, match.index - 200), match.index);
          const afterMatch = content.substring(match.index, Math.min(content.length, match.index + 200));
          const combinedContext = beforeMatch + afterMatch;
          const templateMatch = combinedContext.match(/className=\{`([^`]+)`\}/s);
          if (templateMatch) {
            const classNameStr = templateMatch[1];
            if (classNameStr.includes('rounded-2xl')) {
              continue; // Skip - this is a button
            }
          }
        }
      }
      
      // Check if this is in a whitelisted context
      if (checkWhitelist) {
        // Extract className string to check context precisely
        const classNameMatch = line.match(/className=(?:["'`]([^"'`]+)["'`]|{`([^`]+)`}|{["']([^"']+)["']})/);
        let classNameStr = '';
        if (classNameMatch) {
          classNameStr = (classNameMatch[1] || classNameMatch[2] || classNameMatch[3] || '').trim();
        } else {
          // Check if it's a template literal spanning multiple lines
          const beforeMatch = content.substring(Math.max(0, match.index - 200), match.index);
          const afterMatch = content.substring(match.index, Math.min(content.length, match.index + 200));
          const combinedContext = beforeMatch + afterMatch;
          const templateMatch = combinedContext.match(/className=\{`([^`]+)`\}/s);
          if (templateMatch) {
            classNameStr = templateMatch[1];
          }
        }
        
        // Check if the violation is in a whitelisted context
        // border-accent is only whitelisted on primary buttons (bg-accent, retro-button)
        if (match[0].includes('border-accent')) {
          if (classNameStr.includes('bg-accent') || classNameStr.includes('retro-button')) {
            continue; // Skip - primary button
          }
        }
        
        // bg-accent/* is only whitelisted on primary buttons (bg-accent, retro-button)
        if (match[0].includes('bg-accent/')) {
          if (classNameStr.includes('bg-accent') || classNameStr.includes('retro-button')) {
            continue; // Skip - primary button
          }
        }
        
        // text-accent is only whitelisted on H1 headings (glow-accent) or primary buttons
        if (match[0].includes('text-accent') && !match[0].includes('text-accent-foreground')) {
          if (classNameStr.includes('glow-accent') || classNameStr.includes('bg-accent') || classNameStr.includes('retro-button')) {
            continue; // Skip - H1 heading or primary button
          }
        }
        
        // Focus rings are always whitelisted (correct usage)
        if (match[0].includes('ring-accent') || line.includes('focus:ring-accent') || line.includes('focus-visible:ring-accent')) {
          continue; // Skip - focus rings are correct
        }
        
        // Progress bars are whitelisted (BootSequence)
        // Check if this is in a progress bar context (border-accent/50 on container with bg-accent child)
        if (match[0].includes('border-accent/50')) {
          // Look for bg-accent in nearby context (progress bar fill)
          const context = content.substring(Math.max(0, match.index - 300), Math.min(content.length, match.index + 300));
          if (context.includes('bg-accent') && (context.includes('h-4') || context.includes('progress'))) {
            continue; // Skip - progress bar
          }
        }
      }
      
      violations.push({
        file: filePath.replace(projectRoot + '/', ''),
        line: lineNumber,
        match: match[0],
        message,
        context: line.trim(),
      });
    }
  });
  
  return violations;
}

function main() {
  console.log('🔍 Checking UI token usage...\n');
  
  const files = getAllFiles(FRONTEND_SRC);
  const allViolations = [];
  
  files.forEach(file => {
    const violations = checkFile(file);
    allViolations.push(...violations);
  });
  
  if (allViolations.length === 0) {
    console.log('✅ All UI token usage is compliant!\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allViolations.length} violation(s):\n`);
    
    allViolations.forEach(({ file, line, match, message, context }) => {
      console.log(`  ${file}:${line}`);
      console.log(`    ${message}`);
      console.log(`    Found: ${match}`);
      console.log(`    Context: ${context.substring(0, 80)}${context.length > 80 ? '...' : ''}\n`);
    });
    
    console.log('\n💡 Fix violations by:');
    console.log('   - Using border-border, bg-muted/20, rounded-md for callouts');
    console.log('   - Reserving accent for primary buttons, H1 headings, focus rings only');
    console.log('   - Using border-destructive for critical alerts');
    console.log('   - See docs/ui-patterns.md for examples\n');
    
    process.exit(1);
  }
}

main();

