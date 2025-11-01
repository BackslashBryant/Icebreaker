#!/usr/bin/env node

/**
 * Creates a GitHub Pull Request from the current feature branch.
 *
 * Usage:
 *   npm run github:pr                 # Auto-create PR from current feature
 *   npm run github:pr -- --push       # Auto-create and push branch before PR
 *   npm run github:pr -- --dry-run    # Show payload without pushing or calling GitHub
 *   npm run github:pr -- "branch" "Title"
 *
 * Requires:
 *   - GITHUB_TOKEN (repo scope)
 *   - GITHUB_REPO ("owner/name") or git remote origin pointing at GitHub
 *   - Active feature branch checked out
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { loadCurrentFeature } from './lib/workflow-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function getToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('Set GITHUB_TOKEN (or GH_TOKEN) with repo scope before running this script.');
  }
  return token;
}

function parseRepoFromRemote(remote) {
  if (!remote) {
    throw new Error('Unable to determine GitHub repository. Set GITHUB_REPO=owner/name.');
  }
  const sshMatch = remote.match(/^git@github\.com:(.+?)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`;
  }
  const httpsMatch = remote.match(/^https:\/\/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`;
  }
  throw new Error(`Unrecognised GitHub remote format: ${remote}`);
}

function getRepo() {
  if (process.env.GITHUB_REPO) {
    return process.env.GITHUB_REPO;
  }
  try {
    const remote = execSync('git config --get remote.origin.url', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    return parseRepoFromRemote(remote);
  } catch (error) {
    throw new Error('Failed to read remote.origin.url. Set GITHUB_REPO=owner/name and retry.');
  }
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
  } catch {
    throw new Error('Failed to determine current branch. Ensure you are in a git repository.');
  }
}

function getBaseBranch() {
  try {
    // Try to detect default branch
    const remoteDefault = execSync('git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo refs/remotes/origin/main', {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
      shell: true,
    }).trim();
    const match = remoteDefault.match(/refs\/remotes\/origin\/(.+)/);
    return match ? match[1] : 'main';
  } catch {
    return 'main';
  }
}

function branchExistsRemote(branch) {
  try {
    const result = execSync(`git ls-remote --heads origin ${branch}`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    return result.length > 0;
  } catch {
    return false;
  }
}

function checkDoDComplete(specPath) {
  if (!existsSync(specPath)) {
    return { complete: false, reason: 'Spec file not found' };
  }

  const specContent = readFileSync(specPath, 'utf8');
  const dodMatch = specContent.match(/## MVP DoD\n([\s\S]*?)(?=\n## |$)/);
  if (!dodMatch) {
    return { complete: false, reason: 'MVP DoD section not found' };
  }

  const dodSection = dodMatch[1];
  const checkboxes = dodSection.match(/- \[(x|X)\]/g) || [];
  const unchecked = dodSection.match(/- \[ \]/g) || [];

  if (unchecked.length === 0 && checkboxes.length > 0) {
    return { complete: true, checked: checkboxes.length };
  }

  return {
    complete: false,
    reason: `${unchecked.length} unchecked items remaining`,
    checked: checkboxes.length,
    total: checkboxes.length + unchecked.length,
  };
}

function generatePRBody(currentFeature) {
  const specPath = path.join(repoRoot, '.notes', 'features', currentFeature.slug, 'spec.md');
  const progressPath = path.join(repoRoot, '.notes', 'features', currentFeature.slug, 'progress.md');

  let body = `## Summary\n\n`;
  body += `Implements feature: **${currentFeature.featureName}**\n\n`;
  body += `- Feature slug: \`${currentFeature.slug}\`\n`;
  body += `- Spec: \`.notes/features/${currentFeature.slug}/spec.md\`\n\n`;

  if (existsSync(specPath)) {
    const specContent = readFileSync(specPath, 'utf8');
    const problemMatch = specContent.match(/## Problem Statement\n(.+?)(?=\n## |$)/s);
    const outcomeMatch = specContent.match(/## Desired Outcome\n(.+?)(?=\n## |$)/s);

    if (problemMatch) {
      body += `### Problem\n${problemMatch[1].trim()}\n\n`;
    }
    if (outcomeMatch) {
      body += `### Outcome\n${outcomeMatch[1].trim()}\n\n`;
    }
  }

  const dodStatus = checkDoDComplete(specPath);
  if (dodStatus.complete) {
    body += `- **MVP DoD Complete** (${dodStatus.checked} items checked)

`;
  } else {
    body += `- **MVP DoD In Progress** (${dodStatus.checked || 0} of ${dodStatus.total || '?'} items)
`;
    body += `Reason: ${dodStatus.reason}

`;
  }

  if (existsSync(progressPath)) {
    body += `### Progress\n\n`;
    body += `See \`.notes/features/${currentFeature.slug}/progress.md\` for detailed status.\n\n`;
  }

  body += `## Checklist\n\n`;
  body += `- [ ] All MVP DoD items completed\n`;
  body += `- [ ] Tests passing (\`npm run verify\`)\n`;
  body += `- [ ] Preflight checks passing (\`npm run preflight\`)\n`;
  body += `- [ ] Documentation updated\n`;
  body += `- [ ] Ready for review\n\n`;

  body += `## Related\n\n`;
  body += `- Spec: \`.notes/features/${currentFeature.slug}/spec.md\`\n`;
  body += `- Plan: \`docs/Plan.md\`\n`;

  return body;
}

async function createPR({ repo, token, title, body, head, base }) {
  const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
  const endpoint = `${apiBase}/repos/${repo}/pulls`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cursor-agent-template',
    },
    body: JSON.stringify({
      title,
      body,
      head,
      base,
      draft: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes('--help') || rawArgs.includes('-h')) {
    console.log('Usage: npm run github:pr                 # Auto-create from current feature');
    console.log('       npm run github:pr -- --push       # Auto-create and push branch before PR');
    console.log('       npm run github:pr -- --dry-run    # Show payload without calling GitHub');
    console.log('       npm run github:pr -- <branch> "Title"');
    process.exit(0);
  }

  let autoPush = false;
  let dryRun = false;
  const positional = [];

  for (const arg of rawArgs) {
    if (arg === '--push') {
      autoPush = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--no-push') {
      autoPush = false;
    } else if (arg === '--') {
      continue;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length === 1) {
    throw new Error('Provide both branch and title when using manual mode.');
  }

  const token = getToken();
  const repo = getRepo();
  const currentBranch = getCurrentBranch();
  const baseBranch = getBaseBranch();

  let title;
  let body;
  let head;
  let currentFeature = null;

  if (positional.length >= 2) {
    head = positional[0];
    title = positional.slice(1).join(' ');
    body = `## Summary\n\n${title}\n\nSee PR template for details.`;
  } else {
    currentFeature = loadCurrentFeature();
    if (!currentFeature) {
      throw new Error('No active feature found. Run `npm run feature:new` first or provide branch and title.');
    }

    head = currentBranch;
    title = `[${currentFeature.slug}] ${currentFeature.featureName}`;
    body = generatePRBody(currentFeature);
  }

  const needsPush = !branchExistsRemote(head);

  if (dryRun) {
    console.log('[dry-run] Prepared PR payload:');
    console.log(`  Repo: ${repo}`);
    console.log(`  Base: ${baseBranch}`);
    console.log(`  Head: ${head}${needsPush ? ' (not pushed to origin)' : ''}`);
    console.log(`  Auto-push: ${autoPush ? 'enabled' : 'disabled'}`);
    console.log(`  Title: ${title}`);
    console.log('\n---\n');
    console.log(body);
    return;
  }

  if (autoPush) {
    try {
      execSync(`git push -u origin ${head}`, {
        cwd: repoRoot,
        stdio: 'inherit',
      });
    } catch (error) {
      throw new Error(`Failed to push branch "${head}" automatically. Push manually and rerun.`);
    }
  } else if (needsPush) {
    throw new Error(`Branch "${head}" is not on origin. Push with "git push -u origin ${head}" or rerun with --push.`);
  }

  const result = await createPR({ repo, token, title, body, head, base: baseBranch });
  console.log(`Created PR #${result.number}: ${result.html_url}`);

  if (currentFeature) {
    const specPath = path.join(repoRoot, '.notes', 'features', currentFeature.slug, 'spec.md');
    const dodStatus = checkDoDComplete(specPath);
    if (!dodStatus.complete) {
      console.log('\n[warn] MVP DoD is not complete. Continue working or mark items as done.');
    }
  }
}
main().catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
