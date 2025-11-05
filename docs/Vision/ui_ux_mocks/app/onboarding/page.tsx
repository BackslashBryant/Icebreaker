"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Check, X } from "lucide-react"
import Link from "next/link"
import { generateUsername } from "@/lib/username-generator"

const VIBES = [
  { id: "banter", label: "Up for banter", emoji: "🙃" },
  { id: "intros", label: "Open to intros", emoji: "🤝" },
  { id: "thinking", label: "Thinking out loud", emoji: "🧠" },
  { id: "killing-time", label: "Killing time", emoji: "⏳" },
  { id: "surprise", label: "Surprise me", emoji: "🎲" },
]

const TAGS = [
  "Quietly Curious",
  "Creative Energy",
  "Overthinking Things",
  "Big Sci-Fi Brain",
  "Here for the humans",
  "Builder brain",
  "Tech curious",
  "Lo-fi head",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [consent, setConsent] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState(true)
  const [username, setUsername] = useState("")

  useEffect(() => {
    if (selectedVibe || selectedTags.length > 0) {
      setUsername(generateUsername(selectedVibe || undefined, selectedTags))
    }
  }, [selectedVibe, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 my-8">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span className="glow-accent text-accent">STEP {step + 1}/4</span>
          <div className="flex gap-1.5 sm:gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-8 sm:w-10 border-2 ${i <= step ? "bg-accent border-accent" : "bg-transparent border-muted"}`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="ascii-divider text-center mb-4">▼ ▼ ▼</div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">WHAT IS ICEBREAKER?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Before we start, let's be clear about what this is and what it isn't.
              </p>
            </div>

            <div className="space-y-4">
              {/* What We Are */}
              <div className="p-4 border-2 border-accent/50 rounded-xl bg-accent/5">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-accent" />
                  <h3 className="font-mono text-sm text-accent font-bold">WE ARE</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground font-mono">
                  <li>→ Proximity-based connections</li>
                  <li>→ Ephemeral and anonymous</li>
                  <li>→ Brief, authentic moments</li>
                  <li>→ Privacy-first and safe</li>
                </ul>
              </div>

              {/* What We're Not */}
              <div className="p-4 border-2 border-muted/50 rounded-xl bg-muted/5">
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-mono text-sm text-muted-foreground font-bold">WE'RE NOT</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground/70 font-mono">
                  <li>→ A dating app</li>
                  <li>→ A social network</li>
                  <li>→ Permanent or public</li>
                  <li>→ Trying too hard</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent"
            >
              GOT IT →
            </Button>
          </div>
        )}

        {/* Step 1: 18+ Consent */}
        {step === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="ascii-divider text-center mb-4">▼ ▼ ▼</div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">AGE VERIFICATION</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                IceBreaker is for adults only. We need to confirm you're 18 or older to continue.
              </p>
            </div>

            <div className="flex items-start space-x-3 p-3 sm:p-4 border-2 border-accent/50 rounded-xl bg-card">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
                I confirm I am 18 or older and agree to use IceBreaker responsibly.
              </label>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!consent}
              className="w-full rounded-xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent disabled:opacity-50"
            >
              CONTINUE →
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-accent bg-accent/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
              </div>
              <div className="ascii-divider text-xs">- - - - - - - - - -</div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">LOCATION ACCESS</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We use <span className="text-accent">approximate location</span> to connect you with nearby people. Not
                stored long-term.
              </p>
              <div className="p-3 sm:p-4 bg-muted/30 border-2 border-accent/30 rounded-xl">
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  → Approximate distance only
                  <br />→ No background tracking
                  <br />→ Session-based only
                  <br />→ <span className="text-accent">Your privacy matters</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setStep(3)}
                className="w-full rounded-xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent"
              >
                ENABLE LOCATION
              </Button>
              <Button
                onClick={() => setStep(3)}
                variant="ghost"
                className="w-full rounded-xl text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted text-sm"
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Vibe & Tags */}
        {step === 3 && (
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              {username && (
                <div className="p-3 border-2 border-accent/50 rounded-xl bg-accent/5 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Your anonymous handle:</p>
                  <p className="text-base sm:text-lg font-mono text-accent glow-accent">{username}</p>
                </div>
              )}

              {/* Vibe Selection */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="ascii-divider text-xs mb-2">▼ ▼ ▼</div>
                  <h2 className="text-lg sm:text-xl font-bold text-accent font-mono glow-accent mb-2">YOUR VIBE</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    What kind of energy are you putting out right now?
                  </p>
                </div>
                <div className="space-y-2">
                  {VIBES.map((vibe) => (
                    <button
                      key={vibe.id}
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left font-mono text-sm sm:text-base ${
                        selectedVibe === vibe.id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-muted/50 hover:border-accent/50"
                      }`}
                    >
                      <span className="mr-2">{vibe.emoji}</span>
                      {vibe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="ascii-divider text-xs mb-2">- - - - - - - - - -</div>
                  <h2 className="text-lg sm:text-xl font-bold text-accent font-mono glow-accent mb-2">
                    TAGS (OPTIONAL)
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Want to give folks a sense of your wavelength?
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 text-xs sm:text-sm font-mono transition-all ${
                        selectedTags.includes(tag)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-muted/50 text-muted-foreground hover:border-accent/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 font-mono">
                    ⚠ No tags = reduced discoverability on radar
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 border-2 border-accent/30 rounded-xl bg-card">
                <div className="flex-1 pr-3">
                  <span className="font-mono text-xs sm:text-sm block mb-1">Show me on the radar</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground/60">
                    Others can see and chat with you
                  </span>
                </div>
                <Checkbox checked={visibility} onCheckedChange={(checked) => setVisibility(checked as boolean)} />
              </div>
            </div>

            <Button
              asChild
              disabled={!selectedVibe}
              className="w-full rounded-xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent disabled:opacity-50"
            >
              <Link href="/radar">ENTER RADAR →</Link>
            </Button>
          </div>
        )}

        {/* Back button */}
        {step > 0 && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted rounded-xl text-sm"
          >
            ← BACK
          </Button>
        )}
      </div>
    </div>
  )
}
