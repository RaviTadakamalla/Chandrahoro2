/**
 * ChandraHoro V2.1 - Individual Conversation API
 * 
 * API endpoints for individual conversation management.
 * Handles getting, updating, and deleting specific conversations.
 * 
 * Endpoints:
 * - GET /api/conversations/[id] - Get conversation with messages
 * - PUT /api/conversations/[id] - Update conversation
 * - DELETE /api/conversations/[id] - Delete conversation
 * 
 * Features:
 * - Ownership verification
 * - Message pagination
 * - Conversation metadata updates
 * - Cascade deletion handling
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { conversationManager } from '@/lib/services/conversation-manager';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const conversationId = params.id;
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get('include_messages') !== 'false';
    const messageLimit = parseInt(searchParams.get('message_limit') || '100');
    const messageOffset = parseInt(searchParams.get('message_offset') || '0');
    
    // Get conversation
    const conversation = await conversationManager.get(conversationId, false);
    
    if (!conversation || conversation.userId !== session.user.id) {
      return errorResponse('NOT_FOUND', 'Conversation not found', 404);
    }
    
    // Get messages separately if requested with pagination
    let messages = [];
    let messageStats = null;
    
    if (includeMessages) {
      const [messageData, totalMessages] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          take: Math.min(messageLimit, 200), // Max 200 messages per request
          skip: messageOffset,
          select: {
            id: true,
            role: true,
            content: true,
            aiModel: true,
            tokensUsed: true,
            responseTime: true,
            isError: true,
            createdAt: true,
          },
        }),
        prisma.message.count({
          where: { conversationId },
        }),
      ]);
      
      messages = messageData;
      messageStats = {
        total: totalMessages,
        returned: messageData.length,
        hasMore: messageOffset + messageLimit < totalMessages,
        offset: messageOffset,
        limit: messageLimit,
      };
    }
    
    return successResponse({
      ...conversation,
      messages,
    }, 200, {
      messageStats,
      includeMessages,
    });
  } catch (error: any) {
    console.error('[ConversationAPI] Error fetching conversation:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

// PUT /api/conversations/[id] - Update conversation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const conversationId = params.id;
    const body = await request.json();
    const { title, isArchived, contextType, metadata } = body;
    
    // Verify ownership
    const isOwner = await conversationManager.checkOwnership(conversationId, session.user.id);
    if (!isOwner) {
      return errorResponse('NOT_FOUND', 'Conversation not found', 404);
    }
    
    // Validate input
    if (title !== undefined) {
      if (typeof title !== 'string') {
        return errorResponse('INVALID_TITLE', 'Title must be a string', 400);
      }
      if (title.length > 200) {
        return errorResponse('TITLE_TOO_LONG', 'Title too long (max 200 characters)', 400);
      }
    }
    
    if (contextType !== undefined) {
      const validContextTypes = ['general', 'chart_analysis', 'transit_reading', 'compatibility'];
      if (!validContextTypes.includes(contextType)) {
        return errorResponse('INVALID_CONTEXT_TYPE', 'Invalid context type', 400);
      }
    }
    
    // Prepare updates
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (isArchived !== undefined) updates.isArchived = Boolean(isArchived);
    if (contextType !== undefined) updates.contextType = contextType;
    if (metadata !== undefined) updates.metadata = metadata;
    
    // Update conversation
    const updated = await conversationManager.update(conversationId, updates);
    
    return successResponse(updated, 200, {
      message: 'Conversation updated successfully',
      updatedFields: Object.keys(updates),
    });
  } catch (error: any) {
    console.error('[ConversationAPI] Error updating conversation:', error);
    return errorResponse('UPDATE_ERROR', error.message, 500);
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const conversationId = params.id;
    
    // Verify ownership and get conversation info
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        userId: true,
        title: true,
        messageCount: true,
        _count: {
          select: { messages: true },
        },
      },
    });
    
    if (!conversation || conversation.userId !== session.user.id) {
      return errorResponse('NOT_FOUND', 'Conversation not found', 404);
    }
    
    const messageCount = conversation._count.messages;
    
    // Delete conversation (messages will be cascade deleted)
    await conversationManager.delete(conversationId);
    
    return successResponse({ 
      deleted: true,
      conversationId,
      messagesDeleted: messageCount,
    }, 200, {
      message: `Conversation "${conversation.title}" deleted successfully`,
    });
  } catch (error: any) {
    console.error('[ConversationAPI] Error deleting conversation:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}

// PATCH /api/conversations/[id] - Partial updates and actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const conversationId = params.id;
    const body = await request.json();
    const { action, ...data } = body;
    
    // Verify ownership
    const isOwner = await conversationManager.checkOwnership(conversationId, session.user.id);
    if (!isOwner) {
      return errorResponse('NOT_FOUND', 'Conversation not found', 404);
    }
    
    switch (action) {
      case 'archive':
        await conversationManager.update(conversationId, { isArchived: true });
        return successResponse({ archived: true }, 200, {
          message: 'Conversation archived successfully',
        });
      
      case 'unarchive':
        await conversationManager.update(conversationId, { isArchived: false });
        return successResponse({ archived: false }, 200, {
          message: 'Conversation unarchived successfully',
        });
      
      case 'update_title':
        if (!data.title || typeof data.title !== 'string') {
          return errorResponse('INVALID_TITLE', 'Valid title is required', 400);
        }
        if (data.title.length > 200) {
          return errorResponse('TITLE_TOO_LONG', 'Title too long (max 200 characters)', 400);
        }
        
        const updated = await conversationManager.update(conversationId, { title: data.title });
        return successResponse(updated, 200, {
          message: 'Title updated successfully',
        });
      
      case 'update_context':
        const validContextTypes = ['general', 'chart_analysis', 'transit_reading', 'compatibility'];
        if (!data.contextType || !validContextTypes.includes(data.contextType)) {
          return errorResponse('INVALID_CONTEXT_TYPE', 'Valid context type is required', 400);
        }
        
        const contextUpdated = await conversationManager.update(conversationId, { 
          contextType: data.contextType 
        });
        return successResponse(contextUpdated, 200, {
          message: 'Context type updated successfully',
        });
      
      case 'clear_messages':
        // Delete all messages in conversation
        const deletedMessages = await prisma.message.deleteMany({
          where: { conversationId },
        });
        
        // Reset conversation counters
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            messageCount: 0,
            totalTokens: 0,
            lastMessageAt: new Date(),
          },
        });
        
        return successResponse({ 
          messagesCleared: deletedMessages.count,
        }, 200, {
          message: `Cleared ${deletedMessages.count} messages`,
        });
      
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
  } catch (error: any) {
    console.error('[ConversationAPI] Error in PATCH operation:', error);
    return errorResponse('PATCH_ERROR', error.message, 500);
  }
}
