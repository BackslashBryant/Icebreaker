#!/usr/bin/env node

/**
 * MCP Self-Healing Tool
 * 
 * Detects and fixes common MCP configuration issues:
 * 1. Missing `env` fields for servers that need GITHUB_TOKEN
 * 2. Detects servers that should be renamed to bypass Cursor caching
 * 3. Validates environment variables are accessible
 * 
 * Usage:
 *   npm run mcp:heal
 *   node tools/mcp-self-heal.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');

// Servers that require GITHUB_TOKEN
const GITHUB_TOKEN_SERVERS = [
  'desktop-commander',
  'github',
  'playwright-mcp',
  'desktop-commander-v2',
  'github-v2',
  'playwright-mcp-v2',
];

// Servers that require Supabase env vars (legacy - hosted server doesn't need these)
// Note: The official hosted Supabase MCP server at https://mcp.supabase.com/mcp doesn't require env vars
const SUPABASE_SERVERS = [
  'supabase-mcp',
  'supabase-mcp-lite',
  'supabase-mcp-lite-v2',
];

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

function needsEnvField(serverName, serverConfig) {
  // Check if server needs GITHUB_TOKEN
  if (GITHUB_TOKEN_SERVERS.some(name => serverName.includes(name.replace('-v2', '')))) {
    if (!serverConfig.env || !serverConfig.env.GITHUB_TOKEN) {
      return { needs: 'GITHUB_TOKEN', field: 'GITHUB_TOKEN' };
    }
  }
  
  // Check if server needs Supabase vars (only for legacy npm package, not hosted server)
  // Hosted server at https://mcp.supabase.com/mcp doesn't need env vars
  if (SUPABASE_SERVERS.some(name => serverName.includes(name.replace('-v2', '')))) {
    // Only check if it's using command/args (npm package), not url (hosted server)
    if (serverConfig.command && !serverConfig.url) {
      const hasUrl = serverConfig.env?.SUPABASE_URL;
      const hasKey = serverConfig.env?.SUPABASE_ANON_KEY;
      if (!hasUrl || !hasKey) {
        return { needs: 'SUPABASE', fields: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] };
      }
    }
    // Hosted server (url-based) doesn't need env vars - skip check
  }
  
  return null;
}

function shouldRename(serverName) {
  // Legacy check - no longer needed after migration to direct MCP servers
  return false;
}

function detectSmitheryCli(config) {
  // Detect if config still uses deprecated Smithery CLI (STDIO)
  const issues = [];
  
  for (const [serverName, serverConfig] of Object.entries(config.mcpServers || {})) {
    const args = serverConfig?.args || [];
    const hasSmitheryCli = args.some(arg => 
      arg.includes('@smithery/cli') || 
      arg.includes('smithery/cli')
    );
    
    if (hasSmitheryCli) {
      issues.push({
        server: serverName,
        issue: 'Uses deprecated Smithery CLI (STDIO support discontinued)',
        fix: 'Migrate to direct MCP server installation'
      });
    }
  }
  
  return issues;
}

function healMcpConfig() {
  if (!existsSync(mcpConfigPath)) {
    log('MCP config file not found', 'error');
    log('Run: npm run setup', 'info');
    return false;
  }

  let config;
  try {
    const content = readFileSync(mcpConfigPath, 'utf8');
    config = JSON.parse(content);
  } catch (error) {
    log(`Failed to parse MCP config: ${error instanceof Error ? error.message : error}`, 'error');
    return false;
  }

  if (!config.mcpServers || typeof config.mcpServers !== 'object') {
    log('Invalid MCP config structure', 'error');
    return false;
  }

  let needsFix = false;
  const fixes = [];

  // Check for deprecated Smithery CLI usage
  const smitheryIssues = detectSmitheryCli(config);
  if (smitheryIssues.length > 0) {
    needsFix = true;
    smitheryIssues.forEach(issue => {
      fixes.push(`⚠ ${issue.server}: ${issue.issue}. ${issue.fix}`);
    });
    log('Deprecated Smithery CLI detected. See docs/troubleshooting/mcp-troubleshooting.md for migration guide', 'warning');
  }

  // Check each server
  for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
    if (!serverConfig || typeof serverConfig !== 'object') continue;

    // Check if env field is missing
    const envIssue = needsEnvField(serverName, serverConfig);
    if (envIssue) {
      needsFix = true;
      if (!serverConfig.env) {
        serverConfig.env = {};
      }
      
      if (envIssue.needs === 'GITHUB_TOKEN') {
        serverConfig.env.GITHUB_TOKEN = '${env:GITHUB_TOKEN}';
        fixes.push(`Added GITHUB_TOKEN env field to ${serverName}`);
      } else if (envIssue.needs === 'SUPABASE') {
        envIssue.fields.forEach(field => {
          serverConfig.env[field] = `\${env:${field}}`;
        });
        fixes.push(`Added Supabase env fields to ${serverName}`);
      }
    }

    // Check if server should be renamed (for cache bypass)
    if (shouldRename(serverName)) {
      const newName = `${serverName}-v2`;
      if (!config.mcpServers[newName]) {
        log(`Server ${serverName} should be renamed to ${newName} to bypass Cursor cache`, 'warning');
        log('  (This requires manual intervention - rename in config and restart Cursor)', 'info');
      }
    }
  }

  if (needsFix) {
    try {
      writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
      log('MCP config updated successfully', 'success');
      fixes.forEach(fix => log(`  ${fix}`, 'success'));
      return true;
    } catch (error) {
      log(`Failed to write MCP config: ${error instanceof Error ? error.message : error}`, 'error');
      return false;
    }
  } else {
    log('MCP config is healthy - no fixes needed', 'success');
    return true;
  }
}

function checkEnvironmentVariables() {
  const requiredVars = ['GITHUB_TOKEN'];
  const optionalVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  
  let allGood = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`${varName} is set`, 'success');
    } else {
      log(`${varName} is NOT set (required)`, 'error');
      allGood = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log(`${varName} is set`, 'success');
    } else {
      log(`${varName} is not set (optional)`, 'warning');
    }
  });
  
  return allGood;
}

function main() {
  console.log('\n🔧 MCP Self-Healing Tool\n');
  
  // Check environment variables
  log('Checking environment variables...', 'info');
  const envOk = checkEnvironmentVariables();
  console.log('');
  
  // Heal config
  log('Checking MCP configuration...', 'info');
  const configFixed = healMcpConfig();
  console.log('');
  
  if (!envOk) {
    log('Environment variables are missing. Run:', 'warning');
    log('  npm run mcp:load-env:win', 'info');
    console.log('');
  }
  
  if (configFixed) {
    log('Next steps:', 'info');
    log('1. If config was updated, restart Cursor completely (close all windows)', 'info');
    log('2. Check MCP status in Cursor Settings → MCP', 'info');
    log('3. If servers still show red/yellow, check MCP Logs in Output panel', 'info');
    console.log('');
  }
  
  return configFixed && envOk;
}

try {
  const success = main();
  process.exit(success ? 0 : 1);
} catch (error) {
  log(`Error: ${error instanceof Error ? error.message : error}`, 'error');
  process.exit(1);
}


