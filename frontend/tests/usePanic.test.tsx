import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePanic } from "@/hooks/usePanic";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import { WebSocketMessage } from "@/lib/websocket-client";

// Mock dependencies
vi.mock("@/hooks/useWebSocket");
vi.mock("@/hooks/useSession");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockUseWebSocket = vi.mocked(useWebSocket);
const mockUseSession = vi.mocked(useSession);

describe("usePanic", () => {
  let mockSend: ReturnType<typeof vi.fn>;
  let mockOnMessage: ((message: WebSocketMessage) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend = vi.fn();
    
    mockUseSession.mockReturnValue({
      session: { token: "test-token", sessionId: "test-session" },
    } as any);

    mockUseWebSocket.mockImplementation((options) => {
      mockOnMessage = options.onMessage;
      return {
        send: mockSend,
        isConnected: true,
        status: "connected",
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as any;
    });
  });

  it("initializes with closed dialog and no success state", () => {
    const { result } = renderHook(() => usePanic());

    expect(result.current.showDialog).toBe(false);
    expect(result.current.showSuccess).toBe(false);
    expect(result.current.exclusionExpiresAt).toBeUndefined();
  });

  it("opens dialog when triggerPanic is called", () => {
    const { result } = renderHook(() => usePanic());

    act(() => {
      result.current.triggerPanic();
    });

    expect(result.current.showDialog).toBe(true);
  });

  it("shows error toast when triggerPanic called without session", () => {
    mockUseSession.mockReturnValue({
      session: null,
    } as any);

    mockUseWebSocket.mockReturnValue({
      send: vi.fn(),
      isConnected: false,
      status: "disconnected",
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePanic());

    act(() => {
      result.current.triggerPanic();
    });

    expect(toast.error).toHaveBeenCalledWith("Not connected. Please try again.");
    expect(result.current.showDialog).toBe(false);
  });

  it("sends panic:trigger message when confirmPanic is called", () => {
    const { result } = renderHook(() => usePanic());

    act(() => {
      result.current.triggerPanic();
      result.current.confirmPanic();
    });

    expect(mockSend).toHaveBeenCalledWith({
      type: "panic:trigger",
    });
  });

  it("handles panic:triggered WebSocket message", async () => {
    const { result } = renderHook(() => usePanic());

    const exclusionExpiresAt = Date.now() + 3600000;

    // Simulate WebSocket message
    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "panic:triggered",
          payload: { exclusionExpiresAt },
        });
      }
    });

    await waitFor(() => {
      expect(result.current.showDialog).toBe(false);
      expect(result.current.showSuccess).toBe(true);
      expect(result.current.exclusionExpiresAt).toBe(exclusionExpiresAt);
    });
  });

  it("closes dialog when closeDialog is called", () => {
    const { result } = renderHook(() => usePanic());

    act(() => {
      result.current.triggerPanic();
    });
    expect(result.current.showDialog).toBe(true);

    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.showDialog).toBe(false);
  });

  it("calls onPanicTriggered callback when panic is triggered", async () => {
    const onPanicTriggered = vi.fn();
    const { result } = renderHook(() => usePanic({ onPanicTriggered }));

    const exclusionExpiresAt = Date.now() + 3600000;

    // Simulate WebSocket message
    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "panic:triggered",
          payload: { exclusionExpiresAt },
        });
      }
    });

    await waitFor(() => {
      expect(onPanicTriggered).toHaveBeenCalledWith(exclusionExpiresAt);
    });
  });

  it("does not handle non-panic WebSocket messages", () => {
    const { result } = renderHook(() => usePanic());

    const initialDialogState = result.current.showDialog;
    const initialSuccessState = result.current.showSuccess;

    // Simulate non-panic WebSocket message
    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "radar:update",
          payload: { people: [] },
        });
      }
    });

    expect(result.current.showDialog).toBe(initialDialogState);
    expect(result.current.showSuccess).toBe(initialSuccessState);
  });

  it("shows error toast when confirmPanic called without connection", () => {
    mockUseWebSocket.mockReturnValue({
      send: vi.fn(),
      isConnected: false,
      status: "disconnected",
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePanic());

    act(() => {
      result.current.triggerPanic();
      result.current.confirmPanic();
    });

    expect(toast.error).toHaveBeenCalledWith("Not connected. Please try again.");
    expect(result.current.showDialog).toBe(false);
  });
});
