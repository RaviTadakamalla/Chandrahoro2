/**
 * ChandraHoro V2.1 - Reading Cache Service
 * 
 * Redis-based caching for readings with multi-layer strategy:
 * - Individual readings (24h TTL)
 * - Reading lists (5min TTL)
 * - Latest readings (1h TTL)
 * 
 * Features:
 * - Cache-aside pattern
 * - Automatic TTL management
 * - Cache statistics tracking
 * - Bulk operations for user data
 * - Pattern-based cache invalidation
 */

import { redis } from '@/lib/redis/client';

const CACHE_TTL = {
  READING: 86400,      // 24 hours
  READING_LIST: 300,   // 5 minutes
  LATEST: 3600,        // 1 hour
  STATS: 3600,         // 1 hour for stats
};

const CACHE_KEYS = {
  READING: (userId: string, date: string) => `reading:daily:${userId}:${date}`,
  READING_LIST: (userId: string) => `reading:list:${userId}`,
  LATEST: (userId: string) => `reading:latest:${userId}`,
  STATS_HITS: 'cache_hits',
  STATS_MISSES: 'cache_misses',
  PATTERN_USER: (userId: string) => `reading:*:${userId}:*`,
};

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
  totalRequests: number;
}

export interface ReadingCacheOptions {
  ttl?: number;
  skipStats?: boolean;
}

export class ReadingCache {
  /**
   * Get reading from cache
   */
  async get(userId: string, date: string, options: ReadingCacheOptions = {}): Promise<any | null> {
    try {
      const key = CACHE_KEYS.READING(userId, date);
      const cached = await redis.get(key);
      
      if (!cached) {
        if (!options.skipStats) {
          await this.incrementMetric(CACHE_KEYS.STATS_MISSES);
        }
        return null;
      }
      
      if (!options.skipStats) {
        await this.incrementMetric(CACHE_KEYS.STATS_HITS);
      }
      
      return JSON.parse(cached as string);
    } catch (error) {
      console.error('[ReadingCache] Error getting reading:', error);
      return null;
    }
  }
  
