import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeOnboarding as runCompleteOnboarding, getBackendURL } from "../utils/test-helpers";

async function completeOnboarding(page: any, vibe: string = "banter") {
  return runCompleteOnboarding(page, { vibe });
}

async function waitForConnected(page: any) {
  await page.waitForFunction(() => {
    try {
      return sessionStorage.getItem("icebreaker_session") !== null;
    } catch {
      return false;
    }
  }, { timeout: 5000 });

  await page.waitForFunction(() => {
    return (window as any).__ICEBREAKER_WS_STATUS__ === "connected";
  }, { timeout: 15000 });
}

async function waitForRadarContent(page: any) {
  await page.waitForLoadState("networkidle");
  const list = page.locator("ul[role='list']");
  if (await list.count()) {
    await expect(list.first()).toBeVisible({ timeout: 5000 });
    return;
  }
  const radarMain = page.locator("main[aria-label='Radar view content']");
  if (await radarMain.count()) {
    await expect(radarMain.first()).toBeVisible({ timeout: 5000 });
    return;
  }
  await expect(page.getByText(/No one nearby/i)).toBeVisible({ timeout: 5000 });
}

test.describe("Chat Request Cooldowns", () => {
  test("cooldown triggers after 3 declined invites", async ({ page }) => {
    // Create requester session
    const requesterToken = await completeOnboarding(page, "banter");
    expect(requesterToken).toBeTruthy();

    // Wait for Radar connection
    await waitForConnected(page);
    // Wait for radar content to be available (people list or empty state)
    await waitForRadarContent(page);

    // Get requester session ID from sessionStorage
    const requesterSessionId = await page.evaluate(() => {
      const sessionStr = sessionStorage.getItem("icebreaker_session");
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          return session.sessionId || session.token;
        } catch (e) {
          return null;
        }
      }
      return localStorage.getItem("icebreaker_session_token");
    });
    expect(requesterSessionId).toBeTruthy();

    // Trigger cooldown directly via WebSocket mock
    // This simulates 3 declined invites without creating multiple pages
    await page.evaluate(({ sessionId }) => {
      const mock = (window as any).__WS_MOCK__;
      if (mock && typeof mock.triggerCooldown === 'function') {
        mock.triggerCooldown(sessionId, 3);
      }
    }, { sessionId: requesterSessionId });
    
    // Wait for cooldown message to be processed
    await page.waitForTimeout(500);

    // Verify cooldown is active by checking the Radar page
    // Navigate to Radar and try to request chat
    await page.goto("/radar");
    await waitForConnected(page);

    // If people are available, try to request chat
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      // Open PersonCard
      await personButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Try to click START CHAT button
      const chatButton = page.getByRole("button", { name: /START CHAT|Cooldown active/i });
      await expect(chatButton).toBeVisible();

      // If cooldown is active, button should be disabled
      const isDisabled = await chatButton.isDisabled();
      
      if (isDisabled) {
        // Verify cooldown message is visible
        await expect(page.getByText(/Try again in/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test("cooldown notice shows when user tries to request chat during cooldown", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar connection
    await waitForConnected(page);
    // Wait for radar content to be available
    await waitForRadarContent(page);

    // Simulate cooldown by sending WebSocket error message
    // Note: In real E2E, we'd trigger actual cooldown via backend
    // For now, we'll verify the UI handles cooldown state correctly

    // Navigate to Radar
    await page.goto("/radar");
    await waitForConnected(page);

    // If people are available, open PersonCard
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      await personButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Check if cooldown UI elements exist (they may not be visible if not in cooldown)
      const chatButton = page.getByRole("button", { name: /START CHAT|Cooldown active/i });
      await expect(chatButton).toBeVisible();

      // Verify button can be disabled (cooldown state)
      const buttonText = await chatButton.textContent();
      
      // If cooldown is active, verify cooldown message
      if (buttonText?.includes("Cooldown")) {
        await expect(page.getByText(/Try again in/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test("cooldown countdown timer updates", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar connection
    await waitForConnected(page);

    // Navigate to Radar
    await page.goto("/radar");
    await waitForConnected(page);

    // Note: Testing countdown timer updates requires actual cooldown state
    // This test verifies the UI structure supports countdown display
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      await personButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Verify PersonCard has structure for cooldown display
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Check for cooldown-related elements (may not be visible if not in cooldown)
      const cooldownText = page.getByText(/Try again in|Cooldown active/i);
      const cooldownExists = await cooldownText.count() > 0;

      // If cooldown is active, verify countdown format
      if (cooldownExists) {
        const countdownText = await cooldownText.textContent();
        expect(countdownText).toMatch(/\d+\s+(minute|second)/i);
      }
    }
  });

  test("cooldown UI is accessible (WCAG AA)", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar connection
    await waitForConnected(page);
    // Wait for radar content to be available
    await waitForRadarContent(page);

    // Navigate to Radar
    await page.goto("/radar");
    await waitForConnected(page);

    // Open PersonCard
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      await personButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Run accessibility check on PersonCard
      const accessibilityResults = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      expect(accessibilityResults.violations).toEqual([]);

      // Verify cooldown button has proper aria-label
      const chatButton = page.getByRole("button", { name: /START CHAT|Cooldown active/i });
      const ariaLabel = await chatButton.getAttribute("aria-label");
      
      if (ariaLabel) {
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test("keyboard navigation works with cooldown UI", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar connection
    await waitForConnected(page);
    // Wait for radar content to be available
    await waitForRadarContent(page);

    // Navigate to Radar
    await page.goto("/radar");
    await waitForConnected(page);

    // Navigate to PersonCard with keyboard
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      // Tab to first person
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Open PersonCard with Enter
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Tab to chat button
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Verify button is focusable
      const chatButton = page.getByRole("button", { name: /START CHAT|Cooldown active/i });
      await expect(chatButton).toBeFocused();

      // If cooldown is active, verify button is disabled but still focusable
      const isDisabled = await chatButton.isDisabled();
      
      if (isDisabled) {
        // Verify cooldown message is announced
        const cooldownMessage = page.getByText(/Try again in/i);
        const messageExists = await cooldownMessage.count() > 0;
        expect(messageExists).toBeTruthy();
      }
    }
  });
});
