#!/usr/bin/env node

/**
 * Creates a GitHub Issue using one of the local templates.
 *
 * Usage:
 *   npm run github:issue -- kickoff "Improve onboarding flow"
 *   npm run github:issue -- bug "Health check returns 500"
 *   npm run github:issue -- from-spec    # Auto-create from current feature spec
 *
 * Requires:
 *   - GITHUB_TOKEN (repo scope)
 *   - GITHUB_REPO ("owner/name") or git remote origin pointing at GitHub
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCurrentFeature } from './lib/workflow-utils.mjs';
import { getRepo, createIssue } from './lib/github-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const issueTemplateDir = path.join(repoRoot, '.github', 'ISSUE_TEMPLATE');

const templateMap = {
  kickoff: {
    file: 'kickoff.md',
  },
  spec: {
    file: '0-spec.md',
  },
  '0-spec': {
    file: '0-spec.md',
  },
  research: {
    file: 'research.md',
  },
  security: {
    file: 'sentinel.md',
  },
  sentinel: {
    file: 'sentinel.md',
  },
  bug: {
    file: 'bug_report.md',
  },
  maintenance: {
    file: 'maintenance.md',
  },
};


function loadTemplateBody(templateFile) {
  const filePath = path.join(issueTemplateDir, templateFile);
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  if (lines[0] !== '---') {
    return raw.trim();
  }
  const endIndex = lines.indexOf('---', 1);
  if (endIndex === -1) {
    return raw.trim();
  }
  return lines.slice(endIndex + 1).join('\n').trim();
}


function deriveLabelsFromBody(body) {
  const output = new Set();
  const labelRegex = /^\s*-\s+\[(?: |x)\]\s+([^\n]+)/gm;
  const matches = body.matchAll(labelRegex);
  for (const match of matches) {
    const text = match[1];
    const agentMatch = text.match(/@([A-Za-z]+)/);
    if (agentMatch) {
      output.add(`agent:${agentMatch[1].toLowerCase()}`);
    }
  }
  return Array.from(output);
}

function loadSpecFromCurrentFeature() {
  const current = loadCurrentFeature();
  if (!current) {
    throw new Error('No active feature found. Run `npm run feature:new` first.');
  }

  const specPath = path.join(repoRoot, '.notes', 'features', current.slug, 'spec.md');
  if (!existsSync(specPath)) {
    throw new Error(`Spec file not found: ${specPath}`);
  }

  const specContent = readFileSync(specPath, 'utf8');

  // Extract title from spec (first line after #)
  const titleMatch = specContent.match(/^# Feature Spec: (.+)$/m);
  const title = titleMatch ? titleMatch[1] : current.featureName;

  // Convert spec to GitHub issue format
  const lines = specContent.split(/\r?\n/);
  const body = lines
    .filter(line => !line.startsWith('# Feature Spec:'))
    .filter(line => !line.match(/^- Slug:|^- Created:|^- Owner:/))
    .join('\n')
    .trim();

  return { title, body };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run github:issue -- <template> "<title>"');
    console.log('   or: npm run github:issue -- from-spec    # Auto-create from current feature');
    console.log('Templates:', Object.keys(templateMap).join(', '));
    process.exit(0);
  }

  const templateKey = args[0].toLowerCase();
  let title, body;

  // Special handling for from-spec
  if (templateKey === 'from-spec') {
    const specData = loadSpecFromCurrentFeature();
    title = `[SPEC] ${specData.title}`;
    body = specData.body;
  } else {
    title = args.slice(1).join(' ').trim();
    const template = templateMap[templateKey];
    if (!template) {
      throw new Error(`Unknown template "${templateKey}". Valid options: ${Object.keys(templateMap).join(', ')}`);
    }
    if (!title) {
      throw new Error('Provide an issue title in quotes after the template name.');
    }
    body = loadTemplateBody(template.file);
  }

  const templateLabels = [];
  if (templateKey !== 'from-spec') {
    const frontMatterPath = path.join(issueTemplateDir, templateMap[templateKey].file);
    if (existsSync(frontMatterPath)) {
      const raw = readFileSync(frontMatterPath, 'utf8');
      const labelMatch = raw.match(/labels:\s*\[(.*?)\]/);
      if (labelMatch) {
        const labels = labelMatch[1]
          .split(',')
          .map(label => label.replace(/["'\[\]]/g, '').trim())
          .filter(Boolean);
        templateLabels.push(...labels);
      }
    }
  } else {
    // Default labels for spec issues
    templateLabels.push('stage:spec', 'needs:plan');
  }

  const inferred = deriveLabelsFromBody(body);
  const labels = Array.from(new Set([...templateLabels, ...inferred]));

  const repo = getRepo();
  const result = await createIssue(repo, { title, body, labels });
  console.log(`Created issue #${result.number}: ${result.html_url}`);

  if (templateKey === 'from-spec') {
    console.log(`\nNext steps:`);
    console.log(`1. Update Docs/plans/Issue-${result.number}-plan-status.md with issue #${result.number}`);
    console.log(`2. Ask @Vector to refine the plan`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
