import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid port conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid server conflicts
  timeout: 60000, // 60s timeout per test
  maxFailures: 1, // Fail fast - stop on first failure
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
          // Firefox and Edge tests disabled temporarily due to timeout issues
          // Re-enable after investigating server startup timing
          // {
          //   name: 'firefox',
          //   use: { ...devices['Desktop Firefox'] },
          // },
          // {
          //   name: 'msedge',
          //   use: { ...devices['Desktop Edge'] },
          // },
        ],
  // Web servers - automatically start backend and frontend servers for tests
  // Set SKIP_WEB_SERVER=1 to use manually started servers instead
  // Servers are started in parallel, but backend must be ready before frontend can proxy
  webServer: process.env.SKIP_WEB_SERVER ? undefined : [
    // Backend server - must start first (frontend proxies to it)
    {
      command: 'npm run dev:e2e',
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      reuseExistingServer: !process.env.CI, // Reuse in local dev, start fresh in CI
      timeout: 120000, // 120s for initial compile (backend may need more time)
      stdout: process.env.DEBUG ? 'pipe' : 'ignore',
      stderr: process.env.DEBUG ? 'pipe' : 'ignore',
      env: {
        NODE_ENV: 'test',
        PORT: '8000',
        ALLOW_SERVER_START: 'true', // Allow server to start in test mode for E2E tests
        // Suppress Node.js warnings about process termination and deprecations
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
    // Frontend server - starts after backend is ready
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI, // Reuse in local dev, start fresh in CI
      timeout: 120000, // 120s for initial compile (Vite may need time)
      stdout: process.env.DEBUG ? 'pipe' : 'ignore',
      stderr: process.env.DEBUG ? 'pipe' : 'ignore',
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://localhost:8000',
        // Suppress Node.js warnings about process termination and deprecations
        NODE_OPTIONS: '--no-warnings --no-deprecation',
      },
    },
  ],
});
