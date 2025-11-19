import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSession, getSession } from "../src/services/SessionManager.js";
import {
  requestChat,
  acceptChat,
  declineChat,
  endChat,
  validateActiveChat,
  checkProximityAndTerminate,
  getProximityWarning,
} from "../src/services/ChatManager.js";
import { triggerCooldown, recordDecline } from "../src/services/CooldownManager.js";
import { broadcastToSession } from "../src/websocket/server.js";

// Mock WebSocket server
vi.mock("../src/websocket/server.js", () => ({
  broadcastToSession: vi.fn(),
}));

describe("ChatManager", () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Clear sessions by creating new ones (sessions Map is internal)
    // Note: In a real scenario, we'd export a reset function
  });

  describe("requestChat", () => {
    it("successfully requests chat when both sessions exist and are available", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7750, lng: -122.4195 },
      });

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(true);
      expect(broadcastToSession).toHaveBeenCalledTimes(2);
      expect(broadcastToSession).toHaveBeenCalledWith(
        session2.sessionId,
        expect.objectContaining({
          type: "chat:request",
          payload: expect.objectContaining({
            fromSessionId: session1.sessionId,
            fromHandle: expect.any(String),
          }),
        })
      );
      expect(broadcastToSession).toHaveBeenCalledWith(
        session1.sessionId,
        expect.objectContaining({
          type: "chat:request:ack",
        })
      );
    });

    it("fails when requester session not found", () => {
      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const result = requestChat("invalid-session-id", session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Requester session not found");
    });

    it("fails when target session not found", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = requestChat(session1.sessionId, "invalid-session-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Target session not found");
    });

    it("fails when requester is in cooldown", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      // Put session1 in cooldown
      triggerCooldown(session1.sessionId);

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cooldown active");
      expect(result.cooldownExpiresAt).toBeGreaterThan(Date.now());
      expect(result.cooldownRemainingMs).toBeGreaterThan(0);
      // Should not send any chat requests
      expect(broadcastToSession).not.toHaveBeenCalled();
    });

    it("cooldown check happens before all other validation", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: false, // Target not visible
      });

      // Put session1 in cooldown
      triggerCooldown(session1.sessionId);

      const result = requestChat(session1.sessionId, session2.sessionId);

      // Should fail with cooldown error, not "Target session not visible"
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cooldown active");
      expect(broadcastToSession).not.toHaveBeenCalled();
    });

    it("fails when target is not visible", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: false, // Not visible
      });

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Target session not visible");
    });

    it("fails when requester is blocked by target", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      // Block session1
      const s2 = getSession(session2.sessionId);
      s2.blockedSessionIds.push(session1.sessionId);

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Blocked by target session");
    });

    it("fails when requester already in a chat", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const session3 = createSession({
        vibe: "thinking",
        tags: [],
        visibility: true,
      });

      // Session1 already in chat with session3
      const s1 = getSession(session1.sessionId);
      s1.activeChatPartnerId = session3.sessionId;

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Requester already in a chat");
    });

    it("fails when target already in a chat", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const session3 = createSession({
        vibe: "thinking",
        tags: [],
        visibility: true,
      });

      // Session2 already in chat with session3
      const s2 = getSession(session2.sessionId);
      s2.activeChatPartnerId = session3.sessionId;

      const result = requestChat(session1.sessionId, session2.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Target already in a chat");
    });
  });

  describe("acceptChat", () => {
    it("successfully accepts chat and updates both sessions", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const result = acceptChat(session2.sessionId, session1.sessionId);

      expect(result.success).toBe(true);

      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);

      expect(s1.activeChatPartnerId).toBe(session2.sessionId);
      expect(s2.activeChatPartnerId).toBe(session1.sessionId);

      expect(broadcastToSession).toHaveBeenCalledTimes(2);
      expect(broadcastToSession).toHaveBeenCalledWith(
        session1.sessionId,
        expect.objectContaining({
          type: "chat:accepted",
        })
      );
      expect(broadcastToSession).toHaveBeenCalledWith(
        session2.sessionId,
        expect.objectContaining({
          type: "chat:accepted",
        })
      );
    });

    it("fails when accepter already in a chat", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const session3 = createSession({
        vibe: "thinking",
        tags: [],
        visibility: true,
      });

      // Session2 already in chat
      const s2 = getSession(session2.sessionId);
      s2.activeChatPartnerId = session3.sessionId;

      const result = acceptChat(session2.sessionId, session1.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Accepter already in a chat");
    });

    it("fails when requester already in a chat", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const session3 = createSession({
        vibe: "thinking",
        tags: [],
        visibility: true,
      });

      // Session1 already in chat
      const s1 = getSession(session1.sessionId);
      s1.activeChatPartnerId = session3.sessionId;

      const result = acceptChat(session2.sessionId, session1.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Requester already in a chat");
    });
  });

  describe("declineChat", () => {
    it("successfully declines chat and notifies requester", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const result = declineChat(session2.sessionId, session1.sessionId);

      expect(result.success).toBe(true);
      expect(broadcastToSession).toHaveBeenCalledWith(
        session1.sessionId,
        expect.objectContaining({
          type: "chat:declined",
        })
      );
    });

    it("records decline for requester", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      declineChat(session2.sessionId, session1.sessionId);

      const requesterSession = getSession(session1.sessionId);
      expect(requesterSession.declineCount).toBe(1);
      expect(requesterSession.declinedInvites).toHaveLength(1);
    });

    it("triggers cooldown when threshold met (3 declines)", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const session3 = createSession({
        vibe: "thinking",
        tags: [],
        visibility: true,
      });

      const session4 = createSession({
        vibe: "killing-time",
        tags: [],
        visibility: true,
      });

      // Record 2 declines first
      declineChat(session2.sessionId, session1.sessionId);
      declineChat(session3.sessionId, session1.sessionId);

      // Third decline should trigger cooldown
      const result = declineChat(session4.sessionId, session1.sessionId);

      expect(result.success).toBe(true);
      const requesterSession = getSession(session1.sessionId);
      expect(requesterSession.cooldownExpiresAt).toBeGreaterThan(Date.now());
      expect(requesterSession.declineCount).toBe(3);
    });

    it("fails when session not found", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const result = declineChat("invalid-session-id", session1.sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });
  });

  describe("endChat", () => {
    it("successfully ends chat and clears both sessions", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      // Set up active chat
      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      const result = endChat(session1.sessionId, session2.sessionId, "user_exit");

      expect(result.success).toBe(true);

      const s1After = getSession(session1.sessionId);
      const s2After = getSession(session2.sessionId);

      expect(s1After.activeChatPartnerId).toBe(null);
      expect(s2After.activeChatPartnerId).toBe(null);

      expect(broadcastToSession).toHaveBeenCalledTimes(2);
      expect(broadcastToSession).toHaveBeenCalledWith(
        session1.sessionId,
        expect.objectContaining({
          type: "chat:end",
        })
      );
      expect(broadcastToSession).toHaveBeenCalledWith(
        session2.sessionId,
        expect.objectContaining({
          type: "chat:end",
        })
      );
    });

    it("sends proximity_lost message when reason is proximity_lost", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      // Set up active chat
      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      endChat(session1.sessionId, session2.sessionId, "proximity_lost");

      expect(broadcastToSession).toHaveBeenCalledWith(
        session1.sessionId,
        expect.objectContaining({
          type: "chat:end",
          payload: expect.objectContaining({
            message: "Connection lost. Chat deleted.",
          }),
        })
      );
    });
  });

  describe("validateActiveChat", () => {
    it("returns true when both sessions have active chat with each other", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      expect(validateActiveChat(session1.sessionId, session2.sessionId)).toBe(true);
    });

    it("returns false when sessions don't have active chat", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      expect(validateActiveChat(session1.sessionId, session2.sessionId)).toBe(false);
    });
  });

  describe("checkProximityAndTerminate", () => {
    it("terminates chat when distance exceeds threshold", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7849, lng: -122.4094 }, // ~1.1km away (>100m threshold)
      });

      // Set up active chat
      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      const terminated = checkProximityAndTerminate(session1.sessionId, session2.sessionId);

      expect(terminated).toBe(true);
      expect(s1.activeChatPartnerId).toBe(null);
      expect(s2.activeChatPartnerId).toBe(null);
    });

    it("does not terminate chat when distance is within threshold", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7750, lng: -122.4195 }, // ~100m away (within threshold)
      });

      // Set up active chat
      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      const terminated = checkProximityAndTerminate(session1.sessionId, session2.sessionId);

      expect(terminated).toBe(false);
      expect(s1.activeChatPartnerId).toBe(session2.sessionId);
      expect(s2.activeChatPartnerId).toBe(session1.sessionId);
    });

    it("returns false when sessions don't have locations", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      // Set up active chat
      const s1 = getSession(session1.sessionId);
      const s2 = getSession(session2.sessionId);
      s1.activeChatPartnerId = session2.sessionId;
      s2.activeChatPartnerId = session1.sessionId;

      const terminated = checkProximityAndTerminate(session1.sessionId, session2.sessionId);

      expect(terminated).toBe(false);
    });
  });

  describe("getProximityWarning", () => {
    it("returns warning when distance exceeds warning threshold", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7850, lng: -122.4095 }, // ~1.1km away (>80m warning threshold)
      });

      const warning = getProximityWarning(session1.sessionId, session2.sessionId);

      expect(warning.warning).toBe(true);
      expect(warning.distance).toBeGreaterThan(80);
    });

    it("returns no warning when distance is within threshold", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
        location: { lat: 37.7749, lng: -122.4194 },
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
        location: { lat: 37.7750, lng: -122.4195 }, // ~100m away (within warning threshold)
      });

      const warning = getProximityWarning(session1.sessionId, session2.sessionId);

      expect(warning.warning).toBe(false);
    });

    it("returns no warning when sessions don't have locations", () => {
      const session1 = createSession({
        vibe: "banter",
        tags: [],
        visibility: true,
      });

      const session2 = createSession({
        vibe: "intros",
        tags: [],
        visibility: true,
      });

      const warning = getProximityWarning(session1.sessionId, session2.sessionId);

      expect(warning.warning).toBe(false);
      expect(warning.distance).toBeUndefined();
    });
  });
});

