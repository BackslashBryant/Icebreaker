import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConsentStep } from "@/components/onboarding/ConsentStep";
import { LocationStep } from "@/components/onboarding/LocationStep";
import { VibeStep } from "@/components/onboarding/VibeStep";
import { TagsStep } from "@/components/onboarding/TagsStep";
import { generateUsername } from "@/lib/username-generator";
import { createSession } from "@/lib/api-client";
import { useSession } from "@/hooks/useSession";

const VIBES = [
  { id: "banter", label: "Up for banter", emoji: "🙃" },
  { id: "intros", label: "Open to intros", emoji: "🤝" },
  { id: "thinking", label: "Thinking out loud", emoji: "🧠" },
  { id: "killing-time", label: "Killing time", emoji: "⏳" },
  { id: "surprise", label: "Surprise me", emoji: "🎲" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState(true);
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVibe || selectedTags.length > 0) {
      setUsername(generateUsername(selectedVibe || undefined, selectedTags));
    }
  }, [selectedVibe, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleLocationEnable = (loc: { lat: number; lng: number }) => {
    setLocation(loc);
    setStep(3);
  };

  const handleLocationSkip = () => {
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedVibe) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData = await createSession({
        vibe: selectedVibe,
        tags: selectedTags,
        visibility,
        location: location || undefined,
      });

      // Store session in memory
      setSession(sessionData);

      // Show success toast (on-brand: short, monospace, no noise)
      toast.success("You're live", {
        description: "Ready to connect",
        duration: 2000,
      });

      // Navigate to radar after brief delay to show toast
      setTimeout(() => {
        navigate("/radar");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session. Try again?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 my-8">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="glow-accent text-accent">STEP {step + 1}/4</span>
          <div className="flex gap-1.5 sm:gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-8 sm:w-10 border-2 ${i <= step ? "bg-accent border-accent" : "bg-transparent border-muted"}`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="ascii-divider text-center mb-4">▼ ▼ ▼</div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">WHAT IS ICEBREAKER?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Let's be clear: what this is, and what it isn't.
              </p>
            </div>

            <div className="space-y-4">
              {/* What We Are */}
              <div className="p-4 border-2 border-accent/50 rounded-xl bg-accent/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-accent">✓</span>
                  <h3 className="font-mono text-sm text-accent font-bold">WE ARE</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground font-mono">
                  <li>→ Proximity-based connections</li>
                  <li>→ Ephemeral and anonymous</li>
                  <li>→ Brief, authentic moments</li>
                  <li>→ Privacy-first and safe</li>
                </ul>
              </div>

              {/* What We're Not */}
              <div className="p-4 border-2 border-muted/50 rounded-xl bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-muted-foreground">✗</span>
                  <h3 className="font-mono text-sm text-muted-foreground font-bold">WE'RE NOT</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground/70 font-mono">
                  <li>→ A dating app</li>
                  <li>→ A social network</li>
                  <li>→ Permanent or public</li>
                  <li>→ Trying too hard</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent"
            >
              GOT IT →
            </Button>
          </div>
        )}

        {step === 1 && (
          <ConsentStep
            consent={consent}
            onConsentChange={setConsent}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <LocationStep
            onEnable={handleLocationEnable}
            onSkip={handleLocationSkip}
          />
        )}

        {step === 3 && (
          <div className="space-y-6 sm:space-y-8">
            <VibeStep
              selectedVibe={selectedVibe}
              onVibeSelect={setSelectedVibe}
            />
            <TagsStep
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              username={username}
            />
            {error && (
              <div className="p-3 border-2 border-destructive/50 rounded-xl bg-destructive/10" role="alert">
                <p className="text-xs text-destructive font-mono">{error}</p>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!selectedVibe || loading}
              className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent disabled:opacity-50"
            >
              {loading ? "CREATING SESSION..." : "ENTER RADAR →"}
            </Button>
          </div>
        )}

        {/* Back button */}
        {step > 0 && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted rounded-2xl text-sm"
          >
            ← BACK
          </Button>
        )}
      </div>
    </div>
  );
}
