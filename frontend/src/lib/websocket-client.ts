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
    import.meta.env.VITE_PLAYWRIGHT_WS_MOCK === '1' ||
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
    
    // Connect to mock and get the mock WebSocket object
    const mockWs = mock.connect(sessionId, (message: WebSocketMessage) => {
      // Trigger callbacks when mock sends messages
      if (callbacks.onMessage) {
        callbacks.onMessage(message);
      }
    });
    
    // Create a WebSocket-like object that wraps the mock
    const ws = {
      readyState: 0, // CONNECTING initially
      url: url,
      protocol: '',
      extensions: '',
      binaryType: 'blob' as BinaryType,
      bufferedAmount: 0,
      
      send: (data: string | Blob | ArrayBuffer) => {
        if (typeof data === 'string') {
          // Use the mock WebSocket's send method
          mockWs.send(data);
        }
      },
      
      close: (code?: number, reason?: string) => {
        mockWs.close();
        ws.readyState = 3; // CLOSED
        if (callbacks.onDisconnect) {
          callbacks.onDisconnect();
        }
      },
      
      onopen: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as WebSocket;
    
    // Set up callbacks
    ws.onopen = callbacks.onConnect ? () => {
      ws.readyState = 1; // OPEN
      callbacks.onConnect();
    } : null;
    
    ws.onmessage = callbacks.onMessage ? (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        callbacks.onMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    } : null;
    
    ws.onclose = callbacks.onDisconnect ? () => {
      ws.readyState = 3; // CLOSED
      callbacks.onDisconnect();
    } : null;
    
    ws.onerror = callbacks.onError ? (error: Event) => {
      callbacks.onError(error);
    } : null;
    
    // Simulate connection opening (mock will trigger this via onMessage callback)
    setTimeout(() => {
      ws.readyState = 1; // OPEN
      if (ws.onopen) {
        ws.onopen(new Event('open'));
      }
    }, 10);
    
    return ws;
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
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const apiHost = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, "") || "localhost:8000";
  return `${wsProtocol}//${apiHost}/ws?token=${token}`;
}

