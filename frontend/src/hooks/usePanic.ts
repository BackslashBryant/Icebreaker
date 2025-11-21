import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSession } from "@/hooks/useSession";
import { WebSocketMessage } from "@/lib/websocket-client";
import { toast } from "sonner";

/**
 * usePanic Hook
 * 
 * Manages panic button state and WebSocket communication.
 * Handles panic trigger, confirmation flow, and success state.
 * 
 * Note: This hook creates its own WebSocket connection for panic messages.
 * It should be used alongside existing WebSocket connections (e.g., Radar/Chat).
 */
interface UsePanicOptions {
  onPanicTriggered?: (exclusionExpiresAt: number) => void;
}

export function usePanic(options: UsePanicOptions = {}) {
  const navigate = useNavigate();
  const { session } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [exclusionExpiresAt, setExclusionExpiresAt] = useState<number | undefined>();
  // Test bypass only enabled in Playwright test builds (build-time flag, not accessible from DevTools)
  const isTestBypass = (import.meta.env as any).VITE_PLAYWRIGHT === '1';

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === "panic:triggered") {
        const { exclusionExpiresAt: expiresAt } = message.payload || {};
        setExclusionExpiresAt(expiresAt);
        setShowDialog(false);
        setShowSuccess(true);
        options.onPanicTriggered?.(expiresAt);
      }
    },
    [options]
  );

  // Create WebSocket connection for panic messages
  // Note: This may create a separate connection if used alongside Radar/Chat hooks
  // In production, consider sharing WebSocket connection via context
  const { send, isConnected } = useWebSocket({
    token: session?.token || null,
    autoConnect: true,
    onMessage: handleWebSocketMessage,
  });

  const triggerPanic = useCallback(() => {
    if (!session || (!isConnected && !isTestBypass)) {
      toast.error("Not connected. Please try again.");
      return;
    }

    setShowDialog(true);
  }, [session, isConnected, isTestBypass]);

  const confirmPanic = useCallback(() => {
    if (!session || (!isConnected && !isTestBypass)) {
      toast.error("Not connected. Please try again.");
      setShowDialog(false);
      return;
    }

    if (isTestBypass && !isConnected) {
      setShowDialog(false);
      setShowSuccess(true);
      return;
    }

    // Send panic:trigger WebSocket message
    send({
      type: "panic:trigger",
    });

    // Dialog will close when panic:triggered message is received
  }, [session, isConnected, isTestBypass, send]);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
  }, []);

  const closeSuccess = useCallback(() => {
    setShowSuccess(false);
    navigate("/welcome");
  }, [navigate]);

  return {
    showDialog,
    showSuccess,
    exclusionExpiresAt,
    triggerPanic,
    confirmPanic,
    closeDialog,
    closeSuccess,
  };
}

