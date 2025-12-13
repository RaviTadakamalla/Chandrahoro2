/**
 * ChandraHoro V2.1 - Redis Rate Limiting
 * 
 * Sliding window rate limiting using Redis for API endpoints and user actions.
 * Provides flexible rate limiting with different windows and limits per user/IP.
 * 
 * Features:
 * - Sliding window rate limiting
 * - Per-user and per-IP limiting
 * - Multiple time windows (minute, hour, day)
 * - Rate limit headers for API responses
 * - Middleware wrapper for Next.js API routes
 * - Plan-based rate limiting
 * 
 * @example
 * ```typescript
 * import { checkRateLimit, withRateLimit } from '@/lib/redis/rate-limit';
 * 
 * // Check rate limit manually
 * const { allowed, remaining } = await checkRateLimit(userId, 100, 3600);
 * 
 * // Use middleware wrapper
 * export default withRateLimit(handler, { limit: 50, window: 3600 });
 * ```
 */

import { redis, REDIS_KEYS, prefixKey, logRedisOperation } from './client';

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  current: number;
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  // API endpoints
  API_GENERAL: { limit: 100, window: 3600 }, // 100 requests per hour
  API_AI: { limit: 50, window: 3600 }, // 50 AI requests per hour
  API_READINGS: { limit: 20, window: 3600 }, // 20 readings per hour
  API_CHAT: { limit: 30, window: 3600 }, // 30 chat messages per hour
  
  // Authentication
  AUTH_LOGIN: { limit: 10, window: 900 }, // 10 login attempts per 15 minutes
  AUTH_SIGNUP: { limit: 5, window: 3600 }, // 5 signups per hour
  AUTH_PASSWORD_RESET: { limit: 3, window: 3600 }, // 3 password resets per hour
  
  // User actions
  PROFILE_UPDATE: { limit: 10, window: 3600 }, // 10 profile updates per hour
  CHART_CREATE: { limit: 5, window: 3600 }, // 5 chart creations per hour
  
  // Plan-based limits
  PLAN_FREE: { limit: 10, window: 86400 }, // 10 requests per day
  PLAN_BASIC: { limit: 50, window: 86400 }, // 50 requests per day
  PLAN_PRO: { limit: 200, window: 86400 }, // 200 requests per day
  PLAN_ENTERPRISE: { limit: 1000, window: 86400 }, // 1000 requests per day
} as const;

/**
 * Check rate limit for an identifier using sliding window
 * 
 * @param identifier - User ID, IP address, or other identifier
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @param action - Action type for logging (optional)
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 3600,
  action?: string
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowStart = Math.floor(now / 1000 / windowSeconds);
    const key = REDIS_KEYS.RATE_LIMIT(identifier, windowStart.toString());
    
    logRedisOperation('RATE_LIMIT_CHECK', key, { limit, window: windowSeconds, action });
    
    // Increment counter for current window
    const current = await redis.incr(prefixKey(key));
    
    // Set expiry on first request in window
    if (current === 1) {
      await redis.expire(prefixKey(key), windowSeconds);
    }
    
    const remaining = Math.max(0, limit - current);
    const resetAt = new Date((windowStart + 1) * windowSeconds * 1000);
    
    return {
      allowed: current <= limit,
      remaining,
      resetAt,
      limit,
      current,
    };
  } catch (error) {
    console.error('❌ Rate limit check error:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
      limit,
      current: 0,
    };
  }
}

/**
 * Check rate limit with multiple windows (burst protection)
 * 
 * @param identifier - User ID or IP address
 * @param limits - Array of limit configurations
 * @returns Rate limit result (most restrictive)
 */
export async function checkMultiWindowRateLimit(
  identifier: string,
  limits: Array<{ limit: number; window: number; name?: string }>
): Promise<RateLimitResult & { limitType?: string }> {
  const results = await Promise.all(
    limits.map(async (config) => ({
      ...await checkRateLimit(identifier, config.limit, config.window, config.name),
      limitType: config.name || `${config.limit}/${config.window}s`,
    }))
  );
  
  // Return the most restrictive result (first one that's not allowed)
  const blocked = results.find(result => !result.allowed);
  return blocked || results[0];
}

/**
 * Plan-based rate limiting
 * 
 * @param userId - User ID
 * @param planType - User's plan type
 * @param action - Action being performed
 * @returns Rate limit result
 */
export async function checkPlanRateLimit(
  userId: string,
  planType: 'free' | 'basic' | 'pro' | 'enterprise',
  action: string = 'general'
): Promise<RateLimitResult> {
  const planLimits = {
    free: RATE_LIMITS.PLAN_FREE,
    basic: RATE_LIMITS.PLAN_BASIC,
    pro: RATE_LIMITS.PLAN_PRO,
    enterprise: RATE_LIMITS.PLAN_ENTERPRISE,
  };
  
  const config = planLimits[planType];
  return checkRateLimit(`plan:${userId}`, config.limit, config.window, `plan:${planType}:${action}`);
}

