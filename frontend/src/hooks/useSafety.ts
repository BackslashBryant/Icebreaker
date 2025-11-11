import { useState, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

/**
 * useSafety Hook
 * 
 * Manages block and report functionality.
 * Handles API calls to backend safety endpoints.
 */
export function useSafety() {
  const { session } = useSession();
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const blockUser = useCallback(
    async (targetSessionId: string) => {
      if (!session?.token) {
        toast.error("Not authenticated. Please try again.");
        return { success: false };
      }

      setIsBlocking(true);
      try {
        const response = await fetch("/api/safety/block", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ targetSessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error?.message || "Failed to block user");
          return { success: false, error: data.error?.message };
        }

        toast.success("User blocked");
        return { success: true };
      } catch (error) {
        console.error("Error blocking user:", error);
        toast.error("Failed to block user. Please try again.");
        return { success: false, error: "Network error" };
      } finally {
        setIsBlocking(false);
      }
    },
    [session]
  );

  const reportUser = useCallback(
    async (targetSessionId: string, category: "harassment" | "spam" | "impersonation" | "other") => {
      if (!session?.token) {
        toast.error("Not authenticated. Please try again.");
        return { success: false };
      }

      setIsReporting(true);
      try {
        const response = await fetch("/api/safety/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ targetSessionId, category }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error?.message || "Failed to report user");
          return { success: false, error: data.error?.message };
        }

        toast.success("Report submitted. Thank you.");
        return { success: true };
      } catch (error) {
        console.error("Error reporting user:", error);
        toast.error("Failed to report user. Please try again.");
        return { success: false, error: "Network error" };
      } finally {
        setIsReporting(false);
      }
    },
    [session]
  );

  return {
    blockUser,
    reportUser,
    isBlocking,
    isReporting,
  };
}

