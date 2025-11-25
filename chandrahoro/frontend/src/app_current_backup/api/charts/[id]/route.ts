/**
 * Individual Chart API Route
 * 
 * Handles operations on specific birth charts:
 * - GET: Retrieve single chart
 * - PUT: Update chart metadata
 * - DELETE: Remove chart
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

// Chart update schema
const updateChartSchema = z.object({
  isPrimary: z.boolean().optional(),
  chartName: z.string().min(1).max(100).optional(),
});

/**
 * GET /api/charts/[id] - Get single chart
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Validate chart ID
    if (!params.id) {
      return errorResponse('INVALID_ID', 'Chart ID is required', 400);
    }

    // Find chart
    const chart = await prisma.birthChart.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!chart) {
      return errorResponse('NOT_FOUND', 'Chart not found', 404);
    }

    return successResponse(chart);

  } catch (error: any) {
    console.error('Chart fetch error:', error);
    return errorResponse(
      'CHART_FETCH_FAILED',
      error.message || 'Failed to fetch chart',
      500
    );
  }
}

/**
 * PUT /api/charts/[id] - Update chart metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Validate chart ID
    if (!params.id) {
      return errorResponse('INVALID_ID', 'Chart ID is required', 400);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateChartSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid update data',
        400,
        validationResult.error.errors
      );
    }

    const updateData = validationResult.data;

    // If setting as primary, unset other primary charts first
    if (updateData.isPrimary === true) {
      await prisma.birthChart.updateMany({
        where: {
          userId: session.user.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update the chart
    const updatedChart = await prisma.birthChart.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    });

    if (updatedChart.count === 0) {
      return errorResponse('NOT_FOUND', 'Chart not found', 404);
    }

    // Fetch updated chart to return
    const chart = await prisma.birthChart.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(chart);

  } catch (error: any) {
    console.error('Chart update error:', error);
    return errorResponse(
      'CHART_UPDATE_FAILED',
      error.message || 'Failed to update chart',
      500
    );
  }
}

/**
 * DELETE /api/charts/[id] - Delete chart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Validate chart ID
    if (!params.id) {
      return errorResponse('INVALID_ID', 'Chart ID is required', 400);
    }

    // Check if chart exists and belongs to user
    const existingChart = await prisma.birthChart.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingChart) {
      return errorResponse('NOT_FOUND', 'Chart not found', 404);
    }

    // Prevent deletion of primary chart if it's the only chart
    if (existingChart.isPrimary) {
      const chartCount = await prisma.birthChart.count({
        where: {
          userId: session.user.id,
        },
      });

      if (chartCount === 1) {
        return errorResponse(
          'CANNOT_DELETE_PRIMARY',
          'Cannot delete the only chart. Create another chart first.',
          400
        );
      }
    }

    // Delete the chart
    const deletedChart = await prisma.birthChart.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (deletedChart.count === 0) {
      return errorResponse('NOT_FOUND', 'Chart not found', 404);
    }

    // If deleted chart was primary, make another chart primary
    if (existingChart.isPrimary) {
      const nextChart = await prisma.birthChart.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (nextChart) {
        await prisma.birthChart.update({
          where: {
            id: nextChart.id,
          },
          data: {
            isPrimary: true,
          },
        });
      }
    }

    return successResponse({ 
      deleted: true, 
      id: params.id,
      message: 'Chart deleted successfully'
    });

  } catch (error: any) {
    console.error('Chart deletion error:', error);
    return errorResponse(
      'CHART_DELETE_FAILED',
      error.message || 'Failed to delete chart',
      500
    );
  }
}
