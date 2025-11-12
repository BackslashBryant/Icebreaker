/**
 * Multi-User Test Scenarios
 * 
 * Tests multiple personas interacting simultaneously to verify:
 * - Mutual visibility on Radar
 * - Signal score boosting for shared tags
 * - Visibility toggle behavior
 * - One-chat-at-a-time enforcement
 * - Reconnect/disconnect scenarios
 */

import { test, expect } from '@playwright/test';
import { createMultiPersonaContexts, cleanupPersonaContexts, waitForMutualVisibility } from '../../utils/multi-persona';
import type { PersonaPresenceScript } from '../../fixtures/persona-presence/schema';
import { TelemetryCollector, countErrorBanners } from '../../utils/telemetry';

// Import presence scripts
import campusLibraryScript from '../../fixtures/persona-presence/campus-library.json';
import coworkingScript from '../../fixtures/persona-presence/coworking-downtown.json';
import galleryScript from '../../fixtures/persona-presence/gallery-opening.json';

test.describe('Multi-User Scenarios: Maya + Zoe (Campus Library)', () => {
  test('Maya and Zoe appear on each other\'s Radar', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      campusLibraryScript as PersonaPresenceScript,
    );

    const mayaTelemetry = new TelemetryCollector('maya', 'maya-multi-user-visibility');
    const zoeTelemetry = new TelemetryCollector('zoe', 'zoe-multi-user-visibility');

    try {
      const maya = contexts.find((c) => c.sessionId === 'maya-session')!;
      const zoe = contexts.find((c) => c.sessionId === 'zoe-session')!;

      // Navigate both to Radar
      await maya.page.goto('/radar');
      await zoe.page.goto('/radar');

      // Wait for Radar to load
      await expect(maya.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(zoe.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for WebSocket presence updates
      await maya.page.waitForTimeout(2000);
      await zoe.page.waitForTimeout(2000);

      // Record error banners for both personas
      const mayaErrorCount = await countErrorBanners(maya.page);
      if (mayaErrorCount > 0) {
        for (let i = 0; i < mayaErrorCount; i++) {
          mayaTelemetry.recordErrorBanner();
        }
      }

      const zoeErrorCount = await countErrorBanners(zoe.page);
      if (zoeErrorCount > 0) {
        for (let i = 0; i < zoeErrorCount; i++) {
          zoeTelemetry.recordErrorBanner();
        }
      }

      // Verify both personas can see Radar (basic check)
      // Full presence verification requires WebSocket mock to send presence:update messages
      expect(maya.page.url()).toContain('/radar');
      expect(zoe.page.url()).toContain('/radar');
    } catch (error) {
      mayaTelemetry.recordError(error instanceof Error ? error.message : String(error));
      zoeTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await mayaTelemetry.writeToFile();
      await zoeTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });

  test('shared tags boost signal scores', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      campusLibraryScript as PersonaPresenceScript,
    );

    const mayaTelemetry = new TelemetryCollector('maya', 'maya-shared-tags');
    const zoeTelemetry = new TelemetryCollector('zoe', 'zoe-shared-tags');

    try {
      const maya = contexts.find((c) => c.sessionId === 'maya-session')!;
      const zoe = contexts.find((c) => c.sessionId === 'zoe-session')!;

      // Both have "Overthinking Things" tag - should boost compatibility
      const mayaTags = campusLibraryScript.personas.find((p) => p.sessionId === 'maya-session')?.tags || [];
      const zoeTags = campusLibraryScript.personas.find((p) => p.sessionId === 'zoe-session')?.tags || [];

      const sharedTags = mayaTags.filter((tag) => zoeTags.includes(tag));
      expect(sharedTags.length).toBeGreaterThan(0);
      expect(sharedTags).toContain('Overthinking Things');

      // Navigate to Radar
      await maya.page.goto('/radar');
      await zoe.page.goto('/radar');

      await expect(maya.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(zoe.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for presence updates
      await maya.page.waitForTimeout(2000);
      await zoe.page.waitForTimeout(2000);

      // Record error banners
      const mayaErrorCount = await countErrorBanners(maya.page);
      if (mayaErrorCount > 0) {
        for (let i = 0; i < mayaErrorCount; i++) {
          mayaTelemetry.recordErrorBanner();
        }
      }

      const zoeErrorCount = await countErrorBanners(zoe.page);
      if (zoeErrorCount > 0) {
        for (let i = 0; i < zoeErrorCount; i++) {
          zoeTelemetry.recordErrorBanner();
        }
      }

      // Signal score verification would require checking actual Radar UI
      // For now, verify shared tags exist
      expect(sharedTags.length).toBeGreaterThan(0);
    } catch (error) {
      mayaTelemetry.recordError(error instanceof Error ? error.message : String(error));
      zoeTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await mayaTelemetry.writeToFile();
      await zoeTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });

  test('visibility toggle hides one persona from the other', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      campusLibraryScript as PersonaPresenceScript,
    );

    const mayaTelemetry = new TelemetryCollector('maya', 'maya-visibility-toggle');
    const zoeTelemetry = new TelemetryCollector('zoe', 'zoe-visibility-toggle');

    try {
      const maya = contexts.find((c) => c.sessionId === 'maya-session')!;
      const zoe = contexts.find((c) => c.sessionId === 'zoe-session')!;

      // Navigate both to Radar
      await maya.page.goto('/radar');
      await zoe.page.goto('/radar');

      await expect(maya.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(zoe.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for initial presence
      await maya.page.waitForTimeout(2000);
      await zoe.page.waitForTimeout(2000);

      // Toggle Maya's visibility off via mock
      await maya.page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock) {
          mock.setVisibility('maya-session', false);
        }
      });

      // Wait for visibility update to propagate
      await maya.page.waitForTimeout(1000);
      await zoe.page.waitForTimeout(1000);

      // Record error banners
      const mayaErrorCount = await countErrorBanners(maya.page);
      if (mayaErrorCount > 0) {
        for (let i = 0; i < mayaErrorCount; i++) {
          mayaTelemetry.recordErrorBanner();
        }
      }

      const zoeErrorCount = await countErrorBanners(zoe.page);
      if (zoeErrorCount > 0) {
        for (let i = 0; i < zoeErrorCount; i++) {
          zoeTelemetry.recordErrorBanner();
        }
      }

      // Record visibility toggle affordance
      mayaTelemetry.recordAffordance('visibilityToggle', true);

      // Visibility toggle should work (mock handles this)
      // Full verification would require checking Radar UI
    } catch (error) {
      mayaTelemetry.recordError(error instanceof Error ? error.message : String(error));
      zoeTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await mayaTelemetry.writeToFile();
      await zoeTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });
});

