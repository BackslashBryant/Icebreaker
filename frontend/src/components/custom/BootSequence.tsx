import { useState, useEffect } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage progression
    const stageTimer = setTimeout(() => {
      if (stage < 4) {
        setStage(stage + 1);
      } else {
        onComplete();
      }
    }, 800);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 20);

    return () => {
      clearTimeout(stageTimer);
      clearInterval(progressInterval);
    };
  }, [stage, onComplete]);

  const bootMessages = [
    "INITIALIZING ICEBREAKER v1.0...",
    "LOADING SIGNAL ENGINE...",
    "CALIBRATING PROXIMITY SENSORS...",
    "ESTABLISHING SECURE CONNECTION...",
    "READY",
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* CRT scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 184, 217, 0.1) 2px, rgba(0, 184, 217, 0.1) 4px)'
        }} />
      </div>

      <div className="max-w-md w-full space-y-8 font-mono relative z-10">
        {/* Logo with enhanced glow */}
        <div className="flex justify-center">
          <img
            src="/logo-128.png"
            alt="IceBreaker"
            width={80}
            height={80}
            className="opacity-80 animate-pulse-slow glow-accent"
          />
        </div>

        {/* ASCII Art with subtle pulse */}
        <div className="text-accent text-xs leading-tight text-center glow-accent">
          <pre className="font-mono animate-pulse-slow">{`
 _____ _____ _____ _____ _____ _____ _____ _____ _____
||     |     |   __|  _  |  _  |   __|  _  |  |  |   __|
||-   -|   --|   __|     |   __|   __|     |    -|   __|
||_____|_____|_____|__|__|__|  |_____|__|__|__|__|_____|
          `}</pre>
        </div>

        {/* Boot Messages with typewriter effect */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {bootMessages.slice(0, stage + 1).map((msg, i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${
                i === stage
                  ? "text-accent glow-accent animate-pulse-slow"
                  : "opacity-70"
              }`}
            >
              {i === stage ? (
                <span className="inline-flex items-center gap-1">
                  <span className="animate-pulse">▶</span> {msg}
                </span>
              ) : (
                <span>✓ {msg}</span>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar with glow effect */}
        <div className="space-y-2">
          <div className="h-4 border-2 border-accent/50 bg-background relative overflow-hidden rounded-sm">
            <div
              className="h-full bg-accent transition-all duration-100 glow-accent"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-mono">{progress}%</span>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground font-mono">INITIALIZING...</div>
        </div>

        {/* Blinking cursor with terminal effect */}
        <div className="text-accent text-sm flex items-center justify-center gap-2">
          <span className="animate-pulse">_</span>
          <span className="text-[10px] text-muted-foreground/50">READY</span>
        </div>
      </div>
    </div>
  );
}
