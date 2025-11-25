'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list-item' | 'chart-circle' | 'text-line' | 'avatar' | 'button';
  count?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Enhanced Skeleton Loader Component
 * 
 * Provides shimmer loading states for various UI components
 * with smooth gradient animations and multiple variants.
 */
export function SkeletonLoader({ 
  variant = 'card', 
  count = 1, 
  className,
  animate = true 
}: SkeletonLoaderProps) {
  const variants = {
    'card': 'h-48 w-full rounded-2xl',
    'list-item': 'h-16 w-full rounded-lg',
    'chart-circle': 'w-64 h-64 rounded-full mx-auto',
    'text-line': 'h-4 w-full rounded',
    'avatar': 'w-10 h-10 rounded-full',
    'button': 'h-10 w-24 rounded-lg',
  };
  
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
            'dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
            animate && 'animate-shimmer bg-[length:200%_100%]',
            variants[variant],
            className
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Card Component
 * 
 * Pre-built skeleton for card layouts with header, content, and actions.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border rounded-2xl space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center space-x-4">
        <SkeletonLoader variant="avatar" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader variant="text-line" className="h-4 w-3/4" />
          <SkeletonLoader variant="text-line" className="h-3 w-1/2" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <SkeletonLoader variant="text-line" className="h-4 w-full" />
        <SkeletonLoader variant="text-line" className="h-4 w-5/6" />
        <SkeletonLoader variant="text-line" className="h-4 w-4/6" />
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2 pt-2">
        <SkeletonLoader variant="button" />
        <SkeletonLoader variant="button" className="w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton List Component
 * 
 * Pre-built skeleton for list layouts with items.
 */
export function SkeletonList({ 
  count = 5, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <SkeletonLoader variant="avatar" />
          <div className="space-y-2 flex-1">
            <SkeletonLoader variant="text-line" className="h-4 w-3/4" />
            <SkeletonLoader variant="text-line" className="h-3 w-1/2" />
          </div>
          <SkeletonLoader variant="button" className="w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Chart Component
 * 
 * Pre-built skeleton for chart/visualization layouts.
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border rounded-2xl space-y-6', className)}>
      {/* Chart Title */}
      <div className="space-y-2">
        <SkeletonLoader variant="text-line" className="h-6 w-1/3" />
        <SkeletonLoader variant="text-line" className="h-4 w-1/2" />
      </div>
      
      {/* Chart Area */}
      <div className="flex items-center justify-center py-8">
        <SkeletonLoader variant="chart-circle" />
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <SkeletonLoader variant="avatar" className="w-4 h-4" />
            <SkeletonLoader variant="text-line" className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Table Component
 * 
 * Pre-built skeleton for table layouts.
 */
export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonLoader key={i} variant="text-line" className="h-4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonLoader key={colIndex} variant="text-line" className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Message Component
 * 
 * Pre-built skeleton for chat message layouts.
 */
export function SkeletonMessage({ 
  isUser = false, 
  className 
}: { 
  isUser?: boolean; 
  className?: string; 
}) {
  return (
    <div className={cn(
      'flex gap-3 max-w-[80%]',
      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
      className
    )}>
      {!isUser && <SkeletonLoader variant="avatar" />}
      
      <div className={cn(
        'p-4 rounded-2xl space-y-2',
        isUser 
          ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20' 
          : 'bg-gradient-to-r from-celestial-deep/20 to-celestial-medium/20'
      )}>
        <SkeletonLoader variant="text-line" className="h-4 w-48" />
        <SkeletonLoader variant="text-line" className="h-4 w-32" />
        <SkeletonLoader variant="text-line" className="h-4 w-40" />
      </div>
    </div>
  );
}

/**
 * Skeleton Dashboard Component
 * 
 * Pre-built skeleton for dashboard layouts.
 */
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader variant="text-line" className="h-8 w-64" />
          <SkeletonLoader variant="text-line" className="h-4 w-48" />
        </div>
        <SkeletonLoader variant="button" className="w-32" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonList count={6} />
      </div>
    </div>
  );
}
