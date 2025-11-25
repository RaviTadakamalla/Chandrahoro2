#!/usr/bin/env tsx
/**
 * Backend Connection Test Script
 * 
 * Tests the connection between Next.js frontend and Python FastAPI backend.
 * Run with: npx tsx test-backend-connection.ts
 * 
 * Prerequisites:
 * 1. Python backend running on http://localhost:8000
 * 2. Environment variables configured
 * 3. Swiss Ephemeris data files available
 */

import { pythonAPI, validateBackendConnection } from './src/lib/api/python-client';
import { transformPythonChartToPrisma, transformBirthDataToPython } from './src/lib/transformers/chart-transformer';

// Test data - Mahatma Gandhi's birth details
const testBirthData = {
  birthDate: '1869-10-02',
  birthTime: '07:45:00',
  birthPlace: 'Porbandar, India',
  latitude: 21.6417,
  longitude: 69.6293,
  timezone: 'Asia/Kolkata',
};

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testHealthCheck() {
  log('\n1. Testing Backend Health Check...', colors.bold);
  
  try {
    const isConnected = await validateBackendConnection();
    
    if (isConnected) {
      logSuccess('Backend is accessible and responding');
      
      // Get detailed health info
      const health = await pythonAPI.healthCheck();
      logInfo(`Backend status: ${health.status}`);
      if (health.version) {
        logInfo(`Backend version: ${health.version}`);
      }
      
      return true;
    } else {
      logError('Backend health check failed');
      return false;
    }
  } catch (error: any) {
    logError(`Health check error: ${error.message}`);
    return false;
  }
}

async function testChartCalculation() {
  log('\n2. Testing Chart Calculation...', colors.bold);
  
  try {
    // Transform test data to Python format
    const pythonRequest = transformBirthDataToPython(testBirthData);
    logInfo(`Sending request: ${JSON.stringify(pythonRequest, null, 2)}`);
    
    // Call Python backend
    const startTime = Date.now();
    const result = await pythonAPI.calculateChart(pythonRequest);
    const endTime = Date.now();
    
    logSuccess(`Chart calculation completed in ${endTime - startTime}ms`);
    
    // Validate response structure
    if (!result.planets || !result.houses || !result.aspects) {
      logError('Invalid response structure - missing required fields');
      return false;
    }
    
    // Display key results
    logInfo('Chart Data Summary:');
    console.log(`  Ascendant: ${result.ascendant}`);
    console.log(`  Sun Sign: ${result.sun_sign}`);
    console.log(`  Moon Sign: ${result.moon_sign}`);
    console.log(`  Planets: ${Object.keys(result.planets).join(', ')}`);
    console.log(`  Houses: ${result.houses.length} cusps`);
    console.log(`  Aspects: ${result.aspects.length} aspects`);
    console.log(`  Current Dasha: ${result.current_dasha.planet}`);
    console.log(`  Dasha Timeline: ${result.dasha_timeline.length} periods`);
    
    // Test data transformation
    logInfo('Testing data transformation...');
    const transformedData = transformPythonChartToPrisma(result);
    
    if (transformedData.planets && transformedData.currentDasha) {
      logSuccess('Data transformation successful');
    } else {
      logError('Data transformation failed');
      return false;
    }
    
    return true;
    
  } catch (error: any) {
    logError(`Chart calculation failed: ${error.message}`);
    return false;
  }
}

async function testTransits() {
  log('\n3. Testing Transit Data...', colors.bold);
  
  try {
    const today = new Date().toISOString().split('T')[0];
    logInfo(`Fetching transits for: ${today}`);
    
    const transitData = await pythonAPI.getTransits(today);
    
    if (transitData.planets && transitData.date) {
      logSuccess('Transit data retrieved successfully');
      console.log(`  Date: ${transitData.date}`);
      console.log(`  Planets: ${Object.keys(transitData.planets).join(', ')}`);
      
      if (transitData.significant_transits) {
        console.log(`  Significant Transits: ${transitData.significant_transits.length}`);
      }
      
      return true;
    } else {
      logError('Invalid transit data structure');
      return false;
    }
    
  } catch (error: any) {
    logError(`Transit data fetch failed: ${error.message}`);
    return false;
  }
}

async function testSystemInfo() {
  log('\n4. Testing System Information...', colors.bold);
  
  try {
    // Test ayanamsha systems
    const ayanamshas = await pythonAPI.getAyanamshas();
    logSuccess(`Available Ayanamshas: ${ayanamshas.join(', ')}`);
    
    // Test house systems
    const houseSystems = await pythonAPI.getHouseSystems();
    logSuccess(`Available House Systems: ${houseSystems.join(', ')}`);
    
    return true;
    
  } catch (error: any) {
    logWarning(`System info test failed: ${error.message}`);
    logInfo('This is optional - backend may not implement these endpoints yet');
    return true; // Don't fail the overall test for optional features
  }
}

async function runAllTests() {
  log('🚀 Starting Backend Connection Tests...', colors.bold);
  log('=====================================');
  
  const results = {
    healthCheck: false,
    chartCalculation: false,
    transits: false,
    systemInfo: false,
  };
  
  // Run tests sequentially
  results.healthCheck = await testHealthCheck();
  
  if (results.healthCheck) {
    results.chartCalculation = await testChartCalculation();
    results.transits = await testTransits();
    results.systemInfo = await testSystemInfo();
  } else {
    logError('Skipping other tests due to health check failure');
  }
  
  // Summary
  log('\n📊 Test Results Summary:', colors.bold);
  log('========================');
  
  const tests = [
    { name: 'Health Check', result: results.healthCheck },
    { name: 'Chart Calculation', result: results.chartCalculation },
    { name: 'Transit Data', result: results.transits },
    { name: 'System Info', result: results.systemInfo },
  ];
  
  tests.forEach(test => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
    } else {
      logError(`${test.name}: FAILED`);
    }
  });
  
  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;
  
  log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logSuccess('🎉 All tests passed! Backend integration is working correctly.');
    process.exit(0);
  } else if (results.healthCheck && results.chartCalculation) {
    logWarning('⚠️  Core functionality working, but some features failed.');
    process.exit(0);
  } else {
    logError('💥 Critical tests failed. Please check your backend configuration.');
    process.exit(1);
  }
}

// Environment check
function checkEnvironment() {
  log('🔍 Checking Environment...', colors.bold);
  
  const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
  const apiKey = process.env.PYTHON_API_KEY;
  
  logInfo(`Backend URL: ${backendUrl}`);
  logInfo(`API Key: ${apiKey ? '***configured***' : 'not set'}`);
  
  if (!backendUrl.startsWith('http')) {
    logError('Invalid PYTHON_BACKEND_URL format');
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    checkEnvironment();
    await runAllTests();
  } catch (error: any) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
main();
