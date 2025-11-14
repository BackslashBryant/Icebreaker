import { Person } from "@/hooks/useRadar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { getProximityContextLabel, getProximityBadgeVariant } from "@/lib/proximity-context";

interface RadarListProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  emptyMessage?: string;
  userTags?: string[]; // Current user's tags for shared tag highlighting
}

/**
 * RadarList Component
 * 
 * Accessible list view of nearby people.
 * Keyboard navigable, screen reader friendly.
 */
export function RadarList({
  people,
  onSelectPerson,
  emptyMessage = "No one here — yet.",
  userTags = [],
}: RadarListProps) {
  if (people.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-4"
        role="status"
        aria-live="polite"
      >
        <div className="p-6 sm:p-8 bg-muted/20 border-2 border-border rounded-md max-w-md text-center animate-fade-in">
          <p className="text-foreground text-sm sm:text-base font-mono font-semibold">
            No one nearby — yet.
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed mt-2">
            Check back soon or enable location for better matching.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul
      className="space-y-2"
      role="list"
      aria-label="Nearby people sorted by compatibility"
    >
      {people.map((person) => (
        <li key={person.sessionId}>
          <Button
            variant="outline"
            className="w-full justify-between text-left h-auto py-4 px-4 font-mono"
            onClick={() => onSelectPerson(person)}
            aria-label={`View ${person.handle}, signal score ${person.signal.toFixed(1)}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-accent">{person.handle}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {person.signal.toFixed(1)}
                  </span>
                  <Tooltip content="Signal score combines: • Vibe compatibility • Shared tags • Proximity distance • Visibility status. Higher = better match" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground capitalize">
                  {person.vibe}
                </span>
                {getProximityContextLabel(person.proximity) && (
                  <span
                    className={`text-xs px-1.5 py-0.5 border rounded font-mono ${getProximityBadgeVariant(person.proximity)}`}
                  >
                    {getProximityContextLabel(person.proximity)}
                  </span>
                )}
              </div>
              {person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {person.tags.slice(0, 3).map((tag, index) => {
                    const isShared = userTags.includes(tag);
                    return (
                      <span
                        key={index}
                        className={`text-xs px-1.5 py-0.5 border rounded ${
                          isShared
                            ? "border-border bg-muted/20 font-semibold"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <span className="text-accent ml-2">→</span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

