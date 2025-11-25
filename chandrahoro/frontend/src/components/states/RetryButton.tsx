'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
  disabled?: boolean;
  showRetryCount?: boolean;
}

/**
 * Retry Button Component
 * 
 * Provides a button with retry functionality, loading states,
 * and automatic retry counting with exponential backoff.
 * 
 * Features:
 * - Loading state with spinning icon
 * - Retry count tracking
 * - Exponential backoff delay
 * - Success/failure feedback
 * - Customizable appearance
 * 
 * Usage:
 * ```tsx
 * <RetryButton
 *   onRetry={async () => await refetch()}
 *   label="Retry"
 *   maxRetries={3}
 * />
 * ```
 */
export function RetryButton({
  onRetry,
  label = 'Retry',
  variant = 'outline',
  size = 'default',
  maxRetries = 3,
  retryDelay = 1000,
  className,
  disabled = false,
  showRetryCount = true,
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleRetry = async () => {
    if (isRetrying || disabled || retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setLastError(null);
    setIsSuccess(false);
    
    try {
      // Add delay for exponential backoff (except first retry)
      if (retryCount > 0) {
        const delay = retryDelay * Math.pow(2, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await onRetry();
      
      // Success
      setIsSuccess(true);
      setRetryCount(0);
      
      // Reset success state after 2 seconds
      setTimeout(() => setIsSuccess(false), 2000);
      
    } catch (error) {
      console.error('Retry failed:', error);
      setLastError(error instanceof Error ? error.message : 'Retry failed');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };
  
  const isMaxRetriesReached = retryCount >= maxRetries;
  const canRetry = !isRetrying && !disabled && !isMaxRetriesReached;
  
  // Get button text
  const getButtonText = () => {
    if (isRetrying) return 'Retrying...';
    if (isSuccess) return 'Success!';
    if (isMaxRetriesReached) return 'Max retries reached';
    if (showRetryCount && retryCount > 0) return `${label} (${retryCount}/${maxRetries})`;
    return label;
  };
  
  // Get button icon
  const getButtonIcon = () => {
    if (isSuccess) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isMaxRetriesReached) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return (
      <RefreshCw 
        className={cn(
          'w-4 h-4',
          isRetrying && 'animate-spin'
        )} 
      />
    );
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleRetry}
        disabled={!canRetry}
        variant={isSuccess ? 'default' : variant}
        size={size}
        className={cn(
          'gap-2 transition-all duration-200',
          isSuccess && 'bg-green-600 hover:bg-green-700 text-white',
          isMaxRetriesReached && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
      
      {/* Error message */}
      {lastError && (
        <p className="text-xs text-red-600 dark:text-red-400 text-center max-w-xs">
          {lastError}
        </p>
      )}
      
      {/* Retry info */}
      {retryCount > 0 && !isMaxRetriesReached && (
        <p className="text-xs text-muted-foreground text-center">
          {maxRetries - retryCount} attempts remaining
        </p>
      )}
    </div>
  );
}

/**
 * Auto Retry Hook
 * 
 * Hook for automatic retry functionality with exponential backoff.
 */
export function useAutoRetry(
  fn: () => Promise<void>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    enabled = true,
  } = options;
  
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const retry = async () => {
    if (!enabled || retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, retryCount), maxDelay);
      
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await fn();
      
      // Reset on success
      setRetryCount(0);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setRetryCount(prev => prev + 1);
      
      // Auto-retry if not at max
      if (retryCount + 1 < maxRetries) {
        setTimeout(retry, 100); // Small delay before next attempt
      }
    } finally {
      setIsRetrying(false);
    }
  };
  
  const reset = () => {
    setRetryCount(0);
    setError(null);
    setIsRetrying(false);
  };
  
  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    error,
    canRetry: enabled && retryCount < maxRetries && !isRetrying,
    isMaxRetriesReached: retryCount >= maxRetries,
  };
}

/**
 * Retry with Exponential Backoff
 * 
 * Utility function for retry logic with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't delay on the last attempt
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
