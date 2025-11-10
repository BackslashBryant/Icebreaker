import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { PanicButton } from "@/components/panic/PanicButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Chat Page
 * 
 * Terminal-style ephemeral 1:1 chat interface.
 * Black background, teal monospace text, no history.
 */
export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get partner info from location state (passed from Radar)
  const partnerSessionId = location.state?.partnerSessionId || null;
  const partnerHandle = location.state?.partnerHandle || "Unknown";

  const {
    chatState,
    messages,
    proximityWarning,
    sendMessage,
    acceptChat,
    declineChat,
    endChat,
    isConnected,
  } = useChat({
    partnerSessionId,
    partnerHandle,
    onChatEnd: () => {
      toast({
        title: "Chat ended",
        description: "Connection lost. Chat deleted.",
      });
      navigate("/radar");
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Escape key to end chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && chatState === "active") {
        endChat();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [chatState, endChat]);

  // Show different UI based on chat state
  if (chatState === "requesting") {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground font-mono">
        <ChatHeader
          partnerHandle={partnerHandle}
          onEndChat={() => navigate("/radar")}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Requesting chat...</p>
        </div>
      </div>
    );
  }

  if (chatState === "pending") {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground font-mono">
        <ChatHeader
          partnerHandle={partnerHandle}
          onEndChat={() => navigate("/radar")}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-foreground text-center">
            {partnerHandle} wants to chat
          </p>
          <div className="flex gap-4">
            <Button onClick={acceptChat} className="font-mono">
              Accept
            </Button>
            <Button onClick={declineChat} variant="outline" className="font-mono">
              Decline
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (chatState === "ended") {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground font-mono">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-foreground">Connection lost. Chat deleted.</p>
            <Button onClick={() => navigate("/radar")} className="font-mono">
              Return to Radar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active chat state
  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-mono">
      <ChatHeader
        partnerHandle={partnerHandle}
        partnerSessionId={partnerSessionId || ""}
        onEndChat={endChat}
        proximityWarning={proximityWarning}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Chat started. Say hello!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Show divider if there's a time gap > 5 minutes
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const timeDiff = prevMessage
              ? message.timestamp - prevMessage.timestamp
              : Infinity;
            const showDivider = timeDiff > 5 * 60 * 1000; // 5 minutes

            return (
              <ChatMessage
                key={`${message.timestamp}-${index}`}
                message={message}
                showDivider={showDivider}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSend={sendMessage}
        disabled={!isConnected || chatState !== "active"}
        placeholder={
          !isConnected
            ? "Connecting..."
            : chatState !== "active"
            ? "Chat not active"
            : "Type a message..."
        }
      />
      {/* Panic Button FAB */}
      <PanicButton />
    </div>
  );
}

