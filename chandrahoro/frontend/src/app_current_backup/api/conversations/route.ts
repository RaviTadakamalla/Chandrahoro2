/**
 * ChandraHoro V2.1 - Conversations API
 * 
 * API endpoints for conversation management.
 * Handles listing, creating, and managing chat conversations.
 * 
 * Endpoints:
 * - GET /api/conversations - List user's conversations
 * - POST /api/conversations - Create new conversation
 * 
 * Features:
 * - Pagination and filtering
 * - Search functionality
 * - Conversation statistics
 * - Archive management
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { conversationManager } from '@/lib/services/conversation-manager';
import { successResponse, errorResponse } from '@/lib/api/response';

// GET /api/conversations - List conversations with filtering and pagination
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');
    const archived = searchParams.get('archived') === 'true';
    const contextType = searchParams.get('context_type') || undefined;
    const search = searchParams.get('search') || undefined;
    const includeStats = searchParams.get('include_stats') === 'true';
    
    const userId = session.user.id;
    const startTime = Date.now();
    
    // Get conversations
    const { conversations, total, hasMore } = await conversationManager.list(userId, {
      limit,
      offset,
      archived,
      contextType,
      search,
    });
    
    // Get statistics if requested
    let stats = null;
    if (includeStats && offset === 0) {
      try {
        stats = await conversationManager.getStats(userId);
      } catch (error) {
        console.error('[ConversationsAPI] Error getting stats:', error);
        // Continue without stats
      }
    }
    
    const responseTime = Date.now() - startTime;
    
    return successResponse(conversations, 200, {
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
      stats,
      responseTime,
      filters: {
        archived,
        contextType,
        search,
      },
    });
  } catch (error: any) {
    console.error('[ConversationsAPI] Error fetching conversations:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    const { title, contextType = 'general', metadata = {} } = body;
    
    // Validate input
    if (title && typeof title !== 'string') {
      return errorResponse('INVALID_TITLE', 'Title must be a string', 400);
    }
    
    if (title && title.length > 200) {
      return errorResponse('TITLE_TOO_LONG', 'Title too long (max 200 characters)', 400);
    }
    
    const validContextTypes = ['general', 'chart_analysis', 'transit_reading', 'compatibility'];
    if (!validContextTypes.includes(contextType)) {
      return errorResponse('INVALID_CONTEXT_TYPE', 'Invalid context type', 400);
    }
    
    // Create conversation
    const conversation = await conversationManager.create(session.user.id, {
      title: title || 'New Conversation',
      contextType,
      metadata,
    });
    
    return successResponse(conversation, 201, {
      message: 'Conversation created successfully',
    });
  } catch (error: any) {
    console.error('[ConversationsAPI] Error creating conversation:', error);
    return errorResponse('CREATE_ERROR', error.message, 500);
  }
}

// DELETE /api/conversations - Bulk delete conversations
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const conversationIds = searchParams.get('ids')?.split(',') || [];
    const archiveOld = searchParams.get('archive_old') === 'true';
    const deleteOld = searchParams.get('delete_old') === 'true';
    const daysOld = parseInt(searchParams.get('days_old') || '30');
    
    const userId = session.user.id;
    let deletedCount = 0;
    let archivedCount = 0;
    
    // Handle specific conversation IDs
    if (conversationIds.length > 0) {
      for (const id of conversationIds) {
        try {
          // Check ownership
          const isOwner = await conversationManager.checkOwnership(id, userId);
          if (isOwner) {
            await conversationManager.delete(id);
            deletedCount++;
          }
        } catch (error) {
          console.error(`[ConversationsAPI] Error deleting conversation ${id}:`, error);
        }
      }
    }
    
    // Handle bulk archive old conversations
    if (archiveOld) {
      try {
        archivedCount = await conversationManager.archiveOldConversations(userId, daysOld);
      } catch (error) {
        console.error('[ConversationsAPI] Error archiving old conversations:', error);
      }
    }
    
    // Handle bulk delete old archived conversations
    if (deleteOld) {
      try {
        const oldDeletedCount = await conversationManager.deleteOldArchivedConversations(userId, daysOld);
        deletedCount += oldDeletedCount;
      } catch (error) {
        console.error('[ConversationsAPI] Error deleting old conversations:', error);
      }
    }
    
    return successResponse({ 
      deletedCount,
      archivedCount,
    }, 200, {
      message: `Successfully processed conversations`,
    });
  } catch (error: any) {
    console.error('[ConversationsAPI] Error in bulk operations:', error);
    return errorResponse('BULK_OPERATION_ERROR', error.message, 500);
  }
}

// PATCH /api/conversations - Bulk update conversations
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    const { conversationIds, updates } = body;
    
    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return errorResponse('INVALID_IDS', 'Conversation IDs are required', 400);
    }
    
    if (!updates || typeof updates !== 'object') {
      return errorResponse('INVALID_UPDATES', 'Updates object is required', 400);
    }
    
    const userId = session.user.id;
    const results = [];
    
    for (const id of conversationIds) {
      try {
        // Check ownership
        const isOwner = await conversationManager.checkOwnership(id, userId);
        if (!isOwner) {
          results.push({ id, success: false, error: 'Not found or access denied' });
          continue;
        }
        
        // Update conversation
        await conversationManager.update(id, updates);
        results.push({ id, success: true });
      } catch (error: any) {
        results.push({ id, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return successResponse(results, 200, {
      message: `Updated ${successCount} conversation(s), ${failureCount} failed`,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    console.error('[ConversationsAPI] Error in bulk update:', error);
    return errorResponse('BULK_UPDATE_ERROR', error.message, 500);
  }
}
