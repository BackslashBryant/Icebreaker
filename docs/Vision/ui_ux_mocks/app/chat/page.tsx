"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, Send } from "lucide-react"
import { RetroHeader } from "@/components/retro-header"
import { PanicButton } from "@/components/panic-button"

interface Message {
  id: string
  sender: "me" | "them"
  text: string
  time: string
}

const MOCK_MESSAGES: Message[] = [
  { id: "1", sender: "them", text: "hey! saw you were thinking out loud too", time: "14:23" },
  { id: "2", sender: "me", text: "yeah, just working through some ideas", time: "14:23" },
  { id: "3", sender: "them", text: "what kind of stuff are you building?", time: "14:24" },
  { id: "4", sender: "me", text: "proximity-based app actually. you?", time: "14:24" },
  { id: "5", sender: "them", text: "nice! im doing some ML stuff for a hackathon", time: "14:25" },
]

export default function ChatPage() {
  const [messages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState("")
  const [showSignalWarning, setShowSignalWarning] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RetroHeader
        title="@ChillThinker42"
        showLogo={true}
        showPanic={true}
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-accent border-2 border-transparent hover:border-accent/50"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        }
      />

      <div className="border-b-2 border-accent/20 px-3 sm:px-4 py-2 bg-card flex-shrink-0">
        <div className="w-full space-y-1">
          <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 flex-wrap">
            <span>🧠 Thinking out loud</span>
            <span className="text-accent">·</span>
            <span className="text-accent">Signal strong</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-mono">
            ⏱ Ephemeral — chat ends when you leave range
          </p>
        </div>
      </div>

      {showSignalWarning && (
        <div className="border-b-2 border-yellow-500/50 bg-yellow-500/10 px-3 sm:px-4 py-2 flex-shrink-0">
          <div className="w-full">
            <p className="text-xs font-mono text-yellow-500">⚠ Signal weak — chat may end</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
        <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 pb-20">
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {(idx === 0 || messages[idx - 1].time !== msg.time) && (
                <div className="flex items-center gap-2 sm:gap-3 my-4 sm:my-6">
                  <div className="ascii-divider flex-1 text-[10px] sm:text-xs">- - - - - - - - - -</div>
                  <span className="text-[10px] sm:text-xs font-mono text-accent border-2 border-accent/30 px-2 py-1">
                    {msg.time}
                  </span>
                  <div className="ascii-divider flex-1 text-[10px] sm:text-xs">- - - - - - - - - -</div>
                </div>
              )}

              <div className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 border-2 font-mono text-xs sm:text-sm ${
                    msg.sender === "me"
                      ? "bg-accent/10 text-accent border-accent/50"
                      : "bg-card text-foreground border-muted"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-6">
            <div className="ascii-divider text-[10px] sm:text-xs">- - - -</div>
            <span className="text-[10px] sm:text-xs font-mono text-accent border-2 border-accent/30 px-2 sm:px-3 py-1">
              ▲ SIGNAL STRONG
            </span>
            <div className="ascii-divider text-[10px] sm:text-xs">- - - -</div>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-accent/30 p-3 sm:p-4 bg-card flex-shrink-0">
        <div className="pixel-border-bottom mb-3 sm:mb-4" />
        <div className="w-full max-w-2xl mx-auto flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="rounded-xl bg-background border-2 border-accent/30 font-mono text-xs sm:text-sm focus:border-accent h-10 sm:h-12"
            />
            {!input && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-muted-foreground/50 font-mono text-xs sm:text-sm cursor-blink" />
              </div>
            )}
          </div>
          <Button
            size="icon"
            className="rounded-xl bg-accent hover:bg-accent/90 text-background retro-button border-2 border-accent h-10 w-10 sm:h-12 sm:w-12"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <PanicButton />
    </div>
  )
}
