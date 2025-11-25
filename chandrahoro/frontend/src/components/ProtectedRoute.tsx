import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient, UserInfo } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * ProtectedRoute component that wraps pages requiring authentication.
 * Redirects to login if user is not authenticated.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has token
        if (!apiClient.isAuthenticated()) {
          router.push('/login');
          return;
        }

        // Get current user info
        const userInfo = apiClient.getUserInfo();
        if (!userInfo) {
          // Try to fetch from API
          try {
            const fetchedUser = await apiClient.getCurrentUser();
            setUser(fetchedUser);
            
            // Check role if required
            if (requiredRole && fetchedUser.role !== requiredRole) {
              router.push('/');
              return;
            }
            
            setIsAuthorized(true);
          } catch (error) {
            // Failed to fetch user, redirect to login
            router.push('/login');
            return;
          }
        } else {
          setUser(userInfo);
          
          // Check role if required
          if (requiredRole && userInfo.role !== requiredRole) {
            router.push('/');
            return;
          }
          
          setIsAuthorized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

