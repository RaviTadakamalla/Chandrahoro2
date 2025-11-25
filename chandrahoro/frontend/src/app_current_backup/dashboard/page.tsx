/**
 * ChandraHoro V2.1 - Dashboard Page
 * 
 * Main dashboard with personalized greeting, today's reading,
 * quick actions, quota display, and transit alerts.
 * 
 * Features:
 * - Time-based greeting
 * - Today's reading preview
 * - Quick action navigation
 * - AI quota tracking
 * - Transit alerts display
 * - Responsive layout
 * - Loading states
 */

'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TodayReadingCard } from '@/components/dashboard/TodayReadingCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { QuotaWidget } from '@/components/dashboard/QuotaWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { PageLayout } from '@/components/layout/ResponsiveLayout';
import { SkeletonLoader } from '@/components/states/SkeletonLoader';
import { EmptyState } from '@/components/states/EmptyState';
import { PageError } from '@/components/errors/PageError';
import { RetryButton } from '@/components/states/RetryButton';
// Note: Metadata removed due to 'use client' directive

export default function DashboardPage() {
  const { data: session } = useSession();
  
  // Fetch today's reading with enhanced error handling
  const { data: reading, isLoading: readingLoading, error: readingError, refetch: refetchReading } = useQuery({
    queryKey: ['today-reading'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await fetch(`/api/readings/daily?date=${today}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // No reading available for today
        }
        throw new Error(`Failed to fetch reading: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch user quota information
  const { data: quota, isLoading: quotaLoading, error: quotaError, refetch: refetchQuota } = useQuery({
    queryKey: ['user-quota'],
    queryFn: async () => {
      const res = await fetch('/api/quota');
      if (!res.ok) {
        throw new Error(`Failed to fetch quota: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useQuery({
    queryKey: ['user-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts');
      if (!res.ok) {
        if (res.status === 404) {
          return []; // No alerts
        }
        throw new Error(`Failed to fetch alerts: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    retry: 2,
    retryDelay: 1000,
  });
  
  // Generate time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get user's first name
  const firstName = session?.user?.name?.split(' ')[0] || 'there';
  
  const greeting = `${getGreeting()}, ${firstName}!`;
  const greetingEmoji = new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙';
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <PageLayout
      title={`${greeting} ${greetingEmoji}`}
      subtitle={currentDate}
      className="bg-gray-50 dark:bg-gray-900"
    >
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
            {/* Today's Reading */}
            {readingLoading ? (
              <SkeletonLoader variant="card" count={1} />
            ) : readingError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
                <PageError
                  error={readingError as Error}
                  reset={() => refetchReading()}
                  title="Failed to load today's reading"
                  description="We couldn't load your daily reading. This might be a temporary issue."
                  showDetails={false}
                />
              </div>
            ) : reading?.data ? (
              <TodayReadingCard reading={reading.data} />
            ) : (
              <EmptyState
                type="noReadings"
                action={{
                  label: 'Generate Reading',
                  onClick: () => refetchReading(),
                }}
              />
            )}
            
            {/* Quick Actions */}
            <QuickActions />
          </div>
          
          {/* Right Column - Widgets */}
          <div className="space-y-6">
            {/* Quota Widget */}
            {quotaLoading ? (
              <SkeletonLoader variant="card" count={1} />
            ) : quotaError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    Unable to load quota information
                  </p>
                  <RetryButton
                    onRetry={() => refetchQuota()}
                    label="Retry"
                    size="sm"
                  />
                </div>
              </div>
            ) : (
              <QuotaWidget data={quota} />
            )}

            {/* Alerts Widget */}
            {alertsLoading ? (
              <SkeletonLoader variant="list" count={3} />
            ) : alertsError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="text-center">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    Unable to load alerts
                  </p>
                  <RetryButton
                    onRetry={() => refetchAlerts()}
                    label="Retry"
                    size="sm"
                  />
                </div>
              </div>
            ) : (
              <AlertsWidget data={alerts} />
            )}
            
            {/* Welcome Card for New Users */}
            {!session?.user?.onboardingCompleted && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                  Welcome to ChandraHoro! 🎉
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Complete your profile to unlock personalized readings and chart analysis.
                </p>
                <button
                  onClick={() => window.location.href = '/onboarding'}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-orange-500">
            {reading?.data ? '1' : '0'}
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Today's Reading
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-purple-500">
            {session?.user?.chartsCount || '0'}
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Birth Charts
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-500">
            {session?.user?.conversationsCount || '0'}
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            AI Conversations
          </div>
        </div>

        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-green-500">
            {session?.user?.daysActive || '1'}
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Days Active
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
