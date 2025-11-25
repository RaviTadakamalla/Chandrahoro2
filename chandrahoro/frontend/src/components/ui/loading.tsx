import React from 'react';
import { Loader2, Star, Moon, Sun } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'vedic' | 'dots' | 'pulse';
  className?: string;
}

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  variant?: 'spinner' | 'vedic' | 'progress';
  progress?: number;
}

// Basic Loading Spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  if (variant === 'vedic') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 animate-spin">
          <Star className="w-full h-full text-yellow-500" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
          <Moon className="w-full h-full text-blue-500 opacity-60" />
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse ${className}`}></div>
    );
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`} />
  );
};

// Progress Bar Component
export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  className = '',
  showPercentage = true 
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Loading Overlay Component
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Loading...', 
  children,
  variant = 'spinner',
  progress = 0
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4">
          <div className="text-center">
            {variant === 'progress' ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" variant="vedic" className="mx-auto" />
                <ProgressBar progress={progress} label={message} />
              </div>
            ) : (
              <div className="space-y-4">
                <LoadingSpinner 
                  size="lg" 
                  variant={variant === 'vedic' ? 'vedic' : 'default'} 
                  className="mx-auto" 
                />
                <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Components
export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="space-y-3">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <SkeletonLine className="h-4 w-5/6" />
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="space-y-4">
      <SkeletonLine className="h-6 w-1/3 mx-auto" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  </div>
);

// Button Loading State
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Chart Loading States
export const ChartLoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Calculating planetary positions...' 
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <LoadingSpinner size="xl" variant="vedic" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Generating Your Chart
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
        {message}
      </p>
    </div>
  </div>
);

// Mobile-optimized loading states
export const MobileLoadingCard: React.FC<{ title?: string; message?: string }> = ({ 
  title = 'Loading',
  message = 'Please wait...'
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mx-4 my-2">
    <div className="flex items-center space-x-3">
      <LoadingSpinner size="md" variant="vedic" />
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  </div>
);

// Inline loading for small components
export const InlineLoading: React.FC<{ text?: string; size?: 'sm' | 'md' }> = ({ 
  text = 'Loading...', 
  size = 'sm' 
}) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size={size} />
    <span className={`text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
      {text}
    </span>
  </div>
);
