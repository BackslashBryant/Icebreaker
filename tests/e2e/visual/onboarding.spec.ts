/**
 * Visual Regression Tests: Onboarding Steps
 * 
 * Captures each onboarding step across different viewports.
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { SEL } from '../../utils/selectors';

test.describe('Visual Regression: Onboarding Steps', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`Onboarding Step 0 - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await expect(page.locator(SEL.onboardingStep0)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`onboarding-step-0-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Onboarding Step 1 - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`onboarding-step-1-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Onboarding Step 2 - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      await page.locator(SEL.onboardingContinue).click();
      await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`onboarding-step-2-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Onboarding Step 3 - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      await page.locator(SEL.onboardingContinue).click();
      await page.locator(SEL.onboardingSkipLocation).click();
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 15000 });

      // Select a vibe and tag for visual consistency
      await page.locator(SEL.vibeThinking).click();
      await page.locator(SEL.tagQuietlyCurious).click();

      await expect(page).toHaveScreenshot(`onboarding-step-3-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });
  }
});

