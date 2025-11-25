/**
 * ChandraHoro V2.1 - Quota Reset Cron Endpoint
 * 
 * API endpoint for automated daily quota reset job.
 * Called by Vercel Cron at midnight IST (18:30 UTC) daily.
 * 
 * Security:
 * - Requires CRON_SECRET environment variable
 * - Only accepts requests from Vercel cron service
 * 
 * Monitoring:
 * - Logs execution results
 * - Returns detailed statistics
 * - Handles errors gracefully
 */

import { NextRequest } from 'next/server';
import { runQuotaResetJob, getQuotaResetStats } from '@/scripts/quota-reset-job';

/**
 * POST /api/cron/reset-quota
 * Executes the daily quota reset job
 */
export async function POST(request: NextRequest) {
  console.log('[CRON API] Quota reset job triggered');
  
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('[CRON API] ❌ CRON_SECRET not configured');
      return Response.json(
        { 
          success: false, 
          error: 'Cron secret not configured' 
        }, 
        { status: 500 }
      );
    }
    
    if (authHeader !== expectedAuth) {
      console.error('[CRON API] ❌ Unauthorized cron request');
      return Response.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        }, 
        { status: 401 }
      );
    }
    
    // Additional security: Check User-Agent for Vercel cron
    const userAgent = request.headers.get('user-agent');
    if (userAgent && !userAgent.includes('vercel')) {
      console.warn('[CRON API] ⚠️  Unexpected User-Agent:', userAgent);
    }
    
    console.log('[CRON API] ✅ Authorization verified, starting quota reset...');
    
    // Execute the quota reset job
    const startTime = Date.now();
    const result = await runQuotaResetJob();
    const totalTime = Date.now() - startTime;
    
    console.log('[CRON API] ✅ Quota reset job completed:', {
      totalTime: `${totalTime}ms`,
      ...result,
    });
    
    // Return success response with detailed results
    return Response.json({
      success: true,
      result: {
        ...result,
        totalExecutionTime: totalTime,
        timestamp: new Date().toISOString(),
      },
      meta: {
        jobName: 'quota_reset',
        executedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    console.error('[CRON API] ❌ Quota reset job failed:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      meta: {
        jobName: 'quota_reset',
        failedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}

/**
 * GET /api/cron/reset-quota
 * Get quota reset statistics and status
 */
export async function GET(request: NextRequest) {
  console.log('[CRON API] Quota reset stats requested');
  
  try {
    // Verify authorization (same as POST)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      return Response.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        }, 
        { status: 401 }
      );
    }
    
    // Get current quota reset statistics
    const stats = await getQuotaResetStats();
    
    console.log('[CRON API] ✅ Quota reset stats retrieved:', stats);
    
    return Response.json({
      success: true,
      data: {
        ...stats,
        currentTime: new Date().toISOString(),
        timezone: 'IST (UTC+5:30)',
      },
      meta: {
        endpoint: 'quota_reset_stats',
        requestedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[CRON API] ❌ Failed to get quota reset stats:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      meta: {
        endpoint: 'quota_reset_stats',
        failedAt: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}

/**
 * PUT /api/cron/reset-quota
 * Manual quota reset trigger (admin only)
 */
export async function PUT(request: NextRequest) {
  console.log('[CRON API] Manual quota reset triggered');
  
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      return Response.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        }, 
        { status: 401 }
      );
    }
    
    // Parse request body for options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch (error) {
      // No body or invalid JSON - use defaults
    }
    
    console.log('[CRON API] Manual reset options:', options);
    
    // Execute manual quota reset
    const startTime = Date.now();
    const result = await runQuotaResetJob();
    const totalTime = Date.now() - startTime;
    
    console.log('[CRON API] ✅ Manual quota reset completed:', {
      totalTime: `${totalTime}ms`,
      ...result,
    });
    
    return Response.json({
      success: true,
      result: {
        ...result,
        totalExecutionTime: totalTime,
        timestamp: new Date().toISOString(),
        trigger: 'manual',
      },
      meta: {
        jobName: 'quota_reset_manual',
        executedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    console.error('[CRON API] ❌ Manual quota reset failed:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      meta: {
        jobName: 'quota_reset_manual',
        failedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/cron/reset-quota
 * CORS preflight and endpoint information
 */
export async function OPTIONS(request: NextRequest) {
  return Response.json({
    methods: ['GET', 'POST', 'PUT'],
    description: 'Quota reset cron job endpoint',
    schedule: '30 18 * * * (Daily at midnight IST)',
    authentication: 'Bearer token required',
    endpoints: {
      'POST': 'Execute quota reset job',
      'GET': 'Get quota reset statistics',
      'PUT': 'Manual quota reset trigger',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
