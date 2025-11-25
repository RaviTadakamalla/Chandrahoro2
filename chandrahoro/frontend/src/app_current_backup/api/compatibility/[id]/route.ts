/**
 * Individual Compatibility Report API
 * 
 * Handles operations on specific compatibility reports.
 * Provides detailed report retrieval and management.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getCompatibilityReport } from '@/lib/services/compatibility-service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/compatibility/[id] - Get specific compatibility report
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const reportId = params.id;
    
    if (!reportId) {
      return errorResponse('INVALID_REQUEST', 'Report ID is required', 400);
    }
    
    const report = await getCompatibilityReport(reportId, session.user.id);
    
    if (!report) {
      return errorResponse('REPORT_NOT_FOUND', 'Compatibility report not found', 404);
    }
    
    return successResponse(report, 200, {
      message: 'Compatibility report retrieved successfully',
    });
  } catch (error: any) {
    console.error('[CompatibilityReportAPI] Error fetching report:', error);
    return errorResponse('FETCH_ERROR', error.message, 500);
  }
}

/**
 * DELETE /api/compatibility/[id] - Delete compatibility report
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const reportId = params.id;
    
    if (!reportId) {
      return errorResponse('INVALID_REQUEST', 'Report ID is required', 400);
    }
    
    // Verify ownership and delete
    const deletedReport = await prisma.compatibilityReport.deleteMany({
      where: {
        id: reportId,
        userId: session.user.id,
      },
    });
    
    if (deletedReport.count === 0) {
      return errorResponse('REPORT_NOT_FOUND', 'Compatibility report not found or access denied', 404);
    }
    
    return successResponse({ deleted: true }, 200, {
      message: 'Compatibility report deleted successfully',
    });
  } catch (error: any) {
    console.error('[CompatibilityReportAPI] Error deleting report:', error);
    return errorResponse('DELETE_ERROR', error.message, 500);
  }
}

/**
 * PUT /api/compatibility/[id] - Update compatibility report (sharing settings)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const reportId = params.id;
    const body = await request.json();
    
    if (!reportId) {
      return errorResponse('INVALID_REQUEST', 'Report ID is required', 400);
    }
    
    const { isShared } = body;
    
    if (typeof isShared !== 'boolean') {
      return errorResponse('INVALID_REQUEST', 'isShared must be a boolean', 400);
    }
    
    // Generate share token if sharing is enabled
    const shareToken = isShared ? generateShareToken() : null;
    
    const updatedReport = await prisma.compatibilityReport.updateMany({
      where: {
        id: reportId,
        userId: session.user.id,
      },
      data: {
        isShared,
        shareToken,
      },
    });
    
    if (updatedReport.count === 0) {
      return errorResponse('REPORT_NOT_FOUND', 'Compatibility report not found or access denied', 404);
    }
    
    return successResponse({ 
      updated: true, 
      isShared, 
      shareToken: isShared ? shareToken : null 
    }, 200, {
      message: 'Compatibility report updated successfully',
    });
  } catch (error: any) {
    console.error('[CompatibilityReportAPI] Error updating report:', error);
    return errorResponse('UPDATE_ERROR', error.message, 500);
  }
}

/**
 * Generate a secure share token
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
