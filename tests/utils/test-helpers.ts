/**
 * Test Utilities for Playwright E2E Tests
 * 
 * Shared helpers to reduce duplication and improve test reliability.
 */

import { Page, expect } from "@playwright/test";

/**
 * Wait for boot sequence to complete on Welcome page
 * Boot sequence shows BootSequence component first, then Welcome content
 */
export async function waitForBootSequence(page: Page, timeout = 10000): Promise<void> {
  // Boot sequence shows "INITIALIZING..." text, then completes
  // After completion, "ICEBREAKER" text becomes visible
  await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout });
  
  // Additional wait to ensure boot sequence is fully complete
  await page.waitForLoadState("networkidle");
}

/**
 * Complete onboarding flow and return session token
 * 
 * @param page - Playwright page object
 * @param options - Onboarding options
 * @returns Session token from localStorage (if available)
 */
export async function completeOnboarding(
  page: Page,
  options: {
    vibe?: string;
    skipLocation?: boolean;
    waitForBootSequence?: boolean;
  } = {}
): Promise<string | null> {
  const { vibe = "banter", skipLocation = true, waitForBootSequence: waitBoot = true } = options;

  // Navigate to welcome screen
  await page.goto("/welcome", { waitUntil: "networkidle" });

  // Wait for boot sequence if needed
  if (waitBoot) {
    await waitForBootSequence(page);
  } else {
    // Skip boot sequence by waiting for content directly
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 });
  }

  // Click PRESS START
  await page.getByRole("link", { name: /PRESS START/i }).click();
  await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 5000 });

  // Step 0: What We Are/Not
  await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: /GOT IT/i }).click();

  // Step 1: 18+ Consent
  await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState("networkidle");
  const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
  await expect(consentCheckbox).toBeVisible({ timeout: 10000 });
  await consentCheckbox.check();
  await expect(consentCheckbox).toBeChecked();
  await page.getByRole("button", { name: /CONTINUE/i }).click();

  // Step 2: Location (skip if requested)
  if (skipLocation) {
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Skip for now/i }).click();
  }

  // Step 3: Vibe & Tags
  await expect(page.getByText("YOUR VIBE")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: new RegExp(vibe, "i") }).click();
  await page.getByRole("button", { name: /ENTER RADAR/i }).click();

  // Wait for navigation to Radar
  await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

  // Extract session token from localStorage (if available)
  const sessionToken = await page.evaluate(() => {
    return localStorage.getItem("icebreaker_session_token");
  });

  return sessionToken;
}

/**
 * Set up session storage for tests that skip onboarding
 * 
 * @param page - Playwright page object
 * @param sessionData - Session data to store
 */
export async function setupSession(
  page: Page,
  sessionData: {
    sessionId: string;
    token: string;
    handle: string;
  } = {
    sessionId: "test-session",
    token: "test-token",
    handle: "testuser",
  }
): Promise<void> {
  await page.addInitScript((data) => {
    sessionStorage.setItem("icebreaker_session", JSON.stringify(data));
  }, sessionData);
}

/**
 * Get base URL from environment or config
 */
export function getBaseURL(): string {
  return process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3000";
}

/**
 * Get backend URL from environment or config
 */
export function getBackendURL(): string {
  return process.env.BACKEND_URL || "http://localhost:8000";
}

