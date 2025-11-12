import { useState, useEffect } from "react";

interface SessionData {
  sessionId: string;
  token: string;
  handle: string;
  tags?: string[]; // User's tags from onboarding
  visibility?: boolean;
  emergencyContact?: string | null;
}

// Store session in memory (not localStorage - ephemeral)
let sessionData: SessionData | null = null;

export function useSession() {
  // Initialize from sessionStorage if available (for tests)
  const [session, setSession] = useState<SessionData | null>(() => {
    // Check sessionStorage first (for test setup)
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("icebreaker_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          sessionData = parsed;
          return parsed;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Fall back to memory
    return sessionData;
  });

  // Sync with sessionStorage changes (for tests)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("icebreaker_session");
          if (stored) {
            const parsed = JSON.parse(stored);
            sessionData = parsed;
            setSession(parsed);
          } else if (!stored && sessionData) {
            // SessionStorage cleared but memory still has session
            // Keep memory session (user is still logged in)
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setSessionData = (data: SessionData | null) => {
    sessionData = data;
    setSession(data);
    // Also update sessionStorage for test compatibility
    if (typeof window !== "undefined") {
      if (data) {
        sessionStorage.setItem("icebreaker_session", JSON.stringify(data));
      } else {
        sessionStorage.removeItem("icebreaker_session");
      }
    }
  };

  const clearSession = () => {
    sessionData = null;
    setSession(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("icebreaker_session");
    }
  };

  return {
    session,
    setSession: setSessionData,
    clearSession,
  };
}
