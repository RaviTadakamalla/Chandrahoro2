/**
 * Step 2: Preferences Component
 * 
 * Collects user preferences for language, reading tone, and theme.
 * Provides visual selection interface with preview options.
 */

'use client';

import { useState } from 'react';
import { Settings, Globe, Palette, Moon, Sun, Monitor, Sparkles, Brain, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useOnboardingStore, type UserPreferences } from '@/store/onboarding';
import { cn } from '@/lib/utils';

interface Step2PreferencesProps {
  onBack: () => void;
  onNext: () => void;
  onError?: (error: string) => void;
}

interface PreferenceOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview?: string;
}

const languageOptions: PreferenceOption[] = [
  {
    value: 'en',
    label: 'English',
    description: 'Readings and interface in English',
    icon: <Globe className="h-5 w-5" />,
    preview: 'Your planetary positions suggest...',
  },
  {
    value: 'te',
    label: 'తెలుగు',
    description: 'Readings and interface in Telugu',
    icon: <Globe className="h-5 w-5" />,
    preview: 'మీ గ్రహ స్థానాలు సూచిస్తున్నవి...',
  },
];

const toneOptions: PreferenceOption[] = [
  {
    value: 'mystic',
    label: 'Mystic',
    description: 'Spiritual and traditional approach',
    icon: <Sparkles className="h-5 w-5" />,
    preview: 'The cosmic energies reveal ancient wisdom...',
  },
  {
    value: 'practical',
    label: 'Practical',
    description: 'Actionable insights and guidance',
    icon: <Brain className="h-5 w-5" />,
    preview: 'Based on your chart, consider focusing on...',
  },
  {
    value: 'playful',
    label: 'Playful',
    description: 'Light-hearted and engaging style',
    icon: <Heart className="h-5 w-5" />,
    preview: 'The stars are having fun with your chart today...',
  },
];

const themeOptions: PreferenceOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright and clean interface',
    icon: <Sun className="h-5 w-5" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes, perfect for night',
    icon: <Moon className="h-5 w-5" />,
  },
  {
    value: 'auto',
    label: 'Auto',
    description: 'Follows your system preference',
    icon: <Monitor className="h-5 w-5" />,
  },
];

export default function Step2Preferences({ onBack, onNext, onError }: Step2PreferencesProps) {
  const { preferences, updatePreferences } = useOnboardingStore();
  const [selectedPreferences, setSelectedPreferences] = useState<UserPreferences>(preferences);

  /**
   * Handle preference change
   */
  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...selectedPreferences, [key]: value };
    setSelectedPreferences(newPreferences);
    updatePreferences({ [key]: value });
  };

  /**
   * Handle continue to next step
   */
  const handleContinue = () => {
    onError?.('');
    updatePreferences(selectedPreferences);
    onNext();
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Settings className="h-6 w-6 text-orange-500" />
          Your Preferences
        </CardTitle>
        <CardDescription>
          Customize your ChandraHoro experience to match your style
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Language Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Language</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred language for readings and interface
            </p>
          </div>
          
          <RadioGroup
            value={selectedPreferences.language}
            onValueChange={(value) => handlePreferenceChange('language', value as 'en' | 'te')}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {languageOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`language-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`language-${option.value}`}
                  className={cn(
                    'flex flex-col items-start space-y-3 rounded-lg border-2 p-4 cursor-pointer transition-all',
                    'hover:bg-accent hover:border-accent-foreground/20',
                    'peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-950/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  {option.preview && (
                    <div className="text-xs italic text-muted-foreground bg-muted/50 rounded p-2 w-full">
                      "{option.preview}"
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Reading Tone Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Reading Tone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              How would you like your astrological insights to be presented?
            </p>
          </div>
          
          <RadioGroup
            value={selectedPreferences.tone}
            onValueChange={(value) => handlePreferenceChange('tone', value as any)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {toneOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`tone-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`tone-${option.value}`}
                  className={cn(
                    'flex flex-col items-center space-y-3 rounded-lg border-2 p-4 cursor-pointer transition-all text-center',
                    'hover:bg-accent hover:border-accent-foreground/20',
                    'peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-950/20'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    {option.icon}
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  {option.preview && (
                    <div className="text-xs italic text-muted-foreground bg-muted/50 rounded p-2 w-full">
                      "{option.preview}"
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred color scheme
            </p>
          </div>
          
          <RadioGroup
            value={selectedPreferences.theme}
            onValueChange={(value) => handlePreferenceChange('theme', value as any)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {themeOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`theme-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`theme-${option.value}`}
                  className={cn(
                    'flex flex-col items-center space-y-3 rounded-lg border-2 p-4 cursor-pointer transition-all text-center',
                    'hover:bg-accent hover:border-accent-foreground/20',
                    'peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-950/20'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    {option.icon}
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleContinue} 
            className="flex-1"
          >
            Generate My Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
