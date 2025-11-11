import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, MoreVertical, User } from "lucide-react";
import { BlockDialog } from "@/components/safety/BlockDialog";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { useSafety } from "@/hooks/useSafety";

interface ChatHeaderProps {
  partnerHandle: string;
  partnerSessionId: string;
  onEndChat: () => void;
  proximityWarning?: boolean;
}

/**
 * ChatHeader Component
 * 
 * Header showing partner handle, menu button, and end chat button.
 * Shows proximity warning when signal is weak.
 */
export function ChatHeader({
  partnerHandle,
  partnerSessionId,
  onEndChat,
  proximityWarning = false,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { blockUser, reportUser } = useSafety();

  const handleBlock = async () => {
    const result = await blockUser(partnerSessionId);
    if (result.success) {
      onEndChat(); // End chat after blocking
    }
  };

  const handleReport = async (category: "harassment" | "spam" | "impersonation" | "other") => {
    await reportUser(partnerSessionId, category);
  };

  return (
    <>
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
        <div className="flex items-center gap-2 shrink-0">
          {/* Profile button */}
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Go to profile"
          >
            <User className="h-4 w-4" />
          </Button>
          {/* Menu button */}
          <div className="relative">
            <Button
              onClick={() => setShowMenu(!showMenu)}
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="More options"
              aria-expanded={showMenu}
              aria-haspopup="true"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                {/* Menu dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border-2 border-border rounded-lg shadow-lg z-20 font-mono">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportDialog(true);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-accent/10 text-foreground text-sm border-b border-border first:rounded-t-lg"
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
                    aria-label="Block user"
                  >
                    Block
                  </button>
                </div>
              </>
            )}
          </div>
          {/* End chat button */}
          <Button
            onClick={onEndChat}
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="End chat"
            data-testid="chat-end"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <BlockDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleBlock}
        partnerHandle={partnerHandle}
      />
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onConfirm={handleReport}
        partnerHandle={partnerHandle}
      />
    </>
  );
}

