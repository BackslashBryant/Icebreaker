import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { useSession } from "./useSession";
import { WebSocketMessage } from "@/lib/websocket-client";

export interface Person {
  sessionId: string;
  handle: string;
  vibe: string;
  tags: string[];
  signal: number;
  proximity: string | null;
}

interface UseRadarOptions {
  onChatRequest?: (targetSessionId: string) => void;
}

/**
 * Radar state management hook
 * Manages radar data, WebSocket connection, and location updates
 */
export function useRadar(options: UseRadarOptions = {}) {
  const { session } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { status, send, isConnected } = useWebSocket({
    token: session?.token || null,
    autoConnect: true,
    onMessage: (message: WebSocketMessage) => {
      if (message.type === "radar:update") {
        setPeople(message.payload?.people || []);
      } else if (message.type === "connected") {
        // Subscribe to radar updates on connection
        send({ type: "radar:subscribe" });
      } else if (message.type === "error") {
        console.error("WebSocket error:", message.payload);
      }
    },
    onConnect: () => {
      // Subscribe to radar updates when connected
      send({ type: "radar:subscribe" });
    },
  });

  // Send location update when location changes
  useEffect(() => {
    if (isConnected && location) {
      send({
        type: "location:update",
        payload: {
          lat: location.lat,
          lng: location.lng,
        },
      });
    }
  }, [location, isConnected, send]);

  // Update location from browser geolocation
  const updateLocation = useCallback((newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
  }, []);

  // Request chat with selected person
  const requestChat = useCallback(
    (targetSessionId: string) => {
      send({
        type: "chat:request",
        payload: { targetSessionId },
      });
      options.onChatRequest?.(targetSessionId);
    },
    [send, options]
  );

  // Select person (show person card)
  const selectPerson = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  return {
    people,
    selectedPerson,
    location,
    status,
    isConnected,
    updateLocation,
    selectPerson,
    clearSelection,
    requestChat,
  };
}

