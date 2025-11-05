"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Settings } from "lucide-react"
import Link from "next/link"
import { RetroHeader } from "@/components/retro-header"

export default function ProfilePage() {
  const [visibility, setVisibility] = useState(true)
  const [emergencyContact, setEmergencyContact] = useState("+1 (555) 123-4567")
  const [username] = useState("ChillThinker42")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RetroHeader
        title="PROFILE"
        rightAction={
          <Link href="/radar">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-accent border-2 border-transparent hover:border-accent/50"
            >
              DONE
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-8">
          <div className="space-y-4">
            <div className="ascii-divider text-center">▼ ▼ ▼</div>
            <div className="p-4 sm:p-6 border-4 border-accent/50 bg-accent/5 text-center retro-card">
              <p className="text-xs text-muted-foreground mb-2 font-mono">YOUR HANDLE</p>
              <p className="text-xl sm:text-2xl font-mono text-accent glow-accent">@{username}</p>
              <p className="text-xs text-muted-foreground mt-3 font-mono">Auto-generated from your vibe & tags</p>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-accent font-mono glow-accent">VISIBILITY</h2>
            <div className="ascii-divider text-xs">- - - - - - - - - -</div>
            <div className="p-3 sm:p-4 border-2 border-accent/30 rounded-xl space-y-4 bg-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {visibility ? (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono text-xs sm:text-sm">Show me on Radar</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Others can see you when nearby</div>
                  </div>
                </div>
                <Checkbox
                  checked={visibility}
                  onCheckedChange={(checked) => setVisibility(checked as boolean)}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Current Vibe */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-accent font-mono glow-accent">CURRENT VIBE</h2>
            <div className="ascii-divider text-xs">- - - - - - - - - -</div>
            <div className="p-3 sm:p-4 border-2 border-accent/30 rounded-xl bg-card">
              <div className="text-base sm:text-lg mb-2">🧠 Thinking out loud</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-accent font-mono text-xs border-2 border-transparent hover:border-accent/50"
              >
                Change vibe →
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-accent font-mono glow-accent">YOUR TAGS</h2>
            <div className="ascii-divider text-xs">- - - - - - - - - -</div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["Tech curious", "Builder brain", "Overthinking Things"].map((tag) => (
                <div
                  key={tag}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-accent bg-accent/10 text-accent text-xs sm:text-sm font-mono"
                >
                  {tag}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-dashed border-muted text-muted-foreground hover:border-accent hover:text-accent font-mono text-xs sm:text-sm"
              >
                + Add tag
              </Button>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-accent font-mono glow-accent">EMERGENCY CONTACT</h2>
            <div className="ascii-divider text-xs">- - - - - - - - - -</div>
            <div className="space-y-2">
              <Input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="rounded-xl bg-background border-2 border-accent/30 font-mono text-sm focus:border-accent h-10 sm:h-12"
              />
              <p className="text-xs text-muted-foreground">Notified if you use the Panic button</p>
            </div>
          </div>

          {/* Settings Link */}
          <Link href="/">
            <Button
              variant="outline"
              className="w-full rounded-xl border-2 border-accent/30 text-accent hover:bg-accent/10 font-mono bg-transparent h-11 sm:h-12 text-sm retro-button"
            >
              <Settings className="w-4 h-4 mr-2" />
              SETTINGS
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
