"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"
import Link from "next/link"
import { RetroHeader } from "@/components/retro-header"
import { PanicButton } from "@/components/panic-button"

interface Person {
  id: string
  handle: string
  x: number
  y: number
  signal: number
  vibe: string
  tags: string[]
}

const MOCK_PEOPLE: Person[] = [
  {
    id: "1",
    handle: "ChillThinker42",
    x: 45,
    y: 40,
    signal: 85,
    vibe: "🧠 Thinking out loud",
    tags: ["Tech curious", "Builder brain"],
  },
  { id: "2", handle: "QuietObserver88", x: 60, y: 55, signal: 72, vibe: "⏳ Killing time", tags: ["Quietly Curious"] },
  { id: "3", handle: "BrightSpark91", x: 35, y: 60, signal: 68, vibe: "🙃 Up for banter", tags: ["Creative Energy"] },
  { id: "4", handle: "CalmWildcard55", x: 70, y: 35, signal: 55, vibe: "🎲 Surprise me", tags: [] },
  {
    id: "5",
    handle: "MellowAnalyzer77",
    x: 25,
    y: 50,
    signal: 80,
    vibe: "🧠 Thinking out loud",
    tags: ["Overthinking Things", "Tech curious"],
  },
]

export default function RadarPage() {
  const [sweepAngle, setSweepAngle] = useState(0)
  const [viewMode, setViewMode] = useState<"radar" | "list">("radar")
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 1.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const sortedPeople = [...MOCK_PEOPLE].sort((a, b) => b.signal - a.signal)
  const topPeople = sortedPeople.slice(0, 3) // Show labels for top 3 signals

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <RetroHeader
        title="RADAR"
        showPanic={true}
        rightAction={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "radar" ? "list" : "radar")}
              className="text-muted-foreground hover:text-accent border-2 border-transparent hover:border-accent/50"
              aria-label={viewMode === "radar" ? "Switch to list view" : "Switch to radar view"}
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-accent border-2 border-transparent hover:border-accent/50"
              >
                PROFILE
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
        {viewMode === "radar" ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-square max-h-full mx-auto">
              {/* Radar circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border-2 border-accent/20"
                    style={{
                      width: `${i * 25}%`,
                      height: `${i * 25}%`,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div
                  className="absolute h-0.5 bg-gradient-to-r from-accent/80 to-transparent"
                  style={{
                    width: "50%",
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${sweepAngle}deg)`,
                    transformOrigin: "left center",
                    transition: "transform 0.05s linear",
                  }}
                />
              </div>

              {/* People dots with labels */}
              {MOCK_PEOPLE.map((person) => {
                const signalOpacity = 0.3 + (person.signal / 100) * 0.7
                const isTopSignal = topPeople.includes(person)

                const labelOffset = person.x > 50 ? "left-full ml-2" : "right-full mr-2"
                const labelAlign = person.x > 50 ? "text-left" : "text-right"

                return (
                  <div
                    key={person.id}
                    className="absolute"
                    style={{
                      left: `${person.x}%`,
                      top: `${person.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="relative w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-accent hover:scale-150 transition-transform cursor-pointer border-2 border-accent z-10"
                      style={{
                        opacity: signalOpacity,
                        boxShadow: `0 0 ${8 + (person.signal / 100) * 20}px ${4 + (person.signal / 100) * 8}px rgba(0, 184, 217, ${signalOpacity})`,
                      }}
                      aria-label={`View ${person.handle}`}
                    />

                    {isTopSignal && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 ${labelOffset} whitespace-nowrap pointer-events-none hidden sm:block`}
                      >
                        <div className={`font-mono text-xs ${labelAlign} space-y-0.5`}>
                          <div className="text-accent glow-accent" style={{ opacity: signalOpacity }}>
                            @{person.handle}
                          </div>
                          <div
                            className="text-[10px] text-muted-foreground border border-accent/30 px-1 inline-block"
                            style={{ opacity: signalOpacity }}
                          >
                            {person.signal}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Selected person card */}
              {selectedPerson && (
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-background/95 border-t-4 border-accent backdrop-blur z-20">
                  <div className="pixel-border-bottom mb-3" />
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm sm:text-base text-accent glow-accent">
                        @{selectedPerson.handle}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono border-2 border-accent/30 px-2 py-1">
                        SIGNAL: {selectedPerson.signal}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm">{selectedPerson.vibe}</p>
                    {selectedPerson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedPerson.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-accent/10 text-accent border-2 border-accent/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button
                      asChild
                      className="w-full rounded-xl bg-accent hover:bg-accent/90 text-background font-mono text-sm retro-button border-2 border-accent"
                    >
                      <Link href="/chat">START CHAT →</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-2 sm:space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">{MOCK_PEOPLE.length} PEOPLE NEARBY</p>
              <div className="ascii-divider text-xs">- - - -</div>
            </div>
            {MOCK_PEOPLE.sort((a, b) => b.signal - a.signal).map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="w-full p-3 sm:p-4 border-2 border-accent/30 rounded-xl hover:border-accent transition-colors text-left bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm sm:text-base text-accent">@{person.handle}</span>
                  <span className="text-xs text-muted-foreground font-mono border border-accent/30 px-2 py-0.5">
                    {person.signal}
                  </span>
                </div>
                <p className="text-xs sm:text-sm mb-2">{person.vibe}</p>
                {person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {person.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-accent/10 text-accent border border-accent/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <PanicButton />
    </div>
  )
}
