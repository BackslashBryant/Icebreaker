import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      className="toaster group font-mono"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "2px solid var(--accent)",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-mono)",
          boxShadow: "0 0 20px rgba(0, 184, 217, 0.3)",
        },
        className: "retro-button glow-accent",
      }}
    />
  );
}

