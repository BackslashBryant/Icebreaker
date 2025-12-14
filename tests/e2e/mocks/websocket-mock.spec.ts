/**
 * Simple test to verify WebSocket mock infrastructure
 * 
 * This test verifies that the mock can be injected and used.
 * Full multi-user tests will be added in Step 3.
 */

import { test, expect } from '../fixtures/ws-mock.setup';
import { waitForBootSequence, setupSession } from '../../utils/test-helpers';

test.describe('WebSocket Mock Infrastructure', () => {
  test('@smoke mock is injected and available', async ({ page, wsMock, presenceScript }) => {
    // Navigate to a page so addInitScript executes
    await page.goto('/welcome');
    
    // Verify mock is available in browser context
    const mockAvailable = await page.evaluate(() => {
      return typeof (window as any).__WS_MOCK__ !== 'undefined';
    });
    expect(mockAvailable).toBe(true);

    // Verify presence script has personas
    expect(presenceScript.personas.length).toBeGreaterThan(0);
    expect(presenceScript.personas[0].sessionId).toBe('maya-session');
  });

  test('can set up session and connect to mock', async ({ page, wsMock }) => {
    // Set up Maya's session
    await setupSession(page, {
      sessionId: 'maya-session',
      token: 'maya-token',
      handle: 'QuietThinker42',
    });

    // Navigate to welcome first to trigger boot sequence, then go to radar
    await page.goto('/welcome');
    await waitForBootSequence(page);
    await page.goto('/radar');

    // Wait for WebSocket connection (mock should send radar:update)
    // This is a basic smoke test - full multi-user tests in Step 3
    await page.waitForTimeout(1000);

    // Verify page loaded (basic check)
    const url = page.url();
    expect(url).toContain('/radar');
  });

  test('connect() triggers onConnect callback', async ({ page, wsMock }) => {
    await page.goto('/welcome');
    
    let onConnectCalled = false;
    let receivedMessage: any = null;

    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock) {
        const ws = mock.connect('test-session', (msg: any) => {
          (window as any).__TEST_MESSAGE__ = msg;
        });
        ws.onopen = () => {
          (window as any).__TEST_ONOPEN_CALLED__ = true;
        };
      }
    });

    // Wait for connection to establish (mock uses 10ms setTimeout)
    await page.waitForTimeout(50);

    const result = await page.evaluate(() => {
      return {
        onOpenCalled: (window as any).__TEST_ONOPEN_CALLED__ === true,
        message: (window as any).__TEST_MESSAGE__,
      };
    });

    expect(result.onOpenCalled).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.message.type).toBe('connected');
  });

  test('reset() clears all connections and state', async ({ page, wsMock }) => {
    await page.goto('/welcome');
    
    // Create a connection
    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock) {
        mock.connect('test-session-1', () => {});
        mock.connect('test-session-2', () => {});
      }
    });

    await page.waitForTimeout(50);

    // Verify connections exist
    const connectionsBefore = await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock && mock.connections) {
        return mock.connections.size;
      }
      return 0;
    });
    expect(connectionsBefore).toBeGreaterThan(0);

    // Reset mock
    await page.evaluate(() => {
      if ((window as any).__WS_MOCK_RESET__) {
        (window as any).__WS_MOCK_RESET__();
      }
    });

    // Verify connections cleared (poll for WebKit timing)
    const browserName = page.context().browser()?.browserType().name();
    const isWebKit = browserName === "webkit";
    
    if (isWebKit) {
      // WebKit needs polling for reset to propagate - check if reset function exists and works
      await page.waitForTimeout(200);
      // Try calling reset via mock.reset() if available, otherwise use global reset
      await page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock && typeof mock.reset === 'function') {
          mock.reset();
        } else if ((window as any).__WS_MOCK_RESET__) {
          (window as any).__WS_MOCK_RESET__();
        }
      });
      await page.waitForTimeout(200);
      await expect(async () => {
        const connectionsAfter = await page.evaluate(() => {
          const mock = (window as any).__WS_MOCK__;
          if (mock && mock.connections) {
            return mock.connections.size;
          }
          return 0;
        });
        expect(connectionsAfter).toBe(0);
      }).toPass({ timeout: 5000 });
    } else {
      const connectionsAfter = await page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock && mock.connections) {
          return mock.connections.size;
        }
        return 0;
      });
      expect(connectionsAfter).toBe(0);
    }
  });

  test('disconnect() removes connection and triggers onclose', async ({ page, wsMock }) => {
    await page.goto('/welcome');
    
    let onCloseCalled = false;

    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock) {
        const ws = mock.connect('test-session', () => {});
        ws.onclose = () => {
          (window as any).__TEST_ONCLOSE_CALLED__ = true;
        };
        (window as any).__TEST_WS__ = ws;
      }
    });

    await page.waitForTimeout(50);

    // Disconnect
    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      const ws = (window as any).__TEST_WS__;
      if (mock && ws) {
        mock.disconnect('test-session');
      }
    });

    await page.waitForTimeout(50);

    const onCloseResult = await page.evaluate(() => {
      return (window as any).__TEST_ONCLOSE_CALLED__ === true;
    });

    expect(onCloseResult).toBe(true);

    // Verify connection removed
    const connectionsAfter = await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock && mock.connections) {
        return mock.connections.size;
      }
      return 0;
    });
    expect(connectionsAfter).toBe(0);
  });

  test('message handling receives correct format', async ({ page, wsMock }) => {
    await page.goto('/welcome');
    
    let receivedMessages: any[] = [];

    // Use a session ID that exists in the persona script (maya-session)
    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock) {
        mock.connect('maya-session', (msg: any) => {
          const messages = (window as any).__TEST_MESSAGES__ || [];
          messages.push(msg);
          (window as any).__TEST_MESSAGES__ = messages;
        });
      }
    });

    await page.waitForTimeout(50);

    // Trigger a message via broadcastPresence (which sends radar:update)
    // Note: broadcastPresence is automatically called on connect, but we call it again to test
    await page.evaluate(() => {
      const mock = (window as any).__WS_MOCK__;
      if (mock && mock.broadcastPresence) {
        mock.broadcastPresence();
      }
    });

    await page.waitForTimeout(50);

    const messages = await page.evaluate(() => {
      return (window as any).__TEST_MESSAGES__ || [];
    });

    expect(messages.length).toBeGreaterThan(0);
    
    // Verify message format matches contract
    const radarUpdate = messages.find((m: any) => m.type === 'radar:update');
    expect(radarUpdate).toBeDefined();
    expect(radarUpdate.payload).toBeDefined();
    expect(Array.isArray(radarUpdate.payload.people)).toBe(true);
  });
});

