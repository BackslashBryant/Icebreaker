import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * BlockDialog Component
 * 
 * Confirmation dialog for blocking a user.
 * Brand: Calm, clear, accessible.
 */
interface BlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partnerHandle: string;
}

export function BlockDialog({ isOpen, onClose, onConfirm, partnerHandle }: BlockDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Enter" && !isConfirming && isOpen) {
        e.stopPropagation();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, isConfirming, onClose]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await Promise.resolve(onConfirm());
    } finally {
      // Keep loading state until dialog closes
      // The parent component will call onClose when done
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 border-2 border-destructive bg-destructive/10 flex items-center justify-center rounded-full">
              <Ban className="w-6 h-6 text-destructive" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground font-mono">
              Block {partnerHandle}?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            This will block this user and end your current chat. You won't see them in Radar or receive messages from them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-mono border-2 border-accent"
            aria-label="Confirm block"
          >
            {isConfirming ? "Blocking..." : "Block"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isConfirming}
            className="w-full sm:w-auto border-2 border-border text-foreground hover:bg-muted/30 font-mono bg-transparent"
            aria-label="Cancel block"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

