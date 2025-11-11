import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRadar } from "@/hooks/useRadar";
import { useSession } from "@/hooks/useSession";
import { useWebSocket } from "@/hooks/useWebSocket";

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

// Mock useWebSocket
const mockSend = vi.fn();
vi.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: vi.fn((options) => {
    // Call onConnect callback immediately
    setTimeout(() => {
      options.onConnect?.();
    }, 10);
    
    return {
      status: "connected",
      send: mockSend,
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: true,
    };
  }),
}));

describe("useRadar Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends location update when location changes", async () => {
    const { result } = renderHook(() => useRadar());

    // Wait for WebSocket connection (may take a moment)
    await waitFor(
      () => {
        expect(result.current.isConnected).toBe(true);
      },
      { timeout: 2000 }
    );

    // Update location
    const newLocation = { lat: 37.7749, lng: -122.4194 };
    act(() => {
      result.current.updateLocation(newLocation);
    });

    // Location should be set (will be sent via WebSocket when connected)
    await waitFor(() => {
      expect(result.current.location).toEqual(newLocation);
      // Verify send was called with location update
      expect(mockSend).toHaveBeenCalledWith({
        type: "location:update",
        payload: {
          lat: newLocation.lat,
          lng: newLocation.lng,
        },
      });
    });
  });

  it("updates location state when updateLocation is called", () => {
    const { result } = renderHook(() => useRadar());

    const newLocation = { lat: 37.7749, lng: -122.4194 };
    act(() => {
      result.current.updateLocation(newLocation);
    });

    // Location should be updated (will be sent via WebSocket when connected)
    expect(result.current.location).toEqual(newLocation);
  });

  it("provides location update function for external use", () => {
    const { result } = renderHook(() => useRadar());

    expect(typeof result.current.updateLocation).toBe("function");

    const location = { lat: 40.7128, lng: -74.006 };
    act(() => {
      result.current.updateLocation(location);
    });
    expect(result.current.location).toEqual(location);
  });
});

