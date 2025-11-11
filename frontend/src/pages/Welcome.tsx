import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BootSequence } from "@/components/custom/BootSequence";

export default function Welcome() {
  const [showBoot, setShowBoot] = useState(true); // Boot sequence enabled for cool brand moment
  const [showSweep, setShowSweep] = useState(true);

  if (showBoot) {
    return <BootSequence onComplete={() => setShowBoot(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {showSweep && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/20 to-transparent animate-sweep" />
        </div>
      )}

      <div className="max-w-md w-full space-y-8 sm:space-y-12 text-center relative z-10">
        {/* Logo */}
        <div className="space-y-4 sm:space-y-6">
          <img
            src="/logo-256.png"
            alt="IceBreaker"
            width={140}
            height={140}
            className="mx-auto animate-pulse-slow w-32 h-32 sm:w-40 sm:h-40"
          />

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-accent font-mono tracking-tight glow-accent">
              ICEBREAKER
            </h1>
            <div className="ascii-divider text-xs">- - - - - - - - - -</div>
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <p className="text-lg sm:text-xl text-foreground font-mono leading-relaxed">
            Real world.
            <br />
            Real time.
            <br />
            Real connections.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Brief moments with nearby people</p>
        </div>

        {/* CTAs */}
        <div className="space-y-3 sm:space-y-4">
          <Button
            asChild
            size="lg"
            className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono text-base sm:text-lg h-12 sm:h-14 retro-button border-2 border-accent"
          >
            <Link to="/onboarding">PRESS START</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full rounded-2xl text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted text-sm sm:text-base"
          >
            <Link to="/">Not for me</Link>
          </Button>
        </div>

        {/* Footer hint */}
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-mono">18+ · Ephemeral · Privacy-first</p>
      </div>
    </div>
  );
}
