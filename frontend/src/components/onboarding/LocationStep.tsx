import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/useLocation";

interface LocationStepProps {
  onEnable: (location: { lat: number; lng: number }) => void;
  onSkip: () => void;
}

export function LocationStep({ onEnable, onSkip }: LocationStepProps) {
  const { location, error, loading, requestLocation } = useLocation();

  const handleEnable = () => {
    requestLocation();
  };

  // When location is obtained, call onEnable
  useEffect(() => {
    if (location) {
      onEnable(location);
    }
  }, [location, onEnable]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="space-y-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-border bg-muted/10 flex items-center justify-center">
          <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
        </div>
        <div className="ascii-divider text-xs">- - - - - - - - - -</div>
        <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">LOCATION ACCESS</h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Approximate location only.</span> Never exact. Not stored long-term.
        </p>
        <div className="p-3 sm:p-4 bg-muted/20 border-2 border-border rounded-md">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            → Approximate distance only
            <br />→ No background tracking
            <br />→ Session-based only
            <br />→ <span className="font-semibold text-foreground">Your privacy matters</span>
          </p>
        </div>
        <div className="mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm font-mono text-muted-foreground mb-2 font-semibold">
            Connect with people nearby:
          </p>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            → Coworking spaces
            <br />→ Neighborhoods
            <br />→ Events
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 border-2 border-destructive/50 rounded-xl bg-destructive/10">
          <p className="text-xs text-destructive font-mono">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleEnable}
          disabled={loading}
          className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent disabled:opacity-50"
        >
          {loading ? "REQUESTING..." : "ENABLE LOCATION"}
        </Button>
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full rounded-2xl text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted text-sm"
          data-testid="onboarding-skip-location"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
