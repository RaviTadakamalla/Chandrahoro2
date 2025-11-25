/**
 * Onboarding Page
 * 
 * Main onboarding page that guides new users through the setup process.
 * Protected route that requires authentication but not completed onboarding.
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Welcome to ChandraHoro | Complete Your Setup',
  description: 'Complete your personalized Vedic astrology profile setup',
};

export default async function OnboardingPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/onboarding');
  }

  // Check if user has already completed onboarding
  const userProfile = await prisma.userProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      onboardingCompleted: true,
    },
  });

  // Redirect to dashboard if onboarding is already completed
  if (userProfile?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return <OnboardingFlow />;
}
