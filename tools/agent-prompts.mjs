#!/usr/bin/env node

/**
 * Convenience CLI to print agent prompts for copy/paste inside Cursor.
 *
 * Usage:
 *   npm run agents:prompt -- list
 *   npm run agents:prompt -- vector pixel
 *   npm run agents:prompt -- all
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const promptsDir = path.join(repoRoot, 'docs', 'agents', 'prompts');

const availableAgents = [
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

function listAgents() {
  console.log('Available agents:');
  for (const agent of availableAgents) {
    console.log(`- ${agent}`);
  }
}

function printPrompt(agent) {
  const filePath = path.join(promptsDir, `${agent}.md`);
  if (!existsSync(filePath)) {
    console.error(`Prompt not found for agent "${agent}" (${filePath})`);
    process.exitCode = 1;
    return;
  }

  const heading = `===== ${agent.toUpperCase()} =====`;
  console.log(heading);
  console.log(readFileSync(filePath, 'utf8').trim());
  console.log(''.padEnd(heading.length, '='));
  console.log();
}

function main() {
  if (!existsSync(promptsDir)) {
    console.error('docs/agents/prompts directory is missing.');
    process.exit(1);
  }

  const args = process.argv.slice(2).map(arg => arg.toLowerCase());

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run agents:prompt -- <agent...>|all|list');
    console.log('Example: npm run agents:prompt -- vector pixel');
    process.exit(0);
  }

  if (args.includes('list')) {
    listAgents();
    if (args.length === 1) {
      return;
    }
  }

  const targets = args.includes('all') ? availableAgents : args.filter(arg => arg !== 'list');
  for (const agent of targets) {
    if (!availableAgents.includes(agent)) {
      console.error(`Unknown agent "${agent}". Run with "list" to see options.`);
      process.exitCode = 1;
      continue;
    }
    printPrompt(agent);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
}
