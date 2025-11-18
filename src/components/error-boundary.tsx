"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md space-y-4 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                Component Error
              </h3>
              <p className="text-sm text-muted-foreground">
                This component encountered an error and couldn't render.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-muted p-3 rounded text-left">
                <p className="text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
