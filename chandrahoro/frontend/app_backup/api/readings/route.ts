/**
 * ChandraHoro V2.1 - Readings API
 * 
 * Handles reading operations: list user readings and generate new readings.
 * Integrates with AI service for reading generation and Redis for caching.
 * 
 * GET /api/readings - List user's readings with pagination
 * POST /api/readings - Generate new reading
 * 
 * Features:
 * - Paginated reading list with filtering
 * - AI-powered reading generation
 * - Redis caching for performance
 * - Rate limiting and quota management
 * - Duplicate reading prevention
 * 
 * @example
 * ```typescript
 * // List readings
 * const response = await fetch('/api/readings?limit=10&type=daily');
 * 
 * // Generate reading
 * const response = await fetch('/api/readings', {
 *   method: 'POST',
 *   body: JSON.stringify({ date: '2024-10-26', type: 'daily' })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withReadingRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validate, validateQuery, schemas } from '@/lib/middleware/validate';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { generateDailyReading } from '@/lib/ai';
import { getCachedReading, setCachedReading } from '@/lib/redis';

/**
 * GET /api/readings
 * 
 * List user's readings with pagination and filtering options.
 * Supports filtering by type, date range, and saved status.
 * 
 * @param request - HTTP request with query parameters
 * @returns Paginated list of readings
 */
export const GET = withErrorHandler(
  withAuth(
    withReadingRateLimit(
      validateQuery(schemas.readingsQuery)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const {
            limit,
            offset,
            type,
            startDate,
            endDate,
            isSaved,
          } = (request as any).validatedQuery;
          
          // Build where clause
          const where: any = { userId };
          
          if (type) {
            where.readingType = type;
          }
          
          if (startDate || endDate) {
            where.readingDate = {};
            if (startDate) {
              where.readingDate.gte = new Date(startDate);
            }
            if (endDate) {
              where.readingDate.lte = new Date(endDate);
            }
          }
          
          if (typeof isSaved === 'boolean') {
            where.isSaved = isSaved;
          }
          
          // Execute queries in parallel
          const [readings, total] = await Promise.all([
            prisma.reading.findMany({
              where,
              orderBy: { readingDate: 'desc' },
              take: limit,
              skip: offset,
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
            }),
            prisma.reading.count({ where }),
          ]);
          
          // Format response data
          const formattedReadings = readings.map(reading => ({
            ...reading,
            readingDate: reading.readingDate.toISOString().split('T')[0],
            generatedAt: reading.generatedAt.toISOString(),
            createdAt: reading.createdAt.toISOString(),
            updatedAt: reading.updatedAt.toISOString(),
          }));
          
          return paginatedResponse(
            formattedReadings,
            { total, limit, offset },
            200,
            {
              filters: { type, startDate, endDate, isSaved },
            }
          );
        }
      ),
      'list'
    )
  )
);

/**
 * POST /api/readings
 * 
 * Generate a new reading using AI service.
 * Checks for existing readings and uses caching for performance.
 * 
 * @param request - HTTP request with reading parameters
 * @returns Generated reading data
 */
export const POST = withErrorHandler(
  withAuth(
    withReadingRateLimit(
      validate(schemas.createReading)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const { date, type, chartId } = (request as any).validatedData;
          
          // Check if reading already exists
          const existingReading = await prisma.reading.findFirst({
            where: {
              userId,
              readingDate: new Date(date),
              readingType: type,
            },
          });
          
          if (existingReading) {
            return successResponse(
              {
                ...existingReading,
                readingDate: existingReading.readingDate.toISOString().split('T')[0],
                generatedAt: existingReading.generatedAt.toISOString(),
                createdAt: existingReading.createdAt.toISOString(),
                updatedAt: existingReading.updatedAt.toISOString(),
              },
              200,
              { cached: true, source: 'database' }
            );
          }
          
          // Check Redis cache for daily readings
          if (type === 'daily') {
            const cachedReading = await getCachedReading(userId, date);
            if (cachedReading) {
              return successResponse(
                cachedReading,
                200,
                { cached: true, source: 'redis' }
              );
            }
          }
          
          // Get user's birth chart (default or specified)
          let birthChart;
          if (chartId) {
            birthChart = await prisma.birthChart.findFirst({
              where: { id: chartId, userId },
            });
          } else {
            birthChart = await prisma.birthChart.findFirst({
              where: { userId, isDefault: true },
            });
          }
          
          if (!birthChart) {
            return successResponse(
              {
                error: 'NO_BIRTH_CHART',
                message: 'Please create a birth chart first to generate readings.',
                requiresChart: true,
              },
              400
            );
          }
          
          // Generate reading using AI service
          const readingData = await generateDailyReading(
            userId,
            date,
            type,
            birthChart
          );
          
          // Save to database
          const reading = await prisma.reading.create({
            data: {
              userId,
              readingDate: new Date(date),
              readingType: type,
              content: readingData.content,
              aiModel: readingData.aiModel,
              tokensUsed: readingData.tokensUsed,
              cost: readingData.cost,
              isSaved: false,
              isRead: false,
              generatedAt: new Date(),
            },
          });
          
          // Cache daily readings in Redis
          if (type === 'daily') {
            const cacheData = {
              ...reading,
              readingDate: reading.readingDate.toISOString().split('T')[0],
              generatedAt: reading.generatedAt.toISOString(),
              createdAt: reading.createdAt.toISOString(),
              updatedAt: reading.updatedAt.toISOString(),
            };
            
            await setCachedReading(userId, date, cacheData);
          }
          
          // Log reading generation
          console.log(`✅ Reading generated: ${reading.id} for user ${userId} (${type}, ${date})`);
          
          return successResponse(
            {
              ...reading,
              readingDate: reading.readingDate.toISOString().split('T')[0],
              generatedAt: reading.generatedAt.toISOString(),
              createdAt: reading.createdAt.toISOString(),
              updatedAt: reading.updatedAt.toISOString(),
            },
            201,
            {
              generated: true,
              chartUsed: birthChart.id,
              aiModel: readingData.aiModel,
              tokensUsed: readingData.tokensUsed,
              cost: readingData.cost,
            }
          );
        }
      ),
      'create'
    )
  )
);

/**
 * OPTIONS /api/readings
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
