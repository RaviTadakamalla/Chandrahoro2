import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className = '',
  iconClassName = '',
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border-2 border-saffron-200 bg-white p-4 transition-all duration-200',
        'hover:border-saffron-400 hover:shadow-soft hover:-translate-y-1',
        'dark:border-saffron-800 dark:bg-ink-80 dark:hover:border-saffron-600',
        className
      )}
    >
      {/* Decorative glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-saffron-400/0 to-saffron-400/0 group-hover:from-saffron-400/5 group-hover:to-saffron-400/10 transition-all duration-200 pointer-events-none" />

      {/* Icon */}
      <div
        className={cn(
          'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-saffron-100 text-saffron-600 transition-all duration-200 group-hover:bg-saffron-200 group-hover:scale-110',
          'dark:bg-saffron-900/30 dark:text-saffron-400 dark:group-hover:bg-saffron-900/50',
          iconClassName
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 font-poppins text-base font-600 text-charcoal dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
        {description}
      </p>

      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-saffron-400/0 group-hover:border-saffron-400/30 transition-all duration-200 pointer-events-none" />
    </div>
  );
}

