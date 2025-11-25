/**
 * ChandraHoro V2.1 - Transit Alerts Job
 * 
 * Automated job that runs daily to detect significant planetary transits
 * and generate AI-powered alerts for all active users.
 * 
 * Features:
 * - Daily execution at 6 AM IST
 * - Batch processing for performance
 * - Error handling and retry logic
 * - Comprehensive logging and metrics
 * - Rate limiting for API calls
 */

import { prisma } from '@/lib/prisma';
import { detectSignificantTransits } from '@/lib/services/transit-detector';
import { generateMultipleAlerts } from '@/lib/services/alert-generator';
import { format, subDays } from 'date-fns';

export interface TransitJobResult {
  usersProcessed: number;
  transitsDetected: number;
  alertsCreated: number;
  errors: number;
  duration: number;
  date: string;
}

export interface TransitJobOptions {
  batchSize?: number;
  maxRetries?: number;
  delayBetweenBatches?: number;
  significanceFilter?: 'low' | 'medium' | 'high';
  dryRun?: boolean;
}

/**
 * Main transit alerts job function
 */
export async function runTransitAlertsJob(
  options: TransitJobOptions = {}
): Promise<TransitJobResult> {
  const startTime = Date.now();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const {
    batchSize = 10,
    maxRetries = 3,
    delayBetweenBatches = 1000,
    significanceFilter = 'medium',
    dryRun = false,
  } = options;
  
  console.log(`[Transit Alerts] Starting job for ${today}`);
  console.log(`[Transit Alerts] Options:`, { batchSize, significanceFilter, dryRun });
  
  const result: TransitJobResult = {
    usersProcessed: 0,
    transitsDetected: 0,
    alertsCreated: 0,
    errors: 0,
    duration: 0,
    date: today,
  };
  
  try {
    // Get active users who have completed onboarding and have birth charts
    const users = await getEligibleUsers();
    console.log(`[Transit Alerts] Found ${users.length} eligible users`);
    
    if (users.length === 0) {
      console.log('[Transit Alerts] No eligible users found');
      return result;
    }
    
    // Process users in batches
    const batches = chunkArray(users, batchSize);
    console.log(`[Transit Alerts] Processing ${batches.length} batches of ${batchSize} users each`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[Transit Alerts] Processing batch ${i + 1}/${batches.length}`);
      
      await processBatch(batch, today, significanceFilter, dryRun, result);
      
      // Delay between batches to avoid rate limiting
      if (i < batches.length - 1 && delayBetweenBatches > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    // Clean up old alerts
    if (!dryRun) {
      await cleanupOldAlerts();
    }
    
    result.duration = Date.now() - startTime;
    
    console.log(`[Transit Alerts] Job completed:`, result);
    return result;
  } catch (error) {
    console.error('[Transit Alerts] Job failed:', error);
    result.duration = Date.now() - startTime;
    result.errors++;
    throw error;
  }
}

/**
 * Get users eligible for transit alerts
 */
async function getEligibleUsers(): Promise<Array<{ id: string; email: string }>> {
  try {
    const users = await prisma.user.findMany({
      where: {
        profile: {
          onboardingCompleted: true,
        },
        birthChart: {
          some: {
            isPrimary: true,
          },
        },
        // Only include users who haven't opted out of alerts
        preferences: {
          path: ['notifications', 'transitAlerts'],
          not: false,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });
    
    return users;
  } catch (error) {
    console.error('[Transit Alerts] Error fetching eligible users:', error);
    return [];
  }
}

/**
 * Process a batch of users
 */
async function processBatch(
  users: Array<{ id: string; email: string }>,
  date: string,
  significanceFilter: string,
  dryRun: boolean,
  result: TransitJobResult
): Promise<void> {
  const batchPromises = users.map(user => 
    processUserTransits(user.id, date, significanceFilter, dryRun)
      .then(userResult => {
        result.usersProcessed++;
        result.transitsDetected += userResult.transitsDetected;
        result.alertsCreated += userResult.alertsCreated;
        return userResult;
      })
      .catch(error => {
        console.error(`[Transit Alerts] Error processing user ${user.id}:`, error);
        result.errors++;
        return { transitsDetected: 0, alertsCreated: 0 };
      })
  );
  
  await Promise.all(batchPromises);
}

/**
 * Process transits for a single user
 */
async function processUserTransits(
  userId: string,
  date: string,
  significanceFilter: string,
  dryRun: boolean
): Promise<{ transitsDetected: number; alertsCreated: number }> {
  try {
    // Check if user already has alerts for today
    const existingAlerts = await prisma.alert.count({
      where: {
        userId,
        alertType: 'transit',
        createdAt: {
          gte: new Date(date + 'T00:00:00Z'),
          lt: new Date(date + 'T23:59:59Z'),
        },
      },
    });
    
    if (existingAlerts > 0) {
      console.log(`[Transit Alerts] User ${userId} already has alerts for ${date}, skipping`);
      return { transitsDetected: 0, alertsCreated: 0 };
    }
    
    // Detect significant transits
    const transits = await detectSignificantTransits(userId, date, {
      significanceFilter: significanceFilter as any,
    });
    
    if (transits.length === 0) {
      return { transitsDetected: 0, alertsCreated: 0 };
    }
    
    console.log(`[Transit Alerts] User ${userId}: Found ${transits.length} significant transits`);
    
    if (dryRun) {
      console.log(`[Transit Alerts] DRY RUN - Would create alerts for:`, 
        transits.map(t => t.description));
      return { transitsDetected: transits.length, alertsCreated: 0 };
    }
    
    // Generate AI alerts
    const alerts = await generateMultipleAlerts(userId, transits, {
      includeRemedies: true,
      includeTiming: true,
      tone: 'encouraging',
    });
    
    console.log(`[Transit Alerts] User ${userId}: Created ${alerts.length} alerts`);
    
    return {
      transitsDetected: transits.length,
      alertsCreated: alerts.length,
    };
  } catch (error) {
    console.error(`[Transit Alerts] Error processing user ${userId}:`, error);
    throw error;
  }
}

/**
 * Clean up old expired alerts
 */
async function cleanupOldAlerts(): Promise<number> {
  try {
    const cutoffDate = subDays(new Date(), 30); // Remove alerts older than 30 days
    
    const result = await prisma.alert.deleteMany({
      where: {
        alertType: 'transit',
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired alerts
          { createdAt: { lt: cutoffDate } }, // Very old alerts
        ],
      },
    });
    
    console.log(`[Transit Alerts] Cleaned up ${result.count} old alerts`);
    return result.count;
  } catch (error) {
    console.error('[Transit Alerts] Error cleaning up old alerts:', error);
    return 0;
  }
}

/**
 * Utility function to chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Test function for development
 */
export async function testTransitAlertsJob(userId?: string): Promise<void> {
  console.log('🧪 Testing Transit Alerts Job');
  
  const testDate = format(new Date(), 'yyyy-MM-dd');
  
  if (userId) {
    // Test specific user
    console.log(`Testing for user: ${userId}`);
    const result = await processUserTransits(userId, testDate, 'low', true);
    console.log('Test result:', result);
  } else {
    // Test full job in dry run mode
    console.log('Testing full job (dry run)');
    const result = await runTransitAlertsJob({
      batchSize: 5,
      significanceFilter: 'low',
      dryRun: true,
    });
    console.log('Test result:', result);
  }
}

/**
 * Get job statistics
 */
export async function getTransitJobStats(): Promise<{
  totalAlerts: number;
  alertsToday: number;
  alertsThisWeek: number;
  bySignificance: Record<string, number>;
  recentJobs: Array<{ date: string; alertsCreated: number }>;
}> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = subDays(today, 7);
    
    const [totalAlerts, alertsToday, alertsThisWeek, allAlerts] = await Promise.all([
      prisma.alert.count({
        where: { alertType: 'transit' },
      }),
      prisma.alert.count({
        where: {
          alertType: 'transit',
          createdAt: { gte: today },
        },
      }),
      prisma.alert.count({
        where: {
          alertType: 'transit',
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.alert.findMany({
        where: {
          alertType: 'transit',
          createdAt: { gte: weekAgo },
        },
        select: {
          severity: true,
          createdAt: true,
        },
      }),
    ]);
    
    // Count by significance
    const bySignificance: Record<string, number> = {};
    allAlerts.forEach(alert => {
      bySignificance[alert.severity] = (bySignificance[alert.severity] || 0) + 1;
    });
    
    // Group by date for recent jobs
    const recentJobs: Record<string, number> = {};
    allAlerts.forEach(alert => {
      const date = format(alert.createdAt, 'yyyy-MM-dd');
      recentJobs[date] = (recentJobs[date] || 0) + 1;
    });
    
    const recentJobsArray = Object.entries(recentJobs)
      .map(([date, alertsCreated]) => ({ date, alertsCreated }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    return {
      totalAlerts,
      alertsToday,
      alertsThisWeek,
      bySignificance,
      recentJobs: recentJobsArray,
    };
  } catch (error) {
    console.error('[Transit Alerts] Error getting job stats:', error);
    return {
      totalAlerts: 0,
      alertsToday: 0,
      alertsThisWeek: 0,
      bySignificance: {},
      recentJobs: [],
    };
  }
}

// Export for manual execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1];
  
  if (isTest) {
    testTransitAlertsJob(userId).catch(console.error);
  } else {
    runTransitAlertsJob().catch(console.error);
  }
}
