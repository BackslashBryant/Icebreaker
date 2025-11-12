#!/usr/bin/env node

/**
 * Syncs GitHub labels with docs/github/labels.json.
 * Requires a personal access token with repo scope.
 *
 * Usage:
 *   GITHUB_TOKEN=... npm run github:labels
 * Optional: set GITHUB_REPO="owner/name"
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRepo, githubApiRequest } from './lib/github-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const labelsPath = path.join(repoRoot, 'docs', 'github', 'labels.json');

function readLabels() {
  return JSON.parse(readFileSync(labelsPath, 'utf8'));
}


async function fetchAllLabels(repo) {
  const all = [];
  let page = 1;
  while (true) {
    const data = await githubApiRequest(`/repos/${repo}/labels?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }
    all.push(...data);
    if (data.length < 100) {
      break;
    }
    page += 1;
  }
  return all;
}

async function main() {
  const repo = getRepo();
  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    throw new Error(`Invalid GITHUB_REPO value: ${repo}`);
  }

  const desiredLabels = readLabels();
  const existing = await fetchAllLabels(repo);
  const existingMap = new Map(existing.map(label => [label.name.toLowerCase(), label]));

  for (const label of desiredLabels) {
    const payload = {
      name: label.name,
      color: label.color.replace(/^#/, ''),
      description: label.description ?? '',
    };
    const key = label.name.toLowerCase();
    const endpoint = `/repos/${repo}/labels/${encodeURIComponent(label.name)}`;

    if (existingMap.has(key)) {
      await githubApiRequest(endpoint, {
        method: 'PATCH',
        body: payload,
      });
      console.log(`Updated label ${label.name}`);
    } else {
      await githubApiRequest(`/repos/${repo}/labels`, {
        method: 'POST',
        body: payload,
      });
      console.log(`Created label ${label.name}`);
    }
  }

  console.log('Label sync complete.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
