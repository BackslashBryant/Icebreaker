#!/usr/bin/env node

/**
 * Smoke test to validate persona rule glob patterns.
 * Tests that common file paths correctly match persona activation rules.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const rulesDir = path.join(repoRoot, '.cursor', 'rules');

// Test cases: [filePath, expectedPersona]
const testCases = [
  ['src/components/Button.tsx', 'link'],
  ['src/app/page.tsx', 'link'],
  ['app/components/Header.jsx', 'link'],
  ['pages/index.tsx', 'link'],
  ['components/Footer.tsx', 'link'],
  ['styles/main.css', 'link'],
  ['frontend/src/App.tsx', 'link'],
  ['web/index.html', 'link'],
  ['apps/web/app/page.tsx', 'link'],
  ['apps/web/pages/index.tsx', 'link'],
  ['apps/web/src/components/Button.tsx', 'link'],
  ['packages/ui/src/Button.tsx', 'link'],

  ['pwa/manifest.json', 'glide'],
  ['src/pwa/service-worker.js', 'glide'],
  ['src/public/sw.js', 'glide'],
  ['public/sw.js', 'glide'],
  ['sw.js', 'glide'],
  ['sw.ts', 'glide'],
  ['service-worker.js', 'glide'],
  ['service-worker.ts', 'glide'],
  ['app/mobile/index.tsx', 'glide'],
  ['apps/web/src/pwa/service-worker.ts', 'glide'],
  ['apps/web/public/manifest.json', 'glide'],
  ['packages/web/pwa/service-worker.js', 'glide'],

  ['api/users.ts', 'forge'],
  ['src/api/endpoints.ts', 'forge'],
  ['server/index.js', 'forge'],
  ['src/server/app.ts', 'forge'],
  ['db/schema.sql', 'forge'],
  ['migrations/001_init.sql', 'forge'],
  ['services/auth.ts', 'forge'],
  ['src/services/utils.ts', 'forge'],
  ['apps/server/src/index.ts', 'forge'],
  ['apps/api/src/routes.ts', 'forge'],
  ['packages/server/src/app.ts', 'forge'],
  ['packages/api/services/auth.ts', 'forge'],

  ['tests/unit/button.test.ts', 'pixel'],
  ['tests/integration/api.test.js', 'pixel'],
  ['playwright.config.ts', 'pixel'],
  ['jest.config.js', 'pixel'],
  ['vitest.config.ts', 'pixel'],
  ['cypress.config.js', 'pixel'],
  ['apps/web/tests/unit/app.test.ts', 'pixel'],
  ['packages/web/__tests__/header.test.tsx', 'pixel'],

  ['Docs/plans/Issue-21-plan-status.md', 'vector'],
  ['.notes/features/auth/spec.md', 'vector'],

  ['docs/README.md', 'muse'],
  ['docs/guides/getting-started.md', 'muse'],
  ['README.md', 'muse'],
  ['CHANGELOG.md', 'muse'],
  ['apps/docs/guide.md', 'muse'],
  ['packages/docs/release-notes.md', 'muse'],

  ['docs/research.md', 'scout'],
  ['docs/research/frameworks.md', 'scout'],

  ['docs/security/auth.md', 'sentinel'],
  ['security/audit.md', 'sentinel'],

  ['.github/workflows/ci.yml', 'nexus'],
  ['.ci/build.sh', 'nexus'],
  ['Dockerfile', 'nexus'],
  ['Dockerfile.prod', 'nexus'],
  ['deploy/scripts/deploy.sh', 'nexus'],
  ['env.example', 'nexus'],
  ['docs/github/README.md', 'nexus'],

  ['android/app/src/main/Activity.kt', 'apex'],
  ['android/build.gradle', 'apex'],

  ['ios/App/ContentView.swift', 'cider'],
  ['ios/App/App.swift', 'cider'],
];

function loadPersonaRules() {
  const personaFiles = readdirSync(rulesDir)
    .filter(f => f.startsWith('persona-') && f.endsWith('.mdc'));

  const rules = {};

  for (const file of personaFiles) {
    const filePath = path.join(rulesDir, file);
    const content = readFileSync(filePath, 'utf8');

    // Extract persona name from filename (persona-link.mdc -> link)
    const personaName = file.replace('persona-', '').replace('.mdc', '');

    // Extract globs from frontmatter
    const frontmatterMatch = content.match(/^globs:\s*\[(.*?)\]/ms);
    if (frontmatterMatch) {
      const globsStr = frontmatterMatch[1];
      // Parse globs array (handles quotes and newlines)
      const globs = globsStr
        .split(',')
        .map(g => g.trim().replace(/^["']|["']$/g, ''))
        .filter(g => g.length > 0);

      rules[personaName] = globs;
    }
  }

  return rules;
}

/**
 * Simple glob matcher for common patterns used in persona rules.
 * Supports: ** (any depth), * (single level), exact matches
 */
function matchGlob(filePath, glob) {
  // Normalize paths
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedGlob = glob.replace(/\\/g, '/');

  // Exact match
  if (normalizedPath === normalizedGlob) {
    return true;
  }

  // Convert glob to regex
  let regexStr = normalizedGlob
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '___DOUBLE_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE_STAR___/g, '.*');

  // Ensure full path match (anchored)
  if (!regexStr.startsWith('^')) {
    regexStr = '^' + regexStr;
  }
  if (!regexStr.endsWith('$')) {
    regexStr = regexStr + '$';
  }

  const regex = new RegExp(regexStr);
  return regex.test(normalizedPath);
}

function findMatchingPersonas(filePath, rules) {
  const matches = [];

  for (const [persona, globs] of Object.entries(rules)) {
    for (const glob of globs) {
      if (matchGlob(filePath, glob)) {
        matches.push(persona);
        break; // Only need one match per persona
      }
    }
  }

  return matches;
}

function main() {
  console.log('🧪 Testing persona activation globs...\n');

  const rules = loadPersonaRules();
  console.log(`Found ${Object.keys(rules).length} persona rules\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const [filePath, expectedPersona] of testCases) {
    const matches = findMatchingPersonas(filePath, rules);

    if (matches.includes(expectedPersona)) {
      passed++;
      console.log(`✅ ${filePath} → ${expectedPersona}`);
    } else {
      failed++;
      const actual = matches.length > 0 ? matches.join(', ') : 'none';
      failures.push({ filePath, expectedPersona, actual });
      console.log(`❌ ${filePath} → Expected: ${expectedPersona}, Got: ${actual}`);
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failures.length > 0) {
    console.log('\n❌ Failures:');
    for (const { filePath, expectedPersona, actual } of failures) {
      console.log(`   ${filePath}: expected ${expectedPersona}, got ${actual}`);
    }

    // Show which globs exist for failed personas
    console.log('\n💡 Debug info:');
    for (const { expectedPersona } of failures) {
      if (rules[expectedPersona]) {
        console.log(`   ${expectedPersona} globs:`, rules[expectedPersona]);
      }
    }

    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

main();
