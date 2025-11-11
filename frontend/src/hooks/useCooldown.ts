import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { useSession } from "./useSession";
import { WebSocketMessage } from "@/lib/websocket-client";

/**
 * useCooldown Hook
 * 
 * Manages cooldown state from WebSocket messages.
 * Tracks cooldown expiration and provides countdown timer.
 */
export function useCooldown() {
  const { session } = useSession();
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState<number | null>(null);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === "error" && message.payload?.code === "cooldown_active") {
      const { cooldownExpiresAt: expiresAt, cooldownRemainingMs: remainingMs } = message.payload;
      if (expiresAt) {
        setCooldownExpiresAt(expiresAt);
        setCooldownRemainingMs(remainingMs || 0);
      }
    }
  }, []);

  const { isConnected } = useWebSocket({
    token: session?.token || null,
    autoConnect: true,
    onMessage: handleWebSocketMessage,
  });

  // Update countdown timer every minute
  useEffect(() => {
    if (!cooldownExpiresAt) {
      setCooldownRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const remaining = cooldownExpiresAt - now;
      if (remaining <= 0) {
        setCooldownExpiresAt(null);
        setCooldownRemainingMs(0);
      } else {
        setCooldownRemainingMs(remaining);
      }
    };

    // Update immediately
    updateRemaining();

    // Update every minute
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [cooldownExpiresAt]);

  const isInCooldown = cooldownExpiresAt !== null && cooldownRemainingMs > 0;

  const formatCooldownRemaining = useCallback(() => {
    if (!isInCooldown) return null;

    const minutes = Math.floor(cooldownRemainingMs / 60000);
    const seconds = Math.floor((cooldownRemainingMs % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }, [isInCooldown, cooldownRemainingMs]);

  return {
    isInCooldown,
    cooldownExpiresAt,
    cooldownRemainingMs,
    cooldownRemainingFormatted: formatCooldownRemaining(),
  };
}

