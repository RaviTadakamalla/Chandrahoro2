'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  Home,
  MessageSquare,
  BarChart3,
  User,
  Settings,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor?: string;
}

const tabItems: TabItem[] = [
  {
    label: 'Daily',
    href: '/daily',
    icon: Home,
    activeColor: 'text-saffron-600',
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    activeColor: 'text-saffron-600',
  },
  {
    label: 'Charts',
    href: '/charts',
    icon: BarChart3,
    activeColor: 'text-saffron-600',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    activeColor: 'text-saffron-600',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    activeColor: 'text-saffron-600',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  // Don't show bottom nav if user is not authenticated
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  // Don't show on desktop
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Safe area padding for devices with home indicator */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-border/40 pb-safe">
        <div className="flex items-center justify-around h-18 px-2">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={triggerHapticFeedback}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl transition-all duration-300 ease-out',
                  'hover:bg-saffron-50 dark:hover:bg-saffron-900/20',
                  'focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2',
                  'active:scale-95',
                  active && 'bg-saffron-50 dark:bg-saffron-900/20'
                )}
                aria-label={`Navigate to ${item.label}`}
              >
                {/* Icon with active state animation */}
                <div className={cn(
                  'relative transition-all duration-300 ease-out',
                  active && 'scale-110'
                )}>
                  <Icon 
                    className={cn(
                      'h-6 w-6 transition-colors duration-300',
                      active 
                        ? 'text-saffron-600 dark:text-saffron-400' 
                        : 'text-muted-foreground'
                    )} 
                  />
                  
                  {/* Active indicator dot */}
                  {active && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-saffron-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-xs font-medium mt-1 transition-colors duration-300',
                  active 
                    ? 'text-saffron-600 dark:text-saffron-400' 
                    : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-saffron-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Hook to add bottom padding to content when bottom nav is visible
export function useBottomNavPadding() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const shouldShowBottomNav = status === 'authenticated' && session?.user;
    const isMobile = window.innerWidth < 768;
    
    if (shouldShowBottomNav && isMobile) {
      document.body.style.paddingBottom = '5rem'; // 80px for bottom nav
    } else {
      document.body.style.paddingBottom = '0';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [session, status]);
}
