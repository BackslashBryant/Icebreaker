/**
 * Simple test to verify WebSocket mock infrastructure
 * 
 * This test verifies that the mock can be injected and used.
 * Full multi-user tests will be added in Step 3.
 */

import { test, expect } from '../fixtures/ws-mock.setup';
import { waitForBootSequence, setupSession } from '../../utils/test-helpers';

test.describe('WebSocket Mock Infrastructure', () => {
  test('@smoke mock is injected and available', async ({ page, wsMock, presenceScript }) => {
    // Navigate to a page so addInitScript executes
    await page.goto('/welcome');
    
    // Verify mock is available in browser context
    const mockAvailable = await page.evaluate(() => {
      return typeof (window as any).__WS_MOCK__ !== 'undefined';
    });
    expect(mockAvailable).toBe(true);

    // Verify presence script has personas
    expect(presenceScript.personas.length).toBeGreaterThan(0);
    expect(presenceScript.personas[0].sessionId).toBe('maya-session');
  });

  test('can set up session and connect to mock', async ({ page, wsMock }) => {
    // Set up Maya's session
    await setupSession(page, {
      sessionId: 'maya-session',
      token: 'maya-token',
      handle: 'QuietThinker42',
    });

    await page.goto('/radar');
    await waitForBootSequence(page);

    // Wait for WebSocket connection (mock should send radar:update)
    // This is a basic smoke test - full multi-user tests in Step 3
    await page.waitForTimeout(1000);

    // Verify page loaded (basic check)
    const url = page.url();
    expect(url).toContain('/radar');
  });
});

