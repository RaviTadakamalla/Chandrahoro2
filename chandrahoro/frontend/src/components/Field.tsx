import React, { useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'password';
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Field = memo(React.forwardRef<HTMLInputElement, FieldProps>(
  (
    {
      label,
      error,
      helpText,
      variant = 'default',
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      type,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = variant === 'password' || type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type || 'text';

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword(prev => !prev);
    }, []);

    return (
      <div className={cn('flex flex-col gap-2', containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'text-sm font-inter font-500 text-charcoal dark:text-white',
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            autoComplete={props.autoComplete || (type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off')}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border-2 border-saffron-200 bg-white text-charcoal placeholder-gray-400 transition-all duration-150',
              'focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-200/50',
              'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
              'dark:bg-ink-80 dark:text-white dark:border-saffron-700 dark:placeholder-gray-500',
              'dark:focus:border-saffron-400 dark:focus:ring-saffron-400/30',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-200/50',
              inputClassName
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helpText && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{helpText}</p>
        )}
      </div>
    );
  }
));

Field.displayName = 'Field';

