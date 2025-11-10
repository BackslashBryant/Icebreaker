import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChatHeaderProps {
  partnerHandle: string;
  onEndChat: () => void;
  proximityWarning?: boolean;
}

/**
 * ChatHeader Component
 * 
 * Header showing partner handle and end chat button.
 * Shows proximity warning when signal is weak.
 */
export function ChatHeader({
  partnerHandle,
  onEndChat,
  proximityWarning = false,
}: ChatHeaderProps) {
  return (
    <div className="border-b border-border p-4 bg-background flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="font-mono text-lg font-semibold text-accent truncate" aria-label={`Chat with ${partnerHandle}`}>
          {partnerHandle}
        </h1>
        {proximityWarning && (
          <p className="text-xs text-muted-foreground font-mono mt-1" role="alert">
            Signal weak — chat may end.
          </p>
        )}
      </div>
      <Button
        onClick={onEndChat}
        variant="ghost"
        size="icon"
        className="shrink-0"
        aria-label="End chat"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

