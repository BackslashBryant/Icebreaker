import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

/**
 * VisibilityToggle Component
 *
 * Toggle for showing/hiding user on Radar.
 */
export function VisibilityToggle() {
  const { session } = useSession();
  const { updateVisibility, loading } = useProfile();
  const [visibility, setVisibility] = useState(session?.visibility ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync with session visibility
  useEffect(() => {
    if (session?.visibility !== undefined) {
      setVisibility(session.visibility);
    }
  }, [session?.visibility]);

  const handleToggle = async (checked: boolean) => {
    // Optimistic update
    setVisibility(checked);
    setIsUpdating(true);

    const result = await updateVisibility(checked);

    if (result.success) {
      toast.success("Visibility updated", {
        description: checked ? "You're visible on Radar" : "You're hidden from Radar",
      });
    } else {
      // Revert on error
      setVisibility(!checked);
      toast.error("Failed to update visibility", {
        description: result.error || "Please try again",
      });
    }

    setIsUpdating(false);
  };

  return (
    <div className="p-3 sm:p-4 border-2 border-accent/30 rounded-xl bg-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {visibility ? (
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" aria-hidden="true" />
          ) : (
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <div className="font-mono text-xs sm:text-sm">Show me on Radar</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              Others can see you when nearby
            </div>
          </div>
        </div>
        <Checkbox
          checked={visibility}
          onCheckedChange={handleToggle}
          disabled={isUpdating || loading}
          className="shrink-0"
          aria-label={visibility ? "Hide from Radar" : "Show on Radar"}
        />
      </div>
    </div>
  );
}

