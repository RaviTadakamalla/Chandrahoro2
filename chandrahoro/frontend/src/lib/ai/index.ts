/**
 * ChandraHoro V2.1 - AI Integration Module
 * 
 * Main entry point for all AI-related functionality including:
 * - Claude API client and streaming
 * - Quota management and rate limiting
 * - Content safety and filtering
 * - Prompt templates and builders
 * - Token counting and cost calculation
 * 
 * @example
 * ```typescript
 * import { sendClaudeRequest, checkQuota } from '@/lib/ai';
 * 
 * const quota = await checkQuota(userId);
 * if (quota.allowed) {
 *   const response = await sendClaudeRequest({
 *     userId,
 *     prompt: 'Generate a daily reading',
 *     context: { type: 'daily_reading' }
 *   });
 * }
 * ```
 */

// Claude API client exports
export {
  sendClaudeRequest,
  streamClaudeResponse,
  type ClaudeRequest,
  type ClaudeResponse,
} from './claude-client';

// Quota management exports
export {
  checkQuota,
  incrementQuota,
  resetQuota,
  getAllowedModels,
  checkFeatureAccess,
  getQuotaUsageStats,
  updateUserPlan,
  type QuotaStatus,
} from './quota';

// Utility functions exports
export {
  countTokens,
  calculateCost,
  getModelConfig,
  isModelAllowed,
  getRecommendedModel,
  formatCost,
  formatTokens,
  estimateResponseTime,
  checkRequestSafety,
} from './utils';

// Prompt templates exports
export {
  SYSTEM_PROMPTS,
  buildDailyReadingPrompt,
  buildCompatibilityPrompt,
  buildChartAnalysisPrompt,
  buildChatPrompt,
  DISCLAIMERS,
  getDisclaimer,
} from './prompts';

// Safety and content filtering exports
export {
  checkInputSafety,
  checkOutputSafety,
  sanitizeOutput,
  generateDisclaimers,
  validateUserRequest,
  checkRateLimit,
} from './safety';

/**
 * High-level AI service functions for common use cases
 */

import {
  checkQuota,
  checkFeatureAccess,
  getAllowedModels,
} from './quota';

import {
  getRecommendedModel,
} from './utils';

import {
  SYSTEM_PROMPTS,
  buildDailyReadingPrompt,
  buildChatPrompt,
  buildCompatibilityPrompt,
} from './prompts';

import {
  validateUserRequest,
  sanitizeOutput,
  generateDisclaimers,
} from './safety';

import {
  sendClaudeRequest,
} from './claude-client';

/**
 * Generate a daily astrological reading for a user
 *
 * @param userId - User ID requesting the reading
 * @param chartData - User's birth chart data
 * @param date - Date for the reading (optional, defaults to today)
 * @param preferences - User preferences for the reading
 * @returns Daily reading response
 */
export async function generateDailyReading(
  userId: string,
  chartData: {
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  },
  date?: string,
  preferences?: {
    language?: string;
    tone?: 'encouraging' | 'practical' | 'spiritual';
    focus?: 'general' | 'career' | 'relationships' | 'health';
  }
): Promise<{
  success: boolean;
  content?: any;
  error?: string;
  disclaimers?: string[];
}> {
  try {
    // Check quota first
    const quota = await checkQuota(userId);
    if (!quota.allowed) {
      return {
        success: false,
        error: 'Daily AI request limit reached. Please upgrade your plan or wait for reset.',
      };
    }

    // Check feature access
    const hasAccess = await checkFeatureAccess(userId, 'daily_reading');
    if (!hasAccess) {
      return {
        success: false,
        error: 'Daily readings are not available with your current plan.',
      };
    }

    // Build prompt
    const readingDate = date || new Date().toISOString().split('T')[0];
    const prompt = buildDailyReadingPrompt(chartData, readingDate, preferences);

    // Get recommended model
    const allowedModels = await getAllowedModels(userId);
    const model = getRecommendedModel('daily_reading', allowedModels);

    // Send request to Claude
    const response = await sendClaudeRequest({
      userId,
      prompt,
      systemPrompt: SYSTEM_PROMPTS.dailyReading,
      model,
      context: { type: 'daily_reading', metadata: { date: readingDate } },
    });

    // Parse JSON response
    let content;
    try {
      content = JSON.parse(response.content);
    } catch (error) {
      // If JSON parsing fails, return raw content
      content = { text: response.content };
    }

    // Generate disclaimers
    const disclaimers = generateDisclaimers('daily_reading', ['general']);

    return {
      success: true,
      content,
      disclaimers,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate daily reading',
    };
  }
}

