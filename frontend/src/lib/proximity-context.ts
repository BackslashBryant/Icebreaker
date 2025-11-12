/**
 * Proximity Context Utilities
 * 
 * Formats proximity tiers into user-friendly context labels.
 */

export type ProximityTier = "room" | "venue" | "nearby" | "far" | null;

/**
 * Get proximity context label for display
 * @param tier - Proximity tier from backend
 * @returns User-friendly context label or null
 */
export function getProximityContextLabel(tier: ProximityTier): string | null {
  if (!tier) return null;

  switch (tier) {
    case "room":
      return "Same room";
    case "venue":
      return "Same venue";
    case "nearby":
      return "Nearby neighborhood";
    case "far":
      return null; // Don't show "far" as it's not useful context
    default:
      return null;
  }
}

/**
 * Get proximity context badge variant
 * @param tier - Proximity tier from backend
 * @returns Badge variant class name
 */
export function getProximityBadgeVariant(tier: ProximityTier): string {
  if (!tier) return "";

  switch (tier) {
    case "room":
      return "border-accent bg-accent/10 text-accent";
    case "venue":
      return "border-accent/70 bg-accent/5 text-accent/90";
    case "nearby":
      return "border-muted-foreground/50 bg-muted/30 text-muted-foreground";
    default:
      return "";
  }
}

