/**
 * Rate Limiter
 * 
 * Simple in-memory rate limiter for chat messages.
 * Prevents spam by limiting messages per minute per chat.
 */

// Rate limit: max 10 messages per minute per chat
const MAX_MESSAGES_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

// Store message timestamps per chat: chatId -> [timestamps]
const messageTimestamps = new Map();

/**
 * Check if a message can be sent (rate limit check)
 * @param {string} chatId - Chat identifier (e.g., "session1-session2")
 * @returns {Object} { allowed: boolean, remaining?: number, resetAt?: number }
 */
export function checkRateLimit(chatId) {
  const now = Date.now();
  const timestamps = messageTimestamps.get(chatId) || [];

  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);

  // Check if limit exceeded
  if (validTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    // Find oldest timestamp to calculate reset time
    const oldestTimestamp = Math.min(...validTimestamps);
    const resetAt = oldestTimestamp + WINDOW_MS;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Update timestamps
  validTimestamps.push(now);
  messageTimestamps.set(chatId, validTimestamps);

  // Cleanup old entries periodically (every 5 minutes)
  if (Math.random() < 0.01) {
    // 1% chance to cleanup on each check
    cleanupOldEntries();
  }

  return {
    allowed: true,
    remaining: MAX_MESSAGES_PER_MINUTE - validTimestamps.length,
    resetAt: now + WINDOW_MS,
  };
}

/**
 * Clean up old rate limit entries
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [chatId, timestamps] of messageTimestamps.entries()) {
    const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (validTimestamps.length === 0) {
      messageTimestamps.delete(chatId);
    } else {
      messageTimestamps.set(chatId, validTimestamps);
    }
  }
}

/**
 * Clear rate limit for a chat (useful when chat ends)
 * @param {string} chatId - Chat identifier
 */
export function clearRateLimit(chatId) {
  messageTimestamps.delete(chatId);
}

/**
 * Get rate limit stats for a chat
 * @param {string} chatId - Chat identifier
 * @returns {Object} { count: number, limit: number, resetAt?: number }
 */
export function getRateLimitStats(chatId) {
  const now = Date.now();
  const timestamps = messageTimestamps.get(chatId) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);

  const oldestTimestamp = validTimestamps.length > 0 ? Math.min(...validTimestamps) : null;
  const resetAt = oldestTimestamp ? oldestTimestamp + WINDOW_MS : null;

  return {
    count: validTimestamps.length,
    limit: MAX_MESSAGES_PER_MINUTE,
    resetAt,
  };
}

