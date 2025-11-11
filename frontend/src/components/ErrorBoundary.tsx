/**
 * Error Boundary Component
 * 
 * Catches React errors and sends them to Sentry.
 * Displays a user-friendly error message.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload page to reset app state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-accent font-mono glow-accent">
                OOPS
              </h1>
              <p className="text-muted-foreground">
                Something went wrong. We've been notified and are looking into it.
              </p>
            </div>
            <Button
              onClick={this.handleReset}
              className="w-full rounded-2xl bg-accent hover:bg-accent/90 text-background font-mono retro-button border-2 border-accent"
            >
              RELOAD PAGE
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

