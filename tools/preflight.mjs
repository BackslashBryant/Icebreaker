#!/usr/bin/env node

/**
 * Lightweight preflight that validates the Agent-first workflow scaffolding.
 * It keeps the repo stack-agnostic while ensuring the docs, prompts,
 * and optional guardrails are present and well formed.
 */

import { readFileSync, existsSync } from 'node:fs';
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

function addResult(name, ok, message) {
  results.push({ name, ok, message });
}

function readLines(filePath) {
  return readFileSync(filePath, 'utf8').split(/\r?\n/);
}

function checkPlanScaffold() {
  // Check for plan-status file if current feature exists
  const featureStatePath = path.join(featuresDir, 'current.json');
  if (existsSync(featureStatePath)) {
    try {
      const state = JSON.parse(readFileSync(featureStatePath, 'utf8'));
      const issueNumber = state?.githubIssue;
      if (issueNumber) {
        const planStatusPath = path.join(plansDir, `Issue-${issueNumber}-plan-status.md`);
        if (!existsSync(planStatusPath)) {
          addResult('Plan-status file', false, `Docs/plans/Issue-${issueNumber}-plan-status.md is missing`);
          return;
        }
        const lines = readLines(planStatusPath);
        const requiredHeadings = [
          '# Issue #',
          '## Research Summary',
          '## Goals & Success Metrics',
          '## Plan Steps',
          '## Current Status',
          '## Current Issues',
          '## Acceptance Tests',
        ];
        const missing = requiredHeadings.filter(heading => !lines.some(line => line.trim().startsWith(heading)));
        if (missing.length > 0) {
          addResult('Plan-status file', false, `Missing headings: ${missing.join(', ')}`);
          return;
        }
        addResult('Plan-status file', true, `Issue-${issueNumber}-plan-status.md structure valid`);
        return;
      }
    } catch (error) {
      // Fall through to legacy check
    }
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
      // CRITICAL: Check if .env file contains GITHUB_TOKEN (breaks GitHub CLI auth)
      try {
        const fs = require('fs');
        const envPath = path.join(repoRoot, '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.match(/^\s*GITHUB_TOKEN\s*=\s*.+$/m)) {
            addResult('GitHub Auth', false, 'CRITICAL: GITHUB_TOKEN found in .env file - this breaks GitHub CLI authentication! Remove it immediately.');
            hasErrors = true;
          }
        }
      } catch (error) {
        // Ignore errors
      }
      
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
  // CRITICAL: Check if .env file contains GITHUB_TOKEN (breaks GitHub CLI auth)
  try {
    const fs = require('fs');
    const envPath = path.join(repoRoot, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.match(/^\s*GITHUB_TOKEN\s*=\s*.+$/m)) {
        addResult('GitHub Auth', false, 'CRITICAL: GITHUB_TOKEN in .env breaks GitHub CLI! Remove it from .env file immediately.');
        hasErrors = true;
        return; // Don't check auth if .env has token
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  try {
    // Simple check: verify GitHub CLI is authenticated
    const output = execSync('gh auth status', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
      env: { ...process.env, GITHUB_TOKEN: undefined },
    });
    
    if (output.includes('Logged in') || output.includes('✓')) {
      addResult('GitHub auth', true, 'GitHub CLI authenticated');
    } else {
      addResult('GitHub auth', false, 'GitHub CLI not authenticated. Run: gh auth login');
      hasErrors = true;
    }
  } catch (error) {
    // GitHub CLI not installed or not authenticated
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stderr = error.stderr?.toString() || '';
    if (errorMsg.includes('GITHUB_TOKEN environment variable') || stderr.includes('GITHUB_TOKEN environment variable')) {
      addResult('GitHub Auth', false, 'CRITICAL: GITHUB_TOKEN env var blocking GitHub CLI! Clear it: $env:GITHUB_TOKEN = $null (PowerShell)');
      hasErrors = true;
    } else if (errorMsg.includes('not authenticated') || errorMsg.includes('not logged in')) {
      addResult('GitHub auth', false, 'GitHub CLI not authenticated. Run: gh auth login');
      hasErrors = true;
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

  if (!existsSync(featureStatePath)) {
    addResult('Feature workflow', false, 'current.json missing (run npm run feature:new)');
    return;
  }

  let state;
  try {
    state = JSON.parse(readFileSync(featureStatePath, 'utf8'));
  } catch (error) {
    addResult('Feature workflow', false, `current.json invalid JSON (${error instanceof Error ? error.message : error})`);
    return;
  }

  const slug = state?.slug;
  if (!slug) {
    addResult('Feature workflow', false, 'current.json missing slug property');
    return;
  }

  const specPath = path.join(featuresDir, slug, 'spec.md');
  if (!existsSync(specPath)) {
    addResult('Feature workflow', false, `Spec file missing for slug ${slug} (run npm run feature:new)`);
    return;
  }

  // Check for plan-status file if issue number is available
  const issueNumber = state?.githubIssue;
  if (issueNumber) {
    const planStatusPath = path.join(plansDir, `Issue-${issueNumber}-plan-status.md`);
    if (!existsSync(planStatusPath)) {
      addResult('Feature workflow', false, `Plan-status file missing: Docs/plans/Issue-${issueNumber}-plan-status.md`);
      return;
    }
  }

  const specText = readFileSync(specPath, 'utf8');
  if (!specText.includes('## MVP DoD')) {
    addResult('Feature workflow', false, `Spec ${specPath} missing "## MVP DoD" section`);
    return;
  }

  if (!specText.includes('- [ ]')) {
    addResult('Feature workflow', false, `Spec ${specPath} must contain unchecked MVP DoD checkboxes`);
    return;
  }

  addResult('Feature workflow', true, `Active feature detected (${slug})`);
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
