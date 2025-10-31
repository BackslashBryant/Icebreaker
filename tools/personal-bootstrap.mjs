#!/usr/bin/env node

/**
 * Personal Bootstrap
 *
 * Initializes ~/.cursor-personal/config.json with your defaults so the
 * template can auto-configure without extra prompts.
 */

import readline from 'node:readline';
import os from 'node:os';
import path from 'node:path';
import { loadPersonalConfig, savePersonalConfig } from './lib/personal-config.mjs';

function question(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const existing = loadPersonalConfig();
  if (existing) {
    console.log('Personal config already exists:', path.basename(os.homedir()) + '/.cursor-personal/config.json');
    return;
  }

  console.log('\n🧠 Cursor Personal Bootstrap');
  console.log('──────────────────────────────────────────\n');
  console.log('This repo will remember a few defaults so onboarding stays hands-off.');
  console.log("Nothing is committed to git. Files live in ~/.cursor-personal/.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let githubToken = '';
  while (!githubToken) {
    const input = await question(rl, 'Paste your GitHub token (ghp_/github_pat_): ');
    const trimmed = input.trim();
    if (!trimmed) {
      console.log('Token cannot be empty. Try again.\n');
      continue;
    }
    githubToken = trimmed;
  }

  let autoSetup = true;
  const autoAnswer = await question(
    rl,
    'Auto-run workspace setup after npm install? (Y/n): ',
  );
  if (autoAnswer.trim().toLowerCase() === 'n') {
    autoSetup = false;
  }

  const config = {
    githubToken,
    preferredPreset: 'webapp',
    autoSetupOnInstall: autoSetup,
    autoOpenDocs: true,
    machine: {
      host: os.hostname(),
      platform: process.platform,
      user: os.userInfo().username,
    },
    createdAt: new Date().toISOString(),
  };

  savePersonalConfig(config);

  console.log('\n✅ Personal defaults saved to ~/.cursor-personal/config.json');
  console.log('   - GitHub token cached for setup & MCP');
  console.log(`   - Auto-run setup after install: ${autoSetup ? 'enabled' : 'disabled'}`);
  console.log('   - Preferred preset: webapp\n');

  rl.close();
}

try {
  await main();
} catch (error) {
  console.error(
    'Personal bootstrap failed:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
