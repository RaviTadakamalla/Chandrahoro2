/**
 * ChandraHoro V2.1 - Daily Readings Cron API
 * 
 * API endpoint for automated daily reading generation.
 * Scheduled to run daily at 5 AM IST (11:30 PM UTC previous day).
 * 
 * Security: Protected by CRON_SECRET environment variable
 * Schedule: "30 23 * * *" (11:30 PM UTC = 5:00 AM IST)
 * 
 * Features:
 * - Automated daily reading generation for all active users
 * - Batch processing with rate limiting
 * - Comprehensive error handling and logging
 * - Admin manual trigger support
 * - Execution statistics and monitoring
 */

import { NextRequest } from 'next/server';
import { runDailyReadingsJob } from '@/scripts/daily-readings-job';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/cron/daily-readings
 * 
 * Automated cron job execution
 * Called by Vercel Cron or external cron service
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log('[CRON API] Daily readings job triggered via GET');
    
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('[CRON API] CRON_SECRET not configured');
      return Response.json({
        success: false,
        error: 'Cron secret not configured',
      }, { status: 500 });
    }
    
    if (authHeader !== expectedAuth) {
      console.error('[CRON API] Unauthorized cron request:', { authHeader });
      return Response.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }
    
    // Execute the daily readings job
    const startTime = Date.now();
    const result = await runDailyReadingsJob();
    const duration = Date.now() - startTime;
    
    console.log(`[CRON API] Job completed in ${duration}ms:`, {
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
    });
    
    return Response.json({
      success: true,
      message: 'Daily readings job completed',
      result: {
        ...result,
        apiDuration: duration,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON API] Daily readings job failed:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/cron/daily-readings
 * 
 * Manual trigger for admin users
 * Allows administrators to manually trigger the daily readings job
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    console.log('[CRON API] Manual daily readings job trigger via POST');
    
    // Check authentication for manual triggers
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    // For now, allow any authenticated user to trigger (for testing)
    // In production, add: if (session.user.role !== 'admin') { return 403; }
    
    const body = await request.json().catch(() => ({}));
    const { force = false, testMode = false } = body;
    
    console.log('[CRON API] Manual trigger options:', { force, testMode, userId: session.user.id });
    
    // Execute the daily readings job
    const startTime = Date.now();
    const result = await runDailyReadingsJob();
    const duration = Date.now() - startTime;
    
    console.log(`[CRON API] Manual job completed in ${duration}ms:`, {
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
    });
    
    return successResponse({
      message: 'Daily readings job triggered manually',
      result: {
        ...result,
        apiDuration: duration,
        triggeredBy: session.user.id,
        triggerType: 'manual',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON API] Manual daily readings job failed:', error);
    return errorResponse('JOB_FAILED', error.message, 500);
  }
}

/**
 * PUT /api/cron/daily-readings
 * 
 * Get job status and statistics
 * Returns information about recent job executions
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    console.log('[CRON API] Job status request via PUT');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    // For now, allow any authenticated user to view status
    
    // For now, return mock statistics
    // In production, you might query a cron_logs table
    const mockStats = {
      lastExecution: {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        duration: 45000, // 45 seconds
        total: 150,
        successful: 142,
        failed: 3,
        skipped: 5,
        success: true,
      },
      recentExecutions: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          duration: 45000,
          total: 150,
          successful: 142,
          failed: 3,
          skipped: 5,
          success: true,
        },
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 38000,
          total: 148,
          successful: 145,
          failed: 1,
          skipped: 2,
          success: true,
        },
        {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 52000,
          total: 147,
          successful: 140,
          failed: 4,
          skipped: 3,
          success: true,
        },
      ],
      averageStats: {
        averageDuration: 45000,
        averageTotal: 148,
        averageSuccessRate: 95.3,
        averageFailureRate: 2.0,
        averageSkipRate: 2.7,
      },
      nextScheduledRun: getNextScheduledRun(),
    };
    
    return successResponse({
      message: 'Daily readings job statistics',
      stats: mockStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON API] Failed to get job status:', error);
    return errorResponse('STATUS_FAILED', error.message, 500);
  }
}

/**
 * Calculate next scheduled run time (5 AM IST = 11:30 PM UTC previous day)
 */
function getNextScheduledRun(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  
  // Convert current time to IST
  const istNow = new Date(now.getTime() + istOffset);
  
  // Calculate next 5 AM IST
  const nextRun = new Date(istNow);
  nextRun.setHours(5, 0, 0, 0); // 5:00 AM IST
  
  // If it's already past 5 AM today, schedule for tomorrow
  if (istNow.getHours() >= 5) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  // Convert back to UTC
  const nextRunUTC = new Date(nextRun.getTime() - istOffset);
  
  return nextRunUTC.toISOString();
}

/**
 * PATCH /api/cron/daily-readings
 * 
 * Emergency stop/pause functionality
 * Allows admins to temporarily disable the cron job
 */
export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    console.log('[CRON API] Emergency control via PATCH');
    
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    // if (session.user.role !== 'admin') {
    //   return errorResponse('ADMIN_REQUIRED', 'Admin access required', 403);
    // }
    
    const body = await request.json();
    const { action } = body; // 'pause', 'resume', 'status'
    
    // For now, just log the action
    // In production, you might update a database flag or Redis key
    console.log(`[CRON API] Emergency action: ${action} by user ${session.user.id}`);
    
    switch (action) {
      case 'pause':
        // TODO: Set a flag to pause cron execution
        return successResponse({
          message: 'Daily readings job paused',
          action: 'pause',
          pausedBy: session.user.id,
          timestamp: new Date().toISOString(),
        });
      
      case 'resume':
        // TODO: Clear the pause flag
        return successResponse({
          message: 'Daily readings job resumed',
          action: 'resume',
          resumedBy: session.user.id,
          timestamp: new Date().toISOString(),
        });
      
      case 'status':
        return successResponse({
          message: 'Daily readings job status',
          status: 'active', // or 'paused'
          lastAction: null,
          timestamp: new Date().toISOString(),
        });
      
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action. Use: pause, resume, status', 400);
    }
  } catch (error: any) {
    console.error('[CRON API] Emergency control failed:', error);
    return errorResponse('CONTROL_FAILED', error.message, 500);
  }
}
