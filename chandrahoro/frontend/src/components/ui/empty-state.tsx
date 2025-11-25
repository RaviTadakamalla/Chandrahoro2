'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      secondaryAction,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center',
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex gap-2 pt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="sm"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="sm"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';

export { EmptyState, type EmptyStateProps };

