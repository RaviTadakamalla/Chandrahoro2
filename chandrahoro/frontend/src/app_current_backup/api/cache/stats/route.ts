/**
 * ChandraHoro V2.1 - Cache Statistics API
 * 
 * API endpoint for cache monitoring, statistics, and management.
 * Provides insights into cache performance and health.
 * 
 * Endpoints:
 * - GET /api/cache/stats - Get cache statistics and health
 * - POST /api/cache/stats - Trigger cache operations (admin only)
 * - DELETE /api/cache/stats - Clear cache statistics
 * 
 * Features:
 * - Real-time cache metrics
 * - Cache health monitoring
 * - Admin cache management
 * - Performance analytics
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readingCache, getCacheStats } from '@/lib/cache/reading-cache';
import { cacheInvalidation, getCacheHealth } from '@/lib/cache/cache-invalidation';
import { successResponse, errorResponse } from '@/lib/api/response';

// GET /api/cache/stats - Get cache statistics
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const includeDebug = searchParams.get('debug') === 'true';
    
    // Get general cache statistics
    const [cacheStats, cacheHealth] = await Promise.all([
      getCacheStats(),
      getCacheHealth(),
    ]);
    
    const response: any = {
      stats: cacheStats,
      health: cacheHealth,
      timestamp: new Date().toISOString(),
    };
    
    // Add user-specific debug info if requested
    if (userId && includeDebug) {
      const debugInfo = await readingCache.getDebugInfo(userId);
      response.userDebug = {
        userId,
        ...debugInfo,
      };
    }
    
    // Add performance metrics
    response.performance = {
      hitRate: cacheStats.hitRate,
      totalRequests: cacheStats.totalRequests,
      efficiency: cacheStats.totalRequests > 0 ? 
        ((cacheStats.hits / cacheStats.totalRequests) * 100).toFixed(2) + '%' : '0%',
    };
    
    return successResponse(response, 200);
  } catch (error: any) {
    console.error('[CacheStatsAPI] Error getting cache stats:', error);
    return errorResponse('STATS_ERROR', error.message, 500);
  }
}

// POST /api/cache/stats - Trigger cache operations
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const body = await request.json();
    const { action, userId, date, dryRun = false } = body;
    
    let result: any = {};
    
    switch (action) {
      case 'invalidate_user':
        if (!userId) {
          return errorResponse('MISSING_PARAM', 'userId is required for user invalidation', 400);
        }
        result = await cacheInvalidation.invalidateUserCache(userId, { dryRun });
        break;
        
      case 'cleanup_old':
        const maxAge = body.maxAge || 30;
        result = await cacheInvalidation.cleanupOldEntries(maxAge, { dryRun });
        break;
        
      case 'warm_cache':
        if (!userId) {
          return errorResponse('MISSING_PARAM', 'userId is required for cache warming', 400);
        }
        const days = body.days || 7;
        result = await cacheInvalidation.warmUserCache(userId, { userId, days });
        break;
        
      case 'refresh_reading':
        if (!userId || !date) {
          return errorResponse('MISSING_PARAM', 'userId and date are required for refresh', 400);
        }
        result = await cacheInvalidation.refreshCache(userId, date, body.force || false);
        break;
        
      case 'get_user_debug':
        if (!userId) {
          return errorResponse('MISSING_PARAM', 'userId is required for debug info', 400);
        }
        result = await readingCache.getDebugInfo(userId);
        break;
        
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
    
    return successResponse(result, 200, {
      action,
      dryRun,
      executedBy: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CacheStatsAPI] Error executing cache operation:', error);
    return errorResponse('OPERATION_ERROR', error.message, 500);
  }
}

// DELETE /api/cache/stats - Reset cache statistics
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm') === 'true';
    
    if (!confirm) {
      return errorResponse(
        'CONFIRMATION_REQUIRED',
        'Add ?confirm=true to reset statistics',
        400
      );
    }
    
    // Reset cache statistics
    await readingCache.resetStats();
    
    return successResponse({ reset: true }, 200, {
      message: 'Cache statistics reset successfully',
      resetBy: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CacheStatsAPI] Error resetting cache stats:', error);
    return errorResponse('RESET_ERROR', error.message, 500);
  }
}

// PATCH /api/cache/stats - Emergency cache operations
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const body = await request.json();
    const { operation, pattern, confirm } = body;
    
    if (operation === 'emergency_flush') {
      if (!confirm) {
        return errorResponse(
          'CONFIRMATION_REQUIRED',
          'Emergency flush requires explicit confirmation',
          400
        );
      }
      
      const flushPattern = pattern || 'reading:*';
      
      console.warn(`[CacheStatsAPI] Emergency flush initiated by ${session.user.id}: ${flushPattern}`);
      
      const result = await cacheInvalidation.emergencyFlush(flushPattern, true);
      
      return successResponse(result, 200, {
        operation: 'emergency_flush',
        pattern: flushPattern,
        executedBy: session.user.id,
        timestamp: new Date().toISOString(),
        warning: 'Emergency flush completed - cache data has been permanently deleted',
      });
    }
    
    return errorResponse('INVALID_OPERATION', 'Invalid emergency operation', 400);
  } catch (error: any) {
    console.error('[CacheStatsAPI] Error in emergency operation:', error);
    return errorResponse('EMERGENCY_ERROR', error.message, 500);
  }
}
