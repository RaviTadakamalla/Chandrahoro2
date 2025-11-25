/**
 * ChandraHoro V2.1 - Daily Reading API
 * 
 * Handles today's daily reading with intelligent caching and generation.
 * Optimized endpoint for the most common reading request.
 * 
 * GET /api/readings/daily - Get today's daily reading
 * 
 * Features:
 * - Automatic today's date handling
 * - Multi-level caching (Redis + Database)
 * - Automatic generation if not exists
 * - IST timezone support for Indian users
 * - Performance optimized for frequent access
 * 
 * @example
 * ```typescript
 * // Get today's reading
 * const response = await fetch('/api/readings/daily');
 * 
 * // Get specific date reading
 * const response = await fetch('/api/readings/daily?date=2024-10-26');
 * ```
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withReadingRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validateQuery } from '@/lib/middleware/validate';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { generateDailyReading } from '@/lib/ai';
import { getCachedReading, setCachedReading } from '@/lib/redis';
import { z } from 'zod';

/**
 * Query schema for daily reading endpoint
 */
const dailyReadingQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timezone: z.string().optional(),
  generate: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
});

/**
 * Get today's date in specified timezone
 * 
 * @param timezone - Timezone string (default: Asia/Kolkata for IST)
 * @returns Date string in YYYY-MM-DD format
 */
function getTodayInTimezone(timezone: string = 'Asia/Kolkata'): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * GET /api/readings/daily
 * 
 * Get today's daily reading with intelligent caching and auto-generation.
 * Checks Redis cache first, then database, then generates if needed.
 * 
 * @param request - HTTP request with optional query parameters
 * @returns Today's daily reading or error response
 */
export const GET = withErrorHandler(
  withAuth(
    withReadingRateLimit(
      validateQuery(dailyReadingQuery)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const { date, timezone, generate } = (request as any).validatedQuery;
          
          // Determine target date
          const targetDate = date || getTodayInTimezone(timezone);
          
          // Step 1: Check Redis cache
          const cachedReading = await getCachedReading(userId, targetDate);
          if (cachedReading && !generate) {
            return successResponse(
              cachedReading,
              200,
              { 
                cached: true, 
                source: 'redis',
                date: targetDate,
                timezone: timezone || 'Asia/Kolkata',
              }
            );
          }
          
          // Step 2: Check database
          const existingReading = await prisma.reading.findFirst({
            where: {
              userId,
              readingDate: new Date(targetDate),
              readingType: 'daily',
            },
            select: {
              id: true,
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
          
          if (existingReading && !generate) {
            const formattedReading = {
              ...existingReading,
              readingDate: existingReading.readingDate.toISOString().split('T')[0],
              generatedAt: existingReading.generatedAt.toISOString(),
              createdAt: existingReading.createdAt.toISOString(),
              updatedAt: existingReading.updatedAt.toISOString(),
            };
            
            // Cache in Redis for future requests
            await setCachedReading(userId, targetDate, formattedReading);
            
            return successResponse(
              formattedReading,
              200,
              { 
                cached: false, 
                source: 'database',
                date: targetDate,
                timezone: timezone || 'Asia/Kolkata',
              }
            );
          }
          
          // Step 3: Get user's default birth chart
          const birthChart = await prisma.birthChart.findFirst({
            where: { userId, isDefault: true },
          });
          
          if (!birthChart) {
            return successResponse(
              {
                error: 'NO_BIRTH_CHART',
                message: 'Please create a birth chart first to generate daily readings.',
                requiresChart: true,
                redirectTo: '/charts/create',
              },
              400,
              {
                date: targetDate,
                timezone: timezone || 'Asia/Kolkata',
              }
            );
          }
          
          // Step 4: Generate new reading
          const readingData = await generateDailyReading(
            userId,
            targetDate,
            'daily',
            birthChart
          );
          
          // Step 5: Save to database (update if exists, create if new)
          let reading;
          if (existingReading && generate) {
            // Update existing reading with new generation
            reading = await prisma.reading.update({
              where: { id: existingReading.id },
              data: {
                content: readingData.content,
                aiModel: readingData.aiModel,
                tokensUsed: readingData.tokensUsed,
                cost: readingData.cost,
                generatedAt: new Date(),
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new reading
            reading = await prisma.reading.create({
              data: {
                userId,
                readingDate: new Date(targetDate),
                readingType: 'daily',
                content: readingData.content,
                aiModel: readingData.aiModel,
                tokensUsed: readingData.tokensUsed,
                cost: readingData.cost,
                isSaved: false,
                isRead: false,
                generatedAt: new Date(),
              },
            });
          }
          
          const formattedReading = {
            ...reading,
            readingDate: reading.readingDate.toISOString().split('T')[0],
            generatedAt: reading.generatedAt.toISOString(),
            createdAt: reading.createdAt.toISOString(),
            updatedAt: reading.updatedAt.toISOString(),
          };
          
          // Step 6: Cache in Redis
          await setCachedReading(userId, targetDate, formattedReading);
          
          // Log generation
          console.log(`✅ Daily reading generated: ${reading.id} for user ${userId} (${targetDate})`);
          
          return successResponse(
            formattedReading,
            generate && existingReading ? 200 : 201,
            {
              generated: true,
              regenerated: generate && existingReading ? true : false,
              chartUsed: birthChart.id,
              aiModel: readingData.aiModel,
              tokensUsed: readingData.tokensUsed,
              cost: readingData.cost,
              date: targetDate,
              timezone: timezone || 'Asia/Kolkata',
            }
          );
        }
      ),
      'create'
    )
  )
);

/**
 * OPTIONS /api/readings/daily
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