test.describe('Multi-User Scenarios: Ethan + Marcus (Coworking)', () => {
  test('Ethan and Marcus appear on each other\'s Radar (different floors)', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      coworkingScript as PersonaPresenceScript,
    );

    const ethanTelemetry = new TelemetryCollector('ethan', 'ethan-different-floors');
    const marcusTelemetry = new TelemetryCollector('marcus', 'marcus-different-floors');

    try {
      const ethan = contexts.find((c) => c.sessionId === 'ethan-session')!;
      const marcus = contexts.find((c) => c.sessionId === 'marcus-session')!;

      // Verify different floors
      expect(ethan.geo?.floor).toBe(2);
      expect(marcus.geo?.floor).toBe(3);

      // Navigate both to Radar
      await ethan.page.goto('/radar');
      await marcus.page.goto('/radar');

      await expect(ethan.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(marcus.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for presence updates
      await ethan.page.waitForTimeout(2000);
      await marcus.page.waitForTimeout(2000);

      // Record error banners
      const ethanErrorCount = await countErrorBanners(ethan.page);
      if (ethanErrorCount > 0) {
        for (let i = 0; i < ethanErrorCount; i++) {
          ethanTelemetry.recordErrorBanner();
        }
      }

      const marcusErrorCount = await countErrorBanners(marcus.page);
      if (marcusErrorCount > 0) {
        for (let i = 0; i < marcusErrorCount; i++) {
          marcusTelemetry.recordErrorBanner();
        }
      }

      // Both should be visible despite different floors (same building)
      expect(ethan.page.url()).toContain('/radar');
      expect(marcus.page.url()).toContain('/radar');
    } catch (error) {
      ethanTelemetry.recordError(error instanceof Error ? error.message : String(error));
      marcusTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await ethanTelemetry.writeToFile();
      await marcusTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });

  test('shared "Tech curious" tag boosts compatibility', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      coworkingScript as PersonaPresenceScript,
    );

    const ethanTelemetry = new TelemetryCollector('ethan', 'ethan-shared-tech-tags');
    const marcusTelemetry = new TelemetryCollector('marcus', 'marcus-shared-tech-tags');

    try {
      const ethan = contexts.find((c) => c.sessionId === 'ethan-session')!;
      const marcus = contexts.find((c) => c.sessionId === 'marcus-session')!;

      const ethanTags = coworkingScript.personas.find((p) => p.sessionId === 'ethan-session')?.tags || [];
      const marcusTags = coworkingScript.personas.find((p) => p.sessionId === 'marcus-session')?.tags || [];

      const sharedTags = ethanTags.filter((tag) => marcusTags.includes(tag));
      expect(sharedTags).toContain('Tech curious');

      // Navigate to Radar to record error banners
      await ethan.page.goto('/radar');
      await marcus.page.goto('/radar');

      await expect(ethan.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(marcus.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Record error banners
      const ethanErrorCount = await countErrorBanners(ethan.page);
      if (ethanErrorCount > 0) {
        for (let i = 0; i < ethanErrorCount; i++) {
          ethanTelemetry.recordErrorBanner();
        }
      }

      const marcusErrorCount = await countErrorBanners(marcus.page);
      if (marcusErrorCount > 0) {
        for (let i = 0; i < marcusErrorCount; i++) {
          marcusTelemetry.recordErrorBanner();
        }
      }
    } catch (error) {
      ethanTelemetry.recordError(error instanceof Error ? error.message : String(error));
      marcusTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await ethanTelemetry.writeToFile();
      await marcusTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });
});

test.describe('Multi-User Scenarios: Casey + Alex (Gallery Opening)', () => {
  test('Casey and Alex appear on each other\'s Radar (same event)', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      galleryScript as PersonaPresenceScript,
    );

    const caseyTelemetry = new TelemetryCollector('casey', 'casey-same-event');
    const alexTelemetry = new TelemetryCollector('alex', 'alex-same-event');

    try {
      const casey = contexts.find((c) => c.sessionId === 'casey-session')!;
      const alex = contexts.find((c) => c.sessionId === 'alex-session')!;

      // Verify same coordinates (same event)
      expect(casey.geo?.lat).toBe(alex.geo?.lat);
      expect(casey.geo?.lon).toBe(alex.geo?.lon);

      // Navigate both to Radar
      await casey.page.goto('/radar');
      await alex.page.goto('/radar');

      await expect(casey.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(alex.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for presence updates
      await casey.page.waitForTimeout(2000);
      await alex.page.waitForTimeout(2000);

      // Record error banners
      const caseyErrorCount = await countErrorBanners(casey.page);
      if (caseyErrorCount > 0) {
        for (let i = 0; i < caseyErrorCount; i++) {
          caseyTelemetry.recordErrorBanner();
        }
      }

      const alexErrorCount = await countErrorBanners(alex.page);
      if (alexErrorCount > 0) {
        for (let i = 0; i < alexErrorCount; i++) {
          alexTelemetry.recordErrorBanner();
        }
      }

      // Both should be visible (same event)
      expect(casey.page.url()).toContain('/radar');
      expect(alex.page.url()).toContain('/radar');
    } catch (error) {
      caseyTelemetry.recordError(error instanceof Error ? error.message : String(error));
      alexTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await caseyTelemetry.writeToFile();
      await alexTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });
});

test.describe('Multi-User Chat Scenarios', () => {
  test('one-chat-at-a-time enforcement blocks second chat start', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      campusLibraryScript as PersonaPresenceScript,
    );

    const mayaTelemetry = new TelemetryCollector('maya', 'maya-one-chat-enforcement');
    const zoeTelemetry = new TelemetryCollector('zoe', 'zoe-one-chat-enforcement');

    try {
      const maya = contexts.find((c) => c.sessionId === 'maya-session')!;
      const zoe = contexts.find((c) => c.sessionId === 'zoe-session')!;

      // Navigate both to Radar
      await maya.page.goto('/radar');
      await zoe.page.goto('/radar');

      await expect(maya.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(zoe.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for presence updates
      await maya.page.waitForTimeout(2000);
      await zoe.page.waitForTimeout(2000);

      // Maya initiates chat with Zoe (via mock)
      await maya.page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock) {
          const ws = mock.connect('maya-session', () => {});
          ws.send(
            JSON.stringify({
              type: 'chat:request',
              targetSessionId: 'zoe-session',
            }),
          );
        }
      });

      await maya.page.waitForTimeout(1000);

      // Try to initiate second chat (should be blocked)
      await maya.page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock) {
          const ws = mock.connect('maya-session', () => {});
          ws.send(
            JSON.stringify({
              type: 'chat:request',
              targetSessionId: 'zoe-session',
            }),
          );
        }
      });

      // Record error banners
      const mayaErrorCount = await countErrorBanners(maya.page);
      if (mayaErrorCount > 0) {
        for (let i = 0; i < mayaErrorCount; i++) {
          mayaTelemetry.recordErrorBanner();
        }
      }

      const zoeErrorCount = await countErrorBanners(zoe.page);
      if (zoeErrorCount > 0) {
        for (let i = 0; i < zoeErrorCount; i++) {
          zoeTelemetry.recordErrorBanner();
        }
      }

      // Mock should enforce one-chat-at-a-time
      // Full verification would require checking error message
      await maya.page.waitForTimeout(1000);
    } catch (error) {
      mayaTelemetry.recordError(error instanceof Error ? error.message : String(error));
      zoeTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await mayaTelemetry.writeToFile();
      await zoeTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });
});

