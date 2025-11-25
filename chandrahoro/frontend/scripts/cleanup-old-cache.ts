/**
 * ChandraHoro V2.1 - Cache Cleanup Job
 * 
 * Automated cleanup script for old cache entries.
 * Removes reading cache entries older than 30 days to prevent memory bloat.
 * 
 * Usage:
 * - Manual: npx tsx scripts/cleanup-old-cache.ts
 * - Cron: Weekly via Vercel cron job
 * 
 * Features:
 * - Configurable cleanup age (default: 30 days)
 * - Dry run mode for testing
 * - Batch processing to avoid Redis overload
 * - Comprehensive logging and metrics
 * - Error handling and recovery
 */

import { redis } from '@/lib/redis/client';
import { cacheInvalidation, getCacheHealth } from '@/lib/cache/cache-invalidation';
import { subDays, format } from 'date-fns';

interface CleanupConfig {
  maxAge: number; // days
  dryRun: boolean;
  batchSize: number;
  logLevel: 'minimal' | 'detailed' | 'verbose';
}

interface CleanupMetrics {
  startTime: Date;
  endTime: Date;
  duration: number;
  totalKeysScanned: number;
  keysDeleted: number;
  memoryFreed: string;
  errors: string[];
  performance: {
    scanRate: number; // keys per second
    deleteRate: number; // keys per second
  };
}

/**
 * Main cleanup function
 */
