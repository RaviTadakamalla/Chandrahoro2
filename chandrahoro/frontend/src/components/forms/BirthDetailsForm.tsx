import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import LocationSearch from './LocationSearch';
import PreferencesPanel from './PreferencesPanel';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorAlert } from '@/components/ui/error-alert';
import { BirthDetails, ChartPreferences } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getRecentUsers, saveRecentUser, removeRecentUser, RecentUser } from '@/lib/recentUsers';

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  state?: string;
}

interface BirthDetailsFormProps {
  onSubmit: (birthDetails: BirthDetails, preferences: ChartPreferences) => void;
  isLoading?: boolean;
  error?: string;
  initialData?: Partial<BirthDetails>;
}

export default function BirthDetailsForm({
  onSubmit,
  isLoading = false,
  error,
  initialData
}: BirthDetailsFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState<BirthDetails>({
    name: initialData?.name || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    time_unknown: initialData?.time_unknown ?? false,
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    timezone: initialData?.timezone || 'UTC',
    location_name: initialData?.location_name || ''
  });

  const [preferences, setPreferences] = useState<ChartPreferences>({
    ayanamsha: 'Lahiri',
    house_system: 'Whole Sign',
    chart_style: 'North Indian',
    divisional_charts: ['D1', 'D9', 'D10'],
    enable_ai: false,
    methodology: 'parashara' // Default to Parashara methodology
  });

  // Load recent users from localStorage
  useEffect(() => {
    if (!initialData) {
      const users = getRecentUsers();
      setRecentUsers(users);

      // Auto-populate with the most recent user if available
      if (users.length > 0) {
        const mostRecent = users[0];
        setFormData({
          name: mostRecent.name || '',
          date: mostRecent.date || '',
          time: mostRecent.time || '',
          time_unknown: mostRecent.time_unknown,
          latitude: mostRecent.latitude || 0,
          longitude: mostRecent.longitude || 0,
          timezone: mostRecent.timezone || 'UTC',
          location_name: mostRecent.location_name || ''
        });
      }
    }
  }, [initialData]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.date) {
      errors.date = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.date);
      const today = new Date();
      if (birthDate > today) {
        errors.date = 'Birth date cannot be in the future';
      }
      if (birthDate.getFullYear() < 1900) {
        errors.date = 'Birth date must be after 1900';
      }
    }

    if (!formData.time_unknown && !formData.time) {
      errors.time = 'Birth time is required (or check "Time Unknown")';
    }

    if (!formData.location_name) {
      errors.location = 'Birth location is required';
    } else if (formData.latitude === 0 && formData.longitude === 0) {
      errors.location = 'Please select a valid location from the search results';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof BirthDetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleLocationSelect = useCallback((location: LocationResult) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
      location_name: location.name
    }));

    // Clear location validation error
    if (validationErrors.location) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Save to recent users if "Remember Me" is checked
      if (rememberMe && formData.name) {
        saveRecentUser({
          name: formData.name,
          date: formData.date,
          time: formData.time,
          time_unknown: formData.time_unknown,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone,
          location_name: formData.location_name
        });
        // Update the local state
        setRecentUsers(getRecentUsers());
      }

      onSubmit(formData, preferences);
    }
  }, [formData, preferences, validateForm, onSubmit, rememberMe]);

  const handleTimeUnknownChange = useCallback((checked: boolean) => {
    handleInputChange('time_unknown', checked);
    if (checked) {
      handleInputChange('time', '12:00'); // Default to noon for unknown time
    }
  }, [handleInputChange]);

  const fillTestData = useCallback(() => {
    setFormData({
      name: 'Test User',
      date: '1980-01-01',
      time: '12:00',
      time_unknown: false,
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 'Asia/Kolkata',
      location_name: 'Bangalore, Karnataka, India'
    });
    setValidationErrors({});
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Birth Details
        </CardTitle>
        <CardDescription>
          Enter your birth information to generate your Vedic astrology chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <ErrorAlert
            message={error}
            type="error"
            className="mb-6"
          />
        )}

        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Users Section */}
        {recentUsers.length > 0 && (
          <div className="mb-6 p-4 bg-saffron-50 border border-saffron-200 rounded-lg dark:bg-saffron-900/20 dark:border-saffron-800">
            <h4 className="text-sm font-medium text-saffron-800 dark:text-saffron-400 mb-3">
              Recent Users
            </h4>
            <div className="space-y-2">
              {recentUsers.slice(0, 4).map((recentUser) => (
                <div
                  key={recentUser.id}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: recentUser.name || '',
                        date: recentUser.date || '',
                        time: recentUser.time || '',
                        time_unknown: recentUser.time_unknown,
                        latitude: recentUser.latitude || 0,
                        longitude: recentUser.longitude || 0,
                        timezone: recentUser.timezone || 'UTC',
                        location_name: recentUser.location_name || ''
                      });
                    }}
                    className="flex-1 text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {recentUser.name || 'Unnamed'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {recentUser.date} • {recentUser.location_name}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeRecentUser(recentUser.id);
                      setRecentUsers(getRecentUsers());
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remove from recent users"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="basic" className="flex-1 text-xs font-medium">Basic Info</TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1 text-xs font-medium">Preferences</TabsTrigger>
            </TabsList>

            {/* Fixed height container for all tab content to prevent page jumping */}
            <div className="h-80 overflow-y-auto">
              <TabsContent value="basic" className="space-y-3 mt-3 pr-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Birth Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={validationErrors.date ? 'border-red-500' : ''}
                  />
                  {validationErrors.date && (
                    <p className="text-sm text-red-500">{validationErrors.date}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="time" className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Birth Time
                  </Label>
                  <div className="space-y-1.5">
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      disabled={formData.time_unknown}
                      className={validationErrors.time ? 'border-red-500' : ''}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="time-unknown"
                        checked={formData.time_unknown}
                        onCheckedChange={handleTimeUnknownChange}
                      />
                      <Label htmlFor="time-unknown" className="text-sm">
                        Time unknown (will use 12:00 PM)
                      </Label>
                    </div>
                  </div>
                  {validationErrors.time && (
                    <p className="text-sm text-red-500">{validationErrors.time}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    Birth Location
                  </Label>
                  <LocationSearch
                    value={formData.location_name}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for city, state, country..."
                    className={validationErrors.location ? 'border-red-500' : ''}
                  />
                  {validationErrors.location && (
                    <p className="text-sm text-red-500">{validationErrors.location}</p>
                  )}
                  {formData.location_name && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <p><strong>Selected:</strong> {formData.location_name}</p>
                      <p><strong>Coordinates:</strong> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                      <p><strong>Timezone:</strong> {formData.timezone}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-3 mt-3 pr-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4" />
                    Chart Preferences
                  </Label>
                  <PreferencesPanel
                    preferences={preferences}
                    onPreferencesChange={setPreferences}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Remember this user for quick access
              </Label>
            </div>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={fillTestData}
                className="text-sm"
              >
                Fill Test Data
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate Chart'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}