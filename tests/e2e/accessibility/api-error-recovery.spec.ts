/**
 * API Error Recovery Testing
 * 
 * Verifies API error recovery UI for 4xx/5xx errors:
 * User-friendly error messages, recovery actions, screen reader announcements
 * 
 * WCAG Requirements:
 * - 4.1.3 Status Messages (Level AA): Status messages programmatically determinable
 * - Error messages must be user-friendly and actionable
 */

import { test, expect } from "@playwright/test";

test.describe("API Error Recovery", () => {
  test("4xx validation error shows user-friendly recovery UI", async ({ page }) => {
    // Route onboarding API to return 400 validation error
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ 
        error: { code: "VALIDATION_ERROR", message: "Validation failed" },
        details: { vibe: "Vibe is required" }
      })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    // Step 0: GOT IT
    await page.getByRole("button", { name: /GOT IT/i }).click();
    
    // Step 1: Consent
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    
    // Step 2: Location (skip)
    await page.getByRole("button", { name: /Skip for now/i }).click();
    
    // Step 3: Vibe & Tags - select vibe
    await page.getByRole("button", { name: /banter/i }).click();
    
    // Submit (should trigger API call)
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message is user-friendly
    const errorBanner = page.getByRole("alert");
    const errorText = await errorBanner.textContent();
    
    expect(errorText).toBeTruthy();
    expect(errorText?.toLowerCase()).toMatch(/validation|failed|try again/i);
    
    // Should NOT contain technical details (HTTP codes, stack traces, etc.)
    expect(errorText).not.toMatch(/400|http|stack|trace|endpoint/i);

    // Submit button should be re-enabled so user can retry
    const submitButton = page.getByRole("button", { name: /ENTER RADAR|SUBMIT|TRY AGAIN/i });
    await expect(submitButton).toBeEnabled();
  });

  test("401 unauthorized error shows user-friendly recovery UI", async ({ page }) => {
    // Route onboarding API to return 401 unauthorized
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ 
        error: { code: "UNAUTHORIZED", message: "Session expired. Please try again." }
      })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message is user-friendly
    const errorBanner = page.getByRole("alert");
    const errorText = await errorBanner.textContent();
    
    expect(errorText).toBeTruthy();
    expect(errorText?.toLowerCase()).toMatch(/session|expired|try again|failed/i);
    
    // Should NOT contain technical details
    expect(errorText).not.toMatch(/401|http|stack|trace/i);
  });

  test("404 not found error shows user-friendly recovery UI", async ({ page }) => {
    // Route onboarding API to return 404
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ 
        error: { code: "NOT_FOUND", message: "Service temporarily unavailable" }
      })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message is user-friendly
    const errorBanner = page.getByRole("alert");
    const errorText = await errorBanner.textContent();
    
    expect(errorText).toBeTruthy();
    expect(errorText?.toLowerCase()).toMatch(/unavailable|try again|please|failed/i);
    
    // Should NOT contain technical details
    expect(errorText).not.toMatch(/404|http|stack|trace/i);
  });

  test("500 server error shows user-friendly recovery UI", async ({ page }) => {
    // Route onboarding API to return 500 server error
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ 
        error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." }
      })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message is user-friendly
    const errorBanner = page.getByRole("alert");
    const errorText = await errorBanner.textContent();
    
    expect(errorText).toBeTruthy();
    expect(errorText?.toLowerCase()).toMatch(/try again|error|please|server|wrong/i);
    
    // Should NOT contain technical details
    expect(errorText).not.toMatch(/500|http|stack|trace/i);

    // Submit button should be re-enabled so user can retry
    const submitButton = page.getByRole("button", { name: /ENTER RADAR|SUBMIT|TRY AGAIN/i });
    await expect(submitButton).toBeEnabled();
  });

  test("503 service unavailable error shows user-friendly recovery UI", async ({ page }) => {
    // Route onboarding API to return 503 service unavailable
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ 
        error: { code: "SERVICE_UNAVAILABLE", message: "Service temporarily unavailable. Please try again." }
      })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message is user-friendly
    const errorBanner = page.getByRole("alert");
    const errorText = await errorBanner.textContent();
    
    expect(errorText).toBeTruthy();
    expect(errorText?.toLowerCase()).toMatch(/try again|error|please|temporarily|unavailable/i);
    
    // Should NOT contain technical details
    expect(errorText).not.toMatch(/503|http|stack|trace/i);

    // Submit button should be re-enabled so user can retry
    const submitButton = page.getByRole("button", { name: /ENTER RADAR|SUBMIT|TRY AGAIN/i });
    await expect(submitButton).toBeEnabled();
  });

  test("error messages use role='alert' and are announced to screen readers", async ({ page }) => {
    // Route onboarding API to return error
    await page.route("**/api/onboarding", route => route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } })
    }));

    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Complete onboarding form
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("button", { name: /banter/i }).click();
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();
    
    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error banner has role="alert"
    const errorBanner = page.getByRole("alert");
    const role = await errorBanner.getAttribute("role");
    expect(role).toBe("alert");
    
    // role="alert" implies assertive announcements for screen readers
    const ariaLive = await errorBanner.getAttribute("aria-live");
    expect(role === "alert" || ariaLive === "assertive").toBeTruthy();
  });

  test("app remains usable when API unavailable (graceful degradation)", async ({ page }) => {
    // Block all API calls
    await page.route("**/api/**", route => route.abort());
    
    // Navigate to onboarding
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // App should still be usable (form should be fillable)
    await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 5000 });
    
    // Should be able to navigate through steps
    await page.getByRole("button", { name: /GOT IT/i }).click();
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 5000 });
    
    // Should be able to fill form
    await page.getByRole("checkbox", { name: /I am 18 or older/i }).check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible({ timeout: 5000 });
    
    // App remains functional even without API
    expect(true).toBe(true); // Test passes if we reach here
  });
});

// Helper function to find node in accessibility tree
function findInAccessibilityTree(
  node: any,
  predicate: (node: any) => boolean
): any | null {
  if (predicate(node)) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const result = findInAccessibilityTree(child, predicate);
      if (result) {
        return result;
      }
    }
  }
  
  return null;
}

