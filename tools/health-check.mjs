#!/usr/bin/env node

/**
 * Health Dashboard - Comprehensive readiness status checker
 *
 * Checks all aspects of workspace setup and provides actionable next steps.
 * Usage:
 *   npm run status              # Human-readable output
 *   npm run status -- --json    # JSON output for CI
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const featuresDir = path.join(repoRoot, '.notes', 'features');
const featureStatePath = path.join(featuresDir, 'current.json');
const plansDir = path.join(repoRoot, 'Docs', 'plans');

function loadLocalEnv() {
  const envPath = path.join(repoRoot, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const checks = [];

// Status indicators
const STATUS = {
  READY: '[OK]',
  NEEDS_SETUP: '[!]',
  MISSING: '[X]',
};

const branchContext = getBranchContext();

function addCheck(category, name, status, message, fix = null) {
  checks.push({
    category,
    name,
    status,
    message,
    fix,
    ok: status === STATUS.READY,
  });
}

function checkNodeVersion() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0], 10);
    if (major >= 18) {
      addCheck(
        'Prerequisites',
        'Node.js',
        STATUS.READY,
        `Node.js ${version} detected`,
      );
    } else {
      addCheck(
        'Prerequisites',
        'Node.js',
        STATUS.MISSING,
        `Node.js ${version} detected (requires 18+)`,
        'Install Node.js 18+ from https://nodejs.org/',
      );
    }
  } catch {
    addCheck(
      'Prerequisites',
      'Node.js',
      STATUS.MISSING,
      'Node.js not found',
      'Install Node.js 18+ from https://nodejs.org/',
    );
  }
}

function checkNpm() {
  try {
    const version = execSync('npm --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    addCheck('Prerequisites', 'npm', STATUS.READY, `npm ${version} detected`);
  } catch {
    addCheck(
      'Prerequisites',
      'npm',
      STATUS.MISSING,
      'npm not found',
      'npm should come with Node.js. Reinstall Node.js if missing.',
    );
  }
}

function checkGit() {
  try {
    const gitDir = path.join(repoRoot, '.git');
    if (existsSync(gitDir)) {
      try {
        const remote = execSync('git config --get remote.origin.url', {
          cwd: repoRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        addCheck(
          'Repository',
          'Git Repository',
          STATUS.READY,
          `Git repository initialized (remote: ${remote})`,
        );
      } catch {
        addCheck(
          'Repository',
          'Git Repository',
          STATUS.NEEDS_SETUP,
          'Git repository initialized but no remote configured',
          'Run: git remote add origin <your-repo-url>',
        );
      }
    } else {
      addCheck(
        'Repository',
        'Git Repository',
        STATUS.NEEDS_SETUP,
        'Git repository not initialized',
        'Run: git init && git remote add origin <your-repo-url>',
      );
    }
  } catch {
    addCheck(
      'Repository',
      'Git Repository',
      STATUS.MISSING,
      'Git not found',
      'Install Git from https://git-scm.com/',
    );
  }
}

function checkEnvironmentVariables() {
  const requiredEnv = {
    GITHUB_TOKEN: {
      required: true,
      description: 'GitHub Personal Access Token for MCP servers',
      fix: 'Run: npm run setup:tokens',
    },
  };

  const optionalEnv = {
    SUPABASE_URL: {
      description: 'Supabase project URL (optional)',
      fix: 'Get from your Supabase project settings',
    },
    SUPABASE_ANON_KEY: {
      description: 'Supabase anonymous key (optional)',
      fix: 'Get from your Supabase project settings',
    },
  };

  // Check required
  for (const [varName, info] of Object.entries(requiredEnv)) {
    const value = process.env[varName];
    if (value) {
      // Validate token format
      const isValidFormat =
        value.startsWith('ghp_') ||
        value.startsWith('github_pat_') ||
        value.startsWith('gho_');
      if (isValidFormat) {
        addCheck(
          'Environment',
          varName,
          STATUS.READY,
          `${varName} is set (format validated)`,
        );
      } else {
        addCheck(
          'Environment',
          varName,
          STATUS.NEEDS_SETUP,
          `${varName} is set but format looks invalid`,
          info.fix,
        );
      }
    } else {
      addCheck(
        'Environment',
        varName,
        STATUS.MISSING,
        `${varName} is not set - ${info.description}`,
        info.fix,
      );
    }
  }

  // Check optional
  for (const [varName, info] of Object.entries(optionalEnv)) {
    const value = process.env[varName];
    if (value) {
      addCheck(
        'Environment',
        varName,
        STATUS.READY,
        `${varName} is set`,
      );
    } else {
      addCheck(
        'Environment',
        varName,
        STATUS.READY,
        `${varName} not set (optional)`,
      );
    }
  }
}

function checkMcpConfig() {
  const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');
  if (!existsSync(mcpConfigPath)) {
    addCheck(
      'MCP Configuration',
      'MCP Config File',
      STATUS.MISSING,
      '.cursor/mcp.json is missing',
      'Run: npm run setup',
    );
    return;
  }

  try {
    const config = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
    const servers = config?.mcpServers || {};

    // github MCP server is optional if we have desktop-commander or playwright-mcp (both use GITHUB_TOKEN)
    // Check if we have at least one server that uses GITHUB_TOKEN
    const hasGithubTokenServer = servers['desktop-commander'] || servers['playwright-mcp'] || 
                                  servers['desktop-commander-v2'] || servers['playwright-mcp-v2'];
    const requiredServers = hasGithubTokenServer 
      ? ['desktop-commander', 'playwright-mcp']  // github not required if we have token-using servers
      : ['github', 'desktop-commander', 'playwright-mcp'];  // require github if no token servers
    const configuredServers = Object.keys(servers);

    for (const serverName of requiredServers) {
      // Check for both old and new (-v2) names
      const hasServer = servers[serverName] || servers[`${serverName}-v2`];
      const actualName = servers[serverName] ? serverName : `${serverName}-v2`;
      
      if (hasServer) {
        const server = servers[actualName];
        const needsGithubToken = ['github', 'desktop-commander', 'playwright-mcp'].includes(serverName);
        const hasEnv = server?.env?.GITHUB_TOKEN;
        
        if (needsGithubToken && !hasEnv) {
          addCheck(
            'MCP Configuration',
            `MCP Server: ${actualName}`,
            STATUS.NEEDS_SETUP,
            `${actualName} missing env field for GITHUB_TOKEN`,
            'Run: npm run mcp:heal',
          );
        } else {
        addCheck(
          'MCP Configuration',
            `MCP Server: ${actualName}`,
          STATUS.READY,
            `${actualName} is configured`,
        );
        }
      } else {
        addCheck(
          'MCP Configuration',
          `MCP Server: ${serverName}`,
          STATUS.MISSING,
          `${serverName} is not configured`,
          'Run: npm run mcp:suggest -- --install all',
        );
      }
    }

    // Check for optional servers (including hosted Supabase)
    const optionalServers = ['supabase', 'playwright'];
    for (const serverName of optionalServers) {
      if (servers[serverName]) {
        const server = servers[serverName];
        // Hosted Supabase server (url-based) doesn't need env vars
        if (serverName === 'supabase' && server.url && server.url.includes('mcp.supabase.com')) {
          addCheck(
            'MCP Configuration',
            `MCP Server: ${serverName}`,
            STATUS.READY,
            `${serverName} is configured (hosted server - no env vars needed)`,
          );
        } else {
          addCheck(
            'MCP Configuration',
            `MCP Server: ${serverName}`,
            STATUS.READY,
            `${serverName} is configured (optional)`,
          );
        }
      }
    }

    // Check if MCP servers have environment variables set
    // Note: Hosted Supabase server doesn't need env vars
    const optionalMcpEnv = new Set(['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']);
    for (const [serverName, serverConfig] of Object.entries(servers)) {
      // Skip env check for hosted Supabase server
      if (serverName === 'supabase' && serverConfig.url && serverConfig.url.includes('mcp.supabase.com')) {
        continue;
      }
      
      const envVars = serverConfig?.env || {};
      for (const [envVar, envValue] of Object.entries(envVars)) {
        if (typeof envValue === 'string' && envValue.startsWith('${')) {
          const varName = envValue.replace(/^\$\{env:|env:|^\$\{|\}$/g, '');
          if (!process.env[varName]) {
            if (optionalMcpEnv.has(varName)) {
              addCheck(
                'MCP Configuration',
                `${serverName} -> ${envVar}`,
                STATUS.READY,
                `${envVar} not set (optional - only needed for legacy npm package)`,
              );
            } else if (serverName === 'sentry' && varName === 'SENTRY_AUTH_TOKEN') {
              // Sentry MCP can work without token if authenticated via Cursor UI
              addCheck(
                'MCP Configuration',
                `${serverName} -> ${envVar}`,
                STATUS.NEEDS_SETUP,
                `${envVar} not set (optional - Sentry MCP can authenticate via Cursor UI)`,
                `Set ${envVar} environment variable if needed for Node.js scripts: export ${envVar}=your_value`,
              );
            } else {
              addCheck(
                'MCP Configuration',
                `${serverName} -> ${envVar}`,
                STATUS.NEEDS_SETUP,
                `MCP server ${serverName} requires ${envVar} but it's not set`,
                `Set ${envVar} environment variable: export ${envVar}=your_value`,
              );
            }
          }
        }
      }
    }
  } catch (error) {
    addCheck(
      'MCP Configuration',
      'MCP Config File',
      STATUS.MISSING,
      `.cursor/mcp.json is invalid JSON: ${error instanceof Error ? error.message : error}`,
      'Fix the JSON syntax in .cursor/mcp.json',
    );
  }
}

function checkPreflight() {
  try {
    const result = execSync('npm run preflight', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // If preflight passes, it exits with 0
    addCheck(
      'Workflow Scaffolding',
      'Preflight Checks',
      STATUS.READY,
      'All preflight checks passing',
    );
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    addCheck(
      'Workflow Scaffolding',
      'Preflight Checks',
      STATUS.NEEDS_SETUP,
      'Some preflight checks failed',
      'Run: npm run preflight (see output above for details)',
    );
  }
}

function checkExtensions() {
  const extensionsPath = path.join(repoRoot, '.vscode', 'extensions.json');
  if (!existsSync(extensionsPath)) {
    addCheck(
      'Extensions',
      'Extensions Config',
      STATUS.MISSING,
      '.vscode/extensions.json is missing',
      'This file should exist in the template. Re-clone if missing.',
    );
    return;
  }

  try {
    const config = JSON.parse(readFileSync(extensionsPath, 'utf8'));
    const recommendations = config.recommendations || [];
    if (recommendations.length > 0) {
      addCheck(
        'Extensions',
        'Extensions Config',
        STATUS.READY,
        `${recommendations.length} recommended extensions listed`,
      );
      addCheck(
        'Extensions',
        'Extensions Installed',
        STATUS.READY,
        'Install recommended extensions in Cursor when convenient',
      );
    } else {
      addCheck(
        'Extensions',
        'Extensions Config',
        STATUS.NEEDS_SETUP,
        'No extensions recommended',
      );
    }
  } catch {
    addCheck(
      'Extensions',
      'Extensions Config',
      STATUS.MISSING,
      '.vscode/extensions.json is invalid',
      'Fix the JSON syntax in .vscode/extensions.json',
    );
  }
}

function checkFeatureWorkflow() {
  const featureState = getFeatureState();
  const fallbackIssue = featureState?.githubIssue;
  const fallbackSlug = featureState?.slug;
  const issueNumber = branchContext.issueNumber || fallbackIssue;
  const slug = branchContext.slug || fallbackSlug;

  if (!existsSync(featuresDir)) {
    addCheck(
      'Feature Workflow',
      'MVP Loop',
      STATUS.NEEDS_SETUP,
      '.notes/features missing',
      'Run: npm run feature:new',
    );
  } else {
    addCheck(
      'Feature Workflow',
      'MVP Loop',
      STATUS.READY,
      '.notes/features present',
    );
  }

  if (!featureState && !branchContext.issueNumber) {
    addCheck(
      'Feature Workflow',
      'Active Feature',
      STATUS.NEEDS_SETUP,
      'current.json missing and branch not in agent/<agent>/<issue>-<slug> format',
      'Run: npm run feature:new or switch to an agent/<agent>/<issue>-<slug> branch',
    );
  } else if (!featureState && branchContext.issueNumber) {
    addCheck(
      'Feature Workflow',
      'Active Feature',
      STATUS.READY,
      `Using branch context (${branchContext.branch}) for active issue tracking`,
    );
  } else if (!featureState) {
    addCheck(
      'Feature Workflow',
      'Active Feature',
      STATUS.NEEDS_SETUP,
      'current.json invalid',
      'Run: npm run feature:new',
    );
  } else if (!fallbackSlug) {
    addCheck(
      'Feature Workflow',
      'Active Feature',
      STATUS.NEEDS_SETUP,
      'current.json missing slug',
      'Re-run: npm run feature:new',
    );
  } else {
    addCheck(
      'Feature Workflow',
      'Active Feature',
      STATUS.READY,
      `current.json -> ${fallbackSlug}`,
    );
  }

  if (issueNumber) {
    const planPath = resolvePlanStatusPath(issueNumber);
    if (!planPath) {
      addCheck(
        'Feature Workflow',
        'Plan-Status File',
        STATUS.NEEDS_SETUP,
        `Plan-status file missing for Issue-${issueNumber}`,
        'Create/rename `Docs/plans/Issue-<issue>-plan-status-<STATUS>.md`',
      );
    } else {
      addCheck(
        'Feature Workflow',
        'Plan-Status File',
        STATUS.READY,
        path.basename(planPath),
      );
    }
  } else {
    addCheck(
      'Feature Workflow',
      'Plan-Status File',
      STATUS.READY,
      'No active issue detected (skipping plan validation)',
    );
  }

  if (slug) {
    const specPath = path.join(featuresDir, slug, 'spec.md');
    if (!existsSync(specPath)) {
      addCheck(
        'Feature Workflow',
        'Spec Reference',
        STATUS.READY,
        `Spec optional for slug ${slug} (file not found)`,
      );
    } else {
      const specText = readFileSync(specPath, 'utf8');
      if (!specText.includes('## MVP DoD')) {
        addCheck(
          'Feature Workflow',
          'Spec Reference',
          STATUS.NEEDS_SETUP,
          `${specPath} missing "## MVP DoD" section`,
          'Edit spec or re-run feature bootstrap',
        );
      } else {
        addCheck(
          'Feature Workflow',
          'Spec Reference',
          STATUS.READY,
          `Spec present for ${slug}`,
        );
      }
    }
  } else {
    addCheck(
      'Feature Workflow',
      'Spec Reference',
      STATUS.READY,
      'No feature slug detected for current branch',
    );
  }
}

function checkAgents() {
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

  const promptsDir = path.join(repoRoot, 'docs', 'agents', 'prompts');
  const missing = [];

  for (const agent of agents) {
    const promptPath = path.join(promptsDir, `${agent}.md`);
    if (!existsSync(promptPath)) {
      missing.push(agent);
    }
  }

  if (missing.length === 0) {
    addCheck(
      'Agents',
      'Agent Prompts',
      STATUS.READY,
      `All ${agents.length} agent prompts available`,
    );

    // Check for agent state file (users can create this manually after creating agents)
    const agentStatePath = path.join(repoRoot, '.cursor', 'agents-state.json');
    if (existsSync(agentStatePath)) {
      try {
        const state = JSON.parse(readFileSync(agentStatePath, 'utf8'));
        const createdAgents = state?.createdAgents || [];
        if (createdAgents.length >= agents.length) {
          addCheck(
            'Agents',
            'Agents Created',
            STATUS.READY,
            `All ${agents.length} agents created in Cursor (verified via state file)`,
          );
        } else {
          const missingAgents = agents.filter(a => !createdAgents.includes(a));
          addCheck(
            'Agents',
            'Agents Created',
            STATUS.READY,
            `${createdAgents.length}/${agents.length} saved agents configured (optional). Missing: ${missingAgents.join(', ')}.`,
          );
        }
      } catch {
        addCheck(
          'Agents',
          'Agents Created',
          STATUS.READY,
          'Saved agent state file exists but could not be read (optional feature).',
        );
      }
    } else {
      addCheck(
        'Agents',
        'Agents Created',
        STATUS.READY,
        'Auto-routing enabled. Saved agents are optional; run npm run setup:agents if you want them pinned in the sidebar.',
      );
    }
  } else {
    addCheck(
      'Agents',
      'Agent Prompts',
      STATUS.MISSING,
      `Missing prompts for: ${missing.join(', ')}`,
      'Re-clone the repository or restore missing prompt files',
    );
  }
}

function checkCursorSettings() {
  const settingsPath = path.join(repoRoot, '.vscode', 'settings.json');
  if (!existsSync(settingsPath)) {
    addCheck(
      'Cursor Settings',
      'Settings File',
      STATUS.MISSING,
      '.vscode/settings.json is missing',
      'This file should exist in the template. Re-clone if missing.',
    );
    return;
  }

  try {
    // VS Code/Cursor settings.json can have comments (JSONC format)
    // Strip comments before parsing
    let content = readFileSync(settingsPath, 'utf8');
    // Remove single-line comments (but preserve URLs)
    content = content.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove trailing commas before closing braces/brackets
    content = content.replace(/,(\s*[}\]])/g, '$1');

    const settings = JSON.parse(content);
    addCheck(
      'Cursor Settings',
      'Settings File',
      STATUS.READY,
      '.vscode/settings.json exists',
    );

    // Check for key settings that indicate proper configuration
    const keySettings = [
      'editor.formatOnSave',
      'files.trimTrailingWhitespace',
      'files.insertFinalNewline',
    ];
    const foundSettings = keySettings.filter(key => settings.hasOwnProperty(key));

    if (foundSettings.length === keySettings.length) {
      addCheck(
        'Cursor Settings',
        'Settings Applied',
        STATUS.READY,
        'Key workspace settings detected (may need Cursor IDE restart to apply)',
      );
    } else {
      addCheck(
        'Cursor Settings',
        'Settings Applied',
        STATUS.NEEDS_SETUP,
        'Settings may need to be configured in Cursor IDE',
        'Run: npm run setup:cursor (then restart Cursor IDE)',
      );
    }
  } catch (error) {
    addCheck(
      'Cursor Settings',
      'Settings File',
      STATUS.MISSING,
      `.vscode/settings.json is invalid JSON: ${error instanceof Error ? error.message : error}`,
      'Fix the JSON syntax in .vscode/settings.json',
    );
  }
}

function getContextualNextSteps() {
  const nextSteps = [];
  const failedChecks = checks.filter(c => !c.ok);

  // Priority-based next steps
  const priorityMap = {
    'GITHUB_TOKEN': 'Run: npm run setup:tokens',
    'MCP Config File': 'Run: npm run setup',
    'Preflight Checks': 'Run: npm run preflight (see details above)',
    'Settings Applied': 'Run: npm run setup:cursor',
    'Extensions Installed': 'Run: npm run setup:extensions',
  };

  // Find highest priority missing item
  for (const check of failedChecks) {
    if (priorityMap[check.name]) {
      nextSteps.push(priorityMap[check.name]);
      break; // Only show one priority action
    }
  }

  // Add contextual steps based on what's ready
  const hasTokens = checks.some(c => c.name === 'GITHUB_TOKEN' && c.ok);
  const hasAgents = checks.some(c => c.name === 'Agents Created' && c.ok);
  const hasFeature = checks.some(c => c.name === 'Current Feature' && c.ok);

  if (hasTokens && hasAgents && !hasFeature) {
    nextSteps.push('Run: npm run feature:new (to start your first feature)');
  } else if (hasTokens && hasAgents && hasFeature) {
    nextSteps.push('Continue with your active feature in Docs/plans/Issue-<#>-plan-status.md');
  }

  // If all setup is done, suggest workflow next steps
  if (failedChecks.length === 0) {
    nextSteps.push('Ready to code! See docs/agents/KICKOFF.md for workflow');
  }

  return nextSteps;
}

function printHuman() {
  console.log('\nCursor Workspace Health Dashboard');
  console.log('='.repeat(50));

  const categories = {};
  for (const check of checks) {
    if (!categories[check.category]) {
      categories[check.category] = [];
    }
    categories[check.category].push(check);
  }

  for (const [category, categoryChecks] of Object.entries(categories)) {
    console.log('');
    console.log(category + ':');
    for (const check of categoryChecks) {
      console.log('  ' + check.status + ' ' + check.name + ' - ' + check.message);
      if (check.fix) {
        console.log('    -> ' + check.fix);
      }
    }
  }

  const total = checks.length;
  const ready = checks.filter(c => c.ok).length;
  const needsSetup = checks.filter(c => !c.ok && c.status === STATUS.NEEDS_SETUP).length;
  const missing = checks.filter(c => c.status === STATUS.MISSING).length;

  console.log('');
  console.log('='.repeat(50));
  console.log('');
  console.log('Summary:');
  console.log('  Total checks: ' + total);
  console.log('  ' + STATUS.READY + ' Ready: ' + ready);
  console.log('  ' + STATUS.NEEDS_SETUP + ' Needs Setup: ' + needsSetup);
  console.log('  ' + STATUS.MISSING + ' Missing: ' + missing);

  // Contextual next steps
  const nextSteps = getContextualNextSteps();
  if (nextSteps.length > 0) {
    console.log('');
    console.log('Next Steps:');
    nextSteps.forEach((step, idx) => {
      console.log(`  ${idx + 1}. ${step}`);
    });
  }

  if (ready === total) {
    console.log('');
    console.log('All checks passed! Your workspace is ready to go.');
  } else if (missing === 0) {
    console.log('');
    console.log('Almost there! Follow the next steps above to finish setup.');
  } else {
    console.log('');
    console.log('Some critical items are missing. Address those first.');
  }
}

function printJson() {
  const summary = {
    ok: checks.every(c => c.ok),
    total: checks.length,
    ready: checks.filter(c => c.ok).length,
    needsSetup: checks.filter(c => !c.ok && c.status === STATUS.NEEDS_SETUP)
      .length,
    missing: checks.filter(c => c.status === STATUS.MISSING).length,
    checks: checks.map(c => ({
      category: c.category,
      name: c.name,
      status: c.status,
      message: c.message,
      fix: c.fix,
      ok: c.ok,
    })),
  };
  console.log(JSON.stringify(summary, null, 2));
}

function main() {
  // Run all checks
  checkNodeVersion();
  checkNpm();
  checkGit();
  checkEnvironmentVariables();
  checkMcpConfig();
  checkPreflight();
  checkExtensions();
  checkAgents();
  checkCursorSettings();
  checkFeatureWorkflow();

  // Output
  const rawArgs = process.argv.slice(2);
  const wantsJson = rawArgs.includes('--json') || rawArgs.includes('--ci');

  if (wantsJson) {
    printJson();
  } else {
    printHuman();
  }

  // Exit code based on overall status
  const allOk = checks.every(c => c.ok);
  process.exit(allOk ? 0 : 1);
}

try {
  main();
} catch (error) {
  console.error(
    'Health check failed:',
    error instanceof Error ? error.stack ?? error.message : error,
  );
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
    const entries = readdirSync(plansDir);
    const regex = new RegExp(`^Issue-${issueNumber}-plan-status-.*\\.md$`, 'i');
    const matches = entries.filter((file) => regex.test(file));
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
