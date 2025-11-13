import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

/**
 * EmergencyContactInput Component
 * 
 * Input field for emergency contact (phone or email).
 */
export function EmergencyContactInput() {
  const { session } = useSession();
  const { updateEmergencyContact, loading } = useProfile();
  const [value, setValue] = useState(session?.emergencyContact || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with session emergency contact
  useEffect(() => {
    if (session?.emergencyContact !== undefined) {
      setValue(session.emergencyContact || "");
    }
  }, [session?.emergencyContact]);

  const handleSave = async () => {
    const trimmedValue = value.trim();
    const contactValue = trimmedValue === "" ? null : trimmedValue;

    setIsSaving(true);
    const result = await updateEmergencyContact(contactValue);

    if (result.success) {
      setIsEditing(false);
      toast.success("Emergency contact saved", {
        description: contactValue
          ? "Contact will be notified if you use the Panic button"
          : "Emergency contact cleared",
      });
    } else {
      toast.error("Failed to save emergency contact", {
        description: result.error || "Please try again",
      });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    // Revert to session value
    setValue(session?.emergencyContact || "");
    setIsEditing(false);
  };

  // Basic validation
  const isValid = (contact: string): boolean => {
    if (!contact.trim()) return true; // Empty is valid (clears contact)

    // Phone: E.164 format (+1234567890)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (phoneRegex.test(contact.trim())) return true;

    // Email: Basic RFC 5322 format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(contact.trim())) return true;

    return false;
  };

  const validationError =
    value.trim() && !isValid(value)
      ? "Must be a valid phone number (+1234567890) or email address"
      : null;

  if (!isEditing) {
    return (
      <div className="p-3 sm:p-4 border-2 border-border rounded-md bg-card space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs sm:text-sm text-muted-foreground">
              {value || "No emergency contact set"}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Notified if you use the Panic button
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="font-mono text-xs border-2 border-transparent hover:border-accent/50"
            aria-label="Edit emergency contact"
          >
            {value ? "Edit" : "Add"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 border-2 border-border rounded-md bg-card space-y-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+1234567890 or email@example.com"
        className="rounded-md bg-background border-2 border-border font-mono text-sm focus:border-accent h-10 sm:h-12"
        aria-label="Emergency contact"
        aria-invalid={validationError ? "true" : "false"}
        aria-describedby={validationError ? "emergency-contact-error" : undefined}
      />
      {validationError && (
        <p
          id="emergency-contact-error"
          className="text-xs text-destructive font-mono"
          role="alert"
        >
          {validationError}
        </p>
      )}
      <p className="text-[10px] sm:text-xs text-muted-foreground">
        Notified if you use the Panic button
      </p>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || loading || !!validationError}
          variant="default"
          size="sm"
          className="font-mono text-xs"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isSaving || loading}
          variant="ghost"
          size="sm"
          className="font-mono text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

