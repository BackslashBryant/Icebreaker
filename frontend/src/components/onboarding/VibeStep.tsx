interface VibeStepProps {
  selectedVibe: string | null;
  onVibeSelect: (vibe: string) => void;
}

const VIBES = [
  { id: "banter", label: "Up for banter", emoji: "🙃" },
  { id: "intros", label: "Open to intros", emoji: "🤝" },
  { id: "thinking", label: "Thinking out loud", emoji: "🧠" },
  { id: "killing-time", label: "Killing time", emoji: "⏳" },
  { id: "surprise", label: "Surprise me", emoji: "🎲" },
];

export function VibeStep({ selectedVibe, onVibeSelect }: VibeStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <div className="ascii-divider text-xs mb-2">▼ ▼ ▼</div>
        <h2 className="text-lg sm:text-xl font-bold text-accent font-mono glow-accent mb-1">YOUR VIBE</h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-mono mb-2">(Required)</p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          What's your vibe right now?
        </p>
      </div>
      <div className="space-y-2">
        {VIBES.map((vibe) => {
          const isSelected = selectedVibe === vibe.id;
          const ariaPressedValue = isSelected ? "true" : "false";
          return (
            // eslint-disable-next-line jsx-a11y/aria-proptypes
            <button
              key={vibe.id}
              onClick={() => onVibeSelect(vibe.id)}
              aria-pressed={ariaPressedValue}
              aria-label={`${vibe.label}${isSelected ? " (selected)" : ""}`}
              data-testid={`vibe-${vibe.id}`}
              className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left font-mono text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-opacity-100 focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
                isSelected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-muted/50 hover:border-accent/50"
              }`}
            >
              <span className="mr-2" aria-hidden="true">{vibe.emoji}</span>
              {vibe.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
