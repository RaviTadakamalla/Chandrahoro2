/**
 * ChandraHoro V2.1 - Daily Quota Reset Job
 * 
 * Automated job to reset user quotas at midnight IST (18:30 UTC) daily.
 * Handles bulk quota resets with error handling and logging.
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/reset-quota",
 *     "schedule": "30 18 * * *"
 *   }]
 * }
 * 
 * Features:
 * - Bulk quota reset processing
 * - Error handling and recovery
 * - Performance monitoring
 * - Audit logging
 * - Graceful failure handling
 */

import { prisma } from '@/lib/prisma';
import { quotaService } from '@/lib/ai/quota';

export interface QuotaResetResult {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
  duration: number;
  totalUsers: number;
}

/**
 * Main quota reset job function
 * Resets quotas for all users whose reset time has passed
 */
export async function runQuotaResetJob(): Promise<QuotaResetResult> {
  const startTime = Date.now();
  console.log('[CRON] Starting daily quota reset job...');
  
  try {
    // Get all users whose quota needs reset
    const now = new Date();
    const entitlements = await prisma.entitlement.findMany({
      where: {
        quotaResetAt: {
          lte: now,
        },
      },
      select: { 
        userId: true,
        planType: true,
        dailyRequestsUsed: true,
        dailyTokensUsed: true,
      },
    });
    
    console.log(`[CRON] Found ${entitlements.length} users to reset`);
    
    // Initialize results tracking
    const results: QuotaResetResult = {
      success: 0,
      failed: 0,
      errors: [],
      duration: 0,
      totalUsers: entitlements.length,
    };
    
    // Process resets in batches to avoid overwhelming the database
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < entitlements.length; i += batchSize) {
      batches.push(entitlements.slice(i, i + batchSize));
    }
    
    console.log(`[CRON] Processing ${batches.length} batches of ${batchSize} users each`);
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[CRON] Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Process batch in parallel for better performance
      const batchPromises = batch.map(async ({ userId, planType, dailyRequestsUsed, dailyTokensUsed }) => {
        try {
          await quotaService.reset(userId);
          
          console.log(`[CRON] ✅ Reset user ${userId} (${planType}): ${dailyRequestsUsed} requests, ${dailyTokensUsed} tokens`);
          
          return { success: true, userId };
        } catch (error: any) {
          console.error(`[CRON] ❌ Failed to reset user ${userId}:`, error.message);
          
          return { 
            success: false, 
            userId, 
            error: error.message 
          };
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process batch results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { success, userId, error } = result.value;
          
          if (success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ userId, error: error || 'Unknown error' });
          }
        } else {
          // Promise rejection
          const userId = batch[index].userId;
          results.failed++;
          results.errors.push({ 
            userId, 
            error: `Promise rejected: ${result.reason}` 
          });
        }
      });
      
      // Small delay between batches to avoid overwhelming the system
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const duration = Date.now() - startTime;
    results.duration = duration;
    
    console.log('[CRON] Quota reset complete:', {
      duration: `${duration}ms`,
      successRate: `${((results.success / results.totalUsers) * 100).toFixed(1)}%`,
      ...results,
    });
    
    // Log execution to database for audit trail
    await logCronExecution({
      jobName: 'quota_reset',
      executedAt: now,
      durationMs: duration,
      results,
    });
    
    // Send alerts if there were significant failures
    if (results.failed > 0) {
      await handleResetFailures(results);
    }
    
    return results;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('[CRON] Quota reset job failed:', error);
    
    // Log critical failure
    await logCronExecution({
      jobName: 'quota_reset',
      executedAt: new Date(),
      durationMs: duration,
      results: null,
      error: error.message,
    });
    
    throw error;
  }
}

/**
 * Log cron job execution for audit and monitoring
 */
