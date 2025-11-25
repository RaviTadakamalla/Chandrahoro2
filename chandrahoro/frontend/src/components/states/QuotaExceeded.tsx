'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Clock,
  Zap,
  Crown,
  X,
} from 'lucide-react';

interface QuotaExceededProps {
  isOpen: boolean;
  onClose: () => void;
  resetAt: Date | string;
  used: number;
  limit: number;
  plan?: 'free' | 'premium' | 'pro';
  className?: string;
}

/**
 * Quota Exceeded Modal Component
 * 
 * Displays when user has reached their daily AI request limit
 * with countdown timer and upgrade options.
 */
export function QuotaExceeded({
  isOpen,
  onClose,
  resetAt,
  used,
  limit,
  plan = 'free',
  className,
}: QuotaExceededProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  const resetDate = new Date(resetAt);

  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = resetDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeLeft('Now');
        setProgress(100);
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      // Calculate progress (assuming 24-hour reset cycle)
      const totalMs = 24 * 60 * 60 * 1000;
      const elapsedMs = totalMs - timeDiff;
      setProgress((elapsedMs / totalMs) * 100);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isOpen, resetDate]);

  const usagePercentage = (used / limit) * 100;

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  const handleContactSupport = () => {
    router.push('/support');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader className="text-center space-y-4">
          {/* Warning Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold">
              Daily Limit Reached
            </DialogTitle>
            <DialogDescription className="text-base">
              You've used all your AI requests for today
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Requests Used</span>
              <span className="font-medium">{used} of {limit}</span>
            </div>
            
            <Progress value={usagePercentage} className="h-2" />
            
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </Badge>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Quota resets in</span>
            </div>
            
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {timeLeft}
            </div>
            
            <Progress value={progress} className="h-1 bg-orange-100 dark:bg-orange-900/20" />
          </div>

          {/* Upgrade Options */}
          {plan === 'free' && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                  Upgrade for More Requests
                </h4>
              </div>
              
              <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <p>• Premium: 100 requests/day</p>
                <p>• Pro: Unlimited requests</p>
                <p>• Priority support & advanced features</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {plan === 'free' && (
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="flex-1"
              >
                Contact Support
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Quota resets daily at midnight IST</p>
            <p>Need help? Contact our support team</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Quota Warning Component
 * 
 * Shows warning when approaching quota limit.
 */
export function QuotaWarning({
  used,
  limit,
  onUpgrade,
  onDismiss,
  className,
}: {
  used: number;
  limit: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  const percentage = (used / limit) * 100;
  const remaining = limit - used;

  if (percentage < 80) return null; // Only show when 80%+ used

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-lg border',
      percentage >= 95 
        ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
        : 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800',
      className
    )}>
      <AlertTriangle className={cn(
        'w-5 h-5 flex-shrink-0',
        percentage >= 95 ? 'text-red-600' : 'text-orange-600'
      )} />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium',
          percentage >= 95 ? 'text-red-900 dark:text-red-100' : 'text-orange-900 dark:text-orange-100'
        )}>
          {remaining === 0 
            ? 'Daily limit reached' 
            : `${remaining} request${remaining === 1 ? '' : 's'} remaining`
          }
        </p>
        <p className={cn(
          'text-xs',
          percentage >= 95 ? 'text-red-700 dark:text-red-300' : 'text-orange-700 dark:text-orange-300'
        )}>
          {percentage >= 95 
            ? 'Consider upgrading for unlimited access'
            : 'You\'re running low on daily requests'
          }
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onUpgrade && (
          <Button onClick={onUpgrade} size="sm" variant="outline">
            Upgrade
          </Button>
        )}
        
        {onDismiss && (
          <Button onClick={onDismiss} size="sm" variant="ghost">
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Quota Display Component
 * 
 * Shows current quota usage in a compact format.
 */
export function QuotaDisplay({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  const percentage = (used / limit) * 100;
  const remaining = limit - used;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-orange-600" />
        <span className="text-xs font-medium">
          {remaining}/{limit}
        </span>
      </div>
      
      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            percentage >= 95 
              ? 'bg-red-500' 
              : percentage >= 80 
                ? 'bg-orange-500' 
                : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
