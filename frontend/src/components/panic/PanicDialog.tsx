import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";

/**
 * PanicDialog Component
 * 
 * Confirmation dialog for panic button trigger.
 * Shows "Everything okay?" confirmation flow.
 * 
 * Brand: Calm, reassuring, never dramatic.
 */
interface PanicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PanicDialog({ isOpen, onClose, onConfirm }: PanicDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with other Escape handlers - only handle if dialog is open
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation(); // Prevent other Escape handlers
        onClose();
      } else if (e.key === "Enter" && !isConfirming && isOpen) {
        e.stopPropagation();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, isConfirming, onClose]);

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panic-dialog-title"
      aria-describedby="panic-dialog-description"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-w-md w-full space-y-6 bg-card border-2 border-accent/30 rounded-xl p-6" data-testid="panic-dialog">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-4 border-accent bg-accent/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-accent" aria-hidden="true" />
          </div>
          <div className="text-muted-foreground text-xs font-mono" role="separator">
            ▼ ▼ ▼
          </div>
          <h2
            id="panic-dialog-title"
            className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent"
          >
            Everything okay?
          </h2>
          <p
            id="panic-dialog-description"
            className="text-sm sm:text-base text-muted-foreground"
          >
            This will end your session and alert your emergency contact.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-mono h-11 sm:h-12 text-sm border-2 border-accent"
            aria-label="Confirm panic and exit"
            data-testid="panic-confirm"
          >
            {isConfirming ? "Processing..." : "SEND ALERT & EXIT"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isConfirming}
            className="w-full rounded-2xl border-2 border-accent/30 text-accent hover:bg-accent/10 font-mono bg-transparent text-sm"
            aria-label="Cancel panic"
            data-testid="panic-cancel"
          >
            Never mind
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * PanicSuccess Component
 * 
 * Success state after panic is triggered.
 * Shows "You're safe. Session ended." with notification details.
 */
interface PanicSuccessProps {
  exclusionExpiresAt?: number;
  onClose: () => void;
}

export function PanicSuccess({ exclusionExpiresAt, onClose }: PanicSuccessProps) {
  const navigate = useNavigate();

  // Format exclusion expiration time
  const formatExclusionTime = (timestamp?: number): string => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Format approximate location (if available)
  const formatLocation = (): string => {
    // TODO: Get approximate location from session when available
    return "Approximate location shared";
  };

  // Auto-redirect to welcome after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-accent border-4 border-accent flex items-center justify-center">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground" aria-hidden="true" />
        </div>
        <div className="text-muted-foreground text-xs font-mono" role="separator">
          ▼ ▼ ▼
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">
            You're safe.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Session ended.</p>
        </div>
        <div className="p-3 sm:p-4 bg-card border-2 border-accent/30 rounded-xl">
          <p className="text-xs font-mono text-muted-foreground">
            Emergency contact notified with:
            <br />
            <span className="text-accent">→</span> Time: {formatExclusionTime(exclusionExpiresAt)}
            <br />
            <span className="text-accent">→</span> Location: {formatLocation()}
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full rounded-2xl border-2 border-accent/30 text-accent hover:bg-accent/10 font-mono bg-transparent text-sm"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
