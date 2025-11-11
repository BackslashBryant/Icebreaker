/**
 * WebSocket Client Utilities
 * 
 * Low-level WebSocket connection management for Radar View.
 */

export type WebSocketMessage = {
  type: string;
  payload?: any;
};

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketCallbacks {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Create WebSocket connection
 * @param url - WebSocket URL with token query parameter
 * @param callbacks - Event callbacks
 * @returns WebSocket instance
 */
export function createWebSocketConnection(
  url: string,
  callbacks: WebSocketCallbacks = {}
): WebSocket {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    callbacks.onConnect?.();
  };

  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      callbacks.onMessage?.(message);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    callbacks.onDisconnect?.();
  };

  ws.onerror = (error) => {
    callbacks.onError?.(error);
  };

  return ws;
}

/**
 * Send message via WebSocket
 */
export function sendWebSocketMessage(ws: WebSocket | null, message: WebSocketMessage): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket is not open, cannot send message");
  }
}

/**
 * Get WebSocket URL for API endpoint
 */
export function getWebSocketUrl(token: string): string {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const apiHost = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, "") || "localhost:8000";
  return `${wsProtocol}//${apiHost}/ws?token=${token}`;
}

