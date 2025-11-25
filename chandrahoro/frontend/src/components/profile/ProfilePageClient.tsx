/**
 * Profile Page Client Component
 * 
 * Client-side profile page with user information, chart summary,
 * AI quota display, and navigation actions.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { Share2, Settings, BarChart3, Crown } from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ProfilePageClientProps {
  session: Session;
  profile: any;
  primaryChart: any;
  entitlement: any;
}

export default function ProfilePageClient({
  session,
  profile,
  primaryChart,
  entitlement,
}: ProfilePageClientProps) {
  const router = useRouter();

  // Generate user initials
  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  // Calculate quota percentage
  const quotaUsed = entitlement?.dailyRequestsUsed || 0;
  const quotaLimit = entitlement?.dailyRequestLimit || 10;
  const quotaPercentage = Math.round((quotaUsed / quotaLimit) * 100);
  const quotaRemaining = quotaLimit - quotaUsed;

  // Format birth date
  const formatBirthDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle share profile
  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.user.name}'s ChandraHoro Profile`,
          text: `Check out my Vedic astrology profile on ChandraHoro`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="p-6 text-center space-y-4">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage 
            src={session?.user?.image || profile?.avatarUrl} 
            alt={session?.user?.name || 'User avatar'}
          />
          <AvatarFallback className="text-2xl bg-saffron-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">
            {session?.user?.name || profile?.fullName || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {session?.user?.email}
          </p>
          {session?.user?.emailVerified && (
            <Badge variant="secondary" className="mt-2">
              ✓ Verified
            </Badge>
          )}
          {primaryChart?.ascendant && (
            <p className="text-saffron-600 dark:text-saffron-400 font-medium mt-2">
              {primaryChart.ascendant} Rising
            </p>
          )}
        </div>
      </Card>

      {/* Chart Summary */}
      {primaryChart && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-xl">Chart Summary</CardTitle>
            <CardDescription>
              Your primary birth chart information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sun Sign</p>
                <p className="font-medium">☀️ {primaryChart.sunSign}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Moon Sign</p>
                <p className="font-medium">☾ {primaryChart.moonSign}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Birth Date</p>
                <p className="font-medium">
                  🎂 {formatBirthDate(primaryChart.birthDate)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Birth Place</p>
                <p className="font-medium">📍 {primaryChart.birthPlace}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/charts')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Chart
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Quota Status */}
      {entitlement && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">AI Quota</CardTitle>
                <CardDescription>
                  Daily AI reading requests
                </CardDescription>
              </div>
              <Badge 
                variant={entitlement.planType === 'free' ? 'secondary' : 'default'}
                className="capitalize"
              >
                {entitlement.planType === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                {entitlement.planType}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used today</span>
                <span>{quotaUsed} of {quotaLimit}</span>
              </div>
              <Progress value={quotaPercentage} className="h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quotaRemaining} requests remaining
              </p>
            </div>
            
            {entitlement.planType === 'free' && (
              <Button
                className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600"
                onClick={() => router.push('/pricing')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/settings')}
          className="h-12"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button 
          variant="outline" 
          onClick={handleShareProfile}
          className="h-12"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Profile
        </Button>
      </div>

      {/* Account Info */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Member since</span>
            <span>{formatBirthDate(session.user.createdAt || new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Profile completed</span>
            <span>{profile?.onboardingCompleted ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Charts created</span>
            <span>{primaryChart ? '1+' : '0'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
