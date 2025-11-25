'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

import type { TypingIndicatorProps } from '@/types/chat';

/**
 * Typing Indicator Component
 * 
 * Animated 3-dot indicator to show when AI is processing/typing.
 */
export function TypingIndicator({
  isVisible,
  message = "AI is thinking...",
  className,
}: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn('flex justify-start w-full', className)}>
      <div className="flex flex-col items-start max-w-[80%]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bot className="w-3 h-3" />
            <span className="font-medium">AI Assistant</span>
          </div>
        </div>

        {/* Typing Bubble */}
        <div className="relative">
          <div className={cn(
            'relative p-4 rounded-2xl shadow-sm',
            'bg-gradient-to-r from-celestial-deep to-celestial-medium text-white',
            'before:absolute before:w-3 before:h-3 before:rotate-45',
            'before:bg-celestial-deep before:-left-1 before:top-4'
          )}>
            <div className="relative z-10 flex items-center gap-2">
              {/* Animated Dots */}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              </div>
              
              {/* Optional Message */}
              {message && (
                <span className="text-sm opacity-80 ml-2">{message}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Typing Indicator Skeleton
 * 
 * Alternative typing indicator with skeleton-style animation.
 */
export function TypingIndicatorSkeleton({
  isVisible,
  className,
}: {
  isVisible: boolean;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className={cn('flex justify-start w-full', className)}>
      <div className="flex flex-col items-start max-w-[80%]">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
          <div className="w-20 h-3 bg-muted rounded animate-pulse" />
        </div>

        {/* Bubble Skeleton */}
        <div className="relative">
          <div className={cn(
            'relative p-4 rounded-2xl shadow-sm',
            'bg-muted animate-pulse',
            'before:absolute before:w-3 before:h-3 before:rotate-45',
            'before:bg-muted before:-left-1 before:top-4'
          )}>
            <div className="relative z-10 space-y-2">
              <div className="w-32 h-3 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="w-24 h-3 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pulse Typing Indicator
 * 
 * Simple pulsing indicator for minimal UI.
 */
export function PulseTypingIndicator({
  isVisible,
  size = 'md',
  className,
}: {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const containerClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      containerClasses[size],
      className
    )}>
      <div className={cn(
        'bg-primary rounded-full animate-pulse',
        sizeClasses[size],
        '[animation-delay:-0.3s]'
      )} />
      <div className={cn(
        'bg-primary rounded-full animate-pulse',
        sizeClasses[size],
        '[animation-delay:-0.15s]'
      )} />
      <div className={cn(
        'bg-primary rounded-full animate-pulse',
        sizeClasses[size]
      )} />
    </div>
  );
}

/**
 * Wave Typing Indicator
 * 
 * Wave-style animation for typing indicator.
 */
export function WaveTypingIndicator({
  isVisible,
  className,
}: {
  isVisible: boolean;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${8 + Math.sin(i * 0.5) * 4}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}
