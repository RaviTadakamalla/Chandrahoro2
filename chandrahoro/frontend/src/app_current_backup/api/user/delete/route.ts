/**
 * Delete User Account API Route
 * 
 * Permanently deletes user account and all associated data.
 * This is an irreversible action.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * DELETE /api/user/delete
 * 
 * Delete user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const userId = session.user.id;

    // Start transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete user's birth charts
      await tx.birthChart.deleteMany({
        where: { userId },
      });

      // Delete user's entitlement
      await tx.entitlement.deleteMany({
        where: { userId },
      });

      // Delete user's profile
      await tx.profile.deleteMany({
        where: { userId },
      });

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId },
      });

      // Delete user's accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // TODO: In production, you might want to:
    // 1. Delete uploaded files (avatars, etc.)
    // 2. Cancel any active subscriptions
    // 3. Send confirmation email
    // 4. Log the deletion for audit purposes
    // 5. Add a delay before actual deletion (soft delete first)

    return successResponse({
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString(),
      userId,
    });

  } catch (error: any) {
    console.error('Delete account error:', error);
    return errorResponse(
      'DELETE_FAILED',
      error.message || 'Failed to delete account',
      500
    );
  }
}
