/**
 * WebSocket Mock for Playwright Tests
 * 
 * Simulates WebSocket server behavior for deterministic multi-user testing.
 * Used when PLAYWRIGHT_WS_MOCK=1 environment variable is set.
 */

import type { PersonaPresence, PersonaPresenceScript } from '../fixtures/persona-presence/schema';

export type WebSocketMessage = {
  type: string;
  payload?: any;
};

export type MockWebSocket = {
  readyState: number;
  send: (message: string) => void;
  close: () => void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((error: Event) => void) | null;
};

const WS_OPEN = 1;
const WS_CLOSED = 3;

/**
 * WebSocket Mock Class
 * 
 * Simulates WebSocket server behavior for multi-user persona testing.
 * Handles presence updates, chat requests, location updates, and visibility toggles.
 */
export class WsMock {
  private script: PersonaPresenceScript;
  private connections: Map<string, {
    ws: MockWebSocket;
    sessionId: string;
    onMessage: (msg: WebSocketMessage) => void;
  }> = new Map();
  private activeChats: Map<string, string> = new Map(); // sessionId -> partnerSessionId
  private pendingChatRequests: Map<string, {
    requesterSessionId: string;
    targetSessionId: string;
    requestId: string;
  }> = new Map();

  constructor(script: PersonaPresenceScript) {
    this.script = script;
  }

  /**
   * Create a mock WebSocket connection
   * Called by the app's WS shim when connecting
   */
  connect(sessionId: string, onMessage: (msg: WebSocketMessage) => void): MockWebSocket {
    const ws: MockWebSocket = {
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
      if (ws.onopen) {
        ws.onopen();
      }
      // Send connected message
      onMessage({
        type: 'connected',
        payload: {
          sessionId,
          handle: this.getPersona(sessionId)?.handle || 'Unknown',
        },
      });
      // Send initial radar update
      this.broadcastPresence();
    }, 10);

