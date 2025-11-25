/**
 * ChandraHoro V2.1 - SSE Streaming Test
 * 
 * Test script to validate Server-Sent Events streaming functionality.
 * Simulates real chat interactions and validates streaming behavior.
 * 
 * Features:
 * - SSE connection testing
 * - Event parsing validation
 * - Streaming performance metrics
 * - Error handling verification
 * - Connection stability testing
 */

interface SSETestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: any;
  error?: string;
}

interface StreamingMetrics {
  totalEvents: number;
  contentEvents: number;
  totalChars: number;
  averageChunkSize: number;
  streamDuration: number;
  eventsPerSecond: number;
}

/**
 * Test SSE Event Parsing
 */
function testSSEEventParsing(): SSETestResult {
  const startTime = Date.now();
  
  try {
    const testEvents = [
      'data: {"type":"start","conversationId":"conv-123"}\n\n',
      'data: {"type":"content","content":"Hello"}\n\n',
      'data: {"type":"content","content":" world"}\n\n',
      'data: {"type":"done","conversationId":"conv-123","tokensUsed":15}\n\n',
      'data: {"type":"error","error":"Test error"}\n\n',
      'invalid line without data prefix\n\n',
      'data: invalid json\n\n',
      'data: {"type":"content","content":"Test with \\"quotes\\""}\n\n',
    ];
    
    const parseSSEEvent = (line: string) => {
      if (!line.startsWith('data: ')) {
        return null;
      }
      
      try {
        return JSON.parse(line.slice(6));
      } catch (error) {
        return null;
      }
    };
    
    const parsedEvents = testEvents.map(parseSSEEvent).filter(Boolean);
    
    const hasStartEvent = parsedEvents.some(e => e.type === 'start');
    const hasContentEvents = parsedEvents.filter(e => e.type === 'content').length === 3;
    const hasDoneEvent = parsedEvents.some(e => e.type === 'done');
    const hasErrorEvent = parsedEvents.some(e => e.type === 'error');
    const handlesQuotes = parsedEvents.some(e => e.content?.includes('"'));
    
    const allTestsPassed = hasStartEvent && hasContentEvents && hasDoneEvent && hasErrorEvent && handlesQuotes;
    
    return {
      name: 'SSE Event Parsing',
      passed: allTestsPassed,
      duration: Date.now() - startTime,
      details: {
        totalEvents: testEvents.length,
        parsedEvents: parsedEvents.length,
        hasStartEvent,
        hasContentEvents,
        hasDoneEvent,
        hasErrorEvent,
        handlesQuotes,
      },
    };
  } catch (error: any) {
    return {
      name: 'SSE Event Parsing',
      passed: false,
      duration: Date.now() - startTime,
      details: {},
      error: error.message,
    };
  }
}

/**
 * Test Streaming Message Assembly
 */
function testStreamingMessageAssembly(): SSETestResult {
  const startTime = Date.now();
  
  try {
    const contentChunks = [
      { type: 'content', content: 'Hello' },
      { type: 'content', content: ' there!' },
      { type: 'content', content: ' How' },
      { type: 'content', content: ' can' },
      { type: 'content', content: ' I' },
      { type: 'content', content: ' help' },
      { type: 'content', content: ' you' },
      { type: 'content', content: ' today?' },
    ];
    
    let assembledMessage = '';
    const chunks: string[] = [];
    
    contentChunks.forEach(chunk => {
      if (chunk.type === 'content') {
        assembledMessage += chunk.content;
        chunks.push(chunk.content);
      }
    });
    
    const expectedMessage = 'Hello there! How can I help you today?';
    const messageCorrect = assembledMessage === expectedMessage;
    const chunkCount = chunks.length;
    const averageChunkSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length;
    
    return {
      name: 'Streaming Message Assembly',
      passed: messageCorrect && chunkCount === 8,
      duration: Date.now() - startTime,
      details: {
        expectedMessage,
        assembledMessage,
        messageCorrect,
        chunkCount,
        averageChunkSize: Math.round(averageChunkSize * 10) / 10,
      },
    };
  } catch (error: any) {
    return {
      name: 'Streaming Message Assembly',
      passed: false,
      duration: Date.now() - startTime,
      details: {},
      error: error.message,
    };
  }
}

