/**
 * ChandraHoro V2.1 - AI Utilities
 * 
 * Token counting, cost calculation, and other AI-related utilities
 * for Anthropic Claude API integration.
 * 
 * Features:
 * - Token estimation for different Claude models
 * - Accurate cost calculation based on current pricing
 * - Model-specific configurations
 * - Utility functions for AI operations
 */

/**
 * Estimate token count for a given text and model
 * 
 * This is a rough estimation based on the general rule that:
 * - 1 token ≈ 4 characters for English text
 * - Claude models use similar tokenization
 * 
 * For production use, consider using tiktoken or similar libraries
 * for more accurate token counting.
 * 
 * @param text - The text to count tokens for
 * @param model - The Claude model being used
 * @returns Estimated token count
 */
export function countTokens(text: string, model: string): number {
  if (!text) return 0;
  
  // Basic estimation: ~4 characters per token
  // Add some buffer for special tokens and formatting
  const baseTokens = Math.ceil(text.length / 4);
  
  // Model-specific adjustments
  const modelMultipliers: Record<string, number> = {
    'claude-3-haiku-20240307': 1.0,
    'claude-3-5-sonnet-20241022': 1.0,
    'claude-3-opus-20240229': 1.0,
  };
  
  const multiplier = modelMultipliers[model] || 1.0;
  
  return Math.ceil(baseTokens * multiplier);
}

/**
 * Calculate costs for Claude API usage based on current pricing
 * 
 * Pricing as of October 2024 (per million tokens):
 * - Claude 3 Haiku: $0.25 input, $1.25 output
 * - Claude 3.5 Sonnet: $3.00 input, $15.00 output  
 * - Claude 3 Opus: $15.00 input, $75.00 output
 * 
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - The Claude model used
 * @returns Cost breakdown in USD
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): { costInput: number; costOutput: number; costTotal: number } {
  // Current Anthropic pricing (USD per million tokens)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-haiku-20240307': { 
      input: 0.25,   // $0.25 per million input tokens
      output: 1.25   // $1.25 per million output tokens
    },
    'claude-3-5-sonnet-20241022': { 
      input: 3.00,   // $3.00 per million input tokens
      output: 15.00  // $15.00 per million output tokens
    },
    'claude-3-opus-20240229': { 
      input: 15.00,  // $15.00 per million input tokens
      output: 75.00  // $75.00 per million output tokens
    },
  };
  
  // Default to Sonnet pricing if model not found
  const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
  
  // Calculate costs (tokens / 1,000,000 * price per million)
  const costInput = (inputTokens / 1_000_000) * modelPricing.input;
  const costOutput = (outputTokens / 1_000_000) * modelPricing.output;
  const costTotal = costInput + costOutput;
  
  return {
    costInput: parseFloat(costInput.toFixed(6)),   // 6 decimal places for precision
    costOutput: parseFloat(costOutput.toFixed(6)),
    costTotal: parseFloat(costTotal.toFixed(6)),
  };
}

/**
 * Get model configuration and limits
 * 
 * @param model - The Claude model name
 * @returns Model configuration object
 */
export function getModelConfig(model: string) {
  const configs: Record<string, {
    name: string;
    maxTokens: number;
    contextWindow: number;
    description: string;
    tier: 'fast' | 'balanced' | 'powerful';
  }> = {
    'claude-3-haiku-20240307': {
      name: 'Claude 3 Haiku',
      maxTokens: 4096,
      contextWindow: 200000,
      description: 'Fast and cost-effective for simple tasks',
      tier: 'fast',
    },
    'claude-3-5-sonnet-20241022': {
      name: 'Claude 3.5 Sonnet',
      maxTokens: 8192,
      contextWindow: 200000,
      description: 'Balanced performance and cost for most use cases',
      tier: 'balanced',
    },
    'claude-3-opus-20240229': {
      name: 'Claude 3 Opus',
      maxTokens: 4096,
      contextWindow: 200000,
      description: 'Most powerful for complex reasoning tasks',
      tier: 'powerful',
    },
  };
  
  return configs[model] || configs['claude-3-5-sonnet-20241022'];
}

/**
 * Validate model availability for user's plan
 * 
 * @param model - The requested model
 * @param allowedModels - Array of models allowed for user's plan
 * @returns Whether the model is allowed
 */
export function isModelAllowed(model: string, allowedModels: string[]): boolean {
  return allowedModels.includes(model);
}

/**
 * Get recommended model based on request type and user plan
 * 
 * @param requestType - Type of AI request
 * @param allowedModels - Models available to user
 * @returns Recommended model name
 */
export function getRecommendedModel(
  requestType: 'daily_reading' | 'chat' | 'compatibility' | 'custom',
  allowedModels: string[]
): string {
  // Model recommendations by use case
  const recommendations: Record<string, string[]> = {
    daily_reading: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
    chat: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    compatibility: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    custom: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  };
  
  const preferred = recommendations[requestType] || recommendations.custom;
  
  // Return first available model from preferences
  for (const model of preferred) {
    if (allowedModels.includes(model)) {
      return model;
    }
  }
  
  // Fallback to first allowed model
  return allowedModels[0] || 'claude-3-haiku-20240307';
}

/**
 * Format cost for display to users
 * 
 * @param cost - Cost in USD
 * @returns Formatted cost string
 */
export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return '<$0.001';
  }
  
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  
  return `$${cost.toFixed(3)}`;
}

/**
 * Format token count for display
 * 
 * @param tokens - Number of tokens
 * @returns Formatted token string
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens} tokens`;
  }
  
  if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K tokens`;
  }
  
  return `${(tokens / 1000000).toFixed(1)}M tokens`;
}

/**
 * Estimate response time based on model and token count
 * 
 * @param model - The Claude model
 * @param estimatedOutputTokens - Expected output tokens
 * @returns Estimated response time in milliseconds
 */
export function estimateResponseTime(model: string, estimatedOutputTokens: number): number {
  // Base response times per model (milliseconds per token)
  const baseTimings: Record<string, number> = {
    'claude-3-haiku-20240307': 10,     // ~10ms per token (fastest)
    'claude-3-5-sonnet-20241022': 15,  // ~15ms per token (balanced)
    'claude-3-opus-20240229': 25,     // ~25ms per token (slowest but most capable)
  };
  
  const timing = baseTimings[model] || baseTimings['claude-3-5-sonnet-20241022'];
  
  // Add base latency (network + processing)
  const baseLatency = 1000; // 1 second base latency
  
  return baseLatency + (estimatedOutputTokens * timing);
}

/**
 * Check if a request is within safe limits
 * 
 * @param inputTokens - Number of input tokens
 * @param maxTokens - Maximum output tokens requested
 * @param model - The Claude model
 * @returns Safety check result
 */
export function checkRequestSafety(
  inputTokens: number,
  maxTokens: number,
  model: string
): { isSafe: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const config = getModelConfig(model);
  
  // Check if input is too large
  if (inputTokens > config.contextWindow * 0.8) {
    warnings.push('Input is very large and may affect response quality');
  }
  
  // Check if requested output is too large
  if (maxTokens > config.maxTokens) {
    warnings.push(`Requested output (${maxTokens}) exceeds model limit (${config.maxTokens})`);
  }
  
  // Check total token usage
  const totalTokens = inputTokens + maxTokens;
  if (totalTokens > config.contextWindow) {
    warnings.push('Total tokens may exceed context window');
  }
  
  return {
    isSafe: warnings.length === 0,
    warnings,
  };
}
