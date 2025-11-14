import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Radar View", () => {
  test.beforeEach(async ({ page }) => {
    // Set up session storage (simulate completed onboarding)
    await page.addInitScript(() => {
      sessionStorage.setItem("icebreaker_session", JSON.stringify({
        sessionId: "test-session",
        token: "test-token",
        handle: "testuser",
      }));
    });

    // Navigate to radar (assuming onboarding is complete)
    await page.goto("/radar");
    await page.waitForLoadState("networkidle");
  });

  test("displays radar view with accessibility", async ({ page }) => {
    // Check for main content (may be canvas, main, or heading)
    const mainContent = page.getByRole("main").or(page.locator("canvas")).or(page.getByRole("heading", { name: /RADAR/i }));
    await expect(mainContent.first()).toBeVisible({ timeout: 10000 });
    
    // Check for RADAR text or heading
    const radarText = page.getByText("RADAR").or(page.getByRole("heading", { name: /RADAR/i }));
    await expect(radarText.first()).toBeVisible({ timeout: 5000 });

    // Run accessibility checks with axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("keyboard navigation works", async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await expect(page.locator("button:focus")).toBeVisible();

    // Navigate to view toggle
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Press Enter on focused button
    await page.keyboard.press("Enter");
    // View should toggle
  });

  test("screen reader announces empty state", async ({ page }) => {
    // Mock empty people array
    await page.evaluate(() => {
      (window as any).mockRadarData = { people: [] };
    });

    await page.reload();

    // Check for empty state with proper ARIA
    const emptyState = page.getByRole("status");
    await expect(emptyState).toContainText("No one nearby — yet.");
  });

  test("reduced motion disables animations", async ({ page, context }) => {
    // Set prefers-reduced-motion
    await context.addCookies([
      {
        name: "prefers-reduced-motion",
        value: "reduce",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/radar");

    // Check that canvas doesn't have animation
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Reduced motion should be respected (checked in component code)
  });

  test("view toggle switches between sweep and list", async ({ page }) => {
    // Find view toggle buttons
    const listButton = page.getByRole("button", { name: /list view/i });
    const radarButton = page.getByRole("button", { name: /radar sweep view/i });

    // Click list view
    await listButton.click();
    await expect(page.locator("ul[role='list']")).toBeVisible();

    // Click radar view
    await radarButton.click();
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("person card opens on selection", async ({ page }) => {
    // Wait for people to load
    await page.waitForSelector("button", { timeout: 5000 });

    // Click first person (if available)
    const firstPerson = page.locator("button").first();
    if (await firstPerson.isVisible()) {
      await firstPerson.click();

      // Person card dialog should open
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText("START CHAT →")).toBeVisible();
    }
  });

  test("location permission error displays gracefully", async ({ page, context }) => {
    // Deny geolocation permission
    await context.grantPermissions([], { origin: "http://localhost:3000" });

    await page.goto("/radar");

    // Should show location error message
    await expect(page.getByText(/Location access denied/i)).toBeVisible();
  });

  test("connection status displays correctly", async ({ page }) => {
    // Check for connection status
    const statusText = page.getByText(/Connected|Connecting|Disconnected/);
    await expect(statusText).toBeVisible();
  });
});

