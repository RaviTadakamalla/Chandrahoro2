/**
 * ChandraHoro V2.1 - Compatibility Form Component
 * 
 * React form component for collecting birth details of two people
 * for compatibility analysis. Includes validation, place autocomplete,
 * and user-friendly interface.
 * 
 * Features:
 * - Dual person input forms
 * - Birth date/time validation
 * - Place autocomplete with coordinates
 * - Real-time form validation
 * - Loading states and error handling
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PersonData {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface CompatibilityFormData {
  person1: PersonData;
  person2: PersonData;
}

export function CompatibilityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState<CompatibilityFormData>({
    person1: {
      name: '',
      birth_date: '',
      birth_time: '',
      birth_place: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
    },
    person2: {
      name: '',
      birth_date: '',
      birth_time: '',
      birth_place: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
    },
  });
  
  const updatePerson = (person: 'person1' | 'person2', field: keyof PersonData, value: any) => {
    setForm(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value,
      },
    }));
  };
  
  const validateForm = (): boolean => {
    const { person1, person2 } = form;
    
    // Check required fields for both persons
    const requiredFields: (keyof PersonData)[] = ['name', 'birth_date', 'birth_time', 'birth_place'];
    
    for (const person of [person1, person2]) {
      for (const field of requiredFields) {
        if (!person[field]) {
          setError(`Please fill in all required fields for both persons`);
          return false;
        }
      }
      
      // Validate coordinates
      if (person.latitude === 0 && person.longitude === 0) {
        setError(`Please select a valid birth place with coordinates`);
        return false;
      }
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(person1.birth_date) || !dateRegex.test(person2.birth_date)) {
      setError('Please enter valid birth dates in YYYY-MM-DD format');
      return false;
    }
    
    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(person1.birth_time) || !timeRegex.test(person2.birth_time)) {
      setError('Please enter valid birth times in HH:MM format');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[CompatibilityForm] Submitting compatibility request');
      
      const response = await fetch('/api/compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate compatibility report');
      }
      
      console.log('[CompatibilityForm] Report generated:', data.data.id);
      
      toast.success('Compatibility report generated successfully!');
      router.push(`/compatibility/${data.data.id}`);
    } catch (error: any) {
      console.error('[CompatibilityForm] Error:', error);
      setError(error.message);
      toast.error('Failed to generate compatibility report');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlaceSelect = (person: 'person1' | 'person2', place: any) => {
    updatePerson(person, 'birth_place', place.description);
    updatePerson(person, 'latitude', place.latitude);
    updatePerson(person, 'longitude', place.longitude);
    // You could also update timezone based on coordinates
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <Users className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Relationship Compatibility Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Discover your astrological compatibility using traditional Vedic astrology principles
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Person 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-semibold">1</span>
                </div>
                First Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="person1-name">Name *</Label>
                <Input
                  id="person1-name"
                  placeholder="Enter name"
                  value={form.person1.name}
                  onChange={(e) => updatePerson('person1', 'name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person1-date">Birth Date *</Label>
                <Input
                  id="person1-date"
                  type="date"
                  value={form.person1.birth_date}
                  onChange={(e) => updatePerson('person1', 'birth_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person1-time">Birth Time *</Label>
                <Input
                  id="person1-time"
                  type="time"
                  value={form.person1.birth_time}
                  onChange={(e) => updatePerson('person1', 'birth_time', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person1-place">Birth Place *</Label>
                <Input
                  id="person1-place"
                  placeholder="Enter birth city"
                  value={form.person1.birth_place}
                  onChange={(e) => updatePerson('person1', 'birth_place', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: In a full implementation, this would include place autocomplete
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="person1-lat">Latitude</Label>
                  <Input
                    id="person1-lat"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={form.person1.latitude || ''}
                    onChange={(e) => updatePerson('person1', 'latitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="person1-lng">Longitude</Label>
                  <Input
                    id="person1-lng"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={form.person1.longitude || ''}
                    onChange={(e) => updatePerson('person1', 'longitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Person 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 dark:text-pink-300 font-semibold">2</span>
                </div>
                Second Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="person2-name">Name *</Label>
                <Input
                  id="person2-name"
                  placeholder="Enter name"
                  value={form.person2.name}
                  onChange={(e) => updatePerson('person2', 'name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person2-date">Birth Date *</Label>
                <Input
                  id="person2-date"
                  type="date"
                  value={form.person2.birth_date}
                  onChange={(e) => updatePerson('person2', 'birth_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person2-time">Birth Time *</Label>
                <Input
                  id="person2-time"
                  type="time"
                  value={form.person2.birth_time}
                  onChange={(e) => updatePerson('person2', 'birth_time', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="person2-place">Birth Place *</Label>
                <Input
                  id="person2-place"
                  placeholder="Enter birth city"
                  value={form.person2.birth_place}
                  onChange={(e) => updatePerson('person2', 'birth_place', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: In a full implementation, this would include place autocomplete
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="person2-lat">Latitude</Label>
                  <Input
                    id="person2-lat"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={form.person2.latitude || ''}
                    onChange={(e) => updatePerson('person2', 'latitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="person2-lng">Longitude</Label>
                  <Input
                    id="person2-lng"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={form.person2.longitude || ''}
                    onChange={(e) => updatePerson('person2', 'longitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg"
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Compatibility...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Generate Compatibility Report
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          This analysis uses traditional Vedic astrology principles including Ashtakuta matching.
          Results are for guidance and entertainment purposes.
        </p>
      </div>
    </div>
  );
}
