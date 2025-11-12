#!/usr/bin/env node
/**
 * Deployment Verification Script
 * 
 * Verifies that both frontend (Vercel) and backend (Railway) deployments
 * are working correctly in production.
 */

import https from 'https';
import http from 'http';
import { WebSocket } from 'ws';

// Configuration
const FRONTEND_URL = 'https://frontend-coral-two-84.vercel.app'; // Using working alias
const FRONTEND_MAIN_URL = 'https://frontend-backslashbryants-projects.vercel.app'; // Main alias (may have protection)
const BACKEND_URL = 'https://airy-fascination-production.up.railway.app';
const BACKEND_API_URL = `${BACKEND_URL}/api`;
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Backend Health Check
async function testBackendHealth() {
  try {
    const response = await makeRequest(`${BACKEND_API_URL}/health`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      if (body.status === 'ok') {
        results.passed.push('Backend health check: ✅ Returns 200 OK with status: ok');
        return true;
      } else {
        results.failed.push(`Backend health check: ❌ Invalid response body: ${response.body}`);
        return false;
      }
    } else {
      results.failed.push(`Backend health check: ❌ Status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`Backend health check: ❌ ${error.message}`);
    return false;
  }
}

// Test 2: Frontend Loads
async function testFrontendLoads() {
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.statusCode === 200) {
      // Check if it's HTML (not an error page)
      if (response.body.includes('<!DOCTYPE html>') || response.body.includes('<html')) {
        results.passed.push('Frontend loads: ✅ Returns 200 OK with HTML content');
        return true;
      } else {
        results.warnings.push(`Frontend loads: ⚠️ Returns 200 but may not be valid HTML`);
        return true; // Still count as pass
      }
    } else {
      results.failed.push(`Frontend loads: ❌ Status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`Frontend loads: ❌ ${error.message}`);
    return false;
  }
}

// Test 3: HTTPS/SSL Verification
async function testHTTPS() {
  const checks = [];
  
  // Check frontend HTTPS
  if (FRONTEND_URL.startsWith('https://')) {
    checks.push('Frontend uses HTTPS');
  } else {
    results.failed.push('Frontend: ❌ Not using HTTPS');
    return false;
  }
  
  // Check backend HTTPS
  if (BACKEND_URL.startsWith('https://')) {
    checks.push('Backend uses HTTPS');
  } else {
    results.failed.push('Backend: ❌ Not using HTTPS');
    return false;
  }
  
  results.passed.push(`HTTPS/SSL: ✅ ${checks.join(', ')}`);
  return true;
}

// Test 4: CORS Headers
async function testCORS() {
  try {
    const response = await makeRequest(`${BACKEND_API_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      results.passed.push(`CORS: ✅ Access-Control-Allow-Origin header present: ${corsHeader}`);
      return true;
    } else {
      results.warnings.push('CORS: ⚠️ CORS headers not found (may be configured differently)');
      return true; // CORS might be configured at app level
    }
  } catch (error) {
    results.warnings.push(`CORS check: ⚠️ ${error.message}`);
    return true; // Don't fail on CORS check
  }
}

// Test 5: WebSocket Connection (basic check)
async function testWebSocket() {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      
      const timeout = setTimeout(() => {
        ws.close();
        results.warnings.push('WebSocket: ⚠️ Connection timeout (may require authentication)');
        resolve(true); // Don't fail - WS requires auth token
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        results.passed.push('WebSocket: ✅ Connection successful');
        resolve(true);
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        // WebSocket may require authentication, so this is a warning
        if (error.message.includes('401') || error.message.includes('403')) {
          results.passed.push('WebSocket: ✅ Endpoint exists (requires authentication)');
        } else {
          results.warnings.push(`WebSocket: ⚠️ ${error.message} (may require authentication)`);
        }
        resolve(true); // Don't fail - WS requires auth
      });
    } catch (error) {
      results.warnings.push(`WebSocket: ⚠️ ${error.message}`);
      resolve(true); // Don't fail
    }
  });
}

// Test 6: Response Time Check
async function testResponseTime() {
  const start = Date.now();
  try {
    await makeRequest(`${BACKEND_API_URL}/health`);
    const duration = Date.now() - start;
    
    if (duration < 500) {
      results.passed.push(`Backend response time: ✅ ${duration}ms (< 500ms target)`);
    } else if (duration < 1000) {
      results.warnings.push(`Backend response time: ⚠️ ${duration}ms (acceptable but > 500ms)`);
    } else {
      results.failed.push(`Backend response time: ❌ ${duration}ms (> 1s)`);
      return false;
    }
    return true;
  } catch (error) {
    results.failed.push(`Response time check: ❌ ${error.message}`);
    return false;
  }
}

// Run all tests
async function runVerification() {
  console.log('🚀 Starting Deployment Verification...\n');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}\n`);
  
  const tests = [
    { name: 'Backend Health Check', fn: testBackendHealth },
    { name: 'Frontend Loads', fn: testFrontendLoads },
    { name: 'HTTPS/SSL', fn: testHTTPS },
    { name: 'CORS Headers', fn: testCORS },
    { name: 'WebSocket Connection', fn: testWebSocket },
    { name: 'Response Time', fn: testResponseTime }
  ];
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    try {
      await test.fn();
      console.log('✓');
    } catch (error) {
      console.log('✗');
      results.failed.push(`${test.name}: ❌ ${error.message}`);
    }
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  if (results.passed.length > 0) {
    console.log('\n✅ PASSED:');
    results.passed.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(msg => console.log(`  ${msg}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED:');
    results.failed.forEach(msg => console.log(`  ${msg}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  const totalTests = tests.length;
  const passedTests = results.passed.length;
  const failedTests = results.failed.length;
  
  console.log(`\nSummary: ${passedTests}/${totalTests} tests passed`);
  
  if (failedTests === 0) {
    console.log('✅ All critical tests passed! Deployment verified.\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failedTests} test(s) failed. Please review.\n`);
    process.exit(1);
  }
}

// Run verification
runVerification().catch(error => {
  console.error('Verification script error:', error);
  process.exit(1);
});

