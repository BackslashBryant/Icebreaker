#!/usr/bin/env -S node --loader tsx
import { Octokit } from '@octokit/rest';
import path from 'node:path';
import fs from 'node:fs';
import { buildIssueBody, desiredLabels, issueTitleFor, parseTicketFile, readTicketFiles, ticketsDirectory } from './lib/tickets';

type RepoRef = { owner: string; repo: string };

function parseRepoArg(argv: string[]): RepoRef | null {
  const idx = argv.indexOf('--repo');
  if (idx >= 0 && argv[idx + 1]) {
    const [owner, repo] = argv[idx + 1].split('/');
    if (owner && repo) return { owner, repo };
  }
  return null;
}

function repoFromGitRemote(): RepoRef | null {
  try {
    const url = require('child_process').execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    // Handle SSH and HTTPS
    // git@github.com:owner/repo.git OR https://github.com/owner/repo.git
    const match = url.match(/github\.com[:\/]([^\/]+)\/([^\.]+)(?:\.git)?$/i);
    if (match) return { owner: match[1], repo: match[2] };
  } catch {}
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureLabels(octokit: Octokit, ref: RepoRef) {
  const desired = [
    { name: 'ticket', color: 'ededed', description: 'Local ticket file' },
    { name: 'status:in-progress', color: 'fbca04', description: 'Ticket in progress' },
    { name: 'priority:high', color: 'd73a4a', description: 'High priority ticket' },
    { name: 'priority:medium', color: '0e8a16', description: 'Medium priority ticket' },
    { name: 'priority:low', color: 'c2e0c6', description: 'Low priority ticket' },
  ];

  const { data: existing } = await octokit.rest.issues.listLabelsForRepo({ owner: ref.owner, repo: ref.repo, per_page: 100 });
  const existingNames = new Set(existing.map((l) => l.name));

  for (const lbl of desired) {
    if (!existingNames.has(lbl.name)) {
      await octokit.rest.issues.createLabel({ owner: ref.owner, repo: ref.repo, name: lbl.name, color: lbl.color, description: lbl.description });
      await sleep(200);
    }
  }
}

async function findIssueByTicketId(octokit: Octokit, ref: RepoRef, ticketId: string) {
  const q = `repo:${ref.owner}/${ref.repo} in:title "[${ticketId}]" state:open`;
  const resOpen = await octokit.rest.search.issuesAndPullRequests({ q, per_page: 10 });
  const openMatch = resOpen.data.items.find((i) => i.title.includes(`[${ticketId}]`));
  if (openMatch) return openMatch;
  const qClosed = `repo:${ref.owner}/${ref.repo} in:title "[${ticketId}]" state:closed`;
  const resClosed = await octokit.rest.search.issuesAndPullRequests({ q: qClosed, per_page: 10 });
  return resClosed.data.items.find((i) => i.title.includes(`[${ticketId}]`));
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const dryRun = process.argv.includes('--dry-run') ||
    process.env.npm_config_dry_run === 'true' ||
    process.env.npm_config_dry_run === '1' ||
    typeof process.env.npm_config_dry_run !== 'undefined';
  if (!token && !dryRun) {
    console.error('GITHUB_TOKEN is required (set env or rely on CI built-in). For a dry run, pass --dry-run.');
    process.exit(1);
  }
  const octokit = token ? new Octokit({ auth: token }) : new Octokit();

  let ref = parseRepoArg(process.argv);
  if (!ref) ref = repoFromGitRemote();
  if (!ref) {
    console.error('Unable to resolve repo. Pass --repo <owner/name> or set git remote origin.');
    process.exit(1);
  }

  const dir = ticketsDirectory();
  const files = readTicketFiles(dir);
  const parsed = files
    .map((f) => parseTicketFile(f))
    .filter((t): t is NonNullable<typeof t> => !!t);

  if (!dryRun) {
    await ensureLabels(octokit, ref);
  }

  const dryNotes: string[] = [];

  for (const t of parsed) {
    const title = issueTitleFor(t.frontmatter);
    const body = buildIssueBody(t);
    const labels = desiredLabels(t.frontmatter);
    const assignees = t.frontmatter.assignees ?? [];
    const stateDesired = t.frontmatter.status === 'Done' ? 'closed' : 'open';

    const found = await findIssueByTicketId(octokit, ref, t.frontmatter.id);

    if (!found) {
      dryNotes.push(`Create issue: ${title}`);
      if (!dryRun) {
        const created = await octokit.rest.issues.create({ owner: ref.owner, repo: ref.repo, title, body, labels, assignees });
        if (stateDesired === 'closed') {
          await octokit.rest.issues.update({ owner: ref.owner, repo: ref.repo, issue_number: created.data.number, state: 'closed' });
        }
        await sleep(300);
      }
      continue;
    }

    const number = found.number;
    const updates: Record<string, unknown> = {};
    if (found.title !== title) updates.title = title;
    // Compare body loosely (skip sync footer differences)
    if (!found.body || !found.body.includes('Synced from docs/tickets')) updates.body = body;
    // Labels
    const currentLabelNames = (found.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name));
    const desiredSet = new Set(labels);
    const currentSet = new Set(currentLabelNames);
    const labelsChanged = labels.length !== currentLabelNames.length || labels.some((l) => !currentSet.has(l));
    if (labelsChanged) updates.labels = labels;

    if (Object.keys(updates).length > 0) {
      dryNotes.push(`Update issue #${number}: ${Object.keys(updates).join(', ')}`);
      if (!dryRun) {
        await octokit.rest.issues.update({ owner: ref.owner, repo: ref.repo, issue_number: number, ...updates });
        await sleep(200);
      }
    }

    // State mapping
    if (stateDesired === 'closed' && found.state !== 'closed') {
      dryNotes.push(`Close issue #${number}`);
      if (!dryRun) {
        await octokit.rest.issues.update({ owner: ref.owner, repo: ref.repo, issue_number: number, state: 'closed' });
        await sleep(150);
      }
    }
    if (stateDesired === 'open' && found.state !== 'open') {
      dryNotes.push(`Reopen issue #${number}`);
      if (!dryRun) {
        await octokit.rest.issues.update({ owner: ref.owner, repo: ref.repo, issue_number: number, state: 'open' });
        await sleep(150);
      }
    }
  }

  // Update TICKET_PLAN.md table
  const planPath = path.join(process.cwd(), 'docs', 'tickets', 'TICKET_PLAN.md');
  let table = '# Ticket Plan\n\n| ID | Title | Status | Issue |\n|----|-------|--------|-------|\n';
  for (const t of parsed) {
    const issue = await findIssueByTicketId(octokit, ref, t.frontmatter.id);
    const issueCell = issue ? `[#${issue.number}](https://github.com/${ref.owner}/${ref.repo}/issues/${issue.number})` : '';
    table += `| ${t.frontmatter.id} | ${t.frontmatter.title} | ${t.frontmatter.status} | ${issueCell} |\n`;
    await sleep(50);
  }
  fs.writeFileSync(planPath, table, 'utf8');

  if (dryRun) {
    console.log('Dry-run summary:');
    for (const line of dryNotes) console.log(`- ${line}`);
  } else {
    console.log('Sync complete.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


