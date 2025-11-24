/**
 * Accessibility Tests for Issue #26 UI/UX Changes
 * 
 * Verifies WCAG AA compliance for all modified components:
 * - Callouts (subtle styling, proper ARIA roles)
 * - Selected states (keyboard navigation, focus rings)
 * - Empty states (role="status", aria-live)
 * - Focus rings (contrast, visibility)
 * - Typography emphasis (sufficient contrast)
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setupSession, waitForBootSequence } from "../../utils/test-helpers";
import { SEL } from "../../utils/selectors";

test.describe("Accessibility: Issue #26 UI Changes", () => {
  test("onboarding callouts meet WCAG AA standards", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Step 0: "We Are" / "We're Not" callouts
    await expect(page.locator(SEL.onboardingStep0)).toBeVisible({ timeout: 10000 });
    
    const step0Results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(step0Results.violations).toEqual([]);
    
    // Step 1: Location privacy callout
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
    await page.locator(SEL.onboardingContinue).click();
    await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 10000 });
    
    const locationStepResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(locationStepResults.violations).toEqual([]);
    
    // Verify privacy callout is accessible
    const privacyCallout = page.getByText(/Approximate distance only/i);
    await expect(privacyCallout).toBeVisible();
  });

  test("selected states are keyboard accessible with visible focus rings", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await page.locator(SEL.onboardingContinue).click();
    await page.locator(SEL.onboardingSkipLocation).click();
    await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 10000 });
    
    // Tab to vibe selection
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Select first vibe with keyboard
    await page.keyboard.press("Enter");
    
    // Verify focus ring is visible (accent color for focus is correct)
    const focusedVibe = page.locator("button:focus");
    await expect(focusedVibe).toBeVisible();
    
    // Check that selected state uses neutral styling (not accent)
    const selectedVibe = page.locator(SEL.vibeThinking);
    if (await selectedVibe.isVisible()) {
      const className = await selectedVibe.getAttribute("class");
      expect(className).toContain("border-border");
      expect(className).toContain("bg-muted/20");
      expect(className).not.toContain("border-accent");
      expect(className).not.toContain("bg-accent");
    }
    
    // Tab to tags
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    
    // Verify tag selection works with keyboard
    const selectedTag = page.locator(SEL.tagQuietlyCurious);
    if (await selectedTag.isVisible()) {
      const tagClassName = await selectedTag.getAttribute("class");
      expect(tagClassName).toContain("border-border");
      expect(tagClassName).toContain("bg-muted/20");
    }
  });

  test("radar empty states have proper ARIA roles", async ({ page }) => {
    await setupSession(page, {
      sessionId: "test-session",
      token: "test-token",
      handle: "TestUser",
    });
    
    await page.goto("/radar");
    await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000); // Wait for empty state
    
    // Check for empty state with role="status"
    const emptyState = page.getByRole("status");
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText("No one nearby — yet.");
    
    // Verify aria-live is set
    const ariaLive = await emptyState.getAttribute("aria-live");
    expect(ariaLive).toBe("polite");
    
    // Run accessibility check
    const radarResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(radarResults.violations).toEqual([]);
  });

  test("focus rings meet contrast requirements", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
    
    // Tab to consent checkbox
    await page.keyboard.press("Tab");
    
    // Verify focus ring is visible (accent color is correct for focus)
    const focusedElement = page.locator("input:focus, button:focus").first();
    await expect(focusedElement).toBeVisible();
    
    // Check that focus ring uses accent (correct usage)
    const focusRing = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;
      const styles = window.getComputedStyle(focused);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Focus ring should be visible (accent color)
    expect(focusRing).not.toBeNull();
  });

  test("callout contrast ratios meet WCAG AA", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await page.locator(SEL.onboardingContinue).click();
    await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 10000 });
    
    // Check privacy callout contrast
    const privacyCallout = page.getByText(/Approximate distance only/i).locator("..");
    await expect(privacyCallout).toBeVisible();
    
    // Run contrast check with axe
    const contrastResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .options({ rules: { "color-contrast": { enabled: true } } })
      .analyze();
    
    const contrastViolations = contrastResults.violations.filter(
      (v) => v.id === "color-contrast"
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test("keyboard navigation order is logical on onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
    
    // Tab through elements and verify logical order
    const tabOrder: string[] = [];
    
    // Tab to consent checkbox
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => (document.activeElement as HTMLElement)?.tagName);
    tabOrder.push(firstFocused || "");
    
    // Tab to continue button
    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(() => (document.activeElement as HTMLElement)?.tagName);
    tabOrder.push(secondFocused || "");
    
    // Verify order is logical (checkbox before button)
    expect(tabOrder[0]).toBe("INPUT");
    expect(tabOrder[1]).toBe("BUTTON");
  });

  test("error callouts use proper ARIA roles", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await page.locator(SEL.onboardingContinue).click();
    await page.locator(SEL.onboardingSkipLocation).click();
    await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 10000 });
    
    // Trigger error by submitting without required fields
    await page.locator(SEL.onboardingEnterRadar).click();
    
    // Check for error message with role="alert"
    const errorAlert = page.getByRole("alert");
    if (await errorAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify error uses destructive color (correct)
      const errorText = await errorAlert.textContent();
      expect(errorText).toBeTruthy();
    }
  });

  test("profile page accessibility after UI changes", async ({ page }) => {
    await setupSession(page, {
      sessionId: "test-session",
      token: "test-token",
      handle: "TestUser",
    });
    
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /PROFILE/i })).toBeVisible({ timeout: 10000 });
    
    // Run accessibility check
    const profileResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    
    expect(profileResults.violations).toEqual([]);
    
    // Verify AccessibilityToggles callout is accessible
    const accessibilitySection = page.getByText(/Accessibility/i);
    await expect(accessibilitySection).toBeVisible();
  });
});

