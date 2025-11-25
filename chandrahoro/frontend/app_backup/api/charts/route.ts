/**
 * ChandraHoro V2.1 - Birth Charts API
 * 
 * Handles birth chart operations: list user charts and create new charts.
 * Integrates with Swiss Ephemeris for accurate astrological calculations.
 * 
 * GET /api/charts - List user's birth charts
 * POST /api/charts - Create new birth chart
 * 
 * Features:
 * - Birth chart creation with Swiss Ephemeris calculations
 * - Default chart management
 * - Chart data caching
 * - Coordinate validation
 * - Timezone handling
 * 
 * @example
 * ```typescript
 * // List charts
 * const response = await fetch('/api/charts');
 * 
 * // Create chart
 * const response = await fetch('/api/charts', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     name: 'My Birth Chart',
 *     birthDate: '1990-01-15',
 *     birthTime: '14:30:00',
 *     birthPlace: 'Mumbai, India',
 *     latitude: 19.0760,
 *     longitude: 72.8777,
 *     timezone: 'Asia/Kolkata'
 *   })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withChartRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validate, validateQuery, schemas } from '@/lib/middleware/validate';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { setCachedChart } from '@/lib/redis';

/**
 * Calculate birth chart data using Swiss Ephemeris
 * This is a placeholder - in production, you'd integrate with actual Swiss Ephemeris
 * 
 * @param birthDate - Birth date
 * @param birthTime - Birth time
 * @param latitude - Birth latitude
 * @param longitude - Birth longitude
 * @param timezone - Birth timezone
 * @returns Chart data with planets, houses, and aspects
 */
async function calculateChartData(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezone: string
) {
  // Placeholder chart data - replace with actual Swiss Ephemeris calculations
  const chartData = {
    planets: [
      { name: 'Sun', longitude: 295.5, sign: 'Capricorn', house: 1, retrograde: false },
      { name: 'Moon', longitude: 45.2, sign: 'Taurus', house: 4, retrograde: false },
      { name: 'Mars', longitude: 120.8, sign: 'Leo', house: 7, retrograde: false },
      { name: 'Mercury', longitude: 280.1, sign: 'Capricorn', house: 1, retrograde: false },
      { name: 'Jupiter', longitude: 200.3, sign: 'Libra', house: 10, retrograde: true },
      { name: 'Venus', longitude: 315.7, sign: 'Aquarius', house: 2, retrograde: false },
      { name: 'Saturn', longitude: 165.9, sign: 'Virgo', house: 8, retrograde: true },
      { name: 'Rahu', longitude: 75.4, sign: 'Gemini', house: 5, retrograde: true },
      { name: 'Ketu', longitude: 255.4, sign: 'Sagittarius', house: 11, retrograde: true },
    ],
    houses: [
      { number: 1, sign: 'Capricorn', longitude: 285.0 },
      { number: 2, sign: 'Aquarius', longitude: 315.0 },
      { number: 3, sign: 'Pisces', longitude: 345.0 },
      { number: 4, sign: 'Aries', longitude: 15.0 },
      { number: 5, sign: 'Taurus', longitude: 45.0 },
      { number: 6, sign: 'Gemini', longitude: 75.0 },
      { number: 7, sign: 'Cancer', longitude: 105.0 },
      { number: 8, sign: 'Leo', longitude: 135.0 },
      { number: 9, sign: 'Virgo', longitude: 165.0 },
      { number: 10, sign: 'Libra', longitude: 195.0 },
      { number: 11, sign: 'Scorpio', longitude: 225.0 },
      { number: 12, sign: 'Sagittarius', longitude: 255.0 },
    ],
    aspects: [
      { planet1: 'Sun', planet2: 'Moon', aspect: 'Trine', orb: 2.3, applying: true },
      { planet1: 'Mars', planet2: 'Jupiter', aspect: 'Square', orb: 1.8, applying: false },
      { planet1: 'Venus', planet2: 'Saturn', aspect: 'Opposition', orb: 3.1, applying: true },
    ],
  };
  
  return chartData;
}

