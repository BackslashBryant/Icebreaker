#!/usr/bin/env node

/**
 * Lightweight preflight that validates the Agent-first workflow scaffolding.
 * It keeps the repo stack-agnostic while ensuring the docs, prompts,
 * and optional guardrails are present and well formed.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectRepoMode } from './lib/repo-mode.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const planPath = path.join(repoRoot, 'docs', 'Plan.md');
const plansDir = path.join(repoRoot, 'Docs', 'plans');
const researchPath = path.join(repoRoot, 'docs', 'research.md');
const kickoffPath = path.join(repoRoot, 'docs', 'agents', 'KICKOFF.md');
const hookSamplePath = path.join(repoRoot, 'scripts', 'hooks', 'pre-commit.sample');
const labelsPath = path.join(repoRoot, 'docs', 'github', 'labels.json');
const issueTemplateDir = path.join(repoRoot, '.github', 'ISSUE_TEMPLATE');
const pullRequestTemplatePath = path.join(repoRoot, '.github', 'PULL_REQUEST_TEMPLATE.md');
const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');
const featuresDir = path.join(repoRoot, '.notes', 'features');
const featureStatePath = path.join(featuresDir, 'current.json');
const mvpGuidePath = path.join(repoRoot, 'docs', 'process', 'MVP_LOOP.md');

const agents = [
  'vector',
  'pixel',
  'forge',
  'link',
  'glide',
  'apex',
  'cider',
  'muse',
  'nexus',
  'scout',
  'sentinel',
];

const results = [];
const branchContext = getBranchContext();


function addResult(name, ok, message) {
  results.push({ name, ok, message });
}

function readLines(filePath) {
  return readFileSync(filePath, 'utf8').split(/\r?\n/);
}

function checkPlanScaffold() {
  const featureState = getFeatureState();
  const fallbackIssue = featureState?.githubIssue;
  const issueNumber = branchContext.issueNumber || fallbackIssue;

  if (issueNumber) {
    const planStatusPath = resolvePlanStatusPath(issueNumber);
    if (!planStatusPath) {
      addResult('Plan-status file', false, `Docs/plans/Issue-${issueNumber}-plan-status-<STATUS>.md is missing`);
      return;
    }
    const lines = readLines(planStatusPath);
    const requiredHeadings = [
      '# Issue #',
      '## Research Summary',
      '## Goals & Success Metrics',
      '## Plan Steps',
      '## Current Issues',
      '## Acceptance Tests',
    ];
    const missing = requiredHeadings.filter(heading => !lines.some(line => line.trim().startsWith(heading)));
    if (missing.length > 0) {
      addResult('Plan-status file', false, `Missing headings: ${missing.join(', ')}`);
      return;
    }
    addResult('Plan-status file', true, `${path.basename(planStatusPath)} structure valid`);
    return;
  }

  // Legacy check for docs/Plan.md (for backwards compatibility)
  if (existsSync(planPath)) {
    const lines = readLines(planPath);
    const requiredHeadings = [
      '# Plan',
      '## Goals',
      '## Out-of-scope',
      '## Steps (3-7)',
      '## File targets',
      '## Acceptance tests',
      '## Owners',
      '## Risks & Open questions',
    ];

    const missing = requiredHeadings.filter(heading => !lines.some(line => line.trim() === heading));
    if (missing.length > 0) {
      addResult('Plan.md', false, `Missing headings: ${missing.join(', ')}`);
      return;
    }

    if (!lines.some(line => line.includes('_Active feature'))) {
      addResult('Plan.md', false, 'Plan header must include `_Active feature` block (run npm run feature:new).');
      return;
    }

    if (!lines.some(line => line.includes('Source spec'))) {
      addResult('Plan.md', false, 'Plan must reference the generated spec path.');
      return;
    }

    addResult('Plan.md', true, 'All required headings present (legacy format)');
  } else {
    addResult('Plan.md', false, 'docs/Plan.md is missing (or use plan-status file)');
  }
}

function checkResearchLog() {
  if (!existsSync(researchPath)) {
    addResult('research.md', false, 'docs/research.md is missing');
    return;
  }

  const text = readFileSync(researchPath, 'utf8');
  const requiredSnippets = [
    '# Research Log',
    '## How to record',
    '## Checklist for each lookup',
    '## Example entry',
  ];

  const missing = requiredSnippets.filter(snippet => !text.includes(snippet));
  if (missing.length > 0) {
    addResult('research.md', false, `Missing sections: ${missing.join(', ')}`);
    return;
  }

  addResult('research.md', true, 'Research log scaffold ready');
}

function checkAgentPrompts() {
  const missing = agents.filter(agent => {
    const promptPath = path.join(repoRoot, 'docs', 'agents', 'prompts', `${agent}.md`);
    return !existsSync(promptPath);
  });

  if (missing.length > 0) {
    addResult('Agent prompts', false, `Missing prompt files for: ${missing.join(', ')}`);
    return;
  }

  addResult('Agent prompts', true, 'All prompts present');
}

function checkKickoff() {
  if (!existsSync(kickoffPath)) {
    addResult('Kickoff', false, 'docs/agents/KICKOFF.md is missing');
    return;
  }
  addResult('Kickoff', true, 'Kickoff + sanity test available');
}

function checkHookSample() {
  if (!existsSync(hookSamplePath)) {
    addResult('Path-scope hook', false, 'scripts/hooks/pre-commit.sample is missing');
    return;
  }
  addResult('Path-scope hook', true, 'Optional pre-commit hook found');
}

function checkGitHubLabels() {
  if (!existsSync(labelsPath)) {
    addResult('GitHub labels', false, 'docs/github/labels.json is missing');
    return;
  }
  try {
    const parsed = JSON.parse(readFileSync(labelsPath, 'utf8'));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      addResult('GitHub labels', false, 'docs/github/labels.json must be a non-empty array');
      return;
    }
    addResult('GitHub labels', true, 'Label catalog ready');
  } catch (error) {
    addResult('GitHub labels', false, `docs/github/labels.json is invalid JSON (${error instanceof Error ? error.message : error})`);
  }
}

function checkIssueTemplates() {
  const required = [
    '0-spec.md',
    '1-plan.md',
    '2-build.md',
    'kickoff.md',
    'bug_report.md',
    'research.md',
    'sentinel.md',
    'maintenance.md',
    'config.yml',
  ];
  if (!existsSync(issueTemplateDir)) {
    addResult('Issue templates', false, '.github/ISSUE_TEMPLATE directory is missing');
    return;
  }
  const missing = required.filter(file => !existsSync(path.join(issueTemplateDir, file)));
  if (missing.length > 0) {
    addResult('Issue templates', false, `Missing files: ${missing.join(', ')}`);
    return;
  }
  addResult('Issue templates', true, 'Spec/Plan/Build workflow templates available');
}

function checkPullRequestTemplate() {
  if (!existsSync(pullRequestTemplatePath)) {
    addResult('Pull request template', false, '.github/PULL_REQUEST_TEMPLATE.md is missing');
    return;
  }
  addResult('Pull request template', true, 'PR template present');
}

function checkMcpConfig() {
  if (!existsSync(mcpConfigPath)) {
    addResult('MCP config', false, '.cursor/mcp.json is missing');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
  } catch (error) {
    addResult('MCP config', false, `.cursor/mcp.json is invalid JSON (${error instanceof Error ? error.message : error})`);
    return;
  }

  const servers = parsed?.mcpServers;
  if (!servers || typeof servers !== 'object') {
    addResult('MCP config', false, '.cursor/mcp.json must export an object with "mcpServers"');
    return;
  }

  // Check for required servers (migrated from Smithery CLI to direct MCP servers)
  const requiredServers = ['desktop-commander', 'playwright-mcp'];
  const serverNames = Object.keys(servers);
  const hasRequired = requiredServers.some(name => 
    serverNames.includes(name) || serverNames.includes(`${name}-v2`)
  );
  
  if (!hasRequired) {
    addResult('MCP config', false, `Missing required MCP servers. Run: npm run mcp:heal`);
    return;
  }

  // Check for missing env fields
  const githubTokenServers = ['desktop-commander', 'desktop-commander-v2', 'playwright-mcp', 'playwright-mcp-v2'];
  let missingEnv = false;
  for (const serverName of serverNames) {
    const server = servers[serverName];
    if (githubTokenServers.some(name => serverName.includes(name.replace('-v2', '')))) {
      if (!server.env || !server.env.GITHUB_TOKEN) {
        missingEnv = true;
        break;
      }
    }
  }

  if (missingEnv) {
    addResult('MCP config', false, 'Some servers missing env fields. Run: npm run mcp:heal');
    return;
  }

  addResult('MCP config', true, 'Core MCP servers configured');
}

function checkGitHubToken() {
  try {
    // Simple check: verify GitHub CLI is authenticated
    const output = execSync('gh auth status', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000
    });
    
    if (output.includes('Logged in') || output.includes('✓')) {
      addResult('GitHub auth', true, 'GitHub CLI authenticated');
    } else {
      addResult('GitHub auth', false, 'GitHub CLI not authenticated. Run: gh auth login');
    }
  } catch (error) {
    // GitHub CLI not installed or not authenticated
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('not authenticated') || errorMsg.includes('not logged in')) {
      addResult('GitHub auth', false, 'GitHub CLI not authenticated. Run: gh auth login');
    } else {
      addResult('GitHub auth', true, 'GitHub CLI check skipped (CLI may not be installed)');
    }
  }
}

function checkCursorDocs() {
  const requiredDocs = [
    path.join(repoRoot, 'docs', 'cursor', 'extensions.md'),
    path.join(repoRoot, 'docs', 'cursor', 'symbols.md'),
    path.join(repoRoot, 'docs', 'cursor', 'agent-tools.md'),
    path.join(repoRoot, 'docs', 'cursor', 'agent-browser.md'),
    path.join(repoRoot, 'docs', 'cursor', 'agent-hooks.md'),
    path.join(repoRoot, 'docs', 'cursor', 'models.md'),
  ];

  const missing = requiredDocs.filter(docPath => !existsSync(docPath));
  if (missing.length > 0) {
    const friendly = missing.map(p => path.relative(repoRoot, p)).join(', ');
    addResult('Cursor docs', false, `Missing documentation: ${friendly}`);
    return;
  }

  addResult('Cursor docs', true, 'Cursor-specific guides available');
}

function checkFeatureWorkflow() {
  if (!existsSync(featuresDir)) {
    addResult('Feature workflow', false, '.notes/features directory missing (run npm run feature:new)');
    return;
  }

  const featureState = getFeatureState();
  const fallbackSlug = featureState?.slug;
  const fallbackIssue = featureState?.githubIssue;
  const issueNumber = branchContext.issueNumber || fallbackIssue;
  const slug = branchContext.slug || fallbackSlug;

  if (!featureState && !branchContext.issueNumber) {
    addResult('Feature workflow', false, 'No active feature detected (create via npm run feature:new or use agent/<agent>/<issue>-<slug> branch)');
    return;
  }

  if (issueNumber) {
    const planStatusPath = resolvePlanStatusPath(issueNumber);
    if (!planStatusPath) {
      addResult('Feature workflow', false, `Plan-status file missing for Issue-${issueNumber}`);
      return;
    }
  }

  if (slug) {
    const specPath = path.join(featuresDir, slug, 'spec.md');
    if (existsSync(specPath)) {
      const specText = readFileSync(specPath, 'utf8');
      if (!specText.includes('## MVP DoD')) {
        addResult('Feature workflow', false, `Spec ${specPath} missing "## MVP DoD" section`);
        return;
      }
      if (!specText.includes('- [ ]')) {
        addResult('Feature workflow', false, `Spec ${specPath} must contain unchecked MVP DoD checkboxes`);
        return;
      }
      addResult('Feature workflow', true, `Spec ready for ${slug}`);
      return;
    }
    addResult('Feature workflow', true, `Spec optional for slug ${slug} (file not found)`);
    return;
  }

  addResult('Feature workflow', true, 'Branch not tied to a feature slug (skipping spec check)');
}

function checkMvpGuide() {
  if (!existsSync(mvpGuidePath)) {
    addResult('MVP loop guide', false, 'docs/process/MVP_LOOP.md missing');
    return;
  }
  addResult('MVP loop guide', true, 'Solo-dev loop documented');
}

function checkRepoMode() {
  const mode = detectRepoMode();
  const cursorDir = path.join(repoRoot, '.cursor');
  const cursorIgnorePath = path.join(repoRoot, '.cursorignore');
  const repoModeFile = path.join(repoRoot, '.repo-mode');

  // Check if repo looks like an app but is in template mode
  if (mode === 'template' && !existsSync(repoModeFile)) {
    // No explicit .repo-mode file, check package.json
    const packageJsonPath = path.join(repoRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const name = (packageJson.name || '').toLowerCase();
        const description = (packageJson.description || '').toLowerCase();
        
        // If package.json doesn't contain "template", this is likely an app repo
        if (!name.includes('template') && !description.includes('template')) {
          addResult(
            'Repo mode',
            false,
            'Template mode detected but repo appears to be an app. Run: npm run convert:app'
          );
          return;
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
  }

  if (mode === 'app') {
    // In app mode, check if .cursor/ is being tracked
    if (existsSync(cursorDir)) {
      // Check if .cursorignore exists (should be allowed)
      if (!existsSync(cursorIgnorePath)) {
        addResult('Repo mode', false, 'App mode: .cursorignore should exist (app-specific Cursor config)');
        return;
      }
      // Warn if .cursor/ has tracked files (other than what should be ignored)
      addResult('Repo mode', true, `App mode: Cursor files should be ignored (except .cursorignore)`);
      return;
    }
    addResult('Repo mode', true, 'App mode: No .cursor/ directory (correct)');
    return;
  }

  // Template mode: .cursor/ should exist
  if (!existsSync(cursorDir)) {
    addResult('Repo mode', false, 'Template mode: .cursor/ directory missing');
    return;
  }
  addResult('Repo mode', true, `Template mode: Cursor files tracked`);
}

function checkBranchNaming() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      cwd: repoRoot, 
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    
    // Skip check for main/master branches (allow direct work on main for template updates)
    if (branch === 'main' || branch === 'master') {
      addResult('Branch naming', true, `On ${branch} (main branch - allowed)`);
      return;
    }
    
    // Check format: agent/<agent>/<issue>-<slug> or feat/<issue>-<slug>
    const validPattern = /^(agent\/\w+\/\d+-[\w-]+|feat\/\d+-[\w-]+)$/;
    if (validPattern.test(branch)) {
      addResult('Branch naming', true, `Branch "${branch}" matches required format`);
      return;
    }
    
    addResult('Branch naming', false, `Branch "${branch}" does not match required format: agent/<agent>/<issue>-<slug> or feat/<issue>-<slug> (e.g., agent/vector/1-onboarding-flow)`);
  } catch (error) {
    // Git not initialized or other error - skip check
    addResult('Branch naming', true, 'Git branch check skipped (not a git repo or git unavailable)');
  }
}

function checkDependencies() {
  try {
    execSync('node tools/check-dependencies.mjs', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    addResult('Dependency imports', true, 'All imports match installed dependencies');
  } catch (error) {
    const output = (error.stdout || error.stderr || '').toString();
    const errorLines = output.split('\n').filter(line => line.trim()).slice(0, 3);
    addResult('Dependency imports', false, 'Some imports reference missing dependencies', errorLines.join('; '));
  }
}

function checkDates() {
  try {
    // Check only changed files for speed (staged + unstaged)
    // Full scan happens in pre-commit hook or when explicitly requested
    const output = execSync('node tools/check-dates.mjs --changed --json', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const result = JSON.parse(output);
    if (result.ok) {
      addResult('Date validation', true, 'No placeholder dates found in changed files');
    } else {
      const violationCount = result.violations?.length || 0;
      const fileCount = new Set(result.violations?.map(v => v.file) || []).size;
      const violations = result.violations?.slice(0, 3).map(v => `${v.file}:${v.line}`).join(', ') || '';
      const more = violationCount > 3 ? ` and ${violationCount - 3} more` : '';
      addResult('Date validation', false, `Found placeholder dates in ${fileCount} changed file(s) (use Time MCP)${violations ? `: ${violations}${more}` : ''}`);
    }
  } catch (error) {
    // If check-dates.mjs fails, it means violations were found
    const output = (error.stdout || error.stderr || '').toString();
    try {
      const result = JSON.parse(output);
      const violationCount = result.violations?.length || 0;
      const fileCount = new Set(result.violations?.map(v => v.file) || []).size;
      const violations = result.violations?.slice(0, 3).map(v => `${v.file}:${v.line}`).join(', ') || '';
      const more = violationCount > 3 ? ` and ${violationCount - 3} more` : '';
      addResult('Date validation', false, `Found placeholder dates in ${fileCount} changed file(s) (use Time MCP)${violations ? `: ${violations}${more}` : ''}`);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      addResult('Date validation', false, 'Placeholder dates detected in changed files (use Time MCP)');
    }
  }
}

function main() {
  checkPlanScaffold();
  checkResearchLog();
  checkAgentPrompts();
  checkKickoff();
  checkHookSample();
  checkGitHubLabels();
  checkIssueTemplates();
  checkPullRequestTemplate();
  checkMcpConfig();
  checkGitHubToken();
  checkCursorDocs();
  checkFeatureWorkflow();
  checkMvpGuide();
  checkRepoMode();
  checkBranchNaming();
  checkDependencies();
  checkDates();

  const rawArgs = process.argv.slice(2);
  const wantsJson = rawArgs.includes('--json') || rawArgs.includes('--ci');

  if (wantsJson) {
    const payload = results.map(result => ({
      check: result.name,
      ok: result.ok,
      message: result.message,
    }));
    console.log(JSON.stringify({ ok: results.every(r => r.ok), results: payload }, null, 2));
  } else {
    for (const result of results) {
      const status = result.ok ? 'PASS' : 'FAIL';
      console.log(`${status}  ${result.name} - ${result.message}`);
    }
  }

  const ok = results.every(result => result.ok);
  process.exit(ok ? 0 : 1);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
}
function getBranchContext() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const match = branch.match(/^agent\/[^/]+\/(\d+)-(.+)$/);
    if (match) {
      return {
        branch,
        issueNumber: Number(match[1]),
        slug: match[2],
      };
    }
    return { branch };
  } catch {
    return { branch: null };
  }
}

function getFeatureState() {
  if (!existsSync(featureStatePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(featureStatePath, 'utf8'));
  } catch {
    return null;
  }
}

function resolvePlanStatusPath(issueNumber) {
  if (!issueNumber || !existsSync(plansDir)) {
    return null;
  }
  try {
    const files = readdirSync(plansDir);
    const regex = new RegExp(`^Issue-${issueNumber}-plan-status-.*\\.md$`, 'i');
    const matches = files.filter((file) => regex.test(file));
    if (matches.length === 0) {
      return null;
    }
    const priority = ['IN-PROGRESS', 'COMPLETE', 'BLOCKED', 'CANCELLED'];
    matches.sort((a, b) => {
      const aIdx = priority.findIndex((label) => a.includes(label));
      const bIdx = priority.findIndex((label) => b.includes(label));
      return (aIdx === -1 ? priority.length : aIdx) - (bIdx === -1 ? priority.length : bIdx);
    });
    return path.join(plansDir, matches[0]);
  } catch {
    return null;
  }
}
