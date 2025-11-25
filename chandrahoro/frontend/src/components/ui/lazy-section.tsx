import React from 'react';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  options?: IntersectionObserverInit;
}

/**
 * Lazy loading section component with skeleton fallback
 */
export function LazySection({ 
  children, 
  fallback,
  className = "",
  title,
  description,
  options 
}: LazySectionProps) {
  const { elementRef, isVisible } = useLazyLoading(options);

  const defaultFallback = (
    <div className="space-y-4">
      {title && (
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
          {description && <div className="h-4 bg-muted rounded animate-pulse w-2/3" />}
        </div>
      )}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
      </div>
    </div>
  );

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
}

/**
 * Lazy loading card component
 */
interface LazyCardProps {
  children: React.ReactNode;
  className?: string;
  options?: IntersectionObserverInit;
}

export function LazyCard({ children, className = "", options }: LazyCardProps) {
  const { elementRef, isVisible } = useLazyLoading(options);

  const cardSkeleton = (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : cardSkeleton}
    </div>
  );
}

/**
 * Lazy loading table component
 */
interface LazyTableProps {
  children: React.ReactNode;
  className?: string;
  rows?: number;
  columns?: number;
  options?: IntersectionObserverInit;
}

export function LazyTable({ 
  children, 
  className = "", 
  rows = 5, 
  columns = 4, 
  options 
}: LazyTableProps) {
  const { elementRef, isVisible } = useLazyLoading(options);

  const tableSkeleton = (
    <div className="border rounded-lg overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-muted rounded animate-pulse" 
                  style={{ 
                    width: colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '100%' 
                  }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : tableSkeleton}
    </div>
  );
}

/**
 * Lazy loading chart component
 */
interface LazyChartProps {
  children: React.ReactNode;
  className?: string;
  type?: 'circular' | 'grid' | 'linear';
  options?: IntersectionObserverInit;
}

export function LazyChart({ 
  children, 
  className = "", 
  type = 'circular', 
  options 
}: LazyChartProps) {
  const { elementRef, isVisible } = useLazyLoading(options);

  const getChartSkeleton = () => {
    switch (type) {
      case 'circular':
        return (
          <div className="flex items-center justify-center aspect-square border rounded-lg">
            <div className="w-48 h-48 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        );
      
      case 'grid':
        return (
          <div className="aspect-square border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-2 h-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        );
      
      case 'linear':
        return (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-8 bg-muted rounded animate-pulse" 
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="aspect-square border rounded-lg bg-muted animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        );
    }
  };

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? children : getChartSkeleton()}
    </div>
  );
}
