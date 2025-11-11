import { getSessionByToken, getAllSessions, updateSessionLocation, getSession } from "../services/SessionManager.js";
import { broadcastToSession } from "../websocket/server.js";
import { getRadarResults } from "../services/SignalEngine.js";
import { calculateProximityTier as calcProximityTier } from "../lib/proximity-utils.js";
import { requestChat, acceptChat, declineChat, endChat, validateActiveChat, checkProximityAndTerminate } from "../services/ChatManager.js";
import { checkRateLimit, clearRateLimit } from "../lib/rate-limiter.js";
import { triggerPanic } from "../services/PanicManager.js";

/**
 * WebSocket Message Handlers
 * 
 * Handles incoming WebSocket messages from clients.
 * Message format: { type: string, payload?: any }
 */

// Maximum message size: 1MB (prevent DoS via oversized messages)
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

/**
 * Handle radar:subscribe message
 * Client subscribes to radar updates
 */
export function handleRadarSubscribe(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  // Send initial radar update
  sendRadarUpdate(ws, session);
}

/**
 * Handle location:update message
 * Client sends updated location
 * Format: { type: "location:update", payload: { lat: number, lng: number } }
 */
export function handleLocationUpdate(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const { lat, lng } = message.payload || {};
  if (typeof lat !== "number" || typeof lng !== "number") {
    sendError(ws, "Invalid location data");
    return;
  }

  // Update session location in SessionManager
  updateSessionLocation(session.sessionId, { lat, lng });

  // Check proximity for active chat and terminate if too far
  if (session.activeChatPartnerId) {
    checkProximityAndTerminate(session.sessionId, session.activeChatPartnerId);
  }

  // Send updated radar
  sendRadarUpdate(ws, session);
}

/**
 * Handle chat:request message
 * Client requests to start a chat with another session
 * Format: { type: "chat:request", payload: { targetSessionId: string } }
 */
export function handleChatRequest(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const { targetSessionId } = message.payload || {};
  if (!targetSessionId) {
    sendError(ws, "Missing targetSessionId");
    return;
  }

  const result = requestChat(session.sessionId, targetSessionId);
  if (!result.success) {
    // If cooldown error, include cooldown data
    if (result.error === "Cooldown active" && result.cooldownExpiresAt) {
      sendMessage(ws, {
        type: "error",
        payload: {
          code: "cooldown_active",
          message: result.error,
          cooldownExpiresAt: result.cooldownExpiresAt,
          cooldownRemainingMs: result.cooldownRemainingMs,
        },
      });
    } else {
      sendError(ws, result.error || "Failed to request chat", "chat_request_failed");
    }
    return;
  }

  // Success - acknowledgment already sent by requestChat
}

/**
 * Handle chat:accept message
 * Client accepts a chat request
 * Format: { type: "chat:accept", payload: { requesterSessionId: string } }
 */
export function handleChatAccept(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const { requesterSessionId } = message.payload || {};
  if (!requesterSessionId) {
    sendError(ws, "Missing requesterSessionId");
    return;
  }

  const result = acceptChat(session.sessionId, requesterSessionId);
  if (!result.success) {
    sendError(ws, result.error || "Failed to accept chat", "chat_accept_failed");
    return;
  }

  // Success - notifications already sent by acceptChat
}

/**
 * Handle chat:decline message
 * Client declines a chat request
 * Format: { type: "chat:decline", payload: { requesterSessionId: string } }
 */
export function handleChatDecline(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const { requesterSessionId } = message.payload || {};
  if (!requesterSessionId) {
    sendError(ws, "Missing requesterSessionId");
    return;
  }

  const result = declineChat(session.sessionId, requesterSessionId);
  if (!result.success) {
    sendError(ws, result.error || "Failed to decline chat", "chat_decline_failed");
    return;
  }

  // Success - notification already sent by declineChat
}

/**
 * Handle chat:message message
 * Client sends a chat message
 * Format: { type: "chat:message", payload: { text: string, timestamp: number } }
 */
