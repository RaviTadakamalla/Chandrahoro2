import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BrandMark } from '@/components/BrandMark';
import { SaffronButton } from '@/components/SaffronButton';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, BarChart3, User, TrendingUp, Sparkles } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
  { label: 'Community', href: '#community' },
];

export function MainNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      if (!isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-saffron-200 dark:border-saffron-800 bg-white/80 dark:bg-ink-80/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <BrandMark size="md" showText={true} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              // Use anchor tag for hash links, Link for page routes
              if (item.href.startsWith('#')) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-inter font-500 text-charcoal dark:text-white hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-saffron-500 group-hover:w-full transition-all duration-300" />
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-inter font-500 text-charcoal dark:text-white hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-saffron-500 group-hover:w-full transition-all duration-300" />
                </Link>
              );
            })}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5 text-saffron-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-saffron-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a1 1 0 00-1.414 1.414zm2.828-2.828l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 001.414 1.414zM13 11a1 1 0 110 2h-2a1 1 0 110-2h2zm1.464-1.464l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 001.414 1.414zM9 5a1 1 0 110-2 1 1 0 010 2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* User Profile Dropdown or Sign In */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-saffron-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-charcoal dark:text-white">
                      {user.full_name || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-charcoal dark:text-white">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/charts">
                    <DropdownMenuItem className="cursor-pointer">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span>My Charts</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/intensity-analysis">
                    <DropdownMenuItem className="cursor-pointer">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>Intensity Analysis</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/ai-insights">
                    <DropdownMenuItem className="cursor-pointer">
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>AI Insights</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SaffronButton
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Sign in
              </SaffronButton>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-saffron-200 dark:border-saffron-800 space-y-3">
            {navItems.map((item) => {
              // Use anchor tag for hash links, Link for page routes
              if (item.href.startsWith('#')) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 rounded-lg text-charcoal dark:text-white hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 rounded-lg text-charcoal dark:text-white hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="px-4 py-2 border-t border-saffron-200 dark:border-saffron-800 mt-3">
                  <p className="text-sm font-medium text-charcoal dark:text-white mb-3">
                    {user.full_name || user.email}
                  </p>
                  <Link href="/charts" onClick={() => setMobileMenuOpen(false)}>
                    <div className="block px-4 py-2 rounded-lg text-charcoal dark:text-white hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors mb-2">
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      My Charts
                    </div>
                  </Link>
                  <Link href="/intensity-analysis" onClick={() => setMobileMenuOpen(false)}>
                    <div className="block px-4 py-2 rounded-lg text-charcoal dark:text-white hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors mb-2">
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Intensity Analysis
                    </div>
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <div className="block px-4 py-2 rounded-lg text-charcoal dark:text-white hover:bg-saffron-100 dark:hover:bg-saffron-900/30 transition-colors mb-2">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Settings
                    </div>
                  </Link>
                  <SaffronButton
                    variant="primary"
                    size="md"
                    className="w-full mt-2 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </SaffronButton>
                </div>
              </>
            ) : (
              <SaffronButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Sign in
              </SaffronButton>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

