/**
 * ChandraHoro V2.1 - Quota Widget Component
 * 
 * Displays AI usage quota with progress bar and upgrade options.
 * Shows remaining requests and plan type with visual indicators.
 * 
 * Features:
 * - Real-time quota tracking
 * - Progress bar visualization
 * - Plan type display
 * - Upgrade prompts for free users
 * - Warning states for low quota
 */

'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useQuota } from '@/hooks/useQuota';
import { Zap, Crown, AlertTriangle } from 'lucide-react';

export function QuotaWidget() {
  const { quota, loading, error } = useQuota();
  const router = useRouter();
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }
  
  if (error || !quota) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">Unable to load quota information</span>
        </div>
      </Card>
    );
  }
  
  const totalRequests = quota.requestsRemaining + (quota.requestsUsed || 0);
  const percentage = totalRequests > 0 ? (quota.requestsRemaining / totalRequests) * 100 : 0;
  const isLowQuota = percentage < 20;
  const isFree = quota.planType === 'free';
  
  return (
    <Card className={`p-6 ${isLowQuota ? 'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isLowQuota ? 'text-orange-500' : 'text-blue-500'}`} />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">AI Quota</h3>
          {isLowQuota && (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          )}
        </div>
        <Badge 
          variant={isFree ? 'secondary' : 'default'}
          className={isFree ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}
        >
          {quota.planType === 'free' ? 'Free Plan' : 'Pro Plan'}
        </Badge>
      </div>
      
      {/* Quota Display */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Requests remaining</span>
          <span className={`font-bold ${isLowQuota ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {quota.requestsRemaining}/{totalRequests}
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={`h-2 ${isLowQuota ? 'bg-orange-100 dark:bg-orange-900' : ''}`}
        />
        
        {isLowQuota && (
          <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Running low on AI requests
          </p>
        )}
      </div>
      
      {/* Reset Information */}
      {quota.resetDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Resets on {new Date(quota.resetDate).toLocaleDateString()}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-2">
        {isFree && (isLowQuota || quota.requestsRemaining === 0) && (
          <Button
            onClick={() => router.push('/pricing')}
            className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Button>
        )}
        
        {quota.requestsRemaining === 0 && !isFree && (
          <Button
            onClick={() => router.push('/pricing')}
            variant="outline"
            className="w-full"
          >
            View Usage Details
          </Button>
        )}
        
        {quota.requestsRemaining > 0 && (
          <Button
            onClick={() => router.push('/chat')}
            variant="outline"
            className="w-full"
          >
            Start AI Chat
          </Button>
        )}
      </div>
      
      {/* Pro Benefits */}
      {isFree && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pro benefits:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Unlimited AI conversations</li>
            <li>• Priority support</li>
            <li>• Advanced chart features</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
