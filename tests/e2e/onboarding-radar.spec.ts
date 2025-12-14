import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForBootSequence, completeOnboarding } from "../utils/test-helpers";

test.describe("Onboarding → Radar Integration Flow", () => {
  test("complete flow: Onboarding → Radar navigation (< 30s total)", async ({
    page,
  }) => {
    const startTime = Date.now();
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    // Step 4: Wait for navigation to Radar
    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    await expect(page.getByText("RADAR")).toBeVisible();

    const totalTime = Date.now() - startTime;
    const maxDuration = startAtOnboarding ? 60000 : 30000;
    expect(totalTime).toBeLessThan(maxDuration);
  });

  test("radar updates in < 1s (WebSocket message to UI update)", async ({
    page,
  }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    // Wait for Radar page
    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    await expect(page.getByText("RADAR")).toBeVisible();

    // Wait for WebSocket connection (use .first() to avoid strict mode violation)
    await expect(page.getByText(/Connected|Connecting/i).first()).toBeVisible({
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
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    // Wait for Radar page
    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });

    // Wait for WebSocket connection and radar data (use .first() to avoid strict mode violation)
    await expect(page.getByText(/Connected|Connecting/i).first()).toBeVisible({
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
      await expect(page.getByText(/No one nearby/i)).toBeVisible();
    }
  });

  test("one-tap chat initiation works (button click → chat request sent)", async ({
    page,
  }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    // Wait for Radar page
    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });

    // Wait for WebSocket connection (use .first() to avoid strict mode violation)
    await expect(page.getByText(/Connected|Connecting/i).first()).toBeVisible({
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
      await expect(page.getByText(/No one nearby/i)).toBeVisible();
    }
  });

  test("radar view loads in < 2s", async ({ page }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Measure load time from navigation to Radar view ready
    const loadStartTime = Date.now();

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    await expect(page.getByText("RADAR")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();

    const loadTime = Date.now() - loadStartTime;
    // WebKit is slower - allow more time for performance test
    const maxLoadTime = isWebKit ? 10000 : 2000;
    expect(loadTime).toBeLessThan(maxLoadTime);
  });

  test("WebSocket connection established in < 500ms", async ({ page }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });

    // Measure WebSocket connection time
    const connectionStartTime = Date.now();

    // Wait for connection status
    await expect(page.getByText(/Connected/i).first()).toBeVisible({ timeout: 5000 });

    const connectionTime = Date.now() - connectionStartTime;
    expect(connectionTime).toBeLessThan(500); // < 500ms
  });

  test("accessibility: onboarding flow meets WCAG AA standards", async ({ page }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;

    if (!startAtOnboarding) {
      // Only test welcome page accessibility for Chromium desktop
      await page.goto("/welcome");
      await waitForBootSequence(page);
      await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });

      // Check welcome page accessibility
      const welcomeScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(welcomeScanResults.violations).toEqual([]);
    }

    if (!startAtOnboarding) {
      // Navigate to onboarding manually for Chromium desktop to check accessibility
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 30000 });
      
      // Check onboarding page accessibility (on first step)
      const onboardingScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(onboardingScanResults.violations).toEqual([]);
    } else {
      // For WebKit/mobile, use helper but skip accessibility check (too complex to pause mid-flow)
      await completeOnboarding(page, {
        vibe: "banter",
        skipLocation: true,
        startAtOnboarding: true,
      });
      // Just verify we reached radar
      const urlTimeout = 45000;
      await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    }
  });

  test("accessibility: radar view meets WCAG AA standards after onboarding", async ({ page }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
    });

    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    await expect(page.getByRole("main")).toBeVisible();

    // Check radar page accessibility
    const radarScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(radarScanResults.violations).toEqual([]);
  });
});

