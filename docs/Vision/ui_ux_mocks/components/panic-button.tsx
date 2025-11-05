import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function PanicButton() {
  return (
    <Link href="/panic-demo" className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-lg hover:shadow-xl transition-all retro-button border-4 border-destructive p-0 animate-pulse-slow"
        aria-label="Emergency panic button"
      >
        <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
      </Button>
    </Link>
  )
}
