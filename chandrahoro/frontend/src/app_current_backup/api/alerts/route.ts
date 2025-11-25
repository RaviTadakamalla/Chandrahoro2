/**
 * ChandraHoro V2.1 - Alerts API
 * 
 * API endpoints for managing transit alerts and notifications.
 * Handles listing, dismissing, and managing user alerts.
 * 
 * Endpoints:
 * - GET /api/alerts - List user's active alerts
 * - PUT /api/alerts - Dismiss/update alerts
 * - DELETE /api/alerts - Delete alerts
 * - POST /api/alerts - Create manual alerts (admin)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';
import { isAfter, subDays } from 'date-fns';

// GET /api/alerts - List user's alerts with filtering and pagination
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const alertType = searchParams.get('type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const includeDismissed = searchParams.get('include_dismissed') === 'true';
    const includeExpired = searchParams.get('include_expired') === 'true';
    
    const userId = session.user.id;
    const now = new Date();
    
    // Build where clause
    const where: any = {
      userId,
      ...(alertType && { alertType }),
      ...(severity && { severity }),
      ...(!includeDismissed && { isDismissed: false }),
      ...(!includeExpired && { expiresAt: { gte: now } }),
    };
    
    // Get alerts with pagination
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: [
          { severity: 'desc' }, // Critical first
          { createdAt: 'desc' }, // Newest first
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          alertType: true,
          title: true,
          message: true,
          severity: true,
          isDismissed: true,
          isRead: true,
          metadata: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.alert.count({ where }),
    ]);
    
    // Mark alerts as read
    if (alerts.length > 0 && !includeDismissed) {
      const unreadIds = alerts.filter(a => !a.isRead).map(a => a.id);
      if (unreadIds.length > 0) {
        await prisma.alert.updateMany({
          where: { id: { in: unreadIds } },
          data: { isRead: true },
        });
      }
    }
    
    // Get summary statistics
    const stats = await getAlertStats(userId);
    
    const hasMore = offset + limit < total;
    
    return successResponse(alerts, 200, {
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
      stats,
      filters: {
        alertType,
        severity,
        includeDismissed,
        includeExpired,
      },
    });
  } catch (error: any) {
    console.error('[AlertsAPI] Error fetching alerts:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

// PUT /api/alerts - Update alerts (dismiss, mark read, etc.)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const body = await request.json();
    const { alertId, alertIds, action, ...updateData } = body;
    
    const userId = session.user.id;
    
    // Determine which alerts to update
    const targetIds = alertIds || (alertId ? [alertId] : []);
    
    if (targetIds.length === 0) {
      return errorResponse('INVALID_REQUEST', 'Alert ID(s) required', 400);
    }
    
    // Verify ownership
    const ownedAlerts = await prisma.alert.findMany({
      where: {
        id: { in: targetIds },
        userId,
      },
      select: { id: true },
    });
    
    const ownedIds = ownedAlerts.map(a => a.id);
    const unauthorizedIds = targetIds.filter(id => !ownedIds.includes(id));
    
    if (unauthorizedIds.length > 0) {
      return errorResponse('UNAUTHORIZED', 'Some alerts not found or access denied', 403);
    }
    
    // Perform action
    let updateResult;
    
    switch (action) {
      case 'dismiss':
        updateResult = await prisma.alert.updateMany({
          where: { id: { in: ownedIds } },
          data: { isDismissed: true },
        });
        break;
      
      case 'undismiss':
        updateResult = await prisma.alert.updateMany({
          where: { id: { in: ownedIds } },
          data: { isDismissed: false },
        });
        break;
      
      case 'mark_read':
        updateResult = await prisma.alert.updateMany({
          where: { id: { in: ownedIds } },
          data: { isRead: true },
        });
        break;
      
      case 'mark_unread':
        updateResult = await prisma.alert.updateMany({
          where: { id: { in: ownedIds } },
          data: { isRead: false },
        });
        break;
      
      case 'update':
        // Allow updating specific fields
        const allowedFields = ['isDismissed', 'isRead'];
        const updates: any = {};
        
        Object.keys(updateData).forEach(key => {
          if (allowedFields.includes(key)) {
            updates[key] = updateData[key];
          }
        });
        
        if (Object.keys(updates).length === 0) {
          return errorResponse('INVALID_UPDATE', 'No valid fields to update', 400);
        }
        
        updateResult = await prisma.alert.updateMany({
          where: { id: { in: ownedIds } },
          data: updates,
        });
        break;
      
      default:
        return errorResponse('INVALID_ACTION', 'Invalid action specified', 400);
    }
    
    return successResponse({
      updated: updateResult.count,
      action,
      alertIds: ownedIds,
    }, 200, {
      message: `Successfully ${action}ed ${updateResult.count} alert(s)`,
    });
  } catch (error: any) {
    console.error('[AlertsAPI] Error updating alerts:', error);
    return errorResponse('UPDATE_ERROR', error.message, 500);
  }
}

// DELETE /api/alerts - Delete alerts
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const alertIds = searchParams.get('ids')?.split(',') || [];
    const deleteExpired = searchParams.get('delete_expired') === 'true';
    const deleteDismissed = searchParams.get('delete_dismissed') === 'true';
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '0');
    
    const userId = session.user.id;
    let deletedCount = 0;
    
    // Delete specific alerts
    if (alertIds.length > 0) {
      const result = await prisma.alert.deleteMany({
        where: {
          id: { in: alertIds },
          userId,
        },
      });
      deletedCount += result.count;
    }
    
    // Delete expired alerts
    if (deleteExpired) {
      const result = await prisma.alert.deleteMany({
        where: {
          userId,
          expiresAt: { lt: new Date() },
        },
      });
      deletedCount += result.count;
    }
    
    // Delete dismissed alerts
    if (deleteDismissed) {
      const result = await prisma.alert.deleteMany({
        where: {
          userId,
          isDismissed: true,
        },
      });
      deletedCount += result.count;
    }
    
    // Delete old alerts
    if (olderThanDays > 0) {
      const cutoffDate = subDays(new Date(), olderThanDays);
      const result = await prisma.alert.deleteMany({
        where: {
          userId,
          createdAt: { lt: cutoffDate },
        },
      });
      deletedCount += result.count;
    }
    
    return successResponse({
      deleted: deletedCount,
    }, 200, {
      message: `Successfully deleted ${deletedCount} alert(s)`,
    });
  } catch (error: any) {
    console.error('[AlertsAPI] Error deleting alerts:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}

// POST /api/alerts - Create manual alert (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    // Check if user is admin
    const isAdmin = session.user.email?.endsWith('@chandrahoro.com') || false;
    if (!isAdmin) {
      return errorResponse('ADMIN_REQUIRED', 'Admin access required', 403);
    }
    
    const body = await request.json();
    const {
      userId,
      alertType = 'manual',
      title,
      message,
      severity = 'medium',
      expiresAt,
      metadata = {},
    } = body;
    
    // Validate required fields
    if (!userId || !title || !message) {
      return errorResponse('INVALID_DATA', 'userId, title, and message are required', 400);
    }
    
    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    
    if (!targetUser) {
      return errorResponse('USER_NOT_FOUND', 'Target user not found', 404);
    }
    
    // Create alert
    const alert = await prisma.alert.create({
      data: {
        userId,
        alertType,
        title,
        message,
        severity,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: metadata as any,
      },
    });
    
    return successResponse(alert, 201, {
      message: 'Alert created successfully',
    });
  } catch (error: any) {
    console.error('[AlertsAPI] Error creating alert:', error);
    return errorResponse('CREATE_ERROR', error.message, 500);
  }
}

/**
 * Get alert statistics for user
 */
async function getAlertStats(userId: string) {
  try {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    
    const [total, unread, active, recent, bySeverity] = await Promise.all([
      prisma.alert.count({
        where: { userId },
      }),
      prisma.alert.count({
        where: {
          userId,
          isRead: false,
          isDismissed: false,
          expiresAt: { gte: now },
        },
      }),
      prisma.alert.count({
        where: {
          userId,
          isDismissed: false,
          expiresAt: { gte: now },
        },
      }),
      prisma.alert.count({
        where: {
          userId,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: {
          userId,
          isDismissed: false,
          expiresAt: { gte: now },
        },
        _count: true,
      }),
    ]);
    
    const severityCounts = bySeverity.reduce((acc, item) => {
      acc[item.severity] = item._count;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      unread,
      active,
      recent,
      bySeverity: severityCounts,
    };
  } catch (error) {
    console.error('[AlertsAPI] Error getting alert stats:', error);
    return {
      total: 0,
      unread: 0,
      active: 0,
      recent: 0,
      bySeverity: {},
    };
  }
}
