import { useState, useCallback } from "react";
import { useSession } from "./useSession";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * useProfile Hook
 * 
 * Manages profile API calls for visibility and emergency contact updates.
 * Updates local session state after successful API calls.
 */
export function useProfile() {
  const { session, setSession } = useSession();
  const [loading, setLoading] = useState(false);

  /**
   * Update session visibility
   */
  const updateVisibility = useCallback(
    async (visibility: boolean): Promise<{ success: boolean; error?: string }> => {
      if (!session?.token) {
        return { success: false, error: "No session token" };
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/visibility`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ visibility }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error?.message || "Failed to update visibility",
          };
        }

        // Update local session state
        if (session) {
          setSession({
            ...session,
            visibility,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error updating visibility:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        };
      } finally {
        setLoading(false);
      }
    },
    [session, setSession]
  );

  /**
   * Update emergency contact
   */
  const updateEmergencyContact = useCallback(
    async (
      emergencyContact: string | null
    ): Promise<{ success: boolean; error?: string }> => {
      if (!session?.token) {
        return { success: false, error: "No session token" };
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/emergency-contact`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ emergencyContact }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error?.message || "Failed to update emergency contact",
          };
        }

        // Update local session state
        if (session) {
          setSession({
            ...session,
            emergencyContact: emergencyContact || null,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error updating emergency contact:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        };
      } finally {
        setLoading(false);
      }
    },
    [session, setSession]
  );

  return {
    updateVisibility,
    updateEmergencyContact,
    loading,
  };
}

