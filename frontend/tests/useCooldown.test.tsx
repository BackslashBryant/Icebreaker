import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCooldown } from "@/hooks/useCooldown";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSession } from "@/hooks/useSession";
import { WebSocketMessage } from "@/lib/websocket-client";

// Mock dependencies
vi.mock("@/hooks/useWebSocket");
vi.mock("@/hooks/useSession");

const mockUseWebSocket = vi.mocked(useWebSocket);
const mockUseSession = vi.mocked(useSession);

describe("useCooldown", () => {
  let mockOnMessage: ((message: WebSocketMessage) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSession.mockReturnValue({
      session: { token: "test-token", sessionId: "test-session" },
    } as any);

    mockUseWebSocket.mockImplementation((options) => {
      mockOnMessage = options.onMessage;
      return {
        isConnected: true,
        status: "connected",
        send: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as any;
    });
  });

  it("initializes with no cooldown", () => {
    const { result } = renderHook(() => useCooldown());

    expect(result.current.isInCooldown).toBe(false);
    expect(result.current.cooldownExpiresAt).toBeNull();
    expect(result.current.cooldownRemainingMs).toBe(0);
    expect(result.current.cooldownRemainingFormatted).toBeNull();
  });

  it("sets cooldown state when cooldown_active error received", async () => {
    const { result } = renderHook(() => useCooldown());

    const cooldownExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes from now
    const cooldownRemainingMs = 30 * 60 * 1000;

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "cooldown_active",
            message: "Cooldown active",
            cooldownExpiresAt,
            cooldownRemainingMs,
          },
        });
      }
    });

    await waitFor(() => {
      expect(result.current.isInCooldown).toBe(true);
      expect(result.current.cooldownExpiresAt).toBe(cooldownExpiresAt);
      // Allow small timing difference (hook recalculates based on Date.now())
      expect(result.current.cooldownRemainingMs).toBeGreaterThan(cooldownRemainingMs - 100);
      expect(result.current.cooldownRemainingMs).toBeLessThanOrEqual(cooldownRemainingMs);
    });
  });

  it("formats cooldown remaining time correctly (minutes)", async () => {
    const { result } = renderHook(() => useCooldown());

    const cooldownExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const cooldownRemainingMs = 15 * 60 * 1000;

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "cooldown_active",
            message: "Cooldown active",
            cooldownExpiresAt,
            cooldownRemainingMs,
          },
        });
      }
    });

    await waitFor(() => {
      expect(result.current.cooldownRemainingFormatted).toBe("15 minutes");
    });
  });

  it("formats cooldown remaining time correctly (single minute)", async () => {
    const { result } = renderHook(() => useCooldown());

    const cooldownExpiresAt = Date.now() + 60 * 1000; // 1 minute
    const cooldownRemainingMs = 60 * 1000;

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "cooldown_active",
            message: "Cooldown active",
            cooldownExpiresAt,
            cooldownRemainingMs,
          },
        });
      }
    });

    await waitFor(() => {
      // Hook recalculates based on Date.now(), so it may show "59 seconds" if a few ms passed
      const formatted = result.current.cooldownRemainingFormatted;
      expect(formatted === "1 minute" || formatted === "59 seconds").toBe(true);
    });
  });

  it("formats cooldown remaining time correctly (seconds)", async () => {
    const { result } = renderHook(() => useCooldown());

    const cooldownExpiresAt = Date.now() + 30 * 1000; // 30 seconds
    const cooldownRemainingMs = 30 * 1000;

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "cooldown_active",
            message: "Cooldown active",
            cooldownExpiresAt,
            cooldownRemainingMs,
          },
        });
      }
    });

    await waitFor(() => {
      // Hook recalculates based on Date.now(), so allow small timing difference
      const formatted = result.current.cooldownRemainingFormatted;
      expect(formatted).toMatch(/^(29|30) seconds$/);
    });
  });

  it("ignores non-cooldown error messages", () => {
    const { result } = renderHook(() => useCooldown());

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "chat_request_failed",
            message: "Failed to request chat",
          },
        });
      }
    });

    expect(result.current.isInCooldown).toBe(false);
    expect(result.current.cooldownExpiresAt).toBeNull();
  });

  it("clears cooldown when expiration time is in the past", async () => {
    const { result } = renderHook(() => useCooldown());

    const cooldownExpiresAt = Date.now() - 1000; // Already expired
    const cooldownRemainingMs = 0;

    act(() => {
      if (mockOnMessage) {
        mockOnMessage({
          type: "error",
          payload: {
            code: "cooldown_active",
            message: "Cooldown active",
            cooldownExpiresAt,
            cooldownRemainingMs,
          },
        });
      }
    });

    await waitFor(() => {
      // Should not be in cooldown if expiration is in the past
      expect(result.current.isInCooldown).toBe(false);
    });
  });
});
