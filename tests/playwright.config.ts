import { defineConfig, devices } from '@playwright/test';

// Calculate optimal worker count based on available CPU cores
// - CI: Use 2 workers (conservative for resource-constrained environments)
// - Local: Use 50% of CPU cores (Playwright's default is 50%, but we're explicit)
// - Override: Set PLAYWRIGHT_WORKERS env var to override (e.g., "25%", "2", "4")
function getWorkerCount(): number | string {
  if (process.env.CI) {
    return 2; // CI environments - conservative
  }
  
  // Use percentage string for Playwright's built-in optimization
  // This allows Playwright to adjust based on test complexity
  return process.env.PLAYWRIGHT_WORKERS || '50%';
}

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000, // 60s timeout per test
  maxFailures: process.env.CI ? 1 : 3, // Fail fast in CI, allow more failures locally
  // Reporters: list for real-time output with pass/fail indicators, json for artifacts, html for review (never auto-open)
  reporter: [
    ['list'], // List reporter - shows tests as they run with ✓/✗ indicators, clean ASCII output
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
    // Note: Chrome-specific launch options (--disable-dev-shm-usage, --disable-gpu)
    // are set per-project below to avoid WebKit compatibility issues
  },
  // Visual regression settings (Issue #17)
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02, // 2% diff threshold - fail if more than 2% of pixels differ
      animations: 'disabled', // Disable animations for consistent snapshots
      scale: 'css', // Use CSS pixels for consistent sizing across devices
    },
  },
        projects: [
    // Stateful tests: Serial execution (performance, persona flows, WebSocket-dependent)
    // Required for persona and performance tests that need sequential execution
    {
      name: 'stateful',
      testMatch: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      workers: 1, // Serial execution - one test at a time
      fullyParallel: false, // Disable parallel execution for stateful tests
      use: { 
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : undefined, // Headless in CI, default locally
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
    },
    // Browser × Viewport Matrix Projects
    // Desktop projects
    {
      name: 'chromium-desktop',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : undefined,
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
    },
    {
      name: 'chromium-mobile',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['Mobile Chrome'],
        headless: process.env.CI ? true : undefined,
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
    },
    {
      name: 'firefox-desktop',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['Desktop Firefox'],
        headless: process.env.CI ? true : undefined,
      },
    },
    {
      name: 'firefox-mobile',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['Mobile Firefox'],
        headless: process.env.CI ? true : undefined,
      },
    },
    {
      name: 'webkit-desktop',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['Desktop Safari'],
        headless: process.env.CI ? true : undefined,
      },
    },
    {
      name: 'webkit-mobile',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        ...devices['iPhone 13'],
        headless: process.env.CI ? true : undefined,
      },
    },
    {
      name: 'msedge-desktop',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
        headless: process.env.CI ? true : undefined,
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
    },
    {
      name: 'msedge-mobile',
      testMatch: /.*\.(spec|test)\.ts/,
      testIgnore: [/performance\.spec\.ts/, /personas\/.*\.spec\.ts/],
      fullyParallel: true,
      workers: getWorkerCount(),
      use: {
        channel: 'msedge',
        viewport: { width: 390, height: 844 }, // iPhone 13 viewport without device emulation (avoids channel conflicts)
        headless: process.env.CI ? true : undefined,
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
    },
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
