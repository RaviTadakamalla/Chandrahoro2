/**
 * ChandraHoro V2.1 - Individual Reading API
 * 
 * Handles operations on specific readings: get, update, and delete.
 * Includes ownership validation and cache invalidation.
 * 
 * GET /api/readings/[id] - Get specific reading
 * PUT /api/readings/[id] - Update reading (save, mark read, feedback)
 * DELETE /api/readings/[id] - Delete reading
 * 
 * Features:
 * - Resource ownership validation
 * - Reading state management (saved, read)
 * - User feedback and rating collection
 * - Cache invalidation on updates
 * 
 * @example
 * ```typescript
 * // Get reading
 * const response = await fetch('/api/readings/reading_123');
 * 
 * // Update reading
 * const response = await fetch('/api/readings/reading_123', {
 *   method: 'PUT',
 *   body: JSON.stringify({ isSaved: true, rating: 5 })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { withOwnership } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validate, schemas } from '@/lib/middleware/validate';
import { successResponse, deletedResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { invalidateReadingCache } from '@/lib/redis';

/**
 * GET /api/readings/[id]
 * 
 * Get a specific reading by ID.
 * Validates user ownership before returning data.
 * 
 * @param request - HTTP request
 * @param params - Route parameters with reading ID
 * @returns Reading data or error response
 */
export const GET = withErrorHandler(
  withOwnership(
    'reading',
    (context: { params: { id: string } }) => context.params.id
  )(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const reading = await prisma.reading.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          userId: true,
          readingDate: true,
          readingType: true,
          content: true,
          aiModel: true,
          tokensUsed: true,
          cost: true,
          isSaved: true,
          isRead: true,
          userFeedback: true,
          rating: true,
          generatedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!reading) {
        throw new Error('NOT_FOUND');
      }
      
      // Mark as read if not already read
      if (!reading.isRead) {
        await prisma.reading.update({
          where: { id: params.id },
          data: { isRead: true },
        });
        reading.isRead = true;
      }
      
      return successResponse({
        ...reading,
        readingDate: reading.readingDate.toISOString().split('T')[0],
        generatedAt: reading.generatedAt.toISOString(),
        createdAt: reading.createdAt.toISOString(),
        updatedAt: reading.updatedAt.toISOString(),
      });
    }
  )
);

/**
 * PUT /api/readings/[id]
 * 
 * Update reading properties like saved status, feedback, and rating.
 * Validates user ownership and invalidates cache.
 * 
 * @param request - HTTP request with update data
 * @param params - Route parameters with reading ID
 * @returns Updated reading data
 */
export const PUT = withErrorHandler(
  withOwnership(
    'reading',
    (context: { params: { id: string } }) => context.params.id
  )(
    validate(schemas.updateReading)(
      async (request: NextRequest, { params }: { params: { id: string } }) => {
        const userId = (request as any).user.id;
        const updateData = (request as any).validatedData;
        
        // Get current reading for cache invalidation
        const currentReading = await prisma.reading.findUnique({
          where: { id: params.id },
          select: { readingDate: true, readingType: true },
        });
        
        if (!currentReading) {
          throw new Error('NOT_FOUND');
        }
        
        // Update reading
        const updatedReading = await prisma.reading.update({
          where: { id: params.id },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            userId: true,
            readingDate: true,
            readingType: true,
            content: true,
            aiModel: true,
            tokensUsed: true,
            cost: true,
            isSaved: true,
            isRead: true,
            userFeedback: true,
            rating: true,
            generatedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        
        // Invalidate cache for daily readings
        if (currentReading.readingType === 'daily') {
          const dateStr = currentReading.readingDate.toISOString().split('T')[0];
          await invalidateReadingCache(userId, dateStr);
        }
        
        // Log feedback if provided
        if (updateData.userFeedback || updateData.rating) {
          console.log(`📝 Reading feedback: ${params.id} - Rating: ${updateData.rating || 'N/A'}`);
        }
        
        return successResponse({
          ...updatedReading,
          readingDate: updatedReading.readingDate.toISOString().split('T')[0],
          generatedAt: updatedReading.generatedAt.toISOString(),
          createdAt: updatedReading.createdAt.toISOString(),
          updatedAt: updatedReading.updatedAt.toISOString(),
        });
      }
    )
  )
);

/**
 * DELETE /api/readings/[id]
 * 
 * Delete a specific reading.
 * Validates user ownership and invalidates cache.
 * 
 * @param request - HTTP request
 * @param params - Route parameters with reading ID
 * @returns Deletion confirmation
 */
export const DELETE = withErrorHandler(
  withOwnership(
    'reading',
    (context: { params: { id: string } }) => context.params.id
  )(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const userId = (request as any).user.id;
      
      // Get reading info before deletion for cache invalidation
      const reading = await prisma.reading.findUnique({
        where: { id: params.id },
        select: { readingDate: true, readingType: true },
      });
      
      if (!reading) {
        throw new Error('NOT_FOUND');
      }
      
      // Delete reading
      await prisma.reading.delete({
        where: { id: params.id },
      });
      
      // Invalidate cache for daily readings
      if (reading.readingType === 'daily') {
        const dateStr = reading.readingDate.toISOString().split('T')[0];
        await invalidateReadingCache(userId, dateStr);
      }
      
      // Log deletion
      console.log(`🗑️ Reading deleted: ${params.id} by user ${userId}`);
      
      return deletedResponse(params.id, {
        type: reading.readingType,
        date: reading.readingDate.toISOString().split('T')[0],
      });
    }
  )
);

/**
 * OPTIONS /api/readings/[id]
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