/**
 * AI-specific rate limiting with different limits per model
 * 
 * @param userId - User ID
 * @param model - AI model being used
 * @param planType - User's plan type
 * @returns Rate limit result
 */
export async function checkAIRateLimit(
  userId: string,
  model: string,
  planType: 'free' | 'basic' | 'pro' | 'enterprise'
): Promise<RateLimitResult> {
  // Different limits based on model cost
  const modelLimits = {
    'claude-3-haiku-20240307': { free: 20, basic: 100, pro: 500, enterprise: 2000 },
    'claude-3-5-sonnet-20241022': { free: 10, basic: 50, pro: 200, enterprise: 1000 },
    'claude-3-opus-20240229': { free: 5, basic: 20, pro: 100, enterprise: 500 },
  };
  
  const limits = modelLimits[model as keyof typeof modelLimits] || modelLimits['claude-3-5-sonnet-20241022'];
  const limit = limits[planType];
  
  return checkRateLimit(`ai:${userId}:${model}`, limit, 86400, `ai:${model}`); // Daily limit
}

/**
 * Middleware wrapper for Next.js API routes
 * 
 * @param handler - API route handler
 * @param options - Rate limiting options
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: any, res: any) => Promise<any>,
  options: {
    limit?: number;
    window?: number;
    keyGenerator?: (req: any) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    onLimitReached?: (req: any, res: any, result: RateLimitResult) => void;
  } = {}
) {
  return async (req: any, res: any) => {
    try {
      // Generate rate limit key
      const identifier = options.keyGenerator 
        ? options.keyGenerator(req)
        : req.user?.id || req.ip || 'anonymous';
      
      // Check rate limit
      const result = await checkRateLimit(
        identifier,
        options.limit || 100,
        options.window || 3600,
        `api:${req.url}`
      );
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      res.setHeader('X-RateLimit-Reset-Timestamp', Math.floor(result.resetAt.getTime() / 1000));
      
      // Check if rate limited
      if (!result.allowed) {
        if (options.onLimitReached) {
          options.onLimitReached(req, res, result);
        }
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Limit: ${result.limit} per ${options.window || 3600} seconds.`,
            retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
            resetAt: result.resetAt.toISOString(),
          },
        });
      }
      
      // Execute handler
      const response = await handler(req, res);
      
      // Optionally skip counting successful/failed requests
      if (options.skipSuccessfulRequests && res.statusCode < 400) {
        // Decrement counter for successful requests if configured
        const windowStart = Math.floor(Date.now() / 1000 / (options.window || 3600));
        const key = REDIS_KEYS.RATE_LIMIT(identifier, windowStart.toString());
        await redis.decr(prefixKey(key));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Rate limit middleware error:', error);
      // Fail open - continue to handler if rate limiting fails
      return handler(req, res);
    }
  };
}

/**
 * Reset rate limit for an identifier
 * 
 * @param identifier - User ID or IP address
 * @param windowSeconds - Time window in seconds
 */
export async function resetRateLimit(
  identifier: string,
  windowSeconds: number = 3600
): Promise<void> {
  try {
    const windowStart = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = REDIS_KEYS.RATE_LIMIT(identifier, windowStart.toString());
    
    await redis.del(prefixKey(key));
    logRedisOperation('RATE_LIMIT_RESET', key);
  } catch (error) {
    console.error('❌ Rate limit reset error:', error);
    throw error;
  }
}

/**
 * Get current rate limit status without incrementing
 * 
 * @param identifier - User ID or IP address
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 3600
): Promise<RateLimitResult> {
  try {
    const windowStart = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = REDIS_KEYS.RATE_LIMIT(identifier, windowStart.toString());
    
    const current = await redis.get(prefixKey(key)) || 0;
    const remaining = Math.max(0, limit - Number(current));
    const resetAt = new Date((windowStart + 1) * windowSeconds * 1000);
    
    return {
      allowed: Number(current) < limit,
      remaining,
      resetAt,
      limit,
      current: Number(current),
    };
  } catch (error) {
    console.error('❌ Rate limit status error:', error);
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
      limit,
      current: 0,
    };
  }
}

/**
 * Cleanup expired rate limit keys (for maintenance)
 * 
 * @returns Number of keys cleaned up
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  try {
    const pattern = prefixKey('ratelimit:*');
    const keys = await redis.keys(pattern);
    
    let cleaned = 0;
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -2) { // Key doesn't exist
        cleaned++;
      }
    }
    
    return cleaned;
  } catch (error) {
    console.error('❌ Rate limit cleanup error:', error);
    return 0;
  }
}
