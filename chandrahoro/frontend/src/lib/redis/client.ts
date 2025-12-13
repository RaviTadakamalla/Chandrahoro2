/**
 * ChandraHoro V2.1 - Redis Client
 * 
 * Upstash Redis client for serverless caching, rate limiting, and session storage.
 * Provides connection management and health checking for Redis operations.
 * 
 * Features:
 * - Serverless-optimized Redis client (Upstash)
 * - Connection health monitoring
 * - Environment-based configuration
 * - Error handling and logging
 * 
 * @example
 * ```typescript
 * import { redis, testRedisConnection } from '@/lib/redis/client';
 * 
 * // Test connection
 * const isConnected = await testRedisConnection();
 * 
 * // Use Redis
 * await redis.set('key', 'value');
 * const value = await redis.get('key');
 * ```
 */

import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client instance
 * 
 * Uses REST API for serverless compatibility with Next.js
 * Automatically handles connection pooling and retries
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.exp(retryCount) * 50, // Exponential backoff
  },
});

/**
 * Test Redis connection and basic operations
 * 
 * @returns Promise<boolean> - True if connection is healthy
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    // Test basic ping
    const pingResult = await redis.ping();
    if (pingResult !== 'PONG') {
      console.error('❌ Redis ping failed:', pingResult);
      return false;
    }

    // Test set/get operations
    const testKey = `test:connection:${Date.now()}`;
    const testValue = 'connection-test';
    
    await redis.set(testKey, testValue, { ex: 10 }); // 10 second expiry
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue !== testValue) {
      console.error('❌ Redis set/get test failed');
      return false;
    }

    // Clean up test key
    await redis.del(testKey);
    
    console.log('✅ Redis connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

/**
 * Get Redis connection info and stats
 * 
 * @returns Promise<object> - Connection information
 */
export async function getRedisInfo(): Promise<{
  connected: boolean;
  url: string;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await redis.ping();
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      url: process.env.UPSTASH_REDIS_REST_URL?.replace(/\/\/.*@/, '//***@') || 'Not configured',
      latency,
    };
  } catch (error: any) {
    return {
      connected: false,
      url: process.env.UPSTASH_REDIS_REST_URL?.replace(/\/\/.*@/, '//***@') || 'Not configured',
      error: error.message,
    };
  }
}

/**
 * Redis key patterns for different data types
 */
export const REDIS_KEYS = {
  // User sessions
  SESSION: (sessionId: string) => `session:${sessionId}`,
  
  // Daily readings cache
  READING_DAILY: (userId: string, date: string) => `reading:daily:${userId}:${date}`,
  
  // Chat conversations
  CHAT_CONVERSATION: (userId: string, conversationId: string) => `chat:${userId}:${conversationId}`,
  CHAT_HISTORY: (userId: string) => `chat:history:${userId}`,
  
  // Rate limiting
  RATE_LIMIT: (identifier: string, window: string) => `ratelimit:${identifier}:${window}`,
  
  // User quota tracking
  QUOTA_DAILY: (userId: string, date: string) => `quota:daily:${userId}:${date}`,
  
  // Birth chart cache
  CHART_CACHE: (userId: string, chartId: string) => `chart:${userId}:${chartId}`,
  
  // Compatibility analysis cache
  COMPATIBILITY: (user1Id: string, user2Id: string, type: string) => 
    `compatibility:${[user1Id, user2Id].sort().join(':')}:${type}`,
  
  // AI model responses cache
  AI_RESPONSE: (promptHash: string, model: string) => `ai:response:${model}:${promptHash}`,
  
  // User preferences cache
  USER_PREFS: (userId: string) => `prefs:${userId}`,
  
  // Temporary data (OTP, verification codes)
  TEMP_DATA: (type: string, identifier: string) => `temp:${type}:${identifier}`,
} as const;

/**
 * Default TTL values for different data types (in seconds)
 */
export const DEFAULT_TTL = {
  // Sessions: 7 days
  SESSION: 7 * 24 * 60 * 60,
  
  // Daily readings: 24 hours
  READING_DAILY: 24 * 60 * 60,
  
  // Chat conversations: 30 days
  CHAT_CONVERSATION: 30 * 24 * 60 * 60,
  CHAT_HISTORY: 30 * 24 * 60 * 60,
  
  // Rate limiting: 1 hour
  RATE_LIMIT: 60 * 60,
  
  // Quota tracking: 25 hours (to handle timezone edge cases)
  QUOTA_DAILY: 25 * 60 * 60,
  
  // Birth charts: 7 days
  CHART_CACHE: 7 * 24 * 60 * 60,
  
  // Compatibility analysis: 7 days
  COMPATIBILITY: 7 * 24 * 60 * 60,
  
  // AI responses: 1 hour (for similar prompts)
  AI_RESPONSE: 60 * 60,
  
  // User preferences: 24 hours
  USER_PREFS: 24 * 60 * 60,
  
  // Temporary data: 10 minutes
  TEMP_DATA: 10 * 60,
} as const;

/**
 * Redis configuration for different environments
 */
export const REDIS_CONFIG = {
  development: {
    keyPrefix: 'dev:chandrahoro:',
    defaultTTL: DEFAULT_TTL.READING_DAILY,
    enableLogging: true,
  },
  production: {
    keyPrefix: 'prod:chandrahoro:',
    defaultTTL: DEFAULT_TTL.READING_DAILY,
    enableLogging: false,
  },
  test: {
    keyPrefix: 'test:chandrahoro:',
    defaultTTL: 60, // Short TTL for tests
    enableLogging: false,
  },
} as const;

/**
 * Get current environment configuration
 */
export function getRedisConfig() {
  const env = process.env.NODE_ENV || 'development';
  return REDIS_CONFIG[env as keyof typeof REDIS_CONFIG] || REDIS_CONFIG.development;
}

/**
 * Add environment prefix to Redis key
 * 
 * @param key - Base Redis key
 * @returns Prefixed key for current environment
 */
export function prefixKey(key: string): string {
  const config = getRedisConfig();
  return `${config.keyPrefix}${key}`;
}

/**
 * Log Redis operations in development
 * 
 * @param operation - Redis operation name
 * @param key - Redis key
 * @param details - Additional details
 */
export function logRedisOperation(operation: string, key: string, details?: any) {
  const config = getRedisConfig();
  if (config.enableLogging) {
    console.log(`🔴 Redis ${operation}:`, key, details ? JSON.stringify(details) : '');
  }
}

/**
 * Health check endpoint data
 */
export async function getHealthCheck() {
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
    },
  };
}
