/**
 * Settings Page
 * 
 * Comprehensive settings page with tabbed interface for managing
 * profile, preferences, notifications, and account settings.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsPageClient from '@/components/settings/SettingsPageClient';

export const metadata: Metadata = {
  title: 'Settings | ChandraHoro',
  description: 'Manage your ChandraHoro preferences and account settings',
};

export default async function SettingsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/settings');
  }

  // Fetch user profile with preferences
  const profile = await prisma.profile.findUnique({
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
    },
  });

  // Create default profile if it doesn't exist
  if (!profile) {
    const newProfile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        fullName: session.user.name || '',
        language: 'en',
        theme: 'auto',
        tonePreference: 'practical',
        notificationPreferences: {
          daily_reading: true,
          transit_alerts: true,
          email_notifications: true,
          push_notifications: true,
        },
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
      },
    });

    return <SettingsPageClient session={session} profile={newProfile} />;
  }

  return <SettingsPageClient session={session} profile={profile} />;
}
