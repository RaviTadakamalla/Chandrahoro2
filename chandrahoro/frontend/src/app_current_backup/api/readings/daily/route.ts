/**
 * ChandraHoro V2.1 - Daily Reading API
 * 
 * API endpoint for daily reading retrieval with cache-aside pattern.
 * Implements the complete caching strategy: Redis → MySQL → Generate
 * 
 * Endpoints:
 * - GET /api/readings/daily?date=YYYY-MM-DD - Get daily reading
 * 
 * Cache Strategy:
 * 1. Check Redis cache (24h TTL)
 * 2. Check MySQL database
 * 3. Generate new reading (if today/future)
 * 4. Return 404 for past dates without readings
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readingCache } from '@/lib/cache/reading-cache';
import { readingRepo } from '@/lib/repositories/reading-repository';
import { generateDailyReading } from '@/lib/services/daily-reading-service';
import { successResponse, errorResponse } from '@/lib/api/response';
import { format, isAfter, startOfDay } from 'date-fns';

// GET /api/readings/daily?date=2024-10-26
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const forceRegenerate = searchParams.get('force') === 'true';
    
    // Default to today if no date provided
    const requestedDate = dateParam ? new Date(dateParam) : new Date();
    const dateStr = format(requestedDate, 'yyyy-MM-dd');
    const userId = session.user.id;
    
    // Validate date format
    if (isNaN(requestedDate.getTime())) {
      return errorResponse('INVALID_DATE', 'Invalid date format. Use YYYY-MM-DD', 400);
    }
    
    const startTime = Date.now();
    
    // Skip cache if force regenerate
    if (!forceRegenerate) {
      // 1. Try Redis cache first
      const cached = await readingCache.get(userId, dateStr);
      if (cached) {
        const responseTime = Date.now() - startTime;
        return successResponse(cached, 200, { 
          source: 'cache',
          responseTime,
          cached: true,
          date: dateStr,
        });
      }
      
      // 2. Try MySQL database
      const fromDb = await readingRepo.getReading(userId, requestedDate, 'daily');
      if (fromDb) {
        // Cache it for next time
        await readingCache.set(userId, dateStr, fromDb);
        
        const responseTime = Date.now() - startTime;
        return successResponse(fromDb, 200, { 
          source: 'database',
          responseTime,
          cached: false,
          date: dateStr,
        });
      }
    }
    
    // 3. Generate new reading (only if it's today or future)
    const today = startOfDay(new Date());
    const requestedDateStart = startOfDay(requestedDate);
    
    if (isAfter(requestedDateStart, today) || requestedDateStart.getTime() === today.getTime()) {
      try {
        const generated = await generateDailyReading({
          userId,
          date: requestedDate,
          forceRegenerate,
        });
        
        const responseTime = Date.now() - startTime;
        return successResponse(generated, 201, { 
          source: 'generated',
          responseTime,
          cached: false,
          date: dateStr,
          message: 'New reading generated successfully',
        });
      } catch (generateError: any) {
        console.error('[DailyReadingAPI] Error generating reading:', generateError);
        
        // If generation fails, return a helpful error
        if (generateError.message.includes('quota')) {
          return errorResponse(
            'QUOTA_EXCEEDED',
            'Daily reading quota exceeded. Please try again tomorrow.',
            429
          );
        }
        
        return errorResponse(
          'GENERATION_ERROR',
          'Failed to generate reading. Please try again later.',
          500
        );
      }
    }
    
    // 4. Not found (past date, never generated)
    const responseTime = Date.now() - startTime;
    return errorResponse(
      'READING_NOT_FOUND',
      `No reading available for ${dateStr}. Readings can only be generated for today or future dates.`,
      404,
      {
        responseTime,
        date: dateStr,
        canGenerate: false,
      }
    );
  } catch (error: any) {
    console.error('[DailyReadingAPI] Error fetching daily reading:', error);
    return errorResponse('READING_FETCH_ERROR', error.message, 500);
  }
}

// POST /api/readings/daily - Force regenerate daily reading
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    const { date, forceRegenerate = true } = body;
    
    const requestedDate = date ? new Date(date) : new Date();
    const dateStr = format(requestedDate, 'yyyy-MM-dd');
    const userId = session.user.id;
    
    // Validate date
    if (isNaN(requestedDate.getTime())) {
      return errorResponse('INVALID_DATE', 'Invalid date format', 400);
    }
    
    // Only allow regeneration for today or future
    const today = startOfDay(new Date());
    const requestedDateStart = startOfDay(requestedDate);
    
    if (requestedDateStart < today) {
      return errorResponse(
        'INVALID_DATE',
        'Cannot regenerate readings for past dates',
        400
      );
    }
    
    const startTime = Date.now();
    
    try {
      // Generate new reading
      const generated = await generateDailyReading({
        userId,
        date: requestedDate,
        forceRegenerate,
      });
      
      const responseTime = Date.now() - startTime;
      return successResponse(generated, 201, {
        source: 'regenerated',
        responseTime,
        date: dateStr,
        message: 'Reading regenerated successfully',
      });
    } catch (generateError: any) {
      console.error('[DailyReadingAPI] Error regenerating reading:', generateError);
      
      if (generateError.message.includes('quota')) {
        return errorResponse(
          'QUOTA_EXCEEDED',
          'Daily reading quota exceeded. Please try again tomorrow.',
          429
        );
      }
      
      return errorResponse(
        'GENERATION_ERROR',
        'Failed to regenerate reading. Please try again later.',
        500
      );
    }
  } catch (error: any) {
    console.error('[DailyReadingAPI] Error in POST request:', error);
    return errorResponse('REQUEST_ERROR', error.message, 500);
  }
}

// DELETE /api/readings/daily - Delete daily reading and clear cache
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return errorResponse('MISSING_DATE', 'Date parameter is required', 400);
    }
    
    const requestedDate = new Date(dateParam);
    const dateStr = format(requestedDate, 'yyyy-MM-dd');
    const userId = session.user.id;
    
    // Validate date
    if (isNaN(requestedDate.getTime())) {
      return errorResponse('INVALID_DATE', 'Invalid date format', 400);
    }
    
    // Find the reading
    const reading = await readingRepo.getReading(userId, requestedDate, 'daily');
    if (!reading) {
      return errorResponse('READING_NOT_FOUND', 'Reading not found', 404);
    }
    
    // Delete from database
    await readingRepo.deleteReading(reading.id);
    
    // Clear from cache
    await readingCache.delete(userId, dateStr);
    
    return successResponse({ deleted: true }, 200, {
      message: 'Reading deleted successfully',
      date: dateStr,
    });
  } catch (error: any) {
    console.error('[DailyReadingAPI] Error deleting reading:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}
