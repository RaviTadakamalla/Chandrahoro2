/**
 * ChandraHoro V2.1 - Redis Cache Utilities
 * 
 * High-level caching functions for storing and retrieving data from Redis.
 * Provides type-safe operations with automatic serialization and TTL management.
 * 
 * Features:
 * - Type-safe get/set operations
 * - Automatic JSON serialization/deserialization
 * - TTL management with defaults
 * - Pattern-based deletion
 * - Cache invalidation helpers
 * - Reading-specific cache functions
 * 
 * @example
 * ```typescript
 * import { cacheGet, cacheSet, getCachedReading } from '@/lib/redis/cache';
 * 
 * // Generic cache operations
 * await cacheSet('user:123', userData, 3600);
 * const user = await cacheGet<UserData>('user:123');
 * 
 * // Reading-specific operations
 * const reading = await getCachedReading(userId, '2024-10-26');
 * await setCachedReading(userId, '2024-10-26', readingData);
 * ```
 */

import { redis, REDIS_KEYS, DEFAULT_TTL, prefixKey, logRedisOperation } from './client';

/**
 * Generic cache get operation with type safety
 * 
 * @param key - Redis key
 * @returns Cached data or null if not found
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const prefixedKey = prefixKey(key);
    logRedisOperation('GET', prefixedKey);
    
    const data = await redis.get(prefixedKey);
    
    if (data === null || data === undefined) {
      return null;
    }
    
    // Handle string data (already parsed by Upstash)
    return data as T;
  } catch (error) {
    console.error('❌ Cache get error:', error);
    return null;
  }
}

/**
 * Generic cache set operation with TTL
 * 
 * @param key - Redis key
 * @param value - Data to cache
 * @param ttlSeconds - Time to live in seconds (default: 24 hours)
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL.READING_DAILY
): Promise<void> {
  try {
    const prefixedKey = prefixKey(key);
    logRedisOperation('SET', prefixedKey, { ttl: ttlSeconds });
    
    await redis.setex(prefixedKey, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('❌ Cache set error:', error);
    throw error;
  }
}

/**
 * Delete a single cache key
 * 
 * @param key - Redis key to delete
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const prefixedKey = prefixKey(key);
    logRedisOperation('DELETE', prefixedKey);
    
    await redis.del(prefixedKey);
  } catch (error) {
    console.error('❌ Cache delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple keys matching a pattern
 * 
 * @param pattern - Redis key pattern (supports wildcards)
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    const prefixedPattern = prefixKey(pattern);
    logRedisOperation('DELETE_PATTERN', prefixedPattern);
    
    const keys = await redis.keys(prefixedPattern);
    if (keys.length === 0) {
      return 0;
    }
    
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('❌ Cache delete pattern error:', error);
    throw error;
  }
}

/**
 * Check if a key exists in cache
 * 
 * @param key - Redis key
 * @returns True if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const prefixedKey = prefixKey(key);
    const exists = await redis.exists(prefixedKey);
    return exists === 1;
  } catch (error) {
    console.error('❌ Cache exists error:', error);
    return false;
  }
}

/**
 * Get TTL (time to live) for a key
 * 
 * @param key - Redis key
 * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
export async function cacheTTL(key: string): Promise<number> {
  try {
    const prefixedKey = prefixKey(key);
    return await redis.ttl(prefixedKey);
  } catch (error) {
    console.error('❌ Cache TTL error:', error);
    return -2;
  }
}

/**
 * Extend TTL for an existing key
 * 
 * @param key - Redis key
 * @param ttlSeconds - New TTL in seconds
 */
export async function cacheExtendTTL(key: string, ttlSeconds: number): Promise<void> {
  try {
    const prefixedKey = prefixKey(key);
    logRedisOperation('EXPIRE', prefixedKey, { ttl: ttlSeconds });
    
    await redis.expire(prefixedKey, ttlSeconds);
  } catch (error) {
    console.error('❌ Cache extend TTL error:', error);
    throw error;
  }
}

// =============================================================================
// READING CACHE FUNCTIONS
// =============================================================================

/**
 * Generate cache key for daily reading
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Redis key for the reading
 */
export function getReadingCacheKey(userId: string, date: string): string {
  return REDIS_KEYS.READING_DAILY(userId, date);
}

/**
 * Get cached daily reading for a user and date
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Cached reading data or null
 */
export async function getCachedReading(userId: string, date: string): Promise<any | null> {
  const key = getReadingCacheKey(userId, date);
  return cacheGet(key);
}

/**
 * Cache a daily reading for a user and date
 *
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 * @param reading - Reading data to cache
 * @param ttlSeconds - Time to live in seconds (optional, defaults to 24 hours)
 */
export async function setCachedReading(
  userId: string,
  date: string,
  reading: any,
  ttlSeconds?: number
): Promise<void> {
  const key = getReadingCacheKey(userId, date);
  await cacheSet(key, reading, ttlSeconds || DEFAULT_TTL.READING_DAILY);
}

/**
 * Invalidate cached reading for a user and date
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format
 */
export async function invalidateReadingCache(userId: string, date: string): Promise<void> {
  const key = getReadingCacheKey(userId, date);
  await cacheDelete(key);
}

