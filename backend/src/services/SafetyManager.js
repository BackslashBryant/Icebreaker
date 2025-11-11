import { getSession } from "./SessionManager.js";
import { endChat } from "./ChatManager.js";
import { addReport, getUniqueReporterCount, hasReported } from "./ReportManager.js";
import { updateSessionSafetyFlag, setPanicExclusion } from "./SessionManager.js";

/**
 * Block a user (add to blockedSessionIds)
 * @param {string} requesterSessionId - Session ID of requester
 * @param {string} targetSessionId - Session ID of target to block
 * @returns {Object} { success: boolean, error?: string }
 */
export function blockSession(requesterSessionId, targetSessionId) {
  // Validate requester session
  const requesterSession = getSession(requesterSessionId);
  if (!requesterSession) {
    return { success: false, error: "Requester session not found" };
  }

  // Validate target session
  const targetSession = getSession(targetSessionId);
  if (!targetSession) {
    return { success: false, error: "Target session not found" };
  }

  // Prevent blocking yourself
  if (requesterSessionId === targetSessionId) {
    return { success: false, error: "Cannot block yourself" };
  }

  // Check if already blocked
  if (requesterSession.blockedSessionIds.includes(targetSessionId)) {
    return { success: false, error: "User already blocked" };
  }

  // Add to blocked list
  requesterSession.blockedSessionIds.push(targetSessionId);

  // End active chat if target is current chat partner
  if (requesterSession.activeChatPartnerId === targetSessionId) {
    endChat(requesterSessionId, targetSessionId, "user_blocked");
  }

  return { success: true };
}

/**
 * Report a user (increment reportCount, store report metadata)
 * @param {string} requesterSessionId - Session ID of requester
 * @param {string} targetSessionId - Session ID of target to report
 * @param {string} category - Report category ('harassment' | 'spam' | 'impersonation' | 'other')
 * @returns {Object} { success: boolean, error?: string }
 */
export function reportSession(requesterSessionId, targetSessionId, category) {
  // Validate requester session
  const requesterSession = getSession(requesterSessionId);
  if (!requesterSession) {
    return { success: false, error: "Requester session not found" };
  }

  // Validate target session
  const targetSession = getSession(targetSessionId);
  if (!targetSession) {
    return { success: false, error: "Target session not found" };
  }

  // Prevent reporting yourself
  if (requesterSessionId === targetSessionId) {
    return { success: false, error: "Cannot report yourself" };
  }

  // Check if already reported by this requester (prevent duplicate reports)
  if (hasReported(requesterSessionId, targetSessionId)) {
    return { success: false, error: "Already reported this user" };
  }

  // Store report metadata
  addReport(requesterSessionId, targetSessionId, category);

  // Increment report count
  targetSession.reportCount = (targetSession.reportCount || 0) + 1;

  // Check if safety exclusion should be triggered (≥3 unique reporters)
  const uniqueReporterCount = getUniqueReporterCount(targetSessionId);
  const SAFETY_EXCLUSION_THRESHOLD = 3;
  const SAFETY_EXCLUSION_DURATION = 3600000; // 1 hour in milliseconds

  if (uniqueReporterCount >= SAFETY_EXCLUSION_THRESHOLD) {
    // Set safety flag and exclusion expiration
    updateSessionSafetyFlag(targetSessionId, true);
    setPanicExclusion(targetSessionId, Date.now() + SAFETY_EXCLUSION_DURATION);
  }

  return { success: true };
}