async function logCronExecution(data: {
  jobName: string;
  executedAt: Date;
  durationMs: number;
  results: QuotaResetResult | null;
  error?: string;
}): Promise<void> {
  try {
    // For now, just log to console
    // In production, you might want to log to a dedicated table or external service
    console.log('[CRON] Execution logged:', {
      ...data,
      timestamp: data.executedAt.toISOString(),
    });
    
    // Optional: Store in database
    // await prisma.cronLog.create({
    //   data: {
    //     jobName: data.jobName,
    //     executedAt: data.executedAt,
    //     durationMs: data.durationMs,
    //     success: !data.error,
    //     results: data.results ? JSON.stringify(data.results) : null,
    //     error: data.error,
    //   },
    // });
  } catch (error: any) {
    console.error('[CRON] Failed to log execution:', error);
    // Don't throw - logging failure shouldn't break the job
  }
}

/**
 * Handle reset failures by sending alerts or retrying
 */
async function handleResetFailures(results: QuotaResetResult): Promise<void> {
  try {
    const failureRate = (results.failed / results.totalUsers) * 100;
    
    console.warn(`[CRON] ⚠️  Quota reset failures detected: ${results.failed}/${results.totalUsers} (${failureRate.toFixed(1)}%)`);
    
    // Log detailed error information
    results.errors.forEach(({ userId, error }) => {
      console.error(`[CRON] User ${userId} reset failed: ${error}`);
    });
    
    // If failure rate is high, send alert
    if (failureRate > 10) {
      console.error(`[CRON] 🚨 HIGH FAILURE RATE: ${failureRate.toFixed(1)}% of quota resets failed`);
      
      // In production, send alert to monitoring system
      // await sendAlert({
      //   type: 'quota_reset_high_failure',
      //   message: `${failureRate.toFixed(1)}% of quota resets failed`,
      //   details: results.errors,
      // });
    }
    
    // Optionally retry failed resets
    if (results.failed < 10) {
      console.log('[CRON] Attempting to retry failed resets...');
      await retryFailedResets(results.errors);
    }
  } catch (error: any) {
    console.error('[CRON] Failed to handle reset failures:', error);
  }
}

/**
 * Retry failed quota resets
 */
async function retryFailedResets(errors: Array<{ userId: string; error: string }>): Promise<void> {
  console.log(`[CRON] Retrying ${errors.length} failed resets...`);
  
  let retrySuccess = 0;
  let retryFailed = 0;
  
  for (const { userId } of errors) {
    try {
      await quotaService.reset(userId);
      retrySuccess++;
      console.log(`[CRON] ✅ Retry successful for user ${userId}`);
    } catch (error: any) {
      retryFailed++;
      console.error(`[CRON] ❌ Retry failed for user ${userId}:`, error.message);
    }
  }
  
  console.log(`[CRON] Retry complete: ${retrySuccess} success, ${retryFailed} failed`);
}

/**
 * Get quota reset statistics for monitoring
 */
export async function getQuotaResetStats(): Promise<{
  usersNeedingReset: number;
  lastResetTime: Date | null;
  nextScheduledReset: Date;
}> {
  const now = new Date();
  
  // Count users needing reset
  const usersNeedingReset = await prisma.entitlement.count({
    where: {
      quotaResetAt: {
        lte: now,
      },
    },
  });
  
  // Get last reset time (approximate)
  const lastReset = await prisma.entitlement.findFirst({
    where: {
      quotaResetAt: {
        gt: now,
      },
    },
    orderBy: {
      quotaResetAt: 'asc',
    },
    select: {
      quotaResetAt: true,
    },
  });
  
  // Calculate next scheduled reset (midnight IST)
  const nextReset = new Date();
  nextReset.setUTCHours(18, 30, 0, 0); // 18:30 UTC = 00:00 IST
  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }
  
  return {
    usersNeedingReset,
    lastResetTime: lastReset ? new Date(lastReset.quotaResetAt.getTime() - 24 * 60 * 60 * 1000) : null,
    nextScheduledReset: nextReset,
  };
}