  /**
   * Set reading in cache
   */
  async set(
    userId: string, 
    date: string, 
    reading: any, 
    options: ReadingCacheOptions = {}
  ): Promise<void> {
    try {
      const key = CACHE_KEYS.READING(userId, date);
      const ttl = options.ttl || CACHE_TTL.READING;
      
      await redis.setex(
        key,
        ttl,
        JSON.stringify(reading)
      );
      
      // Also update latest reading cache if this is today's reading
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        await this.setLatest(userId, reading);
      }
    } catch (error) {
      console.error('[ReadingCache] Error setting reading:', error);
    }
  }
  
  /**
   * Delete specific reading
   */
  async delete(userId: string, date: string): Promise<void> {
    try {
      const key = CACHE_KEYS.READING(userId, date);
      await redis.del(key);
      
      // Also clear related caches
      await this.invalidateUserCaches(userId);
    } catch (error) {
      console.error('[ReadingCache] Error deleting reading:', error);
    }
  }
  
  /**
   * Delete all readings for user
   */
  async deleteAllForUser(userId: string): Promise<number> {
    try {
      const pattern = CACHE_KEYS.PATTERN_USER(userId);
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      // Also delete list and latest caches
      await redis.del(
        CACHE_KEYS.READING_LIST(userId),
        CACHE_KEYS.LATEST(userId)
      );
      
      return keys.length;
    } catch (error) {
      console.error('[ReadingCache] Error deleting all for user:', error);
      return 0;
    }
  }
  
  /**
   * Cache reading list
   */
  async setList(userId: string, readings: any[]): Promise<void> {
    try {
      const key = CACHE_KEYS.READING_LIST(userId);
      await redis.setex(
        key,
        CACHE_TTL.READING_LIST,
        JSON.stringify(readings)
      );
    } catch (error) {
      console.error('[ReadingCache] Error setting reading list:', error);
    }
  }
  
  /**
   * Get cached reading list
   */
  async getList(userId: string): Promise<any[] | null> {
    try {
      const key = CACHE_KEYS.READING_LIST(userId);
      const cached = await redis.get(key);
      
      if (!cached) return null;
      
      return JSON.parse(cached as string);
    } catch (error) {
      console.error('[ReadingCache] Error getting reading list:', error);
      return null;
    }
  }
  
  /**
   * Cache latest reading
   */
  async setLatest(userId: string, reading: any): Promise<void> {
    try {
      const key = CACHE_KEYS.LATEST(userId);
      await redis.setex(
        key,
        CACHE_TTL.LATEST,
        JSON.stringify(reading)
      );
    } catch (error) {
      console.error('[ReadingCache] Error setting latest reading:', error);
    }
  }
  
  /**
   * Get cached latest reading
   */
  async getLatest(userId: string): Promise<any | null> {
    try {
      const key = CACHE_KEYS.LATEST(userId);
      const cached = await redis.get(key);
      
      if (!cached) return null;
      
      return JSON.parse(cached as string);
    } catch (error) {
      console.error('[ReadingCache] Error getting latest reading:', error);
      return null;
    }
  }
  
  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const hits = parseInt((await redis.get(CACHE_KEYS.STATS_HITS)) || '0');
      const misses = parseInt((await redis.get(CACHE_KEYS.STATS_MISSES)) || '0');
      const totalRequests = hits + misses;
      const hitRate = totalRequests > 0 ? ((hits / totalRequests) * 100).toFixed(2) + '%' : '0%';
      
      return { hits, misses, hitRate, totalRequests };
    } catch (error) {
      console.error('[ReadingCache] Error getting stats:', error);
      return { hits: 0, misses: 0, hitRate: '0%', totalRequests: 0 };
    }
  }
  
  /**
   * Reset cache statistics
   */
  async resetStats(): Promise<void> {
    try {
      await redis.del(CACHE_KEYS.STATS_HITS, CACHE_KEYS.STATS_MISSES);
    } catch (error) {
      console.error('[ReadingCache] Error resetting stats:', error);
    }
  }
  
  /**
   * Check if reading exists in cache
   */
  async exists(userId: string, date: string): Promise<boolean> {
    try {
      const key = CACHE_KEYS.READING(userId, date);
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('[ReadingCache] Error checking existence:', error);
      return false;
    }
  }
  
  /**
   * Get TTL for a reading
   */
  async getTTL(userId: string, date: string): Promise<number> {
    try {
      const key = CACHE_KEYS.READING(userId, date);
      return await redis.ttl(key);
    } catch (error) {
      console.error('[ReadingCache] Error getting TTL:', error);
      return -1;
    }
  }
  
  /**
   * Invalidate user-related caches
   */
  async invalidateUserCaches(userId: string): Promise<void> {
    try {
      await redis.del(
        CACHE_KEYS.READING_LIST(userId),
        CACHE_KEYS.LATEST(userId)
      );
    } catch (error) {
      console.error('[ReadingCache] Error invalidating user caches:', error);
    }
  }
  
  /**
   * Increment cache metric
   */
  private async incrementMetric(metric: string): Promise<void> {
    try {
      await redis.incr(metric);
    } catch (error) {
      console.error('[ReadingCache] Error incrementing metric:', error);
    }
  }
  
  /**
   * Get cache info for debugging
   */
  async getDebugInfo(userId: string): Promise<{
    userReadings: string[];
    listCached: boolean;
    latestCached: boolean;
    stats: CacheStats;
  }> {
    try {
      const pattern = CACHE_KEYS.PATTERN_USER(userId);
      const userReadings = await redis.keys(pattern);
      const listCached = await redis.exists(CACHE_KEYS.READING_LIST(userId)) === 1;
      const latestCached = await redis.exists(CACHE_KEYS.LATEST(userId)) === 1;
      const stats = await this.getStats();
      
      return {
        userReadings,
        listCached,
        latestCached,
        stats,
      };
    } catch (error) {
      console.error('[ReadingCache] Error getting debug info:', error);
      return {
        userReadings: [],
        listCached: false,
        latestCached: false,
        stats: { hits: 0, misses: 0, hitRate: '0%', totalRequests: 0 },
      };
    }
  }
}

// Singleton instance
export const readingCache = new ReadingCache();

// Convenience functions for common operations
export const getCachedReading = (userId: string, date: string) =>
  readingCache.get(userId, date);

export const setCachedReading = (userId: string, date: string, reading: any, ttl?: number) =>
  readingCache.set(userId, date, reading, { ttl });

export const deleteCachedReading = (userId: string, date: string) =>
  readingCache.delete(userId, date);

export const getCachedReadingList = (userId: string) =>
  readingCache.getList(userId);

export const setCachedReadingList = (userId: string, readings: any[]) =>
  readingCache.setList(userId, readings);

export const getCachedLatestReading = (userId: string) =>
  readingCache.getLatest(userId);

export const setCachedLatestReading = (userId: string, reading: any) =>
  readingCache.setLatest(userId, reading);

export const getCacheStats = () =>
  readingCache.getStats();
