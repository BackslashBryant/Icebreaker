import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  recordDecline,
  checkCooldownThreshold,
  triggerCooldown,
  isInCooldown,
  clearExpiredCooldown,
  getCooldownRemaining,
  getDeclineCountInWindow,
} from "../src/services/CooldownManager.js";
import { createSession, getSession } from "../src/services/SessionManager.js";

describe("CooldownManager", () => {
  beforeEach(() => {
    // Clear sessions before each test
    vi.clearAllMocks();
  });

  describe("recordDecline", () => {
    it("adds timestamp to declinedInvites array", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = recordDecline(sessionData.sessionId);

      expect(result.success).toBe(true);
      const session = getSession(sessionData.sessionId);
      expect(session.declinedInvites).toHaveLength(1);
      expect(session.declineCount).toBe(1);
    });

    it("cleans up timestamps older than window", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      const now = Date.now();
      // Add old timestamp (11 minutes ago, outside 10 min window)
      session.declinedInvites = [now - 11 * 60 * 1000];
      session.declineCount = 1;

      // Record new decline
      const result = recordDecline(sessionData.sessionId);

      expect(result.success).toBe(true);
      // Old timestamp should be removed, only new one remains
      expect(session.declinedInvites).toHaveLength(1);
      expect(session.declineCount).toBe(1);
    });

    it("returns thresholdMet true when threshold reached", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Record 3 declines (threshold)
      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);
      const result = recordDecline(sessionData.sessionId);

      expect(result.success).toBe(true);
      expect(result.thresholdMet).toBe(true);
    });

    it("returns error for invalid session", () => {
      const result = recordDecline("invalid-session-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });
  });

  describe("checkCooldownThreshold", () => {
    it("returns true when threshold met", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Record 3 declines
      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);

      const thresholdMet = checkCooldownThreshold(sessionData.sessionId);
      expect(thresholdMet).toBe(true);
    });

    it("returns false when threshold not met", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      // Record only 2 declines
      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);

      const thresholdMet = checkCooldownThreshold(sessionData.sessionId);
      expect(thresholdMet).toBe(false);
    });

    it("cleans up old timestamps before checking", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      const now = Date.now();
      // Add old timestamp (outside window)
      session.declinedInvites = [now - 11 * 60 * 1000];
      session.declineCount = 1;

      const thresholdMet = checkCooldownThreshold(sessionData.sessionId);
      expect(thresholdMet).toBe(false);
      expect(session.declinedInvites).toHaveLength(0);
    });

    it("returns false for invalid session", () => {
      const thresholdMet = checkCooldownThreshold("invalid-session-id");
      expect(thresholdMet).toBe(false);
    });
  });

  describe("triggerCooldown", () => {
    it("sets cooldownExpiresAt timestamp", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const beforeTime = Date.now();
      const result = triggerCooldown(sessionData.sessionId);
      const afterTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.cooldownExpiresAt).toBeGreaterThan(beforeTime);
      expect(result.cooldownExpiresAt).toBeLessThanOrEqual(afterTime + 30 * 60 * 1000);

      const session = getSession(sessionData.sessionId);
      expect(session.cooldownExpiresAt).toBe(result.cooldownExpiresAt);
    });

    it("sets expiration to 30 minutes from now", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const beforeTime = Date.now();
      const result = triggerCooldown(sessionData.sessionId);
      const afterTime = Date.now();

      const expectedExpiration = beforeTime + 30 * 60 * 1000; // 30 minutes
      const actualExpiration = result.cooldownExpiresAt;

      // Allow 1 second tolerance
      expect(actualExpiration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(actualExpiration).toBeLessThanOrEqual(afterTime + 30 * 60 * 1000 + 1000);
    });

    it("returns error for invalid session", () => {
      const result = triggerCooldown("invalid-session-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });
  });

  describe("integration: cooldown lifecycle", () => {
    it("enters cooldown after threshold declines and reports remaining time", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);
      triggerCooldown(sessionData.sessionId);

      expect(isInCooldown(sessionData.sessionId)).toBe(true);
      const remaining = getCooldownRemaining(sessionData.sessionId);
      expect(remaining).toBeGreaterThan(0);
    });

    it("clears expired cooldown after time passes", () => {
      vi.useFakeTimers();
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerCooldown(sessionData.sessionId);
      expect(isInCooldown(sessionData.sessionId)).toBe(true);

      vi.setSystemTime(Date.now() + 60 * 60 * 1000);
      clearExpiredCooldown();

      expect(isInCooldown(sessionData.sessionId)).toBe(false);
      vi.useRealTimers();
    });
  });

  describe("isInCooldown", () => {
    it("returns true for session in active cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerCooldown(sessionData.sessionId);
      const inCooldown = isInCooldown(sessionData.sessionId);

      expect(inCooldown).toBe(true);
    });

    it("returns false for session not in cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const inCooldown = isInCooldown(sessionData.sessionId);
      expect(inCooldown).toBe(false);
    });

    it("clears expired cooldown and returns false", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      // Set expired cooldown (1 minute ago)
      session.cooldownExpiresAt = Date.now() - 60 * 1000;

      const inCooldown = isInCooldown(sessionData.sessionId);

      expect(inCooldown).toBe(false);
      expect(session.cooldownExpiresAt).toBeNull();
    });

    it("returns false for invalid session", () => {
      const inCooldown = isInCooldown("invalid-session-id");
      expect(inCooldown).toBe(false);
    });
  });

  describe("clearExpiredCooldown", () => {
    it("clears expired cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      session.cooldownExpiresAt = Date.now() - 60 * 1000; // Expired

      const cleared = clearExpiredCooldown(sessionData.sessionId);

      expect(cleared).toBe(true);
      expect(session.cooldownExpiresAt).toBeNull();
    });

    it("does not clear active cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerCooldown(sessionData.sessionId);
      const session = getSession(sessionData.sessionId);
      const expiresAt = session.cooldownExpiresAt;

      const cleared = clearExpiredCooldown(sessionData.sessionId);

      expect(cleared).toBe(false);
      expect(session.cooldownExpiresAt).toBe(expiresAt);
    });

    it("returns false for invalid session", () => {
      const cleared = clearExpiredCooldown("invalid-session-id");
      expect(cleared).toBe(false);
    });
  });

  describe("getCooldownRemaining", () => {
    it("returns remaining milliseconds for active cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      triggerCooldown(sessionData.sessionId);
      const remaining = getCooldownRemaining(sessionData.sessionId);

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(30 * 60 * 1000); // Max 30 minutes
    });

    it("returns 0 for session not in cooldown", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const remaining = getCooldownRemaining(sessionData.sessionId);
      expect(remaining).toBe(0);
    });

    it("clears expired cooldown and returns 0", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      session.cooldownExpiresAt = Date.now() - 60 * 1000; // Expired

      const remaining = getCooldownRemaining(sessionData.sessionId);

      expect(remaining).toBe(0);
      expect(session.cooldownExpiresAt).toBeNull();
    });

    it("returns 0 for invalid session", () => {
      const remaining = getCooldownRemaining("invalid-session-id");
      expect(remaining).toBe(0);
    });
  });

  describe("getDeclineCountInWindow", () => {
    it("returns count of declines in current window", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      recordDecline(sessionData.sessionId);
      recordDecline(sessionData.sessionId);

      const count = getDeclineCountInWindow(sessionData.sessionId);
      expect(count).toBe(2);
    });

    it("excludes declines outside window", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session = getSession(sessionData.sessionId);
      const now = Date.now();
      // Add old timestamp (outside window)
      session.declinedInvites = [now - 11 * 60 * 1000];
      // Add recent timestamp (within window)
      session.declinedInvites.push(now - 5 * 60 * 1000);

      const count = getDeclineCountInWindow(sessionData.sessionId);
      expect(count).toBe(1); // Only recent one counts
    });

    it("returns 0 for session with no declines", () => {
      const sessionData = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const count = getDeclineCountInWindow(sessionData.sessionId);
      expect(count).toBe(0);
    });

    it("returns 0 for invalid session", () => {
      const count = getDeclineCountInWindow("invalid-session-id");
      expect(count).toBe(0);
    });
  });
});

