import { useState, useEffect } from "react";

type HealthResponse = {
  status: string;
};

/**
 * HealthStatus Component
 *
 * Displays the health status from the backend API on the welcome screen.
 */
export function HealthStatus(): JSX.Element {
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: HealthResponse = await res.json();
        if (isActive) {
          setStatus(data.status);
          setError(null);
        }
      } catch (err) {
        if (!isActive) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setStatus("error");
      }
    };

    fetchHealth();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section
      aria-live="polite"
      className="mt-6 rounded-lg border border-muted/40 bg-muted/10 p-4 text-left text-sm text-muted-foreground"
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        Health Status
      </h2>
      {error ? (
        <p role="status" className="font-medium text-destructive">
          Error: {error}
        </p>
      ) : (
        <p role="status">
          Status: <span className="font-semibold text-foreground">{status}</span>
        </p>
      )}
    </section>
  );
}
