/**
 * ChandraHoro V2.1 - Quota Middleware
 * 
 * Middleware wrapper for API routes to check AI quota before processing requests.
 * Provides pre-request validation and automatic error responses for quota exceeded.
 * 
 * Features:
 * - Pre-request quota checking
 * - Automatic quota exceeded responses
 * - Request context enhancement
 * - Logging and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { quotaService } from '@/lib/ai/quota';
import { errorResponse } from '@/lib/api/response';

/**
 * Middleware wrapper to check quota before processing AI requests
 * 
 * @param handler - The API route handler function
 * @returns Wrapped handler with quota checking
 */
export function withQuotaCheck(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const userId = (request as any).user?.id;
    
    if (!userId) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    try {
      console.log('[Quota Middleware] Checking quota for user:', userId);
      
      const quotaCheck = await quotaService.check(userId);
      
      if (!quotaCheck.allowed) {
        console.log('[Quota Middleware] ❌ Quota exceeded for user:', userId);
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'QUOTA_EXCEEDED',
              message: 'Daily AI quota exceeded. Resets at midnight IST.',
              meta: {
                resetAt: quotaCheck.resetAt.toISOString(),
                requestsRemaining: 0,
                tokensRemaining: 0,
                planType: quotaCheck.planType,
                requestsUsed: quotaCheck.requestsUsed,
                tokensUsed: quotaCheck.tokensUsed,
                dailyRequestLimit: quotaCheck.dailyRequestLimit,
                dailyTokenLimit: quotaCheck.dailyTokenLimit,
                requestsPercentage: quotaCheck.requestsPercentage,
                tokensPercentage: quotaCheck.tokensPercentage,
                capMode: quotaCheck.capMode,
                upgradeUrl: quotaCheck.planType === 'free' ? '/pricing' : null,
              },
            },
          },
          { status: 429 }
        );
      }
      
      // Show warning if approaching limits
      if (quotaCheck.warning) {
        console.log('[Quota Middleware] ⚠️  Warning: User approaching quota limits:', {
          userId,
          requestsPercentage: quotaCheck.requestsPercentage,
          tokensPercentage: quotaCheck.tokensPercentage,
        });
      }
      
      console.log('[Quota Middleware] ✅ Quota check passed:', {
        userId,
        requestsRemaining: quotaCheck.requestsRemaining,
        tokensRemaining: quotaCheck.tokensRemaining,
        planType: quotaCheck.planType,
      });
      
      // Attach quota info to request for logging and usage tracking
      (request as any).quota = quotaCheck;
      
      return handler(request, context);
    } catch (error: any) {
      console.error('[Quota Middleware] ❌ Quota check failed:', error);
      
      return errorResponse(
        'QUOTA_CHECK_FAILED',
        'Unable to verify quota. Please try again.',
        500,
        { retryAfter: 30 }
      );
    }
  };
}

/**
 * Middleware wrapper for admin-only quota operations
 * 
 * @param handler - The API route handler function
 * @returns Wrapped handler with admin checking
 */
export function withAdminQuotaAccess(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const user = (request as any).user;
    
    if (!user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // Check if user is admin (implement your admin check logic)
    const isAdmin = user.role === 'admin' || user.email?.endsWith('@chandrahoro.com');
    
    if (!isAdmin) {
      return errorResponse(
        'ADMIN_REQUIRED',
        'Admin access required for quota management',
        403
      );
    }
    
    console.log('[Quota Middleware] ✅ Admin access granted:', user.id);
    
    return handler(request, context);
  };
}

/**
 * Middleware to log quota usage after successful AI requests
 * Use this after AI API calls to track usage
 * 
 * @param userId - User ID
 * @param tokensUsed - Number of tokens consumed
 * @param requestType - Type of AI request
 */
export async function logQuotaUsage(
  userId: string,
  tokensUsed: number,
  requestType: string
): Promise<void> {
  try {
    console.log('[Quota Middleware] Logging usage:', {
      userId,
      tokensUsed,
      requestType,
    });
    
    await quotaService.increment(userId, tokensUsed);
    
    console.log('[Quota Middleware] ✅ Usage logged successfully');
  } catch (error: any) {
    console.error('[Quota Middleware] ❌ Failed to log usage:', error);
    // Don't throw error - usage logging failure shouldn't break the request
  }
}

/**
 * Get quota status for display in UI components
 * 
 * @param userId - User ID to check
 * @returns Quota status or null if error
 */
export async function getQuotaForDisplay(userId: string) {
  try {
    return await quotaService.check(userId);
  } catch (error: any) {
    console.error('[Quota Middleware] Failed to get quota for display:', error);
    return null;
  }
}

/**
 * Check if user has access to specific AI features
 * 
 * @param userId - User ID to check
 * @param feature - Feature name
 * @returns Whether feature is accessible
 */
export async function checkFeatureQuota(
  userId: string,
  feature: 'daily_reading' | 'ai_chat' | 'compatibility' | 'pdf_reports'
): Promise<boolean> {
  try {
    const quota = await quotaService.check(userId);
    
    if (!quota.allowed) {
      return false;
    }
    
    // Additional feature-specific checks can be added here
    // For now, if quota is allowed, all enabled features are accessible
    return true;
  } catch (error: any) {
    console.error('[Quota Middleware] Feature quota check failed:', error);
    return false;
  }
}

/**
 * Middleware to validate quota before expensive operations
 * Use for operations that consume significant resources
 * 
 * @param handler - The handler function
 * @param options - Configuration options
 */
export function withQuotaValidation(
  handler: Function,
  options: {
    feature?: string;
    minimumTokens?: number;
    minimumRequests?: number;
  } = {}
) {
  return async (request: NextRequest, context?: any) => {
    const userId = (request as any).user?.id;
    
    if (!userId) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    try {
      const quota = await quotaService.check(userId);
      
      // Check basic quota allowance
      if (!quota.allowed) {
        return errorResponse(
          'QUOTA_EXCEEDED',
          'Daily AI quota exceeded',
          429,
          { resetAt: quota.resetAt.toISOString() }
        );
      }
      
      // Check minimum requirements if specified
      if (options.minimumTokens && quota.tokensRemaining < options.minimumTokens) {
        return errorResponse(
          'INSUFFICIENT_TOKENS',
          `Insufficient token quota. Need ${options.minimumTokens}, have ${quota.tokensRemaining}`,
          429
        );
      }
      
      if (options.minimumRequests && quota.requestsRemaining < options.minimumRequests) {
        return errorResponse(
          'INSUFFICIENT_REQUESTS',
          `Insufficient request quota. Need ${options.minimumRequests}, have ${quota.requestsRemaining}`,
          429
        );
      }
      
      // Attach quota to request
      (request as any).quota = quota;
      
      return handler(request, context);
    } catch (error: any) {
      console.error('[Quota Validation] Error:', error);
      return errorResponse('QUOTA_VALIDATION_FAILED', 'Quota validation failed', 500);
    }
  };
}
