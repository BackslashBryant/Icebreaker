import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSession } from "@/hooks/useSession";
import { ChatMessage as ChatMessageType } from "@/components/chat/ChatMessage";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { WebSocketMessage } from "@/lib/websocket-client";
// Proximity warning handled by backend via WebSocket messages

export type ChatState = "requesting" | "pending" | "active" | "ended";

interface UseChatOptions {
  partnerSessionId: string | null;
  partnerHandle: string | null;
  onChatEnd?: () => void;
}

/**
 * useChat Hook
 * 
 * Manages chat state, messages, and WebSocket communication.
 */
export function useChat(options: UseChatOptions) {
  const { partnerSessionId, partnerHandle, onChatEnd } = options;
  const { session } = useSession();
  const [chatState, setChatState] = useState<ChatState>("requesting");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [proximityWarning, setProximityWarning] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case "chat:request":
          // Incoming chat request
          if (message.payload?.fromSessionId) {
            setChatState("pending");
            setPendingRequestId(message.payload.requestId || null);
          }
          break;

        case "chat:request:ack":
          // Chat request acknowledged (waiting for response)
          setChatState("requesting");
          break;

        case "chat:accepted":
          // Chat accepted
          setChatState("active");
          setPendingRequestId(null);
          break;

        case "chat:declined":
          // Chat declined
          setChatState("ended");
          onChatEnd?.();
          break;

        case "chat:message":
          // New message received
          if (message.payload) {
            setMessages((prev) => [
              ...prev,
              {
                text: message.payload.text,
                timestamp: message.payload.timestamp || Date.now(),
                sender: message.payload.sender === "me" ? "me" : "them",
              },
            ]);
          }
          break;

        case "chat:end":
          // Chat ended
          setChatState("ended");
          onChatEnd?.();
          break;

        default:
          break;
      }
    },
    [onChatEnd]
  );

  const { send, isConnected } = useWebSocket({
    token: session?.token || null,
    autoConnect: true,
    onMessage: handleWebSocketMessage,
  });

  // Request chat on mount if partnerSessionId provided
  useEffect(() => {
    if (partnerSessionId && chatState === "requesting" && isConnected) {
      send({
        type: "chat:request",
        payload: { targetSessionId: partnerSessionId },
      });
    }
  }, [partnerSessionId, chatState, isConnected, send]);

  // Check proximity warning periodically
  useEffect(() => {
    if (chatState === "active" && partnerSessionId && session?.sessionId) {
      const checkProximity = () => {
        // Note: This would need to be called from backend or calculated client-side
        // For now, we'll rely on backend proximity monitoring
        // This is a placeholder for client-side proximity checking if needed
      };

      const interval = setInterval(checkProximity, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [chatState, partnerSessionId, session?.sessionId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (chatState === "active" && isConnected) {
        send({
          type: "chat:message",
          payload: {
            text,
            timestamp: Date.now(),
          },
        });
      }
    },
    [chatState, isConnected, send]
  );

  const acceptChat = useCallback(() => {
    if (pendingRequestId && partnerSessionId && isConnected) {
      send({
        type: "chat:accept",
        payload: { requesterSessionId: partnerSessionId },
      });
    }
  }, [pendingRequestId, partnerSessionId, isConnected, send]);

  const declineChat = useCallback(() => {
    if (pendingRequestId && partnerSessionId && isConnected) {
      send({
        type: "chat:decline",
        payload: { requesterSessionId: partnerSessionId },
      });
    }
  }, [pendingRequestId, partnerSessionId, isConnected, send]);

  const endChat = useCallback(() => {
    if (isConnected) {
      send({ type: "chat:end" });
    }
    setChatState("ended");
    onChatEnd?.();
  }, [isConnected, send, onChatEnd]);

  return {
    chatState,
    messages,
    proximityWarning,
    sendMessage,
    acceptChat,
    declineChat,
    endChat,
    isConnected,
  };
}

