/**
 * Comprehensive caching system for API responses and data
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      storageType: 'memory',
      ...config
    };
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Enforce cache size limit
   */
  private enforceLimit(): void {
    if (this.cache.size > this.config.maxSize) {
      // Remove oldest items first
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    this.cache.set(key, item);
    this.enforceLimit();

    // Also store in persistent storage if configured
    if (this.config.storageType !== 'memory') {
      try {
        const storage = this.config.storageType === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        storage.setItem(`cache:${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to store in persistent storage:', error);
      }
    }
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    let item = this.cache.get(key);

    // If not in memory, check persistent storage
    if (!item && this.config.storageType !== 'memory') {
      try {
        const storage = this.config.storageType === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        const stored = storage.getItem(`cache:${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // Restore to memory cache
          if (item) {
            this.cache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from persistent storage:', error);
      }
    }

    if (!item) return null;

    if (this.isExpired(item)) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    
    if (this.config.storageType !== 'memory') {
      try {
        const storage = this.config.storageType === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        storage.removeItem(`cache:${key}`);
      } catch (error) {
        console.warn('Failed to remove from persistent storage:', error);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    
    if (this.config.storageType !== 'memory') {
      try {
        const storage = this.config.storageType === 'localStorage' 
          ? localStorage 
          : sessionStorage;
        
        // Remove all cache items
        const keys = Object.keys(storage).filter(key => key.startsWith('cache:'));
        keys.forEach(key => storage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear persistent storage:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    expiredItems: number;
  } {
    this.cleanup();
    
    const expiredItems = Array.from(this.cache.values())
      .filter(item => this.isExpired(item)).length;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses
      expiredItems
    };
  }

  /**
   * Generate cache key for API requests
   */
  generateApiKey(endpoint: string, params: Record<string, any> = {}): string {
    return this.generateKey(`api:${endpoint}`, params);
  }

  /**
   * Generate cache key for chart data
   */
  generateChartKey(chartType: string, params: Record<string, any>): string {
    return this.generateKey(`chart:${chartType}`, params);
  }
}

// Create cache instances for different use cases
export const apiCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for API responses
  maxSize: 50,
  storageType: 'sessionStorage'
});

export const chartCache = new CacheManager({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for chart data
  maxSize: 20,
  storageType: 'localStorage'
});

export const userCache = new CacheManager({
  defaultTTL: 60 * 60 * 1000, // 1 hour for user data
  maxSize: 10,
  storageType: 'localStorage'
});

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  cacheManager: CacheManager,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : cacheManager.generateApiKey(fn.name, { args });

    // Try to get from cache first
    const cached = cacheManager.get(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    // Execute function and cache result
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.then(data => {
        cacheManager.set(key, data, ttl);
        return data;
      });
    } else {
      cacheManager.set(key, result, ttl);
      return result;
    }
  }) as T;
}

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  /**
   * Invalidate all chart caches for a user
   */
  invalidateUserCharts(userId?: string): void {
    // Clear chart cache
    chartCache.clear();
    
    // Could be more selective if we had user-specific keys
    if (userId) {
      // Implementation would depend on key structure
    }
  },

  /**
   * Invalidate API cache for specific endpoints
   */
  invalidateApiEndpoint(endpoint: string): void {
    // Would need to implement pattern matching for keys
    // For now, clear all API cache
    apiCache.clear();
  },

  /**
   * Invalidate all caches
   */
  invalidateAll(): void {
    apiCache.clear();
    chartCache.clear();
    userCache.clear();
  }
};

export default CacheManager;
