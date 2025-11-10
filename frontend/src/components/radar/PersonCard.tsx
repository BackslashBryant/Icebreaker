import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Person } from "@/hooks/useRadar";
import { BlockDialog } from "@/components/safety/BlockDialog";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { useSafety } from "@/hooks/useSafety";

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
 * Supports tap-hold/long-press (500ms) to open Block/Report menu.
 */
export function PersonCard({ person, open, onClose, onChatRequest }: PersonCardProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { blockUser, reportUser } = useSafety();

  // Clear timer on unmount or when dialog closes
  useEffect(() => {
    if (!open) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setShowMenu(false);
      setShowBlockDialog(false);
      setShowReportDialog(false);
    }
  }, [open]);

  // Handle long-press start (touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      e.preventDefault();
      setShowMenu(true);
      longPressTimerRef.current = null;
    }, 500); // 500ms threshold
  };

  // Handle long-press start (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      setShowMenu(true);
      longPressTimerRef.current = null;
    }, 500);
  };

  // Handle long-press end
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Handle right-click (desktop)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  // Handle keyboard long-press alternative (focus + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setShowMenu(true);
    }
  };

  const handleBlock = async () => {
    if (!person) return;
    const result = await blockUser(person.sessionId);
    if (result.success) {
      onClose(); // Close PersonCard after blocking
    }
  };

  const handleReport = async (category: "harassment" | "spam" | "impersonation" | "other") => {
    if (!person) return;
    await reportUser(person.sessionId, category);
  };

  if (!person) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent 
          ref={cardRef}
          className="sm:max-w-md"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label={`Person card for ${person.handle}. Long press or right-click for options.`}
        >
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

            <div className="pt-4 space-y-2">
              <Button
                onClick={handleChatClick}
                className="w-full"
                size="lg"
              >
                START CHAT →
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Long press or right-click for safety options
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block/Report Menu */}
      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          {/* Menu dropdown */}
          <div 
            className="fixed z-50 w-48 bg-card border-2 border-border rounded-lg shadow-lg font-mono"
            style={{
              top: cardRef.current ? cardRef.current.getBoundingClientRect().bottom + 8 : '50%',
              left: cardRef.current ? cardRef.current.getBoundingClientRect().left : '50%',
            }}
            role="menu"
            aria-label="Safety options"
          >
            <button
              onClick={() => {
                setShowMenu(false);
                setShowReportDialog(true);
              }}
              className="w-full text-left px-4 py-3 hover:bg-accent/10 text-foreground text-sm border-b border-border first:rounded-t-lg"
              role="menuitem"
              aria-label="Report user"
            >
              Report
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                setShowBlockDialog(true);
              }}
              className="w-full text-left px-4 py-3 hover:bg-accent/10 text-foreground text-sm rounded-b-lg"
              role="menuitem"
              aria-label="Block user"
            >
              Block
            </button>
          </div>
        </>
      )}

      <BlockDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleBlock}
        partnerHandle={person.handle}
      />
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onConfirm={handleReport}
        partnerHandle={person.handle}
      />
    </>
  );

  function handleChatClick() {
    onChatRequest(person.sessionId);
    onClose();
  }
}

