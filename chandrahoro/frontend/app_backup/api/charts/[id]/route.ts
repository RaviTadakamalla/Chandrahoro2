/**
 * ChandraHoro V2.1 - Individual Birth Chart API
 * 
 * Handles operations on specific birth charts: get, update, and delete.
 * Includes ownership validation and default chart management.
 * 
 * GET /api/charts/[id] - Get specific birth chart with full data
 * PUT /api/charts/[id] - Update chart properties
 * DELETE /api/charts/[id] - Delete birth chart
 * 
 * Features:
 * - Resource ownership validation
 * - Default chart management
 * - Chart data caching
 * - Cache invalidation on updates
 * 
 * @example
 * ```typescript
 * // Get chart with full data
 * const response = await fetch('/api/charts/chart_123');
 * 
 * // Update chart
 * const response = await fetch('/api/charts/chart_123', {
 *   method: 'PUT',
 *   body: JSON.stringify({ name: 'Updated Name', isDefault: true })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { withOwnership } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validate, schemas } from '@/lib/middleware/validate';
import { successResponse, deletedResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getCachedChart, setCachedChart, invalidateChartCache } from '@/lib/redis';

/**
 * GET /api/charts/[id]
 * 
 * Get a specific birth chart by ID with full chart data.
 * Validates user ownership before returning data.
 * 
 * @param request - HTTP request
 * @param params - Route parameters with chart ID
 * @returns Birth chart data with astrological calculations
 */
export const GET = withErrorHandler(
  withOwnership(
    'chart',
    (context: { params: { id: string } }) => context.params.id
  )(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const userId = (request as any).user.id;
      
      // Check Redis cache first
      const cachedChart = await getCachedChart(userId, params.id);
      if (cachedChart) {
        return successResponse(
          cachedChart,
          200,
          { cached: true, source: 'redis' }
        );
      }
      
      // Get from database
      const chart = await prisma.birthChart.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          userId: true,
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
      
      if (!chart) {
        throw new Error('NOT_FOUND');
      }
      
      const formattedChart = {
        ...chart,
        birthDate: chart.birthDate.toISOString().split('T')[0],
        createdAt: chart.createdAt.toISOString(),
        updatedAt: chart.updatedAt.toISOString(),
      };
      
      // Cache for future requests
      await setCachedChart(userId, params.id, formattedChart);
      
      return successResponse(
        formattedChart,
        200,
        { cached: false, source: 'database' }
      );
    }
  )
);

/**
 * PUT /api/charts/[id]
 * 
 * Update birth chart properties like name, default status, and notes.
 * Handles default chart logic and cache invalidation.
 * 
 * @param request - HTTP request with update data
 * @param params - Route parameters with chart ID
 * @returns Updated birth chart data
 */
export const PUT = withErrorHandler(
  withOwnership(
    'chart',
    (context: { params: { id: string } }) => context.params.id
  )(
    validate(schemas.updateChart)(
      async (request: NextRequest, { params }: { params: { id: string } }) => {
        const userId = (request as any).user.id;
        const updateData = (request as any).validatedData;
        
        // Handle default chart logic in a transaction
        const updatedChart = await prisma.$transaction(async (tx) => {
          // If setting as default, unset other default charts
          if (updateData.isDefault === true) {
            await tx.birthChart.updateMany({
              where: { userId, isDefault: true, id: { not: params.id } },
              data: { isDefault: false },
            });
          }
          
          // Update the chart
          const chart = await tx.birthChart.update({
            where: { id: params.id },
            data: {
              ...updateData,
              updatedAt: new Date(),
            },
            select: {
              id: true,
              userId: true,
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
          
          return chart;
        });
        
        const formattedChart = {
          ...updatedChart,
          birthDate: updatedChart.birthDate.toISOString().split('T')[0],
          createdAt: updatedChart.createdAt.toISOString(),
          updatedAt: updatedChart.updatedAt.toISOString(),
        };
        
        // Update cache
        await setCachedChart(userId, params.id, formattedChart);
        
        // Log default chart change
        if (updateData.isDefault === true) {
          console.log(`🌟 Default chart changed: ${params.id} for user ${userId}`);
        }
        
        return successResponse(formattedChart);
      }
    )
  )
);

/**
 * DELETE /api/charts/[id]
 * 
 * Delete a specific birth chart.
 * Prevents deletion of the last chart and handles default chart reassignment.
 * 
 * @param request - HTTP request
 * @param params - Route parameters with chart ID
 * @returns Deletion confirmation
 */
export const DELETE = withErrorHandler(
  withOwnership(
    'chart',
    (context: { params: { id: string } }) => context.params.id
  )(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const userId = (request as any).user.id;
      
      // Get chart info and check if it's the only chart
      const [chartToDelete, totalCharts] = await Promise.all([
        prisma.birthChart.findUnique({
          where: { id: params.id },
          select: { name: true, isDefault: true },
        }),
        prisma.birthChart.count({ where: { userId } }),
      ]);
      
      if (!chartToDelete) {
        throw new Error('NOT_FOUND');
      }
      
      // Prevent deletion of the last chart
      if (totalCharts === 1) {
        return successResponse(
          {
            error: 'CANNOT_DELETE_LAST_CHART',
            message: 'Cannot delete your only birth chart. Create another chart first.',
            canDelete: false,
          },
          400
        );
      }
      
      // Handle deletion in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete the chart
        await tx.birthChart.delete({
          where: { id: params.id },
        });
        
        // If deleted chart was default, set another chart as default
        if (chartToDelete.isDefault) {
          const nextChart = await tx.birthChart.findFirst({
            where: { userId },
            orderBy: { createdAt: 'asc' },
          });
          
          if (nextChart) {
            await tx.birthChart.update({
              where: { id: nextChart.id },
              data: { isDefault: true },
            });
            
            console.log(`🌟 New default chart set: ${nextChart.id} for user ${userId}`);
          }
        }
      });
      
      // Invalidate cache
      await invalidateChartCache(userId, params.id);
      
      // Log deletion
      console.log(`🗑️ Birth chart deleted: ${params.id} (${chartToDelete.name}) by user ${userId}`);
      
      return deletedResponse(params.id, {
        name: chartToDelete.name,
        wasDefault: chartToDelete.isDefault,
        remainingCharts: totalCharts - 1,
      });
    }
  )
);

/**
 * OPTIONS /api/charts/[id]
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
