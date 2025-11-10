import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibility } from "@/hooks/useAccessibility";

/**
 * AccessibilityToggles Component
 * 
 * Toggles for reduced-motion and high-contrast accessibility preferences.
 */
export function AccessibilityToggles() {
  const {
    reducedMotion,
    highContrast,
    setReducedMotion,
    setHighContrast,
    loading,
  } = useAccessibility();

  return (
    <div className="p-3 sm:p-4 border-2 border-accent/30 rounded-xl bg-card space-y-4">
      {/* Reduced Motion Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs sm:text-sm">Reduce Motion</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            Disable animations and transitions
          </div>
        </div>
        <Checkbox
          checked={reducedMotion}
          onCheckedChange={(checked) => setReducedMotion(checked as boolean)}
          disabled={loading}
          className="flex-shrink-0"
          aria-label="Reduce motion"
        />
      </div>

      {/* High Contrast Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs sm:text-sm">High Contrast</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            Increase color contrast for better visibility
          </div>
        </div>
        <Checkbox
          checked={highContrast}
          onCheckedChange={(checked) => setHighContrast(checked as boolean)}
          disabled={loading}
          className="flex-shrink-0"
          aria-label="High contrast mode"
        />
      </div>
    </div>
  );
}

