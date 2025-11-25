'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle,
  Wifi,
  Server,
  FileX,
  Shield,
  RefreshCw,
  Home,
  ArrowLeft,
} from 'lucide-react';

export type ErrorType = 'network' | 'server' | 'notFound' | 'forbidden' | 'generic' | 'timeout' | 'validation';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  showActions?: boolean;
  customActions?: React.ReactNode;
}

/**
 * Enhanced Error State Component
 * 
 * Displays user-friendly error messages with appropriate icons,
 * titles, and action buttons for different error scenarios.
 */
export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  onGoHome,
  onGoBack,
  className,
  showActions = true,
  customActions,
}: ErrorStateProps) {
  const errorConfig = getErrorConfig(type);
  
  const finalTitle = title || errorConfig.title;
  const finalMessage = message || errorConfig.message;
  const IconComponent = errorConfig.icon;

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-8 text-center">
        {/* Error Icon */}
        <div className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full',
          'bg-destructive/20 text-destructive'
        )}>
          <IconComponent className="h-8 w-8" />
        </div>

        {/* Error Content */}
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-destructive">
            {finalTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {finalMessage}
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {customActions || (
              <>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="default"
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {onGoBack && (
                  <Button onClick={onGoBack} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
                
                {onGoHome && (
                  <Button onClick={onGoHome} variant="outline">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Additional Info for Development */}
        {process.env.NODE_ENV === 'development' && type === 'generic' && (
          <details className="mt-4 w-full text-left">
            <summary className="cursor-pointer text-xs font-mono text-muted-foreground">
              Debug Information
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
              Error Type: {type}
              {'\n'}Timestamp: {new Date().toISOString()}
              {'\n'}User Agent: {navigator.userAgent}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Error State Component
 * 
 * Smaller error display for inline use.
 */
export function CompactErrorState({
  type = 'generic',
  message,
  onRetry,
  className,
}: Pick<ErrorStateProps, 'type' | 'message' | 'onRetry' | 'className'>) {
  const errorConfig = getErrorConfig(type);
  const IconComponent = errorConfig.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/5',
      className
    )}>
      <IconComponent className="h-5 w-5 text-destructive flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-destructive font-medium">
          {message || errorConfig.message}
        </p>
      </div>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Error Banner Component
 * 
 * Full-width error banner for page-level errors.
 */
export function ErrorBanner({
  type = 'generic',
  message,
  onRetry,
  onDismiss,
  className,
}: Pick<ErrorStateProps, 'type' | 'message' | 'onRetry' | 'className'> & {
  onDismiss?: () => void;
}) {
  const errorConfig = getErrorConfig(type);
  const IconComponent = errorConfig.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 border border-destructive/50 bg-destructive/5 rounded-lg',
      className
    )}>
      <IconComponent className="h-6 w-6 text-destructive flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-destructive font-medium">
          {message || errorConfig.message}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        
        {onDismiss && (
          <Button onClick={onDismiss} variant="ghost" size="sm">
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Get error configuration based on error type
 */
function getErrorConfig(type: ErrorType) {
  const configs = {
    network: {
      icon: Wifi,
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    },
    server: {
      icon: Server,
      title: 'Server Error',
      message: 'Something went wrong on our end. Our team has been notified and is working to fix this.',
    },
    notFound: {
      icon: FileX,
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved to a different location.',
    },
    forbidden: {
      icon: Shield,
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource. Please contact support if you believe this is an error.',
    },
    timeout: {
      icon: AlertCircle,
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again or check your connection.',
    },
    validation: {
      icon: AlertCircle,
      title: 'Invalid Data',
      message: 'The information provided is invalid or incomplete. Please check your input and try again.',
    },
    generic: {
      icon: AlertCircle,
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    },
  };

  return configs[type] || configs.generic;
}

/**
 * Error State Hook
 * 
 * Custom hook for managing error states.
 */
export function useErrorState() {
  const [error, setError] = React.useState<{
    type: ErrorType;
    message?: string;
    timestamp: number;
  } | null>(null);

  const showError = React.useCallback((type: ErrorType, message?: string) => {
    setError({
      type,
      message,
      timestamp: Date.now(),
    });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback((retryFn?: () => void) => {
    clearError();
    retryFn?.();
  }, [clearError]);

  return {
    error,
    showError,
    clearError,
    retry,
    hasError: error !== null,
  };
}
