/**
 * Test Utilities for Playwright E2E Tests
 * 
 * Shared helpers to reduce duplication and improve test reliability.
 */

import { Page, expect, Route } from "@playwright/test";
import { TelemetryCollector } from "./telemetry";

/**
 * Wait for boot sequence to complete on Welcome page
 * Boot sequence shows BootSequence component first, then Welcome content
 * 
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds
 * @param telemetry - Optional telemetry collector to record boot time
 */
export async function waitForBootSequence(
  page: Page,
  timeout = 15000,
  telemetry?: TelemetryCollector,
): Promise<void> {
  const startTime = Date.now();
  
  // Boot sequence shows "INITIALIZING..." text, then completes
  // After completion, "ICEBREAKER" text becomes visible
  try {
    await expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout });
    
    const bootTime = Date.now() - startTime;
    if (telemetry) {
      telemetry.startTiming('boot');
      telemetry.endTiming('boot');
      // Override with actual measured time
      telemetry.addMetadata('bootTimeMs', bootTime);
    }
  } catch (error) {
    // If ICEBREAKER text doesn't appear, check if page loaded at all
    const url = page.url();
    const errorMsg = `Boot sequence timeout: ICEBREAKER text not found after ${timeout}ms. Current URL: ${url}. ` +
      `This may indicate the frontend server is not running or the page failed to load.`;
    
    if (telemetry) {
      telemetry.recordError(errorMsg);
    }
    
    throw new Error(errorMsg);
  }
  
  // Additional wait to ensure boot sequence is fully complete
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
    // Ignore networkidle timeout - page may be ready even if network isn't idle
  });
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
    telemetry?: TelemetryCollector;
  } = {}
): Promise<string | null> {
  const { vibe = "banter", skipLocation = true, waitForBootSequence: waitBoot = true, telemetry } = options;

  if (telemetry) {
    telemetry.startTiming('onboarding');
  }

  // Navigate to welcome screen with retry logic
  let retries = 3;
  while (retries > 0) {
    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        const errorMsg = `Failed to navigate to /welcome after 3 attempts. ` +
          `This may indicate the frontend server is not running. ` +
          `Original error: ${error instanceof Error ? error.message : String(error)}`;
        if (telemetry) {
          telemetry.recordError(errorMsg);
        }
        throw new Error(errorMsg);
      }
      // Wait before retry
      await page.waitForTimeout(2000);
    }
  }

  // Wait for boot sequence if needed
  if (waitBoot) {
    await waitForBootSequence(page, 15000, telemetry);
  } else {
    // Skip boot sequence by waiting for welcome content directly
    // Boot sequence shows first, then welcome content appears
    // Wait for either boot sequence to complete OR welcome content to appear
    await Promise.race([
      // Wait for boot sequence to complete (welcome content appears)
      page.waitForSelector('[data-testid="cta-press-start"]', { timeout: 10000 }).catch(() => null),
      // Or wait for ICEBREAKER text as fallback
      expect(page.getByText("ICEBREAKER")).toBeVisible({ timeout: 10000 }).catch(() => null),
    ]);
  }

  // Click PRESS START button using data-testid (more reliable than text match)
  await page.getByTestId("cta-press-start").click();
  await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 5000 });

  // Step 0: What We Are/Not
  if (telemetry) {
    telemetry.startTiming('step-0');
  }
  await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: /GOT IT/i }).click();
  if (telemetry) {
    telemetry.endTiming('step-0');
  }

  // Step 1: 18+ Consent
  if (telemetry) {
    telemetry.startTiming('step-1');
  }
  await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState("networkidle");
  const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
  await expect(consentCheckbox).toBeVisible({ timeout: 10000 });
  await consentCheckbox.check();
  await expect(consentCheckbox).toBeChecked();
  await page.getByRole("button", { name: /CONTINUE/i }).click();
  if (telemetry) {
    telemetry.endTiming('step-1');
  }

  // Step 2: Location (skip if requested)
  if (telemetry) {
    telemetry.startTiming('step-2');
  }
  if (skipLocation) {
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Skip for now/i }).click();
  }
  if (telemetry) {
    telemetry.endTiming('step-2');
  }

  // Step 3: Vibe & Tags
  if (telemetry) {
    telemetry.startTiming('step-3');
  }
  // Use heading role to avoid strict mode violation (multiple elements contain "YOUR VIBE")
  await expect(page.getByRole("heading", { name: /YOUR VIBE/i })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: new RegExp(vibe, "i") }).click();
  await page.getByRole("button", { name: /ENTER RADAR/i }).click();
  if (telemetry) {
    telemetry.endTiming('step-3');
    telemetry.endTiming('onboarding');
  }

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

/**
 * Set up network request interception for telemetry
 * Intercepts API requests and records timing information
 * 
 * @param page - Playwright page object
 * @param telemetry - Telemetry collector to record network timings
 * @param endpoints - Optional list of endpoint patterns to intercept (default: all /api/*)
 */
export async function setupNetworkTelemetry(
  page: Page,
  telemetry: TelemetryCollector,
  endpoints: string[] = ['**/api/**']
): Promise<void> {
  // Track request start times
  const requestStartTimes = new Map<string, number>();

  for (const endpointPattern of endpoints) {
    await page.route(endpointPattern, async (route: Route) => {
      const request = route.request();
      const url = request.url();
      
      // Extract endpoint path (e.g., /api/onboarding from full URL)
      const urlObj = new URL(url);
      const endpoint = urlObj.pathname;
      
      // Record request start time
      const requestStart = Date.now();
      requestStartTimes.set(request.url(), requestStart);
      
      // Use continue() to allow request to proceed normally without blocking
      // Then wait for response asynchronously to avoid blocking the frontend
      await route.continue();
      
      // Wait for response and record timing asynchronously (don't block the route handler)
      // Use request.response() which waits for the response from any handler
      // Add timeout to prevent hanging if backend doesn't respond
      request.response().then((response) => {
        if (response) {
          const responseTime = Date.now();
          const requestTime = requestStartTimes.get(request.url()) || requestStart;
          const totalTime = responseTime - requestTime;
          
          // Get timing from request if available
          const timing = request.timing();
          const requestTimeMs = timing.requestStart > 0 
            ? timing.responseStart - timing.requestStart 
            : totalTime;
          const responseTimeMs = timing.responseEnd > 0 
            ? timing.responseEnd - timing.responseStart 
            : totalTime;
          
          // Record in telemetry
          telemetry.recordNetworkRequest(endpoint, {
            requestTime: requestTimeMs,
            responseTime: responseTimeMs,
            totalTime: totalTime,
            statusCode: response.status(),
          });
        }
        requestStartTimes.delete(request.url());
      }).catch((error) => {
        // Request may have failed, still record timing
        const responseTime = Date.now();
        const requestTime = requestStartTimes.get(request.url()) || requestStart;
        const totalTime = responseTime - requestTime;
        
        telemetry.recordNetworkRequest(endpoint, {
          requestTime: 0,
          responseTime: 0,
          totalTime: totalTime,
        });
        requestStartTimes.delete(request.url());
      });
    });
  }
}

