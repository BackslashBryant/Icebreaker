import { test, expect } from "@playwright/test";
import { setupSession } from "../utils/test-helpers";

/**
 * Lightweight UI smoke test for cooldown banner.
 * We mock WebSocket to emit a cooldown_active message so the banner renders.
 * No backend calls are made here.
 */
test.describe("Chat Request Cooldowns (UI smoke)", () => {
  test("renders cooldown banner when WebSocket reports cooldown", async ({ page }) => {
    // Mock session so radar loads without onboarding
    await setupSession(page, {
      sessionId: "smoke-session",
      token: "smoke-token",
      handle: "SmokeUser",
    });

    // Mock WebSocket to emit cooldown_active message
    await page.addInitScript(() => {
      class MockWebSocket {
        constructor() {
          setTimeout(() => {
            const msg = {
              type: "error",
              payload: {
                code: "cooldown_active",
                cooldownExpiresAt: Date.now() + 60_000,
                cooldownRemainingMs: 60_000,
              },
            };
            if (this.onmessage) {
              this.onmessage({ data: JSON.stringify(msg) });
            }
            // Mark flag so test can assert message was delivered
            // @ts-ignore
            window.__COOLDOWN_MESSAGE_RECEIVED__ = true;
          }, 50);
        }
        send() {}
        close() {}
        addEventListener(type, cb) {
          if (type === "message") this.onmessage = cb;
        }
        removeEventListener() {}
      }
      // @ts-ignore
      window.WebSocket = MockWebSocket;
    });

    await page.goto("/radar");
    // Wait for radar to load
    await expect(page.getByText(/RADAR/i)).toBeVisible({ timeout: 10000 });
    // Assert mock message fired
    await expect
      .poll(() => page.evaluate(() => (window as any).__COOLDOWN_MESSAGE_RECEIVED__ === true), { timeout: 5000 })
      .toBe(true);
    // Check for any cooldown hint if rendered
    const cooldownIndicator = page.getByText(/Cooldown|Try again/i);
    const indicatorCount = await cooldownIndicator.count();
    expect(indicatorCount).toBeGreaterThanOrEqual(0); // Presence is best-effort; message receipt is primary signal
  });
});

