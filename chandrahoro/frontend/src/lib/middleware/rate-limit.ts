/**
 * ChandraHoro V2.1 - Rate Limiting Middleware
 * 
 * Redis-based rate limiting middleware for API routes.
 * Provides flexible rate limiting with plan-based quotas and burst protection.
 * 
 * Features:
 * - Sliding window rate limiting
 * - Plan-based daily quotas
 * - API endpoint-specific limits
 * - Rate limit headers in responses
 * - Graceful degradation if Redis is unavailable
 * 
 * @example
 * ```typescript
 * import { withRateLimit } from '@/lib/middleware/rate-limit';
 * 
 * export const POST = withRateLimit(handler, { 
 *   limit: 50, 
 *   window: 3600,
 *   skipSuccessfulRequests: true 
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, checkPlanRateLimit, RATE_LIMITS } from '@/lib/redis/rate-limit';
import { getUserPlan } from './auth';

/**
 * Rate limiting options
 */
export interface RateLimitOptions {
  /** Maximum number of requests allowed */
  limit?: number;
  /** Time window in seconds */
  window?: number;
  /** Custom key generator function */
  keyGenerator?: (request: NextRequest) => string;
  /** Skip rate limiting for successful requests */
  skipSuccessfulRequests?: boolean;
  /** Skip rate limiting for failed requests */
  skipFailedRequests?: boolean;
  /** Custom error message */
  message?: string;
  /** Enable plan-based rate limiting */
  usePlanLimits?: boolean;
  /** Action type for plan-based limiting */
  action?: 'reading' | 'chat' | 'compatibility' | 'general';
}

/**
 * Rate limiting middleware wrapper
 * 
 * Applies rate limiting to API routes with configurable options.
 * Adds rate limit headers to responses.
 * 
 * @param handler - API route handler function
 * @param options - Rate limiting configuration
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: Function,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    const {
      limit = 100,
      window = 3600,
      keyGenerator,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      message,
      usePlanLimits = false,
      action = 'general',
    } = options;
    
    try {
      // Generate rate limit key
      const identifier = keyGenerator 
        ? keyGenerator(request)
        : (request as any).user?.id || request.ip || 'anonymous';
      
      let rateLimitResult;
      
      if (usePlanLimits && (request as any).user?.id) {
        // Use plan-based rate limiting
        const userId = (request as any).user.id;
        const planType = await getUserPlan(userId);
        
        rateLimitResult = await checkPlanRateLimit(userId, planType as any, action);
      } else {
        // Use standard rate limiting
        rateLimitResult = await checkRateLimit(
          identifier,
          limit,
          window,
          action
        );
      }
      
      // Check if rate limit exceeded
      if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetAt);
        const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        
        const response = NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: message || `Too many requests. Try again after ${resetTime.toISOString()}`,
              resetAt: resetTime.toISOString(),
              retryAfter,
            },
          },
          { status: 429 }
        );
        
        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', resetTime.toISOString());
        response.headers.set('Retry-After', retryAfter.toString());
        
        return response;
      }
      
      // Execute the handler
      const response = await handler(request, context);
      
      // Add rate limit headers to successful responses
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetAt).toISOString());
      }
      
      return response;
    } catch (error) {
      console.error('❌ Rate limit middleware error:', error);
      
      // Fail open - allow request if Redis is down
      console.warn('⚠️ Rate limiting failed, allowing request');
      return handler(request, context);
    }
  };
}

/**
 * Strict rate limiting middleware
 * 
 * Fails closed if rate limiting service is unavailable.
 * Use for critical endpoints that must be protected.
 * 
 * @param handler - API route handler function
 * @param options - Rate limiting configuration
 * @returns Wrapped handler with strict rate limiting
 */
export function withStrictRateLimit(
  handler: Function,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await withRateLimit(handler, options)(request, context);
    } catch (error) {
      console.error('❌ Strict rate limit error:', error);
      
      // Fail closed - reject request if rate limiting fails
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_SERVICE_ERROR',
            message: 'Rate limiting service unavailable. Please try again later.',
          },
        },
        { status: 503 }
      );
    }
  };
}

/**
 * API endpoint-specific rate limiting presets
 */
