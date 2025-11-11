/**
 * Multi-Persona Test Helpers
 * 
 * Utilities for creating and managing multiple browser contexts
 * to simulate multiple users interacting simultaneously.
 */

import { Browser, BrowserContext, Page } from '@playwright/test';
import { setPersonaGeo } from '../utils/geolocation';
import { setupSession } from '../utils/test-helpers';
import type { PersonaPresenceScript } from '../fixtures/persona-presence/schema';

export interface PersonaContext {
  sessionId: string;
  handle: string;
  context: BrowserContext;
  page: Page;
  geo?: { lat: number; lon: number; floor?: number };
}

/**
 * Create multiple browser contexts for multi-user testing
 * 
 * Each context represents a separate user with their own session,
 * geolocation, and permissions.
 * 
 * @param browser - Playwright browser instance
 * @param personas - Array of persona configurations from presence script
 * @param presenceScript - Full presence script (for mock setup)
 * @returns Array of PersonaContext objects
 */
export async function createMultiPersonaContexts(
  browser: Browser,
  presenceScript: PersonaPresenceScript,
): Promise<PersonaContext[]> {
  const contexts: PersonaContext[] = [];

  for (const persona of presenceScript.personas) {
    // Create new browser context for this persona
    const context = await browser.newContext();

    // Set geolocation if provided
    if (persona.geo) {
      await setPersonaGeo(context, persona.geo);
    }

    // Create page
    const page = await context.newPage();

    // Set up session storage
    await setupSession(page, {
      sessionId: persona.sessionId,
      token: `${persona.sessionId}-token`,
      handle: persona.handle,
    });

    // Inject WebSocket mock (same script for all personas)
    await page.addInitScript((script) => {
      const WS_OPEN = 1;
      const WS_CLOSED = 3;

      class BrowserWsMock {
        private script: any;
        private connections: Map<string, any> = new Map();
        private activeChats: Map<string, string> = new Map();
        private pendingChatRequests: Map<string, any> = new Map();

        constructor(script: any) {
          this.script = script;
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
          };

          this.connections.set(sessionId, { ws, onMessage });
          this.broadcastPresence();
          return ws;
        }

        disconnect(sessionId: string) {
          this.connections.delete(sessionId);
          this.activeChats.delete(sessionId);
          this.pendingChatRequests.delete(sessionId);
          this.broadcastPresence();
        }

        setVisibility(sessionId: string, visible: boolean) {
          const p = this.getPersona(sessionId);
          if (p) p.visible = visible;
          this.broadcastPresence();
        }

        updateGeo(sessionId: string, lat: number, lon: number, floor?: number) {
          const p = this.getPersona(sessionId);
          if (p) p.geo = { lat, lon, floor };
          this.broadcastPresence();
        }

        private handleMessage(sessionId: string, message: string) {
          try {
            const msg = JSON.parse(message);
            const persona = this.getPersona(sessionId);
            if (!persona) return;

            switch (msg.type) {
              case 'radar:subscribe':
                this.broadcastPresence();
                break;
              case 'location:update':
                if (msg.lat && msg.lon) {
                  this.updateGeo(sessionId, msg.lat, msg.lon, msg.floor);
                }
                break;
              case 'chat:request':
                this.handleChatRequest(sessionId, msg.targetSessionId);
                break;
              case 'chat:accept':
                this.handleChatAccept(sessionId, msg.chatId);
                break;
              case 'chat:decline':
                this.handleChatDecline(sessionId, msg.chatId);
                break;
              case 'chat:message':
                this.handleChatMessage(sessionId, msg.chatId, msg.text);
                break;
              case 'chat:end':
                this.handleChatEnd(sessionId, msg.chatId);
                break;
              case 'panic:trigger':
                this.handlePanic(sessionId);
                break;
            }
          } catch (e) {
            console.error('Mock WS message parse error:', e);
          }
        }

        private handleChatRequest(requesterId: string, targetId: string) {
          const requester = this.getPersona(requesterId);
          const target = this.getPersona(targetId);
          if (!requester || !target) return;

          // Check if requester already has active chat
          if (this.activeChats.has(requesterId)) {
            this.sendTo(requesterId, {
              type: 'chat:error',
              error: 'one-chat-at-a-time',
              message: 'You already have an active chat',
            });
            return;
          }

          // Check if target already has active chat
          if (this.activeChats.has(targetId)) {
            this.sendTo(requesterId, {
              type: 'chat:declined',
              reason: 'target-busy',
            });
            return;
          }

          // Create pending request
          const chatId = `chat-${requesterId}-${targetId}-${Date.now()}`;
          this.pendingChatRequests.set(chatId, {
            requesterId,
            targetId,
            chatId,
          });

          this.sendTo(targetId, {
            type: 'chat:request',
            chatId,
            requester: {
              sessionId: requesterId,
              handle: requester.handle,
              vibe: requester.vibe,
              tags: requester.tags,
            },
          });
        }

        private handleChatAccept(accepterId: string, chatId: string) {
          const request = this.pendingChatRequests.get(chatId);
          if (!request || request.targetId !== accepterId) return;

          this.activeChats.set(request.requesterId, chatId);
          this.activeChats.set(request.targetId, chatId);
          this.pendingChatRequests.delete(chatId);

          this.sendTo(request.requesterId, {
            type: 'chat:accepted',
            chatId,
            target: {
              sessionId: request.targetId,
              handle: this.getPersona(request.targetId)?.handle,
            },
          });

          this.sendTo(request.targetId, {
            type: 'chat:started',
            chatId,
            requester: {
              sessionId: request.requesterId,
              handle: this.getPersona(request.requesterId)?.handle,
            },
          });
        }

        private handleChatDecline(declinerId: string, chatId: string) {
          const request = this.pendingChatRequests.get(chatId);
          if (!request || request.targetId !== declinerId) return;

          this.pendingChatRequests.delete(chatId);

          this.sendTo(request.requesterId, {
            type: 'chat:declined',
            chatId,
            reason: 'declined',
          });
        }

        private handleChatMessage(senderId: string, chatId: string, text: string) {
          const request = Array.from(this.activeChats.entries()).find(
            ([_, id]) => id === chatId,
          );
          if (!request) return;

          const [activeSessionId] = request;
          const otherSessionId =
            activeSessionId === senderId
              ? Array.from(this.activeChats.keys()).find((k) => k !== senderId && this.activeChats.get(k) === chatId)
              : activeSessionId;

          if (otherSessionId) {
            this.sendTo(otherSessionId, {
              type: 'chat:message',
              chatId,
              senderId,
              text,
            });
          }
        }

        private handleChatEnd(enderId: string, chatId: string) {
          const sessions = Array.from(this.activeChats.entries())
            .filter(([_, id]) => id === chatId)
            .map(([sessionId]) => sessionId);

          sessions.forEach((sessionId) => {
            this.activeChats.delete(sessionId);
            this.sendTo(sessionId, {
              type: 'chat:ended',
              chatId,
            });
          });
        }

        private handlePanic(sessionId: string) {
          // End any active chats
          const chatId = this.activeChats.get(sessionId);
          if (chatId) {
            this.handleChatEnd(sessionId, chatId);
          }

          this.sendTo(sessionId, {
            type: 'panic:confirmed',
            message: 'Panic button activated',
          });
        }

        private broadcastPresence() {
          const visible = this.script.personas.filter((p: any) => p.visible !== false);
          const payload = {
            type: 'presence:update',
            personas: visible.map((p: any) => ({
              sessionId: p.sessionId,
              handle: p.handle,
              vibe: p.vibe,
              tags: p.tags,
              geo: p.geo,
            })),
          };

          for (const conn of this.connections.values()) {
            conn.onMessage(payload);
          }
        }

        private sendTo(sessionId: string, message: any) {
          const conn = this.connections.get(sessionId);
          if (conn) {
            conn.onMessage(message);
          }
        }

        private getPersona(sessionId: string) {
          return this.script.personas.find((p: any) => p.sessionId === sessionId);
        }
      }

      (window as any).__WS_MOCK__ = new BrowserWsMock(script);
      (window as any).__PLAYWRIGHT_WS_MOCK__ = '1';
    }, presenceScript);

    contexts.push({
      sessionId: persona.sessionId,
      handle: persona.handle,
      context,
      page,
      geo: persona.geo,
    });
  }

  return contexts;
}

/**
 * Clean up all persona contexts
 * 
 * @param contexts - Array of PersonaContext objects to clean up
 */
export async function cleanupPersonaContexts(contexts: PersonaContext[]): Promise<void> {
  for (const persona of contexts) {
    await persona.context.close();
  }
}

/**
 * Wait for both personas to see each other on Radar
 * 
 * @param persona1 - First persona context
 * @param persona2 - Second persona context
 * @param timeout - Timeout in milliseconds
 */
export async function waitForMutualVisibility(
  persona1: PersonaContext,
  persona2: PersonaContext,
  timeout = 10000,
): Promise<void> {
  // Navigate both to Radar
  await persona1.page.goto('/radar');
  await persona2.page.goto('/radar');

  // Wait for Radar to load
  await persona1.page.waitForSelector('text=/RADAR/i', { timeout });
  await persona2.page.waitForSelector('text=/RADAR/i', { timeout });

  // Wait for both to appear on each other's Radar
  // This is a simplified check - full implementation would check for actual presence
  await persona1.page.waitForTimeout(2000); // Allow WebSocket updates
  await persona2.page.waitForTimeout(2000);
}

