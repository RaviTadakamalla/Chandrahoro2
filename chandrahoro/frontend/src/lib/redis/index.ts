/**
 * ChandraHoro V2.1 - Redis Integration Module
 * 
 * Main entry point for all Redis-related functionality including:
 * - Caching operations (readings, charts, compatibility)
 * - Rate limiting (API endpoints, user actions)
 * - Session management (optional Redis sessions)
 * - Temporary data storage (OTP, verification codes)
 * 
 * @example
 * ```typescript
 * import { 
 *   getCachedReading, 
 *   checkRateLimit, 
 *   testRedisConnection 
 * } from '@/lib/redis';
 * 
 * // Test connection
 * const isConnected = await testRedisConnection();
 * 
 * // Cache operations
 * const reading = await getCachedReading(userId, '2024-10-26');
 * 
 * // Rate limiting
 * const { allowed } = await checkRateLimit(userId, 100, 3600);
 * ```
 */

// Redis client exports
export {
  redis,
  testRedisConnection,
  getRedisInfo,
  getHealthCheck,
  REDIS_KEYS,
  DEFAULT_TTL,
  REDIS_CONFIG,
  getRedisConfig,
  prefixKey,
  logRedisOperation,
} from './client';

// Cache utilities exports
export {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheExists,
  cacheTTL,
  cacheExtendTTL,
  cacheMultiGet,
  cacheMultiSet,
  
  // Reading cache functions
  getReadingCacheKey,
  getCachedReading,
  setCachedReading,
  invalidateReadingCache,
  invalidateUserReadings,
  
  // Chart cache functions
  getCachedChart,
  setCachedChart,
  invalidateChartCache,
  
  // Compatibility cache functions
  getCachedCompatibility,
  setCachedCompatibility,
  invalidateCompatibilityCache,
  
  // User preferences cache
  getCachedUserPreferences,
  setCachedUserPreferences,
  invalidateUserPreferences,
} from './cache';

// Rate limiting exports
export {
  checkRateLimit,
  checkMultiWindowRateLimit,
  checkPlanRateLimit,
  checkAIRateLimit,
  withRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  cleanupExpiredRateLimits,
  RATE_LIMITS,
  type RateLimitResult,
} from './rate-limit';

// Session management exports
export {
  setSession,
  getSession,
  deleteSession,
  updateSessionActivity,
  getUserSessions,
  deleteUserSessions,
  
  // Chat conversation management
  setChatConversation,
  getChatConversation,
  updateChatHistory,
  getChatHistory,
  
  // Temporary data storage
  setTempData,
  getTempData,
  deleteTempData,
  
  type SessionData,
  type ChatConversation,
} from './sessions';

/**
 * High-level Redis service functions for common use cases
 */

// Import functions for use in service functions
import {
  testRedisConnection,
  getRedisInfo,
  getRedisConfig,
} from './client';

import {
  setCachedReading,
  getCachedReading,
} from './cache';

import {
  checkRateLimit,
  checkPlanRateLimit,
  cleanupExpiredRateLimits,
  RATE_LIMITS,
  type RateLimitResult,
} from './rate-limit';

import {
  setTempData,
  getTempData,
  deleteTempData,
} from './sessions';

/**
 * Initialize Redis connection and verify health
 *
 * @returns Promise<boolean> - True if Redis is healthy
 */
