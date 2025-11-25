/**
 * Change Password API Route
 * 
 * Allows authenticated users to change their password.
 * Validates current password and updates with new hashed password.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * POST /api/auth/change-password
 * 
 * Change user password
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
    const validationResult = changePasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid input data',
        400,
        validationResult.error.errors
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return errorResponse(
        'USER_NOT_FOUND',
        'User not found or password not set',
        404
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return errorResponse(
        'INVALID_PASSWORD',
        'Current password is incorrect',
        400
      );
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return errorResponse(
        'SAME_PASSWORD',
        'New password must be different from current password',
        400
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    return successResponse({
      message: 'Password changed successfully',
      changedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Change password error:', error);
    return errorResponse(
      'PASSWORD_CHANGE_FAILED',
      error.message || 'Failed to change password',
      500
    );
  }
}
