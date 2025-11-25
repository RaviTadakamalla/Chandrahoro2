/**
 * User Data Export API Route
 * 
 * Exports all user data in JSON format for GDPR compliance
 * and data portability.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/api/response';

/**
 * POST /api/user/export
 * 
 * Export all user data as JSON
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const userId = session.user.id;

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        birthCharts: true,
        entitlement: true,
        accounts: {
          select: {
            type: true,
            provider: true,
            providerAccountId: true,
            createdAt: true,
          },
        },
        sessions: {
          select: {
            expires: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userData) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Remove sensitive data
    const exportData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        emailVerified: userData.emailVerified,
        image: userData.image,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      profile: userData.profile ? {
        fullName: userData.profile.fullName,
        avatarUrl: userData.profile.avatarUrl,
        phone: userData.profile.phone,
        language: userData.profile.language,
        theme: userData.profile.theme,
        tonePreference: userData.profile.tonePreference,
        notificationPreferences: userData.profile.notificationPreferences,
        timezone: userData.profile.timezone,
        onboardingCompleted: userData.profile.onboardingCompleted,
        createdAt: userData.profile.createdAt,
        updatedAt: userData.profile.updatedAt,
      } : null,
      birthCharts: userData.birthCharts.map(chart => ({
        id: chart.id,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthPlace: chart.birthPlace,
        latitude: chart.latitude,
        longitude: chart.longitude,
        timezone: chart.timezone,
        planets: chart.planets,
        houses: chart.houses,
        aspects: chart.aspects,
        ascendant: chart.ascendant,
        sunSign: chart.sunSign,
        moonSign: chart.moonSign,
        currentDasha: chart.currentDasha,
        dashaTimeline: chart.dashaTimeline,
        isPrimary: chart.isPrimary,
        createdAt: chart.createdAt,
        updatedAt: chart.updatedAt,
      })),
      entitlement: userData.entitlement ? {
        planType: userData.entitlement.planType,
        planStatus: userData.entitlement.planStatus,
        dailyRequestLimit: userData.entitlement.dailyRequestLimit,
        dailyRequestsUsed: userData.entitlement.dailyRequestsUsed,
        quotaResetAt: userData.entitlement.quotaResetAt,
        createdAt: userData.entitlement.createdAt,
        updatedAt: userData.entitlement.updatedAt,
      } : null,
      accounts: userData.accounts.map(account => ({
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        createdAt: account.createdAt,
      })),
      sessions: userData.sessions.map(session => ({
        expires: session.expires,
        createdAt: session.createdAt,
      })),
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: userId,
        version: '1.0',
        format: 'JSON',
      },
    };

    // Create JSON response
    const jsonData = JSON.stringify(exportData, null, 2);
    
    return new Response(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="chandrahoro-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return errorResponse(
      'EXPORT_FAILED',
      error.message || 'Failed to export data',
      500
    );
  }
}
