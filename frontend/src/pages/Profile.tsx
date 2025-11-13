import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { VisibilityToggle } from "@/components/profile/VisibilityToggle";
import { EmergencyContactInput } from "@/components/profile/EmergencyContactInput";
import { AccessibilityToggles } from "@/components/profile/AccessibilityToggles";
import { PanicButton } from "@/components/panic/PanicButton";

/**
 * ProfileHeader Component
 * 
 * Header showing page title and DONE button.
 */
function ProfileHeader({ onDone }: { onDone: () => void }) {
  return (
    <header className="border-b border-border p-4 sm:p-6" role="banner">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-accent font-mono glow-accent">
          PROFILE
        </div>
        <Button
          onClick={onDone}
          variant="ghost"
          size="sm"
          className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-accent border-2 border-transparent hover:border-accent/50"
        >
          DONE
        </Button>
      </div>
    </header>
  );
}

/**
 * ProfileSection Component
 * 
 * Reusable section wrapper with title and ASCII divider.
 */
function ProfileSection({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg font-bold text-accent font-mono glow-accent">
        {title}
      </h2>
      <div className="ascii-divider text-xs">- - - - - - - - - -</div>
      {children}
    </div>
  );
}

/**
 * Profile Page
 * 
 * User profile/settings page with visibility controls, emergency contacts, and accessibility toggles.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { session } = useSession();

  // Redirect if no session
  if (!session) {
    navigate("/onboarding");
    return null;
  }

  const handleDone = () => {
    navigate("/radar");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProfileHeader onDone={handleDone} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6" role="main">
        <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-8">
          {/* Page heading - visible h1 for accessibility */}
          <h1 className="text-2xl font-bold text-accent font-mono glow-accent mb-4">
            Profile Settings
          </h1>
          
          {/* Handle Display */}
          <div className="space-y-6">
            <div className="ascii-divider text-center">▼ ▼ ▼</div>
            <div className="p-4 sm:p-6 border-2 border-border rounded-md bg-card text-center">
              <p className="text-xs text-muted-foreground mb-2 font-mono">YOUR HANDLE</p>
              <p className="text-xl sm:text-2xl font-mono text-accent glow-accent">
                @{session.handle}
              </p>
              <div className="mt-3 p-2 bg-muted/20 border border-border rounded-md inline-block">
                <p className="text-xs text-muted-foreground font-mono">
                  Generated from your vibe and tags. <span className="font-semibold text-foreground">Can't be changed.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Visibility Section */}
          <ProfileSection title="VISIBILITY">
            <VisibilityToggle />
          </ProfileSection>

          {/* Emergency Contact Section */}
          <ProfileSection title="EMERGENCY CONTACT">
            <p className="text-xs sm:text-sm text-muted-foreground font-mono mb-3">
              Used only in emergencies. Never shared with other users.
            </p>
            <EmergencyContactInput />
          </ProfileSection>

          {/* Accessibility Section */}
          <ProfileSection title="ACCESSIBILITY">
            <AccessibilityToggles />
          </ProfileSection>
        </div>
      </main>

      {/* Panic Button FAB - Always accessible for safety */}
      <PanicButton />
    </div>
  );
}

