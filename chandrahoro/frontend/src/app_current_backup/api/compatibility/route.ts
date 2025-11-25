/**
 * Compatibility API Route
 *
 * Handles astrological compatibility calculations between two charts.
 * Uses Python backend for Kuta matching and Claude AI for narrative generation.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { generateCompatibilityReport, getUserCompatibilityReports } from '@/lib/services/compatibility-service';
import { checkQuota, incrementQuota } from '@/lib/ai/quota';

// Validation schemas
const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  birth_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
  birth_place: z.string().min(1, 'Birth place is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
});

const compatibilityRequestSchema = z.object({
  person1: personSchema,
  person2: personSchema,
});

/**
 * POST /api/compatibility - Generate compatibility report
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }

  try {
    // Check AI quota
    const quota = await checkQuota(session.user.id);
    if (!quota.allowed) {
      return errorResponse('QUOTA_EXCEEDED', 'Daily AI quota exceeded', 429, {
        limit: quota.limit,
        used: quota.used,
        resetAt: quota.resetAt,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = compatibilityRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, {
        errors: validationResult.error.errors,
      });
    }

    const { person1, person2 } = validationResult.data;

    // Validate required fields
    if (!person1.birth_date || !person2.birth_date) {
      return errorResponse('VALIDATION_ERROR', 'Birth dates required for both persons', 400);
    }

    console.log('[CompatibilityAPI] Generating report for:', {
      person1: person1.name,
      person2: person2.name,
      userId: session.user.id,
    });

    // Generate compatibility report
    const report = await generateCompatibilityReport(session.user.id, {
      person1,
      person2,
    });

    // Increment quota usage
    await incrementQuota(session.user.id, report.tokensUsed || 0);

    console.log('[CompatibilityAPI] Report generated successfully:', report.id);

    return successResponse(report, 201, {
      message: 'Compatibility report generated successfully',
    });
  } catch (error: any) {
    console.error('[CompatibilityAPI] Error:', error);

    if (error.message?.includes('Python backend')) {
      return errorResponse('BACKEND_ERROR', 'Astrological calculation service unavailable', 503);
    }

    if (error.message?.includes('quota')) {
      return errorResponse('QUOTA_ERROR', error.message, 429);
    }

    return errorResponse('COMPATIBILITY_ERROR', error.message, 500);
  }
}

/**
 * GET /api/compatibility - Get user's compatibility reports
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const reports = await getUserCompatibilityReports(session.user.id, limit);

    return successResponse(reports, 200, {
      message: 'Compatibility reports retrieved successfully',
      count: reports.length,
    });
  } catch (error: any) {
    console.error('[CompatibilityAPI] Error fetching reports:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}
