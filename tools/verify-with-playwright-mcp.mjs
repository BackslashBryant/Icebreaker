#!/usr/bin/env node
/**
 * Verification script using Playwright MCP for accessibility checks and screenshots
 * 
 * This script demonstrates how to use Playwright MCP tools for:
 * - Accessibility snapshots (browser_snapshot)
 * - Screenshots for artifacts (browser_take_screenshot)
 * - Navigation and interaction
 * 
 * Note: Playwright MCP tools must be available in the MCP session.
 * If tools are not available, fall back to CLI Playwright tests.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const artifactsDir = join(rootDir, 'artifacts');

// Ensure artifacts directory exists
if (!existsSync(artifactsDir)) {
  mkdirSync(artifactsDir, { recursive: true });
}

console.log('🔍 Playwright MCP Verification Workflow');
console.log('========================================\n');

console.log('📋 Instructions for using Playwright MCP:');
console.log('');
console.log('1. Navigate to the app:');
console.log('   - Use browser_navigate with URL: http://localhost:3000/welcome');
console.log('');
console.log('2. Take accessibility snapshot:');
console.log('   - Use browser_snapshot to get structured accessibility tree');
console.log('   - This is better than screenshots for accessibility checks');
console.log('');
console.log('3. Take screenshots for artifacts:');
console.log('   - Use browser_take_screenshot with filename in artifacts/');
console.log('   - Example: artifacts/welcome-screen.png');
console.log('');
console.log('4. Navigate through onboarding:');
console.log('   - Use browser_click to interact with elements');
console.log('   - Use browser_type to fill forms');
console.log('   - Take snapshots/screenshots at each step');
console.log('');
console.log('5. Verify accessibility:');
console.log('   - Use browser_snapshot to check for WCAG AA compliance');
console.log('   - Look for role, accessibleName, and text in snapshot');
console.log('');
console.log('⚠️  Note: If Playwright MCP tools are not available in this session,');
console.log('   fall back to running: npx playwright test');
console.log('');
console.log('📁 Artifacts will be saved to:', artifactsDir);
console.log('');
console.log('✅ To use Playwright MCP in Cursor:');
console.log('   1. Ensure .cursor/mcp.json has playwright-mcp configured');
console.log('   2. Restart Cursor to load MCP servers');
console.log('   3. Use Playwright MCP tools via chat/agent');
console.log('');

// Check if servers are running
console.log('🔍 Checking if servers are running...\n');
try {
  const backendHealth = execSync('curl -s http://localhost:8000/api/health', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 5000
  }).trim();
  console.log('✅ Backend running:', backendHealth);
} catch (error) {
  console.log('❌ Backend not running on port 8000');
}

try {
  const frontendCheck = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 5000
  }).trim();
  if (frontendCheck === '200') {
    console.log('✅ Frontend running on port 3000');
  } else {
    console.log('⚠️  Frontend responded with status:', frontendCheck);
  }
} catch (error) {
  console.log('❌ Frontend not running on port 3000');
}

console.log('\n📝 Next steps:');
console.log('   1. Start servers: npm run dev (in backend and frontend directories)');
console.log('   2. Use Playwright MCP tools to navigate and verify');
console.log('   3. Save screenshots to artifacts/ directory');
console.log('');


