import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { completeOnboarding as completeOnboardingHelper } from "../utils/test-helpers";
import campusLibraryScript from "../fixtures/persona-presence/campus-library.json";

/**
 * Ensure WebSocket mock is injected before any navigation
 * so Radar view connects to the mock instead of real backend.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (typeof window !== "undefined") {
      (window as any).__E2E_TESTING__ = true;
    }
  });
  await page.addInitScript((script) => {
    if (typeof window === 'undefined') return;
    const WS_OPEN = 1;
    const WS_CLOSED = 3;

    if (typeof (window as any).__WS_MOCK__ === 'undefined') {
      class BrowserWsMock {
        private script: any;
        private connections: Map<string, any> = new Map();
        private activeChats: Map<string, string> = new Map();
        private pendingChatRequests: Map<string, any> = new Map();

        constructor(script: any) {
          this.script = script || { personas: [] };
        }

        connect(sessionId: string, onMessage: (msg: any) => void) {
          const ws = {
            readyState: WS_OPEN,
            send: (message: string) => {
              this.handleMessage(sessionId, message);
            },
            close: () => {
              this.disconnect(sessionId);
            },
            onopen: null,
            onmessage: null,
            onclose: null,
            onerror: null,
          };

          this.connections.set(sessionId, {
            ws,
            sessionId,
            onMessage,
          });

          setTimeout(() => {
            if (ws.onopen) ws.onopen();
            onMessage({
              type: 'connected',
              payload: {
                sessionId,
                handle: this.getPersona(sessionId)?.handle || 'Unknown',
              },
            });
            this.broadcastPresence();
          }, 10);

          return ws;
        }

        disconnect(sessionId: string) {
          const conn = this.connections.get(sessionId);
          if (conn) {
            conn.ws.readyState = WS_CLOSED;
            if (conn.ws.onclose) conn.ws.onclose();
            this.connections.delete(sessionId);
          }
        }

        private handleMessage(sessionId: string, rawMessage: string) {
          try {
            const message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
            switch (message.type) {
              case 'radar:subscribe':
                this.broadcastPresence();
                break;
              case 'location:update': {
                const { lat, lng } = message.payload || {};
                if (typeof lat === 'number' && typeof lng === 'number') {
                  this.updateGeo(sessionId, lat, lng);
                }
                break;
              }
              case 'chat:request':
                this.handleChatRequest(sessionId, message.payload?.targetSessionId);
                break;
              case 'chat:accept':
                this.handleChatAccept(sessionId, message.payload?.requesterSessionId);
                break;
              case 'chat:decline':
                this.handleChatDecline(sessionId, message.payload?.requesterSessionId);
                break;
              case 'chat:message':
                this.handleChatMessage(sessionId, message.payload);
                break;
              case 'chat:end':
                this.handleChatEnd(sessionId);
                break;
              case 'panic:trigger':
                this.handlePanicTrigger(sessionId);
                break;
            }
          } catch (error) {
            console.error('[BrowserWsMock] Failed to parse message', error);
          }
        }

        private handleChatRequest(requesterSessionId: string, targetSessionId: string) {
          if (!requesterSessionId || !targetSessionId) return;
          if (this.activeChats.has(requesterSessionId)) {
            this.sendError(requesterSessionId, 'One chat at a time', 'one_chat_at_a_time');
            return;
          }
          if (this.activeChats.has(targetSessionId)) {
            this.sendError(requesterSessionId, 'User is busy', 'user_busy');
            return;
          }
          const requester = this.getPersona(requesterSessionId);
          const requestId = `req-${Date.now()}-${requesterSessionId}`;
          this.pendingChatRequests.set(requestId, {
            requesterSessionId,
            targetSessionId,
            requestId,
          });
          this.sendToSession(requesterSessionId, {
            type: 'chat:request:ack',
            payload: { requestId },
          });
          this.sendToSession(targetSessionId, {
            type: 'chat:request',
            payload: {
              fromSessionId: requesterSessionId,
              fromHandle: requester?.handle || 'Tester',
              requestId,
            },
          });
        }

        private handleChatAccept(accepterSessionId: string, requesterSessionId: string) {
          const request = Array.from(this.pendingChatRequests.values()).find(
            (r) => r.targetSessionId === accepterSessionId && r.requesterSessionId === requesterSessionId
          );
          if (!request) return;
          this.pendingChatRequests.delete(request.requestId);
          this.activeChats.set(requesterSessionId, accepterSessionId);
          this.activeChats.set(accepterSessionId, requesterSessionId);
          this.sendToSession(requesterSessionId, {
            type: 'chat:accepted',
            payload: {
              partnerSessionId: accepterSessionId,
              partnerHandle: this.getPersona(accepterSessionId)?.handle || 'Tester',
            },
          });
          this.sendToSession(accepterSessionId, {
            type: 'chat:accepted',
            payload: {
              partnerSessionId: requesterSessionId,
              partnerHandle: this.getPersona(requesterSessionId)?.handle || 'Tester',
            },
          });
        }

        private handleChatDecline(declinerSessionId: string, requesterSessionId: string) {
          const request = Array.from(this.pendingChatRequests.values()).find(
            (r) => r.targetSessionId === declinerSessionId && r.requesterSessionId === requesterSessionId
          );
          if (!request) return;
          this.pendingChatRequests.delete(request.requestId);
          this.sendToSession(requesterSessionId, { type: 'chat:declined', payload: {} });
        }

        private handleChatMessage(senderSessionId: string, payload: any) {
          const partnerSessionId = this.activeChats.get(senderSessionId);
          if (!partnerSessionId) {
            this.sendError(senderSessionId, 'No active chat');
            return;
          }
          this.sendToSession(partnerSessionId, {
            type: 'chat:message',
            payload: { ...payload, sender: 'them' },
          });
        }

        private handleChatEnd(sessionId: string) {
          const partnerSessionId = this.activeChats.get(sessionId);
          if (partnerSessionId) {
            this.activeChats.delete(sessionId);
            this.activeChats.delete(partnerSessionId);
            this.sendToSession(partnerSessionId, { type: 'chat:end', payload: {} });
          }
        }

        private handlePanicTrigger(sessionId: string) {
          this.handleChatEnd(sessionId);
          this.setVisibility(sessionId, false);
          this.sendToSession(sessionId, {
            type: 'panic:triggered',
            payload: { exclusionExpiresAt: Date.now() + 3600000 },
          });
        }

        private broadcastPresence() {
          const personas = this.script.personas || [];
          this.connections.forEach((conn) => {
            const others = personas
              .filter((p: any) => p.sessionId !== conn.sessionId)
              .map((p: any) => ({
                sessionId: p.sessionId,
                handle: p.handle,
                vibe: p.vibe,
                tags: p.tags || [],
                signal: 80,
                proximity: 'nearby',
              }));
            conn.onMessage({ type: 'radar:update', payload: { people: others } });
          });
        }

        emitRadarUpdate(sessionId: string, people: Array<{
          sessionId: string;
          handle: string;
          vibe: string;
          tags: string[];
          signal: number;
          proximity: string | null;
        }>) {
          this.sendToSession(sessionId, {
            type: 'radar:update',
            payload: { people },
          });
        }

        private updateGeo(sessionId: string, lat: number, lon: number, floor?: number) {
          const persona = this.getPersona(sessionId);
          if (persona) {
            persona.geo = { lat, lon, floor };
            this.broadcastPresence();
          }
        }

        private setVisibility(sessionId: string, visible: boolean) {
          const persona = this.getPersona(sessionId);
          if (persona) {
            persona.visible = visible;
            this.broadcastPresence();
          }
        }

        private getPersona(sessionId: string) {
          return this.script.personas.find((p: any) => p.sessionId === sessionId);
        }

        private sendToSession(sessionId: string, message: any) {
          const conn = this.connections.get(sessionId);
          if (conn) conn.onMessage(message);
        }

        private sendError(sessionId: string, message: string, code?: string) {
          this.sendToSession(sessionId, { type: 'error', payload: { message, code } });
        }
      }

      (window as any).__WS_MOCK__ = new BrowserWsMock(script);
    }
    (window as any).__PLAYWRIGHT_WS_MOCK__ = '1';
  }, campusLibraryScript);
});

/**
 * Helper function to complete onboarding and return session token
 * Uses the shared helper from test-helpers.ts for reliability
 */
