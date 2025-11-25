#!/usr/bin/env node

/**
 * Production Endpoint Validation
 * 
 * Verifies that production endpoints (Vercel frontend, Railway backend) are:
 * - Accessible (HTTP 200)
 * - Returning expected responses
 * - WebSocket connections working
 * 
 * Run this weekly (or via GitHub Actions) to catch deployment issues early.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Production URLs from deployment.md
const DEPLOYMENT_DOC_PATH = join(rootDir, 'Docs', 'deployment.md');

function parseProductionUrls() {
  const content = readFileSync(DEPLOYMENT_DOC_PATH, 'utf-8');
  const urls = {};
  
  // Look for production URLs section
  const frontendMatch = content.match(/Frontend.*?https:\/\/([^\s]+)/i);
  const backendMatch = content.match(/Backend.*?https:\/\/([^\s]+)/i);
  const wsMatch = content.match(/WebSocket.*?wss:\/\/([^\s]+)/i);
  
  if (frontendMatch) {
    urls.frontend = `https://${frontendMatch[1]}`;
  }
  if (backendMatch) {
    urls.backend = `https://${backendMatch[1]}`;
  }
  if (wsMatch) {
    urls.websocket = `wss://${wsMatch[1]}`;
  }
  
  return urls;
}

async function checkHttpEndpoint(url, expectedStatus = 200) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Icebreaker-Production-Validator/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      statusText: response.statusText,
      url,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url,
    };
  }
}

async function checkHealthEndpoint(backendUrl) {
  const healthUrl = `${backendUrl}/api/health`;
  const result = await checkHttpEndpoint(healthUrl, 200);
  
  if (result.success) {
    try {
      const data = await fetch(healthUrl).then(r => r.json());
      result.data = data;
      result.validResponse = data.status === 'ok';
    } catch (error) {
      result.validResponse = false;
      result.parseError = error.message;
    }
  }
  
  return result;
}

async function checkWebSocket(wsUrl) {
  return new Promise((resolve) => {
    // Use dynamic import for WebSocket (Node.js 18+)
    // Try root node_modules first, then backend/node_modules
    const rootWsPath = join(rootDir, 'node_modules', 'ws');
    const backendWsPath = join(rootDir, 'backend', 'node_modules', 'ws');
    
    let wsImportPath = 'ws'; // Default to package name
    if (existsSync(join(rootWsPath, 'package.json'))) {
      wsImportPath = rootWsPath;
    } else if (existsSync(join(backendWsPath, 'package.json'))) {
      wsImportPath = backendWsPath;
    }
    
    import(wsImportPath).then(({ default: WebSocket }) => {
      const ws = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          success: false,
          error: 'Connection timeout (10s)',
          url: wsUrl,
        });
      }, 10000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          success: true,
          url: wsUrl,
        });
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: error.message,
          url: wsUrl,
        });
      });
    }).catch((error) => {
      resolve({
        success: false,
        error: `Failed to import ws module: ${error.message}`,
        url: wsUrl,
        note: 'Install ws package: npm install ws',
      });
    });
  });
}

async function main() {
  console.log('🔍 Validating production endpoints...\n');
  
  const urls = parseProductionUrls();
  
  if (!urls.frontend || !urls.backend || !urls.websocket) {
    console.error('❌ Could not parse production URLs from Docs/deployment.md');
    console.error('   Expected format: Frontend: https://...');
    process.exit(1);
  }
  
  console.log('Production URLs:');
  console.log(`  Frontend: ${urls.frontend}`);
  console.log(`  Backend: ${urls.backend}`);
  console.log(`  WebSocket: ${urls.websocket}\n`);
  
  const results = {
    frontend: null,
    backend: null,
    health: null,
    websocket: null,
  };
  
  // Check frontend
  console.log('Checking frontend...');
  results.frontend = await checkHttpEndpoint(urls.frontend, 200);
  if (results.frontend.success) {
    console.log(`  ✅ Frontend accessible (${results.frontend.status})`);
  } else {
    console.error(`  ❌ Frontend failed: ${results.frontend.error || results.frontend.statusText}`);
  }
  
  // Check backend
  console.log('\nChecking backend...');
  results.backend = await checkHttpEndpoint(urls.backend, 200);
  if (results.backend.success) {
    console.log(`  ✅ Backend accessible (${results.backend.status})`);
  } else {
    console.error(`  ❌ Backend failed: ${results.backend.error || results.backend.statusText}`);
  }
  
  // Check health endpoint
  console.log('\nChecking health endpoint...');
  results.health = await checkHealthEndpoint(urls.backend);
  if (results.health.success && results.health.validResponse) {
    console.log(`  ✅ Health endpoint OK (${JSON.stringify(results.health.data)})`);
  } else {
    console.error(`  ❌ Health endpoint failed: ${results.health.error || 'Invalid response'}`);
  }
  
  // Check WebSocket
  console.log('\nChecking WebSocket...');
  results.websocket = await checkWebSocket(urls.websocket);
  if (results.websocket.success) {
    console.log(`  ✅ WebSocket connection successful`);
  } else {
    console.error(`  ❌ WebSocket failed: ${results.websocket.error}`);
    if (results.websocket.note) {
      console.error(`  Note: ${results.websocket.note}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  const allPassed = 
    results.frontend?.success &&
    results.backend?.success &&
    results.health?.success &&
    results.health?.validResponse &&
    results.websocket?.success;
  
  if (allPassed) {
    console.log('✅ All production endpoints validated successfully');
    process.exit(0);
  } else {
    console.error('❌ Some production endpoints failed validation');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

