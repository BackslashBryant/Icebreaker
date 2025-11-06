import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSession, getSession, cleanupExpiredSessions } from "../src/services/SessionManager.js";

describe("SessionManager", () => {
  beforeEach(() => {
    // Clear sessions between tests
    // Note: This requires exporting sessions Map or using a reset function
  });

  it("creates session with all fields", () => {
    const sessionData = {
      vibe: "banter",
      tags: ["Quietly Curious"],
      visibility: true,
      location: { lat: 37.7749, lng: -122.4194 },
    };

    const result = createSession(sessionData);

    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("handle");
    expect(typeof result.sessionId).toBe("string");
    expect(result.sessionId.length).toBeGreaterThan(0);
  });

  it("creates session without location", () => {
    const sessionData = {
      vibe: "intros",
      tags: [],
      visibility: true,
    };

    const result = createSession(sessionData);

    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("handle");
  });

  it("generates unique session IDs", () => {
    const sessionData1 = {
      vibe: "banter",
      tags: [],
      visibility: true,
    };

    const sessionData2 = {
      vibe: "intros",
      tags: [],
      visibility: true,
    };

    const result1 = createSession(sessionData1);
    const result2 = createSession(sessionData2);

    expect(result1.sessionId).not.toBe(result2.sessionId);
  });

  it("retrieves session by ID", () => {
    const sessionData = {
      vibe: "banter",
      tags: [],
      visibility: true,
    };

    const { sessionId } = createSession(sessionData);
    const session = getSession(sessionId);

    expect(session).not.toBeNull();
    expect(session.vibe).toBe("banter");
    expect(session.visibility).toBe(true);
  });

  it("returns null for non-existent session", () => {
    const session = getSession("non-existent-id");
    expect(session).toBeNull();
  });

  it("cleans up expired sessions", () => {
    // Test that cleanupExpiredSessions runs without error
    // Note: Testing actual expiration would require manipulating time or accessing internal Map
    expect(() => cleanupExpiredSessions()).not.toThrow();
  });
});
