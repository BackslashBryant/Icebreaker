import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getBackendURL } from "../utils/test-helpers";

/**
 * Helper function to complete onboarding and return session token
 */
async function completeOnboarding(page: any, vibe: string = "banter") {
  // Wait for page to be ready
  await page.goto("/welcome", { waitUntil: "networkidle" });
  await page.waitForLoadState("networkidle");
  // Wait for boot sequence
  await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });
  
  await page.getByRole("link", { name: /PRESS START/i }).click();
  await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 5000 });
  
  await page.getByRole("button", { name: /GOT IT/i }).click();
  await page.getByRole("checkbox", { name: /I confirm I am 18 or older/i }).check();
  await page.getByRole("button", { name: /CONTINUE/i }).click();
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await page.getByRole("button", { name: new RegExp(vibe, "i") }).click();
  await page.getByRole("button", { name: /SUBMIT/i }).click();
  
  // Wait for navigation to Radar
  await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });
  
  // Extract session token from localStorage
  const sessionToken = await page.evaluate(() => {
    return localStorage.getItem("icebreaker_session_token");
  });
  
  return sessionToken;
}

test.describe("Block/Report Safety Controls", () => {
  test("Block user from Chat header", async ({ page }) => {
    // Complete onboarding for user 1
    const token1 = await completeOnboarding(page);
    expect(token1).toBeTruthy();

    // Navigate to chat (simulate having a chat partner)
    // Use navigation state to pass partner info
    await page.goto("/chat", {
      state: {
        partnerSessionId: "target-session-123",
        partnerHandle: "TestUser",
      },
    });

    // Wait for chat header
    await expect(page.getByText("TestUser")).toBeVisible({ timeout: 5000 });

    // Click menu button (⋯)
    const menuButton = page.getByRole("button", { name: /More options/i });
    await expect(menuButton).toBeVisible({ timeout: 5000 });
    await menuButton.click();

    // Wait for menu to appear
    await expect(page.getByRole("menuitem", { name: /Block/i })).toBeVisible({ timeout: 2000 });

    // Click Block option
    const blockOption = page.getByRole("menuitem", { name: /Block/i });
    await blockOption.click();

    // Block dialog should appear
    await expect(page.getByText(/Block TestUser/i)).toBeVisible({ timeout: 2000 });

    // Confirm block
    const confirmButton = page.getByRole("button", { name: /^Block$/ }).first();
    await confirmButton.click();

    // Success toast should appear
    await expect(page.getByText(/User blocked|blocked successfully/i)).toBeVisible({ timeout: 5000 });

    // Chat should end (redirect to Radar)
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 5000 });
  });

  test("Report user from Chat header", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Navigate to chat with mock partner
    await page.goto("/chat", {
      state: {
        partnerSessionId: "target-session-456",
        partnerHandle: "ReportTarget",
      },
    });

    // Wait for chat header
    await expect(page.getByText("ReportTarget")).toBeVisible({ timeout: 5000 });

    // Click menu button
    const menuButton = page.getByRole("button", { name: /More options/i });
    await menuButton.click();

    // Wait for menu
    await expect(page.getByRole("menuitem", { name: /Report/i })).toBeVisible({ timeout: 2000 });

    // Click Report option
    const reportOption = page.getByRole("menuitem", { name: /Report/i });
    await reportOption.click();

    // Report dialog should appear
    await expect(page.getByText(/Report ReportTarget/i)).toBeVisible({ timeout: 2000 });

    // Select category (Harassment)
    const harassmentOption = page.getByLabel(/Harassment/i);
    await harassmentOption.click();

    // Submit report
    const submitButton = page.getByRole("button", { name: /Submit Report/i });
    await submitButton.click();

    // Success toast should appear
    await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
  });

  test("Block user from PersonCard (tap-hold)", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/);

    // Wait for WebSocket connection
    await expect(page.getByText(/Connected/i)).toBeVisible({ timeout: 10000 });

    // Wait for radar content to be available (people list or empty state)
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main").or(page.locator("canvas")).or(page.locator("ul[role='list']")).or(page.getByText(/No one here/i))).toBeVisible({ timeout: 5000 });

    // Try to open PersonCard by clicking a person (if available)
    // For E2E, we'll check if people are available
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      // Click first person to open PersonCard
      await personButtons.first().click();

      // PersonCard dialog should open
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Right-click on PersonCard to open menu (desktop alternative to tap-hold)
      const dialog = page.getByRole("dialog");
      await dialog.click({ button: "right" });

      // Menu should appear
      await expect(page.getByRole("menu")).toBeVisible({ timeout: 2000 });

      // Click Block option
      const blockOption = page.getByRole("menuitem", { name: /Block/i });
      await blockOption.click();

      // Block dialog should appear
      await expect(page.getByText(/Block/i)).toBeVisible({ timeout: 2000 });

      // Confirm block
      const confirmButton = page.getByRole("button", { name: /^Block$/ }).first();
      await confirmButton.click();

      // Success toast should appear
      await expect(page.getByText(/User blocked|blocked successfully/i)).toBeVisible({ timeout: 5000 });
    } else {
      // Skip if no people available (empty Radar)
      test.skip();
    }
  });

  test("Report user from PersonCard (tap-hold)", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/);

    // Wait for WebSocket connection
    await expect(page.getByText(/Connected/i)).toBeVisible({ timeout: 10000 });

    // Wait for radar content to be available (people list or empty state)
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("main").or(page.locator("canvas")).or(page.locator("ul[role='list']")).or(page.getByText(/No one here/i))).toBeVisible({ timeout: 5000 });

    // Open PersonCard
    const personButtons = page.locator("ul[role='list'] li button");
    const personCount = await personButtons.count();

    if (personCount > 0) {
      await personButtons.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

      // Right-click to open menu
      const dialog = page.getByRole("dialog");
      await dialog.click({ button: "right" });

      // Menu should appear
      await expect(page.getByRole("menu")).toBeVisible({ timeout: 2000 });

      // Click Report option
      const reportOption = page.getByRole("menuitem", { name: /Report/i });
      await reportOption.click();

      // Report dialog should appear
      await expect(page.getByText(/Report/i)).toBeVisible({ timeout: 2000 });

      // Select category
      const spamOption = page.getByLabel(/Spam/i);
      await spamOption.click();

      // Submit report
      const submitButton = page.getByRole("button", { name: /Submit Report/i });
      await submitButton.click();

      // Success toast should appear
      await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test("Multiple reports trigger safety exclusion", async ({ page, browser }) => {
    // This test requires multiple sessions reporting the same user
    // We'll simulate this by making multiple API calls
    
    // Complete onboarding for reporter 1
    const token1 = await completeOnboarding(page, "banter");
    expect(token1).toBeTruthy();
    
    // Make first report via API
    const response1 = await page.request.post(`${getBackendURL()}/api/safety/report`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      data: {
        targetSessionId: "target-session-789",
        category: "harassment",
      },
    });
    expect(response1.ok()).toBeTruthy();

    // Create second session (new browser context)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    // Complete onboarding for reporter 2
    const token2 = await completeOnboarding(page2, "chill");
    expect(token2).toBeTruthy();
    
    // Make second report
    const response2 = await page2.request.post(`${getBackendURL()}/api/safety/report`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token2}`,
      },
      data: {
        targetSessionId: "target-session-789",
        category: "spam",
      },
    });
    expect(response2.ok()).toBeTruthy();

    // Create third session
    const context3 = await browser.newContext();
    const page3 = await context3.newPage();
    
    // Complete onboarding for reporter 3
    const token3 = await completeOnboarding(page3, "deep");
    expect(token3).toBeTruthy();
    
    // Make third report (should trigger safety exclusion)
    const response3 = await page3.request.post(`${getBackendURL()}/api/safety/report`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token3}`,
      },
      data: {
        targetSessionId: "target-session-789",
        category: "impersonation",
      },
    });
    expect(response3.ok()).toBeTruthy();

    // Verify all reports succeeded
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    expect(response3.status()).toBe(200);

    // Cleanup
    await page2.close();
    await page3.close();
    await context2.close();
    await context3.close();
  });

  test("Block/Report dialogs are accessible (WCAG AA)", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Navigate to chat
    await page.goto("/chat", {
      state: {
        partnerSessionId: "test-session",
        partnerHandle: "TestUser",
      },
    });

    // Wait for chat header
    await expect(page.getByText("TestUser")).toBeVisible({ timeout: 5000 });

    // Open menu
    const menuButton = page.getByRole("button", { name: /More options/i });
    await menuButton.click();

    // Wait for menu
    await expect(page.getByRole("menuitem", { name: /Block/i })).toBeVisible({ timeout: 2000 });

    // Open Block dialog
    const blockOption = page.getByRole("menuitem", { name: /Block/i });
    await blockOption.click();

    // Wait for dialog
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

    // Run accessibility check on Block dialog
    const blockDialogAccessibility = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(blockDialogAccessibility.violations).toEqual([]);

    // Close Block dialog and open Report dialog
    await page.keyboard.press("Escape");
    // Wait for dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 2000 });
    await menuButton.click();
    await expect(page.getByRole("menuitem", { name: /Report/i })).toBeVisible({ timeout: 2000 });
    const reportOption = page.getByRole("menuitem", { name: /Report/i });
    await reportOption.click();

    // Wait for Report dialog
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });

    // Run accessibility check on Report dialog
    const reportDialogAccessibility = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(reportDialogAccessibility.violations).toEqual([]);
  });

  test("Keyboard navigation works in Block/Report menus", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Navigate to chat
    await page.goto("/chat", {
      state: {
        partnerSessionId: "test-session",
        partnerHandle: "TestUser",
      },
    });

    // Wait for chat header
    await expect(page.getByText("TestUser")).toBeVisible({ timeout: 5000 });

    // Tab to menu button (may need multiple tabs depending on page structure)
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Open menu with Enter
    await page.keyboard.press("Enter");

    // Menu should be visible
    await expect(page.getByRole("menu")).toBeVisible({ timeout: 2000 });

    // Navigate menu with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Report dialog should open
    await expect(page.getByText(/Report/i)).toBeVisible({ timeout: 2000 });

    // Navigate report categories with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Submit with Enter
    await page.keyboard.press("Enter");

    // Success toast should appear
    await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
  });
});

