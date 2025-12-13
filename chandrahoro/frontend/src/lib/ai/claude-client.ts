/**
 * ChandraHoro V2.1 - Anthropic Claude API Client
 * 
 * Comprehensive Claude API integration with:
 * - Streaming and non-streaming responses
 * - Quota management via Prisma/MySQL
 * - Cost tracking and usage logging
 * - Error handling and retry logic
 * - Rate limiting and safety checks
 * 
 * @see https://docs.anthropic.com/claude/reference/messages_post
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { countTokens, calculateCost } from './utils';
import { checkQuota, incrementQuota } from './quota';

// Initialize Anthropic client with configuration
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  timeout: parseInt(process.env.AI_TIMEOUT_MS || '60000'),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
});

export interface ClaudeRequest {
  userId: string;
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  context?: {
    type: 'daily_reading' | 'chat' | 'compatibility' | 'custom';
    metadata?: any;
  };
}

export interface ClaudeResponse {
  content: string;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
  costInput: number;
  costOutput: number;
  costTotal: number;
  model: string;
  responseTimeMs: number;
}

/**
 * Send a non-streaming request to Claude API
 * Includes quota checking, cost calculation, and usage logging
 */
export async function sendClaudeRequest(
  request: ClaudeRequest
): Promise<ClaudeResponse> {
  const startTime = Date.now();
  const model = request.model || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';
  
  try {
    // 1. Check user quota (reads from entitlements table)
    const quotaCheck = await checkQuota(request.userId);
    if (!quotaCheck.allowed) {
      throw new Error('AI_QUOTA_EXCEEDED');
    }
    
    // 2. Estimate input tokens to check against quota
    const estimatedInputTokens = countTokens(request.prompt + (request.systemPrompt || ''), model);
    
    if (estimatedInputTokens > quotaCheck.tokensRemaining) {
      throw new Error('AI_TOKEN_QUOTA_EXCEEDED');
    }
    
    // 3. Call Claude API
    const response = await anthropic.messages.create({
      model,
      max_tokens: request.maxTokens || parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096'),
      temperature: request.temperature || parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    });
    
    // 4. Extract content from response
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    const tokensInput = response.usage.input_tokens;
    const tokensOutput = response.usage.output_tokens;
    const tokensTotal = tokensInput + tokensOutput;
    
    // 5. Calculate costs based on model pricing
    const { costInput, costOutput, costTotal } = calculateCost(
      tokensInput,
      tokensOutput,
      model
    );
    
    // 6. Update user quota (increment usage)
    await incrementQuota(request.userId, tokensTotal);
    
    // 7. Log usage to MySQL for analytics and billing
    const responseTimeMs = Date.now() - startTime;
    await prisma.aIUsageLog.create({
      data: {
        userId: request.userId,
        requestType: request.context?.type || 'custom',
        endpoint: 'claude-messages',
        aiProvider: 'anthropic',
        aiModel: model,
        tokensInput,
        tokensOutput,
        tokensTotal,
        costInput,
        costOutput,
        costTotal,
        responseTimeMs,
        status: 'success',
      },
    });
    
    return {
      content,
      tokensInput,
      tokensOutput,
      tokensTotal,
      costInput,
      costOutput,
      costTotal,
      model,
      responseTimeMs,
    };
    
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    
    // Log error to MySQL for debugging and monitoring
    await prisma.aIUsageLog.create({
      data: {
        userId: request.userId,
        requestType: request.context?.type || 'custom',
        endpoint: 'claude-messages',
        aiProvider: 'anthropic',
        aiModel: model,
        tokensInput: 0,
        tokensOutput: 0,
        tokensTotal: 0,
        costInput: 0,
        costOutput: 0,
        costTotal: 0,
        responseTimeMs,
        status: 'error',
        errorMessage: error.message,
      },
    });
    
    // Handle specific error types with user-friendly messages
    if (error.message === 'AI_QUOTA_EXCEEDED') {
      throw new Error('Daily AI request limit reached. Upgrade your plan or wait for reset at midnight IST.');
    }
    
    if (error.message === 'AI_TOKEN_QUOTA_EXCEEDED') {
      throw new Error('This request would exceed your daily token limit. Try a shorter prompt or upgrade your plan.');
    }
    
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    if (error.status === 401) {
      throw new Error('API authentication failed. Please contact support.');
    }
    
    if (error.status === 400) {
      throw new Error('Invalid request. Please check your input and try again.');
    }
    
    // Generic error for unexpected issues
    throw new Error('AI request failed. Please try again or contact support if the issue persists.');
  }
}

/**
 * Stream a response from Claude API for real-time chat experiences
 * Returns an async generator that yields text chunks as they arrive
 */
export async function* streamClaudeResponse(
  request: ClaudeRequest
): AsyncGenerator<string, ClaudeResponse, unknown> {
  const startTime = Date.now();
  const model = request.model || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';
  
  try {
    // Pre-flight checks (same as non-streaming)
    const quotaCheck = await checkQuota(request.userId);
    if (!quotaCheck.allowed) throw new Error('AI_QUOTA_EXCEEDED');
    
    const estimatedInputTokens = countTokens(request.prompt + (request.systemPrompt || ''), model);
    if (estimatedInputTokens > quotaCheck.tokensRemaining) {
      throw new Error('AI_TOKEN_QUOTA_EXCEEDED');
    }
    
    // Create streaming request
    const stream = await anthropic.messages.create({
      model,
      max_tokens: request.maxTokens || parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096'),
      temperature: request.temperature || parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
      stream: true,
    });
    
    let fullContent = '';
    let tokensInput = 0;
    let tokensOutput = 0;
    
    // Process streaming events
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text;
        yield event.delta.text; // Yield each text chunk as it arrives
      }
      
      if (event.type === 'message_start') {
        tokensInput = event.message.usage.input_tokens;
      }
      
      if (event.type === 'message_delta' && event.usage) {
        tokensOutput = event.usage.output_tokens;
      }
    }
    
    // Final calculations and logging
    const tokensTotal = tokensInput + tokensOutput;
    const { costInput, costOutput, costTotal } = calculateCost(tokensInput, tokensOutput, model);
    const responseTimeMs = Date.now() - startTime;
    
    await incrementQuota(request.userId, tokensTotal);
    
    await prisma.aIUsageLog.create({
      data: {
        userId: request.userId,
        requestType: request.context?.type || 'chat',
        endpoint: 'claude-messages-stream',
        aiProvider: 'anthropic',
        aiModel: model,
        tokensInput,
        tokensOutput,
        tokensTotal,
        costInput,
        costOutput,
        costTotal,
        responseTimeMs,
        status: 'success',
      },
    });
    
    return {
      content: fullContent,
      tokensInput,
      tokensOutput,
      tokensTotal,
      costInput,
      costOutput,
      costTotal,
      model,
      responseTimeMs,
    };
    
  } catch (error: any) {
    // Error logging for streaming requests
    await prisma.aIUsageLog.create({
      data: {
        userId: request.userId,
        requestType: request.context?.type || 'chat',
        endpoint: 'claude-messages-stream',
        aiProvider: 'anthropic',
        aiModel: model,
        tokensInput: 0,
        tokensOutput: 0,
        tokensTotal: 0,
        costInput: 0,
        costOutput: 0,
        costTotal: 0,
        responseTimeMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message,
      },
    });
    
    throw error;
  }
}
