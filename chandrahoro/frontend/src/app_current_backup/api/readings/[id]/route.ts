/**
 * ChandraHoro V2.1 - Individual Reading API
 * 
 * API endpoints for individual reading operations with cache invalidation.
 * Handles reading updates, deletions, and interactions with proper cache management.
 * 
 * Endpoints:
 * - GET /api/readings/[id] - Get specific reading
 * - PUT /api/readings/[id] - Update reading (save, mark read, feedback)
 * - DELETE /api/readings/[id] - Delete specific reading
 * 
 * Features:
 * - Ownership verification
 * - Automatic cache invalidation
 * - User interaction tracking
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readingCache } from '@/lib/cache/reading-cache';
import { readingRepo } from '@/lib/repositories/reading-repository';
import { successResponse, errorResponse } from '@/lib/api/response';
import { format } from 'date-fns';

// GET /api/readings/[id] - Get specific reading
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const reading = await readingRepo.getReadingById(params.id, session.user.id);
    
    if (!reading) {
      return errorResponse('READING_NOT_FOUND', 'Reading not found', 404);
    }
    
    return successResponse(reading, 200);
  } catch (error: any) {
    console.error('[ReadingAPI] Error fetching reading:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

// PUT /api/readings/[id] - Update reading with cache invalidation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    
    // Get reading to verify ownership and get date for cache invalidation
    const reading = await readingRepo.getReadingById(params.id, session.user.id);
    
    if (!reading) {
      return errorResponse('READING_NOT_FOUND', 'Reading not found', 404);
    }
    
    // Prepare update data
    const updateData: any = {};
    
    // Handle boolean fields
    if (typeof body.isSaved === 'boolean') {
      updateData.isSaved = body.isSaved;
      if (body.isSaved) {
        updateData.savedAt = new Date();
      } else {
        updateData.savedAt = null;
      }
    }
    
    if (typeof body.isRead === 'boolean') {
      updateData.isRead = body.isRead;
      if (body.isRead) {
        updateData.readAt = new Date();
      }
    }
    
    // Handle user feedback
    if (body.userFeedback && ['helpful', 'not_helpful'].includes(body.userFeedback)) {
      updateData.userFeedback = body.userFeedback;
      updateData.feedbackAt = new Date();
    }
    
    // Handle content updates (admin only)
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
    if (isAdmin) {
      if (body.highlights) updateData.highlights = body.highlights;
      if (body.work !== undefined) updateData.work = body.work;
      if (body.love !== undefined) updateData.love = body.love;
      if (body.health !== undefined) updateData.health = body.health;
      if (body.finance !== undefined) updateData.finance = body.finance;
      if (body.timings !== undefined) updateData.timings = body.timings;
    }
    
    // Validate that we have something to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('NO_UPDATES', 'No valid updates provided', 400);
    }
    
    // Update reading
    const updated = await readingRepo.updateReading(params.id, updateData);
    
    // Invalidate cache
    const dateStr = format(new Date(reading.readingDate), 'yyyy-MM-dd');
    await readingCache.delete(session.user.id, dateStr);
    
    // Also invalidate user's list and latest caches
    await readingCache.invalidateUserCaches(session.user.id);
    
    return successResponse(updated, 200, {
      message: 'Reading updated successfully',
      invalidatedCache: true,
    });
  } catch (error: any) {
    console.error('[ReadingAPI] Error updating reading:', error);
    return errorResponse('UPDATE_ERROR', error.message, 500);
  }
}

// DELETE /api/readings/[id] - Delete specific reading
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // Get reading to verify ownership and get date for cache invalidation
    const reading = await readingRepo.getReadingById(params.id, session.user.id);
    
    if (!reading) {
      return errorResponse('READING_NOT_FOUND', 'Reading not found', 404);
    }
    
    // Check if user can delete (only admin or own readings)
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
    const isOwner = reading.userId === session.user.id;
    
    if (!isAdmin && !isOwner) {
      return errorResponse('FORBIDDEN', 'Cannot delete this reading', 403);
    }
    
    // Delete reading
    await readingRepo.deleteReading(params.id);
    
    // Invalidate cache
    const dateStr = format(new Date(reading.readingDate), 'yyyy-MM-dd');
    await readingCache.delete(reading.userId, dateStr);
    
    // Also invalidate user's list and latest caches
    await readingCache.invalidateUserCaches(reading.userId);
    
    return successResponse({ deleted: true }, 200, {
      message: 'Reading deleted successfully',
      invalidatedCache: true,
    });
  } catch (error: any) {
    console.error('[ReadingAPI] Error deleting reading:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}

// PATCH /api/readings/[id] - Quick actions (mark read, toggle save, add feedback)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    const { action, value } = body;
    
    // Get reading to verify ownership
    const reading = await readingRepo.getReadingById(params.id, session.user.id);
    
    if (!reading) {
      return errorResponse('READING_NOT_FOUND', 'Reading not found', 404);
    }
    
    let updated;
    
    switch (action) {
      case 'mark_read':
        updated = await readingRepo.markAsRead(params.id);
        break;
        
      case 'toggle_saved':
        const isSaved = typeof value === 'boolean' ? value : !reading.isSaved;
        updated = await readingRepo.toggleSaved(params.id, isSaved);
        break;
        
      case 'add_feedback':
        if (!value || !['helpful', 'not_helpful'].includes(value)) {
          return errorResponse('INVALID_FEEDBACK', 'Feedback must be "helpful" or "not_helpful"', 400);
        }
        updated = await readingRepo.addFeedback(params.id, value);
        break;
        
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
    
    // Invalidate cache
    const dateStr = format(new Date(reading.readingDate), 'yyyy-MM-dd');
    await readingCache.delete(session.user.id, dateStr);
    
    // Also invalidate user's list and latest caches
    await readingCache.invalidateUserCaches(session.user.id);
    
    return successResponse(updated, 200, {
      message: `Reading ${action.replace('_', ' ')} successfully`,
      action,
      invalidatedCache: true,
    });
  } catch (error: any) {
    console.error('[ReadingAPI] Error in PATCH request:', error);
    return errorResponse('PATCH_ERROR', error.message, 500);
  }
}
