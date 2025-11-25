'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { ReadingHighlights } from './ReadingHighlights';
import { ReadingTabs } from './ReadingTabs';
import { ShareDialog } from './ShareDialog';
import type { DailyReadingCardProps, ReadingTab } from '@/types/reading';

/**
 * DailyReadingCard Component
 * 
 * Main expandable card component for displaying daily astrology readings.
 * Features smooth animations, tab switching, save/share functionality.
 * 
 * Features:
 * - Expandable card with smooth height animation
 * - Header with date, actions, and gradient styling
 * - Highlights section with custom bullets
 * - Tabbed content for different life aspects
 * - Save/share functionality with optimistic updates
 * - Auto-mark as read after viewing
 * - Responsive design for all screen sizes
 */
export function DailyReadingCard({
  reading,
  onSave,
  onShare,
  onMarkAsRead,
  className = '',
  defaultExpanded = false,
}: DailyReadingCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSaved, setIsSaved] = useState(reading.isSaved);
  const [isRead, setIsRead] = useState(reading.isRead);
  const [activeTab, setActiveTab] = useState<ReadingTab>('work');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<Date | null>(null);

  // Auto-mark as read after 5 seconds of viewing
  useEffect(() => {
    if (isExpanded && !isRead) {
      setViewStartTime(new Date());
      
      const timer = setTimeout(() => {
        handleMarkAsRead();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isExpanded, isRead]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    
    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [isExpanded]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    const newSavedState = !isSaved;
    
    // Optimistic update
    setIsSaved(newSavedState);

    try {
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isSaved: newSavedState }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reading');
      }

      toast.success(newSavedState ? 'Reading saved!' : 'Reading unsaved');
      onSave?.(reading);
    } catch (error) {
      // Revert optimistic update
      setIsSaved(isSaved);
      console.error('Save error:', error);
      toast.error('Failed to save reading. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [reading, isSaved, isSaving, onSave]);

  const handleMarkAsRead = useCallback(async () => {
    if (isRead) return;

    setIsRead(true);

    try {
      const response = await fetch(`/api/readings/${reading.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      onMarkAsRead?.(reading);
    } catch (error) {
      console.error('Mark as read error:', error);
      // Don't revert this as it's not critical
    }
  }, [reading, isRead, onMarkAsRead]);

  const handleShare = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className={cn(
        'overflow-hidden transition-all duration-300 ease-out hover:shadow-xl',
        'border-saffron-200/30 dark:border-saffron-800/30',
        isExpanded && 'shadow-lg',
        className
      )}>
        {/* Card Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {/* Left: Date and Title */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm">
                <Sun className="h-5 w-5 text-white" />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {reading.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(reading.readingDate)}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(reading.generatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Save Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="text-muted-foreground hover:text-foreground"
                aria-label={isSaved ? 'Unsave reading' : 'Save reading'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-saffron-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Share reading"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="text-muted-foreground hover:text-foreground"
                aria-label={isExpanded ? 'Collapse reading' : 'Expand reading'}
              >
                <ChevronRight className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  isExpanded && 'rotate-90'
                )} />
              </Button>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {reading.summary}
          </p>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="pt-0">
          {/* Highlights - Always Visible */}
          <div className="mb-6">
            <ReadingHighlights 
              highlights={reading.highlights} 
              maxItems={isExpanded ? 10 : 3}
            />
          </div>

          {/* Expanded Content */}
          <div className={cn(
            'transition-all duration-300 ease-out overflow-hidden',
            isExpanded 
              ? 'max-h-[2000px] opacity-100' 
              : 'max-h-0 opacity-0'
          )}>
            {isExpanded && (
              <div className="space-y-6">
                {/* Life Aspects Tabs */}
                {reading.content && (
                  <ReadingTabs
                    content={reading.content}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                )}

                {/* Auspicious Timings */}
                {reading.auspiciousTimings && reading.auspiciousTimings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-saffron-600" />
                      Auspicious Timings
                    </h3>
                    <div className="grid gap-2">
                      {reading.auspiciousTimings.map((timing, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-800/30">
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              {timing.activity}
                            </p>
                            {timing.description && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {timing.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            {timing.window}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Generation Info */}
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Generated by {reading.aiModel}</span>
                    <span>{reading.tokensUsed} tokens • ${reading.cost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expand Button (Bottom) */}
          {!isExpanded && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleExpand}
                className="bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="mr-2">Read Full Analysis</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <ShareDialog
        reading={reading}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={onShare}
      />
    </>
  );
}

/**
 * Skeleton loader for DailyReadingCard
 */
export function DailyReadingCardSkeleton({
  className = '',
  expanded = false
}: {
  className?: string;
  expanded?: boolean;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded animate-pulse w-48" />
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Highlights skeleton */}
        <div className="space-y-3 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-muted rounded-full mt-2 animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>

        {expanded && (
          <div className="space-y-6">
            {/* Tabs skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-9 w-20 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        )}

        {!expanded && (
          <div className="flex justify-center pt-4">
            <div className="h-9 w-40 bg-muted rounded animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Error state for DailyReadingCard
 */
export function DailyReadingCardError({
  className = '',
  error,
  onRetry
}: {
  className?: string;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className={cn('overflow-hidden border-red-200 dark:border-red-800', className)}>
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Sun className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Unable to Load Reading
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {error || 'There was an error loading your daily reading. Please try again.'}
        </p>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 text-white border-0"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Empty state for DailyReadingCard
 */
export function DailyReadingCardEmpty({
  className = '',
  onGenerate
}: {
  className?: string;
  onGenerate?: () => void;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron-100 to-gold-100 dark:from-saffron-900/30 dark:to-gold-900/30 flex items-center justify-center">
          <Sun className="h-6 w-6 text-saffron-600" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Reading Generated Yet
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Generate your personalized daily astrology reading to see insights for today.
        </p>

        {onGenerate && (
          <Button
            size="sm"
            onClick={onGenerate}
            className="bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Reading
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
