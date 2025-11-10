import { useState } from "react";

interface SessionData {
  sessionId: string;
  token: string;
  handle: string;
  visibility?: boolean;
  emergencyContact?: string | null;
}

// Store session in memory (not localStorage - ephemeral)
let sessionData: SessionData | null = null;

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(sessionData);

  const setSessionData = (data: SessionData | null) => {
    sessionData = data;
    setSession(data);
  };

  const clearSession = () => {
    sessionData = null;
    setSession(null);
  };

  return {
    session,
    setSession: setSessionData,
    clearSession,
  };
}
