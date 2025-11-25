import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateDailyReading } from '@/lib/services/daily-reading-service';
import { successResponse, errorResponse } from '@/lib/api/response';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { z } from 'zod';

// Request validation schema
const generateReadingSchema = z.object({
  date: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  forceRegenerate: z.boolean().optional().default(false),
});

// POST /api/readings/generate
export const POST = withErrorHandler(
  withRateLimit(
    async (request: NextRequest) => {
      console.log('[API] POST /api/readings/generate');
      
      // 1. Authentication check
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
      }
      
      console.log('[API] ✅ User authenticated:', session.user.id);
      
      // 2. Parse and validate request body
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return errorResponse('INVALID_JSON', 'Invalid JSON in request body', 400);
      }
      
      const validation = generateReadingSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(
          'VALIDATION_ERROR',
          'Invalid request parameters',
          400,
          validation.error.errors
        );
      }
      
      const { date: dateStr, forceRegenerate } = validation.data;
      const date = dateStr ? new Date(dateStr) : new Date();
      
      console.log('[API] ✅ Request validated:', { date: date.toISOString(), forceRegenerate });
      
      // 3. Generate reading
      try {
        const startTime = Date.now();
        
        const reading = await generateDailyReading({
          userId: session.user.id,
          date,
          forceRegenerate,
        });
        
        const totalTime = Date.now() - startTime;
        
        console.log('[API] ✅ Reading generated successfully');
        console.log('[API] Total API time:', totalTime, 'ms');
        
        return successResponse(reading, 201, {
          cached: false,
          generationTimeMs: reading.generationTimeMs,
          totalTimeMs: totalTime,
        });
      } catch (error: any) {
        console.error('[API] ❌ Reading generation failed:', error);
        
        // Handle specific error types
        if (error.message === 'AI_QUOTA_EXCEEDED') {
          return errorResponse(
            'QUOTA_EXCEEDED',
            'Daily AI request limit reached. Resets at midnight IST.',
            429,
            { resetInfo: 'Quota resets daily at midnight IST (UTC+5:30)' }
          );
        }
        
        if (error.message.includes('No birth chart found')) {
          return errorResponse(
            'CHART_REQUIRED',
            'Please complete onboarding to generate readings',
            400,
            { action: 'Complete birth chart setup in onboarding' }
          );
        }
        
        if (error.message.includes('Backend request failed')) {
          return errorResponse(
            'BACKEND_ERROR',
            'Astrological calculation service temporarily unavailable',
            503,
            { retryAfter: 60 }
          );
        }
        
        if (error.message.includes('Invalid reading structure')) {
          return errorResponse(
            'AI_PARSING_ERROR',
            'AI response could not be parsed. Please try again.',
            500,
            { suggestion: 'Try regenerating the reading' }
          );
        }
        
        // Generic error
        throw error;
      }
    },
    { 
      limit: 10, 
      window: 3600,
      keyGenerator: (req) => {
        // Rate limit per user
        return `readings:generate:${req.headers.get('x-user-id') || 'anonymous'}`;
      }
    }
  )
);

// GET /api/readings/generate - Get cached reading or generate new one
export const GET = withErrorHandler(
  withRateLimit(
    async (request: NextRequest) => {
      console.log('[API] GET /api/readings/generate');
      
      // 1. Authentication check
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
      }
      
      // 2. Parse query parameters
      const { searchParams } = new URL(request.url);
      const dateStr = searchParams.get('date');
      const date = dateStr ? new Date(dateStr) : new Date();
      
      if (isNaN(date.getTime())) {
        return errorResponse('INVALID_DATE', 'Invalid date parameter', 400);
      }
      
      console.log('[API] ✅ GET request for date:', date.toISOString());
      
      // 3. Try to get existing reading (cached or from database)
      try {
        const reading = await generateDailyReading({
          userId: session.user.id,
          date,
          forceRegenerate: false, // Always check cache first for GET
        });
        
        return successResponse(reading, 200, {
          cached: true,
          message: 'Reading retrieved successfully',
        });
      } catch (error: any) {
        console.error('[API] ❌ GET reading failed:', error);
        
        // Same error handling as POST
        if (error.message === 'AI_QUOTA_EXCEEDED') {
          return errorResponse(
            'QUOTA_EXCEEDED',
            'Daily AI request limit reached. Resets at midnight IST.',
            429
          );
        }
        
        if (error.message.includes('No birth chart found')) {
          return errorResponse(
            'CHART_REQUIRED',
            'Please complete onboarding to generate readings',
            400
          );
        }
        
        throw error;
      }
    },
    { 
      limit: 30, 
      window: 3600,
      keyGenerator: (req) => {
        return `readings:get:${req.headers.get('x-user-id') || 'anonymous'}`;
      }
    }
  )
);
