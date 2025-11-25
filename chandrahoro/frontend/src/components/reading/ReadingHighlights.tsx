'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ReadingHighlightsProps } from '@/types/reading';

/**
 * ReadingHighlights Component
 * 
 * Displays key highlights from a daily reading with custom bullet styling,
 * animations, and expandable functionality for long lists.
 * 
 * Features:
 * - Custom saffron bullet points
 * - Smooth expand/collapse animation
 * - Responsive design
 * - Configurable max items before collapse
 * - Fade-in animation for items
 */
export function ReadingHighlights({
  highlights,
  className = '',
  maxItems = 3,
}: ReadingHighlightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!highlights || highlights.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground text-sm">
          No highlights available for this reading.
        </p>
      </div>
    );
  }

  const shouldShowExpandButton = highlights.length > maxItems;
  const visibleHighlights = isExpanded ? highlights : highlights.slice(0, maxItems);
  const hiddenCount = highlights.length - maxItems;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Highlights List */}
      <div className="space-y-3">
        {visibleHighlights.map((highlight, index) => (
          <HighlightItem
            key={index}
            text={highlight}
            index={index}
            isVisible={true}
          />
        ))}
        
        {/* Collapsed items with fade effect */}
        {!isExpanded && shouldShowExpandButton && (
          <div className="relative">
            {/* Fade overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-10" />
            
            {/* Hidden items preview */}
            <div className="opacity-30 space-y-3">
              {highlights.slice(maxItems, maxItems + 1).map((highlight, index) => (
                <HighlightItem
                  key={`preview-${index}`}
                  text={highlight}
                  index={maxItems + index}
                  isVisible={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {shouldShowExpandButton && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-saffron-600 hover:text-saffron-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {hiddenCount} More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Highlight Item Component
 */
interface HighlightItemProps {
  text: string;
  index: number;
  isVisible: boolean;
}

function HighlightItem({ text, index, isVisible }: HighlightItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 group transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1',
        'hover:translate-x-1'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Custom Bullet Point */}
      <div className="flex-shrink-0 mt-2">
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-saffron-500 to-gold-500 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-200" />
      </div>
      
      {/* Highlight Text */}
      <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors duration-200">
        {text}
      </p>
    </div>
  );
}

/**
 * Skeleton loader for ReadingHighlights
 */
export function ReadingHighlightsSkeleton({ 
  className = '',
  itemCount = 3 
}: { 
  className?: string;
  itemCount?: number;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Bullet skeleton */}
            <div className="flex-shrink-0 mt-2">
              <div className="w-1.5 h-1.5 bg-muted rounded-full animate-pulse" />
            </div>
            
            {/* Text skeleton */}
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
              {Math.random() > 0.5 && (
                <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 30 + 40}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state for ReadingHighlights
 */
export function ReadingHighlightsEmpty({ 
  className = '',
  message = "No highlights available for this reading."
}: { 
  className?: string;
  message?: string;
}) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
      </div>
      <p className="text-muted-foreground text-sm">
        {message}
      </p>
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function ReadingHighlightsCompact({
  highlights,
  className = '',
  maxItems = 2,
}: ReadingHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return <ReadingHighlightsEmpty className={className} />;
  }

  const visibleHighlights = highlights.slice(0, maxItems);
  const remainingCount = highlights.length - maxItems;

  return (
    <div className={cn('space-y-2', className)}>
      {visibleHighlights.map((highlight, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-1 h-1 bg-saffron-500 rounded-full mt-2 flex-shrink-0" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {highlight}
          </p>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <p className="text-xs text-muted-foreground/70 pl-3">
          +{remainingCount} more insights
        </p>
      )}
    </div>
  );
}
