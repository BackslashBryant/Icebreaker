/**
 * Visual Regression Tests: Theme/Viewport Matrix
 *
 * Tests all key screens across all theme/viewport/accessibility combinations.
 * Generates 24 combinations per screen (3 viewports × 2 themes × 2 reduced-motion × 2 high-contrast).
 * Captures screenshots and runs accessibility checks for each combination.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  getThemeMatrix,
  applyThemeSettings,
  generateScreenshotName,
  type ThemeMatrixConfig,
} from '../../utils/theme-matrix';
import { setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { waitForBootSequence, setupSession } from '../../utils/test-helpers';
import { SEL } from '../../utils/selectors';

// Get all theme/viewport combinations (24 total: 3 viewports × 8 theme combinations)
const themeMatrix = getThemeMatrix(['mobile', 'tablet', 'desktop']);

/**
 * Helper to navigate to onboarding step
 */
async function navigateToOnboardingStep(
  page: any,
  step: number,
): Promise<void> {
  await page.goto('/onboarding');

  if (step >= 1) {
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 15000 });
  }

  if (step >= 2) {
    await page.locator(SEL.onboardingContinue).click();
    await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 15000 });
  }

  if (step >= 3) {
    await page.locator(SEL.onboardingSkipLocation).click();
    await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 15000 });
    // Select a vibe and tag for visual consistency
    await page.locator(SEL.vibeThinking).click();
    await page.locator(SEL.tagQuietlyCurious).click();
  }
}

/**
 * Helper to run accessibility check
 */
async function runAccessibilityCheck(page: any): Promise<void> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
}

/**
 * Helper to test a screen with all theme combinations
 */
function testScreenWithMatrix(
  screenName: string,
  navigateFn: (page: any, config: ThemeMatrixConfig) => Promise<void>,
  waitForVisible?: string,
): void {
  test.describe(`Visual Regression: ${screenName} - Theme Matrix`, () => {
    for (const config of themeMatrix) {
      const screenshotName = generateScreenshotName(
        screenName.toLowerCase().replace(/\s+/g, '-'),
        config.viewport.name,
        config.theme,
      );

      const testName = `${screenName} - ${config.viewport.name} - ${config.theme.colorScheme} - ${config.theme.reducedMotion} - ${config.theme.highContrast}`;

      test(testName, async ({ page }) => {
        // Set viewport
        await setViewport(page, config.viewport);

        // Apply theme settings
        await applyThemeSettings(page, config.theme);

        // Navigate to screen
        await navigateFn(page, config);

        // Wait for content to be visible
        if (waitForVisible) {
          await expect(page.locator(waitForVisible)).toBeVisible({ timeout: 15000 });
        }

        // Wait for page to stabilize
        await page.waitForTimeout(500);

        // Capture screenshot
        await expect(page).toHaveScreenshot(screenshotName, {
          fullPage: true,
          mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
        });

        // Run accessibility check
        await runAccessibilityCheck(page);
      });
    }
  });
}

// Welcome Screen
testScreenWithMatrix(
  'welcome',
  async (page) => {
    await page.goto('/welcome');
    await waitForBootSequence(page);
  },
  SEL.ctaPressStart,
);

// Onboarding Step 0
testScreenWithMatrix(
  'onboarding-step-0',
  async (page) => {
    await page.goto('/onboarding');
  },
  SEL.onboardingStep0,
);

// Onboarding Step 1
testScreenWithMatrix(
  'onboarding-step-1',
  async (page) => {
    await navigateToOnboardingStep(page, 1);
  },
  SEL.onboardingStep1,
);

// Onboarding Step 2
testScreenWithMatrix(
  'onboarding-step-2',
  async (page) => {
    await navigateToOnboardingStep(page, 2);
  },
  SEL.onboardingStep2,
);

// Onboarding Step 3
testScreenWithMatrix(
  'onboarding-step-3',
  async (page) => {
    await navigateToOnboardingStep(page, 3);
  },
  SEL.onboardingStep3,
);

// Radar Screen
testScreenWithMatrix(
  'radar',
  async (page) => {
    await setupSession(page, {
      sessionId: 'test-session',
      token: 'test-token',
      handle: 'TestUser',
    });
    await page.goto('/radar');
  },
  SEL.radarHeading,
);

// Chat Screen
testScreenWithMatrix(
  'chat',
  async (page) => {
    await setupSession(page, {
      sessionId: 'test-session',
      token: 'test-token',
      handle: 'TestUser',
    });
    await page.goto('/chat');
  },
  SEL.chatHeader,
);

// Profile Screen
// Note: Uses setupSession to avoid full onboarding flow for each combination (performance optimization)
testScreenWithMatrix(
  'profile',
  async (page) => {
    // Mock profile API endpoints
    await page.route('**/api/profile/visibility', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, visibility: true }),
      });
    });

    // Use setupSession instead of full onboarding to avoid repeating onboarding 24 times
    await setupSession(page, {
      sessionId: 'test-session-id',
      token: 'test-token',
      handle: 'TestUser',
    });

    // Navigate directly to profile
    await page.goto('/profile');
  },
  SEL.visibilityToggle,
);

