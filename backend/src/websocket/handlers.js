import { getSessionByToken, getAllSessions, updateSessionLocation } from "../services/SessionManager.js";
import { getRadarResults } from "../services/SignalEngine.js";
import { calculateProximityTier as calcProximityTier } from "../lib/proximity-utils.js";

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

  // TODO: Implement chat request logic (Issue #3)
  // For now, acknowledge the request
  sendMessage(ws, {
    type: "chat:request:ack",
    payload: {
      targetSessionId,
      status: "pending",
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
      default:
        sendError(ws, `Unknown message type: ${message.type}`);
    }
  } catch (error) {
    sendError(ws, "Invalid message format");
  }
}

