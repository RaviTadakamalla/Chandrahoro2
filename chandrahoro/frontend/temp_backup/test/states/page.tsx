'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SkeletonLoader,
  SkeletonCard,
  SkeletonList,
  SkeletonChart,
  SkeletonTable,
  SkeletonMessage,
  SkeletonDashboard,
  ErrorState,
  CompactErrorState,
  ErrorBanner,
  ErrorBoundary,
  EmptyState,
  CompactEmptyState,
  IllustratedEmptyState,
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  QuotaExceeded,
  QuotaWarning,
  QuotaDisplay,
} from '@/components/states';
import { Plus, MessageSquare, RefreshCw } from 'lucide-react';

/**
 * Test Page for State Components
 * 
 * Comprehensive testing interface for all loading, error, and empty state components.
 */
export default function StatesTestPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'notFound' | 'forbidden' | 'generic'>('generic');

  const handleButtonClick = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 3000);
  };

  const handleShowOverlay = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const ThrowError = () => {
    throw new Error('Test error for error boundary');
  };

  const [shouldThrowError, setShouldThrowError] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            State Components Test
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive testing interface for loading states, error handling, and empty states in ChandraHoro V2.1
          </p>
        </div>

        <Tabs defaultValue="skeletons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="empty">Empty States</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
            <TabsTrigger value="quota">Quota</TabsTrigger>
          </TabsList>

          {/* Skeleton Loaders */}
          <TabsContent value="skeletons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loaders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Variants */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Card</h4>
                      <SkeletonLoader variant="card" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">List Item</h4>
                      <SkeletonLoader variant="list-item" count={3} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Chart Circle</h4>
                      <SkeletonLoader variant="chart-circle" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Text Lines</h4>
                      <SkeletonLoader variant="text-line" count={4} />
                    </div>
                  </div>
                </div>

                {/* Pre-built Components */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pre-built Components</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Skeleton Card</h4>
                      <SkeletonCard />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Skeleton Chart</h4>
                      <SkeletonChart />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skeleton List</h4>
                    <SkeletonList count={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skeleton Table</h4>
                    <SkeletonTable rows={4} columns={3} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skeleton Messages</h4>
                    <div className="space-y-4">
                      <SkeletonMessage isUser={false} />
                      <SkeletonMessage isUser={true} />
                    </div>
                  </div>
                </div>

                {/* Dashboard Skeleton */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dashboard Skeleton</h3>
                  <SkeletonDashboard />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error States */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Error Type Selector */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Error Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['network', 'server', 'notFound', 'forbidden', 'generic'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={errorType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setErrorType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Full Error State */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Full Error State</h3>
                  <ErrorState
                    type={errorType}
                    onRetry={() => alert('Retry clicked')}
                    onGoHome={() => alert('Go Home clicked')}
                    onGoBack={() => alert('Go Back clicked')}
                  />
                </div>

                {/* Compact Error State */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compact Error State</h3>
                  <CompactErrorState
                    type={errorType}
                    onRetry={() => alert('Retry clicked')}
                  />
                </div>

                {/* Error Banner */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Error Banner</h3>
                  <ErrorBanner
                    type={errorType}
                    onRetry={() => alert('Retry clicked')}
                    onDismiss={() => alert('Dismissed')}
                  />
                </div>

                {/* Error Boundary Test */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Error Boundary</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShouldThrowError(!shouldThrowError)}
                      variant={shouldThrowError ? 'destructive' : 'outline'}
                    >
                      {shouldThrowError ? 'Reset' : 'Trigger Error'}
                    </Button>
                  </div>
                  <ErrorBoundary>
                    <div className="p-4 border rounded-lg">
                      {shouldThrowError ? <ThrowError /> : 'Component working normally'}
                    </div>
                  </ErrorBoundary>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Empty States */}
          <TabsContent value="empty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Empty States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Standard Empty States */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Standard Empty States</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EmptyState
                      type="noChats"
                      action={{
                        label: 'Start Chat',
                        onClick: () => alert('Start Chat clicked'),
                        icon: <MessageSquare className="w-4 h-4" />,
                      }}
                    />
                    <EmptyState
                      type="noReadings"
                      action={{
                        label: 'Generate Reading',
                        onClick: () => alert('Generate Reading clicked'),
                        icon: <Plus className="w-4 h-4" />,
                      }}
                    />
                    <EmptyState
                      type="noCharts"
                      action={{
                        label: 'Create Chart',
                        onClick: () => alert('Create Chart clicked'),
                        icon: <Plus className="w-4 h-4" />,
                      }}
                    />
                    <EmptyState
                      type="noResults"
                      action={{
                        label: 'Clear Filters',
                        onClick: () => alert('Clear Filters clicked'),
                        icon: <RefreshCw className="w-4 h-4" />,
                      }}
                    />
                  </div>
                </div>

                {/* Compact Empty State */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compact Empty State</h3>
                  <CompactEmptyState
                    type="noData"
                    action={{
                      label: 'Refresh',
                      onClick: () => alert('Refresh clicked'),
                    }}
                  />
                </div>

                {/* Illustrated Empty State */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Illustrated Empty State</h3>
                  <IllustratedEmptyState
                    illustration={<div className="text-6xl">🌟</div>}
                    title="Custom Illustration"
                    description="This empty state uses a custom illustration component."
                    action={{
                      label: 'Get Started',
                      onClick: () => alert('Get Started clicked'),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loading States */}
          <TabsContent value="loading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Spinner Variants */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Spinner Variants</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {(['orbital', 'pulse', 'dots', 'bars', 'ring'] as const).map((variant) => (
                      <div key={variant} className="text-center space-y-2">
                        <h4 className="text-sm font-medium capitalize">{variant}</h4>
                        <div className="flex justify-center">
                          <LoadingSpinner variant={variant} size="lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spinner Sizes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Spinner Sizes</h3>
                  <div className="flex items-center gap-6">
                    {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <div key={size} className="text-center space-y-2">
                        <h4 className="text-sm font-medium">{size}</h4>
                        <LoadingSpinner size={size} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loading with Text */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Loading with Text</h3>
                  <div className="flex justify-center">
                    <LoadingSpinner text="Generating your reading..." size="lg" />
                  </div>
                </div>

                {/* Loading Button */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Loading Button</h3>
                  <div className="flex gap-4">
                    <LoadingButton
                      isLoading={isButtonLoading}
                      onClick={handleButtonClick}
                      loadingText="Processing..."
                    >
                      Click Me
                    </LoadingButton>
                    <Button onClick={handleShowOverlay} variant="outline">
                      Show Overlay
                    </Button>
                  </div>
                </div>

                {/* Loading Overlay */}
                <LoadingOverlay
                  isVisible={showOverlay}
                  text="Loading your astrology data..."
                  variant="orbital"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quota Management */}
          <TabsContent value="quota" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quota Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Quota Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quota Display</h3>
                  <div className="flex gap-6">
                    <QuotaDisplay used={5} limit={10} />
                    <QuotaDisplay used={8} limit={10} />
                    <QuotaDisplay used={10} limit={10} />
                  </div>
                </div>

                {/* Quota Warning */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quota Warning</h3>
                  <div className="space-y-4">
                    <QuotaWarning
                      used={8}
                      limit={10}
                      onUpgrade={() => alert('Upgrade clicked')}
                      onDismiss={() => alert('Dismissed')}
                    />
                    <QuotaWarning
                      used={10}
                      limit={10}
                      onUpgrade={() => alert('Upgrade clicked')}
                      onDismiss={() => alert('Dismissed')}
                    />
                  </div>
                </div>

                {/* Quota Exceeded Modal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quota Exceeded Modal</h3>
                  <Button onClick={() => setShowQuotaModal(true)}>
                    Show Quota Modal
                  </Button>
                  <QuotaExceeded
                    isOpen={showQuotaModal}
                    onClose={() => setShowQuotaModal(false)}
                    resetAt={new Date(Date.now() + 8 * 60 * 60 * 1000)} // 8 hours from now
                    used={10}
                    limit={10}
                    plan="free"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
