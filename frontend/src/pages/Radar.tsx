import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { useRadar } from "@/hooks/useRadar";
import { useLocation } from "@/hooks/useLocation";
import { RadarSweep } from "@/components/radar/RadarSweep";
import { RadarList } from "@/components/radar/RadarList";
import { PersonCard } from "@/components/radar/PersonCard";
import { PanicButton } from "@/components/panic/PanicButton";
import { Button } from "@/components/ui/button";
import { List, Radar as RadarIcon, User } from "lucide-react";

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
      const partnerHandle = partner?.handle || "Unknown";
      
      // Store in session storage for refresh resilience
      sessionStorage.setItem("icebreaker:chat:partnerSessionId", targetSessionId);
      sessionStorage.setItem("icebreaker:chat:partnerHandle", partnerHandle);
      
      navigate("/chat", {
        state: {
          partnerSessionId: targetSessionId,
          partnerHandle,
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
              onClick={() => navigate("/profile")}
              variant="ghost"
              size="icon"
              className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-foreground border-2 border-transparent hover:border-border"
              aria-label="Go to profile"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "sweep" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("sweep")}
              aria-label="Switch to radar sweep view"
              aria-pressed={viewMode === "sweep"}
              title="Radar view"
            >
              <RadarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="Switch to list view"
              aria-pressed={viewMode === "list"}
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
              className="mb-6 p-4 border-2 border-border rounded-md bg-muted/20 text-muted-foreground font-mono text-sm"
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
          {/* Only show error after reconnection attempts have been exhausted AND connection has been failed for a while */}
          {status === "error" && isConnected === false && (
            <div
              className="mb-6 p-4 border-2 border-destructive rounded-md bg-card text-destructive font-mono text-sm"
              role="alert"
              data-testid="connection-error-banner"
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
              userTags={session?.tags || []}
            />
          )}

          {/* Debug info (dev only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 border border-border rounded-md bg-card/50 text-xs font-mono text-muted-foreground">
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
        userTags={session?.tags || []}
      />

      {/* Panic Button FAB */}
      <PanicButton />
    </div>
  );
}
