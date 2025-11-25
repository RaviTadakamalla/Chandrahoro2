import { useCallback, useEffect, useState } from 'react';
import { apiCache, chartCache, userCache, cacheInvalidation } from '@/lib/cache';
import type CacheManager from '@/lib/cache';

/**
 * Hook for managing cache operations
 */
export function useCache(cacheManager: CacheManager = apiCache) {
  const [stats, setStats] = useState(cacheManager.getStats());

  const updateStats = useCallback(() => {
    setStats(cacheManager.getStats());
  }, [cacheManager]);

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(updateStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [updateStats]);

  const get = useCallback(<T>(key: string): T | null => {
    const result = cacheManager.get<T>(key);
    updateStats();
    return result;
  }, [cacheManager, updateStats]);

  const set = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    cacheManager.set(key, data, ttl);
    updateStats();
  }, [cacheManager, updateStats]);

  const remove = useCallback((key: string): void => {
    cacheManager.delete(key);
    updateStats();
  }, [cacheManager, updateStats]);

  const clear = useCallback((): void => {
    cacheManager.clear();
    updateStats();
  }, [cacheManager, updateStats]);

  return {
    get,
    set,
    remove,
    clear,
    stats,
    updateStats
  };
}

/**
 * Hook for API cache management
 */
export function useApiCache() {
  return useCache(apiCache);
}

/**
 * Hook for chart cache management
 */
export function useChartCache() {
  return useCache(chartCache);
}

/**
 * Hook for user cache management
 */
export function useUserCache() {
  return useCache(userCache);
}

/**
 * Hook for cached API requests
 */
export function useCachedApi<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    cacheManager?: CacheManager;
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    cacheManager = apiCache
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = cacheManager.get<T>(key);
        if (cached !== null) {
          setData(cached);
          setIsLoading(false);
          return cached;
        }
      }

      // Make API call
      const result = await apiCall();
      
      // Cache the result
      cacheManager.set(key, result, ttl);
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, apiCall, ttl, enabled, cacheManager]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key, cacheManager]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate,
    refresh
  };
}

/**
 * Hook for cache invalidation
 */
export function useCacheInvalidation() {
  const invalidateUserCharts = useCallback((userId?: string) => {
    cacheInvalidation.invalidateUserCharts(userId);
  }, []);

  const invalidateApiEndpoint = useCallback((endpoint: string) => {
    cacheInvalidation.invalidateApiEndpoint(endpoint);
  }, []);

  const invalidateAll = useCallback(() => {
    cacheInvalidation.invalidateAll();
  }, []);

  return {
    invalidateUserCharts,
    invalidateApiEndpoint,
    invalidateAll
  };
}

/**
 * Hook for cache warming (preloading data)
 */
export function useCacheWarming() {
  const warmCache = useCallback(async <T>(
    key: string,
    apiCall: () => Promise<T>,
    cacheManager: CacheManager = apiCache,
    ttl?: number
  ) => {
    // Check if already cached
    const cached = cacheManager.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Fetch and cache data
      const data = await apiCall();
      cacheManager.set(key, data, ttl);
      return data;
    } catch (error) {
      console.warn('Cache warming failed for key:', key, error);
      return null;
    }
  }, []);

  const warmChartCache = useCallback(async (
    chartType: string,
    params: Record<string, any>,
    apiCall: () => Promise<any>
  ) => {
    const key = chartCache.generateChartKey(chartType, params);
    return warmCache(key, apiCall, chartCache, 30 * 60 * 1000);
  }, [warmCache]);

  const warmApiCache = useCallback(async (
    endpoint: string,
    params: Record<string, any>,
    apiCall: () => Promise<any>
  ) => {
    const key = apiCache.generateApiKey(endpoint, params);
    return warmCache(key, apiCall, apiCache);
  }, [warmCache]);

  return {
    warmCache,
    warmChartCache,
    warmApiCache
  };
}

/**
 * Hook for cache monitoring and debugging
 */
export function useCacheMonitor() {
  const [allStats, setAllStats] = useState({
    api: apiCache.getStats(),
    chart: chartCache.getStats(),
    user: userCache.getStats()
  });

  const updateAllStats = useCallback(() => {
    setAllStats({
      api: apiCache.getStats(),
      chart: chartCache.getStats(),
      user: userCache.getStats()
    });
  }, []);

  useEffect(() => {
    // Update stats every 10 seconds for monitoring
    const interval = setInterval(updateAllStats, 10000);
    return () => clearInterval(interval);
  }, [updateAllStats]);

  const getTotalCacheSize = useCallback(() => {
    return allStats.api.size + allStats.chart.size + allStats.user.size;
  }, [allStats]);

  const getCacheEfficiency = useCallback(() => {
    const total = getTotalCacheSize();
    const maxTotal = allStats.api.maxSize + allStats.chart.maxSize + allStats.user.maxSize;
    return total > 0 ? (total / maxTotal) * 100 : 0;
  }, [allStats, getTotalCacheSize]);

  return {
    stats: allStats,
    totalSize: getTotalCacheSize(),
    efficiency: getCacheEfficiency(),
    updateStats: updateAllStats
  };
}
