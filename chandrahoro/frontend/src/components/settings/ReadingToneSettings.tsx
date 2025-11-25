/**
 * Reading Tone Settings Component
 * 
 * Allows users to customize the tone and style of their astrological readings.
 */

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Brain, Heart } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';

interface ReadingToneSettingsProps {
  session: any;
  profile: any;
}

export default function ReadingToneSettings({ session, profile }: ReadingToneSettingsProps) {
  const queryClient = useQueryClient();
  
  const [selectedTone, setSelectedTone] = useState(
    profile?.tonePreference || 'practical'
  );

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update reading tone');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Reading tone updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update reading tone');
    },
  });

  // Handle tone change
  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
    updateProfile.mutate({ tonePreference: tone });
  };

  // Tone options with detailed descriptions and examples
  const toneOptions = [
    {
      value: 'mystic',
      label: 'Mystic',
      icon: Sparkles,
      description: 'Spiritual and mystical language with cosmic insights',
      characteristics: [
        'Poetic and spiritual language',
        'Emphasis on cosmic connections',
        'Mystical interpretations',
        'Soul-focused guidance',
      ],
      example: `The celestial dance of Venus in your seventh house whispers of profound 
        soul connections approaching your path. The universe conspires to bring you 
        experiences that will awaken your heart to deeper truths about love and partnership.`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      value: 'practical',
      label: 'Practical',
      icon: Brain,
      description: 'Clear, actionable insights focused on real-world applications',
      characteristics: [
        'Direct and clear communication',
        'Actionable advice',
        'Real-world applications',
        'Goal-oriented guidance',
      ],
      example: `Venus entering your seventh house suggests this is an excellent time to 
        focus on relationships and partnerships. Consider having important conversations 
        with your partner or being open to meeting new people if you're single.`,
      color: 'from-blue-500 to-green-500',
    },
    {
      value: 'playful',
      label: 'Playful',
      icon: Heart,
      description: 'Light-hearted and engaging with a touch of humor',
      characteristics: [
        'Warm and friendly tone',
        'Light humor and wit',
        'Encouraging language',
        'Optimistic perspective',
      ],
      example: `Oh my! Venus is throwing a party in your seventh house, and everyone's 
        invited! This cosmic celebration means love is in the air, and your charm is 
        absolutely irresistible right now. Time to put on your best smile!`,
      color: 'from-orange-500 to-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tone Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Tone Preference</CardTitle>
          <CardDescription>
            Choose how you'd like your astrological readings to be presented
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup
            value={selectedTone}
            onValueChange={handleToneChange}
            className="space-y-6"
          >
            {toneOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                      {selectedTone === option.value && (
                        <div className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Selected
                        </div>
                      )}
                    </div>

                    {/* Characteristics */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Characteristics:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {option.characteristics.map((char, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example */}
                    <div>
                      <h4 className="font-medium mb-2">Example reading:</h4>
                      <div className="text-sm bg-muted/50 p-3 rounded border italic">
                        "{option.example}"
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Preferences</CardTitle>
          <CardDescription>
            Fine-tune your reading experience
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Reading Length</h4>
              <p className="text-muted-foreground">
                All tones provide comprehensive insights with varying levels of detail 
                based on the complexity of your chart.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Cultural Context</h4>
              <p className="text-muted-foreground">
                Readings incorporate traditional Vedic astrology principles while 
                adapting to your selected tone preference.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Personalization</h4>
              <p className="text-muted-foreground">
                Your birth chart details and previous reading history help customize 
                the tone and content specifically for you.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Consistency</h4>
              <p className="text-muted-foreground">
                Once selected, your tone preference applies to all future readings 
                and can be changed anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Your Tone */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Your Selected Tone</CardTitle>
          <CardDescription>
            See how your current tone preference affects readings
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium mb-2">Sample Daily Reading Preview:</h4>
              <div className="text-sm italic">
                {toneOptions.find(option => option.value === selectedTone)?.example}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Generate Sample Reading
              </Button>
              <Button variant="outline" size="sm">
                View Reading History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
