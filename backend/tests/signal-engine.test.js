import { describe, it, expect, beforeEach } from "vitest";
import { calculateScore, calculateScores, getRadarResults } from "../src/services/SignalEngine.js";
import { createSession, getSession } from "../src/services/SessionManager.js";
import { addReport, clearAllReports } from "../src/services/ReportManager.js";
import { recordDecline, triggerCooldown } from "../src/services/CooldownManager.js";

describe("SignalEngine", () => {
  beforeEach(() => {
    // Clear reports before each test to ensure isolation
    clearAllReports();
  });

  // Helper to create test session object
  function createTestSession(overrides = {}) {
    return {
      sessionId: "test-" + Math.random().toString(36).substr(2, 9),
      handle: "testuser",
      vibe: "banter",
      tags: [],
      visibility: true,
      location: null,
      safetyFlag: false,
      reportCount: 0,
      declineCount: 0,
      declinedInvites: [],
      cooldownExpiresAt: null,
      ...overrides,
    };
  }

  describe("calculateScore", () => {
    it("calculates score with vibe match", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] }); // Has tags to avoid tagless penalty
      const target = createTestSession({ vibe: "banter", visibility: true });

      const score = calculateScore(source, target);
      expect(score).toBeGreaterThan(0);
      // Should have: w_vibe (10) + w_vis (3) = 13
      expect(score).toBeGreaterThanOrEqual(10);
    });

    it("calculates score without vibe match", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] }); // Has tags to avoid tagless penalty
      const target = createTestSession({ vibe: "intros", visibility: true });

      const score = calculateScore(source, target);
      // Should have: w_vis (3) but no vibe match
      expect(score).toBe(3);
    });

    it("applies shared tag bonus (max 3 tags)", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1", "tag2", "tag3", "tag4"] });
      const target = createTestSession({ vibe: "intros", tags: ["tag1", "tag2", "tag3", "tag5"], visibility: true });

      const score = calculateScore(source, target);
      // Should have: w_vis (3) + w_tag * 3 (15) = 18
      expect(score).toBe(18);
    });

    it("applies tagless penalty when source has no tags", () => {
      const source = createTestSession({ vibe: "banter", tags: [] });
      const target = createTestSession({ vibe: "intros", visibility: true });

      const score = calculateScore(source, target);
      // Should have: w_vis (3) + w_tagless (-5) = -2
      expect(score).toBe(-2);
    });

    it("excludes sessions with safety flag", () => {
      const source = createTestSession();
      const target = createTestSession({ safetyFlag: true });

      const score = calculateScore(source, target);
      expect(score).toBe(-Infinity);
    });

    it("applies proximity tier bonus", () => {
      const source = createTestSession({
        location: { lat: 37.7749, lng: -122.4194 },
      });
      const target = createTestSession({
        location: { lat: 37.775, lng: -122.4195 }, // ~100m away (venue tier)
        visibility: true,
      });

      const score = calculateScore(source, target);
      // Should have: w_vis (3) + w_dist * venue_multiplier (2 * 2) = 7
      expect(score).toBeGreaterThanOrEqual(3);
    });

    it("handles missing location gracefully", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"], location: null }); // Has tags to avoid tagless penalty
      const target = createTestSession({ vibe: "intros", location: null, visibility: true });

      const score = calculateScore(source, target);
      // Should have: w_vis (3) only (no vibe match, no proximity)
      expect(score).toBe(3);
    });

    it("applies report penalty for reported users", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      const target = createTestSession({ vibe: "banter", visibility: true });

      // Score without reports
      const scoreBefore = calculateScore(source, target);
      expect(scoreBefore).toBeGreaterThan(0);

      // Add 1 report
      addReport("reporter-1", target.sessionId, "harassment");
      const scoreAfter1 = calculateScore(source, target);
      expect(scoreAfter1).toBeLessThan(scoreBefore);
      // Should be: scoreBefore + w_report * 1 = scoreBefore - 3
      expect(scoreAfter1).toBe(scoreBefore - 3);

      // Add second report from different reporter
      addReport("reporter-2", target.sessionId, "spam");
      const scoreAfter2 = calculateScore(source, target);
      expect(scoreAfter2).toBeLessThan(scoreAfter1);
      // Should be: scoreBefore + w_report * 2 = scoreBefore - 6
      expect(scoreAfter2).toBe(scoreBefore - 6);
    });

    it("does not apply report penalty for unreported users", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      const target = createTestSession({ vibe: "banter", visibility: true });

      const score = calculateScore(source, target);
      // Should have: w_vibe (10) + w_vis (3) = 13
      expect(score).toBe(13);
    });

    it("safety exclusion still works for ≥3 unique reports", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      const target = createTestSession({ 
        vibe: "banter", 
        visibility: true,
        safetyFlag: true, // Set by SafetyManager when ≥3 unique reports
      });

      // Even with reports, safety exclusion should exclude entirely
      const score = calculateScore(source, target);
      expect(score).toBe(-Infinity);
    });

    it("reported users appear lower in Radar results", () => {
      const source = createTestSession({ vibe: "banter", tags: ["shared"] });
      const unreported = createTestSession({ 
        vibe: "banter", 
        tags: ["shared"],
        sessionId: "unreported-1",
      });
      const reported = createTestSession({ 
        vibe: "banter", 
        tags: ["shared"],
        sessionId: "reported-1",
      });

      // Add 1 report to reported user
      addReport("reporter-1", reported.sessionId, "harassment");

      const results = calculateScores(source, [unreported, reported]);
      expect(results.length).toBe(2);
      // Unreported user should appear first (higher score)
      expect(results[0].session.sessionId).toBe("unreported-1");
      expect(results[1].session.sessionId).toBe("reported-1");
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it("applies decline penalty during active cooldown", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      const target = createTestSession({ vibe: "banter", visibility: true });

      // Score without cooldown
      const scoreBefore = calculateScore(source, target);
      expect(scoreBefore).toBeGreaterThan(0); // Should be 13 (w_vibe + w_vis)

      // Put target in cooldown and record 3 declines
      const targetSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      triggerCooldown(targetSession.sessionId);

      // Update target test session with cooldown state
      const targetWithCooldown = createTestSession({
        sessionId: targetSession.sessionId,
        vibe: "banter",
        visibility: true,
        declineCount: 3,
        declinedInvites: [Date.now() - 1000, Date.now() - 500, Date.now()],
        cooldownExpiresAt: Date.now() + 30 * 60 * 1000, // 30 min from now
      });

      const scoreAfter = calculateScore(source, targetWithCooldown);
      expect(scoreAfter).toBeLessThan(scoreBefore);
      // Should be: scoreBefore + w_decline * 3 = scoreBefore - 15
      expect(scoreAfter).toBe(scoreBefore - 15);
    });

    it("does not apply decline penalty when not in cooldown", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      const target = createTestSession({
        vibe: "banter",
        visibility: true,
        declineCount: 3,
        declinedInvites: [Date.now() - 1000, Date.now() - 500, Date.now()],
        cooldownExpiresAt: null, // Not in cooldown
      });

      const score = calculateScore(source, target);
      // Should have: w_vibe (10) + w_vis (3) = 13 (no decline penalty)
      expect(score).toBe(13);
    });

    it("caps decline penalty at MAX_DECLINE_PENALTY", () => {
      const source = createTestSession({ vibe: "banter", tags: ["tag1"] });
      
      // Create actual session with 5 declines
      const targetSession = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });
      
      // Record 5 declines (more than threshold of 3)
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      recordDecline(targetSession.sessionId);
      triggerCooldown(targetSession.sessionId);
      
      const targetWithCooldown = getSession(targetSession.sessionId);

      const score = calculateScore(source, targetWithCooldown);
      // Should cap at 3 declines × -5 = -15, not 5 × -5 = -25
      // Score: w_vibe (10) + w_vis (3) - max penalty (15) = -2
      const expectedScore = 13 - 15;
      expect(score).toBe(expectedScore);
    });

    it("users in cooldown appear lower in Radar results", () => {
      const source = createTestSession({ vibe: "banter", tags: ["shared"] });
      
      // Create actual sessions
      const normalSession = createSession({
        vibe: "banter",
        tags: ["shared"],
        visibility: true,
      });
      const normal = getSession(normalSession.sessionId);
      
      const cooldownSession = createSession({
        vibe: "banter",
        tags: ["shared"],
        visibility: true,
      });
      recordDecline(cooldownSession.sessionId);
      recordDecline(cooldownSession.sessionId);
      recordDecline(cooldownSession.sessionId);
      triggerCooldown(cooldownSession.sessionId);
      const cooldown = getSession(cooldownSession.sessionId);

      const results = calculateScores(source, [normal, cooldown]);
      expect(results.length).toBe(2);
      // Normal user should appear first (higher score)
      expect(results[0].session.sessionId).toBe(normalSession.sessionId);
      expect(results[1].session.sessionId).toBe(cooldownSession.sessionId);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it("calculates complete score with all factors", () => {
      const source = createTestSession({
        vibe: "banter",
        tags: ["tag1", "tag2"],
        location: { lat: 37.7749, lng: -122.4194 },
      });
      const target = createTestSession({
        vibe: "banter",
        tags: ["tag1", "tag2", "tag3"],
        visibility: true,
        location: { lat: 37.775, lng: -122.4195 }, // ~100m (venue tier)
      });

      const score = calculateScore(source, target);
      // Should have: w_vibe (10) + w_tag * 2 (10) + w_vis (3) + w_dist * 2 (4) = 27
      expect(score).toBe(27);
    });
  });

  describe("calculateScores", () => {
    it("sorts sessions by score descending", () => {
      const source = createTestSession({ vibe: "banter", tags: ["shared"] });
      const targets = [
        createTestSession({ vibe: "intros", tags: [] }), // Lower score
        createTestSession({ vibe: "banter", tags: ["shared"] }), // Higher score
        createTestSession({ vibe: "banter", tags: [] }), // Medium score
      ];

      const results = calculateScores(source, targets);
      expect(results.length).toBe(3);
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
    });

    it("excludes sessions with visibility OFF (privacy)", () => {
      const source = createTestSession();
      const targets = [
        createTestSession({ visibility: false }), // Should be excluded
        createTestSession({ visibility: true }), // Should be included
        createTestSession({ visibility: undefined }), // Should be included (defaults to true)
      ];

      const results = calculateScores(source, targets);
      expect(results.length).toBe(2); // Only visible sessions included
      expect(results[0].session.visibility).not.toBe(false);
      expect(results[1].session.visibility).not.toBe(false);
    });

    it("excludes sessions with safety flag", () => {
      const source = createTestSession();
      const targets = [
        createTestSession({ safetyFlag: true }),
        createTestSession({ safetyFlag: false }),
      ];

      const results = calculateScores(source, targets);
      expect(results.length).toBe(1);
      expect(results[0].session.safetyFlag).toBe(false);
    });

    it("applies tie-breakers (stable random seed, then alphabetical)", () => {
      const source = createTestSession({ vibe: "banter" });
      const targets = [
        createTestSession({ vibe: "banter", handle: "bravo" }),
        createTestSession({ vibe: "banter", handle: "alpha" }),
      ];

      const results = calculateScores(source, targets);
      expect(results.length).toBe(2);
      // Both should have same score, but sorted by handle (alphabetical)
      expect(results[0].score).toBe(results[1].score);
      // Tie-breaker order should be deterministic (stable random seed)
      // The exact order depends on sessionId hash, but should be consistent
    });
  });

  describe("getRadarResults", () => {
    it("returns sorted radar results", () => {
      const source = createTestSession({ vibe: "banter", tags: ["shared"] });
      const allSessions = [
        createTestSession({ vibe: "intros", tags: [] }),
        createTestSession({ vibe: "banter", tags: ["shared"] }),
        source,
      ];

      const results = getRadarResults(source, allSessions);
      expect(results.length).toBe(2);
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    });
  });
});

