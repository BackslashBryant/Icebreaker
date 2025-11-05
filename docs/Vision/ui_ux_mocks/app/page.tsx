import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        <div className="text-center space-y-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icebreaker%20-%20Primary-zgQHzknc9SxVruCRUKvcHGc92Eqxux.png"
            alt="IceBreaker"
            width={140}
            height={140}
            className="mx-auto animate-pulse-slow w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent glow-accent font-mono">
            ICEBREAKER MOCKUPS
          </h1>
          <div className="ascii-divider text-center">- - - - - - - - - -</div>
          <p className="text-sm sm:text-base text-muted-foreground font-mono">Navigate through the key screens</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/welcome"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">01_WELCOME</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Brand moment & entry point</p>
          </Link>

          <Link
            href="/onboarding"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">02_ONBOARDING</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Consent, location, vibe & tags</p>
          </Link>

          <Link
            href="/radar"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">03_RADAR</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Ambient presence view</p>
          </Link>

          <Link
            href="/chat"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">04_CHAT</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Ephemeral conversation</p>
          </Link>

          <Link
            href="/profile"
            className="p-4 sm:p-6 border-2 border-accent rounded-xl hover:bg-accent/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2 font-mono glow-accent">05_PROFILE</h2>
            <div className="ascii-divider text-xs mb-2">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Agency & control</p>
          </Link>

          <Link
            href="/panic-demo"
            className="p-4 sm:p-6 border-2 border-red-500 rounded-xl hover:bg-red-500/10 transition-colors bg-card"
          >
            <h2 className="text-lg sm:text-xl font-bold text-red-500 mb-2 font-mono">06_PANIC</h2>
            <div className="ascii-divider text-xs mb-2 text-red-500/30">- - - - -</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Safety controls</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
