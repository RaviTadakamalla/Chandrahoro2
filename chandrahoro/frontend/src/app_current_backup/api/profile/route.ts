/**
 * Profile API Route
 * 
 * Handles user profile management including preferences and onboarding status.
 * Supports GET, PATCH operations for profile data.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

// Profile update schema
const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  placeOfBirth: z.string().min(1).optional(),
  language: z.enum(['en', 'te']).optional(),
  tonePreference: z.enum(['mystic', 'practical', 'playful']).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  onboardingCompleted: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

/**
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Fetch user profile with related data
    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
          },
        },
        entitlement: {
          select: {
            planType: true,
            requestsUsed: true,
            requestsLimit: true,
            quotaResetAt: true,
            isActive: true,
          },
        },
      },
    });

    if (!profile) {
      return errorResponse('PROFILE_NOT_FOUND', 'Profile not found', 404);
    }

    return successResponse(profile);

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return errorResponse(
      'PROFILE_FETCH_FAILED',
      error.message || 'Failed to fetch profile',
      500
    );
  }
}

/**
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid profile data',
        400,
        validationResult.error.errors
      );
    }

    const updateData = validationResult.data;

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return errorResponse('PROFILE_NOT_FOUND', 'Profile not found', 404);
    }

    // Prepare update data
    const profileUpdateData: any = {};

    // Basic profile fields
    if (updateData.fullName !== undefined) {
      profileUpdateData.fullName = updateData.fullName;
    }
    if (updateData.dateOfBirth !== undefined) {
      profileUpdateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.timeOfBirth !== undefined) {
      profileUpdateData.timeOfBirth = updateData.timeOfBirth;
    }
    if (updateData.placeOfBirth !== undefined) {
      profileUpdateData.placeOfBirth = updateData.placeOfBirth;
    }

    // Preference fields
    if (updateData.language !== undefined) {
      profileUpdateData.language = updateData.language;
    }
    if (updateData.tonePreference !== undefined) {
      profileUpdateData.tonePreference = updateData.tonePreference;
    }
    if (updateData.theme !== undefined) {
      profileUpdateData.theme = updateData.theme;
    }

    // Status fields
    if (updateData.onboardingCompleted !== undefined) {
      profileUpdateData.onboardingCompleted = updateData.onboardingCompleted;
    }

    // Notification preferences
    if (updateData.emailNotifications !== undefined) {
      profileUpdateData.emailNotifications = updateData.emailNotifications;
    }
    if (updateData.pushNotifications !== undefined) {
      profileUpdateData.pushNotifications = updateData.pushNotifications;
    }

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: {
        userId: session.user.id,
      },
      data: {
        ...profileUpdateData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
          },
        },
        entitlement: {
          select: {
            planType: true,
            requestsUsed: true,
            requestsLimit: true,
            quotaResetAt: true,
            isActive: true,
          },
        },
      },
    });

    return successResponse(updatedProfile);

  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse(
      'PROFILE_UPDATE_FAILED',
      error.message || 'Failed to update profile',
      500
    );
  }
}

/**
 * Delete user profile (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return errorResponse('PROFILE_NOT_FOUND', 'Profile not found', 404);
    }

    // Soft delete by marking as inactive
    const deletedProfile = await prisma.userProfile.update({
      where: {
        userId: session.user.id,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return successResponse({ 
      message: 'Profile deactivated successfully',
      profileId: deletedProfile.id 
    });

  } catch (error: any) {
    console.error('Profile deletion error:', error);
    return errorResponse(
      'PROFILE_DELETE_FAILED',
      error.message || 'Failed to delete profile',
      500
    );
  }
}