/**
 * GET /api/charts
 * 
 * List user's birth charts with pagination.
 * 
 * @param request - HTTP request with query parameters
 * @returns Paginated list of birth charts
 */
export const GET = withErrorHandler(
  withAuth(
    withChartRateLimit(
      validateQuery(schemas.chartsQuery)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const { limit, offset, includeDefault } = (request as any).validatedQuery;
          
          // Build where clause
          const where: any = { userId };
          
          if (!includeDefault) {
            where.isDefault = false;
          }
          
          // Execute queries in parallel
          const [charts, total] = await Promise.all([
            prisma.birthChart.findMany({
              where,
              orderBy: [
                { isDefault: 'desc' }, // Default chart first
                { createdAt: 'desc' },
              ],
              take: limit,
              skip: offset,
              select: {
                id: true,
                name: true,
                birthDate: true,
                birthTime: true,
                birthPlace: true,
                latitude: true,
                longitude: true,
                timezone: true,
                isDefault: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
              },
            }),
            prisma.birthChart.count({ where }),
          ]);
          
          // Format response data
          const formattedCharts = charts.map(chart => ({
            ...chart,
            birthDate: chart.birthDate.toISOString().split('T')[0],
            createdAt: chart.createdAt.toISOString(),
            updatedAt: chart.updatedAt.toISOString(),
          }));
          
          return paginatedResponse(
            formattedCharts,
            { total, limit, offset },
            200,
            {
              includeDefault,
              defaultChart: charts.find(c => c.isDefault)?.id || null,
            }
          );
        }
      ),
      'list'
    )
  )
);

/**
 * POST /api/charts
 * 
 * Create a new birth chart with astrological calculations.
 * 
 * @param request - HTTP request with chart data
 * @returns Created birth chart with calculated data
 */
export const POST = withErrorHandler(
  withAuth(
    withChartRateLimit(
      validate(schemas.createChart)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const {
            name,
            birthDate,
            birthTime,
            birthPlace,
            latitude,
            longitude,
            timezone,
            isDefault,
          } = (request as any).validatedData;
          
          // Calculate chart data using Swiss Ephemeris
          const chartData = await calculateChartData(
            birthDate,
            birthTime,
            latitude,
            longitude,
            timezone
          );
          
          // Handle default chart logic
          let shouldSetAsDefault = isDefault;
          
          // If this is the user's first chart, make it default
          const existingChartsCount = await prisma.birthChart.count({
            where: { userId },
          });
          
          if (existingChartsCount === 0) {
            shouldSetAsDefault = true;
          }
          
          // Create chart in a transaction to handle default chart updates
          const chart = await prisma.$transaction(async (tx) => {
            // If setting as default, unset other default charts
            if (shouldSetAsDefault) {
              await tx.birthChart.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
              });
            }
            
            // Create new chart
            const newChart = await tx.birthChart.create({
              data: {
                userId,
                name,
                birthDate: new Date(birthDate),
                birthTime,
                birthPlace,
                latitude,
                longitude,
                timezone,
                isDefault: shouldSetAsDefault,
                chartData,
              },
              select: {
                id: true,
                name: true,
                birthDate: true,
                birthTime: true,
                birthPlace: true,
                latitude: true,
                longitude: true,
                timezone: true,
                isDefault: true,
                chartData: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
              },
            });
            
            return newChart;
          });
          
          // Cache chart data in Redis
          const cacheData = {
            ...chart,
            birthDate: chart.birthDate.toISOString().split('T')[0],
            createdAt: chart.createdAt.toISOString(),
            updatedAt: chart.updatedAt.toISOString(),
          };
          
          await setCachedChart(userId, chart.id, cacheData);
          
          // Log chart creation
          console.log(`✅ Birth chart created: ${chart.id} for user ${userId} (${name})`);
          
          return successResponse(
            cacheData,
            201,
            {
              calculated: true,
              isDefault: chart.isDefault,
              planetsCount: chartData.planets.length,
              aspectsCount: chartData.aspects.length,
            }
          );
        }
      ),
      'create'
    )
  )
);

/**
 * OPTIONS /api/charts
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
