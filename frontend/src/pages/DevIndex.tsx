import { Link } from "react-router-dom";

export default function DevIndex() {
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/logo-256.png"
            alt="IceBreaker"
            width={140}
            height={140}
            className="mx-auto animate-pulse-slow w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent glow-accent font-mono">
            ICEBREAKER DEV
          </h1>
          <div className="ascii-divider text-center">- - - - - - - - - -</div>
          <p className="text-sm sm:text-base text-muted-foreground font-mono">Navigate through the key screens</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            to="/welcome"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">01_WELCOME</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Brand moment & entry point</p>
          </Link>

          <Link
            to="/onboarding"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">02_ONBOARDING</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Consent, location, vibe & tags</p>
          </Link>

          <Link
            to="/radar"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">03_RADAR</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Ambient presence view</p>
          </Link>

          <div className="p-4 sm:p-6 border-2 border-muted rounded-xl bg-card opacity-50">
            <h2 className="text-lg sm:text-xl font-bold text-muted-foreground mb-2 font-mono">04_CHAT</h2>
            <div className="ascii-divider text-xs mb-2 text-muted-foreground/30">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground/60">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
