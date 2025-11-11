/**
 * Error Handler Middleware
 * 
 * Catches unhandled errors and sends them to Sentry.
 * Returns user-friendly error responses.
 */

import * as Sentry from "@sentry/node";

/**
 * Initialize Sentry for backend error tracking
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  // Only initialize if DSN is provided
  if (!dsn) {
    console.log("[Sentry] DSN not provided, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.httpIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Release tracking
    release: process.env.APP_VERSION || "0.1.0",
    // Filter out development errors
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly testing
      if (environment === "development" && !process.env.SENTRY_ENABLE_DEV) {
        return null;
      }
      return event;
    },
  });

  console.log(`[Sentry] Initialized for environment: ${environment}`);
}

/**
 * Express error handler middleware
 * Catches errors and sends them to Sentry
 */
export function errorHandler(err, req, res, next) {
  // Send error to Sentry
  Sentry.captureException(err, {
    tags: {
      route: req.path,
      method: req.method,
    },
    extra: {
      sessionId: req.session?.sessionId,
      body: req.body,
      query: req.query,
    },
  });

  console.error("Error handler caught:", err);

  // Return user-friendly error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "An error occurred. Please try again later." 
        : message,
    },
  });
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

