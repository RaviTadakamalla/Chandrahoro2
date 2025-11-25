/**
 * Authentication Hooks for ChandraHoro V2.1
 * 
 * Custom hooks for managing authentication state, session data,
 * and auth-related operations using NextAuth.js.
 */

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { Session } from 'next-auth';

/**
 * Extended user type with profile and entitlement data
 */
export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
  profile?: {
    id: string;
    fullName: string;
    dateOfBirth?: Date;
    timeOfBirth?: string;
    placeOfBirth?: string;
    onboardingCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  entitlement?: {
    id: string;
    planType: string;
    requestsUsed: number;
    requestsLimit: number;
    quotaResetAt: Date;
    isActive: boolean;
  };
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: ExtendedUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasActiveSubscription: boolean;
}

/**
 * Main authentication hook
 * Provides comprehensive auth state and methods
 */
export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
} {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user as ExtendedUser | null;
  const isLoading = status === 'loading';
  const isAuthenticated = !!session && !!user;
  const isOnboardingComplete = user?.profile?.onboardingCompleted ?? false;
  const hasActiveSubscription = user?.entitlement?.isActive ?? false;

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  /**
   * Refresh session data
   */
  const refreshSession = useCallback(async () => {
    try {
      await update();
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, [update]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isOnboardingComplete,
    hasActiveSubscription,
    login,
    logout,
    refreshSession,
  };
}

/**
 * Hook for requiring authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectUrl = '/auth/signin') {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  return { 
    isAuthenticated, 
    isLoading, 
    user,
    isReady: !isLoading && isAuthenticated 
  };
}

/**
 * Hook for requiring onboarding completion
 * Redirects to onboarding if not completed
 */
export function useRequireOnboarding(redirectUrl = '/onboarding') {
  const { isAuthenticated, isOnboardingComplete, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (isAuthenticated && !isOnboardingComplete) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading, router, redirectUrl]);

  return { 
    isAuthenticated, 
    isOnboardingComplete, 
    isLoading, 
    user,
    isReady: !isLoading && isAuthenticated && isOnboardingComplete 
  };
}

/**
 * Hook for OAuth login
 * Handles Google and Apple sign-in
 */
export function useOAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithProvider = useCallback(async (
    provider: 'google' | 'apple',
    callbackUrl = '/dashboard'
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = 'OAuth login failed';
      setError(errorMessage);
      console.error('OAuth login error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loginWithProvider,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing user profile
 * Provides profile data and update methods
 */
export function useUserProfile() {
  const { user, refreshSession } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (data: {
    name?: string;
    email?: string;
    image?: string;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await refreshSession();
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setIsUpdating(false);
    }
  }, [refreshSession]);

  return {
    profile: user?.profile,
    user,
    updateProfile,
    isUpdating,
  };
}

/**
 * Hook for managing user entitlements
 * Provides quota and subscription data
 */
export function useUserEntitlement() {
  const { user, refreshSession } = useAuth();

  const entitlement = user?.entitlement;
  const quotaUsed = entitlement?.requestsUsed ?? 0;
  const quotaLimit = entitlement?.requestsLimit ?? 10;
  const quotaRemaining = Math.max(0, quotaLimit - quotaUsed);
  const quotaPercentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;
  const isQuotaExceeded = quotaUsed >= quotaLimit;
  const isQuotaWarning = quotaPercentage >= 80;

  const refreshQuota = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  return {
    entitlement,
    quotaUsed,
    quotaLimit,
    quotaRemaining,
    quotaPercentage,
    isQuotaExceeded,
    isQuotaWarning,
    refreshQuota,
    planType: entitlement?.planType ?? 'free',
    isActive: entitlement?.isActive ?? false,
    resetAt: entitlement?.quotaResetAt,
  };
}

/**
 * Hook for session persistence
 * Handles cross-tab synchronization
 */
export function useSessionSync() {
  const { refreshSession } = useAuth();

  useEffect(() => {
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nextauth.session-token' || e.key?.startsWith('nextauth.')) {
        refreshSession();
      }
    };

    // Listen for focus events (tab activation)
    const handleFocus = () => {
      refreshSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshSession]);
}

/**
 * Hook for authentication redirects
 * Handles post-login navigation
 */
export function useAuthRedirect() {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  const redirectAfterAuth = useCallback((defaultPath = '/dashboard') => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (!isOnboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // Get intended destination from URL params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl') || defaultPath;
    
    router.push(callbackUrl);
  }, [isAuthenticated, isOnboardingComplete, isLoading, router]);

  return { redirectAfterAuth };
}
