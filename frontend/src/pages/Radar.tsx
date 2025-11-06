import { useSession } from "@/hooks/useSession";

// Placeholder - will be implemented later
export default function Radar() {
  const { session } = useSession();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-accent font-mono glow-accent">RADAR</h1>
        <p className="text-muted-foreground font-mono">
          {session ? `Welcome, ${session.handle}!` : "No session found"}
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">
          Radar view coming soon...
        </p>
      </div>
    </div>
  );
}
