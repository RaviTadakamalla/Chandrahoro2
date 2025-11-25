'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'orbital' | 'pulse' | 'dots' | 'bars' | 'ring';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  text?: string;
  textClassName?: string;
}

/**
 * Enhanced Loading Spinner Component
 * 
 * Provides multiple spinner variants with saffron gradient colors
 * and smooth animations for different loading scenarios.
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'orbital',
  className,
  text,
  textClassName,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const SpinnerComponent = getSpinnerComponent(variant);

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <SpinnerComponent size={size} className={className} />
        <p className={cn('text-sm text-muted-foreground animate-pulse', textClassName)}>
          {text}
        </p>
      </div>
    );
  }

  return <SpinnerComponent size={size} className={className} />;
}

/**
 * Orbital Spinner Component
 * 
 * Central dot with orbiting dots in saffron gradient.
 */
function OrbitalSpinner({ size, className }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const dotSizes = {
    xs: 'w-0.5 h-0.5',
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-3 h-3',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Central dot */}
      <div className={cn(
        'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full',
        'bg-gradient-to-r from-orange-400 to-orange-600',
        dotSizes[size]
      )} />
      
      {/* Orbiting dots */}
      <div className="w-full h-full animate-spin">
        <div className={cn(
          'absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full',
          'bg-gradient-to-r from-orange-500 to-orange-700',
          dotSizes[size]
        )} />
        <div className={cn(
          'absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full',
          'bg-gradient-to-r from-orange-300 to-orange-500',
          dotSizes[size]
        )} />
        <div className={cn(
          'absolute top-1/2 right-0 transform -translate-y-1/2 rounded-full',
          'bg-gradient-to-r from-orange-400 to-orange-600',
          dotSizes[size]
        )} />
      </div>
    </div>
  );
}

/**
 * Pulse Spinner Component
 * 
 * Pulsing circle with saffron gradient.
 */
function PulseSpinner({ size, className }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-r from-orange-400 to-orange-600',
      'animate-pulse',
      sizeClasses[size],
      className
    )} />
  );
}

/**
 * Dots Spinner Component
 * 
 * Three bouncing dots with staggered animation.
 */
function DotsSpinner({ size, className }: { size: SpinnerSize; className?: string }) {
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  };

  const gaps = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-2.5',
  };

  return (
    <div className={cn('flex items-center', gaps[size], className)}>
      <div className={cn(
        'rounded-full bg-gradient-to-r from-orange-400 to-orange-600',
        'animate-bounce [animation-delay:-0.3s]',
        dotSizes[size]
      )} />
      <div className={cn(
        'rounded-full bg-gradient-to-r from-orange-500 to-orange-700',
        'animate-bounce [animation-delay:-0.15s]',
        dotSizes[size]
      )} />
      <div className={cn(
        'rounded-full bg-gradient-to-r from-orange-300 to-orange-500',
        'animate-bounce',
        dotSizes[size]
      )} />
    </div>
  );
}

/**
 * Bars Spinner Component
 * 
 * Animated bars with height variations.
 */
function BarsSpinner({ size, className }: { size: SpinnerSize; className?: string }) {
  const barWidths = {
    xs: 'w-0.5',
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
    xl: 'w-2.5',
  };

  const heights = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  };

  const gaps = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-2.5',
  };

  return (
    <div className={cn('flex items-end', gaps[size], className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-gradient-to-t from-orange-400 to-orange-600 rounded-sm',
            'animate-pulse',
            barWidths[size],
            heights[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Ring Spinner Component
 * 
 * Rotating ring with gradient border.
 */
function RingSpinner({ size, className }: { size: SpinnerSize; className?: string }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const borderWidths = {
    xs: 'border',
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-4',
    xl: 'border-4',
  };

  return (
    <div className={cn(
      'rounded-full animate-spin',
      'border-orange-200 border-t-orange-600',
      sizeClasses[size],
      borderWidths[size],
      className
    )} />
  );
}

/**
 * Get spinner component based on variant
 */
function getSpinnerComponent(variant: SpinnerVariant) {
  const components = {
    orbital: OrbitalSpinner,
    pulse: PulseSpinner,
    dots: DotsSpinner,
    bars: BarsSpinner,
    ring: RingSpinner,
  };

  return components[variant] || components.orbital;
}

/**
 * Loading Overlay Component
 * 
 * Full-screen loading overlay with spinner and optional text.
 */
export function LoadingOverlay({
  isVisible,
  text = 'Loading...',
  variant = 'orbital',
  className,
}: {
  isVisible: boolean;
  text?: string;
  variant?: SpinnerVariant;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-background/80 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border shadow-lg">
        <LoadingSpinner size="lg" variant={variant} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/**
 * Loading Button Component
 * 
 * Button with integrated loading spinner.
 */
export function LoadingButton({
  isLoading,
  children,
  loadingText = 'Loading...',
  variant = 'dots',
  className,
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: SpinnerVariant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
        'bg-gradient-to-r from-orange-500 to-orange-600',
        'hover:from-orange-600 hover:to-orange-700',
        'text-white font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" variant={variant} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
