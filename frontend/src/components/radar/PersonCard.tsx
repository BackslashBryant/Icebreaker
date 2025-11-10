import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Person } from "@/hooks/useRadar";

interface PersonCardProps {
  person: Person | null;
  open: boolean;
  onClose: () => void;
  onChatRequest: (sessionId: string) => void;
}

/**
 * PersonCard Component
 * 
 * Displays selected person details in a dialog.
 * Shows handle, vibe, tags, signal score, and one-tap chat button.
 */
export function PersonCard({ person, open, onClose, onChatRequest }: PersonCardProps) {
  if (!person) {
    return null;
  }

  const handleChatClick = () => {
    onChatRequest(person.sessionId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-accent font-mono">{person.handle}</DialogTitle>
          <DialogDescription className="font-mono">
            Signal: {person.signal.toFixed(1)}
            {person.proximity && ` • ${person.proximity}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 font-mono">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Vibe</p>
            <p className="text-foreground capitalize">{person.vibe}</p>
          </div>

          {person.tags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs border border-border rounded-md bg-secondary/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleChatClick}
              className="w-full"
              size="lg"
            >
              START CHAT →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

