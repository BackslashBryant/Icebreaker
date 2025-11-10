#!/usr/bin/env node

/**
 * MCP Connectivity Test Tool
 * 
 * Tests network connectivity to Smithery servers and validates MCP server commands
 * 
 * Usage:
 *   npm run mcp:test-connectivity
 *   node tools/test-mcp-connectivity.mjs
 */

import { spawnSync } from 'node:child_process';
import https from 'node:https';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  const icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗',
  };
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function testHttpsConnection(hostname, path = '/') {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      resolve({ success: true, statusCode: res.statusCode });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });

    req.end();
  });
}

async function testSmitheryConnectivity() {
  log('Testing connectivity to Smithery servers...', 'info');
  
  const smitheryHosts = [
    'smithery.ai',
    'api.smithery.ai',
  ];

  for (const host of smitheryHosts) {
    log(`  Testing ${host}...`, 'info');
    const result = await testHttpsConnection(host);
    if (result.success) {
      log(`  ${host} is reachable (status: ${result.statusCode})`, 'success');
    } else {
      log(`  ${host} is NOT reachable: ${result.error}`, 'error');
    }
  }
}

function testSmitheryCliCommand() {
  log('\nTesting Smithery CLI command...', 'info');
  
  if (!existsSync(mcpConfigPath)) {
    log('MCP config not found, skipping CLI test', 'warning');
    return;
  }

  try {
    const config = JSON.parse(readFileSync(mcpConfigPath, 'utf8'));
    const githubServer = config.mcpServers?.['github-v2'] || config.mcpServers?.github;
    
    if (!githubServer) {
      log('GitHub MCP server not found in config', 'warning');
      return;
    }

    log('Running: npx -y @smithery/cli@latest run @smithery-ai/github', 'info');
    log('(This may take 10-15 seconds, watching for timeout...)', 'info');
    
    const args = githubServer.args.filter(arg => arg !== '/c' && arg !== 'cmd');
    const result = spawnSync('npx', args, {
      env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN || '' },
      timeout: 15000,
      encoding: 'utf8',
    });

    if (result.error) {
      log(`Command failed: ${result.error.message}`, 'error');
      if (result.error.message.includes('timeout')) {
        log('  → This indicates a network connectivity issue with Smithery servers', 'warning');
      }
    } else if (result.status === 0) {
      log('Smithery CLI command executed successfully', 'success');
    } else {
      log(`Smithery CLI exited with code ${result.status}`, 'error');
      if (result.stderr) {
        log(`  Error output: ${result.stderr.substring(0, 200)}`, 'error');
      }
      if (result.stdout) {
        log(`  Standard output: ${result.stdout.substring(0, 200)}`, 'info');
      }
    }
  } catch (error) {
    log(`Failed to test CLI: ${error instanceof Error ? error.message : error}`, 'error');
  }
}

function checkEnvironmentVariables() {
  log('\nChecking environment variables...', 'info');
  
  const required = ['GITHUB_TOKEN'];
  const optional = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  
  for (const varName of required) {
    if (process.env[varName]) {
      log(`  ${varName} is set`, 'success');
    } else {
      log(`  ${varName} is NOT set (required)`, 'error');
    }
  }
  
  for (const varName of optional) {
    if (process.env[varName]) {
      log(`  ${varName} is set`, 'success');
    } else {
      log(`  ${varName} is not set (optional)`, 'warning');
    }
  }
}

async function main() {
  console.log('\n🔍 MCP Connectivity Test Tool\n');
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Test network connectivity
  await testSmitheryConnectivity();
  
  // Test Smithery CLI command
  testSmitheryCliCommand();
  
  console.log('\n');
  log('Diagnosis:', 'info');
  log('If Smithery hosts are unreachable → Network/firewall issue', 'info');
  log('If CLI command times out → Smithery service issue or invalid key', 'info');
  log('If CLI works but Cursor shows errors → Cursor configuration issue', 'info');
  console.log('');
}

try {
  await main();
} catch (error) {
  log(`Error: ${error instanceof Error ? error.message : error}`, 'error');
  process.exit(1);
}

