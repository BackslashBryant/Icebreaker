#!/usr/bin/env node

/**
 * Dependency Import Validator
 * 
 * Checks that all static imports in backend/src match installed dependencies.
 * Prevents crashes from missing optional dependencies.
 * 
 * Usage: node tools/check-dependencies.mjs [--fix]
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const backendSrcPath = path.join(repoRoot, 'backend', 'src');
const backendPackageJsonPath = path.join(repoRoot, 'backend', 'package.json');

const errors = [];
const warnings = [];

// Optional dependencies that should use dynamic imports
const OPTIONAL_DEPENDENCIES = ['@sentry/node'];

function getAllDependencies(packageJson) {
  const deps = { ...packageJson.dependencies || {} };
  const devDeps = { ...packageJson.devDependencies || {} };
  return { ...deps, ...devDeps };
}

function extractImports(content, filePath) {
  const imports = [];
  
  // Match: import ... from "package" or import ... from 'package'
  // Group 1: import statement content (optional)
  // Group 2: package name
  const staticImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([@\w/.-]+)['"]/g;
  
  let match;
  while ((match = staticImportRegex.exec(content)) !== null) {
    const packageName = match[2];
    // Skip relative imports and built-in modules
    if (packageName && !packageName.startsWith('.') && !packageName.startsWith('/') && !packageName.startsWith('node:')) {
      imports.push({
        package: packageName,
        line: content.substring(0, match.index).split('\n').length,
        file: filePath,
        fullMatch: match[0],
      });
    }
  }
  
  return imports;
}

function checkFile(filePath, dependencies) {
  const content = readFileSync(filePath, 'utf8');
  const imports = extractImports(content, path.relative(repoRoot, filePath));
  
  for (const imp of imports) {
    const packageName = imp.package;
    
    // Check if package is in dependencies
    if (!dependencies[packageName]) {
      // Check if it's an optional dependency that should use dynamic import
      if (OPTIONAL_DEPENDENCIES.includes(packageName)) {
        errors.push({
          type: 'error',
          file: imp.file,
          line: imp.line,
          message: `Static import of optional dependency "${packageName}" detected. Use dynamic import() with try-catch instead.`,
          fix: `Replace: ${imp.fullMatch}\nWith: const ${packageName.replace(/[@/-]/g, '_')} = await import("${packageName}").catch(() => null);`,
        });
      } else {
        errors.push({
          type: 'error',
          file: imp.file,
          line: imp.line,
          message: `Import "${packageName}" not found in package.json dependencies`,
          fix: `Add "${packageName}" to backend/package.json dependencies or use dynamic import if optional`,
        });
      }
    }
  }
}

function walkDirectory(dir, dependencies) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDirectory(fullPath, dependencies);
    } else if (entry.endsWith('.js') || entry.endsWith('.ts') || entry.endsWith('.jsx') || entry.endsWith('.tsx')) {
      checkFile(fullPath, dependencies);
    }
  }
}

function main() {
  if (!existsSync(backendPackageJsonPath)) {
    console.error('Error: backend/package.json not found');
    process.exit(1);
  }
  
  if (!existsSync(backendSrcPath)) {
    console.error('Error: backend/src directory not found');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(readFileSync(backendPackageJsonPath, 'utf8'));
  const dependencies = getAllDependencies(packageJson);
  
  walkDirectory(backendSrcPath, dependencies);
  
  if (errors.length > 0) {
    console.error('\n❌ Dependency Import Validation Failed\n');
    for (const error of errors) {
      console.error(`  ${error.type.toUpperCase()}: ${error.file}:${error.line}`);
      console.error(`    ${error.message}`);
      if (error.fix) {
        console.error(`    Fix: ${error.fix}`);
      }
      console.error('');
    }
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:\n');
    for (const warning of warnings) {
      console.warn(`  ${warning.file}:${warning.line} - ${warning.message}`);
    }
  }
  
  console.log('✅ All imports match installed dependencies');
  process.exit(0);
}

main();

