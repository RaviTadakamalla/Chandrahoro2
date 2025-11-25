/**
 * ChandraHoro V2.1 - User Profile API
 * 
 * Handles user profile operations: get and update profile information.
 * Manages user preferences, birth information, and notification settings.
 * 
 * GET /api/profile - Get user profile
 * PUT /api/profile - Update user profile
 * 
 * Features:
 * - Complete profile management
 * - Preferences and notification settings
 * - Birth information storage
 * - Cache invalidation on updates
 * 
 * @example
 * ```typescript
 * // Get profile
 * const response = await fetch('/api/profile');
 * 
 * // Update profile
 * const response = await fetch('/api/profile', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     fullName: 'John Doe',
 *     preferences: {
 *       language: 'en',
 *       theme: 'dark'
 *     }
 *   })
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withProfileRateLimit } from '@/lib/middleware/rate-limit';
import { withErrorHandler } from '@/lib/middleware/error-handler';
import { validate, schemas } from '@/lib/middleware/validate';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getCachedUserPreferences, setCachedUserPreferences, invalidateUserPreferences } from '@/lib/redis';

/**
 * GET /api/profile
 * 
 * Get user profile information including preferences and settings.
 * 
 * @param request - HTTP request
 * @returns User profile data
 */
export const GET = withErrorHandler(
  withAuth(
    async (request: NextRequest) => {
      const userId = (request as any).user.id;
      
      // Check cache first for preferences
      const cachedPreferences = await getCachedUserPreferences(userId);
      
      // Get profile from database
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          fullName: true,
          dateOfBirth: true,
          timeOfBirth: true,
          placeOfBirth: true,
          latitude: true,
          longitude: true,
          timezone: true,
          phoneNumber: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!profile) {
        // Create default profile if it doesn't exist
        const newProfile = await prisma.userProfile.create({
          data: {
            userId,
            fullName: (request as any).user.name || '',
            preferences: {
              language: 'en',
              timezone: 'UTC',
              theme: 'system',
              notifications: {
                email: true,
                push: true,
                dailyReading: true,
                weeklyReading: false,
              },
            },
          },
        });
        
        const formattedProfile = {
          ...newProfile,
          dateOfBirth: newProfile.dateOfBirth?.toISOString().split('T')[0] || null,
          createdAt: newProfile.createdAt.toISOString(),
          updatedAt: newProfile.updatedAt.toISOString(),
        };
        
        // Cache preferences
        await setCachedUserPreferences(userId, formattedProfile.preferences);
        
        return successResponse(formattedProfile, 201, { created: true });
      }
      
      const formattedProfile = {
        ...profile,
        dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0] || null,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
        preferences: cachedPreferences || profile.preferences,
      };
      
      // Update cache if not cached
      if (!cachedPreferences) {
        await setCachedUserPreferences(userId, profile.preferences);
      }
      
      return successResponse(
        formattedProfile,
        200,
        { cached: !!cachedPreferences }
      );
    }
  )
);

/**
 * PUT /api/profile
 * 
 * Update user profile information and preferences.
 * 
 * @param request - HTTP request with profile update data
 * @returns Updated profile data
 */
export const PUT = withErrorHandler(
  withAuth(
    withProfileRateLimit(
      validate(schemas.updateProfile)(
        async (request: NextRequest) => {
          const userId = (request as any).user.id;
          const updateData = (request as any).validatedData;
          
          // Prepare update data
          const profileUpdate: any = {};
          
          // Handle basic profile fields
          if (updateData.fullName !== undefined) {
            profileUpdate.fullName = updateData.fullName;
          }
          
          if (updateData.dateOfBirth !== undefined) {
            profileUpdate.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null;
          }
          
          if (updateData.timeOfBirth !== undefined) {
            profileUpdate.timeOfBirth = updateData.timeOfBirth;
          }
          
          if (updateData.placeOfBirth !== undefined) {
            profileUpdate.placeOfBirth = updateData.placeOfBirth;
          }
          
          if (updateData.latitude !== undefined) {
            profileUpdate.latitude = updateData.latitude;
          }
          
          if (updateData.longitude !== undefined) {
            profileUpdate.longitude = updateData.longitude;
          }
          
          if (updateData.timezone !== undefined) {
            profileUpdate.timezone = updateData.timezone;
          }
          
          if (updateData.phoneNumber !== undefined) {
            profileUpdate.phoneNumber = updateData.phoneNumber;
          }
          
          // Handle preferences update
          if (updateData.preferences) {
            // Get current preferences
            const currentProfile = await prisma.userProfile.findUnique({
              where: { userId },
              select: { preferences: true },
            });
            
            if (currentProfile) {
              // Merge preferences
              const currentPrefs = currentProfile.preferences as any || {};
              const newPrefs = { ...currentPrefs };
              
              if (updateData.preferences.language) {
                newPrefs.language = updateData.preferences.language;
              }
              
              if (updateData.preferences.timezone) {
                newPrefs.timezone = updateData.preferences.timezone;
              }
              
              if (updateData.preferences.theme) {
                newPrefs.theme = updateData.preferences.theme;
              }
              
              if (updateData.preferences.notifications) {
                newPrefs.notifications = {
                  ...currentPrefs.notifications,
                  ...updateData.preferences.notifications,
                };
              }
              
              profileUpdate.preferences = newPrefs;
            }
          }
          
          // Add updated timestamp
          profileUpdate.updatedAt = new Date();
          
          // Update profile
          const updatedProfile = await prisma.userProfile.update({
            where: { userId },
            data: profileUpdate,
            select: {
              id: true,
              userId: true,
              fullName: true,
              dateOfBirth: true,
              timeOfBirth: true,
              placeOfBirth: true,
              latitude: true,
              longitude: true,
              timezone: true,
              phoneNumber: true,
              preferences: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          
          const formattedProfile = {
            ...updatedProfile,
            dateOfBirth: updatedProfile.dateOfBirth?.toISOString().split('T')[0] || null,
            createdAt: updatedProfile.createdAt.toISOString(),
            updatedAt: updatedProfile.updatedAt.toISOString(),
          };
          
          // Update cache
          await setCachedUserPreferences(userId, updatedProfile.preferences);
          
          // Log profile update
          const updatedFields = Object.keys(updateData);
          console.log(`👤 Profile updated: ${userId} - Fields: ${updatedFields.join(', ')}`);
          
          return successResponse(
            formattedProfile,
            200,
            {
              updatedFields,
              preferencesUpdated: !!updateData.preferences,
            }
          );
        }
      ),
      'update'
    )
  )
);

/**
 * OPTIONS /api/profile
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
