/**
 * Sentry Error Tracking Configuration
 * 
 * Initializes Sentry for error tracking and performance monitoring.
 * Only initializes in production or when SENTRY_DSN is provided.
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";

  // Only initialize if DSN is provided
  if (!dsn) {
    console.log("[Sentry] DSN not provided, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Mask PII in replays
        blockAllMedia: true, // Block media in replays for privacy
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Session Replay
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // Always capture replays on errors
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || "0.1.0",
    // Filter out development errors
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly testing
      if (environment === "development" && !import.meta.env.VITE_SENTRY_ENABLE_DEV) {
        return null;
      }
      return event;
    },
  });

  console.log(`[Sentry] Initialized for environment: ${environment}`);
}

