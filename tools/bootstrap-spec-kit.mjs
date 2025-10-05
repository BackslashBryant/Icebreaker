#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(repoRoot, '.specify', 'templates');
const memoryDir = path.join(repoRoot, '.specify', 'memory');
const scriptsDir = path.join(repoRoot, '.specify', 'scripts');
const constitutionPath = path.join(memoryDir, 'constitution.md');

const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
  if (arg === '--force') options.force = true;
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Created ${path.relative(repoRoot, dir)}`);
  }
}

function ensureFile(filePath, defaultContent) {
  if (existsSync(filePath) && !options.force) {
    return;
  }
  writeFileSync(filePath, defaultContent, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, filePath)}`);
}

function readTemplate(name, fallback) {
  const candidate = path.join(templatesDir, name);
  if (existsSync(candidate)) {
    return readFileSync(candidate, 'utf8');
  }
  return fallback;
}

function main() {
  ensureDir(memoryDir);
  ensureDir(templatesDir);
  ensureDir(scriptsDir);

  const constitution = `# Project Constitution\n\n> Describe the principles that guide this project.\n\n- Vision: \n- Quality: \n- Constraints: \n- Success metrics: \n`;
  ensureFile(constitutionPath, constitution);

  const specTemplate = readTemplate('spec-template.md', `# Feature Specification\n\n## Overview\n(What problem are we solving?)\n\n## Requirements\n- \n- \n- \n\n## Risks\n- \n`);
  ensureFile(path.join(templatesDir, 'spec-template.md'), specTemplate);

  const planTemplate = readTemplate('plan-template.md', `# Implementation Plan\n\n## Approach\n- Step 1\n- Step 2\n\n## Validation\n- Automated: \n- Manual: \n`);
  ensureFile(path.join(templatesDir, 'plan-template.md'), planTemplate);

  const tasksTemplate = readTemplate('tasks-template.md', `# Task List\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n`);
  ensureFile(path.join(templatesDir, 'tasks-template.md'), tasksTemplate);

  console.log('\nSpec Kit scaffolding is ready. Run `npm run preflight` next to verify MCP configuration.');
}

main();