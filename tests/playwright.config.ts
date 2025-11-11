import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid port conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid server conflicts
  timeout: 60000, // 60s timeout per test
  // Reporters: list for console, json for artifacts, html for review (never auto-open)
  reporter: [
    ['list'], // Console output
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
  ],
  // Web servers - set SKIP_WEB_SERVER=1 to use manually started servers
  // Otherwise, Playwright will start servers automatically
  webServer: process.env.SKIP_WEB_SERVER ? undefined : [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: true,
      timeout: 90000, // 90s for initial compile
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 90000, // 90s for initial compile
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
