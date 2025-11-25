/**
 * ChandraHoro V2.1 - Readings API
 * 
 * Main API endpoint for reading operations with cache-aside pattern.
 * Implements multi-layer caching strategy: Redis → MySQL → Generate
 * 
 * Endpoints:
 * - GET /api/readings - List user's readings with pagination
 * - POST /api/readings - Create new reading (admin only)
 * 
 * Features:
 * - Cache-first retrieval strategy
 * - Automatic cache invalidation
 * - Pagination and filtering
 * - Performance metrics
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readingCache } from '@/lib/cache/reading-cache';
import { readingRepo } from '@/lib/repositories/reading-repository';
import { successResponse, errorResponse } from '@/lib/api/response';

// GET /api/readings - List readings with cache-aside pattern
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as 'daily' | 'weekly' | 'monthly' | null;
    const savedOnly = searchParams.get('saved') === 'true';
    const isRead = searchParams.get('read') === 'true' ? true : 
                   searchParams.get('read') === 'false' ? false : undefined;
    const startDate = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined;
    const endDate = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined;
    
    const userId = session.user.id;
    const startTime = Date.now();
    
    // Try cache first (only for first page with no complex filters)
    const canUseCache = offset === 0 && !type && !savedOnly && !startDate && !endDate && isRead === undefined;
    
    if (canUseCache) {
      const cached = await readingCache.getList(userId);
      if (cached) {
        const responseTime = Date.now() - startTime;
        return successResponse(cached, 200, {
          source: 'cache',
          total: cached.length,
          limit,
          offset,
          responseTime,
          cached: true,
        });
      }
    }
    
    // Fetch from database
    const filters = {
      limit,
      offset,
      type: type || undefined,
      savedOnly,
      isRead,
      startDate,
      endDate,
    };
    
    const { readings, total, hasMore } = await readingRepo.getReadings(userId, filters);
    
    // Cache first page if no filters
    if (canUseCache && readings.length > 0) {
      await readingCache.setList(userId, readings);
    }
    
    const responseTime = Date.now() - startTime;
    
    return successResponse(readings, 200, {
      source: 'database',
      total,
      limit,
      offset,
      hasMore,
      responseTime,
      cached: false,
    });
  } catch (error: any) {
    console.error('[ReadingsAPI] Error fetching readings:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

// POST /api/readings - Create new reading (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin (you may want to implement proper role checking)
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'readingType', 'readingDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse('VALIDATION_ERROR', `Missing required field: ${field}`, 400);
      }
    }
    
    // Check if reading already exists
    const exists = await readingRepo.exists(
      body.userId,
      new Date(body.readingDate),
      body.readingType
    );
    
    if (exists) {
      return errorResponse(
        'READING_EXISTS',
        'Reading already exists for this user and date',
        409
      );
    }
    
    // Create reading
    const readingData = {
      userId: body.userId,
      readingType: body.readingType,
      readingDate: new Date(body.readingDate),
      highlights: body.highlights || [],
      work: body.work || null,
      love: body.love || null,
      health: body.health || null,
      finance: body.finance || null,
      timings: body.timings || null,
      isSaved: body.isSaved || false,
      isRead: body.isRead || false,
      userFeedback: body.userFeedback || null,
    };
    
    const reading = await readingRepo.saveReading(readingData);
    
    // Invalidate user's cache
    await readingCache.deleteAllForUser(body.userId);
    
    return successResponse(reading, 201, {
      message: 'Reading created successfully',
    });
  } catch (error: any) {
    console.error('[ReadingsAPI] Error creating reading:', error);
    return errorResponse('CREATE_ERROR', error.message, 500);
  }
}

// DELETE /api/readings - Bulk delete readings (admin only)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  // Check if user is admin
  const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
  if (!isAdmin) {
    return errorResponse('FORBIDDEN', 'Admin access required', 403);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const readingIds = searchParams.get('reading_ids')?.split(',');
    
    if (!userId && !readingIds) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Either user_id or reading_ids must be provided',
        400
      );
    }
    
    let deletedCount = 0;
    
    if (userId) {
      // Delete all readings for user
      deletedCount = await readingRepo.deleteAllForUser(userId);
      await readingCache.deleteAllForUser(userId);
    } else if (readingIds) {
      // Delete specific readings
      for (const id of readingIds) {
        try {
          const reading = await readingRepo.getReadingById(id);
          if (reading) {
            await readingRepo.deleteReading(id);
            
            // Invalidate cache for this reading
            const dateStr = reading.readingDate.toISOString().split('T')[0];
            await readingCache.delete(reading.userId, dateStr);
            
            deletedCount++;
          }
        } catch (error) {
          console.error(`[ReadingsAPI] Error deleting reading ${id}:`, error);
        }
      }
    }
    
    return successResponse({ deletedCount }, 200, {
      message: `Successfully deleted ${deletedCount} reading(s)`,
    });
  } catch (error: any) {
    console.error('[ReadingsAPI] Error deleting readings:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}
