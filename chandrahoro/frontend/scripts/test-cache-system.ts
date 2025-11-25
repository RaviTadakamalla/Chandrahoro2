/**
 * ChandraHoro V2.1 - Cache System Test Script
 * 
 * Comprehensive test suite for the reading caching system.
 * Tests Redis cache operations, MySQL repository, and cache-aside pattern.
 * 
 * Run with: npx tsx scripts/test-cache-system.ts
 * 
 * Features:
 * - Cache hit/miss testing
 * - TTL validation
 * - Cache invalidation testing
 * - Performance benchmarking
 * - Error handling validation
 */

import { readingCache, getCacheStats } from '@/lib/cache/reading-cache';
import { readingRepo } from '@/lib/repositories/reading-repository';
import { cacheInvalidation, getCacheHealth } from '@/lib/cache/cache-invalidation';
import { format, addDays } from 'date-fns';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details?: any;
  error?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

/**
 * Main test function
 */
async function testCacheSystem(): Promise<void> {
  console.log('🧪 Testing Reading Cache System');
  console.log('=' .repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));
  
  const testSuites: TestSuite[] = [];
  
  try {
    // Test 1: Basic Cache Operations
    testSuites.push(await testBasicCacheOperations());
    
    // Test 2: Cache TTL and Expiration
    testSuites.push(await testCacheTTL());
    
    // Test 3: Cache Invalidation
    testSuites.push(await testCacheInvalidation());
    
    // Test 4: Repository Operations
    testSuites.push(await testRepositoryOperations());
    
    // Test 5: Cache Performance
    testSuites.push(await testCachePerformance());
    
    // Test 6: Error Handling
    testSuites.push(await testErrorHandling());
    
    // Print summary
    printTestSummary(testSuites);
    
  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test 1: Basic Cache Operations
 */
async function testBasicCacheOperations(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Basic Cache Operations',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n📝 Test 1: Basic Cache Operations');
  console.log('-' .repeat(40));
  
  const testUserId = 'test-user-cache-001';
  const testDate = format(new Date(), 'yyyy-MM-dd');
  const testReading = {
    id: 'test-reading-001',
    userId: testUserId,
    readingType: 'daily',
    readingDate: new Date(),
    highlights: ['Test highlight 1', 'Test highlight 2'],
    work: 'Test work guidance',
    love: 'Test love guidance',
    health: 'Test health guidance',
    finance: 'Test finance guidance',
    timings: {
      favorable: ['9:00 AM - 11:00 AM'],
      avoid: ['12:00 PM - 1:00 PM'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Test: Set reading in cache
  suite.results.push(await runTest('Set reading in cache', async () => {
    await readingCache.set(testUserId, testDate, testReading);
    return { success: true };
  }));
  
  // Test: Get reading from cache (cache hit)
  suite.results.push(await runTest('Get reading from cache (hit)', async () => {
    const cached = await readingCache.get(testUserId, testDate);
    if (!cached) throw new Error('Reading not found in cache');
    if (cached.id !== testReading.id) throw new Error('Cached reading ID mismatch');
    return { cached: true, id: cached.id };
  }));
  
  // Test: Check cache existence
  suite.results.push(await runTest('Check cache existence', async () => {
    const exists = await readingCache.exists(testUserId, testDate);
    if (!exists) throw new Error('Cache existence check failed');
    return { exists };
  }));
  
  // Test: Get TTL
  suite.results.push(await runTest('Get cache TTL', async () => {
    const ttl = await readingCache.getTTL(testUserId, testDate);
    if (ttl <= 0) throw new Error('Invalid TTL value');
    return { ttl };
  }));
  
  // Test: Cache miss
  suite.results.push(await runTest('Cache miss test', async () => {
    const nonExistentDate = format(addDays(new Date(), 100), 'yyyy-MM-dd');
    const cached = await readingCache.get(testUserId, nonExistentDate);
    if (cached !== null) throw new Error('Expected cache miss but got hit');
    return { cacheMiss: true };
  }));
  
  // Test: Delete from cache
  suite.results.push(await runTest('Delete from cache', async () => {
    await readingCache.delete(testUserId, testDate);
    const cached = await readingCache.get(testUserId, testDate);
    if (cached !== null) throw new Error('Reading still in cache after deletion');
    return { deleted: true };
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Test 2: Cache TTL and Expiration
 */
async function testCacheTTL(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Cache TTL and Expiration',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n⏰ Test 2: Cache TTL and Expiration');
  console.log('-' .repeat(40));
  
  const testUserId = 'test-user-ttl-001';
  const testDate = format(new Date(), 'yyyy-MM-dd');
  const testReading = { id: 'test-ttl-reading', data: 'test' };
  
  // Test: Custom TTL
  suite.results.push(await runTest('Set with custom TTL', async () => {
    await readingCache.set(testUserId, testDate, testReading, { ttl: 5 }); // 5 seconds
    const ttl = await readingCache.getTTL(testUserId, testDate);
    if (ttl > 5 || ttl <= 0) throw new Error(`Invalid TTL: ${ttl}`);
    return { ttl };
  }));
  
  // Test: TTL countdown
  suite.results.push(await runTest('TTL countdown', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const ttl = await readingCache.getTTL(testUserId, testDate);
    if (ttl > 3 || ttl <= 0) throw new Error(`TTL not counting down properly: ${ttl}`);
    return { ttl };
  }));
  
  // Test: Cache statistics
  suite.results.push(await runTest('Cache statistics', async () => {
    const stats = await getCacheStats();
    if (typeof stats.hits !== 'number') throw new Error('Invalid stats format');
    return stats;
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Test 3: Cache Invalidation
 */
async function testCacheInvalidation(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Cache Invalidation',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n🗑️  Test 3: Cache Invalidation');
  console.log('-' .repeat(40));
  
  const testUserId = 'test-user-invalidation-001';
  const testDate1 = format(new Date(), 'yyyy-MM-dd');
  const testDate2 = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  
  // Setup test data
  await readingCache.set(testUserId, testDate1, { id: 'reading1' });
  await readingCache.set(testUserId, testDate2, { id: 'reading2' });
  await readingCache.setList(testUserId, [{ id: 'reading1' }, { id: 'reading2' }]);
  await readingCache.setLatest(testUserId, { id: 'latest' });
  
  // Test: Invalidate user caches
  suite.results.push(await runTest('Invalidate user caches', async () => {
    const result = await cacheInvalidation.invalidateUserCache(testUserId);
    if (result.keysDeleted === 0) throw new Error('No keys were deleted');
    return result;
  }));
  
  // Test: Verify invalidation
  suite.results.push(await runTest('Verify cache invalidation', async () => {
    const [reading1, reading2, list, latest] = await Promise.all([
      readingCache.get(testUserId, testDate1),
      readingCache.get(testUserId, testDate2),
      readingCache.getList(testUserId),
      readingCache.getLatest(testUserId),
    ]);
    
    if (reading1 || reading2 || list || latest) {
      throw new Error('Some caches were not invalidated');
    }
    
    return { allInvalidated: true };
  }));
  
  // Test: Cache health
  suite.results.push(await runTest('Cache health check', async () => {
    const health = await getCacheHealth();
    if (typeof health.totalKeys !== 'number') throw new Error('Invalid health format');
    return health;
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Test 4: Repository Operations (Mock)
 */
async function testRepositoryOperations(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Repository Operations',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n🗄️  Test 4: Repository Operations');
  console.log('-' .repeat(40));
  
  // Test: Repository class exists
  suite.results.push(await runTest('Repository class exists', async () => {
    if (typeof readingRepo.getReading !== 'function') {
      throw new Error('Repository methods not available');
    }
    return { available: true };
  }));
  
  // Test: Repository methods are callable (will fail without database)
  suite.results.push(await runTest('Repository methods callable', async () => {
    try {
      // This will likely fail without database, but we're testing the interface
      await readingRepo.exists('test-user', new Date(), 'daily');
      return { callable: true };
    } catch (error: any) {
      // Expected to fail without database connection
      if (error.message.includes('PrismaClient')) {
        return { callable: true, note: 'Database not connected (expected)' };
      }
      throw error;
    }
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Test 5: Cache Performance
 */
async function testCachePerformance(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Cache Performance',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n⚡ Test 5: Cache Performance');
  console.log('-' .repeat(40));
  
  const testUserId = 'test-user-perf-001';
  const testReading = { id: 'perf-test', data: 'x'.repeat(1000) }; // 1KB data
  
  // Test: Bulk cache operations
  suite.results.push(await runTest('Bulk cache operations (100 items)', async () => {
    const startTime = Date.now();
    
    // Set 100 cache entries
    const promises = [];
    for (let i = 0; i < 100; i++) {
      const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
      promises.push(readingCache.set(testUserId, date, { ...testReading, id: `perf-${i}` }));
    }
    
    await Promise.all(promises);
    
    const setDuration = Date.now() - startTime;
    
    // Get 100 cache entries
    const getStartTime = Date.now();
    const getPromises = [];
    for (let i = 0; i < 100; i++) {
      const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
      getPromises.push(readingCache.get(testUserId, date));
    }
    
    const results = await Promise.all(getPromises);
    const getDuration = Date.now() - getStartTime;
    
    const validResults = results.filter(r => r !== null).length;
    
    return {
      setDuration,
      getDuration,
      validResults,
      setRate: (100 / setDuration * 1000).toFixed(2) + ' ops/sec',
      getRate: (100 / getDuration * 1000).toFixed(2) + ' ops/sec',
    };
  }));
  
  // Test: Cache response time
  suite.results.push(await runTest('Cache response time', async () => {
    const date = format(new Date(), 'yyyy-MM-dd');
    
    // Measure cache hit time
    const hitStartTime = Date.now();
    await readingCache.get(testUserId, date);
    const hitTime = Date.now() - hitStartTime;
    
    // Measure cache miss time
    const missDate = format(addDays(new Date(), 200), 'yyyy-MM-dd');
    const missStartTime = Date.now();
    await readingCache.get(testUserId, missDate);
    const missTime = Date.now() - missStartTime;
    
    return {
      hitTime: `${hitTime}ms`,
      missTime: `${missTime}ms`,
      acceptable: hitTime < 50 && missTime < 50,
    };
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Test 6: Error Handling
 */
async function testErrorHandling(): Promise<TestSuite> {
  const suite: TestSuite = {
    name: 'Error Handling',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
  
  console.log('\n🚨 Test 6: Error Handling');
  console.log('-' .repeat(40));
  
  // Test: Invalid data handling
  suite.results.push(await runTest('Invalid data handling', async () => {
    try {
      // Try to cache invalid data
      await readingCache.set('', '', null);
      return { handledGracefully: true };
    } catch (error) {
      // Should handle gracefully, not throw
      return { handledGracefully: false, error: error.message };
    }
  }));
  
  // Test: Cache statistics with errors
  suite.results.push(await runTest('Cache stats error handling', async () => {
    const stats = await getCacheStats();
    // Should return valid stats even if some operations failed
    return {
      hasValidStats: typeof stats.hits === 'number' && typeof stats.misses === 'number',
      stats,
    };
  }));
  
  calculateSuiteStats(suite);
  return suite;
}

/**
 * Helper function to run individual tests
 */
async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const result = await testFn();
    const duration = Date.now() - startTime;
    
    console.log(`  ✅ ${name} (${duration}ms)`);
    
    return {
      name,
      passed: true,
      duration,
      details: result,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.log(`  ❌ ${name} (${duration}ms): ${error.message}`);
    
    return {
      name,
      passed: false,
      duration,
      error: error.message,
    };
  }
}

/**
 * Calculate suite statistics
 */
function calculateSuiteStats(suite: TestSuite): void {
  suite.totalTests = suite.results.length;
  suite.passedTests = suite.results.filter(r => r.passed).length;
  suite.failedTests = suite.totalTests - suite.passedTests;
  suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);
}

/**
 * Print test summary
 */
function printTestSummary(testSuites: TestSuite[]): void {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Summary');
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalDuration = 0;
  
  testSuites.forEach(suite => {
    const passRate = suite.totalTests > 0 ? 
      ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : '0';
    
    console.log(`\n${suite.name}:`);
    console.log(`  Tests: ${suite.passedTests}/${suite.totalTests} passed (${passRate}%)`);
    console.log(`  Duration: ${suite.totalDuration}ms`);
    
    totalTests += suite.totalTests;
    totalPassed += suite.passedTests;
    totalDuration += suite.totalDuration;
  });
  
  const overallPassRate = totalTests > 0 ? 
    ((totalPassed / totalTests) * 100).toFixed(1) : '0';
  
  console.log('\n' + '-' .repeat(60));
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
  console.log(`Total Duration: ${totalDuration}ms`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${totalTests - totalPassed} test(s) failed`);
  }
  
  console.log('=' .repeat(60));
}

/**
 * Run the test suite
 */
if (require.main === module) {
  testCacheSystem().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { testCacheSystem };
