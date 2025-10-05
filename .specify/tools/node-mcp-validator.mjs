#!/usr/bin/env node

// Validates MCP configuration for required servers and ensures secrets are not embedded inline.
const fs = require('fs');

const [, , configPath, ...requiredServers] = process.argv;

if (!configPath) {
  console.error('No configuration path supplied.');
  process.exit(1);
}

let config;
try {
  const raw = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(raw);
} catch (error) {
  console.error(`Unable to parse ${configPath}: ${error.message}`);
  process.exit(1);
}

const errors = [];

if (!config.mcpServers || typeof config.mcpServers !== 'object') {
  errors.push('MCP configuration missing "mcpServers" map.');
} else {
  const available = Object.keys(config.mcpServers);
  for (const server of requiredServers) {
    if (!available.includes(server)) {
      errors.push(`MCP server '${server}' not configured.`);
    }
  }

  for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
    if (!serverConfig || typeof serverConfig !== 'object') continue;
    const envConfig = serverConfig.env;
    if (!envConfig || typeof envConfig !== 'object') continue;

    for (const [envVar, value] of Object.entries(envConfig)) {
      if (typeof value !== 'string' || value.length === 0) continue;
      const hasInputPlaceholder = value.includes('${inputs.');
      const hasEnvPlaceholder = value.includes('${env.');
      const looksLikePAT = /^gh[pous]_|^sbp_|^(?:eyJ|supabase)/i.test(value);
      if (!hasInputPlaceholder && !hasEnvPlaceholder && looksLikePAT) {
        errors.push(`Environment variable '${envVar}' for MCP server '${serverName}' contains what looks like a real token. Use inputs or environment variables.`);
      }
      if (!hasInputPlaceholder && !hasEnvPlaceholder && !looksLikePAT) {
        errors.push(`Environment variable '${envVar}' for MCP server '${serverName}' is hard-coded. Use inputs or environment variables.`);
      }
    }
  }
}

if (errors.length > 0) {
  for (const message of errors) {
    console.error(message);
  }
  process.exit(1);
}

process.exit(0);