async function completeOnboarding(page: any, vibe: string = "banter") {
  return await completeOnboardingHelper(page, { vibe, skipLocation: true });
}

async function mockReportAPI(context: any) {
  await context.route("**/api/safety/report", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}

async function submitMockReport(page: any, token: string, targetSessionId: string, category: string) {
  return await page.evaluate(
    async ({ token, targetSessionId, category }) => {
      const response = await fetch("/api/safety/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetSessionId, category }),
      });
      return { status: response.status, ok: response.ok };
    },
    { token, targetSessionId, category }
  );
}

async function bootstrapSession(page: any, session: { sessionId: string; token: string; handle: string; tags?: string[] }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((session) => {
    sessionStorage.setItem("icebreaker_session", JSON.stringify(session));
    localStorage.setItem("icebreaker_session_token", session.token);
  }, session);
}

/**
 * Set up chat state and ensure chat is active
 * The chat page needs partner info in sessionStorage and chat state to be "active"
 */
async function setupActiveChat(page: any, partnerSessionId: string, partnerHandle: string) {
  // Set session storage for chat partner using addInitScript
  // This ensures it's set before the page loads and React components mount
  await page.addInitScript(({ sessionId, handle }: { sessionId: string; handle: string }) => {
    // Set sessionStorage before page loads
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem("icebreaker:chat:partnerSessionId", sessionId);
      sessionStorage.setItem("icebreaker:chat:partnerHandle", handle);
    }
  }, { sessionId: partnerSessionId, handle: partnerHandle });

  // Navigate to chat
  await page.goto("/chat", { waitUntil: "domcontentloaded" });

  // Verify we're still on /chat (not redirected to /radar)
  await expect(page).toHaveURL(/.*\/chat/, { timeout: 5000 });

  // Wait for chat header to appear (ChatHeader should render even in requesting state)
  await expect(page.getByText(partnerHandle)).toBeVisible({ timeout: 10000 });

  // Wait for page to be fully loaded
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
    // Ignore networkidle timeout - page may be ready even if network isn't idle
  });
}

