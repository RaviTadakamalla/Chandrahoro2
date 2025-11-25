'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, LogIn, Bug } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageErrorProps {
  error?: Error;
  errorInfo?: any;
  reset?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

/**
 * Page Error Display Component
 * 
 * Displays user-friendly error messages with appropriate actions
 * based on the type of error encountered.
 * 
 * Features:
 * - Error type detection (network, auth, generic)
 * - Contextual error messages and actions
 * - Development vs production error details
 * - Multiple recovery options
 * - Responsive design
 * 
 * Usage:
 * ```tsx
 * <PageError
 *   error={error}
 *   reset={() => refetch()}
 *   title="Failed to load data"
 * />
 * ```
 */
export function PageError({
  error,
  errorInfo,
  reset,
  title = 'Something went wrong',
  description,
  showDetails = process.env.NODE_ENV === 'development',
}: PageErrorProps) {
  const router = useRouter();
  
  // Error type detection
  const isNetworkError = error?.message?.includes('fetch') || 
                        error?.message?.includes('network') ||
                        error?.message?.includes('Failed to fetch');
  
  const isAuthError = error?.message?.includes('auth') || 
                     error?.message?.includes('401') ||
                     error?.message?.includes('unauthorized');
  
  const isNotFoundError = error?.message?.includes('404') ||
                         error?.message?.includes('not found');
  
  const isServerError = error?.message?.includes('500') ||
                       error?.message?.includes('502') ||
                       error?.message?.includes('503');
  
  // Get appropriate error message
  const getErrorMessage = () => {
    if (description) return description;
    
    if (isNetworkError) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    
    if (isAuthError) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    
    if (isNotFoundError) {
      return 'The requested resource could not be found. It may have been moved or deleted.';
    }
    
    if (isServerError) {
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    }
    
    return 'An unexpected error occurred. Our team has been notified and is working to fix this issue.';
  };
  
  // Get appropriate icon
  const getErrorIcon = () => {
    if (isNetworkError) return '🌐';
    if (isAuthError) return '🔒';
    if (isNotFoundError) return '🔍';
    if (isServerError) return '⚠️';
    return '❌';
  };
  
  const handleGoHome = () => {
    router.push('/dashboard');
  };
  
  const handleSignIn = () => {
    router.push('/auth/signin');
  };
  
  const handleReportBug = () => {
    // In a real app, this would open a bug report form or email
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Error Details:
- Message: ${error?.message || 'Unknown'}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
    `);
    
    window.open(`mailto:support@chandrahoro.com?subject=${subject}&body=${body}`);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-lg w-full p-8 text-center shadow-lg">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="text-6xl mb-4">{getErrorIcon()}</div>
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        
        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h1>
        
        {/* Error Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {getErrorMessage()}
        </p>
        
        {/* Error Details (Development Only) */}
        {showDetails && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technical Details
            </summary>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs font-mono overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Primary Action */}
          {reset && (
            <Button onClick={reset} className="gap-2 min-w-[120px]">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          
          {/* Auth Error Action */}
          {isAuthError && (
            <Button onClick={handleSignIn} className="gap-2 min-w-[120px]">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
          
          {/* Secondary Actions */}
          <Button 
            variant="outline" 
            onClick={handleGoHome}
            className="gap-2 min-w-[120px]"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          
          {/* Bug Report (Development/Staging) */}
          {(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') && (
            <Button 
              variant="ghost" 
              onClick={handleReportBug}
              className="gap-2 min-w-[120px] text-gray-600 dark:text-gray-400"
            >
              <Bug className="w-4 h-4" />
              Report Bug
            </Button>
          )}
        </div>
        
        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          If this problem persists, please contact our support team at{' '}
          <a 
            href="mailto:support@chandrahoro.com" 
            className="text-saffron-600 hover:text-saffron-700 underline"
          >
            support@chandrahoro.com
          </a>
        </p>
      </Card>
    </div>
  );
}
