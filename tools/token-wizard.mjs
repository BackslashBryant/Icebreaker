#!/usr/bin/env node

/**
 * GitHub Token Wizard - Interactive guide for GitHub token creation
 *
 * Guides users through creating and configuring a GitHub Personal Access Token
 * for use with Cursor MCP servers.
 *
 * Usage:
 *   npm run setup:tokens
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPersonalConfig, savePersonalConfig } from './lib/personal-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const personalConfig = loadPersonalConfig();

if (personalConfig?.githubToken && !process.env.GITHUB_TOKEN) {
  process.env.GITHUB_TOKEN = personalConfig.githubToken;
}

const TOKEN_URL = 'https://github.com/settings/tokens/new';
const REQUIRED_SCOPES = ['repo', 'repo:status', 'workflow', 'issues'];

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function validateTokenFormat(token) {
  const trimmed = token.trim();
  return (
    trimmed.startsWith('ghp_') ||
    trimmed.startsWith('github_pat_') ||
    trimmed.startsWith('gho_')
  );
}

async function testToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'cursor-workspace-setup',
      },
    });

    if (response.ok) {
      const user = await response.json();
      return { valid: true, user: user.login };
    } else if (response.status === 401) {
      return { valid: false, error: 'Token is invalid or expired' };
    } else {
      return { valid: false, error: `GitHub API returned ${response.status}` };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

function getShellProfile(tokenValue) {
  const platform = process.platform;
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  if (platform === 'win32') {
    // PowerShell profile
    const psProfile = process.env.PSModulePath
      ? path.join(homeDir, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1')
      : null;
    const resolvedProfile =
      psProfile ||
      path.join(homeDir, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');

    return {
      type: 'powershell',
      path: resolvedProfile,
      command: `$env:GITHUB_TOKEN="${tokenValue}"`,
      permanent: `[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', '${tokenValue}', 'User')`,
    };
  }

  // Detect shell
  const shell = process.env.SHELL || '/bin/bash';
  if (shell.includes('zsh')) {
    return {
      type: 'zsh',
      path: path.join(homeDir, '.zshrc'),
      command: `export GITHUB_TOKEN="${tokenValue}"`,
    };
  } else {
    return {
      type: 'bash',
      path: path.join(homeDir, '.bashrc'),
      command: `export GITHUB_TOKEN="${tokenValue}"`,
    };
  }
}

function saveToEnvFile(token) {
  const envPath = path.join(repoRoot, '.env');
  const envLocalPath = path.join(repoRoot, '.env.local');

  // Try .env.local first, then .env
  const targetPath = existsSync(envLocalPath) ? envLocalPath : envPath;

  let content = '';
  if (existsSync(targetPath)) {
    content = readFileSync(targetPath, 'utf8');
    // Remove existing GITHUB_TOKEN if present
    content = content.replace(/^GITHUB_TOKEN=.*$/m, '');
  }

  content += `\nGITHUB_TOKEN=${token}\n`;

  try {
    writeFileSync(targetPath, content.trim() + '\n', 'utf8');
    return { success: true, path: targetPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function cachePersonalToken(token) {
  if (!token) {
    return;
  }

  const existing = personalConfig ?? {};
  const updated = {
    ...existing,
    githubToken: token,
  };
  if (updated.preferredPreset === undefined) {
    updated.preferredPreset = 'webapp';
  }
  if (updated.autoSetupOnInstall === undefined) {
    updated.autoSetupOnInstall = true;
  }
  savePersonalConfig(updated);
}

async function main() {
  log('\n🔑 GitHub Token Setup Wizard\n', 'cyan');
  log('='.repeat(50), 'cyan');

  // Use personal config automatically when available
  const configToken = personalConfig?.githubToken?.trim();
  if (configToken) {
    log('\nℹ️  Personal config found. Using saved GitHub token.', 'blue');
    process.env.GITHUB_TOKEN = configToken;
    cachePersonalToken(configToken);
    const envResult = saveToEnvFile(configToken);
    if (envResult.success) {
      log(`✅ Token ensured in ${envResult.path}`, 'green');
    } else if (envResult.error) {
      log(`⚠️  Could not write .env file automatically: ${envResult.error}`, 'yellow');
    }
    log('\n✅ Token setup complete via personal config.\n', 'green');
    return;
  }

  // Check if token already exists
  const existingToken = process.env.GITHUB_TOKEN;
  if (existingToken) {
    log(`\n⚠️  GITHUB_TOKEN is already set in your environment.`, 'yellow');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await question(
      rl,
      'Do you want to set up a new token? (y/N): ',
    );
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      log('\n✓ Keeping existing token. Exiting.', 'green');
      return;
    }
  }

  log('\n📋 What is a GitHub Personal Access Token?', 'blue');
  log(
    'A GitHub PAT allows Cursor MCP servers to interact with GitHub on your behalf.',
  );
  log('It enables features like:', 'cyan');
  log('  • Creating branches and pull requests');
  log('  • Managing issues');
  log('  • Reading repository information');
  log('  • Running GitHub Actions workflows');

  log('\n📋 Required Scopes:', 'blue');
  REQUIRED_SCOPES.forEach(scope => {
    log(`  ✓ ${scope}`, 'green');
  });

  log('\n🌐 Opening GitHub token creation page...', 'yellow');
  const opened = openBrowser(TOKEN_URL);
  if (!opened) {
    log('⚠️  Could not open browser automatically.', 'yellow');
  }

  log(`\n📝 Please follow these steps:`, 'blue');
  log(`  1. Open: ${TOKEN_URL}`, 'cyan');
  log(`  2. Enter a descriptive name (e.g., "Cursor MCP Development")`);
  log(`  3. Set expiration (30 days, 90 days, or No expiration)`);
  log(`  4. Check these scopes:`);
  REQUIRED_SCOPES.forEach(scope => {
    log(`     ☐ ${scope}`);
  });
  log(`  5. Click "Generate token"`);
  log(`  6. Copy the token (you won't see it again!)`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  log('\n');
  const token = await question(rl, 'Paste your token here: ');

  if (!token || !token.trim()) {
    log('\n❌ No token provided. Exiting.', 'red');
    rl.close();
    process.exit(1);
  }

  const trimmedToken = token.trim();

  // Validate format
  if (!validateTokenFormat(trimmedToken)) {
    log(
      '\n⚠️  Token format looks invalid. GitHub tokens usually start with:', 'yellow',
    );
    log('  • ghp_ (classic token)');
    log('  • github_pat_ (fine-grained token)');
    log('  • gho_ (OAuth token)');

    const proceed = await question(
      rl,
      '\nContinue anyway? (y/N): ',
    );
    if (proceed.toLowerCase() !== 'y') {
      log('\nExiting. Please verify your token and try again.', 'yellow');
      rl.close();
      process.exit(1);
    }
  }

  // Optional: Test token
  log('\n🔍 Testing token...', 'yellow');
  const testResult = await testToken(trimmedToken);
  if (testResult.valid) {
    log(`✓ Token is valid! Authenticated as: ${testResult.user}`, 'green');
  } else {
    log(`⚠️  Token validation failed: ${testResult.error}`, 'yellow');
    log('This might be okay if:', 'cyan');
    log('  • You just created the token (wait a few seconds)');
    log('  • Network issues prevent API access');
    log('  • Token has restricted permissions');

    const proceed = await question(
      rl,
      '\nContinue anyway? (y/N): ',
    );
    if (proceed.toLowerCase() !== 'y') {
      log('\nExiting. Please verify your token and try again.', 'yellow');
      rl.close();
      process.exit(1);
    }
  }

  // Save token
  log('\n💾 Saving token...', 'yellow');

  // Try saving to .env file first
  const envResult = saveToEnvFile(trimmedToken);
  if (envResult.success) {
    log(`✓ Token saved to ${envResult.path}`, 'green');
    log('\n⚠️  Important: Add .env to .gitignore if not already present!', 'yellow');
    log('This file contains secrets and should never be committed.', 'yellow');
  } else {
    log(`⚠️  Could not save to .env file: ${envResult.error}`, 'yellow');
  }

  cachePersonalToken(trimmedToken);

  // Show platform-specific instructions
  const shellProfile = getShellProfile(trimmedToken);
  log('\n📝 Platform-specific setup:', 'blue');

  if (process.platform === 'win32') {
    log('\nWindows (PowerShell):', 'cyan');
    log('  Temporary (current session):', 'yellow');
    log(`    $env:GITHUB_TOKEN="${trimmedToken}"`, 'cyan');
    log('\n  Permanent (all sessions):', 'yellow');
    log(
      `    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', '${trimmedToken}', 'User')`,
      'cyan',
    );
    log('\n  Or add to your PowerShell profile:', 'yellow');
    log(`    Add-Content -Path $PROFILE -Value '$env:GITHUB_TOKEN="${trimmedToken}"'`, 'cyan');
  } else {
    log(`\nUnix (${shellProfile.type}):`, 'cyan');
    log('  Temporary (current session):', 'yellow');
    log(`    export GITHUB_TOKEN="${trimmedToken}"`, 'cyan');
    log('\n  Permanent (all sessions):', 'yellow');
    log(`    echo 'export GITHUB_TOKEN="${trimmedToken}"' >> ${shellProfile.path}`, 'cyan');
    log(`    source ${shellProfile.path}`, 'cyan');
  }

  log('\n✓ Token setup complete!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('  1. Restart your terminal or run the export command above');
  log('  2. Verify with: npm run status');
  log('  3. Continue setup with: npm run setup');

  rl.close();
}

try {
  main();
} catch (error) {
  log(
    `\n❌ Error: ${error instanceof Error ? error.message : error}`,
    'red',
  );
  process.exit(1);
}
