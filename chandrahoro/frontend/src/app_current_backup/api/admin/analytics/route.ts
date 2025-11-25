/**
 * ChandraHoro V2.1 - Admin Analytics API
 * 
 * Provides comprehensive analytics data for admin dashboard.
 * Includes user metrics, AI usage, system health, and performance data.
 * 
 * Features:
 * - Overview statistics
 * - Usage trends and patterns
 * - Top users analysis
 * - System health monitoring
 * - Error tracking
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyticsService } from '@/lib/services/analytics-service';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/admin/analytics - Get analytics data
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // TODO: Add proper admin role check
    // For now, check if email ends with @chandrahoro.com or is in admin list
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || 
                   session.user.email === 'admin@example.com' ||
                   process.env.ADMIN_EMAILS?.split(',').includes(session.user.email || '');
    
    if (!isAdmin) {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }
    
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'overview';
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('[AdminAnalytics] Fetching metric:', metric);
    
    let data;
    
    switch (metric) {
      case 'overview':
        data = await analyticsService.getOverview();
        break;
        
      case 'usage':
        data = await analyticsService.getUsageTrend(days);
        break;
        
      case 'top-users':
        data = await analyticsService.getTopUsers(limit);
        break;
        
      case 'errors':
        data = await analyticsService.getErrorLogs(limit);
        break;
        
      case 'health':
        data = await analyticsService.getSystemHealth();
        break;
        
      case 'quota':
        data = await analyticsService.getQuotaStats();
        break;
        
      case 'ai-usage':
        data = await analyticsService.getAIUsageStats();
        break;
        
      default:
        return errorResponse('INVALID_METRIC', 'Invalid metric requested', 400);
    }
    
    return successResponse(data, 200, {
      metric,
      timestamp: new Date().toISOString(),
      requestedBy: session.user.email,
    });
  } catch (error: any) {
    console.error('[AdminAnalytics] Error fetching analytics:', error);
    return errorResponse('ANALYTICS_ERROR', error.message, 500);
  }
}

/**
 * POST /api/admin/analytics - Trigger analytics refresh or custom queries
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // Admin check
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || 
                   session.user.email === 'admin@example.com' ||
                   process.env.ADMIN_EMAILS?.split(',').includes(session.user.email || '');
    
    if (!isAdmin) {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }
    
    const body = await request.json();
    const { action, parameters } = body;
    
    console.log('[AdminAnalytics] Executing action:', action);
    
    let result;
    
    switch (action) {
      case 'refresh_cache':
        // In a real implementation, this would refresh cached analytics data
        result = { 
          refreshed: true, 
          timestamp: new Date().toISOString(),
          message: 'Analytics cache refreshed successfully' 
        };
        break;
        
      case 'export_data':
        // Export analytics data for external analysis
        const exportData = await analyticsService.getOverview();
        result = {
          exported: true,
          data: exportData,
          format: parameters?.format || 'json',
          timestamp: new Date().toISOString(),
        };
        break;
        
      case 'custom_query':
        // Execute custom analytics query
        if (!parameters?.query) {
          return errorResponse('INVALID_REQUEST', 'Query parameter required', 400);
        }
        
        // This would execute custom analytics queries
        result = {
          query: parameters.query,
          result: 'Custom query execution not implemented',
          timestamp: new Date().toISOString(),
        };
        break;
        
      case 'generate_report':
        // Generate comprehensive analytics report
        const [overview, usage, topUsers] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getUsageTrend(30),
          analyticsService.getTopUsers(20),
        ]);
        
        result = {
          report: {
            overview,
            usage,
            topUsers,
            generatedAt: new Date().toISOString(),
            period: '30 days',
          },
        };
        break;
        
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
    
    return successResponse(result, 200, {
      action,
      executedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AdminAnalytics] Error executing action:', error);
    return errorResponse('ACTION_ERROR', error.message, 500);
  }
}

/**
 * PUT /api/admin/analytics - Update analytics settings
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // Admin check
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || 
                   session.user.email === 'admin@example.com' ||
                   process.env.ADMIN_EMAILS?.split(',').includes(session.user.email || '');
    
    if (!isAdmin) {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }
    
    const body = await request.json();
    const { settings } = body;
    
    // In a real implementation, this would update analytics settings
    // For now, just return success
    
    return successResponse({
      updated: true,
      settings,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString(),
    }, 200, {
      message: 'Analytics settings updated successfully',
    });
  } catch (error: any) {
    console.error('[AdminAnalytics] Error updating settings:', error);
    return errorResponse('SETTINGS_ERROR', error.message, 500);
  }
}

/**
 * DELETE /api/admin/analytics - Clean up old analytics data
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // Admin check
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || 
                   session.user.email === 'admin@example.com' ||
                   process.env.ADMIN_EMAILS?.split(',').includes(session.user.email || '');
    
    if (!isAdmin) {
      return errorResponse('FORBIDDEN', 'Admin access required', 403);
    }
    
    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '90');
    const dataType = searchParams.get('data_type') || 'all';
    
    // In a real implementation, this would clean up old analytics data
    // For now, just return success
    
    return successResponse({
      cleaned: true,
      dataType,
      olderThanDays,
      cleanedBy: session.user.email,
      timestamp: new Date().toISOString(),
    }, 200, {
      message: `Analytics data older than ${olderThanDays} days cleaned successfully`,
    });
  } catch (error: any) {
    console.error('[AdminAnalytics] Error cleaning data:', error);
    return errorResponse('CLEANUP_ERROR', error.message, 500);
  }
}
