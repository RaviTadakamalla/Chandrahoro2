'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  BarChart3,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserMenu({ user, className }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback redirect
      router.push('/auth/signin');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
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

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-10 rounded-full hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors ${className}`}
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={user.image || undefined} 
              alt={getDisplayName()}
              className="object-cover"
            />
            <AvatarFallback className="bg-saffron-500 text-white font-semibold text-sm">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-2" 
        align="end" 
        forceMount
      >
        {/* User Info Section */}
        <DropdownMenuLabel className="p-3 bg-gradient-to-r from-saffron-50 to-gold-50 dark:from-saffron-900/20 dark:to-gold-900/20 rounded-lg mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={user.image || undefined} 
                alt={getDisplayName()}
                className="object-cover"
              />
              <AvatarFallback className="bg-saffron-500 text-white font-semibold">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-charcoal dark:text-white">
                {getDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('/profile')}
          className="cursor-pointer p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
        >
          <User className="mr-3 h-4 w-4 text-saffron-600" />
          <span className="text-sm">Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard')}
          className="cursor-pointer p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
        >
          <BarChart3 className="mr-3 h-4 w-4 text-saffron-600" />
          <span className="text-sm">Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('/settings')}
          className="cursor-pointer p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
        >
          <Settings className="mr-3 h-4 w-4 text-saffron-600" />
          <span className="text-sm">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('/billing')}
          className="cursor-pointer p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
        >
          <CreditCard className="mr-3 h-4 w-4 text-saffron-600" />
          <span className="text-sm">Billing</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-3 gap-1 p-1">
          {(['light', 'dark', 'system'] as const).map((themeOption) => {
            const Icon = themeIcons[themeOption];
            return (
              <Button
                key={themeOption}
                variant={theme === themeOption ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme(themeOption)}
                className={`h-8 px-2 text-xs capitalize ${
                  theme === themeOption 
                    ? 'bg-saffron-500 text-white hover:bg-saffron-600' 
                    : 'hover:bg-saffron-50 dark:hover:bg-saffron-900/20'
                }`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {themeOption}
              </Button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('/help')}
          className="cursor-pointer p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors"
        >
          <HelpCircle className="mr-3 h-4 w-4 text-saffron-600" />
          <span className="text-sm">Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
