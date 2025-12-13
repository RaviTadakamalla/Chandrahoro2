/**
 * ChandraHoro V2.1 - Analytics Service
 * 
 * Provides comprehensive analytics and monitoring data for admin dashboard.
 * Aggregates data from multiple sources including users, AI usage, readings,
 * conversations, and system metrics.
 * 
 * Features:
 * - User activity analytics
 * - AI usage and cost tracking
 * - Quota and plan distribution
 * - Performance metrics
 * - Error monitoring
 */

import { prisma } from '@/lib/prisma';
import { subDays, subHours, startOfDay, endOfDay } from 'date-fns';

export interface OverviewStats {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  readingsToday: number;
  chatMessagesToday: number;
  compatibilityReportsToday: number;
  quotaStats: QuotaStats;
  aiUsageStats: AIUsageStats;
}

export interface QuotaStats {
  totalUsers: number;
  quotaExceeded: number;
  avgRequestsUsed: number;
  avgTokensUsed: number;
  planDistribution: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  modelDistribution: Record<string, number>;
  requestTypeDistribution: Record<string, number>;
}

export interface UsageTrendData {
  date: string;
  readings_count: number;
  chat_messages_count: number;
  compatibility_reports_count: number;
  active_users_count: number;
}

export interface TopUser {
  id: string;
  email: string;
  name: string | null;
  readingsCount: number;
  conversationsCount: number;
  messagesCount: number;
  compatibilityReportsCount: number;
  dailyRequestsUsed: number;
  planType: string;
  lastLogin: Date | null;
  createdAt: Date;
}

export interface ErrorLogEntry {
  id: string;
  level: string;
  message: string;
  endpoint: string;
  userId: string | null;
  metadata: any;
  createdAt: Date;
}

export class AnalyticsService {
  /**
   * Get comprehensive overview statistics
   */
  async getOverview(): Promise<OverviewStats> {
    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);
    const weekAgo = subDays(today, 7);
    
