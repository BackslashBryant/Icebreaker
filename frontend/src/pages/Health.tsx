import { HealthStatus } from "@/components/HealthStatus";

/**
 * Health Page
 * 
 * Dev/monitoring page that displays backend health status.
 * Used for E2E health checks and monitoring.
 */
export default function Health() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent font-mono">
          Health Check
        </h1>
        <div className="ascii-divider text-xs">- - - - - - - - - -</div>
        <HealthStatus />
      </div>
    </div>
  );
}



