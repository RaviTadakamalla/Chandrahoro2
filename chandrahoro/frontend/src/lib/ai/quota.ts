/**
 * ChandraHoro V2.1 - AI Quota Management
 * 
 * Manages user AI quotas and rate limiting using Prisma/MySQL.
 * Handles daily limits, automatic resets, and plan-based restrictions.
 * 
 * Features:
 * - Daily request and token limits
 * - Automatic quota reset at midnight IST
 * - Plan-based restrictions
 * - Real-time quota checking
 * - Usage tracking and analytics
 */

import { prisma } from '@/lib/prisma';

export interface QuotaStatus {
  allowed: boolean;
  requestsRemaining: number;
  tokensRemaining: number;
  requestsUsed: number;
  tokensUsed: number;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  resetAt: Date;
  planType: string;
  aiEnabled: boolean;
}

export interface QuotaCheckResult {
  allowed: boolean;
  requestsRemaining: number;
  tokensRemaining: number;
  requestsPercentage: number;
  tokensPercentage: number;
  resetAt: Date;
  warning: boolean;
  capMode: string;
  planType: string;
  requestsUsed: number;
  tokensUsed: number;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  aiEnabled: boolean;
}

/**
 * Check if user has available quota for AI requests
 * Automatically resets quota if past reset time
 *
 * @param userId - User ID to check quota for
 * @returns Quota status and availability
 */
export async function checkQuota(userId: string): Promise<QuotaStatus> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId },
  });

  if (!entitlement) {
    throw new Error('User entitlement not found. Please contact support.');
  }

  // Check if quota needs reset (past midnight IST)
  const now = new Date();
  if (now >= new Date(entitlement.quotaResetAt)) {
    await resetQuota(userId);
    // Recursively call to get fresh data after reset
    return checkQuota(userId);
  }

  const requestsRemaining = entitlement.dailyRequestLimit - entitlement.dailyRequestsUsed;
  const tokensRemaining = entitlement.dailyTokenLimit - entitlement.dailyTokensUsed;

  // Check if AI is enabled and within limits
  const allowed =
    entitlement.aiEnabled &&
    entitlement.planStatus === 'active' &&
    entitlement.dailyRequestsUsed < entitlement.dailyRequestLimit &&
    entitlement.dailyTokensUsed < entitlement.dailyTokenLimit;

  return {
    allowed,
    requestsRemaining: Math.max(0, requestsRemaining),
    tokensRemaining: Math.max(0, tokensRemaining),
    requestsUsed: entitlement.dailyRequestsUsed,
    tokensUsed: entitlement.dailyTokensUsed,
    dailyRequestLimit: entitlement.dailyRequestLimit,
    dailyTokenLimit: entitlement.dailyTokenLimit,
    resetAt: entitlement.quotaResetAt,
    planType: entitlement.planType,
    aiEnabled: entitlement.aiEnabled,
  };
}

/**
 * Enhanced quota check with soft/hard limits and warnings
 *
 * @param userId - User ID to check quota for
 * @returns Enhanced quota check result
 */