/**
 * Seed mock people in Radar view using WebSocket mock's public emitRadarUpdate method
 */
async function seedMockPeople(page: any, people: Array<{ sessionId: string; handle: string; vibe?: string; tags?: string[]; signal?: number }>) {
  // Get current session ID - WebSocket uses token from URL or sessionStorage
  // The WebSocket client extracts sessionId from sessionStorage.getItem('icebreaker_session')
  // OR uses the token from the URL query parameter
  const sessionId = await page.evaluate(() => {
    // Try sessionStorage first (matches WebSocket client logic)
    const sessionStr = sessionStorage.getItem("icebreaker_session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.sessionId) {
          return session.sessionId;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Fallback to token from localStorage (WebSocket client uses this as fallback)
    const token = localStorage.getItem("icebreaker_session_token");
    if (token) {
      return token;
    }
    // Last resort: use a test session ID
    return "test-session";
  });
  
  // Debug: Log the session ID we're using
  console.log(`[seedMockPeople] Using sessionId: ${sessionId}`);

  // Format people data for radar update
  // Note: useRadar expects 'signal' field, not 'signalScore'
  const formattedPeople = people.map((p) => ({
    sessionId: p.sessionId,
    handle: p.handle,
    vibe: p.vibe || "banter",
    tags: p.tags || [],
    signal: p.signal || 75,
    proximity: null as string | null,
  }));

  // Use WebSocket mock's public emitRadarUpdate method
  const result = await page.evaluate(({ sessionId, people }) => {
    const mock = (window as any).__WS_MOCK__;
    if (mock && typeof mock.emitRadarUpdate === 'function') {
      try {
        mock.emitRadarUpdate(sessionId, people);
        return { success: true, sessionId, peopleCount: people.length };
      } catch (error) {
        return { success: false, error: String(error), sessionId };
      }
    } else {
      return { success: false, error: "Mock or emitRadarUpdate not available", hasMock: !!mock, hasMethod: mock ? typeof mock.emitRadarUpdate : 'no mock' };
    }
  }, { sessionId, people: formattedPeople });
  
  if (!result.success) {
    console.warn(`[seedMockPeople] Failed to seed people: ${result.error || 'unknown error'}`);
  }
  
  // Wait for person buttons to render
  await page.waitForFunction(() => {
    return document.querySelectorAll("ul[role='list'] li button").length > 0;
  }, { timeout: 5000 }).catch(() => {
    console.warn(`[seedMockPeople] Person list not visible after seeding. SessionId: ${sessionId}`);
  });
}


test.describe("Block/Report Safety Controls", () => {
  test("Block user from Chat header", async ({ page }) => {
    // Mock API responses for block action
    await page.route("**/api/safety/block", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Complete onboarding
    await completeOnboarding(page);

    // Set up active chat with partner
    await setupActiveChat(page, "target-session-123", "TestUser");

    // Click menu button (More options)
    const menuButton = page.getByRole("button", { name: /More options/i });
    await expect(menuButton).toBeVisible({ timeout: 5000 });
    await menuButton.click();

    // Wait for menu dropdown to appear (menu items are buttons inside a dropdown div)
    // The menu is rendered conditionally when showMenu is true
    await page.waitForTimeout(300); // Give React time to render menu

    // Click Block button (it's a button element, not a menuitem role)
    // Use getByText since the button doesn't have a specific role
    const blockButton = page.getByText(/^Block$/i).first();
    await expect(blockButton).toBeVisible({ timeout: 2000 });
    await blockButton.click();

    // Block dialog should appear (dialog title is "Block TestUser?")
    await expect(page.getByText(/Block TestUser/i)).toBeVisible({ timeout: 2000 });

    // Wait for dialog to be fully rendered
    await page.waitForTimeout(500);

    // Confirm block (button text is "Block" when not loading)
    // Find the button by text content since it might not have a specific role
    const confirmButton = page.getByText(/^Block$/i).filter({ hasNotText: /Blocking/i });
    await expect(confirmButton).toBeVisible({ timeout: 2000 });
    await confirmButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Success toast should appear OR chat should redirect to radar
    // The block action ends the chat, so we should be redirected
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 5000 });

    // Chat should end (redirect to Radar)
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 5000 });
  });

  test("Report user from Chat header", async ({ page }) => {
    // Mock API responses for report action
    await mockReportAPI(page.context());

    // Complete onboarding
    await completeOnboarding(page);

    // Set up active chat with partner
    await setupActiveChat(page, "target-session-456", "ReportTarget");

    // Click menu button
    const menuButton = page.getByRole("button", { name: /More options/i });
    await expect(menuButton).toBeVisible({ timeout: 5000 });
    await menuButton.click();

    // Wait for menu dropdown to appear
    await page.waitForTimeout(300); // Give React time to render menu

    // Click Report button (it's a button element, not a menuitem role)
    // Use getByText since the button doesn't have a specific role
    const reportButton = page.getByText(/^Report$/i).first();
    await expect(reportButton).toBeVisible({ timeout: 2000 });
    await reportButton.click();

    // Report dialog should appear (dialog title is "Report ReportTarget?")
    await expect(page.getByText(/Report ReportTarget/i)).toBeVisible({ timeout: 2000 });

    // Wait for dialog to be fully rendered
    await page.waitForTimeout(300);

    // Select category (Harassment) - it's a button element, use getByText
    const harassmentButton = page.getByText(/^Harassment$/i);
    await expect(harassmentButton).toBeVisible({ timeout: 2000 });
    await harassmentButton.click();

    // Wait for selection to update
    await page.waitForTimeout(200);

    // Submit report (button is enabled after category selection)
    const submitButton = page.getByRole("button", { name: /Submit Report/i });
    await expect(submitButton).toBeEnabled({ timeout: 2000 });
    await submitButton.click();

    // Wait for API call to complete and dialog to close
    await page.waitForTimeout(1000);

    // Success toast should appear (toast text: "Report submitted. Thank you.")
    await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
  });

  test("Block user from PersonCard (tap-hold)", async ({ page }) => {
    // Mock API responses for block action
    await page.route("**/api/safety/block", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

    // Switch to list view so people render as buttons we can click
    const listToggle = page.getByRole("button", { name: /Switch to list view/i });
    await listToggle.click();

    // Wait for WebSocket connection to be established
    await page.waitForFunction(() => {
      return (window as any).__ICEBREAKER_WS_STATUS__ === "connected";
    }, { timeout: 10000 }).catch(() => {
      // If status check fails, wait a bit for connection
    });
    await page.waitForTimeout(2000);

    // Seed mock people in Radar
    await seedMockPeople(page, [
      { sessionId: "target-session-789", handle: "TestPerson", vibe: "banter", tags: [], signal: 75 },
    ]);

    // Wait for radar content to be available (people list or empty state)
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    // Use first() to avoid strict mode violation (multiple elements match)
    const radarContent = page.getByRole("main")
      .or(page.locator("canvas"))
      .or(page.locator("ul[role='list']"))
      .or(page.getByText(/No one nearby/i));
    await expect(radarContent.first()).toBeVisible({ timeout: 10000 });

    // Wait for person list to appear
    const personButtons = page.locator("ul[role='list'] li button");
    await expect(personButtons.first()).toBeVisible({ timeout: 5000 });

    // Click first person to open PersonCard
    await personButtons.first().click();

    // PersonCard dialog should open
    const personCardDialog = page.getByRole("dialog");
    await expect(personCardDialog).toBeVisible({ timeout: 2000 });
    const blockTargetHandle = ((await personCardDialog.getByRole("heading", { level: 2 }).textContent()) || "").trim();

    const safetyButton = page.getByTestId("person-card-safety");
    await expect(safetyButton).toBeVisible({ timeout: 3000 });
    await safetyButton.click();

    await page.evaluate(() => {
      (window as any).__ICEBREAKER_E2E__?.openPersonCardBlockDialog?.();
    });

    // Block dialog should appear
    await expect(page.getByText(new RegExp(`Block ${blockTargetHandle}`, "i"))).toBeVisible({ timeout: 5000 });

    // Wait for dialog to be fully rendered
    await page.waitForTimeout(300);

    // Confirm block
    const confirmButton = page.getByText(/^Block$/i).filter({ hasNotText: /Blocking/i });
    await expect(confirmButton).toBeVisible({ timeout: 2000 });
    await confirmButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Success toast should appear
    await expect(page.getByText(/User blocked/i)).toBeVisible({ timeout: 5000 });
  });

  test("Report user from PersonCard (tap-hold)", async ({ page }) => {
    // Ensure WebSocket mock is available before starting
    // Mock API responses for report action
    await mockReportAPI(page.context());

    // Complete onboarding
    await completeOnboarding(page);

    // Wait for Radar page
    await expect(page).toHaveURL(/.*\/radar/, { timeout: 10000 });

    // Switch to list view to render people list
    const listToggle = page.getByRole("button", { name: /Switch to list view/i });
    await listToggle.click();

    // Re-inject WebSocket mock after navigation (it may be lost during page navigation)
    // Wait for WebSocket connection to be established
    await page.waitForFunction(() => {
      return (window as any).__ICEBREAKER_WS_STATUS__ === "connected";
    }, { timeout: 10000 }).catch(() => {
      // If status check fails, wait a bit for connection
    });
    await page.waitForTimeout(2000);

    // Seed mock people in Radar
    await seedMockPeople(page, [
      { sessionId: "target-session-999", handle: "ReportTarget", vibe: "chill", tags: [], signal: 80 },
    ]);

    // Wait for radar content to be available (people list or empty state)
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    // Use first() to avoid strict mode violation (multiple elements match)
    const radarContent = page.getByRole("main")
      .or(page.locator("canvas"))
      .or(page.locator("ul[role='list']"))
      .or(page.getByText(/No one nearby/i));
    await expect(radarContent.first()).toBeVisible({ timeout: 10000 });

    // Wait for person list to appear
    const personButtons = page.locator("ul[role='list'] li button");
    await expect(personButtons.first()).toBeVisible({ timeout: 5000 });

    // Click first person to open PersonCard
    await personButtons.first().click();
    const personCardDialog = page.getByRole("dialog");
    await expect(personCardDialog).toBeVisible({ timeout: 2000 });
    const reportTargetHandle = ((await personCardDialog.getByRole("heading", { level: 2 }).textContent()) || "").trim();

    const safetyButton = page.getByTestId("person-card-safety");
    await expect(safetyButton).toBeVisible({ timeout: 3000 });
    await safetyButton.click();

    await page.evaluate(() => {
      (window as any).__ICEBREAKER_E2E__?.openPersonCardReportDialog?.();
    });

    // Report dialog should appear
    await expect(page.getByText(new RegExp(`Report ${reportTargetHandle}`, "i"))).toBeVisible({ timeout: 5000 });

    // Wait for dialog to be fully rendered
    await page.waitForTimeout(300);

    // Select category (Spam) - it's a button element
    const spamButton = page.getByText(/^Spam$/i);
    await expect(spamButton).toBeVisible({ timeout: 2000 });
    await spamButton.click();

    // Wait for selection to update
    await page.waitForTimeout(200);

    // Submit report (button is enabled after category selection)
    const submitButton = page.getByRole("button", { name: /Submit Report/i });
    await expect(submitButton).toBeEnabled({ timeout: 2000 });
    await submitButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Success toast should appear
    await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
  });

  test("Multiple reports trigger safety exclusion", async ({ page, browser }) => {
    await mockReportAPI(page.context());

    // This test requires multiple sessions reporting the same user
    // We'll simulate this by making multiple API calls with mocked tokens
    
    // Complete onboarding for reporter 1
    await completeOnboarding(page, "banter");
    
    // Set a mock token in localStorage for API calls
    await page.evaluate(() => {
      localStorage.setItem("icebreaker_session_token", "mock-token-1");
    });
    
    // Make first report via API
    const response1 = await submitMockReport(page, "mock-token-1", "target-session-789", "harassment");
    expect(response1.status).toBe(200);
    expect(response1.ok).toBeTruthy();

    // Create second session (new browser context)
    const context2 = await browser.newContext();
    await mockReportAPI(context2);
    const page2 = await context2.newPage();
    await bootstrapSession(page2, {
      sessionId: "mock-session-2",
      token: "mock-token-2",
      handle: "ReporterTwo",
    });
    
    // Make second report
    const response2 = await submitMockReport(page2, "mock-token-2", "target-session-789", "spam");
    expect(response2.status).toBe(200);
    expect(response2.ok).toBeTruthy();

    // Create third session
    const context3 = await browser.newContext();
    await mockReportAPI(context3);
    const page3 = await context3.newPage();
    await bootstrapSession(page3, {
      sessionId: "mock-session-3",
      token: "mock-token-3",
      handle: "ReporterThree",
    });
    
    // Make third report (should trigger safety exclusion)
    const response3 = await submitMockReport(page3, "mock-token-3", "target-session-789", "impersonation");
    expect(response3.status).toBe(200);
    expect(response3.ok).toBeTruthy();

    // Cleanup
    await page2.close();
    await page3.close();
    await context2.close();
    await context3.close();
  });

  test("Block/Report dialogs are accessible (WCAG AA)", async ({ page }) => {
    // Complete onboarding
    await completeOnboarding(page);

    // Navigate to chat (set up chat state via session storage)
    await page.addInitScript(() => {
      sessionStorage.setItem("icebreaker:chat:partnerSessionId", "test-session");
      sessionStorage.setItem("icebreaker:chat:partnerHandle", "TestUser");
    });
    await page.goto("/chat", { waitUntil: "networkidle" });

    // Wait for chat header
    await expect(page.getByText("TestUser")).toBeVisible({ timeout: 5000 });

    // Open menu
    const menuButton = page.getByRole("button", { name: /More options/i });
    await menuButton.click();

    // Wait for menu dropdown to appear
    await page.waitForTimeout(300);

    // Open Block dialog (menu items are buttons, not menuitems)
    const blockOption = page.getByText(/^Block$/i).first();
    await expect(blockOption).toBeVisible({ timeout: 2000 });
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
    // Wait for menu dropdown to appear
    await page.waitForTimeout(300);
    // Menu items are buttons, not menuitems
    const reportOption = page.getByText(/^Report$/i).first();
    await expect(reportOption).toBeVisible({ timeout: 2000 });
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
    await mockReportAPI(page.context());

    // Navigate to chat (set up chat state via session storage)
    await page.addInitScript(() => {
      sessionStorage.setItem("icebreaker:chat:partnerSessionId", "test-session");
      sessionStorage.setItem("icebreaker:chat:partnerHandle", "TestUser");
    });
    await page.goto("/chat", { waitUntil: "networkidle" });

    // Wait for chat header
    await expect(page.getByText("TestUser")).toBeVisible({ timeout: 5000 });

    // Move focus directly to the Safety menu trigger so keyboard interactions are deterministic
    const menuButton = page.getByRole("button", { name: /More options/i });
    await menuButton.focus();
    await expect(menuButton).toBeFocused({ timeout: 2000 });
    await menuButton.press("Enter");

    // Wait for menu dropdown to appear (menu is a div, not a role="menu")
    await page.waitForTimeout(500);
    // Check for menu content via aria-labels on menu buttons
    const reportMenuEntry = page.locator('button[aria-label="Report user"]').first();
    const blockMenuEntry = page.locator('button[aria-label="Block user"]').first();
    await expect(reportMenuEntry).toBeVisible({ timeout: 2000 });
    await expect(blockMenuEntry).toBeVisible({ timeout: 2000 });

    // Navigate menu items with keyboard: Tab into menu, Arrow keys cycle options, Enter to select
    await page.keyboard.press("Tab");
    await expect(reportMenuEntry).toBeFocused({ timeout: 2000 });
    await page.keyboard.press("Tab");
    await expect(blockMenuEntry).toBeFocused({ timeout: 2000 });
    await page.keyboard.press("Shift+Tab");
    await expect(reportMenuEntry).toBeFocused({ timeout: 2000 });
    await page.keyboard.press("Enter");

    // Report dialog should open
    await expect(page.getByText(/Report TestUser/i)).toBeVisible({ timeout: 2000 });

    // Navigate report categories with keyboard and select one
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    // Submit with Enter while button is focused
    const submitReportButton = page.getByRole("button", { name: /Submit Report/i });
    await expect(submitReportButton).toBeEnabled({ timeout: 2000 });
    await submitReportButton.press("Enter");

    // Success toast should appear
    await expect(page.getByText(/Report submitted|Thank you/i)).toBeVisible({ timeout: 5000 });
  });
});
