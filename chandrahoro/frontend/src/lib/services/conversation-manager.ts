/**
 * ChandraHoro V2.1 - Conversation Manager
 * 
 * Manages chat conversations in MySQL via Prisma.
 * Handles conversation lifecycle, metadata, and message management.
 * 
 * Features:
 * - Conversation CRUD operations
 * - Message management and threading
 * - Automatic title generation
 * - Usage tracking and analytics
 * - Archive and cleanup functionality
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ConversationCreateOptions {
  title?: string;
  contextType?: 'general' | 'chart_analysis' | 'transit_reading' | 'compatibility';
  metadata?: Record<string, any>;
}

export interface ConversationListOptions {
  limit?: number;
  offset?: number;
  archived?: boolean;
  contextType?: string;
  search?: string;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  averageMessagesPerConversation: number;
  mostActiveDay: string;
}

export class ConversationManager {
  /**
   * Create new conversation
   */
  async create(
    userId: string,
    options: ConversationCreateOptions = {}
  ): Promise<any> {
    try {
      const { title, contextType = 'general', metadata = {} } = options;
      
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title || 'New Conversation',
          contextType,
          metadata: metadata as Prisma.JsonValue,
          lastMessageAt: new Date(),
        },
      });
      
      return conversation;
    } catch (error) {
      console.error('[ConversationManager] Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }
  
  /**
   * Get conversation with messages
   */
  async get(conversationId: string, includeMessages: boolean = true): Promise<any> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: includeMessages ? {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              aiModel: true,
              tokensUsed: true,
              createdAt: true,
            },
          } : false,
          _count: {
            select: { messages: true },
          },
        },
      });
      
      return conversation;
    } catch (error) {
      console.error('[ConversationManager] Error getting conversation:', error);
      throw new Error('Failed to get conversation');
    }
  }
  
  /**
   * List user's conversations with pagination and filtering
   */
  async list(
    userId: string,
    options: ConversationListOptions = {}
  ): Promise<{ conversations: any[]; total: number; hasMore: boolean }> {
    try {
      const {
        limit = 50,
        offset = 0,
        archived,
        contextType,
        search,
      } = options;
      
      const where: Prisma.ConversationWhereInput = {
        userId,
        ...(archived !== undefined && { isArchived: archived }),
        ...(contextType && { contextType }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            {
              messages: {
                some: {
                  content: { contains: search, mode: 'insensitive' },
                },
              },
            },
          ],
        }),
      };
      
      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          orderBy: { lastMessageAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            _count: {
              select: { messages: true },
            },
          },
          select: {
            id: true,
            title: true,
            contextType: true,
            messageCount: true,
            totalTokens: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            _count: true,
          },
        }),
        prisma.conversation.count({ where }),
      ]);
      
      const hasMore = offset + limit < total;
      
      return { conversations, total, hasMore };
    } catch (error) {
      console.error('[ConversationManager] Error listing conversations:', error);
      throw new Error('Failed to list conversations');
    }
  }
  
  /**
   * Update conversation metadata
   */
  async update(
    conversationId: string,
    updates: {
      title?: string;
      isArchived?: boolean;
      contextType?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<any> {
    try {
      const updateData: Prisma.ConversationUpdateInput = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived;
      if (updates.contextType !== undefined) updateData.contextType = updates.contextType;
      if (updates.metadata !== undefined) {
        updateData.metadata = updates.metadata as Prisma.JsonValue;
      }
      
      return await prisma.conversation.update({
        where: { id: conversationId },
        data: updateData,
      });
    } catch (error) {
      console.error('[ConversationManager] Error updating conversation:', error);
      throw new Error('Failed to update conversation');
    }
  }
  
  /**
   * Delete conversation and all messages
   */
  async delete(conversationId: string): Promise<void> {
    try {
      // Messages will be cascade deleted due to onDelete: Cascade in schema
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
    } catch (error) {
      console.error('[ConversationManager] Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }
  
  /**
   * Update conversation metadata after new message
   */
  async updateAfterMessage(
    conversationId: string,
    tokensUsed: number = 0,
    autoUpdateTitle: boolean = false
  ): Promise<void> {
    try {
      const updateData: Prisma.ConversationUpdateInput = {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        totalTokens: { increment: tokensUsed },
      };
      
      // Auto-update title if this is the first user message
      if (autoUpdateTitle) {
        const messageCount = await prisma.message.count({
          where: { conversationId, role: 'user' },
        });
        
        if (messageCount === 1) {
          const firstMessage = await prisma.message.findFirst({
            where: { conversationId, role: 'user' },
            select: { content: true },
          });
          
          if (firstMessage) {
            updateData.title = this.generateTitle(firstMessage.content);
          }
        }
      }
      
      await prisma.conversation.update({
        where: { id: conversationId },
        data: updateData,
      });
    } catch (error) {
      console.error('[ConversationManager] Error updating conversation metadata:', error);
      // Don't throw here as this is not critical
    }
  }
  
  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata: {
      aiModel?: string;
      tokensUsed?: number;
      responseTime?: number;
      error?: boolean;
    } = {}
  ): Promise<any> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          userId,
          role,
          content,
          aiModel: metadata.aiModel,
          tokensUsed: metadata.tokensUsed || 0,
          responseTime: metadata.responseTime,
          isError: metadata.error || false,
        },
      });
      
      // Update conversation metadata
      await this.updateAfterMessage(
        conversationId,
        metadata.tokensUsed || 0,
        role === 'user' // Auto-update title for user messages
      );
      
      return message;
    } catch (error) {
      console.error('[ConversationManager] Error adding message:', error);
      throw new Error('Failed to add message');
    }
  }
  
  /**
   * Get conversation statistics for user
   */
  async getStats(userId: string): Promise<ConversationStats> {
    try {
      const [
        totalConversations,
        totalMessages,
        tokenStats,
        messageStats,
      ] = await Promise.all([
        prisma.conversation.count({ where: { userId } }),
        prisma.message.count({ where: { userId } }),
        prisma.conversation.aggregate({
          where: { userId },
          _sum: { totalTokens: true },
        }),
        prisma.conversation.aggregate({
          where: { userId },
          _avg: { messageCount: true },
        }),
      ]);
      
      // Get most active day (simplified - just return today for now)
      const mostActiveDay = new Date().toISOString().split('T')[0];
      
      return {
        totalConversations,
        totalMessages,
        totalTokens: tokenStats._sum.totalTokens || 0,
        averageMessagesPerConversation: Math.round(messageStats._avg.messageCount || 0),
        mostActiveDay,
      };
    } catch (error) {
      console.error('[ConversationManager] Error getting stats:', error);
      throw new Error('Failed to get conversation statistics');
    }
  }
  
  /**
   * Archive old conversations
   */
  async archiveOldConversations(
    userId: string,
    daysOld: number = 30
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await prisma.conversation.updateMany({
        where: {
          userId,
          lastMessageAt: { lt: cutoffDate },
          isArchived: false,
        },
        data: { isArchived: true },
      });
      
      return result.count;
    } catch (error) {
      console.error('[ConversationManager] Error archiving conversations:', error);
      throw new Error('Failed to archive conversations');
    }
  }
  
  /**
   * Delete old archived conversations
   */
  async deleteOldArchivedConversations(
    userId: string,
    daysOld: number = 90
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await prisma.conversation.deleteMany({
        where: {
          userId,
          lastMessageAt: { lt: cutoffDate },
          isArchived: true,
        },
      });
      
      return result.count;
    } catch (error) {
      console.error('[ConversationManager] Error deleting old conversations:', error);
      throw new Error('Failed to delete old conversations');
    }
  }
  
  /**
   * Check if user owns conversation
   */
  async checkOwnership(conversationId: string, userId: string): Promise<boolean> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId: true },
      });
      
      return conversation?.userId === userId;
    } catch (error) {
      console.error('[ConversationManager] Error checking ownership:', error);
      return false;
    }
  }
  
  /**
   * Generate conversation title from first message
   */
  private generateTitle(message: string): string {
    // Clean up the message
    const cleaned = message.trim().replace(/\s+/g, ' ');
    
    // Truncate to reasonable length
    if (cleaned.length <= 60) {
      return cleaned;
    }
    
    // Try to break at word boundary
    const truncated = cleaned.substring(0, 57);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 30) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }
  
  /**
   * Get recent conversations for quick access
   */
  async getRecent(userId: string, limit: number = 5): Promise<any[]> {
    try {
      return await prisma.conversation.findMany({
        where: {
          userId,
          isArchived: false,
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          lastMessageAt: true,
          messageCount: true,
        },
      });
    } catch (error) {
      console.error('[ConversationManager] Error getting recent conversations:', error);
      return [];
    }
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();
