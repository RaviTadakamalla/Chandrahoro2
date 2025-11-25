/**
 * ChandraHoro V2.1 - Quota Check API Endpoint
 * 
 * API endpoint for checking user's AI quota status.
 * Returns comprehensive quota information including usage, limits, and warnings.
 * 
 * Features:
 * - Real-time quota checking
 * - Enhanced quota information
 * - Automatic quota reset detection
 * - Error handling
 * - Performance monitoring
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { quotaService } from '@/lib/ai/quota';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/quota/check
 * Check user's current AI quota status
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/quota/check');
  
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    console.log('[API] ✅ User authenticated:', session.user.id);
    
    // Check quota using enhanced service
    const startTime = Date.now();
    const quota = await quotaService.check(session.user.id);
    const checkTime = Date.now() - startTime;
    
    console.log('[API] ✅ Quota check completed:', {
      userId: session.user.id,
      allowed: quota.allowed,
      requestsRemaining: quota.requestsRemaining,
      tokensRemaining: quota.tokensRemaining,
      warning: quota.warning,
      checkTime: `${checkTime}ms`,
    });
    
    return successResponse(quota, 200, {
      checkTime,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] ❌ Quota check failed:', error);
    
    // Handle specific error types
    if (error.message.includes('Entitlement not found')) {
      return errorResponse(
        'ENTITLEMENT_NOT_FOUND',
        'User entitlement not found. Please contact support.',
        404,
        { action: 'Contact support to set up your account' }
      );
    }
    
    if (error.message.includes('Database')) {
      return errorResponse(
        'DATABASE_ERROR',
        'Database temporarily unavailable',
        503,
        { retryAfter: 30 }
      );
    }
    
    // Generic error
    return errorResponse(
      'QUOTA_CHECK_FAILED',
      'Failed to check quota. Please try again.',
      500,
      { retryAfter: 10 }
    );
  }
}

/**
 * POST /api/quota/check
 * Force refresh quota check (bypasses any caching)
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/quota/check - Force refresh');
  
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // Parse request body for options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch (error) {
      // No body or invalid JSON - use defaults
    }
    
    console.log('[API] Force refresh options:', options);
    
    // Force fresh quota check
    const startTime = Date.now();
    const quota = await quotaService.check(session.user.id);
    const checkTime = Date.now() - startTime;
    
    console.log('[API] ✅ Force refresh completed:', {
      userId: session.user.id,
      allowed: quota.allowed,
      requestsRemaining: quota.requestsRemaining,
      tokensRemaining: quota.tokensRemaining,
      checkTime: `${checkTime}ms`,
    });
    
    return successResponse(quota, 200, {
      checkTime,
      cached: false,
      forceRefresh: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] ❌ Force refresh failed:', error);
    
    return errorResponse(
      'QUOTA_REFRESH_FAILED',
      'Failed to refresh quota. Please try again.',
      500
    );
  }
}

/**
 * PUT /api/quota/check
 * Admin endpoint to manually adjust user quota
 */
export async function PUT(request: NextRequest) {
  console.log('[API] PUT /api/quota/check - Admin quota adjustment');
  
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // Admin check (implement your admin logic)
    const isAdmin = session.user.role === 'admin' || session.user.email?.endsWith('@chandrahoro.com');
    if (!isAdmin) {
      return errorResponse(
        'ADMIN_REQUIRED',
        'Admin access required for quota adjustments',
        403
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { userId, adjustment } = body;
    
    if (!userId || !adjustment) {
      return errorResponse(
        'INVALID_REQUEST',
        'userId and adjustment are required',
        400
      );
    }
    
    console.log('[API] Admin quota adjustment:', {
      adminId: session.user.id,
      targetUserId: userId,
      adjustment,
    });
    
    // Apply quota adjustment
    await quotaService.adjustQuota(userId, adjustment, session.user.id);
    
    // Get updated quota
    const updatedQuota = await quotaService.check(userId);
    
    console.log('[API] ✅ Quota adjustment completed:', {
      userId,
      newLimits: {
        requests: updatedQuota.dailyRequestLimit,
        tokens: updatedQuota.dailyTokenLimit,
      },
    });
    
    return successResponse({
      message: 'Quota adjusted successfully',
      userId,
      adjustment,
      updatedQuota,
    }, 200, {
      adminId: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] ❌ Quota adjustment failed:', error);
    
    return errorResponse(
      'QUOTA_ADJUSTMENT_FAILED',
      'Failed to adjust quota. Please try again.',
      500
    );
  }
}

/**
 * OPTIONS /api/quota/check
 * CORS preflight and endpoint information
 */
export async function OPTIONS(request: NextRequest) {
  return Response.json({
    methods: ['GET', 'POST', 'PUT'],
    description: 'AI quota checking and management',
    endpoints: {
      'GET': 'Check current quota status',
      'POST': 'Force refresh quota check',
      'PUT': 'Admin quota adjustment (admin only)',
    },
    rateLimit: {
      'GET': '60 requests per minute',
      'POST': '10 requests per minute',
      'PUT': '5 requests per minute (admin only)',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
