/**
 * Visual Regression Tests: Radar Screen
 * 
 * Captures Radar screen in empty state and with users visible.
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { setupSession } from '../../utils/test-helpers';
import { SEL } from '../../utils/selectors';

test.describe('Visual Regression: Radar Screen', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`@smoke Radar empty state - ${viewport.name === 'mobile' ? viewport.name : 'skip'}`, async ({ page }) => {
      // Only run mobile viewport for smoke tests
      if (viewport.name !== 'mobile') {
        test.skip();
      }
      await setViewport(page, viewport);

      // Set up session
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/radar');
      await expect(page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait a bit for any loading states
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot(`radar-empty-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    // Note: Radar with users would require WebSocket mock setup
    // This will be added in a follow-up test once multi-user scenarios are stable
  }
});

