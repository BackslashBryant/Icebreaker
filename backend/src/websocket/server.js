import { WebSocketServer } from "ws";
import { getSessionByToken } from "../services/SessionManager.js";
import { handleMessage, sendPing, sendError } from "./handlers.js";

/**
 * WebSocket Server
 * 
 * Handles WebSocket connections for real-time radar updates.
 * Connection URL: wss://api.icebreaker.app/ws?token=<sessionToken>
 */

let wss = null;
const connections = new Map(); // sessionId -> Set of WebSocket connections

// Maximum connections per session (prevent connection exhaustion)
const MAX_CONNECTIONS_PER_SESSION = 5;

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
export function initializeWebSocketServer(server) {
  wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws, request) => {
    // Extract token from query string
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Missing token");
      return;
    }

    // Validate session token
    const session = getSessionByToken(token);
    if (!session) {
      ws.close(1008, "Invalid token");
      return;
    }

    // Check connection limit per session
    const sessionConnections = connections.get(session.sessionId) || new Set();
    if (sessionConnections.size >= MAX_CONNECTIONS_PER_SESSION) {
      ws.close(1008, "Connection limit exceeded");
      return;
    }

    // Store connection
    if (!connections.has(session.sessionId)) {
      connections.set(session.sessionId, new Set());
    }
    connections.get(session.sessionId).add(ws);

    // Store session on WebSocket for easy access
    ws.session = session;

    console.log(`WebSocket connected: ${session.sessionId} (${connections.get(session.sessionId).size} connections)`);

    // Handle incoming messages
    ws.on("message", (data) => {
      handleMessage(ws, session, data.toString());
    });

    // Handle pong (response to ping)
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Handle close
    ws.on("close", () => {
      removeConnection(session.sessionId, ws);
      console.log(`WebSocket disconnected: ${session.sessionId}`);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for ${session.sessionId}:`, error);
      removeConnection(session.sessionId, ws);
    });

    // Set initial alive state
    ws.isAlive = true;

    // Send welcome message
    sendMessage(ws, {
      type: "connected",
      payload: {
        sessionId: session.sessionId,
        handle: session.handle,
      },
    });
  });

  // Heartbeat: Ping all connections every 30 seconds
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Connection didn't respond to ping, close it
        if (ws.session) {
          removeConnection(ws.session.sessionId, ws);
        }
        return ws.terminate();
      }

      ws.isAlive = false;
      sendPing(ws);
    });
  }, 30000);

  // Cleanup on server close
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  console.log("WebSocket server initialized on /ws");
}

/**
 * Remove connection from tracking
 */
function removeConnection(sessionId, ws) {
  if (connections.has(sessionId)) {
    connections.get(sessionId).delete(ws);
    if (connections.get(sessionId).size === 0) {
      connections.delete(sessionId);
    }
  }
}

/**
 * Send message to all connections for a session
 */
export function broadcastToSession(sessionId, message) {
  if (connections.has(sessionId)) {
    const messageStr = JSON.stringify(message);
    connections.get(sessionId).forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

/**
 * Send message to a specific WebSocket
 */
function sendMessage(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer() {
  return wss;
}

/**
 * Get number of active connections
 */
export function getConnectionCount() {
  return connections.size;
}

