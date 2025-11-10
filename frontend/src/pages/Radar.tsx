import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { useRadar } from "@/hooks/useRadar";
import { useLocation } from "@/hooks/useLocation";
import { RadarSweep } from "@/components/radar/RadarSweep";
import { RadarList } from "@/components/radar/RadarList";
import { PersonCard } from "@/components/radar/PersonCard";
import { Button } from "@/components/ui/button";
import { List, Radar as RadarIcon } from "lucide-react";

/**
 * Radar Page
 * 
 * Main Radar View with proximity-based presence visualization.
 * Supports CRT sweep visualization and accessible list view.
 */
export default function Radar() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { location, error: locationError } = useLocation({
    watch: true, // Enable periodic location updates
    updateInterval: 30000, // Update every 30 seconds
    movementThreshold: 50, // Update if moved 50m or more
    autoRequest: true, // Automatically request on mount
  });
  const [viewMode, setViewMode] = useState<"sweep" | "list">("sweep");

  const {
    people,
    selectedPerson,
    status,
    isConnected,
    updateLocation,
    selectPerson,
    clearSelection,
    requestChat,
  } = useRadar({
    onChatRequest: (targetSessionId) => {
      // Navigate to chat with partner info
      const partner = people.find((p) => p.sessionId === targetSessionId);
      navigate("/chat", {
        state: {
          partnerSessionId: targetSessionId,
          partnerHandle: partner?.handle || "Unknown",
        },
      });
    },
  });

  // Location is automatically requested via useLocation hook with autoRequest: true

  // Update radar location when browser location changes
  useEffect(() => {
    if (location) {
      updateLocation(location);
    }
  }, [location, updateLocation]);

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      navigate("/onboarding");
    }
  }, [session, navigate]);

  const handleToggleView = () => {
    setViewMode((prev) => (prev === "sweep" ? "list" : "sweep"));
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 sm:p-6" role="banner">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent font-mono glow-accent">
              RADAR
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {status === "connected"
                ? "Connected"
                : status === "connecting"
                ? "Connecting..."
                : "Disconnected"}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "sweep" ? "default" : "outline"}
              size="icon"
              onClick={handleToggleView}
              aria-label="Switch to radar sweep view"
              title="Radar view"
            >
              <RadarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={handleToggleView}
              aria-label="Switch to list view"
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto" role="main" aria-label="Radar view content">
        <div className="max-w-4xl mx-auto">
          {/* Location Error State */}
          {locationError && (
            <div
              className="mb-6 p-4 border-2 border-border rounded-xl bg-card text-muted-foreground font-mono text-sm"
              role="alert"
            >
              <p className="font-semibold mb-1">Location access denied</p>
              <p className="text-xs">
                Proximity matching is unavailable. You can still view nearby people, but
                sorting won't include distance.
              </p>
            </div>
          )}

          {/* Connection Error State */}
          {status === "error" && (
            <div
              className="mb-6 p-4 border-2 border-destructive rounded-xl bg-card text-destructive font-mono text-sm"
              role="alert"
            >
              <p className="font-semibold mb-1">Connection failed</p>
              <p className="text-xs">
                Unable to connect to radar service. Please refresh the page.
              </p>
            </div>
          )}

          {/* Radar View */}
          {viewMode === "sweep" ? (
            <RadarSweep
              people={people}
              onSelectPerson={selectPerson}
              emptyMessage="No one here — yet."
            />
          ) : (
            <RadarList
              people={people}
              onSelectPerson={selectPerson}
              emptyMessage="No one here — yet."
            />
          )}

          {/* Debug info (dev only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 border border-border rounded-xl bg-card/50 text-xs font-mono text-muted-foreground">
              <p>People: {people.length}</p>
              <p>Status: {status}</p>
              <p>Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "None"}</p>
            </div>
          )}
        </div>
      </main>

      {/* Person Card Dialog */}
      <PersonCard
        person={selectedPerson}
        open={!!selectedPerson}
        onClose={clearSelection}
        onChatRequest={requestChat}
      />
    </div>
  );
}
