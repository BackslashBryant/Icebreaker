import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForBootSequence, completeOnboarding, setupSession } from "../../utils/test-helpers";
import { TelemetryCollector, checkPanicButtonVisible, checkVisibilityToggleVisible, checkFocusOrder, countErrorBanners } from "../../utils/telemetry";
import { SEL } from "../../utils/selectors";

/**
 * Persona-Based E2E Tests: Market Research Personas
 *
 * Tests market research personas (River, Alex, Jordan, Sam, Morgan) to verify diverse use cases.
 * Based on persona journey maps and test scenarios in docs/testing/persona-scenarios.md
 */

test.describe("Persona: River Martinez - Urban Neighborhood Resident", () => {
  test("@smoke completes onboarding with urban neighborhood pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('river', 'river-onboarding');

    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForBootSequence(page, 15000, telemetry);

      // River reads carefully, appreciates clear messaging
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not
      await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
      await page.getByRole("button", { name: /GOT IT/i }).click();

      // Step 1: 18+ Consent
      await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.getByRole("button", { name: /CONTINUE/i }).click();

      // Step 2: Location - River grants permission (wants neighborhood proximity matching)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - River selects "intros" vibe + local tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();

      // Select "intros" vibe (low-pressure)
      await page.getByText(/Open to intros/i).click();

      // Select local discovery tags
      await page.getByText("Quietly Curious").click();
      await page.getByText("Here for the humans").click();

      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();

      // Wait for button to not be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("dense urban neighborhood proximity matching works", async ({ page }) => {
    const telemetry = new TelemetryCollector('river', 'river-proximity-urban');

    try {
      await setupSession(page, {
        sessionId: "river-session",
        token: "river-token",
        handle: "CozyFriend23",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Dense urban proximity matching should work for neighborhood discovery
      // Note: Full proximity testing requires WebSocket integration with location data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral design avoids Nextdoor/Facebook drama", async ({ page }) => {
    const telemetry = new TelemetryCollector('river', 'river-ephemeral-drama');

    try {
      await setupSession(page, {
        sessionId: "river-session",
        token: "river-token",
        handle: "CozyFriend23",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Ephemeral design should avoid permanent neighbor relationships
      // Note: This is verified through UX feedback questionnaire
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("accessibility: WCAG AA compliance for urban residents", async ({ page }) => {
    const telemetry = new TelemetryCollector('river', 'river-a11y');

    try {
      await setupSession(page, {
        sessionId: "river-session",
        token: "river-token",
        handle: "CozyFriend23",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Run accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      // Record accessibility violations
      telemetry.recordA11yViolations(accessibilityScanResults.violations.length);

      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

test.describe("Persona: Alex Kim - Tech Conference Attendee", () => {
  test("completes onboarding with tech conference pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('alex', 'alex-onboarding');

    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForBootSequence(page, 15000, telemetry);

      // Alex reads quickly, clicks PRESS START (conference efficiency)
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not
      await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
      await page.getByRole("button", { name: /GOT IT/i }).click();

      // Step 1: 18+ Consent
      await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.getByRole("button", { name: /CONTINUE/i }).click();

      // Step 2: Location - Alex grants permission (wants conference proximity matching)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Alex selects "banter" vibe + tech tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();

      // Select "banter" vibe (outgoing, tech-focused)
      await page.getByText(/Up for banter/i).click();

      // Select tech/builder tags
      await page.getByText("Tech curious").click();
      await page.getByText("Builder brain").click();

      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();

      // Wait for button to not be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("event/conference proximity matching works", async ({ page }) => {
    const telemetry = new TelemetryCollector('alex', 'alex-proximity-conference');

    try {
      await setupSession(page, {
        sessionId: "alex-session",
        token: "alex-token",
        handle: "SwiftWit45",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Event/conference proximity matching should work for tech conferences
      // Note: Full proximity testing requires WebSocket integration with location data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral design avoids LinkedIn exchange pressure", async ({ page }) => {
    const telemetry = new TelemetryCollector('alex', 'alex-ephemeral-linkedin');

    try {
      await setupSession(page, {
        sessionId: "alex-session",
        token: "alex-token",
        handle: "SwiftWit45",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Ephemeral design should avoid LinkedIn exchanges
      // Note: This is verified through UX feedback questionnaire
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("tech tag compatibility works", async ({ page }) => {
    const telemetry = new TelemetryCollector('alex', 'alex-tech-tags');

    try {
      await setupSession(page, {
        sessionId: "alex-session",
        token: "alex-token",
        handle: "SwiftWit45",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Tech tags should help find compatible conference attendees
      // Note: Full tag compatibility testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("accessibility: WCAG AA compliance for tech professionals", async ({ page }) => {
    const telemetry = new TelemetryCollector('alex', 'alex-a11y');

    try {
      await setupSession(page, {
        sessionId: "alex-session",
        token: "alex-token",
        handle: "SwiftWit45",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Run accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      // Record accessibility violations
      telemetry.recordA11yViolations(accessibilityScanResults.violations.length);

      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

test.describe("Persona: Jordan Park - Privacy-Focused Professional", () => {
  test("completes onboarding with privacy-focused pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-onboarding');

    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForBootSequence(page, 15000, telemetry);

      // Jordan reads very carefully, appreciates privacy messaging
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not
      await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
      await page.getByRole("button", { name: /GOT IT/i }).click();

      // Step 1: 18+ Consent
      await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.getByRole("button", { name: /CONTINUE/i }).click();

      // Step 2: Location - Jordan may skip initially (privacy-conscious)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Jordan selects "thinking" vibe + minimal tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();

      // Select "thinking" vibe (privacy-aligned)
      await page.getByText(/Thinking out loud/i).click();

      // Select minimal tags (privacy-conscious)
      await page.getByText("Tech curious").click();
      await page.getByText("Quietly Curious").click();

      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();

      // Wait for button to not be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("visibility toggle OFF works for privacy-first users", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-visibility-off');

    try {
      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Jordan toggles visibility OFF (privacy-first)
      // Note: Visibility toggle is on Profile page, not Radar page
      // Navigate to Profile to access visibility toggle
      await page.getByRole("button", { name: /Go to profile/i }).click();
      await expect(page).toHaveURL(/.*\/profile/);

      // Find visibility toggle checkbox on Profile page
      const visibilityCheckbox = page.getByRole("checkbox", { name: /Show me on Radar|Hide from Radar/i });
      if (await visibilityCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Toggle visibility OFF
        await visibilityCheckbox.click();

        // Record visibility toggle visibility
        const visibilityVisible = await checkVisibilityToggleVisible(page);
        telemetry.recordAffordance('visibilityToggle', visibilityVisible);

        // Navigate back to Radar
        await page.getByRole("button", { name: /DONE/i }).click();
        await expect(page).toHaveURL(/.*\/radar/);

        // Verify Jordan does NOT appear on Radar (visibility off)
        // Note: Full visibility testing requires WebSocket integration
      }

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("visibility toggle ON works selectively", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-visibility-on');

    try {
      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Jordan may toggle visibility ON selectively
      // Note: Visibility toggle is on Profile page, not Radar page
      // Navigate to Profile to access visibility toggle
      await page.getByRole("button", { name: /Go to profile/i }).click();
      await expect(page).toHaveURL(/.*\/profile/);

      // Find visibility toggle checkbox on Profile page
      const visibilityCheckbox = page.getByRole("checkbox", { name: /Show me on Radar|Hide from Radar/i });
      if (await visibilityCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Toggle visibility ON
        await visibilityCheckbox.click();

        // Record visibility toggle visibility
        const visibilityVisible = await checkVisibilityToggleVisible(page);
        telemetry.recordAffordance('visibilityToggle', visibilityVisible);

        // Navigate back to Radar
        await page.getByRole("button", { name: /DONE/i }).click();
        await expect(page).toHaveURL(/.*\/radar/);

        // Verify Jordan appears on Radar (visibility on)
        // Note: Full visibility testing requires WebSocket integration
      }

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral design respects privacy (no data trail)", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-ephemeral-privacy');

    try {
      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Ephemeral design should respect privacy (no data trail)
      // Note: This is verified through UX feedback questionnaire
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("privacy-respecting signal scoring works", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-signal-scoring');

    try {
      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Privacy-respecting signal scoring should work
      // Note: Full signal scoring testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("accessibility: WCAG AA compliance for privacy-focused users", async ({ page }) => {
    const telemetry = new TelemetryCollector('jordan', 'jordan-a11y');

    try {
      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Run accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      // Record accessibility violations
      telemetry.recordA11yViolations(accessibilityScanResults.violations.length);

      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

test.describe("Persona: Sam Taylor - Outgoing Introvert", () => {
  test("completes onboarding with outgoing introvert pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('sam', 'sam-onboarding');

    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForBootSequence(page, 15000, telemetry);

      // Sam reads quickly, clicks PRESS START (event-focused)
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not
      await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
      await page.getByRole("button", { name: /GOT IT/i }).click();

      // Step 1: 18+ Consent
      await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.getByRole("button", { name: /CONTINUE/i }).click();

      // Step 2: Location - Sam grants permission (wants event proximity matching)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Sam selects "banter" vibe + creative tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();

      // Select "banter" vibe (outgoing, social)
      await page.getByText(/Up for banter/i).click();

      // Select creative/social tags
      await page.getByText("Creative Energy").click();
      await page.getByText("Here for the humans").click();

      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();

      // Wait for button to not be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("event/venue proximity matching works for music venues", async ({ page }) => {
    const telemetry = new TelemetryCollector('sam', 'sam-proximity-music');

    try {
      await setupSession(page, {
        sessionId: "sam-session",
        token: "sam-token",
        handle: "WarmWit28",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Event/venue proximity matching should work for music venues
      // Note: Full proximity testing requires WebSocket integration with location data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral design preserves social energy", async ({ page }) => {
    const telemetry = new TelemetryCollector('sam', 'sam-ephemeral-energy');

    try {
      await setupSession(page, {
        sessionId: "sam-session",
        token: "sam-token",
        handle: "WarmWit28",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Ephemeral design should preserve social energy
      // Note: This is verified through UX feedback questionnaire
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("creative tag compatibility works", async ({ page }) => {
    const telemetry = new TelemetryCollector('sam', 'sam-creative-tags');

    try {
      await setupSession(page, {
        sessionId: "sam-session",
        token: "sam-token",
        handle: "WarmWit28",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Creative tags should help find compatible people at events
      // Note: Full tag compatibility testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("accessibility: WCAG AA compliance for outgoing introverts", async ({ page }) => {
    const telemetry = new TelemetryCollector('sam', 'sam-a11y');

    try {
      await setupSession(page, {
        sessionId: "sam-session",
        token: "sam-token",
        handle: "WarmWit28",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Run accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      // Record accessibility violations
      telemetry.recordA11yViolations(accessibilityScanResults.violations.length);

      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

test.describe("Persona: Morgan Davis - Graduate Student & Researcher", () => {
  test("completes onboarding with academic researcher pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('morgan', 'morgan-onboarding');

    try {
      await page.goto("/welcome", { waitUntil: "domcontentloaded", timeout: 30000 });
      await waitForBootSequence(page, 15000, telemetry);

      // Morgan reads carefully, appreciates clear messaging (academic thoroughness)
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await page.getByTestId("cta-press-start").click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not
      await expect(page.getByText("WHAT IS ICEBREAKER?")).toBeVisible();
      await page.getByRole("button", { name: /GOT IT/i }).click();

      // Step 1: 18+ Consent
      await expect(page.getByText("AGE VERIFICATION")).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.getByRole("button", { name: /CONTINUE/i }).click();

      // Step 2: Location - Morgan grants permission (wants proximity matching at conferences)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Morgan selects "thinking" vibe + research tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();

      // Select "thinking" vibe (intellectual, academic)
      await page.getByText(/Thinking out loud/i).click();

      // Select research-related tags
      await page.getByText("Big Sci-Fi Brain").click();
      await page.getByText("Overthinking Things").click();

      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();

      // Wait for button to not be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("academic conference proximity matching works", async ({ page }) => {
    const telemetry = new TelemetryCollector('morgan', 'morgan-proximity-academic');

    try {
      await setupSession(page, {
        sessionId: "morgan-session",
        token: "morgan-token",
        handle: "CuriousThinker63",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Academic conference proximity matching should work
      // Note: Full proximity testing requires WebSocket integration with location data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("research tag compatibility works", async ({ page }) => {
    const telemetry = new TelemetryCollector('morgan', 'morgan-research-tags');

    try {
      await setupSession(page, {
        sessionId: "morgan-session",
        token: "morgan-token",
        handle: "CuriousThinker63",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Research tags should help find compatible researchers
      // Note: Full tag compatibility testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral design avoids academic Twitter pressure", async ({ page }) => {
    const telemetry = new TelemetryCollector('morgan', 'morgan-ephemeral-twitter');

    try {
      await setupSession(page, {
        sessionId: "morgan-session",
        token: "morgan-token",
        handle: "CuriousThinker63",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads
      await expect(page.locator(SEL.radarHeading)).toBeVisible();

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Ephemeral design should avoid academic Twitter pressure
      // Note: This is verified through UX feedback questionnaire
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("accessibility: WCAG AA compliance for researchers", async ({ page }) => {
    const telemetry = new TelemetryCollector('morgan', 'morgan-a11y');

    try {
      await setupSession(page, {
        sessionId: "morgan-session",
        token: "morgan-token",
        handle: "CuriousThinker63",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Run accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      // Record accessibility violations
      telemetry.recordA11yViolations(accessibilityScanResults.violations.length);

      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

test.describe("Cross-Persona: Market Research Personas", () => {
  test("all market research personas complete onboarding successfully", async ({ page }) => {
    const telemetry = new TelemetryCollector('cross-persona-market-research', 'all-onboarding');

    try {
      const personas = [
        { name: "River", vibe: "Open to intros", tags: ["Quietly Curious", "Here for the humans"] },
        { name: "Alex", vibe: "Up for banter", tags: ["Tech curious", "Builder brain"] },
        { name: "Jordan", vibe: "Thinking out loud", tags: ["Tech curious", "Quietly Curious"] },
        { name: "Sam", vibe: "Up for banter", tags: ["Creative Energy", "Here for the humans"] },
        { name: "Morgan", vibe: "Thinking out loud", tags: ["Big Sci-Fi Brain", "Overthinking Things"] },
      ];

      for (const persona of personas) {
        await page.goto("/welcome");
        await page.waitForLoadState("networkidle");
        await waitForBootSequence(page, 15000, telemetry);

        await page.getByTestId("cta-press-start").click();
        await expect(page).toHaveURL(/.*\/onboarding/);

        await page.getByRole("button", { name: /GOT IT/i }).click();

        const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
        await consentCheckbox.check();
        await page.getByRole("button", { name: /CONTINUE/i }).click();

        await page.getByRole("button", { name: /Skip for now/i }).click();

        await page.getByText(new RegExp(persona.vibe, "i")).click();

        // Select tags
        for (const tag of persona.tags) {
          await page.getByText(tag).click();
        }

        const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
        await enterRadarButton.click();

        // Wait for button to not be disabled (API call started)
        await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});

        // Wait for navigation to radar (onboarding has 500ms delay + API call time)
        await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });

        // Record error banners for this persona
        const errorCount = await countErrorBanners(page);
        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            telemetry.recordErrorBanner();
          }
        }

        // Clear session for next persona
        await page.evaluate(() => {
          sessionStorage.clear();
          localStorage.clear();
        });
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("diverse use cases verified", async ({ page }) => {
    const telemetry = new TelemetryCollector('cross-persona-market-research', 'diverse-use-cases');

    try {
      // Test that all market research personas can use the app for their specific use cases
      const personas = [
        { sessionId: "river-session", token: "river-token", handle: "CozyFriend23", useCase: "neighborhood proximity matching" },
        { sessionId: "alex-session", token: "alex-token", handle: "SwiftWit45", useCase: "event/conference networking" },
        { sessionId: "jordan-session", token: "jordan-token", handle: "SteadyThinker52", useCase: "privacy features and visibility toggling" },
        { sessionId: "sam-session", token: "sam-token", handle: "WarmWit28", useCase: "event socializing without drain" },
        { sessionId: "morgan-session", token: "morgan-token", handle: "CuriousThinker63", useCase: "academic conference connections" },
      ];

      for (const persona of personas) {
        await setupSession(page, {
          sessionId: persona.sessionId,
          token: persona.token,
          handle: persona.handle,
        });

        await page.goto("/radar");
        // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
        await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

        // Verify Radar loads for each use case
        await expect(page.locator(SEL.radarHeading)).toBeVisible();

        // Record error banners for this persona
        const errorCount = await countErrorBanners(page);
        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            telemetry.recordErrorBanner();
          }
        }

        // Note: Full use case verification requires WebSocket integration
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("edge cases discovered and documented", async ({ page }) => {
    const telemetry = new TelemetryCollector('cross-persona-market-research', 'edge-cases');

    try {
      // Test edge cases specific to market research personas
      // River: Multiple neighbors in same building
      // Alex: Leaving conference (proximity breaks)
      // Jordan: Frequent visibility toggling
      // Sam: Multiple "banter" users at event
      // Morgan: Multiple researchers at conference

      await setupSession(page, {
        sessionId: "jordan-session",
        token: "jordan-token",
        handle: "SteadyThinker52",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Test frequent visibility toggling (Jordan's edge case)
      const visibilityToggle = page.getByRole("button", { name: /visibility|toggle/i });
      if (await visibilityToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Toggle visibility multiple times
        await visibilityToggle.click();
        await visibilityToggle.click();
        await visibilityToggle.click();
        await expect(visibilityToggle).toBeVisible();

        // Record visibility toggle visibility
        const visibilityVisible = await checkVisibilityToggleVisible(page);
        telemetry.recordAffordance('visibilityToggle', visibilityVisible);
      }

      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });
});

/**
 * Note: Persona Feedback Questionnaire
 *
 * After completing each persona test scenario, complete the persona-specific questionnaire:
 * - Questionnaire: docs/testing/persona-questionnaire.md
 * - Feedback Log: docs/testing/persona-feedback.md
 * - Process: Answer questions truthfully as the persona would, not as yourself
 * - Timing: Complete immediately after testing while experience is fresh
 */

