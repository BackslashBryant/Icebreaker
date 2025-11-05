"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PanicDemoPage() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePanic = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setShowConfirm(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 my-8">
        {!showConfirm && !showSuccess && (
          <>
            <div className="text-center space-y-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icebreaker%20-%20Pulse-tijI8024ZpFocxzGnn72A66I5d3AzZ.png"
                alt="IceBreaker"
                width={64}
                height={64}
                className="mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16"
              />
              <div className="ascii-divider">▼ ▼ ▼</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-4 border-red-500 bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-red-500 font-mono glow-accent">PANIC BUTTON</h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                This is a demo of the Panic feature. In the real app, this button is always accessible from Radar and
                Chat screens.
              </p>
            </div>

            <div className="space-y-4 p-4 sm:p-6 border-2 border-accent/30 rounded-xl bg-card">
              <h2 className="font-mono text-xs sm:text-sm text-accent glow-accent">WHAT IT DOES:</h2>
              <div className="ascii-divider text-xs">- - - - - - - - - -</div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono flex-shrink-0">→</span>
                  <span>Immediately ends current session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono flex-shrink-0">→</span>
                  <span>Alerts your emergency contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono flex-shrink-0">→</span>
                  <span>Shares approximate location & time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono flex-shrink-0">→</span>
                  <span>Hides you from Radar temporarily</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono h-11 sm:h-12 text-sm retro-button border-2 border-red-500"
            >
              TRY PANIC FLOW →
            </Button>

            <Link href="/radar">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground font-mono border-2 border-transparent hover:border-muted rounded-xl text-sm"
              >
                ← BACK TO RADAR
              </Button>
            </Link>
          </>
        )}

        {showConfirm && !showSuccess && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-4 border-red-500 bg-red-500/10 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <div className="ascii-divider">▼ ▼ ▼</div>
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">Everything okay?</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                This will end your session and alert your emergency contact.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePanic}
                className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono h-11 sm:h-12 text-sm retro-button border-2 border-red-500"
              >
                SEND ALERT & EXIT
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                className="w-full rounded-xl border-2 border-accent/30 text-accent hover:bg-accent/10 font-mono bg-transparent text-sm"
              >
                Never mind
              </Button>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-accent border-4 border-accent flex items-center justify-center">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-background" />
            </div>
            <div className="ascii-divider">▼ ▼ ▼</div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">You're safe.</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Session ended.</p>
            </div>
            <div className="p-3 sm:p-4 bg-card border-2 border-accent/30 rounded-xl">
              <p className="text-xs font-mono text-muted-foreground">
                Emergency contact notified with:
                <br />→ Time: 14:32
                <br />→ Location: ~0.2mi from campus center
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
