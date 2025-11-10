export interface ChatMessage {
  text: string;
  timestamp: number;
  sender: "me" | "them";
}

interface ChatMessageProps {
  message: ChatMessage;
  showDivider?: boolean;
}

/**
 * Format timestamp as [HH:MM]
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `[${hours}:${minutes}]`;
}

/**
 * ChatMessage Component
 * 
 * Terminal-style message display with timestamp.
 * Shows [HH:MM] timestamp and message text in monospace font.
 */
export function ChatMessage({ message, showDivider = false }: ChatMessageProps) {
  const timeStr = formatTime(message.timestamp);
  const isMe = message.sender === "me";

  return (
    <>
      {showDivider && (
        <div className="text-muted-foreground text-xs font-mono py-2" role="separator">
          ──────────────────────────────────────
        </div>
      )}
      <div
        className={`flex gap-2 font-mono text-sm ${
          isMe ? "justify-end" : "justify-start"
        }`}
        role="article"
        aria-label={`Message from ${isMe ? "you" : "partner"} at ${timeStr}`}
      >
        {!isMe && (
          <span className="text-muted-foreground text-xs shrink-0" aria-hidden="true">
            {timeStr}
          </span>
        )}
        <span
          className={`px-3 py-1.5 rounded ${
            isMe
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {message.text}
        </span>
        {isMe && (
          <span className="text-muted-foreground text-xs shrink-0" aria-hidden="true">
            {timeStr}
          </span>
        )}
      </div>
    </>
  );
}

