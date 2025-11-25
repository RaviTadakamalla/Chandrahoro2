/**
 * Onboarding Store for ChandraHoro V2.1
 * 
 * Zustand store for managing onboarding flow state with persistence.
 * Handles birth details, preferences, and step navigation.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Birth details interface
 */
export interface BirthDetails {
  fullName: string;
  birthDate: Date | null;
  birthTime: string;
  hasTimeUnknown: boolean;
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  language: 'en' | 'te';
  tone: 'mystic' | 'practical' | 'playful';
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Onboarding store state interface
 */
interface OnboardingState {
  // Current step (1-3)
  step: number;
  
  // Birth details from step 1
  birthDetails: BirthDetails;
  
  // User preferences from step 2
  preferences: UserPreferences;
  
  // Completion status
  isCompleted: boolean;
  
  // Loading states
  isGenerating: boolean;
  generationProgress: number;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBirthDetails: (details: Partial<BirthDetails>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  markCompleted: () => void;
  reset: () => void;
}

/**
 * Default birth details
 */
const defaultBirthDetails: BirthDetails = {
  fullName: '',
  birthDate: null,
  birthTime: '',
  hasTimeUnknown: false,
  birthPlace: '',
  latitude: null,
  longitude: null,
  timezone: 'UTC',
};

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
  language: 'en',
  tone: 'practical',
  theme: 'auto',
};

/**
 * Initial state
 */
const initialState = {
  step: 1,
  birthDetails: defaultBirthDetails,
  preferences: defaultPreferences,
  isCompleted: false,
  isGenerating: false,
  generationProgress: 0,
};

/**
 * Onboarding store with persistence
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Step navigation
      setStep: (step: number) => {
        if (step >= 1 && step <= 3) {
          set({ step });
        }
      },

      nextStep: () => {
        const { step } = get();
        if (step < 3) {
          set({ step: step + 1 });
        }
      },

      prevStep: () => {
        const { step } = get();
        if (step > 1) {
          set({ step: step - 1 });
        }
      },

      // Birth details management
      updateBirthDetails: (details: Partial<BirthDetails>) => {
        set((state) => ({
          birthDetails: {
            ...state.birthDetails,
            ...details,
          },
        }));
      },

      // Preferences management
      updatePreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        }));
      },

      // Generation state management
      setGenerating: (isGenerating: boolean) => {
        set({ isGenerating });
        if (!isGenerating) {
          set({ generationProgress: 0 });
        }
      },

      setGenerationProgress: (progress: number) => {
        set({ generationProgress: Math.max(0, Math.min(100, progress)) });
      },

      // Completion management
      markCompleted: () => {
        set({ isCompleted: true });
      },

      // Reset store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'chandrahoro-onboarding',
      storage: createJSONStorage(() => localStorage),
      
      // Custom serialization for Date objects
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          state: {
            ...state.state,
            birthDetails: {
              ...state.state.birthDetails,
              birthDate: state.state.birthDetails.birthDate?.toISOString() || null,
            },
          },
        });
      },
      
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            birthDetails: {
              ...parsed.state.birthDetails,
              birthDate: parsed.state.birthDetails.birthDate 
                ? new Date(parsed.state.birthDetails.birthDate)
                : null,
            },
          },
        };
      },
      
      // Only persist certain fields
      partialize: (state) => ({
        step: state.step,
        birthDetails: state.birthDetails,
        preferences: state.preferences,
        isCompleted: state.isCompleted,
      }),
    }
  )
);

/**
 * Validation helpers
 */
export const validateBirthDetails = (details: BirthDetails): string[] => {
  const errors: string[] = [];

  if (!details.fullName || details.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!details.birthDate) {
    errors.push('Birth date is required');
  }

  if (!details.hasTimeUnknown && (!details.birthTime || !details.birthTime.match(/^\d{2}:\d{2}$/))) {
    errors.push('Valid birth time required (HH:MM format) unless marked unknown');
  }

  if (!details.birthPlace || details.birthPlace.trim().length === 0) {
    errors.push('Birth place is required');
  }

  if (details.latitude === null || details.longitude === null) {
    errors.push('Valid location coordinates are required');
  }

  return errors;
};

/**
 * Helper to check if step can be completed
 */
export const canCompleteStep = (step: number, state: OnboardingState): boolean => {
  switch (step) {
    case 1:
      return validateBirthDetails(state.birthDetails).length === 0;
    case 2:
      return true; // Preferences have defaults
    case 3:
      return state.isCompleted;
    default:
      return false;
  }
};

/**
 * Helper to get step completion status
 */
export const getStepStatus = (step: number, currentStep: number, state: OnboardingState) => {
  if (step < currentStep) {
    return canCompleteStep(step, state) ? 'completed' : 'error';
  } else if (step === currentStep) {
    return 'current';
  } else {
    return 'pending';
  }
};

/**
 * Helper to format birth details for API
 */
export const formatBirthDetailsForAPI = (details: BirthDetails) => {
  return {
    birthDate: details.birthDate?.toISOString().split('T')[0], // YYYY-MM-DD format
    birthTime: details.hasTimeUnknown ? null : details.birthTime,
    birthPlace: details.birthPlace,
    latitude: details.latitude,
    longitude: details.longitude,
    timezone: details.timezone,
  };
};

/**
 * Helper to format preferences for API
 */
export const formatPreferencesForAPI = (preferences: UserPreferences) => {
  return {
    language: preferences.language,
    tonePreference: preferences.tone,
    theme: preferences.theme,
  };
};
