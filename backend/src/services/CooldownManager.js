import { getSession } from "./SessionManager.js";
import { getCooldownConfig } from "../config/cooldown-config.js";

/**
 * Cooldown Manager Service
 * 
 * Manages cooldown tracking and enforcement for declined chat invites.
 * Follows PanicManager pattern for expiration and cleanup.
 */

/**
 * Record a declined invite for a session
 * Adds timestamp to declinedInvites array and cleans up old timestamps
 * @param {string} sessionId - Session ID that received the decline
 * @returns {Object} { success: boolean, error?: string, thresholdMet?: boolean }
 */
export function recordDecline(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const config = getCooldownConfig();
  const now = Date.now();

  // Add current timestamp to declinedInvites array
  session.declinedInvites = session.declinedInvites || [];
  session.declinedInvites.push(now);

  // Clean up timestamps older than window
  const windowStart = now - config.DECLINE_WINDOW_MS;
  session.declinedInvites = session.declinedInvites.filter(
    (timestamp) => timestamp >= windowStart
  );

  // Update decline count
  session.declineCount = session.declinedInvites.length;

  // Check if threshold is met
  const thresholdMet = session.declineCount >= config.DECLINE_THRESHOLD;

  return {
    success: true,
    thresholdMet,
  };
}

/**
 * Check if cooldown threshold is met for a session
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} True if threshold met (should trigger cooldown)
 */
export function checkCooldownThreshold(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return false;
  }

  const config = getCooldownConfig();
  const now = Date.now();

  // Clean up old timestamps first
  const windowStart = now - config.DECLINE_WINDOW_MS;
  session.declinedInvites = (session.declinedInvites || []).filter(
    (timestamp) => timestamp >= windowStart
  );
  session.declineCount = session.declinedInvites.length;

  return session.declineCount >= config.DECLINE_THRESHOLD;
}

/**
 * Trigger cooldown for a session
 * Sets cooldownExpiresAt timestamp based on config duration
 * @param {string} sessionId - Session ID to put in cooldown
 * @returns {Object} { success: boolean, error?: string, cooldownExpiresAt?: number }
 */
export function triggerCooldown(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const config = getCooldownConfig();
  const cooldownExpiresAt = Date.now() + config.COOLDOWN_DURATION_MS;

  session.cooldownExpiresAt = cooldownExpiresAt;

  console.log(`Cooldown triggered for session ${session.handle} (${sessionId}), expires at ${new Date(cooldownExpiresAt).toISOString()}`);
  return {
    success: true,
    cooldownExpiresAt,
  };
}

/**
 * Check if a session is currently in cooldown
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} True if session is in active cooldown
 */
export function isInCooldown(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return false;
  }

  // Check if cooldown is set and hasn't expired
  if (session.cooldownExpiresAt) {
    const now = Date.now();
    if (session.cooldownExpiresAt > now) {
      return true;
    }
    // If expired, clear it
    clearExpiredCooldown(sessionId);
  }

  return false;
}

/**
 * Clear expired cooldown for a session
 * @param {string} sessionId - Session ID to clear
 * @returns {boolean} Success
 */
export function clearExpiredCooldown(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return false;
  }

  const now = Date.now();
  if (session.cooldownExpiresAt && session.cooldownExpiresAt <= now) {
    session.cooldownExpiresAt = null;
    // Optionally reset decline tracking (or keep for analytics)
    // session.declineCount = 0;
    // session.declinedInvites = [];
    return true;
  }

  return false;
}

/**
 * Get remaining cooldown time in milliseconds
 * @param {string} sessionId - Session ID to check
 * @returns {number} Remaining milliseconds until cooldown expires (0 if not in cooldown)
 */
export function getCooldownRemaining(sessionId) {
  const session = getSession(sessionId);
  if (!session || !session.cooldownExpiresAt) {
    return 0;
  }

  const now = Date.now();
  const remaining = session.cooldownExpiresAt - now;

  if (remaining <= 0) {
    clearExpiredCooldown(sessionId);
    return 0;
  }

  return remaining;
}

/**
 * Get decline count within the current window
 * @param {string} sessionId - Session ID to check
 * @returns {number} Number of declines in current window
 */
export function getDeclineCountInWindow(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    return 0;
  }

  const config = getCooldownConfig();
  const now = Date.now();
  const windowStart = now - config.DECLINE_WINDOW_MS;

  // Clean up old timestamps
  session.declinedInvites = (session.declinedInvites || []).filter(
    (timestamp) => timestamp >= windowStart
  );
  session.declineCount = session.declinedInvites.length;

  return session.declineCount;
}

