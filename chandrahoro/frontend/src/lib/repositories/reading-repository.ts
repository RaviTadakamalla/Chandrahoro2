/**
 * ChandraHoro V2.1 - Reading Repository
 * 
 * MySQL/Prisma-based repository for reading persistence.
 * Handles all database operations for readings with proper typing.
 * 
 * Features:
 * - CRUD operations for readings
 * - Paginated queries with filtering
 * - User feedback and interaction tracking
 * - Bulk operations for admin tasks
 * - Proper error handling and logging
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ReadingFilters {
  limit?: number;
  offset?: number;
  type?: 'daily' | 'weekly' | 'monthly';
  savedOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  isRead?: boolean;
  hasUserFeedback?: boolean;
}

export interface ReadingListResult {
  readings: any[];
  total: number;
  hasMore: boolean;
}

export interface ReadingStats {
  total: number;
  saved: number;
  read: number;
  withFeedback: number;
  byType: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export class ReadingRepository {
  /**
   * Get reading by user and date
   */
  async getReading(
    userId: string,
    date: string | Date,
    type: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<any | null> {
    try {
      const readingDate = typeof date === 'string' ? new Date(date) : date;
      
      const reading = await prisma.reading.findFirst({
        where: {
          userId,
          readingDate,
          readingType: type,
        },
        orderBy: {
          createdAt: 'desc', // Get latest if multiple exist
        },
      });
      
      return reading;
    } catch (error) {
      console.error('[ReadingRepository] Error getting reading:', error);
      throw new Error('Failed to fetch reading');
    }
  }
  
  /**
   * Get readings list with pagination and filtering
   */
  async getReadings(
    userId: string,
    filters: ReadingFilters = {}
  ): Promise<ReadingListResult> {
    try {
      const {
        limit = 10,
        offset = 0,
        type,
        savedOnly,
        startDate,
        endDate,
        isRead,
        hasUserFeedback,
      } = filters;
      
      const where: Prisma.ReadingWhereInput = {
        userId,
        ...(type && { readingType: type }),
        ...(savedOnly && { isSaved: true }),
        ...(typeof isRead === 'boolean' && { isRead }),
        ...(hasUserFeedback && { userFeedback: { not: null } }),
        ...(startDate && {
          readingDate: { gte: startDate },
        }),
        ...(endDate && {
          readingDate: { 
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
        }),
      };
      
      const [readings, total] = await Promise.all([
        prisma.reading.findMany({
          where,
          orderBy: { readingDate: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            readingType: true,
            readingDate: true,
            highlights: true,
            work: true,
            love: true,
            health: true,
            finance: true,
            timings: true,
            isSaved: true,
            isRead: true,
            userFeedback: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.reading.count({ where }),
      ]);
      
      const hasMore = offset + limit < total;
      
      return { readings, total, hasMore };
    } catch (error) {
      console.error('[ReadingRepository] Error getting readings:', error);
      throw new Error('Failed to fetch readings');
    }
  }
  
  /**
   * Get latest reading for user
   */
  async getLatestReading(
    userId: string,
    type: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<any | null> {
    try {
      const reading = await prisma.reading.findFirst({
        where: {
          userId,
          readingType: type,
        },
        orderBy: { readingDate: 'desc' },
      });
      
      return reading;
    } catch (error) {
      console.error('[ReadingRepository] Error getting latest reading:', error);
      throw new Error('Failed to fetch latest reading');
    }
  }
  
  /**
   * Save new reading
   */
  async saveReading(reading: Prisma.ReadingCreateInput): Promise<any> {
    try {
      return await prisma.reading.create({
        data: reading,
      });
    } catch (error) {
      console.error('[ReadingRepository] Error saving reading:', error);
      throw new Error('Failed to save reading');
    }
  }
  
  /**
   * Update existing reading
   */
  async updateReading(
    id: string,
    updates: Prisma.ReadingUpdateInput
  ): Promise<any> {
    try {
      return await prisma.reading.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[ReadingRepository] Error updating reading:', error);
      throw new Error('Failed to update reading');
    }
  }
  
  /**
   * Delete reading
   */
  async deleteReading(id: string): Promise<void> {
    try {
      await prisma.reading.delete({
        where: { id },
      });
    } catch (error) {
      console.error('[ReadingRepository] Error deleting reading:', error);
      throw new Error('Failed to delete reading');
    }
  }
  
  /**
   * Mark reading as read
   */
  async markAsRead(id: string): Promise<any> {
    try {
      return await this.updateReading(id, { 
        isRead: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('[ReadingRepository] Error marking as read:', error);
      throw new Error('Failed to mark reading as read');
    }
  }
  
  /**
   * Toggle saved status
   */
  async toggleSaved(id: string, isSaved: boolean): Promise<any> {
    try {
      return await this.updateReading(id, { 
        isSaved,
        savedAt: isSaved ? new Date() : null,
      });
    } catch (error) {
      console.error('[ReadingRepository] Error toggling saved status:', error);
      throw new Error('Failed to update saved status');
    }
  }
  
  /**
   * Add user feedback
   */
  async addFeedback(
    id: string,
    feedback: 'helpful' | 'not_helpful'
  ): Promise<any> {
    try {
      return await this.updateReading(id, { 
        userFeedback: feedback,
        feedbackAt: new Date(),
      });
    } catch (error) {
      console.error('[ReadingRepository] Error adding feedback:', error);
      throw new Error('Failed to add feedback');
    }
  }
  
  /**
   * Check if reading exists for user and date
   */
  async exists(
    userId: string,
    date: string | Date,
    type: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<boolean> {
    try {
      const readingDate = typeof date === 'string' ? new Date(date) : date;
      
      const count = await prisma.reading.count({
        where: {
          userId,
          readingDate,
          readingType: type,
        },
      });
      
      return count > 0;
    } catch (error) {
      console.error('[ReadingRepository] Error checking existence:', error);
      return false;
    }
  }
  
  /**
   * Get reading statistics for user
   */
  async getStats(userId: string): Promise<ReadingStats> {
    try {
      const [total, saved, read, withFeedback, byType] = await Promise.all([
        prisma.reading.count({ where: { userId } }),
        prisma.reading.count({ where: { userId, isSaved: true } }),
        prisma.reading.count({ where: { userId, isRead: true } }),
        prisma.reading.count({ where: { userId, userFeedback: { not: null } } }),
        prisma.reading.groupBy({
          by: ['readingType'],
          where: { userId },
          _count: { id: true },
        }),
      ]);
      
      const typeStats = {
        daily: 0,
        weekly: 0,
        monthly: 0,
      };
      
      byType.forEach((group) => {
        if (group.readingType in typeStats) {
          typeStats[group.readingType as keyof typeof typeStats] = group._count.id;
        }
      });
      
      return {
        total,
        saved,
        read,
        withFeedback,
        byType: typeStats,
      };
    } catch (error) {
      console.error('[ReadingRepository] Error getting stats:', error);
      throw new Error('Failed to get reading statistics');
    }
  }
  
  /**
   * Get readings for date range (for admin/analytics)
   */
  async getReadingsInRange(
    startDate: Date,
    endDate: Date,
    type?: 'daily' | 'weekly' | 'monthly'
  ): Promise<any[]> {
    try {
      return await prisma.reading.findMany({
        where: {
          readingDate: {
            gte: startDate,
            lte: endDate,
          },
          ...(type && { readingType: type }),
        },
        orderBy: { readingDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('[ReadingRepository] Error getting readings in range:', error);
      throw new Error('Failed to fetch readings in range');
    }
  }
  
  /**
   * Bulk delete readings for user (for GDPR compliance)
   */
  async deleteAllForUser(userId: string): Promise<number> {
    try {
      const result = await prisma.reading.deleteMany({
        where: { userId },
      });
      
      return result.count;
    } catch (error) {
      console.error('[ReadingRepository] Error deleting all readings for user:', error);
      throw new Error('Failed to delete user readings');
    }
  }
  
  /**
   * Get reading by ID with ownership check
   */
  async getReadingById(id: string, userId?: string): Promise<any | null> {
    try {
      const reading = await prisma.reading.findUnique({
        where: { id },
        ...(userId && {
          include: {
            user: {
              select: { id: true },
            },
          },
        }),
      });
      
      // Check ownership if userId provided
      if (userId && reading && reading.userId !== userId) {
        return null;
      }
      
      return reading;
    } catch (error) {
      console.error('[ReadingRepository] Error getting reading by ID:', error);
      throw new Error('Failed to fetch reading');
    }
  }
}

// Singleton instance
export const readingRepo = new ReadingRepository();
