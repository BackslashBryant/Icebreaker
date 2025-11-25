import { test, expect } from '@playwright/test';

/**
 * Health Endpoint E2E Smoke Test
 *
 * MVP DoD: Playwright smoke test covers API + UI
 *
 * This test verifies:
 * - Health API endpoint is accessible and returns correct response
 * - Frontend page renders and displays health status
 * - Full end-to-end flow from API to UI
 */

// TODO: Update these URLs once ports are determined and servers are running
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Health Check E2E', () => {
  test('should fetch health API and return { status: "ok" }', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const body = await response.json();
    // Health API returns: { status: 'ok', websocket: { connected, connectionCount, sessionCount } }
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('websocket');
    expect(body.websocket).toHaveProperty('connected');
    expect(body.websocket).toHaveProperty('connectionCount');
    expect(body.websocket).toHaveProperty('sessionCount');
  });

  test('should display health status on frontend page', async ({ page }) => {
    // Navigate to health page
    await page.goto(`${FRONTEND_URL}/health`);

    // Wait for API response (health page fetches /api/health on mount)
    const response = await page.waitForResponse(
      (response) => response.url().includes('/api/health') && response.status() === 200,
      { timeout: 30000 }
    );
    expect(response.ok()).toBeTruthy();

    // Wait for health status to be displayed
    const healthStatus = page.locator('text=/ok/i');
    await expect(healthStatus).toBeVisible({ timeout: 10000 });
  });

  test('should show health status from API response', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/health`);

    // Wait for health status to be displayed, then verify it matches API response
    const healthStatus = page.locator('text=/ok/i');
    await expect(healthStatus).toBeVisible({ timeout: 30000 });
    
    const statusText = await healthStatus.textContent();
    expect(statusText).toContain('ok');
  });
});
