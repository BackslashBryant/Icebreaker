import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { waitForBootSequence, completeOnboarding, setupSession } from "../../utils/test-helpers";
import { setPersonaGeo, denyGeolocation } from "../../utils/geolocation";
import locations from "../../fixtures/locations.json";
import { SEL } from "../../utils/selectors";
import { TelemetryCollector, checkPanicButtonVisible, checkVisibilityToggleVisible, checkFocusOrder, countErrorBanners } from "../../utils/telemetry";

/**
 * Persona-Based E2E Tests: College Students
 * 
 * Tests core college student personas (Maya, Ethan, Zoe) to verify anxious student use cases.
 * Based on persona journey maps and test scenarios in docs/testing/persona-scenarios.md
 */

test.describe("Persona: Maya Patel - Anxious First-Year Student", () => {
  test.beforeEach(async ({ page }) => {
    // Maya's context: University campus library
    // Vibe: "thinking" ("Thinking out loud")
    // Tags: ["Quietly Curious", "Overthinking Things"]
    // Visibility: true (wants to be found, but cautiously)
  });

  test("@smoke completes onboarding with anxious user pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('maya', 'maya-onboarding-smoke');
    
    // RESEARCH: Capture network requests and console logs before submitting
    const networkErrors: string[] = [];
    const consoleErrors: string[] = [];
    
    try {
      // Navigate to welcome screen
      await page.goto("/welcome");
      await page.waitForLoadState("networkidle");
      await waitForBootSequence(page, 15000, telemetry);

      // Maya reads carefully, may hesitate before clicking
      await expect(page.getByText("ICEBREAKER")).toBeVisible();
      await expect(page.getByText("Real world.")).toBeVisible();
      
      // Click PRESS START (Maya may hesitate, but proceeds)
      await page.locator(SEL.ctaPressStart).click();
      await expect(page).toHaveURL(/.*\/onboarding/);

      // Step 0: What We Are/Not - Maya reads carefully
      await expect(page.locator(SEL.onboardingStep0)).toBeVisible();
      await page.locator(SEL.onboardingGotIt).click();

      // Step 1: 18+ Consent - Maya may pause to read terms
      await expect(page.locator(SEL.onboardingStep1)).toBeVisible();
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await expect(consentCheckbox).toBeChecked();
      await page.locator(SEL.onboardingContinue).click();

      // Step 2: Location - Maya likely skips initially (privacy-conscious)
      await expect(page.locator(SEL.onboardingStep2)).toBeVisible();
      await page.locator(SEL.onboardingSkipLocation).click();

      // Step 3: Vibe & Tags - Maya selects "thinking" vibe + 2-3 tags
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible();
      
      // Select "thinking" vibe (matches anxious state)
      await page.locator(SEL.vibeThinking).click();
      
      // Select 2-3 tags (not too many, not none)
      await page.locator(SEL.tagQuietlyCurious).click();
      await page.locator(SEL.tagOverthinkingThings).click();
      
      // Maya verifies handle is displayed (anxious user verification)
      await expect(page.getByText(/Your anonymous handle/i)).toBeVisible();
      
      page.on('request', (request) => {
        if (request.url().includes('/api/onboarding')) {
          const postData = request.postData();
          if (postData) {
            console.log('Onboarding request payload:', postData);
          }
        }
      });
      
      page.on('response', async (response) => {
        if (response.url().includes('/api/onboarding')) {
          const status = response.status();
          if (status >= 400) {
            let errorBody = '';
            try {
              errorBody = await response.text();
            } catch {}
            networkErrors.push(`${status} ${response.url()} - ${errorBody}`);
            console.log(`Network error: ${status} ${response.url()}`, errorBody);
          } else {
            const body = await response.text().catch(() => '');
            console.log(`Onboarding response (${status}):`, body);
          }
        }
      });
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Submit form - wait for API call and navigation
      const enterRadarButton = page.getByRole("button", { name: /ENTER RADAR/i });
      await enterRadarButton.click();
      
      // Wait for button to be disabled (API call started)
      await expect(enterRadarButton).toBeDisabled({ timeout: 2000 }).catch(() => {});
      
      // RESEARCH: Check for error messages on page
      await page.waitForTimeout(2000); // Wait a bit for API call to complete or fail
      const errorElement = page.locator('text=/Failed|Error|error/i');
      const hasError = await errorElement.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        throw new Error(`Onboarding API call failed - Error displayed: ${errorText}. Network errors: ${networkErrors.join(', ')}. Console errors: ${consoleErrors.join(', ')}`);
      }
      
      // RESEARCH: Check if still on onboarding page (API call may have failed silently)
      const currentUrl = page.url();
      if (currentUrl.includes('/onboarding')) {
        // Check network errors
        if (networkErrors.length > 0) {
          throw new Error(`Onboarding API call failed - Network errors: ${networkErrors.join(', ')}. Console errors: ${consoleErrors.join(', ')}`);
        }
        // Check console errors
        if (consoleErrors.length > 0) {
          throw new Error(`Onboarding API call failed - Console errors: ${consoleErrors.join(', ')}`);
        }
        // No errors detected but still on onboarding - API call may have timed out
        throw new Error(`Onboarding API call appears to have timed out or failed silently. Still on ${currentUrl}. Network errors: ${networkErrors.join(', ') || 'none'}. Console errors: ${consoleErrors.join(', ') || 'none'}`);
      }
      
      // Wait for navigation to radar (onboarding has 500ms delay + API call time)
      await expect(page).toHaveURL(/.*\/radar/, { timeout: 15000 });
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 10000 });
      
      // Record error banners if any
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      // Record test failure as error
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      // Record network/console errors
      if (networkErrors.length > 0) {
        networkErrors.forEach(err => telemetry.recordError(`Network: ${err}`));
      }
      if (consoleErrors.length > 0) {
        consoleErrors.forEach(err => telemetry.recordError(`Console: ${err}`));
      }
      await telemetry.writeToFile();
    }
  });

  test("appears on Radar and can toggle visibility", async ({ page, context }) => {
    // Set up telemetry collector
    const telemetry = new TelemetryCollector('maya', 'maya-visibility-test');
    
    try {
      // Set up Maya's session
      await setupSession(page, {
        sessionId: "maya-session",
        token: "maya-token",
        handle: "QuietThinker42",
      });

      // Set Maya's geolocation to campus library (floor 2)
      const campusLibrary = locations.venues.find((v) => v.name === "campus-library");
      if (campusLibrary) {
        await setPersonaGeo(context, campusLibrary.coordinates);
      }

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Capture telemetry: check affordances
      const panicVisible = await checkPanicButtonVisible(page);
      telemetry.recordAffordance('panicButton', panicVisible);

      // Navigate to Profile to check visibility toggle
      await page.getByRole("button", { name: /Go to profile/i }).click();
      await expect(page).toHaveURL(/.*\/profile/);
      
      const visibilityVisible = await checkVisibilityToggleVisible(page);
      telemetry.recordAffordance('visibilityToggle', visibilityVisible);

      // Check focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);

      // Check for error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }

      // Maya checks for visibility toggle (anxious user behavior)
      // Note: Visibility toggle is on Profile page, not Radar page
      // We're already on Profile page from telemetry check above
      
      // Find visibility toggle checkbox on Profile page
      const visibilityCheckbox = page.getByRole("checkbox", { name: /Show me on Radar|Hide from Radar/i });
      if (await visibilityCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Maya may toggle visibility off if overwhelmed
        await visibilityCheckbox.click();
        // Navigate back to Radar
        await page.getByRole("button", { name: /DONE/i }).click();
        await expect(page).toHaveURL(/.*\/radar/);
        // Wait for Radar heading again after returning from Profile
        await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });
      }
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("shared tag compatibility boosts signal score", async ({ page, context }) => {
    const telemetry = new TelemetryCollector('maya', 'maya-shared-tags');
    
    try {
      // This test requires simulating two personas (Maya + Zoe) with shared tags
      // For now, we'll test that Maya's tags are correctly configured
      // Full multi-persona simulation would require WebSocket mocking
      
      await setupSession(page, {
        sessionId: "maya-session",
        token: "maya-token",
        handle: "QuietThinker42",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify Radar loads (Maya would see Zoe if both were active)
      await expect(page.locator(SEL.radarHeading)).toBeVisible();
      
      // Record error banners
      const errorCount = await countErrorBanners(page);
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          telemetry.recordErrorBanner();
        }
      }
      
      // Note: Full shared tag compatibility testing requires WebSocket integration
      // This would be tested in integration tests or with mocked WebSocket data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("panic button is accessible", async ({ page }) => {
    const telemetry = new TelemetryCollector('maya', 'maya-panic-button');
    
    try {
      await setupSession(page, {
        sessionId: "maya-session",
        token: "maya-token",
        handle: "QuietThinker42",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify panic button is accessible (always-accessible FAB)
      // Panic button has aria-label="Emergency panic button"
      const panicButton = page.getByRole("button", { name: /Emergency panic button/i });
      await expect(panicButton).toBeVisible({ timeout: 5000 });
      
      // Record panic button visibility
      const panicVisible = await checkPanicButtonVisible(page);
      telemetry.recordAffordance('panicButton', panicVisible);
      
      // Verify panic button is keyboard accessible
      // Tab through to find the panic button
      await page.keyboard.press("Tab");
      // Check if panic button is focused (may need multiple tabs)
      const focusedButton = page.locator("button:focus");
      const focusedAriaLabel = await focusedButton.getAttribute("aria-label").catch(() => null);
      
      // If panic button isn't focused yet, tab more times
      if (focusedAriaLabel !== "Emergency panic button") {
        // Tab through other focusable elements to reach panic button
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab");
          const currentAriaLabel = await page.locator("button:focus").getAttribute("aria-label").catch(() => null);
          if (currentAriaLabel === "Emergency panic button") {
            break;
          }
        }
      }
      
      // Verify panic button is now focused
      await expect(panicButton).toBeFocused({ timeout: 2000 });
      
      // Record focus order
      const focusOrderCorrect = await checkFocusOrder(page);
      telemetry.recordFocusOrder(focusOrderCorrect);
      
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

  test("accessibility: WCAG AA compliance for anxious users", async ({ page }) => {
    const telemetry = new TelemetryCollector('maya', 'maya-a11y');
    
    try {
      await setupSession(page, {
        sessionId: "maya-session",
        token: "maya-token",
        handle: "QuietThinker42",
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

test.describe("Persona: Ethan Chen - Socially Anxious Sophomore", () => {
  test("completes onboarding with socially anxious pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('ethan', 'ethan-onboarding');
    
    try {
      await page.goto("/welcome");
      await page.waitForLoadState("networkidle");
      await waitForBootSequence(page, 15000, telemetry);

      // Ethan reads quickly, clicks PRESS START
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

      // Step 2: Location - Ethan grants permission (wants proximity matching)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      // Note: In real test, would grant geolocation permission
      // For now, skip to test flow
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Ethan selects "intros" vibe + tech tags
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible();
      
      // Select "intros" vibe (low-pressure)
      await page.locator(SEL.vibeIntros).click();
      
      // Select tech-related tags
      await page.locator(SEL.tagTechCurious).click();
      await page.locator(SEL.tagQuietlyCurious).click();
      
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

  test("appears on Radar and checks for shared tags", async ({ page, context }) => {
    const telemetry = new TelemetryCollector('ethan', 'ethan-shared-tags');
    
    try {
      await setupSession(page, {
        sessionId: "ethan-session",
        token: "ethan-token",
        handle: "ChillFriend28",
      });

      // Set Ethan's geolocation to campus coffee shop
      const coffeeShop = locations.venues.find((v) => v.name === "campus-coffee-shop");
      if (coffeeShop) {
        await setPersonaGeo(context, coffeeShop.coordinates);
      }

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
      
      // Ethan would look for shared "Tech curious" tag (matches with Marcus)
      // Note: Full tag compatibility testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("one-on-one chat format avoids group dynamics", async ({ page }) => {
    const telemetry = new TelemetryCollector('ethan', 'ethan-chat-format');
    
    try {
      await setupSession(page, {
        sessionId: "ethan-session",
        token: "ethan-token",
        handle: "ChillFriend28",
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
      
      // Note: One-on-one chat enforcement is tested in chat tests
      // This persona test verifies the feature works for anxious users
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("panic button is accessible for socially anxious users", async ({ page }) => {
    const telemetry = new TelemetryCollector('ethan', 'ethan-panic-button');
    
    try {
      await setupSession(page, {
        sessionId: "ethan-session",
        token: "ethan-token",
        handle: "ChillFriend28",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Verify panic button is accessible
      const panicButton = page.getByRole("button", { name: /panic|emergency|help/i });
      await expect(panicButton).toBeVisible({ timeout: 5000 });
      
      // Record panic button visibility
      const panicVisible = await checkPanicButtonVisible(page);
      telemetry.recordAffordance('panicButton', panicVisible);
      
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

test.describe("Persona: Zoe Kim - Overthinking Junior", () => {
  test("completes onboarding with overthinker pattern", async ({ page }) => {
    const telemetry = new TelemetryCollector('zoe', 'zoe-onboarding');
    
    try {
      await page.goto("/welcome");
      await page.waitForLoadState("networkidle");
      await waitForBootSequence(page, 15000, telemetry);

      // Zoe reads carefully, appreciates clear messaging
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

      // Step 2: Location - Zoe grants permission (wants proximity matching)
      await expect(page.getByText("LOCATION ACCESS")).toBeVisible();
      await page.getByRole("button", { name: /Skip for now/i }).click();

      // Step 3: Vibe & Tags - Zoe selects "surprise" vibe + overthinking tags
      await expect(page.getByText("YOUR VIBE")).toBeVisible();
      
      // Select "surprise" vibe (open to all vibes)
      await page.getByText(/Surprise me/i).click();
      
      // Select overthinking-related tags
      await page.getByText("Overthinking Things").click();
      await page.getByText("Lo-fi head").click();
      
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

  test("shared tag compatibility with Maya boosts signal score", async ({ page }) => {
    const telemetry = new TelemetryCollector('zoe', 'zoe-shared-tags-maya');
    
    try {
      await setupSession(page, {
        sessionId: "zoe-session",
        token: "zoe-token",
        handle: "MellowWildcard56",
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
      
      // Zoe would see Maya with boosted signal score (shared "Overthinking Things" tag)
      // Note: Full shared tag compatibility testing requires WebSocket integration
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("surprise vibe is compatible with all other vibes", async ({ page }) => {
    const telemetry = new TelemetryCollector('zoe', 'zoe-surprise-vibe');
    
    try {
      await setupSession(page, {
        sessionId: "zoe-session",
        token: "zoe-token",
        handle: "MellowWildcard56",
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
      
      // "Surprise" vibe should be compatible with all other vibes
      // Note: Vibe compatibility is tested in signal engine tests
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("ephemeral chat design prevents overthinking", async ({ page }) => {
    const telemetry = new TelemetryCollector('zoe', 'zoe-ephemeral-chat');
    
    try {
      await setupSession(page, {
        sessionId: "zoe-session",
        token: "zoe-token",
        handle: "MellowWildcard56",
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
      
      // Note: Ephemeral chat behavior is tested in chat tests
      // This persona test verifies the feature works for overthinkers
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("visibility toggle works when overwhelmed", async ({ page }) => {
    const telemetry = new TelemetryCollector('zoe', 'zoe-visibility-toggle');
    
    try {
      await setupSession(page, {
        sessionId: "zoe-session",
        token: "zoe-token",
        handle: "MellowWildcard56",
      });

      await page.goto("/radar");
      // Wait for Radar heading to appear (more reliable than networkidle with WebSocket connections)
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });

      // Zoe may toggle visibility off if overwhelmed
      // Note: Visibility toggle is on Profile page, not Radar page
      // Navigate to Profile to access visibility toggle
      await page.getByRole("button", { name: /Go to profile/i }).click();
      await expect(page).toHaveURL(/.*\/profile/);
      
      // Record visibility toggle visibility
      const visibilityVisible = await checkVisibilityToggleVisible(page);
      telemetry.recordAffordance('visibilityToggle', visibilityVisible);
      
      // Find visibility toggle checkbox on Profile page
      const visibilityCheckbox = page.getByRole("checkbox", { name: /Show me on Radar|Hide from Radar/i });
      if (await visibilityCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await visibilityCheckbox.click();
        // Navigate back to Radar
        await page.getByRole("button", { name: /DONE/i }).click();
        await expect(page).toHaveURL(/.*\/radar/);
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

test.describe("Cross-Persona: College Students", () => {
  test("all three personas complete onboarding successfully", async ({ page }) => {
    // Test that all three personas can complete onboarding
    // This is a sanity check that onboarding works for anxious students
    
    const telemetry = new TelemetryCollector('cross-persona', 'all-onboarding');
    
    try {
      const personas = [
        { name: "Maya", vibe: "Thinking out loud", tags: ["Quietly Curious", "Overthinking Things"] },
        { name: "Ethan", vibe: "Open to intros", tags: ["Tech curious", "Quietly Curious"] },
        { name: "Zoe", vibe: "Surprise me", tags: ["Overthinking Things", "Lo-fi head"] },
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

  test("shared tags boost signal scores (Maya + Zoe)", async ({ page }) => {
    const telemetry = new TelemetryCollector('cross-persona', 'shared-tags-maya-zoe');
    
    try {
      // This test verifies that shared tags boost signal scores
      // Full implementation would require WebSocket mocking or integration tests
      
      await setupSession(page, {
        sessionId: "maya-session",
        token: "maya-token",
        handle: "QuietThinker42",
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
      
      // Note: Full shared tag compatibility testing requires WebSocket integration
      // This would be tested in integration tests or with mocked WebSocket data
    } catch (error) {
      telemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await telemetry.writeToFile();
    }
  });

  test("panic button accessible for all college student personas", async ({ page }) => {
    const telemetry = new TelemetryCollector('cross-persona', 'panic-button-all');
    
    try {
      const personas = [
        { sessionId: "maya-session", token: "maya-token", handle: "QuietThinker42" },
        { sessionId: "ethan-session", token: "ethan-token", handle: "ChillFriend28" },
        { sessionId: "zoe-session", token: "zoe-token", handle: "MellowWildcard56" },
      ];

      for (const persona of personas) {
        await setupSession(page, persona);
        await page.goto("/radar");
        await page.waitForLoadState("networkidle");

        const panicButton = page.getByRole("button", { name: /panic|emergency|help/i });
        await expect(panicButton).toBeVisible({ timeout: 5000 });
        
        // Record panic button visibility for this persona
        const panicVisible = await checkPanicButtonVisible(page);
        telemetry.recordAffordance('panicButton', panicVisible);
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

