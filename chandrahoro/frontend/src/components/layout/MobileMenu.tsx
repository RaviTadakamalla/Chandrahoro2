'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/components/ui/theme-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems: NavItem[];
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function MobileMenu({ isOpen, onToggle, navItems, user }: MobileMenuProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    return user.name || user.email || 'User';
  };

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 hover:bg-saffron-50 dark:hover:bg-saffron-900/20"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header with User Info */}
          <SheetHeader className="p-6 bg-gradient-to-r from-saffron-50 to-gold-50 dark:from-saffron-900/20 dark:to-gold-900/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={user.image || undefined} 
                  alt={getDisplayName()}
                  className="object-cover"
                />
                <AvatarFallback className="bg-saffron-500 text-white font-semibold">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <SheetTitle className="text-base font-semibold text-charcoal dark:text-white">
                  {getDisplayName()}
                </SheetTitle>
                <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                  {user.email}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {/* AI Insights */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-saffron-600 hover:text-saffron-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/20"
              onClick={() => {/* TODO: Open AI insights */}}
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">AI Insights</span>
            </Button>

            <Separator className="my-4" />

            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all duration-200',
                      active
                        ? 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300'
                        : 'hover:bg-saffron-50 dark:hover:bg-saffron-900/20 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      active && 'scale-110 text-saffron-600'
                    )} />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* Additional Actions */}
            <div className="space-y-1">
              <Link
                href="/settings"
                onClick={onToggle}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-saffron-50 dark:hover:bg-saffron-900/20 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </Link>

              <Link
                href="/billing"
                onClick={onToggle}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-saffron-50 dark:hover:bg-saffron-900/20 text-muted-foreground hover:text-foreground transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Billing</span>
              </Link>

              <Link
                href="/help"
                onClick={onToggle}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-saffron-50 dark:hover:bg-saffron-900/20 text-muted-foreground hover:text-foreground transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Help & Support</span>
              </Link>
            </div>

            <Separator className="my-4" />

            {/* Theme Toggle */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-3">
                Theme
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((themeOption) => {
                  const Icon = themeIcons[themeOption];
                  return (
                    <Button
                      key={themeOption}
                      variant={theme === themeOption ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setTheme(themeOption)}
                      className={cn(
                        'h-10 flex flex-col gap-1 text-xs capitalize',
                        theme === themeOption 
                          ? 'bg-saffron-500 text-white hover:bg-saffron-600' 
                          : 'hover:bg-saffron-50 dark:hover:bg-saffron-900/20'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {themeOption}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with Sign Out */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