    const [
      totalUsers,
      activeToday,
      activeThisWeek,
      readingsToday,
      chatMessagesToday,
      compatibilityReportsToday,
      quotaStats,
      aiUsageStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users today (based on recent activity)
      prisma.user.count({
        where: {
          OR: [
            { readings: { some: { createdAt: { gte: startToday, lte: endToday } } } },
            { conversations: { some: { lastMessageAt: { gte: startToday, lte: endToday } } } },
            { compatibilityReports: { some: { createdAt: { gte: startToday, lte: endToday } } } },
          ],
        },
      }),
      
      // Active users this week
      prisma.user.count({
        where: {
          OR: [
            { readings: { some: { createdAt: { gte: weekAgo } } } },
            { conversations: { some: { lastMessageAt: { gte: weekAgo } } } },
            { compatibilityReports: { some: { createdAt: { gte: weekAgo } } } },
          ],
        },
      }),
      
      // Readings today
      prisma.reading.count({
        where: {
          createdAt: { gte: startToday, lte: endToday },
        },
      }),
      
      // Chat messages today
      prisma.message.count({
        where: {
          createdAt: { gte: startToday, lte: endToday },
        },
      }),
      
      // Compatibility reports today
      prisma.compatibilityReport.count({
        where: {
          createdAt: { gte: startToday, lte: endToday },
        },
      }),
      
      // Quota statistics
      this.getQuotaStats(),
      
      // AI usage statistics
      this.getAIUsageStats(),
    ]);
    
    return {
      totalUsers,
      activeToday,
      activeThisWeek,
      readingsToday,
      chatMessagesToday,
      compatibilityReportsToday,
      quotaStats,
      aiUsageStats,
    };
  }
  
  /**
   * Get quota and plan statistics
   */
  async getQuotaStats(): Promise<QuotaStats> {
    const entitlements = await prisma.entitlement.findMany({
      select: {
        planType: true,
        dailyRequestsUsed: true,
        dailyRequestLimit: true,
        dailyTokensUsed: true,
      },
    });
    
    const quotaExceeded = entitlements.filter(
      e => e.dailyRequestsUsed >= e.dailyRequestLimit
    ).length;
    
    const avgRequestsUsed = entitlements.length > 0 
      ? entitlements.reduce((sum, e) => sum + e.dailyRequestsUsed, 0) / entitlements.length
      : 0;
    
    const avgTokensUsed = entitlements.length > 0
      ? entitlements.reduce((sum, e) => sum + e.dailyTokensUsed, 0) / entitlements.length
      : 0;
    
    const planDistribution = entitlements.reduce((acc, e) => {
      acc[e.planType as keyof typeof acc] = (acc[e.planType as keyof typeof acc] || 0) + 1;
      return acc;
    }, { free: 0, basic: 0, pro: 0, enterprise: 0 });
    
    return {
      totalUsers: entitlements.length,
      quotaExceeded,
      avgRequestsUsed,
      avgTokensUsed,
      planDistribution,
    };
  }
  
  /**
   * Get AI usage statistics
   */
  async getAIUsageStats(): Promise<AIUsageStats> {
    const today = startOfDay(new Date());
    
    const usageLogs = await prisma.aIUsageLog.findMany({
      where: {
        createdAt: { gte: today },
      },
      select: {
        requestType: true,
        aiModel: true,
        tokensTotal: true,
        costTotal: true,
      },
    });
    
    const totalRequests = usageLogs.length;
    const totalTokens = usageLogs.reduce((sum, log) => sum + log.tokensTotal, 0);
    const totalCost = usageLogs.reduce((sum, log) => sum + Number(log.costTotal), 0);
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
    
    const modelDistribution = usageLogs.reduce((acc, log) => {
      acc[log.aiModel] = (acc[log.aiModel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const requestTypeDistribution = usageLogs.reduce((acc, log) => {
      acc[log.requestType] = (acc[log.requestType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRequests,
      totalTokens,
      totalCost,
      avgCostPerRequest,
      modelDistribution,
      requestTypeDistribution,
    };
  }
  
  /**
   * Get usage trend data over specified days
   */
  async getUsageTrend(days: number = 7): Promise<UsageTrendData[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Generate date range
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      dateRange.push(subDays(endDate, days - 1 - i));
    }
    
    // Get data for each date
    const trendData = await Promise.all(
      dateRange.map(async (date) => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const [
          readingsCount,
          chatMessagesCount,
          compatibilityReportsCount,
          activeUsersCount,
        ] = await Promise.all([
          prisma.reading.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.message.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.compatibilityReport.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          }),
          prisma.user.count({
            where: {
              OR: [
                { readings: { some: { createdAt: { gte: dayStart, lte: dayEnd } } } },
                { conversations: { some: { lastMessageAt: { gte: dayStart, lte: dayEnd } } } },
                { compatibilityReports: { some: { createdAt: { gte: dayStart, lte: dayEnd } } } },
              ],
            },
          }),
        ]);
        
        return {
          date: date.toISOString().split('T')[0],
          readings_count: readingsCount,
          chat_messages_count: chatMessagesCount,
          compatibility_reports_count: compatibilityReportsCount,
          active_users_count: activeUsersCount,
        };
      })
    );
    
    return trendData;
  }
  
  /**
   * Get top users by activity
   */
  async getTopUsers(limit: number = 10): Promise<TopUser[]> {
    const users = await prisma.user.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            readings: true,
            conversations: true,
            compatibilityReports: true,
          },
        },
        entitlement: {
          select: {
            dailyRequestsUsed: true,
            planType: true,
          },
        },
      },
      orderBy: [
        { readings: { _count: 'desc' } },
        { conversations: { _count: 'desc' } },
      ],
    });
    
    // Get message counts for each user
    const usersWithMessageCounts = await Promise.all(
      users.map(async (user) => {
        const messageCount = await prisma.message.count({
          where: { userId: user.id },
        });
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          readingsCount: user._count.readings,
          conversationsCount: user._count.conversations,
          messagesCount: messageCount,
          compatibilityReportsCount: user._count.compatibilityReports,
          dailyRequestsUsed: user.entitlement?.dailyRequestsUsed || 0,
          planType: user.entitlement?.planType || 'free',
          lastLogin: null, // Would need to track this separately
          createdAt: user.createdAt,
        };
      })
    );
    
    return usersWithMessageCounts;
  }
  
  /**
   * Get recent error logs (simulated - would need actual error logging)
   */
  async getErrorLogs(limit: number = 50): Promise<ErrorLogEntry[]> {
    // This would typically come from a dedicated error logging table
    // For now, return empty array as placeholder
    return [];
  }
  
  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    databaseConnected: boolean;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  }> {
    try {
      // Test database connection
      const startTime = Date.now();
      await prisma.user.count({ take: 1 });
      const responseTime = Date.now() - startTime;
      
      return {
        databaseConnected: true,
        averageResponseTime: responseTime,
        errorRate: 0, // Would calculate from error logs
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        databaseConnected: false,
        averageResponseTime: 0,
        errorRate: 100,
        uptime: process.uptime(),
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
