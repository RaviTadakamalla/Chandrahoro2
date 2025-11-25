'use client';

import { Component, ReactNode } from 'react';
import { PageError } from './PageError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 * 
 * Features:
 * - Automatic error catching and logging
 * - Custom fallback UI support
 * - Error recovery with reset functionality
 * - Development vs production error display
 * - Integration with error tracking services
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info for display in development
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, Bugsnag, etc.
      // logErrorToService(error, errorInfo);
      
      // For now, we'll just log to console
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }
  
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };
  
  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error page
      return (
        <PageError
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.handleReset}
          title="Application Error"
        />
      );
    }
    
    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error boundary context (for future use)
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // This could be enhanced to work with a context provider
    // For now, it just throws the error to be caught by the boundary
    throw error;
  };
}
