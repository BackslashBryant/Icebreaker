/**
 * Playwright Fixture for WebSocket Mock
 * 
 * Sets up WebSocket mock for multi-user persona testing.
 * Injects mock before app loads so it's available when WebSocket connections are created.
 */

import { test as base } from '@playwright/test';
import { WsMock } from '../../mocks/websocket-mock';
import type { PersonaPresenceScript } from '../../fixtures/persona-presence/schema';

// Import presence scripts
import campusLibraryScript from '../../fixtures/persona-presence/campus-library.json';

export interface WebSocketMockFixture {
  wsMock: WsMock;
  presenceScript: PersonaPresenceScript;
}

export const test = base.extend<WebSocketMockFixture>({
  presenceScript: [campusLibraryScript as PersonaPresenceScript, { option: true }],

  wsMock: async ({ page, presenceScript }, use) => {
    // Create mock instance in Node.js context (for test access)
    const mock = new WsMock(presenceScript);

    // Inject mock into page before app loads
    // Serialize the presence script and recreate the mock in browser context
    await page.addInitScript((script) => {
      // Create a simplified mock factory in browser context
      // Since we can't serialize the class directly, we'll create the mock logic inline
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

          // Simulate connection open
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
            const partnerId = this.activeChats.get(sessionId);
            if (partnerId) {
              this.activeChats.delete(sessionId);
              this.activeChats.delete(partnerId);
              this.sendToSession(partnerId, { type: 'chat:end', payload: {} });
            }
            this.broadcastPresence();
          }
        }

        setVisibility(sessionId: string, visible: boolean) {
          const persona = this.getPersona(sessionId);
          if (persona) {
            persona.visible = visible;
            this.broadcastPresence();
          }
        }

        updateGeo(sessionId: string, lat: number, lon: number, floor?: number) {
          const persona = this.getPersona(sessionId);
          if (persona) {
            persona.geo = { lat, lon, floor };
            this.broadcastPresence();
          }
        }

        private handleMessage(sessionId: string, rawMessage: string) {
          try {
            const message = JSON.parse(rawMessage);
            const conn = this.connections.get(sessionId);
            if (!conn) return;

            switch (message.type) {
              case 'radar:subscribe':
                this.broadcastPresence();
                break;
              case 'location:update':
                const { lat, lng } = message.payload || {};
                if (typeof lat === 'number' && typeof lng === 'number') {
                  this.updateGeo(sessionId, lat, lng);
                }
                break;
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
            console.error('[WsMock] Failed to parse message:', error);
          }
        }

        private handleChatRequest(requesterSessionId: string, targetSessionId: string) {
          const requester = this.getPersona(requesterSessionId);
          const target = this.getPersona(targetSessionId);
          if (!requester || !target) {
            this.sendError(requesterSessionId, 'Invalid session');
            return;
          }
          if (this.activeChats.has(requesterSessionId)) {
            this.sendError(requesterSessionId, 'One chat at a time', 'one_chat_at_a_time');
            return;
          }
          if (this.activeChats.has(targetSessionId)) {
            this.sendError(requesterSessionId, 'User is busy', 'user_busy');
            return;
          }
          const requestId = `req-${Date.now()}-${requesterSessionId}`;
          this.pendingChatRequests.set(requestId, { requesterSessionId, targetSessionId, requestId });
          this.sendToSession(requesterSessionId, { type: 'chat:request:ack', payload: { requestId } });
          this.sendToSession(targetSessionId, {
            type: 'chat:request',
            payload: { fromSessionId: requesterSessionId, fromHandle: requester.handle, requestId },
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
            payload: { partnerSessionId: accepterSessionId, partnerHandle: this.getPersona(accepterSessionId)?.handle },
          });
          this.sendToSession(accepterSessionId, {
            type: 'chat:accepted',
            payload: { partnerSessionId: requesterSessionId, partnerHandle: this.getPersona(requesterSessionId)?.handle },
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
          this.sendToSession(partnerSessionId, { type: 'chat:message', payload: { ...payload, sender: 'them' } });
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
          const visiblePersonas = this.script.personas.filter((p) => p.visible !== false);
          for (const [sessionId, conn] of this.connections.entries()) {
            const sourcePersona = this.getPersona(sessionId);
            if (!sourcePersona) continue;
            const radarResults = visiblePersonas
              .filter((p) => p.sessionId !== sessionId)
              .map((persona) => {
                const score = this.calculateSignalScore(sourcePersona, persona);
                return {
                  sessionId: persona.sessionId,
                  handle: persona.handle,
                  vibe: persona.vibe,
                  tags: persona.tags,
                  signalScore: score,
                  proximityTier: this.calculateProximityTier(sourcePersona.geo, persona.geo),
                };
              })
              .sort((a, b) => b.signalScore - a.signalScore);
            this.sendToSession(sessionId, { type: 'radar:update', payload: { people: radarResults } });
          }
        }

        private calculateSignalScore(source: any, target: any): number {
          let score = 0;
          if (source.vibe === target.vibe || target.vibe === 'surprise') score += 10;
          const sharedTags = source.tags.filter((tag: string) => target.tags.includes(tag));
          score += Math.min(sharedTags.length, 3) * 5;
          if (target.visible !== false) score += 5;
          if (source.geo && target.geo) {
            const tier = this.calculateProximityTier(source.geo, target.geo);
            if (tier === 'same-building') score += 3;
            if (tier === 'nearby') score += 2;
          }
          return score;
        }

        private calculateProximityTier(loc1?: any, loc2?: any): string | null {
          if (!loc1 || !loc2) return null;
          const latDiff = Math.abs(loc1.lat - loc2.lat);
          const lonDiff = Math.abs(loc1.lon - loc2.lon);
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000;
          if (distance < 50) return loc1.floor === loc2.floor ? 'same-floor' : 'same-building';
          if (distance < 200) return 'nearby';
          return null;
        }

        private sendToSession(sessionId: string, message: any) {
          const conn = this.connections.get(sessionId);
          if (conn) conn.onMessage(message);
        }

        private sendError(sessionId: string, message: string, code?: string) {
          this.sendToSession(sessionId, { type: 'error', payload: { message, code } });
        }

        private getPersona(sessionId: string) {
          return this.script.personas.find((p) => p.sessionId === sessionId);
        }
      }

      // Create mock instance and expose globally
      (window as any).__WS_MOCK__ = new BrowserWsMock(script);
      (window as any).__PLAYWRIGHT_WS_MOCK__ = '1';
    }, presenceScript);

    await use(mock);
  },
});

export const expect = test.expect;