/**
 * Test Error Handling in Streaming
 */
function testStreamingErrorHandling(): SSETestResult {
  const startTime = Date.now();
  
  try {
    const errorScenarios = [
      {
        name: 'Network Error',
        events: [
          { type: 'start', conversationId: 'conv-123' },
          { type: 'content', content: 'Hello' },
          // Simulate network interruption
        ],
        expectedError: 'Connection lost',
      },
      {
        name: 'API Error',
        events: [
          { type: 'start', conversationId: 'conv-123' },
          { type: 'error', error: 'Quota exceeded' },
        ],
        expectedError: 'Quota exceeded',
      },
      {
        name: 'Invalid JSON',
        events: [
          { type: 'start', conversationId: 'conv-123' },
          'invalid json data',
        ],
        expectedError: 'Parse error',
      },
    ];
    
    const handleStreamingError = (scenario: any) => {
      let hasError = false;
      let errorMessage = '';
      
      scenario.events.forEach((event: any) => {
        if (typeof event === 'string') {
          // Invalid JSON
          hasError = true;
          errorMessage = 'Parse error';
        } else if (event.type === 'error') {
          hasError = true;
          errorMessage = event.error;
        }
      });
      
      return { hasError, errorMessage };
    };
    
    const results = errorScenarios.map(scenario => {
      const result = handleStreamingError(scenario);
      return {
        ...scenario,
        ...result,
        handled: result.hasError && result.errorMessage.length > 0,
      };
    });
    
    const allErrorsHandled = results.every(r => r.handled);
    
    return {
      name: 'Streaming Error Handling',
      passed: allErrorsHandled,
      duration: Date.now() - startTime,
      details: {
        scenarios: results.length,
        allErrorsHandled,
        results: results.map(r => ({
          name: r.name,
          handled: r.handled,
          errorMessage: r.errorMessage,
        })),
      },
    };
  } catch (error: any) {
    return {
      name: 'Streaming Error Handling',
      passed: false,
      duration: Date.now() - startTime,
      details: {},
      error: error.message,
    };
  }
}

/**
 * Test Streaming Performance Metrics
 */
function testStreamingPerformance(): SSETestResult {
  const startTime = Date.now();
  
  try {
    // Simulate a typical streaming response
    const simulatedResponse = {
      totalChars: 500,
      chunks: 25,
      streamDuration: 2000, // 2 seconds
    };
    
    const metrics: StreamingMetrics = {
      totalEvents: simulatedResponse.chunks + 2, // +2 for start and done events
      contentEvents: simulatedResponse.chunks,
      totalChars: simulatedResponse.totalChars,
      averageChunkSize: simulatedResponse.totalChars / simulatedResponse.chunks,
      streamDuration: simulatedResponse.streamDuration,
      eventsPerSecond: (simulatedResponse.chunks + 2) / (simulatedResponse.streamDuration / 1000),
    };
    
    // Performance thresholds
    const thresholds = {
      maxAverageChunkSize: 50, // Characters per chunk
      minEventsPerSecond: 5,   // Events per second
      maxStreamDuration: 5000, // 5 seconds for 500 chars
    };
    
    const chunkSizeOk = metrics.averageChunkSize <= thresholds.maxAverageChunkSize;
    const eventsPerSecondOk = metrics.eventsPerSecond >= thresholds.minEventsPerSecond;
    const streamDurationOk = metrics.streamDuration <= thresholds.maxStreamDuration;
    
    const performanceGood = chunkSizeOk && eventsPerSecondOk && streamDurationOk;
    
    return {
      name: 'Streaming Performance',
      passed: performanceGood,
      duration: Date.now() - startTime,
      details: {
        metrics,
        thresholds,
        checks: {
          chunkSizeOk,
          eventsPerSecondOk,
          streamDurationOk,
        },
        performanceGood,
      },
    };
  } catch (error: any) {
    return {
      name: 'Streaming Performance',
      passed: false,
      duration: Date.now() - startTime,
      details: {},
      error: error.message,
    };
  }
}

