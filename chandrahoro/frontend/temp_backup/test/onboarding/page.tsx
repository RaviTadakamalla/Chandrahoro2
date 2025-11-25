/**
 * Onboarding Test Page
 * 
 * Comprehensive testing interface for the onboarding flow.
 * Allows testing all components and states.
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  OnboardingFlow,
  ProgressIndicator,
  Step1BirthDetails,
  Step2Preferences,
  Step3Generating,
  PlaceAutocomplete,
  useOnboardingStore,
  validateBirthDetails,
  canCompleteStep,
  getStepStatus,
} from '@/components/onboarding';

export default function OnboardingTestPage() {
  const { data: session } = useSession();
  const [testStep, setTestStep] = useState(1);
  const [testError, setTestError] = useState('');

  const {
    step,
    birthDetails,
    preferences,
    isCompleted,
    isGenerating,
    generationProgress,
    setStep,
    reset,
  } = useOnboardingStore();

  const validationErrors = validateBirthDetails(birthDetails);
  const canComplete1 = canCompleteStep(1, { step, birthDetails, preferences, isCompleted, isGenerating, generationProgress } as any);
  const canComplete2 = canCompleteStep(2, { step, birthDetails, preferences, isCompleted, isGenerating, generationProgress } as any);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Onboarding Flow Test</h1>
        <p className="text-muted-foreground">
          Test all onboarding components and functionality
        </p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="flow">Full Flow</TabsTrigger>
          <TabsTrigger value="step1">Step 1</TabsTrigger>
          <TabsTrigger value="step2">Step 2</TabsTrigger>
          <TabsTrigger value="step3">Step 3</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
        </TabsList>

        {/* Full Flow Test */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Onboarding Flow</CardTitle>
              <CardDescription>
                Test the full onboarding experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingFlow />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 1 Test */}
        <TabsContent value="step1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Birth Details</CardTitle>
              <CardDescription>
                Test birth details form and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Step1BirthDetails
                onNext={() => setTestStep(2)}
                onError={setTestError}
              />
              {testError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-destructive text-sm">{testError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2 Test */}
        <TabsContent value="step2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Preferences</CardTitle>
              <CardDescription>
                Test preferences selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Step2Preferences
                onBack={() => setTestStep(1)}
                onNext={() => setTestStep(3)}
                onError={setTestError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3 Test */}
        <TabsContent value="step3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Generating</CardTitle>
              <CardDescription>
                Test chart generation flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Step3Generating
                onComplete={() => console.log('Generation complete!')}
                onBack={() => setTestStep(2)}
                error={testError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Components Test */}
        <TabsContent value="components" className="space-y-6">
          {/* Progress Indicator */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Indicator</CardTitle>
              <CardDescription>
                Test progress indicator with different steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((stepNum) => (
                  <Button
                    key={stepNum}
                    variant={testStep === stepNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTestStep(stepNum)}
                  >
                    Step {stepNum}
                  </Button>
                ))}
              </div>
              <ProgressIndicator currentStep={testStep} totalSteps={3} />
            </CardContent>
          </Card>

          {/* Place Autocomplete */}
          <Card>
            <CardHeader>
              <CardTitle>Place Autocomplete</CardTitle>
              <CardDescription>
                Test Google Places integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceAutocomplete
                onPlaceSelect={(place) => {
                  console.log('Selected place:', place);
                  setTestError(`Selected: ${place.name} (${place.lat}, ${place.lng}) - ${place.timezone}`);
                }}
                onError={setTestError}
              />
              {testError && (
                <div className="mt-4 p-3 bg-muted rounded">
                  <p className="text-sm">{testError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* State Management Test */}
        <TabsContent value="state" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding State</CardTitle>
              <CardDescription>
                Current state and validation status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current State */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Step</p>
                  <Badge variant="outline">{step}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Completed</p>
                  <Badge variant={isCompleted ? 'default' : 'secondary'}>
                    {isCompleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Generating</p>
                  <Badge variant={isGenerating ? 'default' : 'secondary'}>
                    {isGenerating ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Progress</p>
                  <Badge variant="outline">{generationProgress}%</Badge>
                </div>
              </div>

              <Separator />

              {/* Birth Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Birth Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {birthDetails.fullName || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {birthDetails.birthDate?.toDateString() || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {birthDetails.birthTime || (birthDetails.hasTimeUnknown ? 'Unknown' : 'Not set')}
                  </div>
                  <div>
                    <span className="font-medium">Place:</span> {birthDetails.birthPlace || 'Not set'}
                  </div>
                  <div>
                    <span className="font-medium">Coordinates:</span> {
                      birthDetails.latitude && birthDetails.longitude 
                        ? `${birthDetails.latitude.toFixed(4)}, ${birthDetails.longitude.toFixed(4)}`
                        : 'Not set'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Timezone:</span> {birthDetails.timezone || 'Not set'}
                  </div>
                </div>

                {/* Validation Status */}
                <div className="space-y-2">
                  <h4 className="font-medium">Validation Status:</h4>
                  <div className="flex gap-2">
                    <Badge variant={canComplete1 ? 'default' : 'destructive'}>
                      Step 1: {canComplete1 ? 'Valid' : 'Invalid'}
                    </Badge>
                    <Badge variant={canComplete2 ? 'default' : 'secondary'}>
                      Step 2: {canComplete2 ? 'Valid' : 'N/A'}
                    </Badge>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="text-sm text-destructive">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Language:</span> {preferences.language}
                  </div>
                  <div>
                    <span className="font-medium">Tone:</span> {preferences.tone}
                  </div>
                  <div>
                    <span className="font-medium">Theme:</span> {preferences.theme}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={reset} variant="outline">
                  Reset Store
                </Button>
                <Button onClick={() => setStep(1)} variant="outline">
                  Go to Step 1
                </Button>
                <Button onClick={() => setStep(2)} variant="outline">
                  Go to Step 2
                </Button>
                <Button onClick={() => setStep(3)} variant="outline">
                  Go to Step 3
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Current authentication state
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">User ID:</span> {session.user?.id}</div>
                  <div><span className="font-medium">Name:</span> {session.user?.name}</div>
                  <div><span className="font-medium">Email:</span> {session.user?.email}</div>
                </div>
              ) : (
                <p className="text-muted-foreground">Not authenticated</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
