import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ConsentStepProps {
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  onContinue: () => void;
}

export function ConsentStep({ consent, onConsentChange, onContinue }: ConsentStepProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-6">
        <div className="ascii-divider text-center mb-6">▼ ▼ ▼</div>
        <h2 className="text-xl sm:text-2xl font-bold text-accent font-mono glow-accent">AGE VERIFICATION</h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          IceBreaker is 18+ only — a safe, controlled space. Confirm you're 18 or older to continue.
        </p>
      </div>

      <div className="flex items-start space-x-3 p-3 sm:p-4 border-2 border-border rounded-md bg-card">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => onConsentChange(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="consent" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
          I am 18 or older
        </label>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        By continuing, you agree to use IceBreaker responsibly.
      </p>

      <Button
        onClick={onContinue}
        disabled={!consent}
        className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono h-11 sm:h-12 text-sm retro-button border-2 border-accent disabled:opacity-50"
        data-testid="onboarding-continue"
      >
        CONTINUE →
      </Button>
    </div>
  );
}
