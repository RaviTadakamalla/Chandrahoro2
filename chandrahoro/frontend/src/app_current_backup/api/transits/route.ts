/**
 * Transits API Route
 * 
 * Handles planetary transit data from Python backend.
 * Provides current and future planetary positions and significant transits.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { pythonAPI } from '@/lib/api/python-client';

// Transit request schema
const transitRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  days: z.number().min(1).max(365).optional(), // Number of days to look ahead
});

/**
 * GET /api/transits - Get planetary transits
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const days = parseInt(searchParams.get('days') || '30');

    // Validate parameters
    const validationResult = transitRequestSchema.safeParse({ date, days });
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid transit request parameters',
        400,
        validationResult.error.errors
      );
    }

    console.log(`Fetching transits for date: ${date}, days: ${days}`);

    // Call Python backend for transit data
    const transitData = await pythonAPI.getTransits(date);

    // Transform and enhance the response
    const response = {
      date: transitData.date,
      planets: transitData.planets,
      significantTransits: transitData.significant_transits || [],
      metadata: {
        requestedDate: date,
        daysAhead: days,
        generatedAt: new Date().toISOString(),
      },
    };

    return successResponse(response);

  } catch (error: any) {
    console.error('Transits fetch error:', error);
    
    // Handle specific backend errors
    if (error.message.includes('Backend request failed')) {
      return errorResponse(
        'BACKEND_ERROR',
        'Failed to fetch transit data from calculation engine',
        503
      );
    }

    return errorResponse(
      'TRANSITS_FETCH_FAILED',
      error.message || 'Failed to fetch transit data',
      500
    );
  }
}

/**
 * POST /api/transits - Get transits for specific chart
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.chartId && !body.birthData) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Either chartId or birthData is required',
        400
      );
    }

    let birthData;

    // If chartId provided, fetch chart from database
    if (body.chartId) {
      const { prisma } = await import('@/lib/prisma');
      
      const chart = await prisma.birthChart.findFirst({
        where: {
          id: body.chartId,
          userId: session.user.id,
        },
      });

      if (!chart) {
        return errorResponse('NOT_FOUND', 'Chart not found', 404);
      }

      birthData = {
        birthDate: chart.birthDate,
        birthTime: chart.birthTime || '12:00',
        latitude: chart.latitude,
        longitude: chart.longitude,
        timezone: chart.timezone,
      };
    } else {
      // Use provided birth data
      birthData = body.birthData;
    }

    const date = body.date || new Date().toISOString().split('T')[0];

    console.log('Fetching personalized transits for chart');

    // Get current transits
    const transitData = await pythonAPI.getTransits(date);

    // TODO: Calculate transit aspects to natal chart
    // This would require calling a specialized endpoint on the Python backend
    // that compares current planetary positions to natal positions

    const response = {
      date: transitData.date,
      planets: transitData.planets,
      significantTransits: transitData.significant_transits || [],
      personalizedTransits: [], // TODO: Implement personalized transit aspects
      birthData: {
        date: birthData.birthDate,
        time: birthData.birthTime,
        location: {
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        },
      },
      metadata: {
        requestedDate: date,
        generatedAt: new Date().toISOString(),
        chartId: body.chartId || null,
      },
    };

    return successResponse(response);

  } catch (error: any) {
    console.error('Personalized transits error:', error);
    return errorResponse(
      'PERSONALIZED_TRANSITS_FAILED',
      error.message || 'Failed to fetch personalized transit data',
      500
    );
  }
}

/**
 * Helper function to calculate transit significance
 */
function calculateTransitSignificance(transit: any): 'high' | 'medium' | 'low' {
  // This is a simplified implementation
  // In a real application, this would consider:
  // - Orb of the transit
  // - Importance of the planets involved
  // - Type of aspect
  // - Duration of the transit
  
  const significantPlanets = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn'];
  const significantAspects = ['conjunction', 'opposition', 'square', 'trine'];
  
  if (significantPlanets.includes(transit.planet) && 
      significantAspects.includes(transit.aspect)) {
    return 'high';
  }
  
  if (significantPlanets.includes(transit.planet) || 
      significantAspects.includes(transit.aspect)) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Helper function to format transit description
 */
function formatTransitDescription(transit: any): string {
  const { planet, aspect, natalPlanet, date } = transit;
  
  const aspectDescriptions = {
    conjunction: 'joins',
    opposition: 'opposes',
    square: 'squares',
    trine: 'trines',
    sextile: 'sextiles',
  };
  
  const action = aspectDescriptions[aspect as keyof typeof aspectDescriptions] || aspect;
  
  return `${planet} ${action} natal ${natalPlanet}`;
}
