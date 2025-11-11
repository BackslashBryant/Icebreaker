import { describe, it, expect, beforeEach, vi } from "vitest";
import { blockSession, reportSession } from "../src/services/SafetyManager.js";
import { createSession, getSession } from "../src/services/SessionManager.js";
import { requestChat, acceptChat } from "../src/services/ChatManager.js";
import { getUniqueReporterCount } from "../src/services/ReportManager.js";

/**
 * Safety Manager Test Suite
 * 
 * Tests for blockSession and reportSession functions.
 * Covers validation, blocking logic, reporting logic, and safety exclusion.
 */

describe("SafetyManager", () => {
  beforeEach(() => {
    // Sessions are in-memory and will be cleared between test runs
    // No explicit cleanup needed as each test creates fresh sessions
    vi.clearAllMocks();
  });

  describe("blockSession", () => {
    it("blocks a user successfully", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const result = blockSession(requester.sessionId, target.sessionId);

      expect(result.success).toBe(true);
      const requesterSession = getSession(requester.sessionId);
      expect(requesterSession.blockedSessionIds).toContain(target.sessionId);
    });

    it("returns error for invalid requester session", () => {
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const result = blockSession("invalid-requester", target.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Requester session not found");
    });

    it("returns error for invalid target session", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = blockSession(requester.sessionId, "invalid-target");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Target session not found");
    });

    it("prevents blocking yourself", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = blockSession(requester.sessionId, requester.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot block yourself");
    });

    it("prevents duplicate blocking", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // First block
      const firstResult = blockSession(requester.sessionId, target.sessionId);
      expect(firstResult.success).toBe(true);

      // Second block (should fail)
      const secondResult = blockSession(requester.sessionId, target.sessionId);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe("User already blocked");
    });

    it("ends active chat when blocking current chat partner", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // Start a chat
      requestChat(requester.sessionId, target.sessionId);
      acceptChat(target.sessionId, requester.sessionId);

      // Verify chat is active
      const requesterSession = getSession(requester.sessionId);
      expect(requesterSession.activeChatPartnerId).toBe(target.sessionId);

      // Block the chat partner
      const result = blockSession(requester.sessionId, target.sessionId);

      expect(result.success).toBe(true);
      // Chat should be ended
      const updatedRequesterSession = getSession(requester.sessionId);
      expect(updatedRequesterSession.activeChatPartnerId).toBeNull();
    });
  });

  describe("reportSession", () => {
    it("reports a user successfully", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const result = reportSession(
        requester.sessionId,
        target.sessionId,
        "harassment"
      );

      expect(result.success).toBe(true);
      const targetSession = getSession(target.sessionId);
      expect(targetSession.reportCount).toBe(1);
    });

    it("returns error for invalid requester session", () => {
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const result = reportSession(
        "invalid-requester",
        target.sessionId,
        "harassment"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Requester session not found");
    });

    it("returns error for invalid target session", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = reportSession(
        requester.sessionId,
        "invalid-target",
        "harassment"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Target session not found");
    });

    it("prevents reporting yourself", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = reportSession(
        requester.sessionId,
        requester.sessionId,
        "harassment"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot report yourself");
    });

    it("prevents duplicate reports from same reporter", () => {
      const requester = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // First report
      const firstResult = reportSession(
        requester.sessionId,
        target.sessionId,
        "harassment"
      );
      expect(firstResult.success).toBe(true);

      // Second report (should fail)
      const secondResult = reportSession(
        requester.sessionId,
        target.sessionId,
        "spam"
      );
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe("Already reported this user");
    });

    it("increments reportCount correctly", () => {
      const requester1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const requester2 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // First report
      reportSession(requester1.sessionId, target.sessionId, "harassment");
      const targetSession1 = getSession(target.sessionId);
      expect(targetSession1.reportCount).toBe(1);

      // Second report from different reporter
      reportSession(requester2.sessionId, target.sessionId, "spam");
      const targetSession2 = getSession(target.sessionId);
      expect(targetSession2.reportCount).toBe(2);
    });

    it("triggers safety exclusion when ≥3 unique reporters report same target", () => {
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      // Create 3 unique reporters
      const reporters = [];
      for (let i = 0; i < 3; i++) {
        reporters.push(
          createSession({
            vibe: "banter",
            tags: [],
            visibility: true,
          })
        );
      }

      // First 2 reports should not trigger exclusion
      reportSession(reporters[0].sessionId, target.sessionId, "harassment");
      const targetSession1 = getSession(target.sessionId);
      expect(targetSession1.safetyFlag).toBe(false);
      expect(targetSession1.panicExclusionExpiresAt).toBeNull();

      reportSession(reporters[1].sessionId, target.sessionId, "spam");
      const targetSession2 = getSession(target.sessionId);
      expect(targetSession2.safetyFlag).toBe(false);
      expect(targetSession2.panicExclusionExpiresAt).toBeNull();

      // Third report should trigger exclusion
      const result = reportSession(
        reporters[2].sessionId,
        target.sessionId,
        "impersonation"
      );
      expect(result.success).toBe(true);

      const targetSession3 = getSession(target.sessionId);
      expect(targetSession3.safetyFlag).toBe(true);
      expect(targetSession3.panicExclusionExpiresAt).toBeGreaterThan(Date.now());
      expect(targetSession3.panicExclusionExpiresAt).toBeLessThanOrEqual(
        Date.now() + 3600000 + 1000
      ); // 1 hour + 1 second tolerance
    });

    it("allows multiple reports from different reporters", () => {
      const target = createSession({
        vibe: "deep",
        tags: [],
        visibility: true,
      });

      const categories = ["harassment", "spam", "impersonation", "other"];

      categories.forEach((category, index) => {
        const reporter = createSession({
          vibe: "banter",
          tags: [],
          visibility: true,
        });

        const result = reportSession(
          reporter.sessionId,
          target.sessionId,
          category
        );
        expect(result.success).toBe(true);
      });

      const targetSession = getSession(target.sessionId);
      expect(targetSession.reportCount).toBe(categories.length);
      expect(getUniqueReporterCount(target.sessionId)).toBe(categories.length);
    });
  });
});

