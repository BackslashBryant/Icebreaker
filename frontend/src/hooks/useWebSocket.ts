import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketStatus, WebSocketMessage, createWebSocketConnection, getWebSocketUrl, sendWebSocketMessage } from "@/lib/websocket-client";

interface UseWebSocketOptions {
  token: string | null;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

/**
 * WebSocket connection hook
 * Manages WebSocket connection lifecycle and message handling
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const { token, autoConnect = true, onMessage, onConnect, onDisconnect, onError } = options;
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  const connect = useCallback(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setStatus("connecting");
    reconnectAttemptsRef.current = 0;

    try {
      const url = getWebSocketUrl(token);
      const ws = createWebSocketConnection(url, {
        onConnect: () => {
          setStatus("connected");
          reconnectAttemptsRef.current = 0;
          onConnect?.();
        },
        onMessage: (message) => {
          onMessage?.(message);
        },
        onDisconnect: () => {
          setStatus("disconnected");
          onDisconnect?.();

          // Attempt to reconnect if not manually closed
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Exponential backoff
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setStatus("error");
          }
        },
        onError: (error) => {
          setStatus("error");
          onError?.(error);
        },
      });

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setStatus("error");
    }
  }, [token, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    sendWebSocketMessage(wsRef.current, message);
  }, []);

  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    send,
    isConnected: status === "connected",
  };
}

