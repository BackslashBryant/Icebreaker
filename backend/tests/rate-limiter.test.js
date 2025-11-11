import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, clearRateLimit, getRateLimitStats } from "../src/lib/rate-limiter.js";

describe("RateLimiter", () => {
  beforeEach(() => {
    // Clear rate limit data by clearing all entries
    // Note: In a real scenario, we'd export a reset function
    // For now, we'll use unique chatIds per test
  });

  describe("checkRateLimit", () => {
    it("allows messages within rate limit", () => {
      const chatId = "test-chat-1";

      // Send 5 messages (under limit of 10)
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(chatId);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBeGreaterThan(0);
      }
    });

    it("blocks messages when rate limit exceeded", () => {
      const chatId = "test-chat-2";

      // Send 10 messages (at limit)
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(chatId);
        expect(result.allowed).toBe(true);
      }

      // 11th message should be blocked
      const result = checkRateLimit(chatId);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it("allows messages after window expires", async () => {
      const chatId = "test-chat-3";

      // Send 10 messages
      for (let i = 0; i < 10; i++) {
        checkRateLimit(chatId);
      }

      // 11th should be blocked
      let result = checkRateLimit(chatId);
      expect(result.allowed).toBe(false);

      // Wait for window to expire (61 seconds)
      // Note: This test has a long timeout due to the 61-second wait
      await new Promise((resolve) => setTimeout(resolve, 61000));

      // Should now be allowed
      result = checkRateLimit(chatId);
      expect(result.allowed).toBe(true);
    }, 70000); // 70 second timeout

    it("tracks separate rate limits for different chats", () => {
      const chatId1 = "test-chat-4";
      const chatId2 = "test-chat-5";

      // Fill up chat1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(chatId1);
      }

      // Chat1 should be blocked
      expect(checkRateLimit(chatId1).allowed).toBe(false);

      // Chat2 should still be allowed
      expect(checkRateLimit(chatId2).allowed).toBe(true);
    });
  });

  describe("clearRateLimit", () => {
    it("clears rate limit for a specific chat", () => {
      const chatId = "test-chat-6";

      // Fill up rate limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(chatId);
      }

      // Should be blocked
      expect(checkRateLimit(chatId).allowed).toBe(false);

      // Clear rate limit
      clearRateLimit(chatId);

      // Should now be allowed
      expect(checkRateLimit(chatId).allowed).toBe(true);
    });
  });

  describe("getRateLimitStats", () => {
    it("returns correct stats for a chat", () => {
      const chatId = "test-chat-7";

      // Send 3 messages
      for (let i = 0; i < 3; i++) {
        checkRateLimit(chatId);
      }

      const stats = getRateLimitStats(chatId);
      expect(stats.count).toBe(3);
      expect(stats.limit).toBe(10);
      expect(stats.resetAt).toBeGreaterThan(Date.now());
    });

    it("returns zero count for non-existent chat", () => {
      const stats = getRateLimitStats("non-existent-chat");
      expect(stats.count).toBe(0);
      expect(stats.limit).toBe(10);
      expect(stats.resetAt).toBeNull();
    });
  });
});

