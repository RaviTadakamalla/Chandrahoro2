'use client';

import React from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Enhanced Error Boundary Component
 * 
 * Catches React errors and displays user-friendly fallback UI
 * with retry functionality and error reporting.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetError();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  resetErrorAfterDelay = (delay: number = 100) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} />;
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
}: {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorState
      type="generic"
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred while rendering this component.'}
      onRetry={resetError}
      onGoHome={handleGoHome}
      customActions={
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleReload}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Go Home
          </button>
        </div>
      }
      className="m-4"
    >
      {/* Development Error Details */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 w-full text-left">
          <summary className="cursor-pointer text-sm font-mono text-muted-foreground mb-2">
            Error Details (Development Only)
          </summary>
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-semibold mb-1">Error Message:</h4>
              <pre className="bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Stack Trace:</h4>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-40">
                {error.stack}
              </pre>
            </div>
            
            {errorInfo && (
              <div>
                <h4 className="font-semibold mb-1">Component Stack:</h4>
                <pre className="bg-muted p-2 rounded overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </ErrorState>
  );
}

/**
 * Error Boundary Hook
 * 
 * Custom hook for functional components to handle errors.
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
  };
}

/**
 * Async Error Boundary Component
 * 
 * Catches async errors and promise rejections.
 */
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  const { captureError } = useErrorBoundary();

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(new Error(event.reason));
    };

    const handleError = (event: ErrorEvent) => {
      captureError(new Error(event.message));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [captureError]);

  return <>{children}</>;
}

/**
 * Error Boundary with Retry Logic
 * 
 * Automatically retries after a delay.
 */
export function RetryErrorBoundary({
  children,
  maxRetries = 3,
  retryDelay = 1000,
}: {
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}) {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Error boundary caught error (attempt ${retryCount + 1}):`, error, errorInfo);
    
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay]);

  const resetRetryCount = React.useCallback(() => {
    setRetryCount(0);
  }, []);

  return (
    <ErrorBoundary
      onError={handleError}
      resetKeys={[retryCount]}
      fallback={({ error, resetError }) => (
        <ErrorState
          type="generic"
          title="Something went wrong"
          message={
            retryCount >= maxRetries
              ? 'Multiple attempts failed. Please refresh the page or contact support.'
              : `Attempt ${retryCount + 1} of ${maxRetries + 1} failed. Retrying...`
          }
          onRetry={retryCount < maxRetries ? resetError : undefined}
          onGoHome={() => window.location.href = '/'}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