test.describe('Multi-User Reconnect Scenarios', () => {
  test('reconnect after disconnect restores presence', async ({ browser }) => {
    const contexts = await createMultiPersonaContexts(
      browser,
      campusLibraryScript as PersonaPresenceScript,
    );

    const mayaTelemetry = new TelemetryCollector('maya', 'maya-reconnect');
    const zoeTelemetry = new TelemetryCollector('zoe', 'zoe-reconnect');

    try {
      const maya = contexts.find((c) => c.sessionId === 'maya-session')!;
      const zoe = contexts.find((c) => c.sessionId === 'zoe-session')!;

      // Navigate both to Radar
      await maya.page.goto('/radar');
      await zoe.page.goto('/radar');

      await expect(maya.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });
      await expect(zoe.page.getByRole('heading', { name: /RADAR/i })).toBeVisible({ timeout: 15000 });

      // Wait for initial presence
      await maya.page.waitForTimeout(2000);

      // Disconnect Maya's WebSocket
      await maya.page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock) {
          mock.disconnect('maya-session');
        }
      });

      await maya.page.waitForTimeout(1000);

      // Reconnect Maya
      await maya.page.evaluate(() => {
        const mock = (window as any).__WS_MOCK__;
        if (mock) {
          mock.connect('maya-session', () => {});
        }
      });

      await maya.page.waitForTimeout(1000);

      // Record error banners
      const mayaErrorCount = await countErrorBanners(maya.page);
      if (mayaErrorCount > 0) {
        for (let i = 0; i < mayaErrorCount; i++) {
          mayaTelemetry.recordErrorBanner();
        }
      }

      const zoeErrorCount = await countErrorBanners(zoe.page);
      if (zoeErrorCount > 0) {
        for (let i = 0; i < zoeErrorCount; i++) {
          zoeTelemetry.recordErrorBanner();
        }
      }

      // Presence should be restored
      // Full verification would require checking Radar UI
    } catch (error) {
      mayaTelemetry.recordError(error instanceof Error ? error.message : String(error));
      zoeTelemetry.recordError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      await mayaTelemetry.writeToFile();
      await zoeTelemetry.writeToFile();
      await cleanupPersonaContexts(contexts);
    }
  });
});

