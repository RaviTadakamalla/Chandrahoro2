/**
 * Language Settings Component
 * 
 * Allows users to configure language, region, and localization preferences.
 */

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSettingsProps {
  session: any;
  profile: any;
}

export default function LanguageSettings({ session, profile }: LanguageSettingsProps) {
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    language: profile?.language || 'en',
    timezone: profile?.timezone || 'Asia/Kolkata',
    dateFormat: profile?.dateFormat || 'MM/DD/YYYY',
    timeFormat: profile?.timeFormat || '12h',
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
        throw new Error(error.error?.message || 'Failed to update language settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Language settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update language settings');
    },
  });

  // Handle setting change
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    updateProfile.mutate({ [key]: value });
  };

  // Language options
  const languageOptions = [
    {
      value: 'en',
      label: 'English',
      nativeLabel: 'English',
      description: 'Default language with full feature support',
    },
    {
      value: 'te',
      label: 'Telugu',
      nativeLabel: 'తెలుగు',
      description: 'Native Telugu language support',
    },
  ];

  // Timezone options (common Indian timezones)
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: '+05:30' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: '+00:00' },
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: '+04:00' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: '+10:00' },
  ];

  // Date format options
  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2023' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2023' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2023-12-31' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '31 Dec 2023' },
  ];

  // Time format options
  const timeFormatOptions = [
    { value: '12h', label: '12-hour', example: '2:30 PM' },
    { value: '24h', label: '24-hour', example: '14:30' },
  ];

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language
          </CardTitle>
          <CardDescription>
            Choose your preferred language for the interface
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup
            value={settings.language}
            onValueChange={(value) => handleSettingChange('language', value)}
            className="space-y-4"
          >
            {languageOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {option.label} ({option.nativeLabel})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {settings.language === option.value && (
                      <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Current
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {settings.language === 'te' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Telugu language support includes astrological terms, 
                reading content, and interface elements. Some advanced features may still 
                display in English.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Timezone
          </CardTitle>
          <CardDescription>
            Set your timezone for accurate astrological calculations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => handleSettingChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.offset}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current time: {new Date().toLocaleString('en-US', { 
                timeZone: settings.timezone,
                hour12: settings.timeFormat === '12h'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Date & Time Format
          </CardTitle>
          <CardDescription>
            Customize how dates and times are displayed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => handleSettingChange('dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {dateFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.example}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label htmlFor="time-format">Time Format</Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value) => handleSettingChange('timeFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                {timeFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex justify-between items-center w-full">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.example}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your settings affect date and time display
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current date:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', {
                  timeZone: settings.timezone,
                  year: 'numeric',
                  month: settings.dateFormat.includes('MMM') ? 'short' : '2-digit',
                  day: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current time:</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString('en-US', {
                  timeZone: settings.timezone,
                  hour12: settings.timeFormat === '12h',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sample birth date:</span>
              <span className="font-medium">
                July 15, 1990 at 2:30 PM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
