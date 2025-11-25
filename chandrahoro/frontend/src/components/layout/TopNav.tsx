'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BrandMark } from '@/components/BrandMark';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  Menu,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Daily',
    href: '/daily',
    icon: Home,
    description: 'Your daily reading',
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    description: 'AI astrology chat',
  },
  {
    label: 'Charts',
    href: '/charts',
    icon: BarChart3,
    description: 'Birth charts & analysis',
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Your profile & settings',
  },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && session?.user;

  return (
    <nav className="sticky top-0 z-50 h-16 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-border/40 transition-colors">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="ChandraHoro Home"
          >
            <BrandMark size="sm" />
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-saffron-600 to-gold-600 bg-clip-text text-transparent">
              ChandraHoro
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/20',
                      active
                        ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/20'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={item.description}
                  >
                    <Icon className={cn(
                      'h-4 w-4 transition-transform duration-300',
                      active && 'scale-110'
                    )} />
                    <span>{item.label}</span>
                    
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-saffron-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="hidden sm:block w-20 h-4 bg-muted rounded animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <>
                {/* AI Insights Button (Desktop) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-2 text-saffron-600 hover:text-saffron-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/20"
                  onClick={() => {/* TODO: Open AI insights */}}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">AI Insights</span>
                </Button>

                {/* User Menu */}
                <UserMenu user={session.user} />

                {/* Mobile Menu Button */}
                <MobileMenu 
                  isOpen={mobileMenuOpen}
                  onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                  navItems={navItems}
                  user={session.user}
                />
              </>
            ) : (
              /* Unauthenticated State */
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 text-white"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
