import { describe, it, expect, beforeEach } from "vitest";
import { calculateDistance, calculateProximityTier } from "../src/lib/proximity-utils.js";
import { createSession, getSession, getAllSessions } from "../src/services/SessionManager.js";
import { calculateScore, getRadarResults } from "../src/services/SignalEngine.js";
import { handleMessage } from "../src/websocket/handlers.js";

/**
 * Edge Case Test Suite
 * 
 * Tests for edge cases in location validation, session expiration,
 * WebSocket handling, and Signal Engine behavior.
 */

describe("Edge Cases", () => {
  beforeEach(() => {
    // Sessions are in-memory and will be cleared between test runs
  });

  describe("Location Validation", () => {
    it("handles negative coordinates", () => {
      const loc1 = { lat: -37.7749, lng: -122.4194 }; // Valid negative
      const loc2 = { lat: -37.775, lng: -122.4195 };
      const distance = calculateDistance(loc1, loc2);
      expect(isFinite(distance)).toBe(true);
    });

    it("handles out-of-range latitude (>90)", () => {
      const loc1 = { lat: 91, lng: 0 }; // Invalid
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles out-of-range latitude (<-90)", () => {
      const loc1 = { lat: -91, lng: 0 }; // Invalid
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles out-of-range longitude (>180)", () => {
      const loc1 = { lat: 37.7749, lng: 181 }; // Invalid
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles out-of-range longitude (<-180)", () => {
      const loc1 = { lat: 37.7749, lng: -181 }; // Invalid
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles NaN coordinates", () => {
      const loc1 = { lat: NaN, lng: 0 };
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles undefined coordinates", () => {
      const loc1 = { lat: undefined, lng: 0 };
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("handles Infinity coordinates", () => {
      const loc1 = { lat: Infinity, lng: 0 };
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const distance = calculateDistance(loc1, loc2);
      expect(distance).toBe(Infinity);
    });

    it("returns null for invalid proximity tier calculation", () => {
      const loc1 = { lat: 91, lng: 0 }; // Invalid
      const loc2 = { lat: 37.7749, lng: -122.4194 };
      const tier = calculateProximityTier(loc1, loc2);
      expect(tier).toBeNull();
    });
  });

  describe("Session Expiration", () => {
    it("handles expired session access", () => {
      const session = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Manually expire the session
      const sessionData = getSession(session.sessionId);
      sessionData.expiresAt = Date.now() - 1000; // 1 second ago

      // Should return null for expired session
      const expiredSession = getSession(session.sessionId);
      expect(expiredSession).toBeNull();
    });

    it("handles concurrent expiration", () => {
      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        sessions.push(
          createSession({
            vibe: "banter",
            tags: [],
            visibility: true,
          })
        );
      }

      // All sessions should be active
      const allSessions = getAllSessions();
      expect(allSessions.length).toBeGreaterThanOrEqual(5);

      // Manually expire all sessions
      sessions.forEach((session) => {
        const sessionData = getSession(session.sessionId);
        if (sessionData) {
          sessionData.expiresAt = Date.now() - 1000;
        }
      });

      // After expiration, sessions should be cleaned up
      const expiredSessions = sessions.filter((s) => getSession(s.sessionId) !== null);
      expect(expiredSessions.length).toBe(0);
    });
  });

  describe("WebSocket Edge Cases", () => {
    it("handles malformed JSON messages", () => {
      const mockWs = {
        readyState: 1, // OPEN
        send: () => {},
      };
      const mockSession = {
        sessionId: "test-session",
        handle: "testuser",
        vibe: "banter",
        tags: [],
        visibility: true,
      };

      // Should not throw on malformed JSON
      expect(() => {
        handleMessage(mockWs, mockSession, "not valid json");
      }).not.toThrow();
    });

    it("handles oversized messages", () => {
      const mockWs = {
        readyState: 1, // OPEN
        send: () => {},
      };
      const mockSession = {
        sessionId: "test-session",
        handle: "testuser",
        vibe: "banter",
        tags: [],
        visibility: true,
      };

      // Create message larger than 1MB
      const largeMessage = JSON.stringify({
        type: "location:update",
        payload: { lat: 37.7749, lng: -122.4194 },
      }).repeat(100000); // Much larger than 1MB

      // Should handle oversized message gracefully
      expect(() => {
        handleMessage(mockWs, mockSession, largeMessage);
      }).not.toThrow();
    });

    it("handles missing message type", () => {
      const mockWs = {
        readyState: 1, // OPEN
        send: () => {},
      };
      const mockSession = {
        sessionId: "test-session",
        handle: "testuser",
        vibe: "banter",
        tags: [],
        visibility: true,
      };

      const message = JSON.stringify({ payload: {} });
      expect(() => {
        handleMessage(mockWs, mockSession, message);
      }).not.toThrow();
    });
  });

  describe("Signal Engine Edge Cases", () => {
    it("handles empty sessions array", () => {
      const sourceSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const sessionData = getSession(sourceSession.sessionId);
      const results = getRadarResults(sessionData, []);
      expect(results).toEqual([]);
    });

    it("handles all sessions with safety flags", () => {
      const sourceSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Create target sessions with safety flags
      const targetSessions = [];
      for (let i = 0; i < 3; i++) {
        const session = createSession({
          vibe: "banter",
          tags: [],
          visibility: true,
        });
        const sessionData = getSession(session.sessionId);
        sessionData.safetyFlag = true;
        targetSessions.push(sessionData);
      }

      const sourceData = getSession(sourceSession.sessionId);
      const results = getRadarResults(sourceData, targetSessions);
      expect(results).toEqual([]); // All excluded
    });

    it("handles extreme proximity values", () => {
      const sourceSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 0, lng: 0 }, // Equator/Prime Meridian
      });

      const targetSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 90, lng: 180 }, // North Pole/Antimeridian
      });

      const sourceData = getSession(sourceSession.sessionId);
      const targetData = getSession(targetSession.sessionId);
      const score = calculateScore(sourceData, targetData);
      
      // Should still calculate a score (even if low due to distance)
      expect(typeof score).toBe("number");
      expect(isFinite(score)).toBe(true);
    });

    it("handles sessions without location", () => {
      const sourceSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: null,
      });

      const targetSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: null,
      });

      const sourceData = getSession(sourceSession.sessionId);
      const targetData = getSession(targetSession.sessionId);
      const score = calculateScore(sourceData, targetData);
      
      // Should still calculate a score (without proximity bonus)
      expect(typeof score).toBe("number");
      expect(isFinite(score)).toBe(true);
    });
  });
});

