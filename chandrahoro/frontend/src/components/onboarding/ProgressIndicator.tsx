/**
 * Progress Indicator Component
 * 
 * Visual progress indicator for the onboarding flow.
 * Shows current step and completion status.
 */

'use client';

import { CheckCircle, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

interface StepInfo {
  number: number;
  title: string;
  description: string;
}

const stepInfo: StepInfo[] = [
  {
    number: 1,
    title: 'Birth Details',
    description: 'Your birth information',
  },
  {
    number: 2,
    title: 'Preferences',
    description: 'Customize your experience',
  },
  {
    number: 3,
    title: 'Generate Chart',
    description: 'Create your profile',
  },
];

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  className 
}: ProgressIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {stepInfo.slice(0, totalSteps).map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                      {
                        'bg-green-500 border-green-500 text-white': isCompleted,
                        'bg-orange-500 border-orange-500 text-white': isCurrent,
                        'bg-background border-gray-300 text-gray-400': isPending,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        {
                          'text-green-600': isCompleted,
                          'text-orange-600': isCurrent,
                          'text-gray-400': isPending,
                        }
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-24 mx-4 transition-colors duration-200',
                      {
                        'bg-green-500': step.number < currentStep,
                        'bg-orange-500': step.number === currentStep - 1,
                        'bg-gray-300': step.number >= currentStep,
                      }
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Dots */}
      <div className="md:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={cn(
                  'h-2 w-8 rounded-full transition-all duration-200',
                  {
                    'bg-green-500': isCompleted,
                    'bg-orange-500': isCurrent,
                    'bg-gray-300': step > currentStep,
                  }
                )}
              />
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}: {stepInfo[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stepInfo[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
