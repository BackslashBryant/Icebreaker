/**
 * Shared Interface for WebSocket Mock Contract
 * 
 * Defines the contract between the WebSocket mock (tests/mocks/websocket-mock.ts)
 * and the WebSocket shim (frontend/src/lib/websocket-client.ts).
 * 
 * This ensures type safety and prevents contract breaks when either side changes.
 */

export type WebSocketMessage = {
  type: string;
  payload?: any;
};

export type MockWebSocket = {
  readyState: number;
  send: (message: string) => void;
  close: () => void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((error: Event) => void) | null;
};

/**
 * Interface that both WsMock (Node.js) and BrowserWsMock (browser) must implement
 */
export interface WsMockInterface {
  /**
   * Create a mock WebSocket connection
   * @param sessionId - Session identifier
   * @param onMessage - Callback for incoming messages
   * @returns Mock WebSocket object
   */
  connect(sessionId: string, onMessage: (msg: WebSocketMessage) => void): MockWebSocket;

  /**
   * Disconnect a session
   * @param sessionId - Session identifier to disconnect
   */
  disconnect(sessionId: string): void;

  /**
   * Reset all mock state (connections, chats, timers)
   * Called during test teardown to prevent state leakage
   */
  reset(): void;

  /**
   * Set visibility for a persona
   * @param sessionId - Session identifier
   * @param visible - Visibility state
   */
  setVisibility(sessionId: string, visible: boolean): void;

  /**
   * Update geolocation for a persona
   * @param sessionId - Session identifier
   * @param lat - Latitude
   * @param lon - Longitude
   * @param floor - Optional floor number
   */
  updateGeo(sessionId: string, lat: number, lon: number, floor?: number): void;
}

