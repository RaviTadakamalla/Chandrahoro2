/**
 * Protected Route Components
 * 
 * Higher-order components and wrappers for protecting routes
 * that require authentication and/or onboarding completion.
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/states/LoadingSpinner';
import { useAuth, useRequireAuth, useRequireOnboarding } from '@/hooks/useAuth';

/**
 * Props for protected route components
 */
interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireOnboarding?: boolean;
  fallback?: ReactNode;
}

/**
 * Basic Protected Route Component
 * Requires authentication, redirects to login if not authenticated
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/signin',
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useRequireAuth(redirectTo);

  if (isLoading) {
    return fallback || <ProtectedRouteLoader />;
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled by useRequireAuth
  }

  return <>{children}</>;
}

/**
 * Protected Route with Onboarding Check
 * Requires authentication AND completed onboarding
 */
export function ProtectedRouteWithOnboarding({ 
  children, 
  fallback 
}: Omit<ProtectedRouteProps, 'redirectTo' | 'requireOnboarding'>) {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useRequireOnboarding();

  if (isLoading) {
    return fallback || <ProtectedRouteLoader />;
  }

  if (!isAuthenticated || !isOnboardingComplete) {
    return null; // Redirects are handled by useRequireOnboarding
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component for protecting pages
 * Usage: export default withAuth(YourComponent)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string;
    requireOnboarding?: boolean;
    fallback?: ReactNode;
  } = {}
) {
  const { redirectTo = '/auth/signin', requireOnboarding = false, fallback } = options;

  return function AuthenticatedComponent(props: P) {
    if (requireOnboarding) {
      return (
        <ProtectedRouteWithOnboarding fallback={fallback}>
          <Component {...props} />
        </ProtectedRouteWithOnboarding>
      );
    }

    return (
      <ProtectedRoute redirectTo={redirectTo} fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Auth Guard Hook
 * For use in components that need to check auth status
 */
export function useAuthGuard(options: {
  redirectTo?: string;
  requireOnboarding?: boolean;
} = {}) {
  const { redirectTo = '/auth/signin', requireOnboarding = false } = options;
  const router = useRouter();
  const { isAuthenticated, isOnboardingComplete, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requireOnboarding && !isOnboardingComplete) {
      router.push('/onboarding');
      return;
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading, router, redirectTo, requireOnboarding]);

  return {
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    user,
    isAuthorized: isAuthenticated && (!requireOnboarding || isOnboardingComplete),
  };
}

/**
 * Role-based Access Control Component
 * For future use when implementing user roles
 */
export function RoleProtectedRoute({ 
  children, 
  allowedRoles = [],
  fallback 
}: {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return fallback || <ProtectedRouteLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // For now, all authenticated users have access
  // In the future, check user.role against allowedRoles
  const hasAccess = true; // user?.role && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Guest Route Component
 * Redirects authenticated users away from auth pages
 */
export function GuestRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (isOnboardingComplete) {
        router.push(redirectTo);
      } else {
        router.push('/onboarding');
      }
    }
  }, [isAuthenticated, isOnboardingComplete, isLoading, router, redirectTo]);

  if (isLoading) {
    return <ProtectedRouteLoader />;
  }

  if (isAuthenticated) {
    return null; // Redirect is handled above
  }

  return <>{children}</>;
}

/**
 * Loading component for protected routes
 */
function ProtectedRouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Auth Status Component
 * Shows current authentication status (for debugging)
 */
export function AuthStatus() {
  const { user, isAuthenticated, isOnboardingComplete, isLoading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 text-xs space-y-1 shadow-lg z-50">
      <div className="font-semibold">Auth Status (Dev)</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Onboarding: {isOnboardingComplete ? 'Complete' : 'Incomplete'}</div>
      <div>User: {user?.email || 'None'}</div>
    </div>
  );
}

/**
 * Conditional Render based on Auth Status
 */
export function AuthConditional({
  authenticated,
  unauthenticated,
  loading,
}: {
  authenticated?: ReactNode;
  unauthenticated?: ReactNode;
  loading?: ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{loading || <LoadingSpinner />}</>;
  }

  if (isAuthenticated) {
    return <>{authenticated}</>;
  }

  return <>{unauthenticated}</>;
}

/**
 * Layout wrapper that handles auth redirects
 * For use in layout components
 */
export function AuthLayout({
  children,
  requireAuth = true,
  requireOnboarding = false,
}: {
  children: ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}) {
  if (!requireAuth) {
    return <>{children}</>;
  }

  if (requireOnboarding) {
    return (
      <ProtectedRouteWithOnboarding>
        {children}
      </ProtectedRouteWithOnboarding>
    );
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
