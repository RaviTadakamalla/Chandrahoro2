import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { apiClient, UserInfo } from '@/lib/api';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = apiClient.getUserInfo();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: { email: string; password: string }) => {
    // Don't set isLoading here to prevent re-renders during login
    try {
      await apiClient.login(data);
      const userInfo = apiClient.getUserInfo();
      setUser(userInfo);
    } catch (error) {
      // Re-throw error so the login page can handle it
      throw error;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; full_name?: string }) => {
    // Don't set isLoading here to prevent re-renders during registration
    try {
      // Register the user - this returns tokens and automatically logs them in
      await apiClient.register(data);
      const userInfo = apiClient.getUserInfo();
      setUser(userInfo);
    } catch (error) {
      // Re-throw error so the registration page can handle it
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const isAuthenticated = !!user;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

