"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Stage progression
    const stageTimer = setTimeout(() => {
      if (stage < 4) {
        setStage(stage + 1)
      } else {
        onComplete()
      }
    }, 800)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 20)

    return () => {
      clearTimeout(stageTimer)
      clearInterval(progressInterval)
    }
  }, [stage, onComplete])

  const bootMessages = [
    "INITIALIZING ICEBREAKER v1.0...",
    "LOADING SIGNAL ENGINE...",
    "CALIBRATING PROXIMITY SENSORS...",
    "ESTABLISHING SECURE CONNECTION...",
    "READY",
  ]

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 font-mono">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo-128.png" alt="IceBreaker" width={80} height={80} className="opacity-80" />
        </div>

        {/* ASCII Art */}
        <div className="text-accent text-xs leading-tight text-center glow-accent">
          <pre>{`
 _____ _____ _____ _____ _____ _____ _____ _____ _____ 
|     |     |   __|  _  |  _  |   __|  _  |  |  |   __|
|-   -|   --|   __|     |   __|   __|     |    -|   __|
|_____|_____|_____|__|__|__|  |_____|__|__|__|__|_____|
          `}</pre>
        </div>

        {/* Boot Messages */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {bootMessages.slice(0, stage + 1).map((msg, i) => (
            <div key={i} className={`${i === stage ? "text-accent glow-accent" : ""}`}>
              {i === stage ? ">" : "✓"} {msg}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 border-2 border-accent/50 bg-background relative overflow-hidden">
            <div className="h-full bg-accent transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-center text-xs text-muted-foreground">{progress}% COMPLETE</div>
        </div>

        {/* Blinking cursor */}
        <div className="text-accent text-sm">
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  )
}
