/**
 * Step 1: Birth Details Component
 * 
 * Collects user's birth information including date, time, and place.
 * Includes form validation and place autocomplete functionality.
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useOnboardingStore, validateBirthDetails } from '@/store/onboarding';
import PlaceAutocomplete, { type PlaceResult } from './PlaceAutocomplete';
import { cn } from '@/lib/utils';

const birthDetailsSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  birthDate: z.date({ required_error: 'Birth date is required' }),
  birthTime: z.string().optional(),
  hasTimeUnknown: z.boolean(),
  birthPlace: z.string().min(1, 'Birth place is required'),
  latitude: z.number({ required_error: 'Location coordinates required' }),
  longitude: z.number({ required_error: 'Location coordinates required' }),
  timezone: z.string().min(1, 'Timezone is required'),
}).refine(
  (data) => data.hasTimeUnknown || (data.birthTime && data.birthTime.match(/^\d{2}:\d{2}$/)),
  {
    message: 'Valid time required (HH:MM format) unless marked unknown',
    path: ['birthTime'],
  }
);

type BirthDetailsFormData = z.infer<typeof birthDetailsSchema>;

interface Step1BirthDetailsProps {
  onNext: () => void;
  onError?: (error: string) => void;
}

export default function Step1BirthDetails({ onNext, onError }: Step1BirthDetailsProps) {
  const { birthDetails, updateBirthDetails } = useOnboardingStore();

  const form = useForm<BirthDetailsFormData>({
    resolver: zodResolver(birthDetailsSchema),
    defaultValues: {
      fullName: birthDetails.fullName,
      birthDate: birthDetails.birthDate || undefined,
      birthTime: birthDetails.birthTime,
      hasTimeUnknown: birthDetails.hasTimeUnknown,
      birthPlace: birthDetails.birthPlace,
      latitude: birthDetails.latitude || undefined,
      longitude: birthDetails.longitude || undefined,
      timezone: birthDetails.timezone,
    },
    mode: 'onChange',
  });

  const watchedTimeUnknown = form.watch('hasTimeUnknown');
  const watchedBirthDate = form.watch('birthDate');

  /**
   * Handle form submission
   */
  const onSubmit = (data: BirthDetailsFormData) => {
    // Clear any previous errors
    onError?.('');

    // Update store with form data
    updateBirthDetails({
      fullName: data.fullName,
      birthDate: data.birthDate,
      birthTime: data.hasTimeUnknown ? '' : data.birthTime || '',
      hasTimeUnknown: data.hasTimeUnknown,
      birthPlace: data.birthPlace,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    });

    // Validate before proceeding
    const errors = validateBirthDetails({
      fullName: data.fullName,
      birthDate: data.birthDate,
      birthTime: data.hasTimeUnknown ? '' : data.birthTime || '',
      hasTimeUnknown: data.hasTimeUnknown,
      birthPlace: data.birthPlace,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    });

    if (errors.length > 0) {
      onError?.(errors[0]);
      return;
    }

    onNext();
  };

  /**
   * Handle place selection from autocomplete
   */
  const handlePlaceSelect = (place: PlaceResult) => {
    form.setValue('birthPlace', place.name);
    form.setValue('latitude', place.lat);
    form.setValue('longitude', place.lng);
    form.setValue('timezone', place.timezone);
    
    // Clear any place-related errors
    form.clearErrors(['birthPlace', 'latitude', 'longitude', 'timezone']);
  };

  /**
   * Handle time unknown checkbox change
   */
  const handleTimeUnknownChange = (checked: boolean) => {
    form.setValue('hasTimeUnknown', checked);
    if (checked) {
      form.setValue('birthTime', '');
      form.clearErrors('birthTime');
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <User className="h-6 w-6 text-orange-500" />
          Birth Details
        </CardTitle>
        <CardDescription>
          We need your birth information to create an accurate Vedic astrology chart
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your full name"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your name as it appears on official documents
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            'Select your birth date'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    Your exact date of birth is crucial for accurate calculations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Time */}
            <FormField
              control={form.control}
              name="birthTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Birth</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          placeholder="HH:MM"
                          className="pl-10"
                          disabled={watchedTimeUnknown}
                          {...field}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="timeUnknown"
                          checked={watchedTimeUnknown}
                          onCheckedChange={handleTimeUnknownChange}
                        />
                        <label
                          htmlFor="timeUnknown"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I don't know my exact birth time
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {watchedTimeUnknown 
                      ? 'We\'ll use 12:00 PM as default. Some calculations may be less precise.'
                      : 'Exact birth time provides the most accurate chart. Check your birth certificate if unsure.'
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Place */}
            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth</FormLabel>
                  <FormControl>
                    <PlaceAutocomplete
                      onPlaceSelect={handlePlaceSelect}
                      defaultValue={field.value}
                      placeholder="Search for your birth city..."
                      onError={onError}
                    />
                  </FormControl>
                  <FormDescription>
                    Search and select your birth city for accurate coordinates and timezone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Info Display */}
            {form.watch('latitude') && form.watch('longitude') && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location Details:</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Coordinates:</span>
                    <br />
                    {form.watch('latitude')?.toFixed(4)}, {form.watch('longitude')?.toFixed(4)}
                  </div>
                  <div>
                    <span className="font-medium">Timezone:</span>
                    <br />
                    {form.watch('timezone')}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={!form.formState.isValid}
            >
              Continue to Preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
