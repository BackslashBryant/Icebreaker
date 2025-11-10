import { getSession, updateSessionSafetyFlag, setPanicExclusion } from "./SessionManager.js";
import { endChat } from "./ChatManager.js";
import { broadcastToSession } from "../websocket/server.js";

// Default safety exclusion duration: 1 hour (3600000 ms)
const DEFAULT_EXCLUSION_DURATION_MS = 60 * 60 * 1000;

/**
 * Trigger panic for a session.
 * Sets safety flag, ends active chat, and triggers safety exclusion.
 * @param {string} sessionId - The session ID triggering panic
 * @returns {{success: boolean, error?: string, exclusionExpiresAt?: number}}
 */
export function triggerPanic(sessionId) {
  const session = getSession(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  // Set safety flag
  updateSessionSafetyFlag(sessionId, true);

  // Set panic exclusion expiration (default: 1 hour from now)
  const exclusionExpiresAt = Date.now() + DEFAULT_EXCLUSION_DURATION_MS;
  setPanicExclusion(sessionId, exclusionExpiresAt);

  // End active chat if in progress
  if (session.activeChatPartnerId) {
    const chatResult = endChat(sessionId, session.activeChatPartnerId, "panic");
    if (!chatResult.success) {
      // Log but don't fail panic if chat end fails
      console.warn(`Failed to end chat during panic: ${chatResult.error}`);
    }
  }

  // Notify session that panic was triggered
  broadcastToSession(sessionId, {
    type: "panic:triggered",
    payload: {
      exclusionExpiresAt,
      message: "Session ended. You're safe.",
    },
  });

  console.log(`Panic triggered for session ${session.handle} (${sessionId})`);
  return {
    success: true,
    exclusionExpiresAt,
  };
}

/**
 * Check if a session has an active panic exclusion.
 * @param {string} sessionId - The session ID to check
 * @returns {boolean} True if session has active exclusion
 */
export function hasActivePanicExclusion(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return false;
  }

  // Check if safety flag is set and exclusion hasn't expired
  if (session.safetyFlag && session.panicExclusionExpiresAt) {
    return session.panicExclusionExpiresAt > Date.now();
  }

  return false;
}

/**
 * Clear panic exclusion for a session (manual override, e.g., admin action).
 * @param {string} sessionId - The session ID
 * @returns {{success: boolean, error?: string}}
 */
export function clearPanicExclusion(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  updateSessionSafetyFlag(sessionId, false);
  setPanicExclusion(sessionId, null);

  console.log(`Panic exclusion cleared for session ${session.handle} (${sessionId})`);
  return { success: true };
}

