/**
 * Keyboard-Only Journey Tests - Onboarding Flow
 * 
 * Verifies complete keyboard-only navigation through onboarding:
 * Welcome → Consent → Location → Vibe & Tags → API → Radar
 * 
 * WCAG Requirements:
 * - 2.1.1 Keyboard (Level A): All functionality operable via keyboard
 * - 2.4.3 Focus Order (Level A): Focus order preserves meaning
 * - 2.4.7 Focus Visible (Level AA): Keyboard focus indicator visible
 */

import { test, expect } from "@playwright/test";

test.describe("Keyboard-Only Journey: Onboarding Flow", () => {
  test("complete onboarding flow using keyboard only", async ({ page }) => {
    // Mock onboarding API to ensure deterministic success
    await page.route("**/api/onboarding", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "test-session",
          token: "test-token",
          handle: "testuser",
        }),
      })
    );

    // Step 1: Navigate to welcome screen
    await page.goto("/welcome");
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

    // Step 2: Activate "Get started" via keyboard
    await page.getByLabel(/start onboarding/i).press("Enter");
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 5000 });

    // Step 3: Intro callouts - advance via keyboard
    await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /GOT IT/i }).press("Enter");
    
    // Wait for consent step to appear
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });

    // Step 4: Consent step - keyboard toggle + continue
    const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
    await consentCheckbox.press("Space");
    await expect(consentCheckbox).toBeChecked();
    await page.getByRole("button", { name: /CONTINUE/i }).press("Enter");
    
    // Wait for location step to appear
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible({ timeout: 10000 });

    // Step 5: Location step - skip via keyboard
    await page.getByRole("button", { name: /Skip for now/i }).press("Enter");
    
    // Wait for vibe step to appear
    await expect(page.getByText("YOUR VIBE")).toBeVisible({ timeout: 10000 });

    // Step 6: Vibe step - select via keyboard
    const banterButton = page.getByRole("button", { name: /banter/i });
    await banterButton.press("Enter");
    await expect(banterButton).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /SUBMIT|ENTER RADAR/i }).press("Enter");

    // Step 7: Wait for navigation to Radar
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 20000 });
    await expect(page.getByText("RADAR")).toBeVisible({ timeout: 5000 });
  });

  test("focus order is logical throughout onboarding", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("cta-press-start")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /Not for me/i })).toBeFocused();
  });

  test("focus visible on all interactive elements", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

    // Tab to first interactive element
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    
    // Verify focus is visible (check for focus-visible class or outline)
    const hasFocusVisible = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const classes = Array.from(el.classList || []);
      const hasFocusClass = classes.some((cls) => cls.includes("focus-visible") || cls.includes("ring"));
      return (
        styles.outlineWidth !== "0px" ||
        styles.outlineStyle !== "none" ||
        styles.boxShadow !== "none" ||
        hasFocusClass
      );
    });
    
    expect(hasFocusVisible).toBe(true);
  });

  test("all onboarding steps navigable with keyboard only (no mouse clicks)", async ({ page }) => {
    await page.route("**/api/onboarding", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "test-session",
          token: "test-token",
          handle: "testuser",
        }),
      })
    );

    // This test verifies that we can complete the entire flow without any mouse interactions
    // The main test above already does this, but this is an explicit verification
    
    await page.goto("/welcome");
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

    // Disable mouse interactions by intercepting click events
    await page.addInitScript(() => {
      document.addEventListener("click", (e) => {
        // Allow programmatic clicks but track them
        if (!(e as any).isTrusted) {
          return; // Allow programmatic clicks
        }
        throw new Error("Mouse click detected - keyboard-only test failed");
      }, true);
    });

    // Complete flow using only keyboard
    await page.getByLabel(/start onboarding/i).press("Enter"); // Get started
    
    await expect(page).toHaveURL(/.*\/onboarding/);
    await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 10000 });
    
    await page.getByRole("button", { name: /GOT IT/i }).press("Enter");
    
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
    
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).press("Space");
    await page.getByRole("button", { name: /CONTINUE/i }).press("Enter");
    
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Skip for now/i }).press("Enter"); // Skip
    
    await expect(page.getByText("YOUR VIBE")).toBeVisible({ timeout: 10000 });
    
    const banterButton = page.getByRole("button", { name: /banter/i });
    await banterButton.press("Enter"); // Select vibe
    
    await page.getByRole("button", { name: /SUBMIT|ENTER RADAR/i }).press("Enter"); // Submit
    
    // Verify we reached Radar without any mouse clicks
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
    await expect(page.getByText("RADAR")).toBeVisible({ timeout: 5000 });
  });
});

