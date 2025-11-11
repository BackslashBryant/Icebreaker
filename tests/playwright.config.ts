import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid port conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid server conflicts
  timeout: 60000, // 60s timeout per test
  // Reporters: line for real-time progress (ASCII-friendly, clean, transparent), json for artifacts, html for review (never auto-open)
  reporter: [
    ['line'], // Real-time single-line updates - shows current test name and progress, ASCII-only with NO_COLOR=1
    ['json', { outputFile: '../artifacts/playwright-report.json' }], // Machine-readable for CI/review
    ['html', { 
      outputFolder: '../artifacts/playwright-report',
      open: 'never' // Never auto-open browser
    }],
  ],
  // Output directories
  outputDir: '../artifacts/test-results',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10000, // 10s timeout for actions
    navigationTimeout: 30000, // 30s timeout for navigation
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'] },
    },
  ],
  // Web servers - set SKIP_WEB_SERVER=1 to use manually started servers
  // Otherwise, Playwright will start servers automatically
  webServer: process.env.SKIP_WEB_SERVER ? undefined : [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: !process.env.CI, // Reuse in local dev, start fresh in CI
      timeout: 90000, // 90s for initial compile
      stdout: 'ignore',
      stderr: 'ignore', // Suppress stderr to prevent node process warnings
      env: {
        NODE_ENV: 'test',
        // Suppress Node.js warnings about process termination and deprecations
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI, // Reuse in local dev, start fresh in CI
      timeout: 90000, // 90s for initial compile
      stdout: 'ignore',
      stderr: 'ignore', // Suppress stderr to prevent node process warnings
      env: {
        NODE_ENV: 'test',
        // Suppress Node.js warnings about process termination and deprecations
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
  ],
});
