/**
 * ChandraHoro V2.1 - Mobile Bottom Navigation Component
 * 
 * Fixed bottom navigation for mobile devices with 5 primary tabs.
 * Provides quick access to main features with active state indicators.
 * 
 * Features:
 * - Fixed bottom positioning with safe area support
 * - Active tab highlighting with orange accent
 * - Touch-friendly 44px minimum targets
 * - Auto-hide on auth/onboarding pages
 * - Smooth transitions and active states
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, MessageSquare, PieChart, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    icon: Home, 
    label: 'Home', 
    href: '/dashboard',
    matchPaths: ['/dashboard', '/']
  },
  { 
    icon: BookOpen, 
    label: 'Reading', 
    href: '/readings/daily',
    matchPaths: ['/readings', '/readings/daily']
  },
  { 
    icon: MessageSquare, 
    label: 'Chat', 
    href: '/chat',
    matchPaths: ['/chat']
  },
  { 
    icon: PieChart, 
    label: 'Chart', 
    href: '/charts',
    matchPaths: ['/charts']
  },
  { 
    icon: Menu, 
    label: 'More', 
    href: '/profile',
    matchPaths: ['/profile', '/settings', '/alerts', '/compatibility', '/transits', '/pricing']
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Hide on certain pages where bottom nav shouldn't appear
  const hiddenPaths = ['/onboarding', '/auth', '/login', '/register', '/forgot-password'];
  const shouldHide = hiddenPaths.some(path => pathname?.startsWith(path));
  
  if (shouldHide) {
    return null;
  }
  
  /**
   * Check if a nav item is active based on current pathname
   */
  const isActiveItem = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    
    // Check additional match paths
    if (item.matchPaths) {
      return item.matchPaths.some(path => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
      });
    }
    
    return false;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden z-50 safe-area-bottom">
      <nav className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveItem(item);
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] rounded-lg transition-all duration-200',
                'active:scale-95 active:bg-gray-100 dark:active:bg-gray-800',
                isActive
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              )}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon 
                className={cn(
                  'w-6 h-6 mb-1 transition-transform duration-200',
                  isActive && 'scale-110'
                )} 
              />
              <span 
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive ? 'font-semibold' : 'font-normal'
                )}
              >
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Hook to get current active tab for external components
 */
export function useActiveTab(): string {
  const pathname = usePathname();
  
  for (const item of NAV_ITEMS) {
    if (pathname === item.href) return item.label.toLowerCase();
    
    if (item.matchPaths) {
      const isMatch = item.matchPaths.some(path => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
      });
      if (isMatch) return item.label.toLowerCase();
    }
  }
  
  return 'home';
}
