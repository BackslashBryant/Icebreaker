/**
 * Visual Regression Tests: Welcome Screen
 * 
 * Captures Welcome screen across different viewports to detect visual regressions.
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { waitForBootSequence } from '../../utils/test-helpers';

test.describe('Visual Regression: Welcome Screen', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`@smoke Welcome screen - ${viewport.name === 'mobile' ? viewport.name : 'skip'}`, async ({ page }) => {
      // Only run mobile viewport for smoke tests
      if (viewport.name !== 'mobile') {
        test.skip();
      }
      // Set viewport
      await setViewport(page, viewport);

      // Navigate to welcome screen
      await page.goto('/welcome');
      await waitForBootSequence(page);

      // Wait for content to be visible
      await expect(page.getByText('ICEBREAKER')).toBeVisible({ timeout: 15000 });

      // Take screenshot with dynamic content masked
      await expect(page).toHaveScreenshot(`welcome-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });
  }
});