/**
 * Process a chat message with AI assistance
 * 
 * @param userId - User ID sending the message
 * @param message - User's message/question
 * @param context - Additional context (chart data, conversation history)
 * @returns AI chat response
 */
export async function processChatMessage(
  userId: string,
  message: string,
  context?: {
    chartData?: any;
    conversationHistory?: string[];
    userPreferences?: any;
  }
): Promise<{
  success: boolean;
  content?: string;
  error?: string;
  disclaimers?: string[];
  tokensUsed?: number;
  cost?: number;
}> {
  try {
    // Validate user request
    const validation = validateUserRequest(message, 'chat');
    if (!validation.canProceed) {
      return {
        success: false,
        error: validation.warnings.join(' '),
      };
    }

    // Check quota and feature access
    const quota = await checkQuota(userId);
    if (!quota.allowed) {
      return {
        success: false,
        error: 'Daily AI request limit reached.',
      };
    }

    const hasAccess = await checkFeatureAccess(userId, 'ai_chat');
    if (!hasAccess) {
      return {
        success: false,
        error: 'AI chat is not available with your current plan.',
      };
    }

    // Build chat prompt
    const prompt = buildChatPrompt(message, context);
    
    // Get recommended model
    const allowedModels = await getAllowedModels(userId);
    const model = getRecommendedModel('chat', allowedModels);

    // Send request to Claude
    const response = await sendClaudeRequest({
      userId,
      prompt,
      systemPrompt: SYSTEM_PROMPTS.chat,
      model,
      context: { type: 'chat' },
    });

    // Sanitize output for safety
    const sanitizedContent = sanitizeOutput(response.content);

    return {
      success: true,
      content: sanitizedContent,
      disclaimers: validation.requiredDisclaimers,
      tokensUsed: response.tokensTotal,
      cost: response.costTotal,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process chat message',
    };
  }
}

/**
 * Analyze compatibility between two people
 * 
 * @param userId - User ID requesting the analysis
 * @param person1 - First person's chart data
 * @param person2 - Second person's chart data
 * @param relationshipType - Type of relationship
 * @returns Compatibility analysis
 */
export async function analyzeCompatibility(
  userId: string,
  person1: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
  },
  person2: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
  },
  relationshipType: 'romantic' | 'marriage' | 'business' | 'friendship' = 'romantic'
): Promise<{
  success: boolean;
  content?: any;
  error?: string;
  disclaimers?: string[];
}> {
  try {
    // Check quota and feature access
    const quota = await checkQuota(userId);
    if (!quota.allowed) {
      return {
        success: false,
        error: 'Daily AI request limit reached.',
      };
    }

    const hasAccess = await checkFeatureAccess(userId, 'compatibility');
    if (!hasAccess) {
      return {
        success: false,
        error: 'Compatibility analysis is not available with your current plan.',
      };
    }

    // Build compatibility prompt
    const prompt = buildCompatibilityPrompt(person1, person2, relationshipType);
    
    // Get recommended model
    const allowedModels = await getAllowedModels(userId);
    const model = getRecommendedModel('compatibility', allowedModels);

    // Send request to Claude
    const response = await sendClaudeRequest({
      userId,
      prompt,
      systemPrompt: SYSTEM_PROMPTS.compatibility,
      model,
      context: { type: 'compatibility', metadata: { relationshipType } },
    });

    // Parse JSON response
    let content;
    try {
      content = JSON.parse(response.content);
    } catch (error) {
      content = { analysis: response.content };
    }

    // Generate disclaimers
    const disclaimers = generateDisclaimers('compatibility', ['relationships']);

    return {
      success: true,
      content,
      disclaimers,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to analyze compatibility',
    };
  }
}