export async function initializeRedis(): Promise<boolean> {
  try {
    console.log('🔴 Initializing Redis connection...');

    const isHealthy = await testRedisConnection();

    if (isHealthy) {
      console.log('✅ Redis initialized successfully');
      return true;
    } else {
      console.error('❌ Redis initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
    return false;
  }
}

/**
 * Get comprehensive Redis status for health checks
 * 
 * @returns Redis status information
 */
export async function getRedisStatus() {
  try {
    const info = await getRedisInfo();
    const config = getRedisConfig();
    
    return {
      service: 'Redis',
      status: info.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        ...info,
        environment: process.env.NODE_ENV || 'development',
        keyPrefix: config.keyPrefix,
        defaultTTL: config.defaultTTL,
        enableLogging: config.enableLogging,
      },
    };
  } catch (error) {
    return {
      service: 'Redis',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cache a daily reading with automatic key generation
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @param reading - Reading data to cache
 * @returns Promise<void>
 */
export async function cacheReading(
  userId: string,
  reading: any,
  date?: string
): Promise<void> {
  const readingDate = date || new Date().toISOString().split('T')[0];
  await setCachedReading(userId, readingDate, reading);
}

/**
 * Get cached reading with automatic date handling
 * 
 * @param userId - User ID
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns Cached reading or null
 */
export async function getReading(userId: string, date?: string): Promise<any | null> {
  const readingDate = date || new Date().toISOString().split('T')[0];
  return getCachedReading(userId, readingDate);
}

/**
 * Check if user can make an API request (combines rate limiting and quota)
 * 
 * @param userId - User ID
 * @param action - Action type (reading, chat, compatibility)
 * @param planType - User's plan type
 * @returns Permission result
 */
export async function checkUserPermission(
  userId: string,
  action: 'reading' | 'chat' | 'compatibility' | 'general',
  planType: 'free' | 'basic' | 'pro' | 'enterprise'
): Promise<{
  allowed: boolean;
  reason?: string;
  rateLimitResult?: RateLimitResult;
  quotaResult?: RateLimitResult;
}> {
  try {
    // Check general rate limit
    const rateLimitConfig = {
      reading: RATE_LIMITS.API_READINGS,
      chat: RATE_LIMITS.API_CHAT,
      compatibility: RATE_LIMITS.API_AI,
      general: RATE_LIMITS.API_GENERAL,
    }[action];
    
    const rateLimitResult = await checkRateLimit(
      `user:${userId}:${action}`,
      rateLimitConfig.limit,
      rateLimitConfig.window,
      action
    );
    
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        rateLimitResult,
      };
    }
    
    // Check plan-based quota
    const quotaResult = await checkPlanRateLimit(userId, planType, action);
    
    if (!quotaResult.allowed) {
      return {
        allowed: false,
        reason: 'Daily quota exceeded',
        quotaResult,
      };
    }
    
    return {
      allowed: true,
      rateLimitResult,
      quotaResult,
    };
  } catch (error) {
    console.error('❌ Check user permission error:', error);
    // Fail open - allow request if Redis is down
    return { allowed: true };
  }
}

/**
 * Store temporary verification code (OTP, email verification, etc.)
 * 
 * @param type - Verification type
 * @param identifier - Email, phone, or user ID
 * @param code - Verification code
 * @param ttlMinutes - Time to live in minutes (default: 10)
 */
export async function storeVerificationCode(
  type: 'email' | 'phone' | 'password_reset' | 'otp',
  identifier: string,
  code: string,
  ttlMinutes: number = 10
): Promise<void> {
  const data = {
    code,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  
  await setTempData(type, identifier, data, ttlMinutes * 60);
}

/**
 * Verify temporary code and handle attempts
 * 
 * @param type - Verification type
 * @param identifier - Email, phone, or user ID
 * @param code - Code to verify
 * @param maxAttempts - Maximum attempts allowed (default: 3)
 * @returns Verification result
 */
export async function verifyCode(
  type: 'email' | 'phone' | 'password_reset' | 'otp',
  identifier: string,
  code: string,
  maxAttempts: number = 3
): Promise<{
  valid: boolean;
  expired: boolean;
  attemptsExceeded: boolean;
  remainingAttempts: number;
}> {
  try {
    const data = await getTempData(type, identifier);
    
    if (!data) {
      return {
        valid: false,
        expired: true,
        attemptsExceeded: false,
        remainingAttempts: 0,
      };
    }
    
    // Check attempts
    if (data.attempts >= maxAttempts) {
      return {
        valid: false,
        expired: false,
        attemptsExceeded: true,
        remainingAttempts: 0,
      };
    }
    
    // Increment attempts
    data.attempts++;
    await setTempData(type, identifier, data, DEFAULT_TTL.TEMP_DATA);
    
    // Check code
    const valid = data.code === code;
    
    if (valid) {
      // Delete the code after successful verification
      await deleteTempData(type, identifier);
    }
    
    return {
      valid,
      expired: false,
      attemptsExceeded: false,
      remainingAttempts: maxAttempts - data.attempts,
    };
  } catch (error) {
    console.error('❌ Verify code error:', error);
    return {
      valid: false,
      expired: false,
      attemptsExceeded: false,
      remainingAttempts: 0,
    };
  }
}

/**
 * Cleanup expired data (for maintenance tasks)
 * 
 * @returns Cleanup statistics
 */
export async function cleanupExpiredData(): Promise<{
  rateLimits: number;
  sessions: number;
  tempData: number;
}> {
  try {
    console.log('🧹 Starting Redis cleanup...');
    
    const rateLimits = await cleanupExpiredRateLimits();
    
    // Note: Redis automatically handles TTL expiration,
    // so this is mainly for monitoring purposes
    
    console.log(`✅ Redis cleanup completed: ${rateLimits} rate limit keys cleaned`);
    
    return {
      rateLimits,
      sessions: 0, // Auto-expired by Redis
      tempData: 0, // Auto-expired by Redis
    };
  } catch (error) {
    console.error('❌ Redis cleanup error:', error);
    return { rateLimits: 0, sessions: 0, tempData: 0 };
  }
}
