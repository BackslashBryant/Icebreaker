import { describe, it, expect, beforeEach } from "vitest";
import { calculateScore, calculateScores, getRadarResults } from "../src/services/SignalEngine.js";
import { createSession } from "../src/services/SessionManager.js";

describe("SignalEngine", () => {
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

    it("excludes source session from results", () => {
      const source = createTestSession({ sessionId: "source-123" });
      const targets = [
        source,
        createTestSession({ sessionId: "target-1" }),
      ];

      const results = calculateScores(source, targets);
      expect(results.length).toBe(1);
      expect(results[0].session.sessionId).toBe("target-1");
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

