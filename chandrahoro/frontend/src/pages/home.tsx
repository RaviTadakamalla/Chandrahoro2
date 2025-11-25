import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AlertCircle } from 'lucide-react';
import BirthDetailsForm from '@/components/forms/BirthDetailsForm';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorAlert } from '@/components/ui/error-alert';
import { BirthDetails, ChartPreferences, ChartData, ChartResponse, apiClient, UserInfo } from '@/lib/api';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { SaffronButton } from '@/components/SaffronButton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChartGeneration = useCallback(async (
    birthDetails: BirthDetails,
    preferences: ChartPreferences
  ) => {
    setError(null);
    setIsGenerating(true);

    try {
      console.log('=== CHART GENERATION START ===');
      console.log('Birth details received:', JSON.stringify(birthDetails, null, 2));
      console.log('Chart preferences received:', JSON.stringify(preferences, null, 2));

      const chartResponse = await apiClient.calculateChart({
        birth_details: birthDetails,
        preferences: preferences
      });

      console.log('Chart response received:', chartResponse);

      if (!chartResponse.success || !chartResponse.data) {
        throw new Error(chartResponse.error || 'Failed to calculate chart');
      }

      const chartData = chartResponse.data;
      console.log('Chart generated successfully:', chartData);

      // Store chart data in sessionStorage for the result page
      console.log('=== STORING DATA IN SESSION STORAGE ===');
      console.log('Storing chartData:', JSON.stringify(chartData, null, 2));
      console.log('Storing birthDetails:', JSON.stringify(birthDetails, null, 2));
      console.log('Storing preferences:', JSON.stringify(preferences, null, 2));

      sessionStorage.setItem('chartData', JSON.stringify(chartData));
      sessionStorage.setItem('birthDetails', JSON.stringify(birthDetails));
      sessionStorage.setItem('chartPreferences', JSON.stringify(preferences));

      console.log('=== DATA STORED, NAVIGATING TO RESULT PAGE ===');
      // Navigate to chart result page
      router.push('/chart/result');
    } catch (err) {
      console.error('Chart generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Birth Chart Calculator - ChandraHoro</title>
        <meta name="description" content="Generate your personalized Vedic astrology birth chart with accurate planetary positions and AI-powered insights." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-charcoal">
        <MainNav />



        {/* Page Header */}
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-charcoal dark:text-white mb-4">
            Generate Your <span className="text-saffron-500 dark:text-saffron-400">Birth Chart</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter your birth details to generate an accurate Vedic astrology chart with planetary positions, dashas, and AI-powered insights.
          </p>
        </div>

        {/* Full Viewport Two Column Layout: Image Left (50%), Form Right (50%) */}
        <main className="flex flex-col lg:flex-row min-h-screen w-full">
          {/* Left Section: Home Page Image - 50% Width */}
          <div className="flex-1 w-full lg:w-1/2 h-64 lg:h-screen overflow-hidden relative bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-saffron-900/20 dark:to-orange-900/20">
            <Image
              src="/images/homepage.png"
              alt="ChandraHoro - Birth Chart Calculator"
              width={800}
              height={600}
              className="w-full h-full object-cover object-center"
              priority
            />
          </div>

          {/* Right Section: Birth Details Form - 50% Width */}
          <div className="flex-1 w-full lg:w-1/2 h-auto lg:h-screen flex items-center justify-center p-6 lg:p-10 bg-white dark:bg-gray-900">
            <div className="w-full max-w-lg">
              {error && (
                <ErrorAlert
                  message={error}
                  type="error"
                  className="mb-6"
                />
              )}

              <BirthDetailsForm
                onSubmit={handleChartGeneration}
                isLoading={isGenerating}
                error={error || undefined}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
