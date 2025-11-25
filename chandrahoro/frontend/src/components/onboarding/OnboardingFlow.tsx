/**
 * Main Onboarding Flow Component
 * 
 * Orchestrates the 3-step onboarding process for new users.
 * Handles birth details, preferences, chart generation, and completion.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useOnboardingStore, formatBirthDetailsForAPI, formatPreferencesForAPI } from '@/store/onboarding';
import { useAuth } from '@/hooks/useAuth';

import Step1BirthDetails from './Step1BirthDetails';
import Step2Preferences from './Step2Preferences';
import Step3Generating from './Step3Generating';
import ProgressIndicator from './ProgressIndicator';

export default function OnboardingFlow() {
  const { data: session } = useSession();
  const router = useRouter();
  const { refreshSession } = useAuth();
  
  const { 
    step, 
    setStep, 
    birthDetails, 
    preferences, 
    updateBirthDetails,
    setGenerating,
    setGenerationProgress,
    markCompleted,
    reset 
  } = useOnboardingStore();

  const [error, setError] = useState<string>('');

  // Prefill name from session
  useEffect(() => {
    if (session?.user?.name && !birthDetails.fullName) {
      updateBirthDetails({ fullName: session.user.name });
    }
  }, [session, birthDetails.fullName, updateBirthDetails]);

  /**
   * Handle onboarding completion
   */
  const handleComplete = async () => {
    setError('');
    setGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate birth chart (33% progress)
      setGenerationProgress(10);
      
      const chartData = formatBirthDetailsForAPI(birthDetails);
      const chartResponse = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chartData),
      });

      if (!chartResponse.ok) {
        const errorData = await chartResponse.json();
        throw new Error(errorData.error?.message || 'Failed to generate birth chart');
      }

      setGenerationProgress(33);

      // Step 2: Update user profile with preferences (66% progress)
      const profileData = {
        ...formatPreferencesForAPI(preferences),
        onboardingCompleted: true,
      };

      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      setGenerationProgress(66);

      // Step 3: Generate initial daily reading (100% progress)
      try {
        await fetch('/api/readings/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (readingError) {
        // Don't fail onboarding if daily reading fails
        console.warn('Failed to generate initial daily reading:', readingError);
      }

      setGenerationProgress(100);

      // Mark as completed
      markCompleted();

      // Refresh session to update onboarding status
      await refreshSession();

      // Show success message
      toast.success('Welcome to ChandraHoro! Your personalized chart is ready.');

      // Clear onboarding state after a delay
      setTimeout(() => {
        reset();
        router.push('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      setError(error.message || 'Failed to complete onboarding. Please try again.');
      setGenerating(false);
      setGenerationProgress(0);
      
      toast.error('Failed to complete setup. Please try again.');
    }
  };

  /**
   * Handle step navigation
   */
  const handleStepChange = (newStep: number) => {
    setError('');
    setStep(newStep);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
            <span className="text-3xl">🌙</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to ChandraHoro</h1>
            <p className="text-muted-foreground mt-2">
              Let's create your personalized Vedic astrology profile
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={step} totalSteps={3} />

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-background rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <Step1BirthDetails
              onNext={() => handleStepChange(2)}
              onError={setError}
            />
          )}

          {step === 2 && (
            <Step2Preferences
              onBack={() => handleStepChange(1)}
              onNext={() => handleStepChange(3)}
              onError={setError}
            />
          )}

          {step === 3 && (
            <Step3Generating
              onComplete={handleComplete}
              onBack={() => handleStepChange(2)}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Your data is secure and will only be used to generate your personalized readings.
          </p>
        </div>
      </div>
    </div>
  );
}
