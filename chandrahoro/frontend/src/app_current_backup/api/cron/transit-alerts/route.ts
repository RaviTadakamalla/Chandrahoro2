/**
 * ChandraHoro V2.1 - Transit Alerts Cron Job API
 * 
 * Cron endpoint for automated daily transit alerts generation.
 * Runs daily at 6 AM IST to detect significant transits and create alerts.
 * 
 * Features:
 * - Secure cron authentication
 * - Comprehensive error handling
 * - Performance monitoring
 * - Detailed logging and metrics
 */

import { NextRequest } from 'next/server';
import { runTransitAlertsJob, getTransitJobStats } from '@/scripts/transit-alerts-job';
import { successResponse, errorResponse } from '@/lib/api/response';

// GET /api/cron/transit-alerts - Run transit alerts job
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron authentication
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('[TransitAlertsCron] CRON_SECRET not configured');
      return errorResponse('CONFIG_ERROR', 'Cron secret not configured', 500);
    }
    
    if (authHeader !== expectedAuth) {
      console.warn('[TransitAlertsCron] Unauthorized cron request');
      return errorResponse('UNAUTHORIZED', 'Invalid cron authentication', 401);
    }
    
    // Get job options from query parameters
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batch_size') || '10');
    const significanceFilter = searchParams.get('significance') || 'medium';
    const dryRun = searchParams.get('dry_run') === 'true';
    const maxRetries = parseInt(searchParams.get('max_retries') || '3');
    
    console.log('[TransitAlertsCron] Starting transit alerts job');
    console.log('[TransitAlertsCron] Options:', {
      batchSize,
      significanceFilter,
      dryRun,
      maxRetries,
    });
    
    // Run the transit alerts job
    const result = await runTransitAlertsJob({
      batchSize,
      significanceFilter: significanceFilter as any,
      dryRun,
      maxRetries,
      delayBetweenBatches: 1000, // 1 second delay between batches
    });
    
    const duration = Date.now() - startTime;
    
    console.log('[TransitAlertsCron] Job completed successfully:', result);
    
    // Get additional statistics
    const stats = await getTransitJobStats();
    
    return successResponse({
      success: true,
      result,
      stats,
      performance: {
        duration,
        averageTimePerUser: result.usersProcessed > 0 ? duration / result.usersProcessed : 0,
      },
    }, 200, {
      message: `Transit alerts job completed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('[TransitAlertsCron] Job failed:', error);
    
    // Return error response but don't throw to avoid Vercel timeout issues
    return errorResponse('JOB_FAILED', error.message, 500, {
      duration,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

// POST /api/cron/transit-alerts - Manual job trigger (admin only)
export async function POST(request: NextRequest) {
  try {
    // This endpoint allows manual triggering by admins
    const body = await request.json();
    const { adminKey, ...options } = body;
    
    // Verify admin authentication
    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
      return errorResponse('UNAUTHORIZED', 'Invalid admin authentication', 401);
    }
    
    console.log('[TransitAlertsCron] Manual job trigger by admin');
    
    // Run job with custom options
    const result = await runTransitAlertsJob({
      batchSize: options.batchSize || 10,
      significanceFilter: options.significanceFilter || 'medium',
      dryRun: options.dryRun || false,
      maxRetries: options.maxRetries || 3,
      delayBetweenBatches: options.delayBetweenBatches || 500,
    });
    
    return successResponse({
      success: true,
      result,
      triggeredBy: 'admin',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[TransitAlertsCron] Manual job failed:', error);
    return errorResponse('MANUAL_JOB_FAILED', error.message, 500);
  }
}

// PUT /api/cron/transit-alerts - Update job configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, action } = body;
    
    // Verify admin authentication
    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
      return errorResponse('UNAUTHORIZED', 'Invalid admin authentication', 401);
    }
    
    switch (action) {
      case 'get_stats':
        const stats = await getTransitJobStats();
        return successResponse(stats);
      
      case 'test_single_user':
        const { userId } = body;
        if (!userId) {
          return errorResponse('INVALID_REQUEST', 'userId required for test', 400);
        }
        
        // Import test function
        const { testTransitAlertsJob } = await import('@/scripts/transit-alerts-job');
        await testTransitAlertsJob(userId);
        
        return successResponse({
          success: true,
          message: `Test completed for user ${userId}`,
        });
      
      case 'cleanup_old_alerts':
        const { prisma } = await import('@/lib/prisma');
        const { subDays } = await import('date-fns');
        
        const cutoffDate = subDays(new Date(), 30);
        const cleanupResult = await prisma.alert.deleteMany({
          where: {
            alertType: 'transit',
            OR: [
              { expiresAt: { lt: new Date() } },
              { createdAt: { lt: cutoffDate } },
            ],
          },
        });
        
        return successResponse({
          success: true,
          deleted: cleanupResult.count,
          message: `Cleaned up ${cleanupResult.count} old alerts`,
        });
      
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
  } catch (error: any) {
    console.error('[TransitAlertsCron] Admin action failed:', error);
    return errorResponse('ADMIN_ACTION_FAILED', error.message, 500);
  }
}

// OPTIONS - CORS support
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
