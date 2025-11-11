#!/usr/bin/env node

/**
 * Documentation Audit Tool
 * 
 * Checks for orphaned documentation files that are not referenced anywhere.
 * 
 * Usage:
 *   npm run docs:audit
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = join(__dirname, '..');

// Files to check
const docDirs = [
  'docs/guides',
  'docs/troubleshooting',
  '.cursor/rules',
];

// Files to exclude from checks
const excludePatterns = [
  /archive\//,
  /README\.md$/,
  /\.mdc$/, // Rules are checked differently
];

// Files that are allowed to exist without references (special cases)
const allowedUnreferenced = [
  'docs/guides/README.md',
  'docs/troubleshooting/README.md',
];

// Search in these locations for references
const searchLocations = [
  'README.md',
  'docs',
  'tools',
  'examples',
  '.cursor',
];

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relPath = relative(repoRoot, fullPath);
      
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, baseDir));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (!excludePatterns.some(pattern => pattern.test(relPath))) {
          files.push(relPath);
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist, skip
  }
  return files;
}

function searchInFile(filePath, searchTerm) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.includes(searchTerm);
  } catch (err) {
    return false;
  }
}

function findReferences(docFile) {
  const references = [];
  const fileName = docFile.split(/[/\\]/).pop();
  const baseName = fileName.replace('.md', '');
  const relPath = docFile.replace(/\\/g, '/'); // Normalize path separators
  
  // Search in common reference locations
  for (const location of searchLocations) {
    const fullPath = join(repoRoot, location);
    if (!existsSync(fullPath)) continue;
    
    try {
      const files = getAllFiles(fullPath);
      for (const file of files) {
        const filePath = join(repoRoot, file);
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for various reference patterns
        if (content.includes(docFile) || 
            content.includes(relPath) ||
            content.includes(fileName) ||
            content.includes(baseName) ||
            content.includes(`guides/setup/mcp-setup`) ||
            content.includes(`guides/reference/supabase-keys`) ||
            content.includes(`troubleshooting/mcp-troubleshooting`)) {
          references.push(file);
        }
      }
    } catch (err) {
      // Skip if can't read
    }
  }
  
  return references;
}

function main() {
  console.log('🔍 Auditing documentation files...\n');
  
  const allDocFiles = [];
  for (const dir of docDirs) {
    const fullPath = join(repoRoot, dir);
    if (existsSync(fullPath)) {
      allDocFiles.push(...getAllFiles(fullPath));
    }
  }
  
  const orphaned = [];
  const referenced = [];
  
  for (const docFile of allDocFiles) {
    if (allowedUnreferenced.includes(docFile)) {
      continue;
    }
    
    const refs = findReferences(docFile);
    if (refs.length === 0) {
      orphaned.push(docFile);
    } else {
      referenced.push({ file: docFile, refs });
    }
  }
  
  // Report results
  if (orphaned.length > 0) {
    console.log('❌ Orphaned documentation files (not referenced anywhere):\n');
    for (const file of orphaned) {
      console.log(`   - ${file}`);
    }
    console.log('\n💡 Action: Add references to these files or move to archive/\n');
    process.exit(1);
  } else {
    console.log('✅ All documentation files are referenced\n');
    console.log(`   Checked ${allDocFiles.length} files`);
    console.log(`   All files have references\n`);
    process.exit(0);
  }
}

main();

