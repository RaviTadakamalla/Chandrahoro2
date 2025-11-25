/**
 * Charts API Route
 * 
 * Handles birth chart generation and management.
 * Creates new charts and retrieves existing ones.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';
import { pythonAPI } from '@/lib/api/python-client';
import {
  transformPythonChartToPrisma,
  transformBirthDataToPython,
  validatePythonChartResponse,
  createChartErrorResponse
} from '@/lib/transformers/chart-transformer';

// Chart creation schema
const createChartSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  birthPlace: z.string().min(1, 'Birth place is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
});

/**
 * Create a new birth chart
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createChartSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid chart data',
        400,
        validationResult.error.errors
      );
    }

    const { birthDate, birthTime, birthPlace, latitude, longitude, timezone } = validationResult.data;

    // Check if user already has a primary chart
    const existingChart = await prisma.birthChart.findFirst({
      where: {
        userId: session.user.id,
        isPrimary: true,
      },
    });

    // Generate chart data using Python backend
    console.log('Generating chart for user:', session.user.id);
    const chartData = await generateBirthChart({
      birthDate,
      birthTime: birthTime || '12:00', // Default to noon if not provided
      birthPlace,
      latitude,
      longitude,
      timezone,
    });

    // Create chart in database
    const chart = await prisma.birthChart.create({
      data: {
        userId: session.user.id,
        birthDate: new Date(birthDate),
        birthTime: birthTime || null,
        birthPlace,
        latitude,
        longitude,
        timezone,
        planets: chartData.planets,
        houses: chartData.houses,
        aspects: chartData.aspects,
        ascendant: chartData.ascendant,
        sunSign: chartData.sunSign,
        moonSign: chartData.moonSign,
        currentDasha: chartData.currentDasha,
        dashaTimeline: chartData.dashaTimeline,
        isPrimary: !existingChart, // First chart becomes primary
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

    return successResponse(chart, 201);

  } catch (error: any) {
    console.error('Chart creation error:', error);
    return errorResponse(
      'CHART_GENERATION_FAILED',
      error.message || 'Failed to generate birth chart',
      500
    );
  }
}

/**
 * Get user's charts
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const primaryOnly = searchParams.get('primary') === 'true';

    // Build query
    const whereClause: any = {
      userId: session.user.id,
    };

    if (primaryOnly) {
      whereClause.isPrimary = true;
    }

    // Fetch charts
    const charts = await prisma.birthChart.findMany({
      where: whereClause,
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
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

    return successResponse(charts);

  } catch (error: any) {
    console.error('Charts fetch error:', error);
    return errorResponse(
      'CHARTS_FETCH_FAILED',
      error.message || 'Failed to fetch charts',
      500
    );
  }
}

/**
 * Generate birth chart data using Python FastAPI backend
 *
 * Uses Swiss Ephemeris for accurate planetary calculations:
 * 1. Calls Python backend with birth details
 * 2. Receives real astronomical calculations
 * 3. Transforms Python response to Prisma format
 * 4. Returns chart data for database storage
 */
async function generateBirthChart(data: {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}) {
  try {
    // Transform frontend data to Python API format
    const pythonRequest = transformBirthDataToPython(data);

    console.log('Calling Python backend with data:', pythonRequest);

    // Call Python backend for real calculations
    const pythonResponse = await pythonAPI.calculateChart(pythonRequest);

    // Validate response structure
    if (!validatePythonChartResponse(pythonResponse)) {
      throw new Error('Invalid response structure from Python backend');
    }

    console.log('Received chart data from Python backend');

    // Transform Python response to Prisma format
    const chartData = transformPythonChartToPrisma(pythonResponse);

    return chartData;

  } catch (error: any) {
    console.error('Chart generation failed:', error);

    // Create detailed error response
    const errorResponse = createChartErrorResponse(error);

    // Re-throw with more context
    throw new Error(
      `Failed to generate chart: ${error.message}. Please check if the Python backend is running.`
    );
  }
}