    return ws;
  }

  /**
   * Disconnect a session
   */
  disconnect(sessionId: string): void {
    const conn = this.connections.get(sessionId);
    if (conn) {
      conn.ws.readyState = WS_CLOSED;
      if (conn.ws.onclose) {
        conn.ws.onclose();
      }
      this.connections.delete(sessionId);
      // End any active chats
      const partnerId = this.activeChats.get(sessionId);
      if (partnerId) {
        this.activeChats.delete(sessionId);
        this.activeChats.delete(partnerId);
        this.sendToSession(partnerId, {
          type: 'chat:end',
          payload: {},
        });
      }
      // Broadcast updated presence (persona no longer visible)
      this.broadcastPresence();
    }
  }

  /**
   * Set visibility for a persona
   */
  setVisibility(sessionId: string, visible: boolean): void {
    const persona = this.getPersona(sessionId);
    if (persona) {
      persona.visible = visible;
      this.broadcastPresence();
    }
  }

  /**
   * Update geolocation for a persona
   */
  updateGeo(sessionId: string, lat: number, lon: number, floor?: number): void {
    const persona = this.getPersona(sessionId);
    if (persona) {
      persona.geo = { lat, lon, floor };
      this.broadcastPresence();
    }
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(sessionId: string, rawMessage: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(rawMessage);
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

        default:
          console.warn(`[WsMock] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WsMock] Failed to parse message:', error);
    }
  }

  /**
   * Handle chat request
   */
  private handleChatRequest(requesterSessionId: string, targetSessionId: string): void {
    const requester = this.getPersona(requesterSessionId);
    const target = this.getPersona(targetSessionId);

    if (!requester || !target) {
      this.sendError(requesterSessionId, 'Invalid session');
      return;
    }

    // Check if requester already has an active chat
    if (this.activeChats.has(requesterSessionId)) {
      this.sendError(requesterSessionId, 'One chat at a time', 'one_chat_at_a_time');
      return;
    }

    // Check if target already has an active chat
    if (this.activeChats.has(targetSessionId)) {
      this.sendError(requesterSessionId, 'User is busy', 'user_busy');
      return;
    }

    const requestId = `req-${Date.now()}-${requesterSessionId}`;
    this.pendingChatRequests.set(requestId, {
      requesterSessionId,
      targetSessionId,
      requestId,
    });

    // Send acknowledgment to requester
    this.sendToSession(requesterSessionId, {
      type: 'chat:request:ack',
      payload: { requestId },
    });

    // Send request to target
    this.sendToSession(targetSessionId, {
      type: 'chat:request',
      payload: {
        fromSessionId: requesterSessionId,
        fromHandle: requester.handle,
        requestId,
      },
    });
  }

  /**
   * Handle chat accept
   */
  private handleChatAccept(accepterSessionId: string, requesterSessionId: string): void {
    const request = Array.from(this.pendingChatRequests.values()).find(
      (r) => r.targetSessionId === accepterSessionId && r.requesterSessionId === requesterSessionId
    );

    if (!request) {
      this.sendError(accepterSessionId, 'Chat request not found');
      return;
    }

    this.pendingChatRequests.delete(request.requestId);
    this.activeChats.set(requesterSessionId, accepterSessionId);
    this.activeChats.set(accepterSessionId, requesterSessionId);

    // Notify both parties
    this.sendToSession(requesterSessionId, {
      type: 'chat:accepted',
      payload: {
        partnerSessionId: accepterSessionId,
        partnerHandle: this.getPersona(accepterSessionId)?.handle,
      },
    });

    this.sendToSession(accepterSessionId, {
      type: 'chat:accepted',
      payload: {
        partnerSessionId: requesterSessionId,
        partnerHandle: this.getPersona(requesterSessionId)?.handle,
      },
    });
  }

  /**
   * Handle chat decline
   */
  private handleChatDecline(declinerSessionId: string, requesterSessionId: string): void {
    const request = Array.from(this.pendingChatRequests.values()).find(
      (r) => r.targetSessionId === declinerSessionId && r.requesterSessionId === requesterSessionId
    );

    if (!request) {
      return;
    }

    this.pendingChatRequests.delete(request.requestId);

    // Notify requester
    this.sendToSession(requesterSessionId, {
      type: 'chat:declined',
      payload: {},
    });
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(senderSessionId: string, payload: any): void {
    const partnerSessionId = this.activeChats.get(senderSessionId);
    if (!partnerSessionId) {
      this.sendError(senderSessionId, 'No active chat');
      return;
    }

    // Forward message to partner
    this.sendToSession(partnerSessionId, {
      type: 'chat:message',
      payload: {
        ...payload,
        sender: 'them',
      },
    });
  }

  /**
   * Handle chat end
   */
  private handleChatEnd(sessionId: string): void {
    const partnerSessionId = this.activeChats.get(sessionId);
    if (partnerSessionId) {
      this.activeChats.delete(sessionId);
      this.activeChats.delete(partnerSessionId);
      this.sendToSession(partnerSessionId, {
        type: 'chat:end',
        payload: {},
      });
    }
  }

  /**
   * Handle panic trigger
   */
  private handlePanicTrigger(sessionId: string): void {
    // End any active chats
    this.handleChatEnd(sessionId);
    // Hide from radar
    this.setVisibility(sessionId, false);
    // Send confirmation
    this.sendToSession(sessionId, {
      type: 'panic:triggered',
      payload: {
        exclusionExpiresAt: Date.now() + 3600000, // 1 hour
      },
    });
  }

  /**
   * Broadcast presence update to all connected sessions
   */
  private broadcastPresence(): void {
    const visiblePersonas = this.script.personas.filter((p) => p.visible !== false);
    
    // Calculate radar results for each connected session
    for (const [sessionId, conn] of this.connections.entries()) {
      const sourcePersona = this.getPersona(sessionId);
      if (!sourcePersona) continue;

      // Calculate signal scores and sort
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

      this.sendToSession(sessionId, {
        type: 'radar:update',
        payload: {
          people: radarResults,
        },
      });
    }
  }

  /**
   * Calculate signal score between two personas (simplified version)
   */
  private calculateSignalScore(source: PersonaPresence, target: PersonaPresence): number {
    let score = 0;

    // Vibe match
    if (source.vibe === target.vibe || target.vibe === 'surprise') {
      score += 10;
    }

    // Shared tags (max 3)
    const sharedTags = source.tags.filter((tag) => target.tags.includes(tag));
    score += Math.min(sharedTags.length, 3) * 5;

    // Visibility bonus
    if (target.visible !== false) {
      score += 5;
    }

    // Proximity bonus
    if (source.geo && target.geo) {
      const tier = this.calculateProximityTier(source.geo, target.geo);
      if (tier === 'same-building') score += 3;
      if (tier === 'nearby') score += 2;
    }

    return score;
  }

  /**
   * Calculate proximity tier between two locations
   */
  private calculateProximityTier(
    loc1?: { lat: number; lon: number; floor?: number },
    loc2?: { lat: number; lon: number; floor?: number }
  ): string | null {
    if (!loc1 || !loc2) return null;

    // Simple distance calculation (Haversine formula simplified)
    const latDiff = Math.abs(loc1.lat - loc2.lat);
    const lonDiff = Math.abs(loc1.lon - loc2.lon);
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111000; // meters

    if (distance < 50) {
      return loc1.floor === loc2.floor ? 'same-floor' : 'same-building';
    }
    if (distance < 200) {
      return 'nearby';
    }
    return null;
  }

  /**
   * Send message to a specific session
   */
  private sendToSession(sessionId: string, message: WebSocketMessage): void {
    const conn = this.connections.get(sessionId);
    if (conn) {
      conn.onMessage(message);
    }
  }

  /**
   * Send error message to a session
   */
  private sendError(sessionId: string, message: string, code?: string): void {
    this.sendToSession(sessionId, {
      type: 'error',
      payload: {
        message,
        code,
      },
    });
  }

  /**
   * Get persona by session ID
   */
  private getPersona(sessionId: string): PersonaPresence | undefined {
    return this.script.personas.find((p) => p.sessionId === sessionId);
  }
}

