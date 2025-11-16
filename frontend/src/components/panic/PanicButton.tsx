import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { usePanic } from "@/hooks/usePanic";
import { PanicDialog } from "./PanicDialog";
import { PanicSuccess } from "./PanicDialog";

/**
 * PanicButton Component
 * 
 * Fixed floating action button (FAB) for emergency exit.
 * Always visible on Radar, Chat (all states), and Profile screens.
 * 
 * Brand: Teal accent, calm, accessible.
 * Z-index: z-[60] to ensure it's always on top of other elements.
 */
interface PanicButtonProps {
  className?: string;
}

export function PanicButton({ className = "" }: PanicButtonProps) {
  const {
    showDialog,
    showSuccess,
    exclusionExpiresAt,
    triggerPanic,
    confirmPanic,
    closeDialog,
    closeSuccess,
  } = usePanic();

  // If success state, show success component instead of button
  if (showSuccess) {
    return <PanicSuccess exclusionExpiresAt={exclusionExpiresAt} onClose={closeSuccess} />;
  }

  return (
    <>
      <Button
        onClick={triggerPanic}
        size="lg"
        className={`fixed bottom-6 right-6 z-[60] h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all border-2 border-accent p-0 ${className}`}
        aria-label="Emergency panic button"
        title="Panic button - End session and alert contacts"
        data-testid="panic-fab"
      >
        <AlertTriangle className="w-6 h-6 sm:w-7 sm:w-7" aria-hidden="true" />
      </Button>
      <PanicDialog isOpen={showDialog} onClose={closeDialog} onConfirm={confirmPanic} />
    </>
  );
}

