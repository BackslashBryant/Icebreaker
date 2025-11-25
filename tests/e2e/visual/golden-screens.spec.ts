/**
 * Golden Screens Visual Regression Tests
 * 
 * Captures the "Golden Screens" that represent key user journeys:
 * 1. Welcome screen
 * 2. Onboarding Step 0 (Consent)
 * 3. Onboarding Step 1 (Location)
 * 4. Onboarding Step 2 (Vibe)
 * 5. Onboarding Step 3 (Tags)
 * 6. Radar empty state
 * 7. Chat empty state
 * 8. Profile screen
 * 9. Panic dialog
 * 
 * These screens are used for visual regression testing and must pass before merge.
 * Any visual changes require explicit approval.
 * 
 * Config: 2% diff threshold (maxDiffPixelRatio: 0.02) in playwright.config.ts
 */

import { test, expect } from '@playwright/test';
import { VIEWPORTS, getViewportNames, setViewport, MASK_SELECTORS } from '../../utils/viewports';
import { setupSession, waitForBootSequence } from '../../utils/test-helpers';
import { SEL } from '../../utils/selectors';

test.describe('Golden Screens: Visual Regression', () => {
  // Test each viewport
  for (const viewportName of getViewportNames()) {
    const viewport = VIEWPORTS[viewportName as keyof typeof VIEWPORTS];

    test(`Golden Screen 1: Welcome - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/welcome');
      await waitForBootSequence(page);
      await expect(page.getByText('ICEBREAKER')).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-welcome-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 2: Onboarding Step 0 (Consent) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await expect(page.locator(SEL.onboardingStep0)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-onboarding-step-0-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 3: Onboarding Step 1 (Location) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      await expect(page.locator(SEL.onboardingStep1)).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-onboarding-step-1-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 4: Onboarding Step 2 (Vibe) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      // Check consent checkbox before clicking Continue
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.locator(SEL.onboardingContinue).click();
      // Skip location step to get to Vibe step
      await expect(page.locator(SEL.onboardingStep2)).toBeVisible({ timeout: 15000 });
      await page.locator(SEL.onboardingSkipLocation).click();
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 15000 });

      // Select a vibe for visual consistency
      await page.locator(SEL.vibeThinking).click();

      await expect(page).toHaveScreenshot(`golden-onboarding-step-2-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 5: Onboarding Step 3 (Tags) - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto('/onboarding');
      await page.locator(SEL.onboardingGotIt).click();
      // Check consent checkbox before clicking Continue
      const consentCheckbox = page.getByRole("checkbox", { name: /I am 18 or older/i });
      await consentCheckbox.check();
      await page.locator(SEL.onboardingContinue).click();
      await page.locator(SEL.onboardingSkipLocation).click();
      await expect(page.locator(SEL.onboardingStep3)).toBeVisible({ timeout: 15000 });

      // Select a vibe and tag for visual consistency
      await page.locator(SEL.vibeThinking).click();
      await page.locator(SEL.tagQuietlyCurious).click();

      await expect(page).toHaveScreenshot(`golden-onboarding-step-3-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 6: Radar Empty State - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/radar');
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000); // Wait for empty state to render

      await expect(page).toHaveScreenshot(`golden-radar-empty-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 7: Chat Empty State - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/chat');
      await page.waitForTimeout(1000); // Wait for empty state to render

      await expect(page).toHaveScreenshot(`golden-chat-empty-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 8: Profile Screen - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
        tags: ['Quietly Curious'],
        vibe: 'thinking',
      });

      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: /PROFILE/i })).toBeVisible({ timeout: 15000 });

      await expect(page).toHaveScreenshot(`golden-profile-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });

    test(`Golden Screen 9: Panic Dialog - ${viewport.name}`, async ({ page }) => {
      await setViewport(page, viewport);
      
      // Inject WebSocket mock BEFORE session setup (required for panic button)
      await page.addInitScript(() => {
        // Create minimal WebSocket mock for panic dialog test
        const WS_OPEN = 1;
        class MinimalWsMock {
          private connections: Map<string, any> = new Map();
          
          connect(sessionId: string, onMessage: (msg: any) => void) {
            const ws = {
              readyState: WS_OPEN,
              send: (message: string) => {
                const parsed = JSON.parse(message);
                if (parsed.type === 'panic:trigger') {
                  // Simulate panic:triggered response
                  setTimeout(() => {
                    onMessage({
                      type: 'panic:triggered',
                      payload: { exclusionExpiresAt: Date.now() + 3600000 },
                    });
                  }, 100);
                }
              },
              close: () => {},
              onopen: null as any,
              onmessage: null as any,
              onclose: null as any,
              onerror: null as any,
            };
            this.connections.set(sessionId, { ws, onMessage });
            
            // Trigger connection open
            setTimeout(() => {
              if (ws.onopen) ws.onopen();
              onMessage({ type: 'connected', payload: { sessionId } });
            }, 10);
            
            return ws;
          }
        }
        
        (window as any).__WS_MOCK__ = new MinimalWsMock();
        (window as any).__PLAYWRIGHT_WS_MOCK__ = '1';
      });
      
      await setupSession(page, {
        sessionId: 'test-session',
        token: 'test-token',
        handle: 'TestUser',
      });

      await page.goto('/radar');
      await expect(page.locator(SEL.radarHeading)).toBeVisible({ timeout: 15000 });
      
      const panicButton = page.locator(SEL.panicFab);
      await expect(panicButton).toBeVisible({ timeout: 10000 });
      await panicButton.click();
      
      const panicDialog = page.locator(SEL.panicDialog);
      await expect(panicDialog).toBeVisible({ timeout: 10000 });

      await expect(page).toHaveScreenshot(`golden-panic-dialog-${viewport.name}.png`, {
        fullPage: true,
        mask: MASK_SELECTORS.map((selector) => page.locator(selector)),
      });
    });
  }
});

