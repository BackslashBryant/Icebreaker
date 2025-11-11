import { describe, it, expect, beforeEach, vi } from "vitest";
import { triggerPanic, hasActivePanicExclusion, clearPanicExclusion } from "../src/services/PanicManager.js";
import { createSession, getSession } from "../src/services/SessionManager.js";
import { requestChat, acceptChat } from "../src/services/ChatManager.js";

describe("PanicManager", () => {
  beforeEach(() => {
    // Clear sessions before each test
    vi.clearAllMocks();
  });

  describe("triggerPanic", () => {
    it("sets safety flag and panic exclusion for valid session", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = triggerPanic(sessionData.sessionId);

      expect(result.success).toBe(true);
      expect(result.exclusionExpiresAt).toBeGreaterThan(Date.now());

      const session = getSession(sessionData.sessionId);
      expect(session.safetyFlag).toBe(true);
      expect(session.panicExclusionExpiresAt).toBeGreaterThan(Date.now());
    });

    it("returns error for invalid session", () => {
      const result = triggerPanic("invalid-session-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });

    it("ends active chat when panic is triggered", () => {
      // Create two sessions
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const session2 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Start a chat
      requestChat(session1.sessionId, session2.sessionId);
      acceptChat(session2.sessionId, session1.sessionId);

      // Verify chat is active
      const s1 = getSession(session1.sessionId);
      expect(s1.activeChatPartnerId).toBe(session2.sessionId);

      // Trigger panic
      const result = triggerPanic(session1.sessionId);

      expect(result.success).toBe(true);

      // Verify chat ended
      const s1After = getSession(session1.sessionId);
      const s2After = getSession(session2.sessionId);
      expect(s1After.activeChatPartnerId).toBeNull();
      expect(s2After.activeChatPartnerId).toBeNull();
    });

    it("sets exclusion expiration to 1 hour from now", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const beforeTime = Date.now();
      const result = triggerPanic(sessionData.sessionId);
      const afterTime = Date.now();

      expect(result.success).toBe(true);
      const expectedExpiration = beforeTime + 60 * 60 * 1000; // 1 hour
      const actualExpiration = result.exclusionExpiresAt;

      // Allow 1 second tolerance for test execution time
      expect(actualExpiration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(actualExpiration).toBeLessThanOrEqual(afterTime + 60 * 60 * 1000 + 1000);
    });
  });

  describe("hasActivePanicExclusion", () => {
    it("returns true for session with active exclusion", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerPanic(sessionData.sessionId);
      const hasExclusion = hasActivePanicExclusion(sessionData.sessionId);

      expect(hasExclusion).toBe(true);
    });

    it("returns false for session without exclusion", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const hasExclusion = hasActivePanicExclusion(sessionData.sessionId);

      expect(hasExclusion).toBe(false);
    });

    it("returns false for invalid session", () => {
      const hasExclusion = hasActivePanicExclusion("invalid-session-id");

      expect(hasExclusion).toBe(false);
    });
  });

  describe("clearPanicExclusion", () => {
    it("clears safety flag and exclusion for valid session", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerPanic(sessionData.sessionId);

      // Verify panic is active
      expect(hasActivePanicExclusion(sessionData.sessionId)).toBe(true);

      const result = clearPanicExclusion(sessionData.sessionId);

      expect(result.success).toBe(true);

      const session = getSession(sessionData.sessionId);
      expect(session.safetyFlag).toBe(false);
      expect(session.panicExclusionExpiresAt).toBeNull();
      expect(hasActivePanicExclusion(sessionData.sessionId)).toBe(false);
    });

    it("returns error for invalid session", () => {
      const result = clearPanicExclusion("invalid-session-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });
  });
});

