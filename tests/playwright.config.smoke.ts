import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke Test Configuration
 * 
 * Fast subset of tests for quick feedback on every push.
 * Includes:
 * - 1 test per persona group (college-students, professionals, etc.)
 * - Visual tests for Welcome + Radar (mobile viewport only)
 * - Basic WebSocket mock smoke test
 * 
 * Runs in ~2-3 minutes vs. full suite which takes 10+ minutes.
 */

export default defineConfig({
  testDir: './e2e',
  // Smoke tests run faster - can use parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 2 : '50%', // Dynamic workers: 50% of CPU cores locally, 2 in CI
  timeout: 30000, // 30s timeout (shorter for smoke tests)
  maxFailures: 3, // Allow a few failures before stopping
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Single retry in CI
  
  // Only run tests tagged with @smoke
  grep: /@smoke/,
  
  // Same reporters as full config - list for clean output
  reporter: [
    ['list'], // Clean list output - ASCII-only, no Unicode characters
    ['json', { outputFile: '../artifacts/playwright-report-smoke.json' }],
    ['html', { 
      outputFolder: '../artifacts/playwright-report-smoke',
      open: 'never'
    }],
  ],
  
  // Same output directory
  outputDir: '../artifacts/test-results-smoke',
  
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // Web servers - same as full config
  webServer: process.env.SKIP_WEB_SERVER ? undefined : [
    {
      command: 'npm run dev:e2e',
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: process.env.DEBUG ? 'pipe' : 'ignore',
      stderr: process.env.DEBUG ? 'pipe' : 'ignore',
      env: {
        NODE_ENV: 'test',
        PORT: '8000',
        ALLOW_SERVER_START: 'true',
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: process.env.DEBUG ? 'pipe' : 'ignore',
      stderr: process.env.DEBUG ? 'pipe' : 'ignore',
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://localhost:8000',
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
  ],
  
  // Smoke tests: Chromium (desktop + mobile) + WebKit (desktop) for fast feedback
  // Runs in ~2-3 minutes with 3 projects in parallel
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Mobile Chrome'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

