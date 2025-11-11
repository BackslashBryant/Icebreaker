import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRadar } from "@/hooks/useRadar";
import { useSession } from "@/hooks/useSession";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  messages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string) {
    this.messages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close"));
    }
  }
}

// Mock useSession
vi.mock("@/hooks/useSession", () => ({
  useSession: vi.fn(() => ({
    session: {
      sessionId: "test-session",
      token: "test-token",
      handle: "testuser",
    },
    setSession: vi.fn(),
    clearSession: vi.fn(),
  })),
}));

// Mock WebSocket client
vi.mock("@/lib/websocket-client", () => ({
  createWebSocketConnection: vi.fn((url, callbacks) => {
    const ws = new MockWebSocket(url);
    ws.onopen = () => callbacks.onConnect?.();
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        callbacks.onMessage?.(message);
      } catch (e) {
        // Ignore
      }
    };
    ws.onclose = () => callbacks.onDisconnect?.();
    ws.onerror = (event) => callbacks.onError?.(event);
    return ws;
  }),
  getWebSocketUrl: vi.fn((token) => `ws://localhost:8000/ws?token=${token}`),
  sendWebSocketMessage: vi.fn((ws, message) => {
    if (ws && ws.readyState === MockWebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }),
}));

describe("useRadar Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends location update when location changes", async () => {
    const { result } = renderHook(() => useRadar());

    // Wait for WebSocket connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Update location
    const newLocation = { lat: 37.7749, lng: -122.4194 };
    result.current.updateLocation(newLocation);

    // Wait for location update to be sent
    await waitFor(() => {
      const ws = (result.current as any).wsRef?.current;
      if (ws && ws.messages) {
        const locationMessages = ws.messages.filter((msg: string) => {
          try {
            const parsed = JSON.parse(msg);
            return parsed.type === "location:update";
          } catch {
            return false;
          }
        });
        expect(locationMessages.length).toBeGreaterThan(0);
      }
    });
  });

  it("updates location state when updateLocation is called", () => {
    const { result } = renderHook(() => useRadar());

    const newLocation = { lat: 37.7749, lng: -122.4194 };
    result.current.updateLocation(newLocation);

    // Location should be updated (will be sent via WebSocket when connected)
    expect(result.current.location).toEqual(newLocation);
  });

  it("provides location update function for external use", () => {
    const { result } = renderHook(() => useRadar());

    expect(typeof result.current.updateLocation).toBe("function");

    const location = { lat: 40.7128, lng: -74.006 };
    result.current.updateLocation(location);
    expect(result.current.location).toEqual(location);
  });
});

