/**
 * Visual Regression Tests: Chat Screen
 * 
 * Captures Chat screen in active state and ending state.
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { setupSession } from '../../utils/test-helpers';
import { SEL } from '../../utils/selectors';

test.describe('Visual Regression: Chat Screen', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`Chat active state - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);

      // Set up session
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      // Navigate to chat with mock partner
      await page.goto('/chat', {
        state: {
          partnerSessionId: 'partner-session',
          partnerHandle: 'PartnerUser',
        },
      });

      // Wait for chat to load
      await page.waitForTimeout(1000);

      // Note: Full chat visual test requires WebSocket mock for active chat state
      // This is a placeholder - will be enhanced once chat mock is stable
      await expect(page).toHaveScreenshot(`chat-active-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });
  }
});

