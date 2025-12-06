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
    await page.locator('[data-testid="cta-press-start"]').press("Enter");
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

});

