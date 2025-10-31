#!/usr/bin/env node

/**
 * Interactive Setup Wizard
 *
 * One-command setup that handles entire onboarding experience.
 * Orchestrates detection, token setup, MCP config, and preflight checks.
 *
 * Usage:
 *   npm run setup
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPersonalConfig } from './lib/personal-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const setupStatePath = path.join(repoRoot, '.cursor', 'setup-state.json');
const personalConfig = loadPersonalConfig();
if (personalConfig?.githubToken && !process.env.GITHUB_TOKEN) {
  process.env.GITHUB_TOKEN = personalConfig.githubToken;
}
let autoMode = personalConfig?.autoSetupOnInstall === true;
if (process.env.CURSOR_AUTO_SETUP === 'true') {
  autoMode = true;
}
if (process.env.CURSOR_AUTO_SETUP === 'false') {
  autoMode = false;
}

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function prompt(rl, message, { autoAnswer = '' } = {}) {
  if (autoMode) {
    const cleaned = message.replace(/\s+/g, ' ').trim();
    const displayAnswer = autoAnswer === '' ? '(enter)' : autoAnswer;
    log(`[auto] ${cleaned} => ${displayAnswer}`, 'blue');
    return autoAnswer;
  }
  return question(rl, message);
}

function checkPrerequisite(command, name) {
  try {
    const version = execSync(`${command} --version`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return { found: true, version };
  } catch {
    return { found: false };
  }
}

function checkCursorInstallation() {
  // Check if Cursor CLI is available
  const cliCheck = checkPrerequisite('cursor', 'Cursor');
  if (cliCheck.found) {
    return { found: true, type: 'cli', version: cliCheck.version };
  }

  // Check common installation paths
  const platform = process.platform;
  const commonPaths = {
    win32: [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'cursor', 'Cursor.exe'),
      path.join(process.env.APPDATA || '', 'cursor', 'Cursor.exe'),
    ],
    darwin: ['/Applications/Cursor.app'],
    linux: [
      '/usr/bin/cursor',
      '/usr/local/bin/cursor',
      path.join(process.env.HOME || '', '.local', 'bin', 'cursor'),
    ],
  };

  const paths = commonPaths[platform] || [];
  for (const cursorPath of paths) {
    if (existsSync(cursorPath)) {
      return { found: true, type: 'installed', path: cursorPath };
    }
  }

  return { found: false };
}

async function runStep(rl, stepName, stepFunction) {
  log(`\n${stepName}...`, 'cyan');
  try {
    const result = await stepFunction(rl);
    if (result !== false) {
      log(`? ${stepName} completed`, 'green');
    }
    return result;
  } catch (error) {
    log(`??  ${stepName} had issues: ${error instanceof Error ? error.message : error}`, 'yellow');
    return false;
  }
}

async function step1_Prerequisites(rl) {
  log('\n? Checking Prerequisites\n', 'magenta');

  const checks = {
    node: checkPrerequisite('node', 'Node.js'),
    npm: checkPrerequisite('npm', 'npm'),
    git: checkPrerequisite('git', 'Git'),
    cursor: checkCursorInstallation(),
  };

  let allOk = true;

  // Node.js
  if (checks.node.found) {
    const major = parseInt(checks.node.version.split('.')[0], 10);
    if (major >= 18) {
      log(`  ? Node.js ${checks.node.version}`, 'green');
    } else {
      log(`  ??  Node.js ${checks.node.version} (requires 18+)`, 'yellow');
      allOk = false;
    }
  } else {
    log('  ? Node.js not found', 'red');
    log('     Install from: https://nodejs.org/', 'yellow');
    allOk = false;
  }

  // npm
  if (checks.npm.found) {
    log(`  ? npm ${checks.npm.version}`, 'green');
  } else {
    log('  ? npm not found', 'red');
    allOk = false;
  }

  // Git
  if (checks.git.found) {
    log(`  ? Git ${checks.git.version}`, 'green');
  } else {
    log('  ??  Git not found (optional but recommended)', 'yellow');
  }

  // Cursor
  if (checks.cursor.found) {
    log(`  ? Cursor IDE ${checks.cursor.type === 'cli' ? `(CLI: ${checks.cursor.version})` : 'installed'}`, 'green');
  } else {
    log('  ??  Cursor IDE not detected (install from: https://cursor.sh/)', 'yellow');
  }

  if (!allOk) {
    log('\n??  Some prerequisites are missing. Setup may not work correctly.', 'yellow');
    const proceed = await prompt(rl, 'Continue anyway? (y/N): ', {
      autoAnswer: autoMode ? 'n' : '',
    });
    if (proceed.toLowerCase() !== 'y') {
      return false;
    }
  }

  return true;
}

async function step2_ProjectDetection(rl) {
  log('\n? Detecting Project Configuration\n', 'magenta');

  try {
    const result = spawnSync('node', ['tools/detection.mjs', '--json'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    if (result.status === 0) {
      const detection = JSON.parse(result.stdout);
      log(`  ? Project Type: ${detection.projectType.type}`, 'blue');
      if (detection.githubRepo.detected) {
        log(`  ? GitHub Repo: ${detection.githubRepo.fullName}`, 'green');
      } else {
        log('  ??  No GitHub repo detected', 'yellow');
      }
      return detection;
    }
  } catch (error) {
    log('  ??  Detection failed, continuing anyway', 'yellow');
  }

  return null;
}

async function step3_TokenSetup(rl) {
  log('\n? Token Setup\n', 'magenta');

  const hasGitHubToken = !!process.env.GITHUB_TOKEN;
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;

  if (hasGitHubToken) {
    log('  ? GITHUB_TOKEN is set', 'green');
  } else {
    log('  ? GITHUB_TOKEN is not set', 'red');
    log('     This is required for GitHub MCP server', 'yellow');

    const setupToken = await prompt(rl, '\n  Set up GitHub token now? (Y/n): ', {
      autoAnswer: 'y',
    });
    if (setupToken.toLowerCase() !== 'n') {
      log('\n  Running token wizard...', 'cyan');
      try {
        spawnSync('node', ['tools/token-wizard.mjs'], {
          cwd: repoRoot,
          stdio: 'inherit',
        });
      } catch (error) {
        log('  ??  Token wizard had issues', 'yellow');
      }
    } else {
      log('  ??  Skipping token setup. Run `npm run setup:tokens` later.', 'yellow');
    }
  }

  if (hasSupabaseUrl && hasSupabaseKey) {
    log('  ? Supabase credentials are set', 'green');
  } else {
    log('  ??  Supabase credentials not set (optional)', 'yellow');
  }

  return true;
}

async function step4_McpConfiguration(rl) {
  log('\n? MCP Configuration\n', 'magenta');

  const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');
  if (!existsSync(mcpConfigPath)) {
    log('  ? .cursor/mcp.json not found', 'red');
    return false;
  }

  try {
    const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
    const servers = Object.keys(mcpConfig.mcpServers || {});
    log(`  ? ${servers.length} MCP servers configured`, 'green');

    // Check for MCP suggestions
    log('\n  Checking for MCP suggestions...', 'cyan');
    try {
      const result = spawnSync('node', ['tools/mcp-suggest.mjs', '--summary'], {
        cwd: repoRoot,
        encoding: 'utf8',
      });

      if (result.stdout && result.stdout.trim()) {
        console.log(result.stdout);
        const install = await prompt(
          rl,
          '\n  Install suggested MCPs? (y/N): ',
          { autoAnswer: 'y' },
        );
        if (install.toLowerCase() === 'y') {
          spawnSync('node', ['tools/mcp-suggest.mjs', '--install', 'all'], {
            cwd: repoRoot,
            stdio: 'inherit',
          });
        }
      } else {
        log('  ? No new MCP suggestions', 'green');
      }
    } catch (error) {
      log('  ??  MCP suggestion check failed', 'yellow');
    }
  } catch (error) {
    log('  ? Invalid MCP configuration', 'red');
    return false;
  }

  return true;
}

async function step5_PreflightChecks(rl) {
  log('\n? Preflight Checks\n', 'magenta');

  try {
    const result = spawnSync('npm', ['run', 'preflight'], {
      cwd: repoRoot,
      stdio: 'inherit',
    });

    if (result.status === 0) {
      log('\n  ? All preflight checks passed', 'green');
      return true;
    } else {
      log('\n  ??  Some preflight checks failed', 'yellow');
      log('     Review the output above and fix any issues', 'yellow');
      const proceed = await prompt(rl, '\n  Continue anyway? (y/N): ', {
        autoAnswer: autoMode ? 'n' : '',
      });
      return proceed.toLowerCase() === 'y';
    }
  } catch (error) {
    log('  ??  Preflight check failed', 'yellow');
    return false;
  }
}

async function step6_Extensions(rl) {
  log('\n? Extensions\n', 'magenta');

  const install = await prompt(
    rl,
    '  View extension installation guide? (Y/n): ',
    { autoAnswer: 'y' },
  );
  if (install.toLowerCase() !== 'n') {
    try {
      spawnSync('node', ['tools/cursor-extensions.mjs'], {
        cwd: repoRoot,
        stdio: 'inherit',
      });
    } catch (error) {
      // Ignore
    }
  }

  return true;
}

async function step7_Agents(rl) {
  log('\n? Agents\n', 'magenta');

  log('  Agents need to be created in Cursor IDE UI.', 'yellow');
  const viewGuide = await prompt(
    rl,
    '  Generate agent creation guide? (Y/n): ',
    { autoAnswer: 'y' },
  );
  if (viewGuide.toLowerCase() !== 'n') {
    try {
      spawnSync('node', ['tools/agent-helper.mjs'], {
        cwd: repoRoot,
        stdio: 'inherit',
      });
      log('\n  ? Guide generated: docs/agents/CREATE_AGENTS.md', 'green');
    } catch (error) {
      log('  ??  Failed to generate guide', 'yellow');
    }
  }

  return true;
}

async function step8_CursorSettings(rl) {
  log('\n??  Cursor Settings\n', 'magenta');

  const generate = await prompt(
    rl,
    '  Generate Cursor settings guide? (Y/n): ',
    { autoAnswer: 'y' },
  );
  if (generate.toLowerCase() !== 'n') {
    try {
      spawnSync('node', ['tools/cursor-settings-gen.mjs'], {
        cwd: repoRoot,
        stdio: 'inherit',
      });
      log('\n  ? Guide generated: docs/cursor/SETTINGS_GUIDE.md', 'green');
    } catch (error) {
      log('  ??  Failed to generate guide', 'yellow');
    }
  }

  return true;
}

function saveSetupState(results) {
  const stateDir = path.dirname(setupStatePath);
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  const state = {
    timestamp: new Date().toISOString(),
    completed: true,
    results,
  };

  writeFileSync(setupStatePath, JSON.stringify(state, null, 2), 'utf8');
}

function printCompletionReport(results) {
  log('\n' + '='.repeat(50), 'cyan');
  log('\nSetup Complete!\n', 'green');

  log('Summary:', 'cyan');
  log('  - Prerequisites checked');
  log('  - Project detection: ' + (results.detection ? 'ready' : 'pending'));
  log('  - Tokens configured: ' + (results.tokens ? 'yes' : 'no'));
  log('  - MCP servers configured: ' + (results.mcp ? 'yes' : 'no'));
  log('  - Preflight checks: ' + (results.preflight ? 'pass' : 'review results'));
  log('  - Extensions guide: ' + (results.extensions ? 'generated' : 'skipped'));
  log('  - Agents guide: ' + (results.agents ? 'generated' : 'skipped'));
  log('  - Cursor settings guide: ' + (results.settings ? 'generated' : 'skipped'));

  log('\nNext Steps:', 'cyan');
  log(' 1. Configure Cursor IDE settings (npm run setup:cursor).');
  log(' 2. Install recommended extensions (npm run setup:extensions).');
  log(' 3. Create Cursor agents (npm run setup:agents).');
  log(' 4. Verify setup (npm run status).');
  log(' 5. Bootstrap your feature (npm run feature:new).');
  log(' 6. Follow docs/process/MVP_LOOP.md for spec -> plan -> build.');

  log('\nQuick Commands:', 'cyan');
  log(' npm run status             - Check setup status');
  log(' npm run personal:bootstrap - Cache GitHub token & preferences');
  log(' npm run feature:new        - Scaffold a fresh MVP spec/plan');
  log(' npm run preset:webapp      - Restore the default health-check MVP');
  log(' npm run verify             - Run verification suite');

  log('\n' + '='.repeat(50) + '\n', 'cyan');
}

function main() {
  log('\n? Cursor Workspace Setup Wizard\n', 'magenta');
  log('='.repeat(50), 'cyan');
  log('This wizard will guide you through setting up your Cursor workspace.');
  log('Press Ctrl+C at any time to exit.\n');

  if (autoMode) {
    log('Running in hands-free mode (auto setup enabled).', 'cyan');
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const results = {};

  try {
    results.prerequisites = await runStep(rl, 'Step 1: Prerequisites', step1_Prerequisites);
    if (!results.prerequisites) {
      log('\n? Setup cancelled due to missing prerequisites.', 'red');
      rl.close();
      process.exit(1);
    }

    results.detection = await runStep(rl, 'Step 2: Project Detection', step2_ProjectDetection);

    results.tokens = await runStep(rl, 'Step 3: Token Setup', step3_TokenSetup);

    results.mcp = await runStep(rl, 'Step 4: MCP Configuration', step4_McpConfiguration);

    results.preflight = await runStep(rl, 'Step 5: Preflight Checks', step5_PreflightChecks);

    results.extensions = await runStep(rl, 'Step 6: Extensions', step6_Extensions);

    results.agents = await runStep(rl, 'Step 7: Agents', step7_Agents);

    results.settings = await runStep(rl, 'Step 8: Cursor Settings', step8_CursorSettings);

    saveSetupState(results);
    printCompletionReport(results);
  } catch (error) {
    log(`\n? Setup failed: ${error instanceof Error ? error.message : error}`, 'red');
    rl.close();
    process.exit(1);
  }

  rl.close();
}

main();

