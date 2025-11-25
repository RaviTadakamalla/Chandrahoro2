/**
 * Place Autocomplete Component
 * 
 * Google Places API integration for birth place selection.
 * Returns place name, coordinates, and timezone information.
 */

'use client';

import { useState, useCallback } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { MapPin, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const libraries: ('places')[] = ['places'];

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
}

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onError?: (error: string) => void;
}

export default function PlaceAutocomplete({ 
  onPlaceSelect,
  defaultValue = '',
  placeholder = 'Search for your birth city...',
  className,
  onError,
}: PlaceAutocompleteProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [isLoadingTimezone, setIsLoadingTimezone] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  /**
   * Initialize autocomplete instance
   */
  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  /**
   * Handle place selection
   */
  const onPlaceChanged = useCallback(async () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry?.location) {
      onError?.('Please select a valid location from the dropdown');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const placeName = place.formatted_address || place.name || '';

    setValue(placeName);
    setIsLoadingTimezone(true);

    try {
      // Get timezone information
      const timezone = await getTimezoneFromCoords(lat, lng);
      
      onPlaceSelect({
        name: placeName,
        lat,
        lng,
        timezone,
      });
    } catch (error) {
      console.error('Failed to get timezone:', error);
      onError?.('Failed to get timezone information. Please try again.');
    } finally {
      setIsLoadingTimezone(false);
    }
  }, [autocomplete, onPlaceSelect, onError]);

  /**
   * Handle manual input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  /**
   * Clear selection
   */
  const handleClear = () => {
    setValue('');
  };

  // Handle loading error
  if (loadError) {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="Enter your birth city manually"
          className={className}
        />
        <p className="text-xs text-muted-foreground">
          Location services unavailable. Please enter your birth city manually.
        </p>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="relative">
        <Input
          placeholder="Loading location services..."
          disabled
          className={className}
        />
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(cities)'],
            fields: ['formatted_address', 'name', 'geometry'],
          }}
        >
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`pl-10 ${className}`}
            disabled={isLoadingTimezone}
          />
        </Autocomplete>
        
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        
        {isLoadingTimezone && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        
        {value && !isLoadingTimezone && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={handleClear}
          >
            ×
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Start typing to search for your birth city. Select from the dropdown for accurate coordinates.
      </p>
    </div>
  );
}

/**
 * Get timezone from coordinates using Google Timezone API
 */
async function getTimezoneFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found, using UTC timezone');
      return 'UTC';
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.timeZoneId) {
      return data.timeZoneId;
    } else {
      console.warn('Timezone API error:', data.status, data.errorMessage);
      return 'UTC';
    }
  } catch (error) {
    console.error('Failed to fetch timezone:', error);
    return 'UTC';
  }
}

/**
 * Fallback timezone estimation based on longitude
 * Used when Google Timezone API is unavailable
 */
function estimateTimezoneFromLongitude(lng: number): string {
  // Very rough estimation - not accurate for all locations
  const offset = Math.round(lng / 15);
  
  // Common timezone mappings for major regions
  const timezoneMap: { [key: number]: string } = {
    5: 'Asia/Kolkata',      // India
    8: 'Asia/Shanghai',     // China
    9: 'Asia/Tokyo',        // Japan
    0: 'Europe/London',     // UK
    1: 'Europe/Paris',      // Central Europe
    [-5]: 'America/New_York', // US East
    [-8]: 'America/Los_Angeles', // US West
  };

  return timezoneMap[offset] || 'UTC';
}
