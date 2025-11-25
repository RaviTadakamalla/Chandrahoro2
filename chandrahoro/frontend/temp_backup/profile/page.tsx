/**
 * Profile Page
 * 
 * User profile page displaying personal information, chart summary,
 * AI quota status, and quick actions.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfilePageClient from '@/components/profile/ProfilePageClient';

export const metadata: Metadata = {
  title: 'Profile | ChandraHoro',
  description: 'View and manage your ChandraHoro profile',
};

export default async function ProfilePage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  // Fetch user profile data
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

  // Fetch primary birth chart
  const primaryChart = await prisma.birthChart.findFirst({
    where: {
      userId: session.user.id,
      isPrimary: true,
    },
    select: {
      id: true,
      birthDate: true,
      birthPlace: true,
      ascendant: true,
      sunSign: true,
      moonSign: true,
      createdAt: true,
    },
  });

  // Fetch entitlement data
  const entitlement = await prisma.entitlement.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      planType: true,
      dailyRequestLimit: true,
      dailyRequestsUsed: true,
      quotaResetAt: true,
    },
  });

  return (
    <ProfilePageClient
      session={session}
      profile={profile}
      primaryChart={primaryChart}
      entitlement={entitlement}
    />
  );
}
