import { getSession } from "./SessionManager.js";
import { broadcastToSession } from "../websocket/server.js";
import { calculateDistance } from "../lib/proximity-utils.js";
import { isInCooldown, getCooldownRemaining, recordDecline, checkCooldownThreshold, triggerCooldown } from "./CooldownManager.js";

/**
 * Chat Manager
 * 
 * Manages chat state, request handling, and proximity monitoring.
 * Ephemeral by design - no message storage.
 */

// Chat termination threshold: 100 meters (configurable)
const CHAT_TERMINATION_DISTANCE = 100; // meters

// Proximity warning threshold: 80 meters
const PROXIMITY_WARNING_DISTANCE = 80; // meters

/**
 * Request a chat with another session
 * @param {string} requesterSessionId - Session ID of requester
 * @param {string} targetSessionId - Session ID of target
 * @returns {Object} { success: boolean, error?: string }
 */
export function requestChat(requesterSessionId, targetSessionId) {
  // Validate requester session
  const requesterSession = getSession(requesterSessionId);
  if (!requesterSession) {
    return { success: false, error: "Requester session not found" };
  }

  // Check cooldown FIRST (before all other validation)
  if (isInCooldown(requesterSessionId)) {
    const cooldownRemaining = getCooldownRemaining(requesterSessionId);
    const session = getSession(requesterSessionId);
    return {
      success: false,
      error: "Cooldown active",
      cooldownExpiresAt: session.cooldownExpiresAt,
      cooldownRemainingMs: cooldownRemaining,
    };
  }

  // Validate target session
  const targetSession = getSession(targetSessionId);
  if (!targetSession) {
    return { success: false, error: "Target session not found" };
  }

  // Check if target is visible (not blocked, has visibility ON)
  if (!targetSession.visibility) {
    return { success: false, error: "Target session not visible" };
  }

  // Check if requester is blocked by target
  if (targetSession.blockedSessionIds.includes(requesterSessionId)) {
    return { success: false, error: "Blocked by target session" };
  }

  // Check one-chat-at-a-time constraint
  if (requesterSession.activeChatPartnerId !== null) {
    return { success: false, error: "Requester already in a chat" };
  }

  if (targetSession.activeChatPartnerId !== null) {
    return { success: false, error: "Target already in a chat" };
  }

  // Send chat request to target session
  broadcastToSession(targetSessionId, {
    type: "chat:request",
    payload: {
      fromSessionId: requesterSessionId,
      fromHandle: requesterSession.handle,
      requestId: `${requesterSessionId}-${Date.now()}`,
    },
  });

  // Acknowledge request to requester
  broadcastToSession(requesterSessionId, {
    type: "chat:request:ack",
    payload: {
      targetSessionId,
      status: "pending",
    },
  });

  return { success: true };
}

/**
 * Accept a chat request
 * @param {string} accepterSessionId - Session ID accepting the request
 * @param {string} requesterSessionId - Session ID of requester
 * @returns {Object} { success: boolean, error?: string }
 */
export function acceptChat(accepterSessionId, requesterSessionId) {
  // Validate both sessions
  const accepterSession = getSession(accepterSessionId);
  const requesterSession = getSession(requesterSessionId);

  if (!accepterSession || !requesterSession) {
    return { success: false, error: "Session not found" };
  }

  // Check one-chat-at-a-time constraint
  if (accepterSession.activeChatPartnerId !== null) {
    return { success: false, error: "Accepter already in a chat" };
  }

  if (requesterSession.activeChatPartnerId !== null) {
    return { success: false, error: "Requester already in a chat" };
  }

  // Update both sessions' activeChatPartnerId
  accepterSession.activeChatPartnerId = requesterSessionId;
  requesterSession.activeChatPartnerId = accepterSessionId;

  // Notify both parties
  broadcastToSession(accepterSessionId, {
    type: "chat:accepted",
    payload: {
      chatId: `${accepterSessionId}-${requesterSessionId}`,
      partnerSessionId: requesterSessionId,
      partnerHandle: requesterSession.handle,
    },
  });

  broadcastToSession(requesterSessionId, {
    type: "chat:accepted",
    payload: {
      chatId: `${accepterSessionId}-${requesterSessionId}`,
      partnerSessionId: accepterSessionId,
      partnerHandle: accepterSession.handle,
    },
  });

  return { success: true };
}

