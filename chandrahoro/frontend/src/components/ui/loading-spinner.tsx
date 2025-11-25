'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('inline-block animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      primary: 'text-saffron',
      secondary: 'text-celestial-medium',
      accent: 'text-gold',
      white: 'text-white',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

interface LoadingSpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size, color, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(spinnerVariants({ size, color, className }))}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
);
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingSpinnerWithTextProps extends LoadingSpinnerProps {
  text?: string;
  textClassName?: string;
}

const LoadingSpinnerWithText = React.forwardRef<
  SVGSVGElement,
  LoadingSpinnerWithTextProps
>(({ text, textClassName, size, color, ...props }, ref) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <LoadingSpinner ref={ref} size={size} color={color} {...props} />
    {text && <p className={cn('text-sm text-muted-foreground', textClassName)}>{text}</p>}
  </div>
));
LoadingSpinnerWithText.displayName = 'LoadingSpinnerWithText';

export { LoadingSpinner, LoadingSpinnerWithText, spinnerVariants };