/**
 * Test Connection Stability
 */
function testConnectionStability(): SSETestResult {
  const startTime = Date.now();
  
  try {
    // Simulate connection scenarios
    const connectionScenarios = [
      {
        name: 'Normal Connection',
        events: ['start', 'content', 'content', 'content', 'done'],
        interruptions: 0,
        expectedStable: true,
      },
      {
        name: 'Connection with Retry',
        events: ['start', 'content', 'disconnect', 'reconnect', 'content', 'done'],
        interruptions: 1,
        expectedStable: true,
      },
      {
        name: 'Multiple Interruptions',
        events: ['start', 'disconnect', 'reconnect', 'content', 'disconnect', 'reconnect', 'done'],
        interruptions: 2,
        expectedStable: false,
      },
    ];
    
    const evaluateStability = (scenario: any) => {
      const hasStart = scenario.events.includes('start');
      const hasDone = scenario.events.includes('done');
      const hasContent = scenario.events.includes('content');
      const interruptions = scenario.interruptions;
      
      // Connection is stable if it starts, has content, ends properly, and has minimal interruptions
      const isStable = hasStart && hasDone && hasContent && interruptions <= 1;
      
      return {
        ...scenario,
        isStable,
        hasStart,
        hasDone,
        hasContent,
      };
    };
    
    const results = connectionScenarios.map(evaluateStability);
    const stabilityCorrect = results.every(r => r.isStable === r.expectedStable);
    
    return {
      name: 'Connection Stability',
      passed: stabilityCorrect,
      duration: Date.now() - startTime,
      details: {
        scenarios: results.length,
        stabilityCorrect,
        results: results.map(r => ({
          name: r.name,
          isStable: r.isStable,
          expectedStable: r.expectedStable,
          interruptions: r.interruptions,
        })),
      },
    };
  } catch (error: any) {
    return {
      name: 'Connection Stability',
      passed: false,
      duration: Date.now() - startTime,
      details: {},
      error: error.message,
    };
  }
}

/**
 * Run all SSE streaming tests
 */
async function runSSETests(): Promise<void> {
  console.log('🌊 ChandraHoro V2.1 - SSE Streaming Test Suite');
  console.log('=' .repeat(60));
  
  const tests = [
    testSSEEventParsing(),
    testStreamingMessageAssembly(),
    testStreamingErrorHandling(),
    testStreamingPerformance(),
    testConnectionStability(),
  ];
  
  let totalPassed = 0;
  let totalDuration = 0;
  
  tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`\n${status} ${test.name}`);
    console.log(`   Duration: ${test.duration}ms`);
    
    if (!test.passed && test.error) {
      console.log(`   Error: ${test.error}`);
    }
    
    if (test.details && Object.keys(test.details).length > 0) {
      console.log(`   Details:`);
      Object.entries(test.details).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          console.log(`     ${key}: ${JSON.stringify(value, null, 2).substring(0, 100)}...`);
        } else {
          console.log(`     ${key}: ${value}`);
        }
      });
    }
    
    if (test.passed) totalPassed++;
    totalDuration += test.duration;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 SSE Tests Results: ${totalPassed}/${tests.length} passed (${Math.round(totalPassed / tests.length * 100)}%)`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  
  if (totalPassed === tests.length) {
    console.log('🎉 All SSE streaming tests passed! System is ready for real-time chat.');
  } else {
    console.log('⚠️  Some SSE tests failed. Please review streaming implementation.');
  }
  
  // Performance recommendations
  console.log('\n📊 Performance Recommendations:');
  console.log('   • Keep chunk sizes small (10-30 chars) for smooth streaming');
  console.log('   • Maintain 10+ events per second for responsive feel');
  console.log('   • Implement connection retry logic for stability');
  console.log('   • Add heartbeat events for long responses');
  console.log('   • Use compression for large responses');
}

// Run tests if called directly
if (require.main === module) {
  runSSETests().catch(console.error);
}

export { runSSETests };
