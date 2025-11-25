/**
 * Appearance Settings Component
 * 
 * Allows users to customize the visual appearance of the application
 * including theme, font size, and display preferences.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Sun, Moon, Monitor, Type, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AppearanceSettingsProps {
  session: any;
  profile: any;
}

export default function AppearanceSettings({ session, profile }: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    theme: profile?.theme || 'auto',
    fontSize: profile?.fontSize || 'medium',
    reducedMotion: profile?.reducedMotion || false,
    highContrast: profile?.highContrast || false,
  });

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
        throw new Error(error.error?.message || 'Failed to update appearance settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Appearance settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appearance settings');
    },
  });

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    updateProfile.mutate({ theme: newTheme });
  };

  // Handle setting change
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    updateProfile.mutate({ [key]: value });
  };

  // Theme options
  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
    },
    {
      value: 'auto',
      label: 'System',
      description: 'Matches your device settings',
      icon: Monitor,
    },
  ];

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: 'Compact text size' },
    { value: 'medium', label: 'Medium', description: 'Default text size' },
    { value: 'large', label: 'Large', description: 'Larger text for better readability' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup
            value={settings.theme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {themeOptions.map((option) => {
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
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <IconComponent className="w-6 h-6 mb-2" />
                    <div className="text-center">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Font Size
          </CardTitle>
          <CardDescription>
            Adjust text size for better readability
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Select
            value={settings.fontSize}
            onValueChange={(value) => handleSettingChange('fontSize', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Accessibility Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Options to improve accessibility and usability
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings affect the interface
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-saffron-500"></div>
              <div>
                <div className="font-medium">Sample Heading</div>
                <div className="text-sm text-muted-foreground">
                  This is how text will appear with your current settings
                </div>
              </div>
            </div>
            <div className="text-sm">
              Your birth chart reveals fascinating insights about your personality 
              and life path. The positions of celestial bodies at your birth time 
              create a unique cosmic fingerprint.
            </div>
            <Button size="sm" className="w-fit">
              Sample Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
