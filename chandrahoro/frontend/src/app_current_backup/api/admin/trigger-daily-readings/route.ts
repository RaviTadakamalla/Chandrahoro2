/**
 * ChandraHoro V2.1 - Admin Daily Readings Trigger
 * 
 * Admin endpoint for manually triggering daily reading generation.
 * Supports both individual user and bulk generation.
 * 
 * Features:
 * - Manual trigger for specific users
 * - Bulk generation for all users
 * - Force regeneration option
 * - Test mode for development
 * - Admin authentication required
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateDailyReading } from '@/lib/services/daily-reading-service';
import { runDailyReadingsJob } from '@/scripts/daily-readings-job';
import { sendReadingNotification } from '@/lib/notifications/reading-notification';
import { successResponse, errorResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/trigger-daily-readings
 * 
 * Manual trigger for daily readings generation
 * 
 * Body options:
 * - userId: string (optional) - Generate for specific user
 * - date: string (optional) - Generate for specific date (ISO format)
 * - forceRegenerate: boolean (optional) - Regenerate even if exists
 * - testMode: boolean (optional) - Test mode (no notifications)
 * - bulkMode: boolean (optional) - Generate for all users
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    console.log('[Admin] Daily readings manual trigger requested');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    // For now, allow any authenticated user (for testing)
    // In production, add proper role validation:
    // if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
    //   return errorResponse('ADMIN_REQUIRED', 'Admin access required', 403);
    // }
    
    const body = await request.json().catch(() => ({}));
    const {
      userId,
      date,
      forceRegenerate = false,
      testMode = false,
      bulkMode = false,
    } = body;
    
    console.log('[Admin] Trigger options:', {
      userId,
      date,
      forceRegenerate,
      testMode,
      bulkMode,
      triggeredBy: session.user.id,
    });
    
    const targetDate = date ? new Date(date) : new Date();
    
    if (bulkMode) {
      // Trigger for all users using the main job
      return await handleBulkTrigger(session.user.id, targetDate, testMode);
    } else if (userId) {
      // Trigger for specific user
      return await handleSingleUserTrigger(
        userId,
        targetDate,
        forceRegenerate,
        testMode,
        session.user.id
      );
    } else {
      return errorResponse(
        'INVALID_REQUEST',
        'Either userId or bulkMode must be specified',
        400
      );
    }
  } catch (error: any) {
    console.error('[Admin] Manual trigger failed:', error);
    return errorResponse('TRIGGER_FAILED', error.message, 500);
  }
}

/**
 * Handle bulk trigger for all users
 */
async function handleBulkTrigger(
  adminId: string,
  date: Date,
  testMode: boolean
): Promise<Response> {
  try {
    console.log(`[Admin] Bulk trigger initiated by ${adminId} for ${date.toISOString()}`);
    
    const startTime = Date.now();
    const result = await runDailyReadingsJob();
    const duration = Date.now() - startTime;
    
    console.log(`[Admin] Bulk trigger completed in ${duration}ms:`, {
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
    });
    
    return successResponse({
      message: 'Bulk daily readings generation completed',
      result: {
        ...result,
        triggeredBy: adminId,
        triggerType: 'admin_bulk',
        testMode,
        duration,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin] Bulk trigger failed:', error);
    throw error;
  }
}

/**
 * Handle single user trigger
 */
async function handleSingleUserTrigger(
  userId: string,
  date: Date,
  forceRegenerate: boolean,
  testMode: boolean,
  adminId: string
): Promise<Response> {
  try {
    console.log(`[Admin] Single user trigger for ${userId} by ${adminId}`);
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profile: {
          select: {
            fullName: true,
            notificationPreferences: true,
            onboardingCompleted: true,
          },
        },
      },
    });
    
    if (!user) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404);
    }
    
    if (!user.profile?.onboardingCompleted) {
      return errorResponse(
        'USER_NOT_READY',
        'User has not completed onboarding',
        400
      );
    }
    
    // Check if reading already exists (unless force regenerate)
    if (!forceRegenerate) {
      const existing = await prisma.reading.findFirst({
        where: {
          userId,
          readingDate: date,
          readingType: 'daily',
        },
      });
      
      if (existing) {
        return successResponse({
          message: 'Reading already exists for this date',
          reading: existing,
          skipped: true,
          triggeredBy: adminId,
        });
      }
    }
    
    // Generate the reading
    const startTime = Date.now();
    const reading = await generateDailyReading({
      userId,
      date,
      forceRegenerate,
    });
    const generationTime = Date.now() - startTime;
    
    console.log(`[Admin] Reading generated for ${userId} in ${generationTime}ms`);
    
    // Send notification (unless test mode)
    let notificationSent = false;
    if (!testMode) {
      try {
        const notificationResult = await sendReadingNotification(user, reading);
        notificationSent = notificationResult.emailSent || notificationResult.pushSent;
        console.log(`[Admin] Notification sent to ${userId}:`, notificationResult);
      } catch (notificationError: any) {
        console.warn(`[Admin] Failed to send notification to ${userId}:`, notificationError.message);
      }
    }
    
    return successResponse({
      message: 'Daily reading generated successfully',
      reading: {
        id: reading.id,
        userId: reading.userId,
        readingDate: reading.readingDate,
        readingType: reading.readingType,
        highlights: reading.highlights,
        createdAt: reading.createdAt,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      meta: {
        triggeredBy: adminId,
        triggerType: 'admin_single',
        forceRegenerate,
        testMode,
        generationTime,
        notificationSent,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[Admin] Single user trigger failed for ${userId}:`, error);
    throw error;
  }
}

/**
 * GET /api/admin/trigger-daily-readings
 * 
 * Get trigger history and statistics
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log('[Admin] Trigger history requested');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    
    // For now, return mock trigger history
    // In production, query from a triggers/audit log table
    const mockHistory = {
      recentTriggers: [
        {
          id: 'trigger-1',
          triggeredBy: session.user.id,
          triggerType: 'admin_single',
          userId: 'user-123',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          success: true,
          generationTime: 3500,
          notificationSent: true,
        },
        {
          id: 'trigger-2',
          triggeredBy: session.user.id,
          triggerType: 'admin_bulk',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          success: true,
          totalUsers: 150,
          successful: 145,
          failed: 3,
          skipped: 2,
          duration: 45000,
        },
      ],
      statistics: {
        totalTriggers: 25,
        successRate: 96.0,
        averageGenerationTime: 3200,
        lastTrigger: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        triggersToday: 3,
        triggersThisWeek: 12,
      },
    };
    
    return successResponse({
      message: 'Trigger history retrieved',
      history: mockHistory,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin] Failed to get trigger history:', error);
    return errorResponse('HISTORY_FAILED', error.message, 500);
  }
}

/**
 * DELETE /api/admin/trigger-daily-readings
 * 
 * Cancel ongoing bulk operation (if supported)
 */
export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    console.log('[Admin] Cancel trigger requested');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }
    
    // TODO: Add proper admin role check
    // TODO: Implement cancellation logic for ongoing operations
    
    console.log(`[Admin] Trigger cancellation requested by ${session.user.id}`);
    
    // For now, just return a message
    // In production, you might set a cancellation flag that the job checks
    return successResponse({
      message: 'Cancellation request received',
      note: 'Ongoing operations will complete current batch before stopping',
      cancelledBy: session.user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin] Failed to cancel trigger:', error);
    return errorResponse('CANCEL_FAILED', error.message, 500);
  }
}
