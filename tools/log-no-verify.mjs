#!/usr/bin/env node

import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return null;
  return args[index + 1];
};

const run = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const reason = getArg('--reason');
if (!reason) {
  console.error('Error: --reason is required.');
  process.exit(1);
}

const commitRef = getArg('--commit') || run('git rev-parse HEAD');
const shortCommit = run(`git rev-parse --short ${commitRef}`);
const branch = getArg('--branch') || run('git rev-parse --abbrev-ref HEAD');
const providedTimestamp = getArg('--timestamp');
const timestamp = providedTimestamp
  ? providedTimestamp
  : new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');

const filesArg = getArg('--files');
let filesList = [];
if (filesArg) {
  filesList = filesArg
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
} else {
  const filesRaw = run(`git show --pretty=format: --name-only ${commitRef}`);
  filesList = filesRaw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

if (filesList.length === 0) {
  filesList.push('<files unavailable>');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const logPath = path.resolve(repoRoot, '.notes/no-verify-log.md');

const entry = `\n### [${timestamp}] Branch: \`${branch}\`\n- **Reason**: ${reason}\n- **Commit**: \`${shortCommit}\`\n- **Files changed**: ${filesList.join(',')}\n`;

appendFileSync(logPath, entry, { encoding: 'utf8' });
console.log('Logged no-verify entry to .notes/no-verify-log.md');
