import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * ReportDialog Component
 * 
 * Report form for reporting a user.
 * Brand: Calm, clear, accessible.
 */
interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: "harassment" | "spam" | "impersonation" | "other") => void;
  partnerHandle: string;
}

const REPORT_CATEGORIES = [
  { value: "harassment" as const, label: "Harassment" },
  { value: "spam" as const, label: "Spam" },
  { value: "impersonation" as const, label: "Impersonation" },
  { value: "other" as const, label: "Other" },
] as const;

export function ReportDialog({ isOpen, onClose, onConfirm, partnerHandle }: ReportDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<"harassment" | "spam" | "impersonation" | "other" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Enter" && !isSubmitting && selectedCategory && isOpen) {
        e.stopPropagation();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, isSubmitting, selectedCategory, onClose]);

  const handleConfirm = () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    onConfirm(selectedCategory);
    // Reset after a short delay to allow for async operations
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 border-2 border-accent/30 bg-accent/10 flex items-center justify-center rounded-full">
              <Flag className="w-6 h-6 text-accent" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-bold text-accent font-mono">
              Report {partnerHandle}?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Help us keep the community safe. Select a reason for reporting this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {REPORT_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all font-mono text-sm ${
                selectedCategory === category.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent/30 hover:bg-accent/5 text-foreground"
              }`}
              aria-pressed={selectedCategory === category.value}
              aria-label={`Select ${category.label}`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedCategory}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-mono border-2 border-accent disabled:opacity-50"
            aria-label="Submit report"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
            className="w-full sm:w-auto border-2 border-accent/30 text-accent hover:bg-accent/10 font-mono bg-transparent"
            aria-label="Cancel report"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