/**
 * Invalidate all cached readings for a user
 * 
 * @param userId - User ID
 * @returns Number of keys deleted
 */
export async function invalidateUserReadings(userId: string): Promise<number> {
  const pattern = REDIS_KEYS.READING_DAILY(userId, '*');
  return cacheDeletePattern(pattern);
}

// =============================================================================
// CHART CACHE FUNCTIONS
// =============================================================================

/**
 * Get cached birth chart data
 * 
 * @param userId - User ID
 * @param chartId - Chart ID
 * @returns Cached chart data or null
 */
export async function getCachedChart(userId: string, chartId: string): Promise<any | null> {
  const key = REDIS_KEYS.CHART_CACHE(userId, chartId);
  return cacheGet(key);
}

/**
 * Cache birth chart data
 * 
 * @param userId - User ID
 * @param chartId - Chart ID
 * @param chartData - Chart data to cache
 */
export async function setCachedChart(
  userId: string,
  chartId: string,
  chartData: any
): Promise<void> {
  const key = REDIS_KEYS.CHART_CACHE(userId, chartId);
  await cacheSet(key, chartData, DEFAULT_TTL.CHART_CACHE);
}

/**
 * Invalidate cached chart data
 * 
 * @param userId - User ID
 * @param chartId - Chart ID
 */
export async function invalidateChartCache(userId: string, chartId: string): Promise<void> {
  const key = REDIS_KEYS.CHART_CACHE(userId, chartId);
  await cacheDelete(key);
}

// =============================================================================
// COMPATIBILITY CACHE FUNCTIONS
// =============================================================================

/**
 * Get cached compatibility analysis
 * 
 * @param user1Id - First user ID
 * @param user2Id - Second user ID
 * @param type - Compatibility type (romantic, marriage, business, friendship)
 * @returns Cached compatibility data or null
 */
export async function getCachedCompatibility(
  user1Id: string,
  user2Id: string,
  type: string
): Promise<any | null> {
  const key = REDIS_KEYS.COMPATIBILITY(user1Id, user2Id, type);
  return cacheGet(key);
}

/**
 * Cache compatibility analysis
 * 
 * @param user1Id - First user ID
 * @param user2Id - Second user ID
 * @param type - Compatibility type
 * @param analysis - Compatibility analysis data
 */
export async function setCachedCompatibility(
  user1Id: string,
  user2Id: string,
  type: string,
  analysis: any
): Promise<void> {
  const key = REDIS_KEYS.COMPATIBILITY(user1Id, user2Id, type);
  await cacheSet(key, analysis, DEFAULT_TTL.COMPATIBILITY);
}

/**
 * Invalidate compatibility analysis cache
 * 
 * @param user1Id - First user ID
 * @param user2Id - Second user ID
 * @param type - Compatibility type
 */
export async function invalidateCompatibilityCache(
  user1Id: string,
  user2Id: string,
  type: string
): Promise<void> {
  const key = REDIS_KEYS.COMPATIBILITY(user1Id, user2Id, type);
  await cacheDelete(key);
}

// =============================================================================
// USER PREFERENCES CACHE
// =============================================================================

/**
 * Get cached user preferences
 * 
 * @param userId - User ID
 * @returns Cached preferences or null
 */
export async function getCachedUserPreferences(userId: string): Promise<any | null> {
  const key = REDIS_KEYS.USER_PREFS(userId);
  return cacheGet(key);
}

/**
 * Cache user preferences
 * 
 * @param userId - User ID
 * @param preferences - User preferences data
 */
export async function setCachedUserPreferences(
  userId: string,
  preferences: any
): Promise<void> {
  const key = REDIS_KEYS.USER_PREFS(userId);
  await cacheSet(key, preferences, DEFAULT_TTL.USER_PREFS);
}

/**
 * Invalidate user preferences cache
 * 
 * @param userId - User ID
 */
export async function invalidateUserPreferences(userId: string): Promise<void> {
  const key = REDIS_KEYS.USER_PREFS(userId);
  await cacheDelete(key);
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Get multiple cache keys at once
 * 
 * @param keys - Array of Redis keys
 * @returns Array of cached values (null for missing keys)
 */
export async function cacheMultiGet<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const prefixedKeys = keys.map(prefixKey);
    const results = await redis.mget(...prefixedKeys);
    
    return results.map(result => result as T | null);
  } catch (error) {
    console.error('❌ Cache multi-get error:', error);
    return keys.map(() => null);
  }
}

/**
 * Set multiple cache keys at once
 * 
 * @param entries - Array of key-value-ttl tuples
 */
export async function cacheMultiSet<T>(
  entries: Array<{ key: string; value: T; ttl?: number }>
): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    
    for (const entry of entries) {
      const prefixedKey = prefixKey(entry.key);
      const ttl = entry.ttl || DEFAULT_TTL.READING_DAILY;
      pipeline.setex(prefixedKey, ttl, JSON.stringify(entry.value));
    }
    
    await pipeline.exec();
  } catch (error) {
    console.error('❌ Cache multi-set error:', error);
    throw error;
  }
}