export const rateLimitPresets = {
  // Authentication endpoints
  auth: {
    signup: { limit: 5, window: 3600, action: 'general' as const },
    signin: { limit: 10, window: 900, action: 'general' as const },
    resetPassword: { limit: 3, window: 3600, action: 'general' as const },
  },
  
  // Reading endpoints
  readings: {
    list: { limit: 100, window: 3600, usePlanLimits: true, action: 'reading' as const },
    create: { limit: 20, window: 3600, usePlanLimits: true, action: 'reading' as const },
    update: { limit: 50, window: 3600, action: 'general' as const },
    delete: { limit: 20, window: 3600, action: 'general' as const },
  },
  
  // Chat endpoints
  chat: {
    message: { limit: 30, window: 3600, usePlanLimits: true, action: 'chat' as const },
    conversations: { limit: 50, window: 3600, action: 'general' as const },
    create: { limit: 10, window: 3600, action: 'general' as const },
  },
  
  // Chart endpoints
  charts: {
    list: { limit: 100, window: 3600, action: 'general' as const },
    create: { limit: 10, window: 3600, action: 'general' as const },
    update: { limit: 20, window: 3600, action: 'general' as const },
    delete: { limit: 10, window: 3600, action: 'general' as const },
  },
  
  // Compatibility endpoints
  compatibility: {
    analyze: { limit: 10, window: 3600, usePlanLimits: true, action: 'compatibility' as const },
  },
  
  // Profile endpoints
  profile: {
    update: { limit: 20, window: 3600, action: 'general' as const },
  },
  
  // General API
  general: {
    default: { limit: 100, window: 3600, action: 'general' as const },
    strict: { limit: 50, window: 3600, action: 'general' as const },
  },
};

/**
 * Convenience functions for common rate limiting patterns
 */

/**
 * Apply authentication rate limiting
 */
export function withAuthRateLimit(handler: Function, type: keyof typeof rateLimitPresets.auth) {
  return withRateLimit(handler, rateLimitPresets.auth[type]);
}

/**
 * Apply reading endpoint rate limiting
 */
export function withReadingRateLimit(handler: Function, type: keyof typeof rateLimitPresets.readings) {
  return withRateLimit(handler, rateLimitPresets.readings[type]);
}

/**
 * Apply chat endpoint rate limiting
 */
export function withChatRateLimit(handler: Function, type: keyof typeof rateLimitPresets.chat) {
  return withRateLimit(handler, rateLimitPresets.chat[type]);
}

/**
 * Apply chart endpoint rate limiting
 */
export function withChartRateLimit(handler: Function, type: keyof typeof rateLimitPresets.charts) {
  return withRateLimit(handler, rateLimitPresets.charts[type]);
}

/**
 * Apply compatibility endpoint rate limiting
 */
export function withCompatibilityRateLimit(handler: Function, type: keyof typeof rateLimitPresets.compatibility) {
  return withRateLimit(handler, rateLimitPresets.compatibility[type]);
}

/**
 * Apply profile endpoint rate limiting
 */
export function withProfileRateLimit(handler: Function, type: keyof typeof rateLimitPresets.profile) {
  return withRateLimit(handler, rateLimitPresets.profile[type]);
}

/**
 * Custom key generators for different scenarios
 */
export const keyGenerators = {
  /** Use user ID if authenticated, otherwise IP */
  userOrIP: (request: NextRequest) => {
    return (request as any).user?.id || request.ip || 'anonymous';
  },
  
  /** Use IP address only */
  ip: (request: NextRequest) => {
    return request.ip || 'unknown';
  },
  
  /** Use user ID only (requires authentication) */
  user: (request: NextRequest) => {
    return (request as any).user?.id || 'unauthenticated';
  },
  
  /** Use email for signup/signin */
  email: (request: NextRequest) => {
    const body = (request as any).validatedData;
    return body?.email || request.ip || 'anonymous';
  },
  
  /** Combine user ID and action type */
  userAction: (action: string) => (request: NextRequest) => {
    const userId = (request as any).user?.id || 'anonymous';
    return `${userId}:${action}`;
  },
};

/**
 * Rate limit status check (for debugging/monitoring)
 */
export async function getRateLimitStatus(
  identifier: string,
  limit: number = 100,
  window: number = 3600
) {
  try {
    return await checkRateLimit(identifier, limit, window);
  } catch (error) {
    console.error('❌ Rate limit status check error:', error);
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + window * 1000),
      limit,
      current: 0,
    };
  }
}
