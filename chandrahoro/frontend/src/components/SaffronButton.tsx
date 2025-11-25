import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-inter font-600 text-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-accent disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-saffron-500 text-white hover:bg-saffron-600 active:bg-saffron-700 shadow-soft hover:shadow-glow',
        secondary:
          'bg-saffron-100 text-saffron-700 hover:bg-saffron-200 active:bg-saffron-300 border border-saffron-300',
        ghost:
          'text-saffron-600 hover:bg-saffron-50 active:bg-saffron-100 dark:text-saffron-400 dark:hover:bg-saffron-900/20',
        outline:
          'border-2 border-saffron-500 text-saffron-600 hover:bg-saffron-50 active:bg-saffron-100 dark:text-saffron-400 dark:hover:bg-saffron-900/20',
        subtle:
          'text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 underline-offset-2 hover:underline',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft',
      },
      size: {
        xs: 'px-2 py-1 text-xs h-8',
        sm: 'px-3 py-2 text-sm h-9',
        md: 'px-4 py-2.5 text-base h-10',
        lg: 'px-6 py-3 text-base h-12',
        xl: 'px-8 py-4 text-lg h-14',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface SaffronButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
}

export const SaffronButton = React.forwardRef<HTMLButtonElement, SaffronButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <a
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref as any}
          {...props}
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
              {children}
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </a>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

SaffronButton.displayName = 'SaffronButton';