export async function checkQuotaEnhanced(userId: string): Promise<QuotaCheckResult> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId },
  });

  if (!entitlement) {
    throw new Error('User entitlement not found. Please contact support.');
  }

  // Check if quota needs reset (past midnight IST)
  const now = new Date();
  if (now >= new Date(entitlement.quotaResetAt)) {
    await resetQuota(userId);
    // Recursively call to get fresh data after reset
    return checkQuotaEnhanced(userId);
  }

  const requestsRemaining = entitlement.dailyRequestLimit - entitlement.dailyRequestsUsed;
  const tokensRemaining = entitlement.dailyTokenLimit - entitlement.dailyTokensUsed;

  // Calculate usage percentages
  const requestsPercentage =
    (entitlement.dailyRequestsUsed / entitlement.dailyRequestLimit) * 100;
  const tokensPercentage =
    (entitlement.dailyTokensUsed / entitlement.dailyTokenLimit) * 100;

  // Determine cap mode (default to soft for Pro+ users, hard for others)
  const capMode = entitlement.capMode || (['pro', 'enterprise'].includes(entitlement.planType) ? 'soft' : 'hard');

  // Determine if request is allowed
  let allowed = entitlement.aiEnabled && entitlement.planStatus === 'active';

  if (capMode === 'hard') {
    // Hard limit: block at 100%
    allowed = allowed &&
      entitlement.dailyRequestsUsed < entitlement.dailyRequestLimit &&
      entitlement.dailyTokensUsed < entitlement.dailyTokenLimit;
  } else {
    // Soft limit: allow 10% overage for Pro+ users
    const isProOrHigher = ['pro', 'enterprise'].includes(entitlement.planType);
    const graceMultiplier = isProOrHigher ? 1.1 : 1.0;

    allowed = allowed &&
      entitlement.dailyRequestsUsed < (entitlement.dailyRequestLimit * graceMultiplier) &&
      entitlement.dailyTokensUsed < (entitlement.dailyTokenLimit * graceMultiplier);
  }

  return {
    allowed,
    requestsRemaining: Math.max(0, requestsRemaining),
    tokensRemaining: Math.max(0, tokensRemaining),
    requestsPercentage: Math.min(100, requestsPercentage),
    tokensPercentage: Math.min(100, tokensPercentage),
    resetAt: entitlement.quotaResetAt,
    warning: requestsPercentage >= 80 || tokensPercentage >= 80,
    capMode,
    planType: entitlement.planType,
    requestsUsed: entitlement.dailyRequestsUsed,
    tokensUsed: entitlement.dailyTokensUsed,
    dailyRequestLimit: entitlement.dailyRequestLimit,
    dailyTokenLimit: entitlement.dailyTokenLimit,
    aiEnabled: entitlement.aiEnabled,
  };
}

/**
 * Increment user's quota usage after successful AI request
 * 
 * @param userId - User ID to update
 * @param tokensUsed - Number of tokens consumed
 * @param requestCount - Number of requests (default: 1)
 */
export async function incrementQuota(
  userId: string, 
  tokensUsed: number, 
  requestCount: number = 1
): Promise<void> {
  await prisma.entitlement.update({
    where: { userId },
    data: {
      dailyRequestsUsed: { increment: requestCount },
      dailyTokensUsed: { increment: tokensUsed },
    },
  });
}

/**
 * Reset user's daily quota to zero
 * Sets next reset time to tomorrow at midnight IST
 * 
 * @param userId - User ID to reset quota for
 */
export async function resetQuota(userId: string): Promise<void> {
  // Calculate next reset time (midnight IST)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istNow = new Date(now.getTime() + istOffset);
  
  // Set to next midnight IST
  const nextReset = new Date(istNow);
  nextReset.setUTCHours(24, 0, 0, 0); // Next day at 00:00 IST
  nextReset.setTime(nextReset.getTime() - istOffset); // Convert back to UTC
  
  await prisma.entitlement.update({
    where: { userId },
    data: {
      dailyRequestsUsed: 0,
      dailyTokensUsed: 0,
      quotaResetAt: nextReset,
    },
  });
}

/**
 * Get user's allowed models based on their plan
 * 
 * @param userId - User ID to check
 * @returns Array of allowed model names
 */
export async function getAllowedModels(userId: string): Promise<string[]> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId },
    select: { allowedModels: true },
  });
  
  if (!entitlement) {
    throw new Error('User entitlement not found');
  }
  
  // Parse JSON array of allowed models
  try {
    return JSON.parse(entitlement.allowedModels as string);
  } catch (error) {
    console.error('Failed to parse allowed models:', error);
    // Fallback to basic model for free users
    return ['claude-3-haiku-20240307'];
  }
}

