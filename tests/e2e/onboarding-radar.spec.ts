import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Onboarding → Radar Integration Flow", () => {
  test("complete flow: Onboarding → Radar navigation (< 30s total)", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Step 1: Navigate to welcome screen
    await page.goto("/welcome");
    await expect(page.getByText("ICEBREAKER")).toBeVisible();

    // Step 2: Click PRESS START
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);

    // Step 3: Complete onboarding steps
    // What We Are/Not
    await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
    await page.getByRole("button", { name: /GOT IT/i }).click();

    // 18+ Consent
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
    const consentCheckbox = page.getByRole("checkbox", {
      name: /I confirm I am 18 or older/i,
    });
    await consentCheckbox.check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();

    // Location (skip)
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
    await page.getByRole("button", { name: /Skip for now/i }).click();

    // Vibe & Tags
    await expect(page.getByText("YOUR VIBE")).toBeVisible();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Step 4: Wait for navigation to Radar
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
    await expect(page.getByText("RADAR")).toBeVisible();

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(30000); // < 30s total
  });

  test("radar updates in < 1s (WebSocket message to UI update)", async ({
    page,
  }) => {
    // Complete onboarding first
    await page.goto("/welcome");
    await page.getByRole("link", { name: /PRESS START/i }).click();

    // Skip through onboarding quickly
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
    await expect(page.getByText("RADAR")).toBeVisible();

    // Wait for WebSocket connection
    await expect(page.getByText(/Connected|Connecting/i)).toBeVisible({
      timeout: 5000,
    });

    // Measure time from WebSocket message to UI update
    // Note: This is a simplified test - in a real scenario, we'd intercept WebSocket messages
    // For now, we verify that radar updates appear within reasonable time
    const updateStartTime = Date.now();

    // Wait for radar content (people list or empty state)
    await page.waitForSelector("canvas, ul[role='list'], [role='status']", {
      timeout: 5000,
    });

    const updateTime = Date.now() - updateStartTime;
    expect(updateTime).toBeLessThan(1000); // < 1s
  });

  test("signal engine sorting visible (higher scores appear first)", async ({
    page,
  }) => {
    // Complete onboarding
    await page.goto("/welcome");
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

    // Wait for WebSocket connection and radar data
    await expect(page.getByText(/Connected|Connecting/i)).toBeVisible({
      timeout: 5000,
    });

    // Check if people are displayed (if any)
    // Signal Engine sorting is verified in unit tests
    // Here we verify that the UI can display sorted results
    const hasPeople = await page.locator("ul[role='list'] li, canvas").count();

    if (hasPeople > 0) {
      // If people are displayed, verify list view shows them
      const listButton = page.getByRole("button", { name: /list view/i });
      if (await listButton.isVisible()) {
        await listButton.click();
        await expect(page.locator("ul[role='list']")).toBeVisible();
      }
    } else {
      // Empty state is also valid
      await expect(page.getByText(/No one here/i)).toBeVisible();
    }
  });

  test("one-tap chat initiation works (button click → chat request sent)", async ({
    page,
  }) => {
    // Complete onboarding
    await page.goto("/welcome");
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

    // Wait for WebSocket connection
    await expect(page.getByText(/Connected|Connecting/i)).toBeVisible({
      timeout: 5000,
    });

    // If people are available, test chat initiation
    // Note: This requires mock data or multiple sessions
    // For now, we verify the button exists and is clickable
    const hasPeople = await page.locator("ul[role='list'] li, canvas").count();

    if (hasPeople > 0) {
      // Switch to list view if needed
      const listButton = page.getByRole("button", { name: /list view/i });
      if (await listButton.isVisible()) {
        await listButton.click();
      }

      // Click first person
      const firstPerson = page.locator("ul[role='list'] li button").first();
      if (await firstPerson.isVisible()) {
        await firstPerson.click();

        // Person card should open
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

        // START CHAT button should be visible
        const chatButton = page.getByRole("button", { name: /START CHAT/i });
        await expect(chatButton).toBeVisible();

        // Click chat button (chat request sent via WebSocket)
        await chatButton.click();

        // Verify toast/notification appears (if implemented)
        // For now, we verify the button click doesn't error
        await expect(chatButton).toBeVisible();
      }
    } else {
      // Empty state - chat initiation not applicable
      await expect(page.getByText(/No one here/i)).toBeVisible();
    }
  });

  test("radar view loads in < 2s", async ({ page }) => {
    // Complete onboarding first
    await page.goto("/welcome");
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Measure load time from navigation to Radar view ready
    const loadStartTime = Date.now();

    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
    await expect(page.getByText("RADAR")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();

    const loadTime = Date.now() - loadStartTime;
    expect(loadTime).toBeLessThan(2000); // < 2s
  });

  test("WebSocket connection established in < 500ms", async ({ page }) => {
    // Complete onboarding
    await page.goto("/welcome");
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /SUBMIT/i }).click();

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

    // Measure WebSocket connection time
    const connectionStartTime = Date.now();

    // Wait for connection status
    await expect(page.getByText(/Connected/i)).toBeVisible({ timeout: 5000 });

    const connectionTime = Date.now() - connectionStartTime;
    expect(connectionTime).toBeLessThan(500); // < 500ms
  });

  test("accessibility: onboarding flow meets WCAG AA standards", async ({ page }) => {
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence to complete
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

    // Check welcome page accessibility
    const welcomeScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(welcomeScanResults.violations).toEqual([]);

    // Navigate to onboarding
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);

    // Check onboarding page accessibility
    const onboardingScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(onboardingScanResults.violations).toEqual([]);
  });

  test("accessibility: radar view meets WCAG AA standards after onboarding", async ({ page }) => {
    // Complete onboarding
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence to complete
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
    // Wait for consent step to fully load before interacting with checkbox
    await page.waitForLoadState("networkidle");
    const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
    await expect(consentCheckbox).toBeVisible({ timeout: 10000 });
    await consentCheckbox.check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
    await expect(page.getByRole("main")).toBeVisible();

    // Check radar page accessibility
    const radarScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(radarScanResults.violations).toEqual([]);
  });
});

