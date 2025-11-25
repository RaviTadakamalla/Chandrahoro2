/**
 * Notification Settings Component
 * 
 * Allows users to manage their notification preferences including
 * email notifications, push notifications, and reading alerts.
 */

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail, Smartphone, Calendar, Star, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSettingsProps {
  session: any;
  profile: any;
}

export default function NotificationSettings({ session, profile }: NotificationSettingsProps) {
  const queryClient = useQueryClient();
  
  // Parse notification preferences from profile
  const currentPrefs = profile?.notificationPreferences || {};
  
  const [preferences, setPreferences] = useState({
    // Email notifications
    emailNotifications: currentPrefs.email_notifications ?? true,
    dailyReading: currentPrefs.daily_reading ?? true,
    weeklyReading: currentPrefs.weekly_reading ?? false,
    transitAlerts: currentPrefs.transit_alerts ?? true,
    
    // Push notifications
    pushNotifications: currentPrefs.push_notifications ?? true,
    instantReadings: currentPrefs.instant_readings ?? false,
    chartUpdates: currentPrefs.chart_updates ?? true,
    
    // Timing preferences
    dailyReadingTime: currentPrefs.daily_reading_time || '09:00',
    weeklyReadingDay: currentPrefs.weekly_reading_day || 'monday',
    
    // Marketing
    marketingEmails: currentPrefs.marketing_emails ?? false,
    productUpdates: currentPrefs.product_updates ?? true,
  });

  // Update profile mutation
  const updateNotifications = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationPreferences: data,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update notification settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Notification settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update notification settings');
    },
  });

  // Handle preference change
  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Convert to API format
    const apiFormat = {
      email_notifications: newPreferences.emailNotifications,
      daily_reading: newPreferences.dailyReading,
      weekly_reading: newPreferences.weeklyReading,
      transit_alerts: newPreferences.transitAlerts,
      push_notifications: newPreferences.pushNotifications,
      instant_readings: newPreferences.instantReadings,
      chart_updates: newPreferences.chartUpdates,
      daily_reading_time: newPreferences.dailyReadingTime,
      weekly_reading_day: newPreferences.weeklyReadingDay,
      marketing_emails: newPreferences.marketingEmails,
      product_updates: newPreferences.productUpdates,
    };
    
    updateNotifications.mutate(apiFormat);
  };

  // Test notification function
  const testNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Test notification sent!');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage email notifications and reading alerts
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Master Email Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            />
          </div>

          {/* Email-specific settings */}
          {preferences.emailNotifications && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Daily Reading */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reading">Daily Reading</Label>
                  <p className="text-sm text-muted-foreground">
                    Get your daily astrological insights
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={preferences.dailyReadingTime}
                    onValueChange={(value) => handlePreferenceChange('dailyReadingTime', value)}
                    disabled={!preferences.dailyReading}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    id="daily-reading"
                    checked={preferences.dailyReading}
                    onCheckedChange={(checked) => handlePreferenceChange('dailyReading', checked)}
                  />
                </div>
              </div>

              {/* Weekly Reading */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reading">Weekly Reading</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly astrological forecast
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={preferences.weeklyReadingDay}
                    onValueChange={(value) => handlePreferenceChange('weeklyReadingDay', value)}
                    disabled={!preferences.weeklyReading}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    id="weekly-reading"
                    checked={preferences.weeklyReading}
                    onCheckedChange={(checked) => handlePreferenceChange('weeklyReading', checked)}
                  />
                </div>
              </div>

              {/* Transit Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transit-alerts">Transit Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Important planetary transits affecting you
                  </p>
                </div>
                <Switch
                  id="transit-alerts"
                  checked={preferences.transitAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange('transitAlerts', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage browser and mobile push notifications
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Master Push Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications in your browser
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            />
          </div>

          {/* Push-specific settings */}
          {preferences.pushNotifications && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Instant Readings */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="instant-readings">Instant Readings</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new readings are available
                  </p>
                </div>
                <Switch
                  id="instant-readings"
                  checked={preferences.instantReadings}
                  onCheckedChange={(checked) => handlePreferenceChange('instantReadings', checked)}
                />
              </div>

              {/* Chart Updates */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chart-updates">Chart Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about chart calculations and updates
                  </p>
                </div>
                <Switch
                  id="chart-updates"
                  checked={preferences.chartUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange('chartUpdates', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing & Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Marketing & Updates
          </CardTitle>
          <CardDescription>
            Stay informed about new features and offers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Updates */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="product-updates">Product Updates</Label>
              <p className="text-sm text-muted-foreground">
                New features, improvements, and announcements
              </p>
            </div>
            <Switch
              id="product-updates"
              checked={preferences.productUpdates}
              onCheckedChange={(checked) => handlePreferenceChange('productUpdates', checked)}
            />
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Special offers, tips, and promotional content
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Send a test notification to verify your settings
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Button onClick={testNotification} variant="outline" className="w-full">
            Send Test Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
