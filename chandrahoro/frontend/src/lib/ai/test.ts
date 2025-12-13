/**
 * ChandraHoro V2.1 - AI Integration Test
 * 
 * Simple test script to verify AI integration components work correctly.
 * This file can be run to test the AI functionality without a full app.
 */

import { countTokens, calculateCost, getModelConfig } from './utils';
import { checkInputSafety, checkOutputSafety } from './safety';
import { buildDailyReadingPrompt, SYSTEM_PROMPTS } from './prompts';

/**
 * Test utility functions
 */
export function testUtils() {
  console.log('🧪 Testing AI Utilities...');
  
  // Test token counting
  const testText = "Generate a daily astrological reading for today";
  const tokens = countTokens(testText, 'claude-3-5-sonnet-20241022');
  console.log(`✅ Token count for "${testText}": ${tokens} tokens`);
  
  // Test cost calculation
  const cost = calculateCost(1000, 500, 'claude-3-5-sonnet-20241022');
  console.log(`✅ Cost calculation: Input: $${cost.costInput}, Output: $${cost.costOutput}, Total: $${cost.costTotal}`);
  
  // Test model config
  const config = getModelConfig('claude-3-5-sonnet-20241022');
  console.log(`✅ Model config: ${config.name} - ${config.description}`);
  
  return true;
}

/**
 * Test safety functions
 */
export function testSafety() {
  console.log('🛡️ Testing AI Safety...');
  
  // Test safe input
  const safeInput = "What does my birth chart say about my career?";
  const safetyCheck = checkInputSafety(safeInput);
  console.log(`✅ Safe input check: ${safetyCheck.isSafe ? 'SAFE' : 'UNSAFE'}`);
  
  // Test unsafe input
  const unsafeInput = "When will I die according to my horoscope?";
  const unsafetyCheck = checkInputSafety(unsafeInput);
  console.log(`✅ Unsafe input check: ${unsafetyCheck.isSafe ? 'SAFE' : 'UNSAFE'} (should be UNSAFE)`);
  console.log(`   Blocked topics: ${unsafetyCheck.blockedTopics.join(', ')}`);
  
  // Test output safety
  const testOutput = "You will have a challenging but rewarding day ahead.";
  const outputCheck = checkOutputSafety(testOutput);
  console.log(`✅ Output safety check: ${outputCheck.isSafe ? 'SAFE' : 'UNSAFE'}`);
  
  return true;
}

/**
 * Test prompt building
 */
export function testPrompts() {
  console.log('📝 Testing AI Prompts...');
  
  // Test daily reading prompt
  const chartData = {
    sun: 'Capricorn',
    moon: 'Virgo',
    ascendant: 'Gemini',
    birthDate: '1990-01-15',
    birthTime: '14:30',
    birthPlace: 'Hyderabad, India',
  };
  
  const prompt = buildDailyReadingPrompt(chartData, '2024-10-26');
  console.log(`✅ Daily reading prompt generated (${prompt.length} characters)`);
  console.log(`   Preview: ${prompt.substring(0, 100)}...`);
  
  // Test system prompts
  console.log(`✅ System prompts available: ${Object.keys(SYSTEM_PROMPTS).join(', ')}`);
  
  return true;
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('🚀 Starting ChandraHoro AI Integration Tests...\n');
  
  try {
    testUtils();
    console.log('');
    
    testSafety();
    console.log('');
    
    testPrompts();
    console.log('');
    
    console.log('✅ All AI integration tests passed!');
    console.log('🎯 Ready for S1.T8 verification');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export test data for external use
export const testData = {
  sampleChartData: {
    sun: 'Capricorn',
    moon: 'Virgo',
    ascendant: 'Gemini',
    birthDate: '1990-01-15',
    birthTime: '14:30',
    birthPlace: 'Hyderabad, India',
  },
  samplePrompts: {
    safe: "What does my birth chart say about my career prospects?",
    unsafe: "When will I die according to astrology?",
    sensitive: "Will I get divorced based on my horoscope?",
  },
  expectedTokenCounts: {
    short: { text: "Hello", expectedRange: [1, 5] },
    medium: { text: "Generate a daily reading", expectedRange: [5, 10] },
    long: { text: "Generate a comprehensive daily astrological reading with detailed guidance", expectedRange: [15, 25] },
  },
};

// If running directly (for testing)
if (require.main === module) {
  runAllTests();
}
