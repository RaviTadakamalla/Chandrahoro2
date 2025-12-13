/**
 * ChandraHoro V2.1 - Cache Invalidation Service
 * 
 * Centralized cache invalidation strategies and cleanup operations.
 * Handles pattern-based invalidation, TTL management, and cache warming.
 * 
 * Features:
 * - Pattern-based cache invalidation
 * - Selective cache cleanup
 * - Cache warming strategies
 * - Performance monitoring
 * - Automated cleanup jobs
 */

import { redis } from '@/lib/redis/client';
import { readingCache } from './reading-cache';
import { subDays, format, isAfter } from 'date-fns';

export interface CacheInvalidationOptions {
  pattern?: string;
  userId?: string;
  date?: string;
  type?: 'reading' | 'list' | 'latest' | 'all';
  dryRun?: boolean;
}

export interface CleanupResult {
  keysFound: number;
  keysDeleted: number;
  errors: string[];
  duration: number;
}

export interface CacheWarmingOptions {
  userId: string;
  days?: number;
  type?: 'daily' | 'weekly' | 'monthly';
}

export class CacheInvalidationService {
  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(
    pattern: string,
    options: { dryRun?: boolean } = {}
  ): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      keysFound: 0,
      keysDeleted: 0,
      errors: [],
      duration: 0,
    };
    
    try {
      const keys = await redis.keys(pattern);
      result.keysFound = keys.length;
      
      if (keys.length === 0) {
        result.duration = Date.now() - startTime;
        return result;
      }
      
      if (!options.dryRun) {
        // Delete in batches to avoid overwhelming Redis
        const batchSize = 100;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          try {
            await redis.del(...batch);
            result.keysDeleted += batch.length;
          } catch (error: any) {
            result.errors.push(`Batch ${i}-${i + batch.length}: ${error.message}`);
          }
        }
      } else {
        result.keysDeleted = keys.length; // Would delete in dry run
      }
    } catch (error: any) {
      result.errors.push(`Pattern scan error: ${error.message}`);
    }
    
    result.duration = Date.now() - startTime;
    return result;
  }
  
  /**
   * Invalidate user-specific caches
   */
  async invalidateUserCache(
    userId: string,
    options: CacheInvalidationOptions = {}
  ): Promise<CleanupResult> {
    const { type = 'all', dryRun = false } = options;
    
    const patterns: string[] = [];
    
    switch (type) {
      case 'reading':
        patterns.push(`reading:daily:${userId}:*`);
        break;
      case 'list':
        patterns.push(`reading:list:${userId}`);
        break;
      case 'latest':
        patterns.push(`reading:latest:${userId}`);
        break;
      case 'all':
      default:
        patterns.push(
          `reading:daily:${userId}:*`,
          `reading:list:${userId}`,
          `reading:latest:${userId}`
        );
        break;
    }
    
    const totalResult: CleanupResult = {
      keysFound: 0,
      keysDeleted: 0,
      errors: [],
      duration: 0,
    };
    
    for (const pattern of patterns) {
      const result = await this.invalidateByPattern(pattern, { dryRun });
      totalResult.keysFound += result.keysFound;
      totalResult.keysDeleted += result.keysDeleted;
      totalResult.errors.push(...result.errors);
      totalResult.duration += result.duration;
    }
    
    return totalResult;
  }
  
  /**
   * Clean up old cache entries
   */
  async cleanupOldEntries(
    maxAge: number = 30, // days
    options: { dryRun?: boolean } = {}
  ): Promise<CleanupResult> {
    const startTime = Date.now();
    const cutoffDate = subDays(new Date(), maxAge);
    const pattern = 'reading:daily:*';
    
    const result: CleanupResult = {
      keysFound: 0,
      keysDeleted: 0,
      errors: [],
      duration: 0,
    };
    
    try {
      const keys = await redis.keys(pattern);
      result.keysFound = keys.length;
      
      const keysToDelete: string[] = [];
      
      for (const key of keys) {
        try {
          // Extract date from key: reading:daily:userId:YYYY-MM-DD
          const parts = key.split(':');
          const dateStr = parts[3];
          
          if (!dateStr) continue;
          
          const date = new Date(dateStr);
          
          // Skip invalid dates
          if (isNaN(date.getTime())) continue;
          
          // Mark for deletion if older than cutoff
          if (date < cutoffDate) {
            keysToDelete.push(key);
          }
        } catch (error: any) {
          result.errors.push(`Error processing key ${key}: ${error.message}`);
        }
      }
      
      if (!options.dryRun && keysToDelete.length > 0) {
        // Delete in batches
        const batchSize = 100;
        for (let i = 0; i < keysToDelete.length; i += batchSize) {
          const batch = keysToDelete.slice(i, i + batchSize);
          try {
            await redis.del(...batch);
            result.keysDeleted += batch.length;
          } catch (error: any) {
            result.errors.push(`Delete batch error: ${error.message}`);
          }
        }
      } else {
        result.keysDeleted = keysToDelete.length;
      }
    } catch (error: any) {
      result.errors.push(`Cleanup error: ${error.message}`);
    }
    
    result.duration = Date.now() - startTime;
    return result;
  }
  
  /**
   * Warm cache for user's recent readings
   */
  async warmUserCache(
    userId: string,
    options: CacheWarmingOptions
  ): Promise<{ warmed: number; errors: string[] }> {
    const { days = 7, type = 'daily' } = options;
    const result = { warmed: 0, errors: [] };
    
    try {
      // Import here to avoid circular dependency
      const { readingRepo } = await import('@/lib/repositories/reading-repository');
      
      const startDate = subDays(new Date(), days);
      const endDate = new Date();
      
      const { readings } = await readingRepo.getReadings(userId, {
        type,
        startDate,
        endDate,
        limit: days,
      });
      
      for (const reading of readings) {
        try {
          const dateStr = format(new Date(reading.readingDate), 'yyyy-MM-dd');
          await readingCache.set(userId, dateStr, reading);
          result.warmed++;
        } catch (error: any) {
          result.errors.push(`Error warming cache for ${reading.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Cache warming error: ${error.message}`);
    }
    
    return result;
  }
  
  /**
   * Get cache health metrics
   */
  async getCacheHealth(): Promise<{
    totalKeys: number;
    readingKeys: number;
    listKeys: number;
    latestKeys: number;
    expiredKeys: number;
    memoryUsage: string;
  }> {
    try {
      const [
        totalKeys,
        readingKeys,
        listKeys,
        latestKeys,
        info,
      ] = await Promise.all([
        redis.dbsize(),
        redis.keys('reading:daily:*').then(keys => keys.length),
        redis.keys('reading:list:*').then(keys => keys.length),
        redis.keys('reading:latest:*').then(keys => keys.length),
        redis.info('memory'),
      ]);
      
      // Count expired keys (TTL = -2)
      const allKeys = await redis.keys('reading:*');
      let expiredKeys = 0;
      
      for (const key of allKeys.slice(0, 100)) { // Sample first 100 keys
        const ttl = await redis.ttl(key);
        if (ttl === -2) expiredKeys++;
      }
      
      // Extract memory usage from info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';
      
      return {
        totalKeys,
        readingKeys,
        listKeys,
        latestKeys,
        expiredKeys,
        memoryUsage,
      };
    } catch (error: any) {
      console.error('[CacheInvalidation] Error getting cache health:', error);
      return {
        totalKeys: 0,
        readingKeys: 0,
        listKeys: 0,
        latestKeys: 0,
        expiredKeys: 0,
        memoryUsage: 'error',
      };
    }
  }
  
  /**
   * Emergency cache flush (use with caution)
   */
  async emergencyFlush(
    pattern: string = 'reading:*',
    confirm: boolean = false
  ): Promise<CleanupResult> {
    if (!confirm) {
      throw new Error('Emergency flush requires explicit confirmation');
    }
    
    console.warn(`[CacheInvalidation] EMERGENCY FLUSH: ${pattern}`);
    
    return this.invalidateByPattern(pattern, { dryRun: false });
  }
  
  /**
   * Selective cache refresh
   */
  async refreshCache(
    userId: string,
    date: string,
    force: boolean = false
  ): Promise<{ refreshed: boolean; error?: string }> {
    try {
      // Check if cache exists and is not expired
      const exists = await readingCache.exists(userId, date);
      const ttl = await readingCache.getTTL(userId, date);
      
      if (!force && exists && ttl > 3600) { // Don't refresh if more than 1 hour left
        return { refreshed: false, error: 'Cache still fresh' };
      }
      
      // Import here to avoid circular dependency
      const { readingRepo } = await import('@/lib/repositories/reading-repository');
      
      const reading = await readingRepo.getReading(userId, new Date(date), 'daily');
      
      if (reading) {
        await readingCache.set(userId, date, reading);
        return { refreshed: true };
      } else {
        return { refreshed: false, error: 'Reading not found in database' };
      }
    } catch (error: any) {
      return { refreshed: false, error: error.message };
    }
  }
}

// Singleton instance
export const cacheInvalidation = new CacheInvalidationService();

// Convenience functions
export const invalidateUserCache = (userId: string, type?: 'reading' | 'list' | 'latest' | 'all') =>
  cacheInvalidation.invalidateUserCache(userId, { type });

export const cleanupOldCache = (maxAge?: number, dryRun?: boolean) =>
  cacheInvalidation.cleanupOldEntries(maxAge, { dryRun });

export const warmUserCache = (userId: string, days?: number) =>
  cacheInvalidation.warmUserCache(userId, { userId, days });

export const getCacheHealth = () =>
  cacheInvalidation.getCacheHealth();
