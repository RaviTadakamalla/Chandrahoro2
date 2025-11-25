'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  FileText,
  BarChart3,
  Search,
  Plus,
  Star,
  Calendar,
  Users,
  Inbox,
} from 'lucide-react';

export type EmptyStateType = 'noChats' | 'noReadings' | 'noCharts' | 'noResults' | 'noData' | 'noFavorites' | 'noEvents' | 'noUsers' | 'inbox';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced Empty State Component
 * 
 * Displays user-friendly empty states with illustrations,
 * descriptions, and call-to-action buttons for various scenarios.
 */
export function EmptyState({
  type = 'noData',
  title,
  description,
  illustration,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = getEmptyStateConfig(type);
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIllustration = illustration || config.illustration;

  const sizeClasses = {
    sm: 'p-6 gap-4',
    md: 'p-8 gap-6',
    lg: 'p-12 gap-8',
  };

  const iconSizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Card className={cn('border-dashed border-2 bg-muted/30', className)}>
      <CardContent className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size]
      )}>
        {/* Illustration */}
        <div className={cn(
          'flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground',
          iconSizes[size]
        )}>
          {finalIllustration}
        </div>

        {/* Content */}
        <div className="space-y-2 max-w-md">
          <h3 className={cn('font-semibold text-foreground', titleSizes[size])}>
            {finalTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {finalDescription}
          </p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                size={size === 'lg' ? 'default' : 'sm'}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size={size === 'lg' ? 'default' : 'sm'}
              >
                {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Empty State Component
 * 
 * Smaller empty state for inline use.
 */
export function CompactEmptyState({
  type = 'noData',
  message,
  action,
  className,
}: Pick<EmptyStateProps, 'type' | 'className'> & {
  message?: string;
  action?: EmptyStateAction;
}) {
  const config = getEmptyStateConfig(type);
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 p-6 text-center',
      'border border-dashed border-muted-foreground/25 rounded-lg bg-muted/20',
      className
    )}>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground">
        {config.illustration}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          {message || config.title}
        </p>
      </div>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'outline'}
          size="sm"
        >
          {action.icon && <span className="mr-1">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty State with Custom Illustration
 * 
 * Allows for custom SVG or image illustrations.
 */
export function IllustratedEmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-6 p-8 text-center',
      className
    )}>
      {/* Custom Illustration */}
      <div className="w-32 h-32 flex items-center justify-center">
        {illustration}
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Get empty state configuration based on type
 */
function getEmptyStateConfig(type: EmptyStateType) {
  const configs = {
    noChats: {
      illustration: <MessageSquare className="h-8 w-8" />,
      title: 'No Conversations Yet',
      description: 'Start chatting with your AI Astro-Guide to get personalized insights about your birth chart and life events.',
    },
    noReadings: {
      illustration: <FileText className="h-8 w-8" />,
      title: 'No Readings Available',
      description: 'Generate your first daily reading to discover what the stars have in store for you today.',
    },
    noCharts: {
      illustration: <BarChart3 className="h-8 w-8" />,
      title: 'No Charts Created',
      description: 'Create your birth chart to unlock detailed astrological insights and personalized predictions.',
    },
    noResults: {
      illustration: <Search className="h-8 w-8" />,
      title: 'No Results Found',
      description: 'Try adjusting your search criteria or browse our available content to find what you\'re looking for.',
    },
    noData: {
      illustration: <Inbox className="h-8 w-8" />,
      title: 'No Data Available',
      description: 'There\'s nothing to display here yet. Check back later or try refreshing the page.',
    },
    noFavorites: {
      illustration: <Star className="h-8 w-8" />,
      title: 'No Favorites Yet',
      description: 'Save your favorite readings, charts, and insights to access them quickly anytime.',
    },
    noEvents: {
      illustration: <Calendar className="h-8 w-8" />,
      title: 'No Events Scheduled',
      description: 'Your calendar is clear. Add important dates to track astrological influences on your life events.',
    },
    noUsers: {
      illustration: <Users className="h-8 w-8" />,
      title: 'No Users Found',
      description: 'No users match your current criteria. Try adjusting your filters or search terms.',
    },
    inbox: {
      illustration: <span className="text-2xl">📭</span>,
      title: 'Inbox Empty',
      description: 'All caught up! You have no new messages or notifications at this time.',
    },
  };

  return configs[type] || configs.noData;
}

/**
 * Empty State Hook
 * 
 * Custom hook for managing empty states.
 */
export function useEmptyState(data: any[] | null | undefined) {
  const isEmpty = React.useMemo(() => {
    if (data === null || data === undefined) return false; // Loading state
    return Array.isArray(data) && data.length === 0;
  }, [data]);

  const isLoading = data === null || data === undefined;

  return {
    isEmpty,
    isLoading,
    hasData: !isEmpty && !isLoading,
  };
}
