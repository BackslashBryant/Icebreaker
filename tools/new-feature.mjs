#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const specsDir = path.join(repoRoot, 'specs');
const templatesDir = path.join(repoRoot, '.specify', 'templates');

function printHelp() {
  console.log(`Usage: npm run new-feature -- --title "Feature name" [--description "context"]\n\nCreates a Spec Kit-style feature folder with spec.md, plan.md, and tasks.md.\n`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { title: '', description: '' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--help') || (arg === '-h')) {
      printHelp();
      process.exit(0);
    }
    if (arg === '--title' && i + 1 < args.length) {
      options.title = args[++i];
    } else if (arg === '--description' && i + 1 < args.length) {
      options.description = args[++i];
    }
  }

  if (!options.title) {
    console.error('Missing required --title "Feature name"');
    printHelp();
    process.exit(1);
  }

  return options;
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function nextFeatureId() {
  if (!existsSync(specsDir)) {
    return '001';
  }
  const entries = readdirSync(specsDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && /^\d{3}-/.test(dir.name))
    .map((dir) => parseInt(dir.name.slice(0, 3), 10));

  const max = entries.length ? Math.max(...entries) : 0;
  return String(max + 1).padStart(3, '0');
}

function readTemplate(name, fallback) {
  const templatePath = path.join(templatesDir, name);
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf8');
  }
  return fallback;
}

function injectTitle(content, options) {
  return content
    .replace(/\{\{TITLE\}\}/g, options.title)
    .replace(/\{\{DESCRIPTION\}\}/g, options.description);
}

function main() {
  const options = parseArgs();
  const id = nextFeatureId();
  const slug = slugify(options.title) || 'feature';
  const featureDir = path.join(specsDir, `${id}-${slug}`);

  if (!existsSync(featureDir)) {
    mkdirSync(featureDir, { recursive: true });
  }

  const specTemplate = readTemplate('spec-template.md', '# Feature Specification\n\n## Overview\n{{DESCRIPTION}}\n');
  const planTemplate = readTemplate('plan-template.md', '# Implementation Plan\n\n- Step 1\n- Step 2\n');
  const tasksTemplate = readTemplate('tasks-template.md', '# Tasks\n\n- [ ] Todo\n');

  writeFileSync(path.join(featureDir, 'spec.md'), injectTitle(specTemplate, options));
  writeFileSync(path.join(featureDir, 'plan.md'), injectTitle(planTemplate, options));
  writeFileSync(path.join(featureDir, 'tasks.md'), injectTitle(tasksTemplate, options));

  console.log(`Created ${path.relative(repoRoot, featureDir)}`);
  console.log('Next steps:');
  console.log('- Flesh out spec.md with requirements and acceptance criteria.');
  console.log('- Update plan.md with architecture and validation details.');
  console.log('- Break down tasks.md and link a GitHub issue.');
}

main();