/**
 * Decline a chat request
 * @param {string} declinerSessionId - Session ID declining the request
 * @param {string} requesterSessionId - Session ID of requester
 * @returns {Object} { success: boolean, error?: string }
 */
export function declineChat(declinerSessionId, requesterSessionId) {
  // Validate both sessions
  const declinerSession = getSession(declinerSessionId);
  const requesterSession = getSession(requesterSessionId);

  if (!declinerSession || !requesterSession) {
    return { success: false, error: "Session not found" };
  }

  // Record decline for requester (they got declined)
  const declineResult = recordDecline(requesterSessionId);
  if (!declineResult.success) {
    // Log but don't fail decline if tracking fails
    console.warn(`Failed to record decline: ${declineResult.error}`);
  }

  // Check if threshold met and trigger cooldown if needed
  if (declineResult.thresholdMet || checkCooldownThreshold(requesterSessionId)) {
    const cooldownResult = triggerCooldown(requesterSessionId);
    if (cooldownResult.success) {
      console.log(`Cooldown triggered for requester ${requesterSession.handle} (${requesterSessionId}) after decline`);
    }
  }

  // Notify requester of decline
  broadcastToSession(requesterSessionId, {
    type: "chat:declined",
    payload: {
      targetSessionId: declinerSessionId,
    },
  });

  return { success: true };
}

/**
 * End a chat (user-initiated or proximity-based)
 * @param {string} sessionId1 - First session ID
 * @param {string} sessionId2 - Second session ID
 * @param {string} reason - Reason for ending: 'user_exit' | 'proximity_lost' | 'error'
 * @returns {Object} { success: boolean, error?: string }
 */
export function endChat(sessionId1, sessionId2, reason = "user_exit") {
  const session1 = getSession(sessionId1);
  const session2 = getSession(sessionId2);

  if (!session1 || !session2) {
    return { success: false, error: "Session not found" };
  }

  // Clear activeChatPartnerId from both sessions
  session1.activeChatPartnerId = null;
  session2.activeChatPartnerId = null;

  // Notify both parties
  broadcastToSession(sessionId1, {
    type: "chat:end",
    payload: {
      reason,
      message: reason === "proximity_lost" ? "Connection lost. Chat deleted." : "Chat ended.",
    },
  });

  broadcastToSession(sessionId2, {
    type: "chat:end",
    payload: {
      reason,
      message: reason === "proximity_lost" ? "Connection lost. Chat deleted." : "Chat ended.",
    },
  });

  return { success: true };
}

/**
 * Check proximity between two sessions and terminate if too far
 * @param {string} sessionId1 - First session ID
 * @param {string} sessionId2 - Second session ID
 * @returns {boolean} true if chat was terminated, false otherwise
 */
export function checkProximityAndTerminate(sessionId1, sessionId2) {
  const session1 = getSession(sessionId1);
  const session2 = getSession(sessionId2);

  if (!session1 || !session2) {
    return false;
  }

  // If either session doesn't have location, can't check proximity
  if (!session1.location || !session2.location) {
    return false;
  }

  // Calculate distance
  const distance = calculateDistance(session1.location, session2.location);

  // If distance exceeds threshold, terminate chat
  if (distance > CHAT_TERMINATION_DISTANCE) {
    endChat(sessionId1, sessionId2, "proximity_lost");
    return true;
  }

  return false;
}

/**
 * Get proximity warning status for a chat
 * @param {string} sessionId1 - First session ID
 * @param {string} sessionId2 - Second session ID
 * @returns {Object} { warning: boolean, distance?: number }
 */
export function getProximityWarning(sessionId1, sessionId2) {
  const session1 = getSession(sessionId1);
  const session2 = getSession(sessionId2);

  if (!session1 || !session2 || !session1.location || !session2.location) {
    return { warning: false };
  }

  const distance = calculateDistance(session1.location, session2.location);

  return {
    warning: distance > PROXIMITY_WARNING_DISTANCE,
    distance: Math.round(distance),
  };
}

/**
 * Validate that two sessions have an active chat
 * @param {string} sessionId1 - First session ID
 * @param {string} sessionId2 - Second session ID
 * @returns {boolean} true if they have an active chat
 */
export function validateActiveChat(sessionId1, sessionId2) {
  const session1 = getSession(sessionId1);
  const session2 = getSession(sessionId2);

  if (!session1 || !session2) {
    return false;
  }

  return (
    session1.activeChatPartnerId === sessionId2 &&
    session2.activeChatPartnerId === sessionId1
  );
}

