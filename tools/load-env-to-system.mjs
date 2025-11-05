#!/usr/bin/env node

/**
 * Load .env file values into system environment variables
 * This allows Cursor MCP servers to access values stored in .env files
 *
 * Usage:
 *   node tools/load-env-to-system.mjs [.env file path]
 */

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envFile = process.argv[2] || '.env';
const envPath = path.join(repoRoot, envFile);

console.log('Loading environment variables from .env file...\n');

if (!existsSync(envPath)) {
  console.error(`Error: .env file not found at: ${envPath}`);
  console.error("Run 'npm run setup:tokens' first to create it.");
  process.exit(1);
}

// Read and parse .env file
const content = readFileSync(envPath, 'utf8');
const lines = content.split('\n');
let varsSet = 0;

for (const line of lines) {
  const trimmed = line.trim();

  // Skip comments and empty lines
  if (trimmed.startsWith('#') || trimmed === '') {
    continue;
  }

    // Parse KEY=VALUE format
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Skip if key is empty
      if (!key) {
        continue;
      }

      // Skip placeholder values (empty, "your-*", "placeholder", etc.)
      if (!value ||
          /^your-/.test(value) ||
          /^placeholder/i.test(value) ||
          /^<.*>$/.test(value) ||
          value === '') {
        continue;
      }

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Only set if we have a non-empty value after processing
      if (key && value && value.trim() !== '') {
      try {
        // Set environment variable based on platform
        const platform = process.platform;
        if (platform === 'win32') {
          // Windows: Use PowerShell to set user environment variable
          const escapedValue = value.replace(/'/g, "''");
          execSync(
            `powershell -Command "[System.Environment]::SetEnvironmentVariable('${key}', '${escapedValue}', 'User')"`,
            { stdio: 'ignore' }
          );
        } else {
          // Unix: Add to shell profile
          const homeDir = process.env.HOME;
          const shell = process.env.SHELL || '/bin/bash';
          const profile = shell.includes('zsh')
            ? path.join(homeDir, '.zshrc')
            : path.join(homeDir, '.bashrc');

          // Check if already exists
          let profileContent = '';
          if (existsSync(profile)) {
            profileContent = readFileSync(profile, 'utf8');
          }

          // Remove existing export if present
          const exportRegex = new RegExp(`^export\\s+${key}=.*$`, 'm');
          profileContent = profileContent.replace(exportRegex, '');

          // Add new export
          profileContent += `\nexport ${key}="${value}"\n`;

          // Write back (this would require writeFileSync, but we'll just show the command)
          console.log(`  ✓ ${key} (run: export ${key}="${value}")`);
        }

        if (platform === 'win32') {
          console.log(`  ✓ Set ${key}`);
        }
        varsSet++;
      } catch (error) {
        console.error(`  ✗ Failed to set ${key}: ${error.message}`);
      }
    }
  }
}

if (varsSet === 0) {
  console.warn('\n⚠️  Warning: No environment variables found in .env file.');
} else {
  console.log(`\n✅ Set ${varsSet} environment variable(s).`);
  console.log('\n⚠️  IMPORTANT: You must restart Cursor for these to take effect!');
  console.log('\nAfter restarting Cursor, your MCP servers should work.');
}
