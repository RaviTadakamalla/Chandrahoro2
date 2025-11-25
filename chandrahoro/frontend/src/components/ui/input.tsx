import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default: 'border-input focus-visible:ring-ring',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      size: {
        sm: 'h-9 text-xs',
        default: 'h-11',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, size, ...props }, ref) => {
    const state = error ? 'error' : success ? 'success' : 'default';

    return (
      <input
        type={type}
        className={cn(inputVariants({ state, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };