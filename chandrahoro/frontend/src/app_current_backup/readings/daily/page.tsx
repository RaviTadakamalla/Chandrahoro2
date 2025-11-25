/**
 * ChandraHoro V2.1 - Daily Reading Page
 * 
 * Main page for displaying daily astrological readings with interactive features.
 * Includes date picker, regeneration, animations, and comprehensive error handling.
 * 
 * Features:
 * - Date selection with calendar picker
 * - Reading regeneration for current date
 * - Smooth animations and loading states
 * - Mobile-responsive design
 * - Error handling for missing readings
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/states/SkeletonLoader';
import { EmptyState } from '@/components/states/EmptyState';
import { PageError } from '@/components/errors/PageError';
import { RetryButton } from '@/components/states/RetryButton';
import { ReadingCard } from '@/components/readings/ReadingCard';
import { CalendarIcon, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
// Note: Metadata removed due to 'use client' directive

export default function DailyReadingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Fetch reading with enhanced error handling
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-reading', dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/readings/daily?date=${dateStr}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('NOT_FOUND');
        }
        if (res.status === 429) {
          throw new Error('RATE_LIMITED');
        }
        if (res.status >= 500) {
          throw new Error('SERVER_ERROR');
        }
        throw new Error(`Failed to fetch reading: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    retry: (failureCount, error) => {
      // Don't retry for 404 or rate limiting
      if (error.message === 'NOT_FOUND' || error.message === 'RATE_LIMITED') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Regenerate reading
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, forceRegenerate: true }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to regenerate');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reading', dateStr] });
      toast.success('Reading regenerated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <SkeletonLoader variant="card" count={1} />
      </div>
    );
  }
  
  // Error state (not found)
  if (error?.message === 'NOT_FOUND') {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Daily Reading</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date('2024-01-01')}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <EmptyState
          icon="🔮"
          title="No Reading Available"
          description="Readings are not available for past dates. Select today or a future date."
          action={{
            label: 'View Today',
            onClick: () => setSelectedDate(new Date()),
          }}
        />
      </div>
    );
  }
  
  // Enhanced error handling
  if (error) {
    const errorMessage = error.message;

    // Rate limiting error
    if (errorMessage === 'RATE_LIMITED') {
      return (
        <div className="container max-w-3xl mx-auto p-4">
          <EmptyState
            type="noData"
            title="Too Many Requests"
            description="You've reached the rate limit for reading requests. Please wait a moment before trying again."
            action={{
              label: 'Try Again',
              onClick: () => refetch(),
            }}
          />
        </div>
      );
    }

    // Server error
    if (errorMessage === 'SERVER_ERROR') {
      return (
        <div className="container max-w-3xl mx-auto p-4">
          <PageError
            error={error as Error}
            reset={() => refetch()}
            title="Server Error"
            description="Our servers are experiencing issues. Please try again in a few moments."
            showDetails={false}
          />
        </div>
      );
    }

    // General error with retry
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <PageError
          error={error as Error}
          reset={() => refetch()}
          title="Failed to Load Reading"
          description="We couldn't load your daily reading. This might be a temporary issue."
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }
  
  const reading = data?.data;
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      {/* Header with date picker */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Daily Reading
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date('2024-01-01')}
              />
            </PopoverContent>
          </Popover>
          
          {/* Regenerate button (only for today) */}
          {isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
            >
              {regenerateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Regenerating...
                </>
              ) : (
                '🔄 Regenerate'
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Reading Card */}
      {reading && <ReadingCard reading={reading} />}
    </div>
  );
}
