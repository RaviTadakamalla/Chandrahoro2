/**
 * Hook for caching AI-generated reports
 * 
 * This hook provides persistence for AI module reports across page refreshes
 * and navigation. Reports are cached in both sessionStorage and localStorage.
 */

import { useState, useEffect, useCallback } from 'react';

interface CachedReport<T = any> {
  data: T;
  timestamp: string;
  format?: string;
}

interface UseAiReportCacheOptions {
  moduleId: string;
  chartData: any;
  user: any;
  enabled?: boolean;
}

/**
 * Generate a unique cache key based on module, chart data, and methodology
 */
const generateCacheKey = (moduleId: string, chartData: any): string => {
  if (!chartData?.birth_info) return '';
  
  const { name, date, time, location_name } = chartData.birth_info;
  const methodology = chartData.methodology || chartData.selected_methodology || 'parashara';
  
  // Create a stable key from birth details and methodology
  return `ai_${moduleId}_${name}_${date}_${time}_${location_name}_${methodology}`;
};

/**
 * Hook for managing AI report cache
 */
export function useAiReportCache<T = any>(options: UseAiReportCacheOptions) {
  const { moduleId, chartData, user, enabled = true } = options;
  
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [isCached, setIsCached] = useState(false);
  
  // Load cached report on mount
  useEffect(() => {
    if (!enabled || !chartData || !user) return;
    
    const cacheKey = generateCacheKey(moduleId, chartData);
    if (!cacheKey) return;
    
    console.log(`[${moduleId}] Checking for cached report...`);
    console.log(`[${moduleId}] Cache key:`, cacheKey);
    
    // Try sessionStorage first
    let cachedReport = sessionStorage.getItem(cacheKey);
    let cacheSource = 'sessionStorage';
    
    // Fallback to localStorage
    if (!cachedReport) {
      cachedReport = localStorage.getItem(cacheKey);
      cacheSource = 'localStorage';
    }
    
    if (cachedReport) {
      try {
        const cached: CachedReport<T> = JSON.parse(cachedReport);
        console.log(`[${moduleId}] ✅ Found cached report in ${cacheSource}`);
        console.log(`[${moduleId}] Cached timestamp:`, cached.timestamp);
        
        setCachedData(cached.data);
        setIsCached(true);
      } catch (err) {
        console.error(`[${moduleId}] Failed to parse cached report:`, err);
        // If cache is corrupted, clear it
        sessionStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheKey);
      }
    } else {
      console.log(`[${moduleId}] ℹ️ No cached report found`);
      setIsCached(false);
    }
  }, [moduleId, chartData, user, enabled]);
  
  /**
   * Save report to cache
   */
  const saveToCache = useCallback((data: T, format?: string) => {
    if (!chartData) return;
    
    const cacheKey = generateCacheKey(moduleId, chartData);
    if (!cacheKey) return;
    
    const cacheData: CachedReport<T> = {
      data,
      timestamp: new Date().toISOString(),
      format,
    };
    
    try {
      const serialized = JSON.stringify(cacheData);
      sessionStorage.setItem(cacheKey, serialized);
      localStorage.setItem(cacheKey, serialized);
      
      setCachedData(data);
      setIsCached(true);
      
      console.log(`[${moduleId}] ✅ Report cached successfully`);
    } catch (err) {
      console.error(`[${moduleId}] Failed to cache report:`, err);
    }
  }, [moduleId, chartData]);
  
  /**
   * Clear cached report
   */
  const clearCache = useCallback(() => {
    if (!chartData) return;
    
    const cacheKey = generateCacheKey(moduleId, chartData);
    if (!cacheKey) return;
    
    sessionStorage.removeItem(cacheKey);
    localStorage.removeItem(cacheKey);
    
    setCachedData(null);
    setIsCached(false);
    
    console.log(`[${moduleId}] 🗑️ Cache cleared`);
  }, [moduleId, chartData]);
  
  /**
   * Invalidate cache (alias for clearCache)
   */
  const invalidateCache = clearCache;
  
  return {
    cachedData,
    isCached,
    saveToCache,
    clearCache,
    invalidateCache,
  };
}

