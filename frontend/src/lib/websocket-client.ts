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
  // Check if WebSocket mock is enabled for Playwright tests
  const useMock =
    (import.meta.env as any).VITE_PLAYWRIGHT_WS_MOCK === '1' ||
    (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_WS_MOCK__ === '1');

  if (useMock && typeof window !== 'undefined' && (window as any).__WS_MOCK__) {
    // Use mock WebSocket for testing
    const mock = (window as any).__WS_MOCK__;

    // Extract token from URL
    const token = new URL(url).searchParams.get('token') || '';

    // Get sessionId from sessionStorage (tests set this up)
    let sessionId = token;
    try {
      const sessionStr = sessionStorage.getItem('icebreaker_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        sessionId = session.sessionId || token;
      }
    } catch (e) {
      // Fall back to using token as sessionId
      sessionId = token || 'test-session';
    }

    // Performance instrumentation: Mark connection start
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('websocket-connect-start');
    }

    // Connect to mock and get the mock WebSocket object directly
    // CRITICAL: Don't wrap it - mutate the returned object so the mock's setTimeout
    // closure references the same object we're assigning handlers to
    let connectionEstablished = false;

    const ws = mock.connect(sessionId, (message: WebSocketMessage) => {
      // When mock sends "connected" message, trigger onConnect callback immediately
      // This is a fallback in case ws.onopen() wasn't called by the mock
      if (message.type === 'connected' && callbacks.onConnect && !connectionEstablished) {
        connectionEstablished = true;
        if (ws.readyState !== 1) {
          ws.readyState = 1; // OPEN
        }
        // Performance instrumentation: Mark connection end
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark('websocket-connect-end');
          try {
            performance.measure('websocket-connect', 'websocket-connect-start', 'websocket-connect-end');
          } catch (e) {
            // Ignore errors if marks don't exist
          }
        }
        callbacks.onConnect();
      }
      // Trigger callbacks when mock sends messages
      if (callbacks.onMessage) {
        callbacks.onMessage(message);
      }
    }) as any;

    // Mutate the mock's ws object directly to assign our handlers
    // The mock's setTimeout (line 67-77 in ws-mock.setup.ts) checks ws.onopen and calls it
    // Since we're mutating the same object the mock returns, the setTimeout will see our handler

    // If mock already set readyState to OPEN, fire handler immediately
    // This prevents race condition where setTimeout fires before handler assignment
    if (ws.readyState === 1) {
      const immediateHandler = () => {
        if (!connectionEstablished) {
          connectionEstablished = true;
          ws.readyState = 1; // OPEN
          // Performance instrumentation: Mark connection end
          if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark('websocket-connect-end');
            try {
              performance.measure('websocket-connect', 'websocket-connect-start', 'websocket-connect-end');
            } catch (e) {
              // Ignore errors if marks don't exist
            }
          }
          callbacks.onConnect?.();
        }
      };
      immediateHandler();
    }

    ws.onopen = () => {
      if (!connectionEstablished) {
        connectionEstablished = true;
        ws.readyState = 1; // OPEN
        // Performance instrumentation: Mark connection end
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark('websocket-connect-end');
          try {
            performance.measure('websocket-connect', 'websocket-connect-start', 'websocket-connect-end');
          } catch (e) {
            // Ignore errors if marks don't exist
          }
        }
        callbacks.onConnect?.();
      }
    };

    ws.onclose = () => {
      ws.readyState = 3; // CLOSED
      callbacks.onDisconnect?.();
    };

    ws.onerror = (error: Event) => {
      callbacks.onError?.(error);
    };

    // Ensure send and close methods exist (they should from the mock, but polyfill if needed)
    if (!ws.send) {
      ws.send = () => {};
    }
    if (!ws.close) {
      ws.close = () => {
        ws.readyState = 3; // CLOSED
        callbacks.onDisconnect?.();
      };
    }

    // Add WebSocket-like properties for compatibility
    if (!ws.url) ws.url = url;
    if (!ws.protocol) ws.protocol = '';
    if (!ws.extensions) ws.extensions = '';
    if (!ws.binaryType) ws.binaryType = 'blob' as BinaryType;
    if (ws.bufferedAmount === undefined) ws.bufferedAmount = 0;
    if (!ws.addEventListener) ws.addEventListener = () => {};
    if (!ws.removeEventListener) ws.removeEventListener = () => {};
    if (!ws.dispatchEvent) ws.dispatchEvent = () => true;

    // The mock's setTimeout (10ms delay) will trigger ws.onopen(), which calls callbacks.onConnect()
    // This assignment happens synchronously, so it's guaranteed to be set before the setTimeout fires
    // If the mock's onopen isn't called, the fallback in messageHandler will trigger onConnect when "connected" message arrives

    return ws as WebSocket;
  }

  // Use real WebSocket
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
  const apiUrl = import.meta.env.VITE_API_URL || "";
  
  // If VITE_API_URL is set, use it (convert http/https to ws/wss)
  if (apiUrl) {
    const wsUrl = apiUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
    return `${wsUrl}/ws?token=${token}`;
  }
  
  // Fallback: use same origin as frontend
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${wsProtocol}//${host}/ws?token=${token}`;
}

