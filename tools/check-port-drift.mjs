#!/usr/bin/env node

/**
 * Port Drift Guard
 * 
 * Verifies that env.example ports match actual code configuration.
 * Prevents documentation drift that would confuse developers.
 * 
 * Checks:
 * - HTTP_PORT (frontend) matches vite.config.js server.port
 * - API_PORT (backend) matches backend/src/index.js PORT default
 * - WS_PORT matches API_PORT (WebSocket uses same port as HTTP)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Expected ports from env.example
const ENV_EXAMPLE_PATH = join(rootDir, 'env.example');
const VITE_CONFIG_PATH = join(rootDir, 'frontend', 'vite.config.js');
const BACKEND_INDEX_PATH = join(rootDir, 'backend', 'src', 'index.js');

function parseEnvExample() {
  const content = readFileSync(ENV_EXAMPLE_PATH, 'utf-8');
  const ports = {};
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('HTTP_PORT=')) {
      ports.HTTP_PORT = parseInt(trimmed.split('=')[1], 10);
    } else if (trimmed.startsWith('API_PORT=')) {
      ports.API_PORT = parseInt(trimmed.split('=')[1], 10);
    } else if (trimmed.startsWith('WS_PORT=')) {
      ports.WS_PORT = parseInt(trimmed.split('=')[1], 10);
    }
  }
  
  return ports;
}

function parseViteConfig() {
  const content = readFileSync(VITE_CONFIG_PATH, 'utf-8');
  // Look for port: 3000 pattern
  const portMatch = content.match(/port:\s*(\d+)/);
  if (!portMatch) {
    throw new Error('Could not find port in vite.config.js');
  }
  return parseInt(portMatch[1], 10);
}

function parseBackendPort() {
  const content = readFileSync(BACKEND_INDEX_PATH, 'utf-8');
  // Look for process.env.PORT || 8000 pattern
  const portMatch = content.match(/process\.env\.PORT\s*\|\|\s*(\d+)/);
  if (!portMatch) {
    throw new Error('Could not find PORT default in backend/src/index.js');
  }
  return parseInt(portMatch[1], 10);
}

function main() {
  let errors = [];
  let warnings = [];
  
  try {
    const envPorts = parseEnvExample();
    const vitePort = parseViteConfig();
    const backendPort = parseBackendPort();
    
    // Check HTTP_PORT matches frontend
    if (envPorts.HTTP_PORT !== vitePort) {
      errors.push(
        `HTTP_PORT mismatch: env.example has ${envPorts.HTTP_PORT}, but vite.config.js uses ${vitePort}`
      );
    }
    
    // Check API_PORT matches backend
    if (envPorts.API_PORT !== backendPort) {
      errors.push(
        `API_PORT mismatch: env.example has ${envPorts.API_PORT}, but backend/src/index.js uses ${backendPort}`
      );
    }
    
    // Check WS_PORT matches API_PORT (WebSocket uses same port)
    if (envPorts.WS_PORT !== envPorts.API_PORT) {
      warnings.push(
        `WS_PORT (${envPorts.WS_PORT}) should match API_PORT (${envPorts.API_PORT}) - WebSocket uses same port as HTTP`
      );
    }
    
    if (errors.length > 0) {
      console.error('❌ Port drift detected:');
      errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️  Port warnings:');
      warnings.forEach(warn => console.warn(`  - ${warn}`));
    }
    
    console.log('✅ Port configuration matches:');
    console.log(`  - Frontend: ${vitePort} (HTTP_PORT)`);
    console.log(`  - Backend: ${backendPort} (API_PORT, WS_PORT)`);
    
  } catch (error) {
    console.error('❌ Error checking port drift:', error.message);
    process.exit(1);
  }
}

main();

