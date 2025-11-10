import { generateSessionId, generateSessionToken, verifySessionToken } from "../lib/crypto-utils.js";
import { generateUsername } from "../lib/username-generator.js";

// In-memory session store
const sessions = new Map();

// Session TTL: 1 hour (3600000 ms)
const SESSION_TTL = 3600000;

/**
 * Create a new session
 */
export function createSession(data) {
  const { vibe, tags = [], visibility = true, location } = data;

  const sessionId = generateSessionId();
  const token = generateSessionToken(sessionId);

  // Generate handle from vibe + tags
  const handle = generateUsername(vibe, tags);

  const session = {
    sessionId,
    token,
    handle,
    vibe,
    tags,
    visibility,
    location,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
    activeChatPartnerId: null,
    blockedSessionIds: [],
    reportCount: 0,
    safetyFlag: false, // Set to true when panic button used or safety threshold reached
  };

  sessions.set(sessionId, session);

  return { sessionId, token, handle };
}

/**
 * Get session by ID
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  // Check if expired
  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

/**
 * Get session by token
 */
export function getSessionByToken(token) {
  const sessionId = verifySessionToken(token);
  if (!sessionId) {
    return null;
  }

  return getSession(sessionId);
}

/**
 * Update session location
 * @param {string} sessionId - Session ID
 * @param {Object} location - { lat, lng }
 */
export function updateSessionLocation(sessionId, location) {
  const session = getSession(sessionId);
  if (!session) {
    return false;
  }
  
  session.location = location;
  return true;
}

/**
 * Get all active sessions (for Signal Engine / Radar)
 * Returns array of all non-expired sessions
 */
export function getAllSessions() {
  const now = Date.now();
  const activeSessions = [];
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt >= now) {
      activeSessions.push(session);
    }
  }
  return activeSessions;
}

/**
 * Cleanup expired sessions
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredSessions, 60000);
