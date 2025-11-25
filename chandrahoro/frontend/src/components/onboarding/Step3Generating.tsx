/**
 * Step 3: Generating Component
 * 
 * Shows progress while generating birth chart and completing onboarding.
 * Displays animated progress with stage descriptions.
 */

'use client';

import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { LoadingSpinner } from '@/components/states/LoadingSpinner';
import { useOnboardingStore } from '@/store/onboarding';

interface Step3GeneratingProps {
  onComplete: () => void;
  onBack: () => void;
  error?: string;
}

interface GenerationStage {
  threshold: number;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const generationStages: GenerationStage[] = [
  {
    threshold: 10,
    label: 'Initializing...',
    description: 'Preparing your birth chart calculation',
    icon: <Sparkles className="h-5 w-5 text-orange-500" />,
  },
  {
    threshold: 33,
    label: 'Calculating planetary positions...',
    description: 'Computing precise locations of planets at your birth time',
    icon: <Sparkles className="h-5 w-5 text-orange-500" />,
  },
  {
    threshold: 66,
    label: 'Computing Dasha periods...',
    description: 'Determining your Vimshottari Dasha timeline',
    icon: <Sparkles className="h-5 w-5 text-orange-500" />,
  },
  {
    threshold: 90,
    label: 'Finalizing your profile...',
    description: 'Setting up your personalized experience',
    icon: <Sparkles className="h-5 w-5 text-orange-500" />,
  },
  {
    threshold: 100,
    label: 'Complete!',
    description: 'Your personalized chart is ready',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
];

export default function Step3Generating({ onComplete, onBack, error }: Step3GeneratingProps) {
  const { 
    isGenerating, 
    generationProgress, 
    setGenerating, 
    setGenerationProgress 
  } = useOnboardingStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Find current stage based on progress
  const currentStage = generationStages.find((stage, index) => {
    const nextStage = generationStages[index + 1];
    return generationProgress >= stage.threshold && 
           (!nextStage || generationProgress < nextStage.threshold);
  }) || generationStages[0];

  // Update current stage index
  useEffect(() => {
    const stageIndex = generationStages.findIndex(stage => stage === currentStage);
    setCurrentStageIndex(stageIndex);
  }, [currentStage]);

  /**
   * Start the generation process
   */
  const handleStartGeneration = () => {
    setHasStarted(true);
    onComplete();
  };

  /**
   * Retry generation on error
   */
  const handleRetry = () => {
    setGenerating(false);
    setGenerationProgress(0);
    setHasStarted(false);
  };

  // Show error state
  if (error && !isGenerating) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            Generation Failed
          </CardTitle>
          <CardDescription>
            We encountered an issue while creating your chart
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back to Preferences
            </Button>
            <Button onClick={handleRetry} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show initial state before generation starts
  if (!hasStarted && !isGenerating) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            Ready to Create Your Chart
          </CardTitle>
          <CardDescription>
            We'll now generate your personalized Vedic astrology chart
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg p-6 space-y-4">
            <div className="text-6xl">🌙</div>
            <div className="space-y-2">
              <h3 className="font-semibold">What we'll create for you:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete birth chart with planetary positions</li>
                <li>• Vimshottari Dasha timeline</li>
                <li>• Personalized daily readings</li>
                <li>• Your astrological profile</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back to Preferences
            </Button>
            <Button onClick={handleStartGeneration} className="flex-1">
              Generate My Chart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show generation progress
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-500" />
          Creating Your Personalized Chart
        </CardTitle>
        <CardDescription>
          Please wait while we calculate your unique astrological profile
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-8">
        {/* Main Loading Animation */}
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress value={generationProgress} className="w-full h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(generationProgress)}%</span>
          </div>
        </div>

        {/* Current Stage */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {currentStage.icon}
            <h3 className="text-lg font-semibold">{currentStage.label}</h3>
          </div>
          <p className="text-muted-foreground">{currentStage.description}</p>
        </div>

        {/* Stage Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {generationStages.slice(0, -1).map((stage, index) => {
            const isCompleted = generationProgress >= stage.threshold;
            const isCurrent = currentStageIndex === index;

            return (
              <div
                key={index}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300'
                    : isCurrent
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                <div className="text-xs font-medium text-center">
                  {stage.label.split('...')[0]}
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-orange-500'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {generationProgress === 100 && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Chart generation complete!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {/* Fun Facts During Generation */}
        {isGenerating && generationProgress < 100 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground italic">
              💫 Did you know? Vedic astrology uses the sidereal zodiac, which accounts for the precession of the equinoxes, making it more astronomically accurate than tropical astrology.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
