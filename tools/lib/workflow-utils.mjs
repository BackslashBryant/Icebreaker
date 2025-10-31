#!/usr/bin/env node

/**
 * workflow-utils
 *
 * Shared helpers for feature automation (spec + plan generation).
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const notesDir = path.join(repoRoot, '.notes');
const featuresDir = path.join(notesDir, 'features');
const planPath = path.join(repoRoot, 'docs', 'Plan.md');
const currentPath = path.join(featuresDir, 'current.json');

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function loadCurrentFeature() {
  if (!existsSync(currentPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(currentPath, 'utf8'));
  } catch {
    return null;
  }
}

export function archiveCurrentFeature() {
  const current = loadCurrentFeature();
  if (!current) return;
  const { slug } = current;
  const featureDir = path.join(featuresDir, slug);
  if (!existsSync(featureDir)) {
    return;
  }
  const archiveDir = path.join(featuresDir, 'archive');
  ensureDir(archiveDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(archiveDir, `${slug}-${timestamp}`);
  mkdirSync(targetDir, { recursive: true });
  const files = readdirSync(featureDir);
  for (const file of files) {
    const src = path.join(featureDir, file);
    const dest = path.join(targetDir, file);
    const data = readFileSync(src);
    writeFileSync(dest, data);
  }
  rmSync(featureDir, { recursive: true, force: true });
  if (existsSync(currentPath)) {
    rmSync(currentPath, { force: true });
  }
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, contents, 'utf8');
}

export function writeCurrent({ slug, featureName }) {
  const payload = {
    slug,
    featureName,
    updatedAt: new Date().toISOString(),
  };
  ensureDir(featuresDir);
  writeFileSync(currentPath, JSON.stringify(payload, null, 2), 'utf8');
}

export function writeSpec({
  slug,
  featureName,
  targetUser,
  painPoint,
  outcome,
  mustHaves,
  niceToHaves,
  metrics,
}) {
  const specPath = path.join(featuresDir, slug, 'spec.md');
  const createdAt = new Date().toISOString();
  const normalizedMust = mustHaves.length > 0 ? mustHaves : ['Define at least one must-have deliverable'];
  const normalizedScope = niceToHaves.length > 0 ? niceToHaves : ['Keep backlog items here for later specs'];
  const normalizedMetrics = metrics.length > 0 ? metrics : ['Confirm MVP is usable end-to-end'];

  const content = `# Feature Spec: ${featureName}

- Slug: \`${slug}\`
- Created: ${createdAt}
- Owner: Solo (Cursor-assisted)

## Problem Statement
${painPoint}

## Target User
${targetUser}

## Desired Outcome
${outcome}

## Proposed Approach
- Vector will refine this with Docfork citations and a 3-5 step plan.
- Keep implementation agents focused on the MVP DoD below.

## MVP DoD
${normalizedMust.map(item => `- [ ] ${item}`).join('\n')}

## Success Metrics
${normalizedMetrics.map(item => `- ${item}`).join('\n')}

## Not Now (Out of scope)
${normalizedScope.map(item => `- ${item}`).join('\n')}

## Notes
- Generated via \`npm run feature:new\`.
- Update this file when the spec changes. Archive completed specs with the CLI.
`;

  writeFile(specPath, content);
  return specPath;
}

export function writeProgress({ slug, featureName }) {
  const progressPath = path.join(featuresDir, slug, 'progress.md');
  const content = `# Feature Progress - ${featureName}

| Stage | Owner | Status | Notes |
| --- | --- | --- | --- |
| Spec | Vector | TODO | Reference .notes/features/${slug}/spec.md |
| Plan | Vector / Pixel | TODO | Keep steps to 3-5 aligned with MVP DoD |
| Build | Implementers | TODO | Stop after MVP DoD is GREEN |
| Verify | Pixel | TODO | Record GREEN/RED with logs |
| Ship | Nexus | TODO | Release MVP, archive spec |
`;
  writeFile(progressPath, content);
  return progressPath;
}

export function writePlan({
  slug,
  featureName,
  targetUser,
  painPoint,
  outcome,
  mustHaves,
  niceToHaves,
  metrics,
}) {
  const planBody = `# Plan

_Active feature: **${featureName}** (\`${slug}\`)_
_Source spec: \`.notes/features/${slug}/spec.md\`_

## Goals
- GitHub Issue: #TBD
- Target User: ${targetUser}
- Problem: ${painPoint}
- Desired Outcome: ${outcome}
- Success Metrics:
${metrics.length > 0 ? metrics.map(item => `  - ${item}`).join('\n') : '  - Confirm MVP is usable end-to-end'}
- MVP Guardrail: Ship only the checklist in \`MVP DoD\` and defer everything else.

## Out-of-scope
${(niceToHaves.length > 0 ? niceToHaves : ['Create a new spec for additional scope']).map(item => `- ${item}`).join('\n')}

## Steps (3-7)
1. Vector - Finalize plan & cite research for the DoD.
2. Pixel - Scaffold tests for each MVP DoD item.
3. Implementers - Deliver the smallest slice to satisfy the DoD.
4. Pixel - Verify tests / report GREEN.
5. Muse - Update docs & release notes for the shipped MVP.
6. Nexus - Ensure CI/preview or release automation is GREEN.

## File targets
- \`.notes/features/${slug}/spec.md\`
- \`.notes/features/${slug}/progress.md\`
- \`docs/Plan.md\`
- Implementation directories referenced in the plan (add specifics as Vector refines).

## Acceptance tests
${mustHaves.length > 0 ? mustHaves.map(item => `- [ ] ${item}`).join('\n') : '- [ ] Define acceptance test with Pixel'}

## Owners
- Vector (planning, research citations)
- Pixel (tests & verification)
- Implementers (Forge/Link/Glide/Apex/Cider) as assigned
- Muse (docs)
- Nexus (CI/preview)
- Sentinel (only if plan calls for security review)

## Risks & Open questions
- Does anything block the MVP DoD? Capture blockers here.
- Record research links in \`docs/research.md\`.
`;

  writeFile(planPath, planBody);
  return planPath;
}

export function scaffoldFeature(options) {
  ensureDir(notesDir);
  ensureDir(featuresDir);

  const specPath = writeSpec(options);
  const progressPath = writeProgress(options);
  const plan = writePlan(options);
  writeCurrent({ slug: options.slug, featureName: options.featureName });

  return {
    specPath,
    progressPath,
    planPath: plan,
    currentPath,
  };
}

