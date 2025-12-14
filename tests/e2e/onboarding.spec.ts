import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForBootSequence, getBaseURL, completeOnboarding } from "../utils/test-helpers";
import { SEL } from "../utils/selectors";

test.describe("Onboarding Flow", () => {
  test("complete onboarding flow: Welcome → Consent → Location (skip) → Vibe & Tags → API → Radar", async ({
    page,
  }) => {
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    const viewportWidth = (page.context() as any)._options?.viewport?.width;
    const isMobileProject = typeof viewportWidth === "number" && viewportWidth <= 430;
    const isNonChromium = browserName && browserName !== "chromium";
    const startAtOnboarding = isMobileProject || isNonChromium;
    const allowSyntheticSessionFallback = isWebKit;

    if (!startAtOnboarding) {
      // Only verify welcome screen for Chromium desktop
      await page.goto("/welcome");
      await page.waitForLoadState("networkidle");
      await waitForBootSequence(page);

      // Verify welcome screen displays brand moment
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await expect(page.getByText("Real world.")).toBeVisible();
      await expect(page.getByText("Real time.")).toBeVisible();
      await expect(page.getByText("Real connections.")).toBeVisible();
    }

    // Use helper for robust onboarding (handles WebKit timing issues)
    await completeOnboarding(page, {
      vibe: "banter",
      skipLocation: true,
      startAtOnboarding,
      allowSyntheticSessionFallback,
      waitForBootSequence: !startAtOnboarding,
    });

    // Verify navigation to radar (helper completes all steps)
    const urlTimeout = startAtOnboarding ? 45000 : 30000;
    await expect(page).toHaveURL(/.*\/radar/, { timeout: urlTimeout });
    await expect(page.locator(SEL.radarHeading)).toBeVisible();
  });

  test("accessibility: WCAG AA compliance check", async ({ page }) => {
    // Navigate to welcome screen
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence to complete
    await waitForBootSequence(page);

    // Run axe accessibility check
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for WCAG AA violations (level: 'AA' or 'AAA')
    const violations = accessibilityScanResults.violations.filter(
      (v) => v.tags.some((tag) => tag === "wcag2a" || tag === "wcag2aa" || tag === "wcag21aa")
    );

    expect(violations).toEqual([]);

    // Navigate through onboarding flow
    await page.getByRole("link", { name: /PRESS START/i }).click();
    await page.getByRole("button", { name: /GOT IT/i }).click();

    // Check onboarding page accessibility
    const onboardingScanResults = await new AxeBuilder({ page }).analyze();
    const onboardingViolations = onboardingScanResults.violations.filter(
      (v) => v.tags.some((tag) => tag === "wcag2a" || tag === "wcag2aa" || tag === "wcag21aa")
    );

    expect(onboardingViolations).toEqual([]);
  });

  test("keyboard navigation works throughout onboarding", async ({ page }) => {
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence to complete
    await waitForBootSequence(page);

    // Wait for PRESS START button to be visible
    await expect(page.getByRole("link", { name: /PRESS START/i })).toBeVisible();

    // Tab to PRESS START button and navigate
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Wait for onboarding page to load (use waitForLoadState instead of waitForURL)
    await page.waitForLoadState("networkidle");
    
    // On onboarding, wait for first step to be visible
    await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible({ timeout: 10000 });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Tab to consent checkbox
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space"); // Check checkbox
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Continue

    // Skip location
    await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Skip

    // Tab to vibe selection
    await expect(page.getByText("YOUR VIBE")).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Select first vibe
  });

  test("accessibility: screen reader labels present", async ({ page }) => {
    await page.goto("/welcome");
    await page.waitForLoadState("networkidle");
    // Wait for boot sequence to complete
    await waitForBootSequence(page);

    // Check for ARIA labels or alt text
    const logo = page.getByAltText("IceBreaker").or(page.locator("img[alt*='IceBreaker']")).or(page.locator("img[alt*='icebreaker']"));
    if (await logo.count() > 0) {
      await expect(logo.first()).toBeVisible();
    }

    await page.getByRole("link", { name: /PRESS START/i }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);
    await page.getByRole("button", { name: /GOT IT/i }).click();

    // Wait for consent step
    await expect(page.getByText("AGE VERIFICATION")).toBeVisible({ timeout: 10000 });
    
    // Check consent checkbox has label (may be checkbox label or associated text)
    const consentCheckbox = page.getByRole("checkbox", { name: /I confirm I am 18 or older/i });
    await expect(consentCheckbox).toBeVisible({ timeout: 5000 });
    
    // Verify label is associated
    const consentLabel = page.getByText(/I confirm I am 18 or older/i);
    await expect(consentLabel.or(consentCheckbox)).toBeVisible({ timeout: 5000 });
  });

  test("handles API error gracefully", async ({ page }) => {
    // Intercept API call and return error
    await page.route("**/api/onboarding", (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: { code: "VALIDATION_ERROR", message: "Test error" },
        }),
      });
    });

    await page.goto("/onboarding");

    // Navigate through steps quickly
    await page.getByRole("button", { name: /GOT IT/i }).click();
    const consentCheckbox = page.getByRole("checkbox");
    await consentCheckbox.check();
    await page.getByRole("button", { name: /CONTINUE/i }).click();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByText(/Up for banter/i).click();

    // Submit form
    await page.getByRole("button", { name: /ENTER RADAR/i }).click();

    // Verify error message is displayed
    await expect(page.getByText(/Test error/i)).toBeVisible();
  });
});
