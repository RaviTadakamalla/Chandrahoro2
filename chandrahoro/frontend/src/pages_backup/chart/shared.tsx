import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const SharedChartPage: React.FC = () => {
  const router = useRouter();
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      try {
        const { query } = router;
        
        // Extract birth details from URL parameters
        const details: BirthDetails = {
          name: (query.name as string) || 'Shared Chart',
          date: query.date as string,
          time: query.time as string,
          location: query.location as string,
          latitude: parseFloat(query.latitude as string),
          longitude: parseFloat(query.longitude as string),
          timezone: query.timezone as string,
        };

        // Validate required parameters
        if (!details.date || !details.time || !details.location || 
            isNaN(details.latitude) || isNaN(details.longitude)) {
          throw new Error('Invalid or missing chart parameters');
        }

        setBirthDetails(details);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
        setLoading(false);
      }
    }
  }, [router.isReady, router.query]);

  const generateChart = () => {
    if (!birthDetails) return;

    // Navigate to the homepage with the birth details pre-filled
    const params = new URLSearchParams({
      name: birthDetails.name,
      date: birthDetails.date,
      time: birthDetails.time,
      location: birthDetails.location,
      latitude: birthDetails.latitude.toString(),
      longitude: birthDetails.longitude.toString(),
      timezone: birthDetails.timezone,
      autoGenerate: 'true' // Flag to auto-generate the chart
    });

    router.push(`/?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Shared Chart - ChandraHoro</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading shared chart...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - ChandraHoro</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal flex items-center justify-center">
          <div className="max-w-md mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error Loading Chart</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The shared chart link appears to be invalid or corrupted. Please check the URL and try again.
                  </p>
                  <Link href="/">
                    <SaffronButton className="w-full">
                      <ArrowLeft size={16} className="mr-2" />
                      Go to Homepage
                    </SaffronButton>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Shared Chart - Chandrahoro</title>
        <meta name="description" content="View a shared Vedic astrology chart" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-sand to-offwhite dark:from-ink-80 dark:to-charcoal">
        <MainNav />

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-poppins text-3xl font-bold text-charcoal dark:text-white mb-2">
                Shared Vedic Chart
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Someone has shared their Vedic astrology chart with you
              </p>
            </div>

          {/* Chart Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{birthDetails?.name}</span>
              </CardTitle>
              <CardDescription>
                Birth details for Vedic astrology chart calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Birth Date
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(birthDetails?.date || '')}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Birth Time
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(birthDetails?.time || '')} ({birthDetails?.timezone})
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Birth Location
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {birthDetails?.location}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {birthDetails?.latitude.toFixed(4)}°, {birthDetails?.longitude.toFixed(4)}°
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <SaffronButton
              onClick={generateChart}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Generate Vedic Chart
            </SaffronButton>

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <SaffronButton variant="outline" className="w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  Go to Homepage
                </SaffronButton>
              </Link>

              <Link href="/" className="flex-1">
                <SaffronButton variant="outline" className="w-full">
                  Create New Chart
                </SaffronButton>
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              About Shared Charts
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              This chart was shared with you using a secure link. Click "Generate Vedic Chart" above to view the complete astrological analysis including planetary positions, dashas, yogas, and more.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default SharedChartPage;
