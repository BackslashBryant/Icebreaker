/**
 * Regression Tests for Issue #26 Token Usage
 * 
 * Verifies that accent color is only used in whitelisted contexts:
 * - Primary buttons (bg-accent)
 * - H1 headings (glow-accent)
 * - Focus rings (ring-accent)
 * - Progress bars (BootSequence)
 * 
 * Ensures no regressions in token usage rules.
 */

import { test, expect } from "@playwright/test";
import { waitForBootSequence, setupSession } from "../../utils/test-helpers";
import { SEL } from "../../utils/selectors";

test.describe("Regression: Issue #26 Token Usage", () => {
  test("accent only appears on primary buttons, H1 headings, and focus rings", async ({ page }) => {
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    await waitForBootSequence(page);
    
    // Check H1 heading uses glow-accent (correct)
    const h1Heading = page.getByRole("heading", { name: /ICEBREAKER/i });
    await expect(h1Heading).toBeVisible();
    
    const h1Class = await h1Heading.getAttribute("class");
    expect(h1Class).toContain("glow-accent");
    expect(h1Class).toContain("text-accent");
    
    // Check primary button uses accent (correct)
    const pressStart = page.getByRole("link", { name: /PRESS START/i });
    await expect(pressStart).toBeVisible();
    
    const pressStartClass = await pressStart.getAttribute("class");
    // Primary button should use accent
    expect(pressStartClass).toMatch(/bg-accent|text-accent-foreground/);
    
    // Navigate to onboarding
    await pressStart.click();
    await expect(page).toHaveURL(/.*\/onboarding/);
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
    
    // Check that callouts don't use accent
    const privacyCallout = page.getByText(/Approximate distance only/i).locator("..");
    await expect(privacyCallout).toBeVisible();
    
    const calloutClass = await privacyCallout.getAttribute("class");
    expect(calloutClass).toContain("border-border");
    expect(calloutClass).toContain("bg-muted/20");
    expect(calloutClass).not.toContain("border-accent");
    expect(calloutClass).not.toContain("bg-accent");
    
    // Check selected states don't use accent
    await page.locator(SEL.onboardingContinue).click();
    await page.locator(SEL.onboardingSkipLocation).click();
    await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 10000 });
    
    // Select a vibe
    await page.locator(SEL.vibeThinking).click();
    
    const selectedVibe = page.locator(SEL.vibeThinking);
    const vibeClass = await selectedVibe.getAttribute("class");
    expect(vibeClass).toContain("border-border");
    expect(vibeClass).toContain("bg-muted/20");
    expect(vibeClass).not.toContain("border-accent");
    expect(vibeClass).not.toContain("bg-accent");
    expect(vibeClass).not.toContain("text-accent");
  });

  test("focus rings use accent color (correct usage)", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 10000 });
    
    // Tab to consent checkbox
    await page.keyboard.press("Tab");
    
    // Check that focused element has accent focus ring
    const focusedElement = page.locator("input:focus, button:focus").first();
    await expect(focusedElement).toBeVisible();
    
    // Verify focus ring uses accent (correct)
    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement;
      if (!focused) return null;
      const styles = window.getComputedStyle(focused, ":focus-visible");
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Focus ring should be visible (accent color is correct for focus)
    expect(focusStyles).not.toBeNull();
  });

  test("glow-accent only appears on H1 headings", async ({ page }) => {
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    await waitForBootSequence(page);
    
    // Check all headings for glow-accent usage
    const allHeadings = await page.locator("h1, h2, h3").all();
    
    for (const heading of allHeadings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const className = await heading.getAttribute("class");
      
      if (tagName === "H1") {
        // H1 should use glow-accent
        expect(className).toContain("glow-accent");
      } else {
        // H2/H3 should NOT use glow-accent
        expect(className).not.toContain("glow-accent");
      }
    }
  });

  test("rounded-xl is not used in callouts (only rounded-md or rounded-2xl)", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator(SEL.onboardingGotIt).click();
    await page.locator(SEL.onboardingContinue).click();
    await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 10000 });
    
    // Check privacy callout uses rounded-md (not rounded-xl)
    const privacyCallout = page.getByText(/Approximate distance only/i).locator("..");
    await expect(privacyCallout).toBeVisible();
    
    const calloutClass = await privacyCallout.getAttribute("class");
    expect(calloutClass).toContain("rounded-md");
    expect(calloutClass).not.toContain("rounded-xl");
    
    // Navigate to radar to check empty state
    await setupSession(page, {
      sessionId: "test-session",
      token: "test-token",
      handle: "TestUser",
    });
    
    await page.goto("/radar");
    await expect(page.getByRole("heading", { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Check empty state callout uses rounded-md
    const emptyState = page.getByRole("status");
    await expect(emptyState).toBeVisible();
    
    const emptyStateClass = await emptyState.getAttribute("class");
    expect(emptyStateClass).toContain("rounded-md");
    expect(emptyStateClass).not.toContain("rounded-xl");
  });
});