export async function cleanupOldCache(config: Partial<CleanupConfig> = {}): Promise<CleanupMetrics> {
  const defaultConfig: CleanupConfig = {
    maxAge: 30,
    dryRun: false,
    batchSize: 100,
    logLevel: 'detailed',
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  console.log('🧹 Starting Cache Cleanup Job');
  console.log('=' .repeat(60));
  console.log(`Configuration:`);
  console.log(`  Max Age: ${finalConfig.maxAge} days`);
  console.log(`  Dry Run: ${finalConfig.dryRun}`);
  console.log(`  Batch Size: ${finalConfig.batchSize}`);
  console.log(`  Log Level: ${finalConfig.logLevel}`);
  console.log('=' .repeat(60));
  
  const startTime = new Date();
  const metrics: CleanupMetrics = {
    startTime,
    endTime: new Date(),
    duration: 0,
    totalKeysScanned: 0,
    keysDeleted: 0,
    memoryFreed: '0B',
    errors: [],
    performance: {
      scanRate: 0,
      deleteRate: 0,
    },
  };
  
  try {
    // Get initial cache health
    const initialHealth = await getCacheHealth();
    console.log(`\n📊 Initial Cache Health:`);
    console.log(`  Total Keys: ${initialHealth.totalKeys}`);
    console.log(`  Reading Keys: ${initialHealth.readingKeys}`);
    console.log(`  Memory Usage: ${initialHealth.memoryUsage}`);
    
    // Cleanup old reading entries
    console.log(`\n🔍 Scanning for entries older than ${finalConfig.maxAge} days...`);
    
    const readingCleanup = await cleanupReadingEntries(finalConfig);
    metrics.totalKeysScanned += readingCleanup.keysScanned;
    metrics.keysDeleted += readingCleanup.keysDeleted;
    metrics.errors.push(...readingCleanup.errors);
    
    // Cleanup orphaned list and latest caches
    console.log(`\n🔍 Cleaning up orphaned list and latest caches...`);
    
    const orphanCleanup = await cleanupOrphanedCaches(finalConfig);
    metrics.totalKeysScanned += orphanCleanup.keysScanned;
    metrics.keysDeleted += orphanCleanup.keysDeleted;
    metrics.errors.push(...orphanCleanup.errors);
    
    // Cleanup expired keys
    console.log(`\n🔍 Cleaning up expired keys...`);
    
    const expiredCleanup = await cleanupExpiredKeys(finalConfig);
    metrics.totalKeysScanned += expiredCleanup.keysScanned;
    metrics.keysDeleted += expiredCleanup.keysDeleted;
    metrics.errors.push(...expiredCleanup.errors);
    
    // Get final cache health
    const finalHealth = await getCacheHealth();
    console.log(`\n📊 Final Cache Health:`);
    console.log(`  Total Keys: ${finalHealth.totalKeys}`);
    console.log(`  Reading Keys: ${finalHealth.readingKeys}`);
    console.log(`  Memory Usage: ${finalHealth.memoryUsage}`);
    
    // Calculate metrics
    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    
    if (metrics.duration > 0) {
      metrics.performance.scanRate = (metrics.totalKeysScanned / metrics.duration) * 1000;
      metrics.performance.deleteRate = (metrics.keysDeleted / metrics.duration) * 1000;
    }
    
    // Estimate memory freed (rough calculation)
    const keysSaved = initialHealth.totalKeys - finalHealth.totalKeys;
    metrics.memoryFreed = estimateMemoryFreed(keysSaved);
    
    // Print summary
    console.log(`\n✅ Cleanup Completed Successfully`);
    console.log('=' .repeat(60));
    console.log(`Duration: ${metrics.duration}ms`);
    console.log(`Keys Scanned: ${metrics.totalKeysScanned}`);
    console.log(`Keys Deleted: ${metrics.keysDeleted}`);
    console.log(`Memory Freed: ${metrics.memoryFreed}`);
    console.log(`Scan Rate: ${metrics.performance.scanRate.toFixed(2)} keys/sec`);
    console.log(`Delete Rate: ${metrics.performance.deleteRate.toFixed(2)} keys/sec`);
    
    if (metrics.errors.length > 0) {
      console.log(`\n⚠️  Errors Encountered: ${metrics.errors.length}`);
      if (finalConfig.logLevel === 'verbose') {
        metrics.errors.forEach((error, i) => {
          console.log(`  ${i + 1}. ${error}`);
        });
      }
    }
    
    console.log('=' .repeat(60));
    
  } catch (error: any) {
    metrics.errors.push(`Fatal error: ${error.message}`);
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
  
  return metrics;
}

/**
 * Cleanup old reading entries
 */
async function cleanupReadingEntries(config: CleanupConfig) {
  const cutoffDate = subDays(new Date(), config.maxAge);
  const pattern = 'reading:daily:*';
  
  const result = {
    keysScanned: 0,
    keysDeleted: 0,
    errors: [] as string[],
  };
  
  try {
    const keys = await redis.keys(pattern);
    result.keysScanned = keys.length;
    
    console.log(`  Found ${keys.length} reading entries to scan`);
    
    const keysToDelete: string[] = [];
    
    for (const key of keys) {
      try {
        // Extract date from key: reading:daily:userId:YYYY-MM-DD
        const parts = key.split(':');
        const dateStr = parts[3];
        
        if (!dateStr) continue;
        
        const date = new Date(dateStr);
        
        // Skip invalid dates
        if (isNaN(date.getTime())) {
          if (config.logLevel === 'verbose') {
            console.log(`    Skipping invalid date: ${key}`);
          }
          continue;
        }
        
        // Mark for deletion if older than cutoff
        if (date < cutoffDate) {
          keysToDelete.push(key);
        }
      } catch (error: any) {
        result.errors.push(`Error processing key ${key}: ${error.message}`);
      }
    }
    
    console.log(`  Found ${keysToDelete.length} old entries to delete`);
    
    if (!config.dryRun && keysToDelete.length > 0) {
      // Delete in batches
      for (let i = 0; i < keysToDelete.length; i += config.batchSize) {
        const batch = keysToDelete.slice(i, i + config.batchSize);
        try {
          await redis.del(...batch);
          result.keysDeleted += batch.length;
          
          if (config.logLevel === 'verbose') {
            console.log(`    Deleted batch ${Math.floor(i / config.batchSize) + 1}: ${batch.length} keys`);
          }
        } catch (error: any) {
          result.errors.push(`Delete batch error: ${error.message}`);
        }
      }
    } else if (config.dryRun) {
      result.keysDeleted = keysToDelete.length;
      console.log(`  [DRY RUN] Would delete ${keysToDelete.length} keys`);
    }
  } catch (error: any) {
    result.errors.push(`Reading cleanup error: ${error.message}`);
  }
  
  return result;
}

/**
 * Cleanup orphaned list and latest caches
 */
async function cleanupOrphanedCaches(config: CleanupConfig) {
  const result = {
    keysScanned: 0,
    keysDeleted: 0,
    errors: [] as string[],
  };
  
  try {
    const [listKeys, latestKeys] = await Promise.all([
      redis.keys('reading:list:*'),
      redis.keys('reading:latest:*'),
    ]);
    
    const allKeys = [...listKeys, ...latestKeys];
    result.keysScanned = allKeys.length;
    
    console.log(`  Found ${allKeys.length} list/latest cache entries`);
    
    // For now, just delete all list and latest caches as they have short TTL anyway
    if (!config.dryRun && allKeys.length > 0) {
      for (let i = 0; i < allKeys.length; i += config.batchSize) {
        const batch = allKeys.slice(i, i + config.batchSize);
        try {
          await redis.del(...batch);
          result.keysDeleted += batch.length;
        } catch (error: any) {
          result.errors.push(`Orphan cleanup batch error: ${error.message}`);
        }
      }
    } else if (config.dryRun) {
      result.keysDeleted = allKeys.length;
      console.log(`  [DRY RUN] Would delete ${allKeys.length} orphaned caches`);
    }
  } catch (error: any) {
    result.errors.push(`Orphan cleanup error: ${error.message}`);
  }
  
  return result;
}

/**
 * Cleanup expired keys
 */
async function cleanupExpiredKeys(config: CleanupConfig) {
  const result = {
    keysScanned: 0,
    keysDeleted: 0,
    errors: [] as string[],
  };
  
  try {
    const allKeys = await redis.keys('reading:*');
    result.keysScanned = allKeys.length;
    
    console.log(`  Scanning ${allKeys.length} keys for expiration`);
    
    const expiredKeys: string[] = [];
    
    // Check TTL for each key (sample if too many)
    const keysToCheck = allKeys.length > 1000 ? allKeys.slice(0, 1000) : allKeys;
    
    for (const key of keysToCheck) {
      try {
        const ttl = await redis.ttl(key);
        if (ttl === -2) { // Key expired but not yet removed
          expiredKeys.push(key);
        }
      } catch (error: any) {
        result.errors.push(`TTL check error for ${key}: ${error.message}`);
      }
    }
    
    console.log(`  Found ${expiredKeys.length} expired keys`);
    
    if (!config.dryRun && expiredKeys.length > 0) {
      for (let i = 0; i < expiredKeys.length; i += config.batchSize) {
        const batch = expiredKeys.slice(i, i + config.batchSize);
        try {
          await redis.del(...batch);
          result.keysDeleted += batch.length;
        } catch (error: any) {
          result.errors.push(`Expired cleanup batch error: ${error.message}`);
        }
      }
    } else if (config.dryRun) {
      result.keysDeleted = expiredKeys.length;
      console.log(`  [DRY RUN] Would delete ${expiredKeys.length} expired keys`);
    }
  } catch (error: any) {
    result.errors.push(`Expired cleanup error: ${error.message}`);
  }
  
  return result;
}

/**
 * Estimate memory freed (rough calculation)
 */
function estimateMemoryFreed(keysDeleted: number): string {
  // Rough estimate: average reading cache entry is ~2KB
  const avgKeySize = 2048; // bytes
  const totalBytes = keysDeleted * avgKeySize;
  
  if (totalBytes < 1024) return `${totalBytes}B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)}KB`;
  if (totalBytes < 1024 * 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

/**
 * Run cleanup if called directly
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const maxAge = parseInt(args.find(arg => arg.startsWith('--max-age='))?.split('=')[1] || '30');
  const verbose = args.includes('--verbose');
  
  cleanupOldCache({
    maxAge,
    dryRun,
    logLevel: verbose ? 'verbose' : 'detailed',
  }).catch(error => {
    console.error('Cache cleanup failed:', error);
    process.exit(1);
  });
}

export { cleanupOldCache };
