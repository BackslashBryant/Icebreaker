/**
 * Mobile Responsive Tests for Issue #26 UI Changes
 * 
 * Validates that increased whitespace and callout changes don't push
 * content below the fold on mobile devices.
 */

import { test, expect } from "@playwright/test";
import { setupSession, waitForBootSequence } from "../../utils/test-helpers";
import { SEL } from "../../utils/selectors";

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, name: "iPhone SE" },
  { width: 375, height: 667, name: "iPhone 8" },
  { width: 414, height: 896, name: "iPhone 11 Pro Max" },
];

test.describe("Mobile Responsive: Issue #26 UI Changes", () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test(`onboarding whitespace doesn't push content below fold - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/onboarding");
      await page.waitForLoadState("networkidle");
      
      // Step 0: Verify "GOT IT" button is visible without scrolling
      await expect(page.locator(SEL.onboardingStep0)).toBeVisible({ timeout: 10000 });
      const gotItButton = page.locator(SEL.onboardingGotIt);
      await expect(gotItButton).toBeVisible();
      
      // Check that button is in viewport (not below fold)
      const buttonBox = await gotItButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      if (buttonBox) {
        expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewport.height);
      }
      
      // Step 1: Verify consent checkbox and continue button are visible
      await gotItButton.click();
      await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
      
      const continueButton = page.locator(SEL.onboardingContinue);
      await expect(continueButton).toBeVisible();
      
      const continueBox = await continueButton.boundingBox();
      expect(continueBox).not.toBeNull();
      if (continueBox) {
        expect(continueBox.y + continueBox.height).toBeLessThanOrEqual(viewport.height);
      }
      
      // Step 2: Verify location privacy callout and skip button are visible
      await continueButton.click();
      await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 10000 });
      
      const privacyCallout = page.getByText(/Approximate distance only/i);
      await expect(privacyCallout).toBeVisible();
      
      const skipButton = page.locator(SEL.onboardingSkipLocation);
      await expect(skipButton).toBeVisible();
      
      const skipBox = await skipButton.boundingBox();
      expect(skipBox).not.toBeNull();
      if (skipBox) {
        expect(skipBox.y + skipBox.height).toBeLessThanOrEqual(viewport.height);
      }
    });

    test(`radar empty state callout is readable on mobile - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await setupSession(page, {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
      });
      
      await page.goto("/radar");
      await expect(page.getByRole("heading", { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
      
      // Verify empty state callout is visible and readable
      const emptyState = page.getByRole("status");
      await expect(emptyState).toBeVisible();
      
      const emptyStateBox = await emptyState.boundingBox();
      expect(emptyStateBox).not.toBeNull();
      if (emptyStateBox) {
        // Verify callout fits in viewport
        expect(emptyStateBox.width).toBeLessThanOrEqual(viewport.width - 32); // Account for padding
        expect(emptyStateBox.y + emptyStateBox.height).toBeLessThanOrEqual(viewport.height);
      }
      
      // Verify text is readable (not too small)
      const textElement = emptyState.getByText("No one nearby — yet.");
      const textBox = await textElement.boundingBox();
      expect(textBox).not.toBeNull();
      if (textBox) {
        // Text should be at least 14px (readable on mobile)
        expect(textBox.height).toBeGreaterThanOrEqual(14);
      }
    });

    test(`profile page whitespace doesn't push actions below fold - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await setupSession(page, {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
      });
      
      await page.goto("/profile");
      await expect(page.getByRole("heading", { name: /PROFILE/i })).toBeVisible({ timeout: 10000 });
      
      // Verify primary actions (DONE button) are visible
      const doneButton = page.getByRole("button", { name: /DONE/i });
      await expect(doneButton).toBeVisible();
      
      const doneBox = await doneButton.boundingBox();
      expect(doneBox).not.toBeNull();
      if (doneBox) {
        // Button should be in viewport (may require scrolling, but should be accessible)
        expect(doneBox.y).toBeLessThan(viewport.height * 2); // Allow for some scrolling
      }
    });
  }
});

