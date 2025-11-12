import { Checkbox } from "@/components/ui/checkbox";

interface TagsStepProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  visibility: boolean;
  onVisibilityChange: (visibility: boolean) => void;
  username: string;
}

const TAGS = [
  "Quietly Curious",
  "Creative Energy",
  "Overthinking Things",
  "Big Sci-Fi Brain",
  "Here for the humans",
  "Builder brain",
  "Tech curious",
  "Lo-fi head",
];

export function TagsStep({
  selectedTags,
  onTagToggle,
  visibility,
  onVisibilityChange,
  username,
}: TagsStepProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {username && (
        <div className="p-3 border-2 border-accent/50 rounded-xl bg-accent/5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your anonymous handle:</p>
          <p className="text-base sm:text-lg font-mono text-accent glow-accent">{username}</p>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="ascii-divider text-xs mb-2">- - - - - - - - - -</div>
          <h2 className="text-lg sm:text-xl font-bold text-accent font-mono glow-accent mb-2">
            TAGS (OPTIONAL)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Want to give folks a sense of your wavelength?
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              aria-pressed={selectedTags.includes(tag)}
              aria-label={`${tag}${selectedTags.includes(tag) ? " (selected)" : ""}`}
              data-testid={`tag-${tag}`}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 text-xs sm:text-sm font-mono transition-all ${
                selectedTags.includes(tag)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-muted/50 text-muted-foreground hover:border-accent/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {selectedTags.length === 0 && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Tags help others find you, but they're optional
          </p>
        )}
      </div>

      <div className="flex items-center justify-between p-3 sm:p-4 border-2 border-accent/30 rounded-xl bg-card" data-testid="visibility-toggle">
        <div className="flex-1 pr-3">
          <span className="font-mono text-xs sm:text-sm block mb-1">Show me on the radar</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground/60">
            Others can see and chat with you
          </span>
        </div>
        <Checkbox 
          checked={visibility} 
          onCheckedChange={(checked) => onVisibilityChange(checked as boolean)}
          data-testid="visibility-toggle-checkbox"
        />
      </div>
    </div>
  );
}
