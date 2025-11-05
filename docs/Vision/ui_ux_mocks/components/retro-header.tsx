import type React from "react"
import Image from "next/image"
import Link from "next/link"

interface RetroHeaderProps {
  title: string
  showLogo?: boolean
  rightAction?: React.ReactNode
}

export function RetroHeader({ title, showLogo = true, rightAction }: RetroHeaderProps) {
  return (
    <div className="border-b-4 border-accent/30 bg-background/95 backdrop-blur-sm z-40 flex-shrink-0">
      <div className="pixel-border-bottom" />
      <div className="w-full px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showLogo && (
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-64.png"
                alt="IceBreaker"
                width={32}
                height={32}
                className="hover:opacity-80 transition-opacity w-6 h-6 sm:w-8 sm:h-8"
              />
            </Link>
          )}
          <h1 className="text-base sm:text-xl font-bold text-accent font-mono tracking-wider truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex items-center gap-2 flex-shrink-0">{rightAction}</div>}
      </div>
    </div>
  )
}
