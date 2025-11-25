/**
 * ChandraHoro V2.1 - Charts Page
 * 
 * Main page for displaying birth charts with interactive visualization.
 * Fetches chart data from the backend and displays using ChartWheel component.
 * 
 * Features:
 * - Primary chart fetching
 * - Loading states
 * - Error handling
 * - Empty state for missing charts
 * - Responsive layout
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { SkeletonLoader } from '@/components/states/SkeletonLoader';
import { EmptyState } from '@/components/states/EmptyState';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ChartsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['primary-chart'],
    queryFn: async () => {
      const res = await fetch('/api/charts?primary=true');
      if (!res.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return res.json();
    },
    retry: 1,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <SkeletonLoader variant="card" count={1} />
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonLoader variant="card" count={1} />
          <SkeletonLoader variant="card" count={1} />
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <EmptyState
          icon="⚠️"
          title="Error Loading Chart"
          description="There was a problem loading your birth chart. Please try again."
          action={{
            label: 'Retry',
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }
  
  const chart = data?.data?.[0];
  
  // No chart available
  if (!chart) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <EmptyState
          icon="📊"
          title="No Birth Chart Available"
          description="Complete your profile with birth details to generate your personalized birth chart."
          action={{
            label: 'Complete Profile',
            href: '/profile',
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Your Birth Chart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive visualization of your planetary positions
          </p>
        </div>
        
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      
      {/* Chart Display */}
      <ChartWheel chart={chart} />
      
      {/* Chart Metadata */}
      {chart.birthDetails && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Chart Details
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {chart.birthDetails.birthDate && (
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Birth Date
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {new Date(chart.birthDetails.birthDate).toLocaleDateString()}
                </div>
              </div>
            )}
            
            {chart.birthDetails.birthTime && (
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Birth Time
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {chart.birthDetails.birthTime}
                </div>
              </div>
            )}
            
            {chart.birthDetails.birthPlace && (
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Birth Place
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {chart.birthDetails.birthPlace}
                </div>
              </div>
            )}
            
            {chart.calculatedAt && (
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  Calculated
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {new Date(chart.calculatedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
