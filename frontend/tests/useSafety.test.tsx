import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSafety } from "@/hooks/useSafety";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/hooks/useSession");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockUseSession = vi.mocked(useSession);
const mockToast = vi.mocked(toast);

// Mock fetch globally
global.fetch = vi.fn();

describe("useSafety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      session: { token: "test-token", sessionId: "test-session" },
    } as any);
  });

  it("initializes with loading states false", () => {
    const { result } = renderHook(() => useSafety());
    expect(result.current.isBlocking).toBe(false);
    expect(result.current.isReporting).toBe(false);
  });

  describe("blockUser", () => {
    it("successfully blocks a user", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useSafety());

      let blockResult: any;
      await act(async () => {
        blockResult = await result.current.blockUser("target-session");
      });

      await waitFor(() => {
        expect(blockResult.success).toBe(true);
        expect(mockToast.success).toHaveBeenCalledWith("User blocked");
        expect(global.fetch).toHaveBeenCalledWith("/api/safety/block", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ targetSessionId: "target-session" }),
        });
      });
    });

    it("shows error toast when block fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "User already blocked" } }),
      });

      const { result } = renderHook(() => useSafety());

      let blockResult: any;
      await act(async () => {
        blockResult = await result.current.blockUser("target-session");
      });

      await waitFor(() => {
        expect(blockResult.success).toBe(false);
        expect(mockToast.error).toHaveBeenCalledWith("User already blocked");
      });
    });

    it("shows error toast when not authenticated", async () => {
      mockUseSession.mockReturnValue({
        session: null,
      } as any);

      const { result } = renderHook(() => useSafety());

      let blockResult: any;
      await act(async () => {
        blockResult = await result.current.blockUser("target-session");
      });

      expect(blockResult.success).toBe(false);
      expect(mockToast.error).toHaveBeenCalledWith("Not authenticated. Please try again.");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useSafety());

      let blockResult: any;
      await act(async () => {
        blockResult = await result.current.blockUser("target-session");
      });

      await waitFor(() => {
        expect(blockResult.success).toBe(false);
        expect(mockToast.error).toHaveBeenCalledWith("Failed to block user. Please try again.");
      });
    });

    it("sets isBlocking state during request", async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as any).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useSafety());

      act(() => {
        result.current.blockUser("target-session");
      });

      await waitFor(() => {
        expect(result.current.isBlocking).toBe(true);
      });

      await act(async () => {
        resolveFetch!({
          ok: true,
          json: async () => ({ success: true }),
        });
        await fetchPromise;
      });

      await waitFor(() => {
        expect(result.current.isBlocking).toBe(false);
      });
    });
  });

  describe("reportUser", () => {
    it("successfully reports a user", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useSafety());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.reportUser("target-session", "harassment");
      });

      await waitFor(() => {
        expect(reportResult.success).toBe(true);
        expect(mockToast.success).toHaveBeenCalledWith("Report submitted. Thank you.");
        expect(global.fetch).toHaveBeenCalledWith("/api/safety/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ targetSessionId: "target-session", category: "harassment" }),
        });
      });
    });

    it("supports all report categories", async () => {
      const categories = ["harassment", "spam", "impersonation", "other"] as const;

      for (const category of categories) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        const { result } = renderHook(() => useSafety());

        await act(async () => {
          await result.current.reportUser("target-session", category);
        });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith("/api/safety/report", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify({ targetSessionId: "target-session", category }),
          });
        });

        vi.clearAllMocks();
      }
    });

    it("shows error toast when report fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "Already reported this user" } }),
      });

      const { result } = renderHook(() => useSafety());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.reportUser("target-session", "spam");
      });

      await waitFor(() => {
        expect(reportResult.success).toBe(false);
        expect(mockToast.error).toHaveBeenCalledWith("Already reported this user");
      });
    });

    it("shows error toast when not authenticated", async () => {
      mockUseSession.mockReturnValue({
        session: null,
      } as any);

      const { result } = renderHook(() => useSafety());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.reportUser("target-session", "harassment");
      });

      expect(reportResult.success).toBe(false);
      expect(mockToast.error).toHaveBeenCalledWith("Not authenticated. Please try again.");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useSafety());

      let reportResult: any;
      await act(async () => {
        reportResult = await result.current.reportUser("target-session", "harassment");
      });

      await waitFor(() => {
        expect(reportResult.success).toBe(false);
        expect(mockToast.error).toHaveBeenCalledWith("Failed to report user. Please try again.");
      });
    });

    it("sets isReporting state during request", async () => {
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as any).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useSafety());

      act(() => {
        result.current.reportUser("target-session", "harassment");
      });

      await waitFor(() => {
        expect(result.current.isReporting).toBe(true);
      });

      await act(async () => {
        resolveFetch!({
          ok: true,
          json: async () => ({ success: true }),
        });
        await fetchPromise;
      });

      await waitFor(() => {
        expect(result.current.isReporting).toBe(false);
      });
    });
  });
});

