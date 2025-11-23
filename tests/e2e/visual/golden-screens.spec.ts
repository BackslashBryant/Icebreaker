/**
 * Golden Screens Visual Regression Tests
 * 
 * Captures the five "Golden Screens" that represent key user journeys:
 * 1. Welcome screen
 * 2. Onboarding Step 0 (Consent)
 * 3. Onboarding Step 1 (Location)
 * 4. Onboarding Step 2 (Vibe)
 * 5. Onboarding Step 3 (Tags)
 * 6. Radar empty state
 * 7. Chat empty state
 * 8. Profile screen
 * 
 * These screens are used for visual regression testing and must pass before merge.
 * Any visual changes require explicit approval.
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { setupSession, waitForBootSequence } from '../../utils/test-helpers';
import { SEL } from '../../utils/selectors';

test.describe('Golden Screens: Visual Regression', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`Golden Screen 1: Welcome - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/welcome');
      await waitForBootSequence(page);
      await expect(page.getByText('ICEBREAKER')).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-welcome-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 2: Onboarding Step 0 (Consent) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await expect(page.locator(SEL.onboardingStep0)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-onboarding-step-0-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 3: Onboarding Step 1 (Location) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-onboarding-step-1-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 4: Onboarding Step 2 (Vibe) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      // Check consent checkbox before clicking Continue
      await page.locator('label[for="consent"]').click();
      await page.locator(SEL.onboardingContinue).click();
      await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 15000 });

      // Select a vibe for visual consistency
      await page.locator(SEL.vibeThinking).click();

      await expect(page).toHaveScreenshot(`golden-onboarding-step-2-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 5: Onboarding Step 3 (Tags) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      // Check consent checkbox before clicking Continue
      await page.locator('label[for="consent"]').click();
      await page.locator(SEL.onboardingContinue).click();
      await page.locator(SEL.onboardingSkipLocation).click();
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 15000 });

      // Select a vibe and tag for visual consistency
      await page.locator(SEL.vibeThinking).click();
      await page.locator(SEL.tagQuietlyCurious).click();

      await expect(page).toHaveScreenshot(`golden-onboarding-step-3-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 6: Radar Empty State - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/radar');
      await expect(page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000); // Wait for empty state to render

      await expect(page).toHaveScreenshot(`golden-radar-empty-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 7: Chat Empty State - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/chat');
      await page.waitForTimeout(1000); // Wait for empty state to render

      await expect(page).toHaveScreenshot(`golden-chat-empty-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 8: Profile Screen - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
        tags: ['Quietly Curious'],
        vibe: 'thinking',
      });

      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: /PROFILE/i })).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-profile-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });
  }
});