/**
 * Check if user has access to a specific AI feature
 * 
 * @param userId - User ID to check
 * @param feature - Feature name to check
 * @returns Whether feature is allowed
 */
export async function checkFeatureAccess(
  userId: string, 
  feature: 'daily_reading' | 'ai_chat' | 'compatibility' | 'pdf_reports'
): Promise<boolean> {
  const entitlement = await prisma.entitlement.findUnique({
    where: { userId },
    select: { allowedFeatures: true, aiEnabled: true, planStatus: true },
  });
  
  if (!entitlement || !entitlement.aiEnabled || entitlement.planStatus !== 'active') {
    return false;
  }
  
  try {
    const features = JSON.parse(entitlement.allowedFeatures as string);
    return features[feature] === true;
  } catch (error) {
    console.error('Failed to parse allowed features:', error);
    return false;
  }
}

/**
 * Get quota usage statistics for analytics
 * 
 * @param userId - User ID to get stats for
 * @param days - Number of days to look back (default: 7)
 * @returns Usage statistics
 */
export async function getQuotaUsageStats(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const usageLogs = await prisma.aIUsageLog.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
      status: 'success',
    },
    select: {
      createdAt: true,
      tokensTotal: true,
      costTotal: true,
      requestType: true,
      aiModel: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  // Aggregate statistics
  const totalRequests = usageLogs.length;
  const totalTokens = usageLogs.reduce((sum, log) => sum + log.tokensTotal, 0);
  const totalCost = usageLogs.reduce((sum, log) => sum + Number(log.costTotal), 0);
  
  // Group by request type
  const byRequestType = usageLogs.reduce((acc, log) => {
    const type = log.requestType;
    if (!acc[type]) {
      acc[type] = { requests: 0, tokens: 0, cost: 0 };
    }
    acc[type].requests++;
    acc[type].tokens += log.tokensTotal;
    acc[type].cost += Number(log.costTotal);
    return acc;
  }, {} as Record<string, { requests: number; tokens: number; cost: number }>);
  
  // Group by model
  const byModel = usageLogs.reduce((acc, log) => {
    const model = log.aiModel;
    if (!acc[model]) {
      acc[model] = { requests: 0, tokens: 0, cost: 0 };
    }
    acc[model].requests++;
    acc[model].tokens += log.tokensTotal;
    acc[model].cost += Number(log.costTotal);
    return acc;
  }, {} as Record<string, { requests: number; tokens: number; cost: number }>);
  
  return {
    totalRequests,
    totalTokens,
    totalCost,
    byRequestType,
    byModel,
    dailyAverage: {
      requests: Math.round(totalRequests / days),
      tokens: Math.round(totalTokens / days),
      cost: totalCost / days,
    },
  };
}

/**
 * Update user's plan and quota limits
 *
 * @param userId - User ID to update
 * @param planType - New plan type
 * @param customLimits - Optional custom limits
 */
export async function updateUserPlan(
  userId: string,
  planType: 'free' | 'basic' | 'pro' | 'enterprise',
  customLimits?: {
    dailyRequestLimit?: number;
    dailyTokenLimit?: number;
    allowedModels?: string[];
    allowedFeatures?: Record<string, boolean>;
  }
): Promise<void> {
  // Default limits by plan type
  const planDefaults = {
    free: {
      dailyRequestLimit: 10,
      dailyTokenLimit: 50000,
      allowedModels: ['claude-3-haiku-20240307'],
      allowedFeatures: {
        daily_reading: true,
        ai_chat: true,
        compatibility: false,
        pdf_reports: false,
      },
    },
    basic: {
      dailyRequestLimit: 50,
      dailyTokenLimit: 200000,
      allowedModels: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
      allowedFeatures: {
        daily_reading: true,
        ai_chat: true,
        compatibility: true,
        pdf_reports: false,
      },
    },
    pro: {
      dailyRequestLimit: 200,
      dailyTokenLimit: 1000000,
      allowedModels: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
      allowedFeatures: {
        daily_reading: true,
        ai_chat: true,
        compatibility: true,
        pdf_reports: true,
      },
    },
    enterprise: {
      dailyRequestLimit: 9999,
      dailyTokenLimit: 10000000,
      allowedModels: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
      allowedFeatures: {
        daily_reading: true,
        ai_chat: true,
        compatibility: true,
        pdf_reports: true,
      },
    },
  };

  const defaults = planDefaults[planType];
  const limits = { ...defaults, ...customLimits };

  await prisma.entitlement.update({
    where: { userId },
    data: {
      planType,
      dailyRequestLimit: limits.dailyRequestLimit,
      dailyTokenLimit: limits.dailyTokenLimit,
      allowedModels: JSON.stringify(limits.allowedModels),
      allowedFeatures: JSON.stringify(limits.allowedFeatures),
      // Reset usage when upgrading plan
      dailyRequestsUsed: 0,
      dailyTokensUsed: 0,
    },
  });
}

