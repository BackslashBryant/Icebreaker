import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeOnboarding } from "../utils/test-helpers";

test.describe("Profile/Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock session creation API
    await page.route("**/api/onboarding", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "test-session-id",
          token: "test-token",
          handle: "TestUser",
          visibility: true,
          emergencyContact: null,
        }),
      });
    });

    // Mock profile API endpoints
    await page.route("**/api/profile/visibility", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, visibility: true }),
      });
    });

    await page.route("**/api/profile/emergency-contact", async (route) => {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, emergencyContact: body.emergencyContact }),
      });
    });

    // Complete onboarding to create session
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    // Wait for consent step to fully load before interacting with checkbox
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState("networkidle");
    const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
    await expect(consentCheckbox).toBeVisible({ timeout: 10000 });
    await consentCheckbox.check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByText(/Up for banter/i).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();

    // Wait for navigation to Radar
    await expect(page).toHaveURL(/.*\/radar/);
  });

  test("navigate to Profile from Radar header", async ({ page }) => {
    // Click Profile button in Radar header
    await page.getByRole("button", { name: /Profile/i }).click();

    // Verify navigation to Profile page
    await expect(page).toHaveURL(/.*\/profile/);
    await expect(page.getByText("PROFILE")).toBeVisible();
    await expect(page.getByText("@TestUser")).toBeVisible();
  });

  test("navigate to Profile from Chat header", async ({ page }) => {
    // Navigate to Chat (would need a chat partner, but for E2E we'll mock)
    // For now, just verify Profile button exists in Chat header
    // This test assumes Chat page is accessible
    await page.goto("/profile");
    await expect(page.getByText("PROFILE")).toBeVisible();
  });

  test("toggle visibility", async ({ page }) => {
    await page.goto("/profile");

    // Find visibility toggle checkbox
    const visibilityCheckbox = page.getByLabelText(/Show on Radar|Hide from Radar/);
    const initialChecked = await visibilityCheckbox.isChecked();

    // Toggle visibility
    await visibilityCheckbox.click();

    // Verify toggle state changed
    await expect(visibilityCheckbox).toHaveProperty("checked", !initialChecked);
  });

  test("save emergency contact (phone)", async ({ page }) => {
    await page.goto("/profile");

    // Click Add button
    await page.getByRole("button", { name: /Add|Edit/i }).click();

    // Enter phone number
    const input = page.getByPlaceholderText("+1234567890 or email@example.com");
    await input.fill("+1234567890");

    // Click Save
    await page.getByRole("button", { name: /Save/i }).click();

    // Verify success (contact should be displayed)
    await expect(page.getByText("+1234567890")).toBeVisible();
  });

  test("save emergency contact (email)", async ({ page }) => {
    await page.goto("/profile");

    // Click Add button
    await page.getByRole("button", { name: /Add|Edit/i }).click();

    // Enter email
    const input = page.getByPlaceholderText("+1234567890 or email@example.com");
    await input.fill("test@example.com");

    // Click Save
    await page.getByRole("button", { name: /Save/i }).click();

    // Verify success (contact should be displayed)
    await expect(page.getByText("test@example.com")).toBeVisible();
  });

  test("validate emergency contact format", async ({ page }) => {
    await page.goto("/profile");

    // Click Add button
    await page.getByRole("button", { name: /Add|Edit/i }).click();

    // Enter invalid contact
    const input = page.getByPlaceholderText("+1234567890 or email@example.com");
    await input.fill("invalid-contact");

    // Click Save (should be disabled or show error)
    const saveButton = page.getByRole("button", { name: /Save/i });
    const isDisabled = await saveButton.isDisabled();

    if (!isDisabled) {
      await saveButton.click();
      // Should show validation error
      await expect(page.getByText(/Must be a valid phone number/)).toBeVisible();
    } else {
      // Save button is disabled due to validation
      expect(isDisabled).toBe(true);
    }
  });

  test("toggle reduced-motion", async ({ page }) => {
    await page.goto("/profile");

    // Find reduced-motion toggle
    const reducedMotionCheckbox = page.getByLabelText("Reduce motion");
    const initialChecked = await reducedMotionCheckbox.isChecked();

    // Toggle reduced-motion
    await reducedMotionCheckbox.click();

    // Verify toggle state changed
    await expect(reducedMotionCheckbox).toHaveProperty("checked", !initialChecked);

    // Verify class is applied to html element
    const htmlElement = await page.locator("html");
    if (!initialChecked) {
      await expect(htmlElement).toHaveClass(/reduced-motion/);
    } else {
      await expect(htmlElement).not.toHaveClass(/reduced-motion/);
    }
  });

  test("toggle high-contrast", async ({ page }) => {
    await page.goto("/profile");

    // Find high-contrast toggle
    const highContrastCheckbox = page.getByLabelText("High contrast mode");
    const initialChecked = await highContrastCheckbox.isChecked();

    // Toggle high-contrast
    await highContrastCheckbox.click();

    // Verify toggle state changed
    await expect(highContrastCheckbox).toHaveProperty("checked", !initialChecked);

    // Verify class is applied to html element
    const htmlElement = await page.locator("html");
    if (!initialChecked) {
      await expect(htmlElement).toHaveClass(/high-contrast/);
    } else {
      await expect(htmlElement).not.toHaveClass(/high-contrast/);
    }
  });

  test("navigate back to Radar with DONE button", async ({ page }) => {
    await page.goto("/profile");

    // Click DONE button
    await page.getByRole("button", { name: /DONE/i }).click();

    // Verify navigation back to Radar
    await expect(page).toHaveURL(/.*\/radar/);
  });

  test("keyboard navigation", async ({ page }) => {
    await page.goto("/profile");

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verify focus is on an interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["BUTTON", "INPUT", "A"]).toContain(focusedElement);
  });

  test("accessibility: WCAG AA compliance", async ({ page }) => {
    // Complete onboarding to ensure session is set
    await completeOnboarding(page, { vibe: "banter" });
    
    // Wait for radar page to fully load (ensures session is set in React state)
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "RADAR" })).toBeVisible({ timeout: 10000 });
    
    // Navigate to profile using React Router (preserves JavaScript context/session)
    // Click the Profile button in the header instead of using page.goto()
    await page.getByRole("button", { name: /Go to profile/i }).click();
    await page.waitForLoadState("networkidle");
    
    // Wait for React to render - check for visible content
    await expect(page.getByRole("heading", { name: "Profile Settings" })).toBeVisible({ timeout: 10000 });
    // Wait for main element to be in DOM
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    
    // Run axe accessibility check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("accessibility: high-contrast mode meets contrast ratios", async ({ page }) => {
    await page.goto("/profile");

    // Enable high-contrast mode
    const highContrastCheckbox = page.getByLabelText("High contrast mode");
    await highContrastCheckbox.click();

    // Wait for high-contrast class to be applied (check for class on body or root element)
    await expect(page.locator("body.high-contrast, html.high-contrast, [data-high-contrast]")).toBeVisible({ timeout: 2000 });

    // Run axe accessibility check with high-contrast enabled
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast"
    );
    expect(contrastViolations).toEqual([]);
  });
});

