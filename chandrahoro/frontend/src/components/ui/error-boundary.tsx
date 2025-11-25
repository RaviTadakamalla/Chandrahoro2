'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from './button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={this.reset} variant="default" size="sm">
              Try again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Reload page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 w-full text-left">
              <summary className="cursor-pointer text-xs font-mono text-muted-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary, type ErrorBoundaryProps };

