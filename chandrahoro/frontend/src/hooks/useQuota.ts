/**
 * ChandraHoro V2.1 - Quota Management Hook
 * 
 * React hook for managing AI quota state and operations in the frontend.
 * Provides real-time quota information, automatic refreshing, and error handling.
 * 
 * Features:
 * - Real-time quota checking
 * - Automatic refresh intervals
 * - Error handling and retry logic
 * - Loading states
 * - Manual refresh capability
 * - Quota warning detection
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QuotaCheckResult } from '@/lib/ai/quota';

export interface UseQuotaOptions {
  refreshInterval?: number; // Refresh interval in milliseconds (default: 60000)
  autoRefresh?: boolean;    // Enable automatic refresh (default: true)
  onQuotaExceeded?: () => void; // Callback when quota is exceeded
  onQuotaWarning?: (quota: QuotaCheckResult) => void; // Callback when approaching limits
}

export interface UseQuotaReturn {
  quota: QuotaCheckResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isExceeded: boolean;
  isWarning: boolean;
  percentageUsed: number;
  timeUntilReset: string;
  canMakeRequest: boolean;
}

/**
 * Hook for managing AI quota state
 */
export function useQuota(options: UseQuotaOptions = {}): UseQuotaReturn {
  const {
    refreshInterval = 60000, // 1 minute
    autoRefresh = true,
    onQuotaExceeded,
    onQuotaWarning,
  } = options;
  
  const [quota, setQuota] = useState<QuotaCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  /**
   * Fetch quota data from API
   */
  const fetchQuota = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quota/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch quota');
      }
      
      const newQuota = data.data as QuotaCheckResult;
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setQuota(newQuota);
        setError(null);
        
        // Trigger callbacks
        if (!newQuota.allowed && onQuotaExceeded) {
          onQuotaExceeded();
        }
        
        if (newQuota.warning && onQuotaWarning) {
          onQuotaWarning(newQuota);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message);
        console.error('[useQuota] Failed to fetch quota:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [onQuotaExceeded, onQuotaWarning]);
  
  /**
   * Setup automatic refresh
   */
  useEffect(() => {
    // Initial fetch
    fetchQuota();
    
    // Setup interval if auto-refresh is enabled
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchQuota, refreshInterval);
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchQuota, autoRefresh, refreshInterval]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  /**
   * Calculate derived values
   */
  const isExceeded = quota ? !quota.allowed : false;
  const isWarning = quota ? quota.warning : false;
  const percentageUsed = quota ? Math.max(quota.requestsPercentage, quota.tokensPercentage) : 0;
  const canMakeRequest = quota ? quota.allowed && quota.requestsRemaining > 0 && quota.tokensRemaining > 0 : false;
  
  /**
   * Calculate time until reset
   */
  const timeUntilReset = quota ? calculateTimeUntilReset(quota.resetAt) : '';
  
  return {
    quota,
    loading,
    error,
    refetch: fetchQuota,
    isExceeded,
    isWarning,
    percentageUsed,
    timeUntilReset,
    canMakeRequest,
  };
}

/**
 * Hook for checking specific feature quota
 */
export function useFeatureQuota(feature: 'daily_reading' | 'ai_chat' | 'compatibility' | 'pdf_reports') {
  const { quota, loading, error, refetch } = useQuota();
  
  const [featureAllowed, setFeatureAllowed] = useState<boolean | null>(null);
  const [checkingFeature, setCheckingFeature] = useState(false);
  
  /**
   * Check feature-specific quota
   */
  const checkFeatureQuota = useCallback(async () => {
    if (!quota) return;
    
    try {
      setCheckingFeature(true);
      
      const response = await fetch(`/api/quota/feature/${feature}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeatureAllowed(data.allowed);
      } else {
        setFeatureAllowed(false);
      }
    } catch (error) {
      console.error(`[useFeatureQuota] Failed to check ${feature} quota:`, error);
      setFeatureAllowed(false);
    } finally {
      setCheckingFeature(false);
    }
  }, [quota, feature]);
  
  useEffect(() => {
    if (quota) {
      checkFeatureQuota();
    }
  }, [quota, checkFeatureQuota]);
  
  return {
    quota,
    loading: loading || checkingFeature,
    error,
    refetch,
    featureAllowed,
    canUseFeature: featureAllowed && quota?.allowed,
  };
}

/**
 * Hook for quota statistics and analytics
 */
export function useQuotaStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quota/stats', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('[useQuotaStats] Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Utility function to calculate time until quota reset
 */
function calculateTimeUntilReset(resetAt: Date): string {
  const now = new Date();
  const reset = new Date(resetAt);
  const diff = reset.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Resetting now...';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Utility function to format quota percentage
 */
export function formatQuotaPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Utility function to get quota status color
 */
export function getQuotaStatusColor(percentage: number): string {
  if (percentage >= 90) return 'red';
  if (percentage >= 80) return 'orange';
  if (percentage >= 60) return 'yellow';
  return 'green';
}

/**
 * Utility function to get quota status message
 */
export function getQuotaStatusMessage(quota: QuotaCheckResult | null): string {
  if (!quota) return 'Loading quota...';
  
  if (!quota.allowed) {
    return 'Quota exceeded. Resets at midnight IST.';
  }
  
  if (quota.warning) {
    return 'Approaching quota limit. Consider upgrading your plan.';
  }
  
  return `${quota.requestsRemaining} requests remaining today.`;
}
