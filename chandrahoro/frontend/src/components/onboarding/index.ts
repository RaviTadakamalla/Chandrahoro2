/**
 * Onboarding Components Index
 * 
 * Centralized exports for all onboarding-related components.
 */

export { default as OnboardingFlow } from './OnboardingFlow';
export { default as ProgressIndicator } from './ProgressIndicator';
export { default as Step1BirthDetails } from './Step1BirthDetails';
export { default as Step2Preferences } from './Step2Preferences';
export { default as Step3Generating } from './Step3Generating';
export { default as PlaceAutocomplete } from './PlaceAutocomplete';

// Re-export types
export type { PlaceResult } from './PlaceAutocomplete';

// Re-export store
export {
  useOnboardingStore,
  validateBirthDetails,
  canCompleteStep,
  getStepStatus,
  formatBirthDetailsForAPI,
  formatPreferencesForAPI,
} from '@/store/onboarding';

export type {
  BirthDetails,
  UserPreferences,
} from '@/store/onboarding';
