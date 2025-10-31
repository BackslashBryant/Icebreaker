#!/usr/bin/env node

/**
 * Converts repository from template mode to app mode
 * This prevents Cursor-specific files from being committed to app repositories
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setRepoMode, detectRepoMode } from './lib/repo-mode.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gitignorePath = path.join(repoRoot, '.gitignore');

function updateGitignore() {
  if (!existsSync(gitignorePath)) {
    console.warn('Warning: .gitignore not found, creating it');
    writeFileSync(gitignorePath, '', 'utf8');
  }

  let content = readFileSync(gitignorePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let needsUpdate = false;
  let newLines = [];

  // Check if .cursor/* is already active (uncommented)
  const hasActiveCursorIgnore = lines.some(line => {
    const trimmed = line.trim();
    return trimmed === '.cursor/*' && !trimmed.startsWith('#');
  });

  if (hasActiveCursorIgnore) {
    // Already configured for app mode
    return false;
  }

  // Process each line, looking for commented Cursor logic section
  let foundCursorSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Find the Cursor logic files section
    if (trimmed.includes('Cursor logic files')) {
      foundCursorSection = true;
      newLines.push(line);
      continue;
    }

    // Uncomment the .cursor/* and !.cursorignore lines
    if (foundCursorSection && (trimmed === '# .cursor/*' || trimmed === '# !.cursorignore')) {
      newLines.push(line.replace(/^(\s*)#\s*(.+)$/, '$1$2'));
      needsUpdate = true;
      continue;
    }

    // Stop at the next section (after Cursor logic section comments)
    if (foundCursorSection && trimmed.startsWith('# ') && !trimmed.includes('Cursor') && !trimmed.includes('Run')) {
      foundCursorSection = false;
    }

    newLines.push(line);
  }

  // If we didn't find commented lines but section exists, add them
  if (!needsUpdate && lines.some(line => line.includes('Cursor logic files'))) {
    // Find where to insert (after "# When repo is in app mode" comment)
    let insertIndex = -1;
    for (let i = 0; i < newLines.length; i++) {
      if (newLines[i].includes('Run `npm run convert:app`')) {
        insertIndex = i;
        break;
      }
    }
    if (insertIndex >= 0) {
      newLines.splice(insertIndex, 0, '.cursor/*', '!.cursorignore');
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    writeFileSync(gitignorePath, newLines.join('\n'), 'utf8');
    return true;
  }

  return false;
}

async function main() {
  const currentMode = detectRepoMode();

  if (currentMode === 'app') {
    console.log('Repository is already in app mode.');
    return;
  }

  console.log('Converting repository from template mode to app mode...');
  console.log('');

  // Set repo mode
  await setRepoMode('app');
  console.log('✓ Set repository mode to "app"');

  // Update .gitignore
  const gitignoreUpdated = updateGitignore();
  if (gitignoreUpdated) {
    console.log('✓ Updated .gitignore to ignore .cursor/ directory (except .cursorignore)');
  } else {
    console.log('ℹ .gitignore already configured for app mode');
  }

  console.log('');
  console.log('Conversion complete!');
  console.log('');
  console.log('Changes:');
  console.log('  - Repository mode set to "app" (.repo-mode)');
  console.log('  - .gitignore updated to block .cursor/ files');
  console.log('  - Pre-commit hook will now block .cursor/ commits');
  console.log('');
  console.log('Note: .cursorignore will still be tracked (it\'s app-specific config).');
  console.log('All other .cursor/ files are now ignored and blocked from commits.');
  console.log('');
  console.log('To revert to template mode, delete .repo-mode and update .gitignore.');
}

try {
  main();
} catch (error) {
  console.error('Error converting to app mode:', error instanceof Error ? error.message : error);
  process.exit(1);
}
