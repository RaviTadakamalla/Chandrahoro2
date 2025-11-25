/**
 * ChandraHoro V2.1 - Responsive Layout Component
 * 
 * Main layout wrapper that handles mobile-responsive design patterns.
 * Provides consistent spacing for bottom navigation and safe areas.
 * 
 * Features:
 * - Mobile bottom navigation integration
 * - Safe area inset support for notched devices
 * - Responsive padding adjustments
 * - Dark mode support
 * - Flexible content area
 */

'use client';

import { ReactNode } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  /**
   * Whether to add bottom padding for mobile nav
   * Set to false for full-screen components like onboarding
   */
  withBottomNav?: boolean;
  /**
   * Whether to add safe area padding
   * Set to false for components that handle their own safe areas
   */
  withSafeArea?: boolean;
  /**
   * Custom container max width
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
}

export function ResponsiveLayout({
  children,
  className,
  withBottomNav = true,
  withSafeArea = true,
  maxWidth = '6xl',
}: ResponsiveLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };
  
  return (
    <>
      <main 
        className={cn(
          'min-h-screen',
          // Bottom navigation spacing
          withBottomNav && 'pb-20 md:pb-0',
          // Safe area support
          withSafeArea && 'safe-area-top',
          // Container constraints
          maxWidth !== 'full' && `container mx-auto ${maxWidthClasses[maxWidth]}`,
          // Custom classes
          className
        )}
      >
        {children}
      </main>
      
      {/* Mobile bottom navigation */}
      {withBottomNav && <MobileBottomNav />}
    </>
  );
}

/**
 * Page wrapper for consistent page layouts
 */
interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: ReactNode;
  withBottomNav?: boolean;
  maxWidth?: ResponsiveLayoutProps['maxWidth'];
}

export function PageLayout({
  children,
  title,
  subtitle,
  className,
  headerActions,
  withBottomNav = true,
  maxWidth = '6xl',
}: PageLayoutProps) {
  return (
    <ResponsiveLayout 
      withBottomNav={withBottomNav} 
      maxWidth={maxWidth}
      className={cn('p-4 md:p-6', className)}
    >
      {/* Page Header */}
      {(title || subtitle || headerActions) && (
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            
            {headerActions && (
              <div className="flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Page Content */}
      <div className="space-y-6 md:space-y-8">
        {children}
      </div>
    </ResponsiveLayout>
  );
}

/**
 * Card layout for consistent card-based pages
 */
interface CardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  cardClassName?: string;
  withBottomNav?: boolean;
}

export function CardLayout({
  children,
  title,
  subtitle,
  className,
  cardClassName,
  withBottomNav = true,
}: CardLayoutProps) {
  return (
    <ResponsiveLayout 
      withBottomNav={withBottomNav}
      className={cn('p-4 md:p-6', className)}
    >
      <div className={cn(
        'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8',
        cardClassName
      )}>
        {/* Card Header */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Card Content */}
        {children}
      </div>
    </ResponsiveLayout>
  );
}

/**
 * Full-screen layout for immersive experiences
 */
interface FullScreenLayoutProps {
  children: ReactNode;
  className?: string;
  withSafeArea?: boolean;
}

export function FullScreenLayout({
  children,
  className,
  withSafeArea = true,
}: FullScreenLayoutProps) {
  return (
    <div 
      className={cn(
        'min-h-screen w-full',
        withSafeArea && 'safe-area-top safe-area-bottom',
        className
      )}
    >
      {children}
    </div>
  );
}