/**
 * QuotaService class for comprehensive quota management
 */
export class QuotaService {
  /**
   * Check if user can make AI request with enhanced features
   */
  async check(userId: string): Promise<QuotaCheckResult> {
    return checkQuotaEnhanced(userId);
  }

  /**
   * Increment quota after successful request
   */
  async increment(userId: string, tokensUsed: number): Promise<void> {
    await incrementQuota(userId, tokensUsed, 1);
    console.log('[Quota] Incremented for user:', userId, '| Tokens:', tokensUsed);
  }

  /**
   * Reset daily quota (called at midnight IST)
   */
  async reset(userId: string): Promise<void> {
    await resetQuota(userId);
    console.log('[Quota] Reset complete for user:', userId);
  }

  /**
   * Admin: Adjust user quota
   */
  async adjustQuota(
    userId: string,
    adjustment: {
      requests?: number;
      tokens?: number;
      resetNow?: boolean;
      capMode?: 'soft' | 'hard';
    },
    adminId: string
  ): Promise<void> {
    const updates: any = {};

    if (adjustment.requests !== undefined) {
      updates.dailyRequestLimit = adjustment.requests;
    }

    if (adjustment.tokens !== undefined) {
      updates.dailyTokenLimit = adjustment.tokens;
    }

    if (adjustment.capMode !== undefined) {
      updates.capMode = adjustment.capMode;
    }

    if (adjustment.resetNow) {
      updates.dailyRequestsUsed = 0;
      updates.dailyTokensUsed = 0;
    }

    await prisma.entitlement.update({
      where: { userId },
      data: updates,
    });

    // Log to audit (implement audit table if needed)
    console.log('[Quota] Admin adjustment:', {
      userId,
      adminId,
      changes: updates,
    });
  }

  /**
   * Get user entitlement (with error handling)
   */
  private async getEntitlement(userId: string) {
    const entitlement = await prisma.entitlement.findUnique({
      where: { userId },
    });

    if (!entitlement) {
      throw new Error('Entitlement not found for user');
    }

    return entitlement;
  }

  /**
   * Get quota stats for all users (admin)
   */
  async getGlobalStats(): Promise<{
    totalUsers: number;
    activeToday: number;
    quotaExceeded: number;
    avgRequestsUsed: number;
  }> {
    const entitlements = await prisma.entitlement.findMany();

    const activeToday = entitlements.filter(e => e.dailyRequestsUsed > 0).length;
    const quotaExceeded = entitlements.filter(
      e => e.dailyRequestsUsed >= e.dailyRequestLimit
    ).length;
    const avgRequestsUsed =
      entitlements.reduce((sum, e) => sum + e.dailyRequestsUsed, 0) / entitlements.length;

    return {
      totalUsers: entitlements.length,
      activeToday,
      quotaExceeded,
      avgRequestsUsed: Math.round(avgRequestsUsed * 10) / 10,
    };
  }
}

// Export singleton instance
export const quotaService = new QuotaService();
