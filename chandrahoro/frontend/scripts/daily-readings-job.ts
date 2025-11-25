/**
 * ChandraHoro V2.1 - Daily Readings Cron Job
 * 
 * Automated daily reading generation at 5 AM IST for all active users.
 * Processes users in batches with error handling, retries, and notifications.
 * 
 * Schedule: Daily at 5 AM IST (11:30 PM UTC previous day)
 * Batch Size: 10 users per batch to avoid rate limits
 * Retry Logic: Up to 3 attempts for failed generations
 * 
 * Features:
 * - Batch processing with rate limiting
 * - Comprehensive error handling and retries
 * - Notification sending after generation
 * - Execution monitoring and logging
 * - Admin alerting for high failure rates
 */

import { prisma } from '@/lib/prisma';
import { generateDailyReading } from '@/lib/services/daily-reading-service';
import { sendReadingNotification } from '@/lib/notifications/reading-notification';
import { format } from 'date-fns';

export interface DailyReadingsJobResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{
    userId: string;
    email: string;
    error: string;
    retryCount: number;
  }>;
  duration: number;
  executedAt: Date;
}

/**
 * Utility function to split array into chunks
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Utility function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main daily readings job function
 * Generates daily readings for all active users
 */
export async function runDailyReadingsJob(): Promise<DailyReadingsJobResult> {
  const startTime = Date.now();
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  
  console.log(`[CRON] Starting daily readings generation for ${dateStr}`);
  console.log(`[CRON] Time: ${new Date().toISOString()}`);
  
  try {
    // 1. Get all active users who need readings
    const users = await prisma.user.findMany({
      where: {
        profile: {
          onboardingCompleted: true,
          notificationPreferences: {
            path: ['daily_reading'],
            equals: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        profile: {
          select: {
            fullName: true,
            notificationPreferences: true,
          },
        },
      },
    });
    
    console.log(`[CRON] Found ${users.length} users to process`);
    
    const results: DailyReadingsJobResult = {
      total: users.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      duration: 0,
      executedAt: today,
    };
    
    // 2. Process in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    const batches = chunk(users, BATCH_SIZE);
    
    console.log(`[CRON] Processing ${batches.length} batches of ${BATCH_SIZE} users each`);
    
    for (const [index, batch] of batches.entries()) {
      console.log(`[CRON] Processing batch ${index + 1}/${batches.length}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(user => generateReadingForUser(user, today))
      );
      
      // Process batch results
      batchResults.forEach((result, i) => {
        const user = batch[i];
        
        if (result.status === 'fulfilled') {
          if (result.value.status === 'skipped') {
            results.skipped++;
            console.log(`[CRON] ⏭️  Skipped user ${user.id} (reading exists)`);
          } else {
            results.successful++;
            console.log(`[CRON] ✅ Generated reading for user ${user.id}`);
          }
        } else {
          results.failed++;
          results.errors.push({
            userId: user.id,
            email: user.email,
            error: result.reason.message,
            retryCount: result.reason.retryCount || 0,
          });
          console.error(`[CRON] ❌ Failed user ${user.id}: ${result.reason.message}`);
        }
      });
      
      // Wait 2 seconds between batches to avoid overwhelming the system
      if (index < batches.length - 1) {
        console.log(`[CRON] Waiting 2 seconds before next batch...`);
        await sleep(2000);
      }
    }
    
    const duration = Date.now() - startTime;
    results.duration = duration;
    
    console.log(`[CRON] Completed in ${duration}ms`, {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      skipped: results.skipped,
      errorCount: results.errors.length,
    });
    
    // 3. Log execution to database
    await logCronExecution({
      jobName: 'daily_readings',
      executedAt: today,
      durationMs: duration,
      results,
    });
    
    // 4. Alert admins if high failure rate (>10%)
    const failureRate = results.total > 0 ? (results.failed / results.total) * 100 : 0;
    if (failureRate > 10) {
      console.warn(`[CRON] ⚠️  High failure rate: ${failureRate.toFixed(1)}%`);
      await alertAdmins({
        subject: `High failure rate in daily readings job: ${failureRate.toFixed(1)}%`,
        results,
        errors: results.errors.slice(0, 10), // First 10 errors
      });
    }
    
    return results;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('[CRON] ❌ Daily readings job failed:', error);
    
    // Log critical failure
    await logCronExecution({
      jobName: 'daily_readings',
      executedAt: today,
      durationMs: duration,
      results: null,
      error: error.message,
    });
    
    throw error;
  }
}

/**
 * Generate reading for a single user with retry logic
 */
async function generateReadingForUser(
  user: any,
  date: Date,
  retryCount = 0
): Promise<{ status: string; userId: string; readingId?: string }> {
  try {
    console.log(`[CRON] Generating reading for user ${user.id} (attempt ${retryCount + 1})`);
    
    // Check if reading already exists for today
    const existing = await prisma.reading.findFirst({
      where: {
        userId: user.id,
        readingDate: date,
        readingType: 'daily',
      },
    });
    
    if (existing) {
      console.log(`[CRON] Reading already exists for user ${user.id}`);
      return { status: 'skipped', userId: user.id };
    }
    
    // Generate new reading
    const reading = await generateDailyReading({
      userId: user.id,
      date,
      forceRegenerate: false,
    });
    
    // Send notification after successful generation
    try {
      await sendReadingNotification(user, reading);
      console.log(`[CRON] ✅ Notification sent to user ${user.id}`);
    } catch (notificationError: any) {
      console.warn(`[CRON] ⚠️  Failed to send notification to user ${user.id}:`, notificationError.message);
      // Don't fail the entire operation for notification failures
    }
    
    console.log(`[CRON] ✅ Successfully generated reading for user ${user.id}`);
    
    return {
      status: 'success',
      userId: user.id,
      readingId: reading.id,
    };
  } catch (error: any) {
    console.error(`[CRON] Failed to generate reading for user ${user.id}:`, error.message);
    
    // Retry up to 3 times with exponential backoff
    if (retryCount < 3) {
      const backoffMs = Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
      console.log(`[CRON] Retrying user ${user.id} in ${backoffMs}ms (attempt ${retryCount + 1}/3)`);
      
      await sleep(backoffMs);
      return generateReadingForUser(user, date, retryCount + 1);
    }
    
    // Attach retry count to error for logging
    error.retryCount = retryCount;
    throw error;
  }
}

/**
 * Log cron job execution for monitoring and audit
 */
async function logCronExecution(data: {
  jobName: string;
  executedAt: Date;
  durationMs: number;
  results: DailyReadingsJobResult | null;
  error?: string;
}): Promise<void> {
  try {
    // For now, just log to console
    // In production, you might want to store this in a dedicated table
    console.log('[CRON] Execution log:', {
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
 * Alert administrators about job failures
 */
async function alertAdmins(data: {
  subject: string;
  results: DailyReadingsJobResult;
  errors: any[];
}): Promise<void> {
  try {
    console.error('[CRON] 🚨 ADMIN ALERT:', data.subject);
    console.error('[CRON] Results:', {
      total: data.results.total,
      successful: data.results.successful,
      failed: data.results.failed,
      skipped: data.results.skipped,
    });
    console.error('[CRON] Sample errors:', data.errors.slice(0, 5));
    
    // TODO: Implement email/Slack notification to admins
    // await sendEmail({
    //   to: 'admin@chandrahoro.com',
    //   subject: data.subject,
    //   template: 'admin-alert',
    //   data: {
    //     subject: data.subject,
    //     results: data.results,
    //     errors: data.errors,
    //     timestamp: new Date().toISOString(),
    //   },
    // });
  } catch (error: any) {
    console.error('[CRON] Failed to send admin alert:', error);
    // Don't throw - alert failure shouldn't break the job
  }
}