export function handleChatMessage(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const { text, timestamp } = message.payload || {};
  if (!text || typeof text !== "string") {
    sendError(ws, "Missing or invalid message text");
    return;
  }

  // Validate message length (max 1000 characters)
  if (text.length > 1000) {
    sendError(ws, "Message too long", "message_too_long");
    return;
  }

  // Check if session has active chat
  const partnerSessionId = session.activeChatPartnerId;
  if (!partnerSessionId) {
    sendError(ws, "No active chat", "no_active_chat");
    return;
  }

  // Validate active chat exists
  if (!validateActiveChat(session.sessionId, partnerSessionId)) {
    sendError(ws, "Chat partner not found", "chat_partner_not_found");
    return;
  }

  // Check rate limit
  const chatId = [session.sessionId, partnerSessionId].sort().join("-");
  const rateLimitResult = checkRateLimit(chatId);
  if (!rateLimitResult.allowed) {
    sendError(ws, "Rate limit exceeded", "rate_limit_exceeded");
    return;
  }

  // Get partner session
  const partnerSession = getSession(partnerSessionId);
  if (!partnerSession) {
    sendError(ws, "Chat partner not found", "chat_partner_not_found");
    return;
  }

  // Relay message to partner
  broadcastToSession(partnerSessionId, {
    type: "chat:message",
    payload: {
      text,
      timestamp: timestamp || Date.now(),
      sender: "them",
    },
  });

  // Echo back to sender (confirmation)
  sendMessage(ws, {
    type: "chat:message",
    payload: {
      text,
      timestamp: timestamp || Date.now(),
      sender: "me",
    },
  });
}

/**
 * Handle chat:end message
 * Client ends the current chat
 * Format: { type: "chat:end" }
 */
export function handleChatEnd(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const partnerSessionId = session.activeChatPartnerId;
  if (!partnerSessionId) {
    sendError(ws, "No active chat", "no_active_chat");
    return;
  }

  // Clear rate limit for this chat
  const chatId = [session.sessionId, partnerSessionId].sort().join("-");
  clearRateLimit(chatId);

  const result = endChat(session.sessionId, partnerSessionId, "user_exit");
  if (!result.success) {
    sendError(ws, result.error || "Failed to end chat", "chat_end_failed");
    return;
  }

  // Success - notifications already sent by endChat
}

/**
 * Handle panic:trigger message
 * Client triggers panic button
 * Format: { type: "panic:trigger" }
 */
export function handlePanicTrigger(ws, session, message) {
  if (!session) {
    sendError(ws, "Invalid session");
    return;
  }

  const result = triggerPanic(session.sessionId);
  if (!result.success) {
    sendError(ws, result.error || "Failed to trigger panic", "panic_failed");
    return;
  }

  // Success - notification already sent by triggerPanic
  sendMessage(ws, {
    type: "panic:triggered",
    payload: {
      exclusionExpiresAt: result.exclusionExpiresAt,
      message: "Session ended. You're safe.",
    },
  });
}

/**
 * Send radar update to client
 * Calculates compatibility scores and sends sorted list
 */
function sendRadarUpdate(ws, session) {
  const allSessions = getAllSessions();
  const radarResults = getRadarResults(session, allSessions);

  // Format results for client (exclude sensitive data)
  const people = radarResults.map(({ session: targetSession, score }) => ({
    sessionId: targetSession.sessionId,
    handle: targetSession.handle,
    vibe: targetSession.vibe,
    tags: targetSession.tags,
    signal: score,
    proximity: calculateProximityTier(session.location, targetSession.location),
  }));

  sendMessage(ws, {
    type: "radar:update",
    payload: {
      people,
      timestamp: Date.now(),
    },
  });
}

/**
 * Calculate proximity tier between two locations
 */
function calculateProximityTier(loc1, loc2) {
  if (!loc1 || !loc2) {
    return null;
  }
  
  return calcProximityTier(loc1, loc2);
}

/**
 * Send error message to client
 */
export function sendError(ws, message, code = "error") {
  sendMessage(ws, {
    type: "error",
    payload: {
      code,
      message,
    },
  });
}

/**
 * Send message to client
 */
export function sendMessage(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Send ping message (heartbeat)
 */
export function sendPing(ws) {
  if (ws.readyState === ws.OPEN) {
    ws.ping();
  }
}

/**
 * Handle incoming message from client
 * Routes message to appropriate handler
 */
export function handleMessage(ws, session, rawMessage) {
  // Check message size (prevent DoS)
  if (rawMessage.length > MAX_MESSAGE_SIZE) {
    sendError(ws, "Message too large", "message_too_large");
    return;
  }

  try {
    const message = JSON.parse(rawMessage);

    if (!message.type) {
      sendError(ws, "Missing message type");
      return;
    }

    switch (message.type) {
      case "radar:subscribe":
        handleRadarSubscribe(ws, session, message);
        break;
      case "location:update":
        handleLocationUpdate(ws, session, message);
        break;
      case "chat:request":
        handleChatRequest(ws, session, message);
        break;
      case "chat:accept":
        handleChatAccept(ws, session, message);
        break;
      case "chat:decline":
        handleChatDecline(ws, session, message);
        break;
      case "chat:message":
        handleChatMessage(ws, session, message);
        break;
      case "chat:end":
        handleChatEnd(ws, session, message);
        break;
      case "panic:trigger":
        handlePanicTrigger(ws, session, message);
        break;
      default:
        sendError(ws, `Unknown message type: ${message.type}`);
    }
  } catch (error) {
    sendError(ws, "Invalid message format");
  }
}

