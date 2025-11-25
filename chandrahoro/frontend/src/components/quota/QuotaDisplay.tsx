/**
 * ChandraHoro V2.1 - Quota Display Component
 * 
 * Visual component for displaying user's AI quota status, usage, and warnings.
 * Provides real-time quota information with progress bars and upgrade prompts.
 * 
 * Features:
 * - Real-time quota display
 * - Progress bars for requests and tokens
 * - Warning alerts at 80% usage
 * - Upgrade prompts for free users
 * - Plan badge display
 * - Time until reset countdown
 * - Responsive design
 */

'use client';

import { useQuota, formatQuotaPercentage, getQuotaStatusColor, getQuotaStatusMessage } from '@/hooks/useQuota';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Zap, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface QuotaDisplayProps {
  variant?: 'default' | 'compact' | 'detailed';
  showUpgradePrompt?: boolean;
  className?: string;
}

/**
 * Main quota display component
 */
export function QuotaDisplay({ 
  variant = 'default', 
  showUpgradePrompt = true,
  className 
}: QuotaDisplayProps) {
  const { quota, loading, error, refetch, isExceeded, isWarning, percentageUsed, timeUntilReset } = useQuota();
  const router = useRouter();
  
  if (loading) {
    return <QuotaDisplaySkeleton variant={variant} className={className} />;
  }
  
  if (error) {
    return <QuotaDisplayError error={error} onRetry={refetch} className={className} />;
  }
  
  if (!quota) {
    return null;
  }
  
  if (variant === 'compact') {
    return <CompactQuotaDisplay quota={quota} className={className} />;
  }
  
  if (variant === 'detailed') {
    return <DetailedQuotaDisplay quota={quota} showUpgradePrompt={showUpgradePrompt} className={className} />;
  }
  
  // Default variant
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Quota
          </span>
          <Badge variant={quota.planType === 'free' ? 'secondary' : 'default'} className="capitalize">
            {quota.planType}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Requests Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Requests</span>
            <span className="text-sm font-semibold">
              {quota.requestsRemaining} remaining
            </span>
          </div>
          
          <Progress 
            value={quota.requestsPercentage} 
            className="h-2"
            indicatorClassName={cn(
              quota.requestsPercentage >= 90 ? 'bg-red-500' :
              quota.requestsPercentage >= 80 ? 'bg-orange-500' :
              'bg-green-500'
            )}
          />
          
          <p className="text-xs text-gray-500 mt-1">
            {quota.requestsUsed} / {quota.dailyRequestLimit} used ({formatQuotaPercentage(quota.requestsPercentage)})
          </p>
        </div>
        
        {/* Tokens Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tokens</span>
            <span className="text-sm font-semibold">
              {quota.tokensRemaining.toLocaleString()} remaining
            </span>
          </div>
          
          <Progress 
            value={quota.tokensPercentage} 
            className="h-2"
            indicatorClassName={cn(
              quota.tokensPercentage >= 90 ? 'bg-red-500' :
              quota.tokensPercentage >= 80 ? 'bg-orange-500' :
              'bg-green-500'
            )}
          />
          
          <p className="text-xs text-gray-500 mt-1">
            {quota.tokensUsed.toLocaleString()} / {quota.dailyTokenLimit.toLocaleString()} used ({formatQuotaPercentage(quota.tokensPercentage)})
          </p>
        </div>
        
        {/* Reset Time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Resets in {timeUntilReset}
          </span>
          <span className="capitalize">{quota.capMode} limit</span>
        </div>
        
        {/* Warning Alert */}
        {isWarning && (
          <Alert variant="warning" className="border-orange-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getQuotaStatusMessage(quota)}
              {quota.planType === 'free' && showUpgradePrompt && (
                <Button
                  variant="link"
                  className="p-0 h-auto ml-1 text-orange-600"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade to Pro
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Exceeded Alert */}
        {isExceeded && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Daily quota exceeded. Resets at midnight IST.
              {quota.planType === 'free' && showUpgradePrompt && (
                <Button
                  variant="link"
                  className="p-0 h-auto ml-1 text-red-600"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade Now
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact quota display for sidebars or small spaces
 */
function CompactQuotaDisplay({ quota, className }: { quota: any; className?: string }) {
  const maxPercentage = Math.max(quota.requestsPercentage, quota.tokensPercentage);
  const color = getQuotaStatusColor(maxPercentage);
  
  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg border', className)}>
      <Zap className="w-4 h-4 text-gray-500" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">AI Quota</span>
          <Badge variant="outline" className="text-xs capitalize">
            {quota.planType}
          </Badge>
        </div>
        <Progress 
          value={maxPercentage} 
          className="h-1 mt-1"
          indicatorClassName={cn(
            color === 'red' ? 'bg-red-500' :
            color === 'orange' ? 'bg-orange-500' :
            'bg-green-500'
          )}
        />
      </div>
    </div>
  );
}

/**
 * Detailed quota display with additional statistics
 */
function DetailedQuotaDisplay({ quota, showUpgradePrompt, className }: { 
  quota: any; 
  showUpgradePrompt: boolean;
  className?: string;
}) {
  const router = useRouter();
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Usage Dashboard
          </span>
          <Badge variant={quota.planType === 'free' ? 'secondary' : 'default'} className="capitalize">
            {quota.planType} Plan
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Usage Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Daily Requests</h4>
            <div className="text-2xl font-bold">{quota.requestsUsed}</div>
            <div className="text-sm text-gray-500">of {quota.dailyRequestLimit}</div>
            <Progress value={quota.requestsPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tokens Used</h4>
            <div className="text-2xl font-bold">{quota.tokensUsed.toLocaleString()}</div>
            <div className="text-sm text-gray-500">of {quota.dailyTokenLimit.toLocaleString()}</div>
            <Progress value={quota.tokensPercentage} className="h-2" />
          </div>
        </div>
        
        {/* Status Information */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium">Status</div>
            <div className={cn(
              'text-xs mt-1 font-semibold',
              quota.allowed ? 'text-green-600' : 'text-red-600'
            )}>
              {quota.allowed ? 'Active' : 'Exceeded'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">Cap Mode</div>
            <div className="text-xs mt-1 capitalize">{quota.capMode}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">Reset Time</div>
            <div className="text-xs mt-1">{new Date(quota.resetAt).toLocaleTimeString()}</div>
          </div>
        </div>
        
        {/* Upgrade Prompt */}
        {quota.planType === 'free' && showUpgradePrompt && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Upgrade for More Quota</h4>
            <p className="text-sm text-blue-700 mb-3">
              Get 5x more requests and access to advanced AI models with Pro plan.
            </p>
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for quota display
 */
function QuotaDisplaySkeleton({ variant, className }: { variant: string; className?: string }) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 p-2 rounded-lg border', className)}>
        <Skeleton className="w-4 h-4" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-1 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error display for quota component
 */
function QuotaDisplayError({ error, onRetry, className }: { 
  error: string; 
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load quota: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
