/**
 * Compatibility Analysis AI Module
 */

import React, { useState } from 'react';
import { Heart, RefreshCw, User, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { API_URL } from '@/lib/constants';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

export const meta: AiModuleMeta = {
  id: 'compatibility-analysis',
  title: 'Relationship Compatibility',
  description: 'AI-powered compatibility analysis for relationships and partnerships.',
  category: 'Compatibility',
  requiresChart: true,
  requiresAuth: true,
  featureFlag: 'compatibility-analysis',
  icon: Heart,
  priority: 5,
};

interface PartnerDetails {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface CompatibilityResponse {
  success: boolean;
  content?: string;
  compatibility_score?: number;
  key_insights?: string[];
  error?: string;
}

export default function CompatibilityAnalysisModule({ chartData, user, onClose }: AiModuleProps) {
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails>({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    latitude: 0,
    longitude: 0,
    timezone: 'UTC'
  });

  const [analysisFocus, setAnalysisFocus] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(true);

  const focusOptions = [
    { id: 'emotional', label: 'Emotional Compatibility' },
    { id: 'intellectual', label: 'Intellectual Connection' },
    { id: 'physical', label: 'Physical Attraction' },
    { id: 'spiritual', label: 'Spiritual Alignment' },
    { id: 'career', label: 'Career & Goals' },
    { id: 'family', label: 'Family & Children' }
  ];

  const handleInputChange = (field: keyof PartnerDetails, value: string | number) => {
    setPartnerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFocusChange = (focusId: string, checked: boolean) => {
    setAnalysisFocus(prev =>
      checked
        ? [...prev, focusId]
        : prev.filter(id => id !== focusId)
    );
  };

  const generateCompatibilityAnalysis = async () => {
    if (!chartData || !user) return;

    // Basic validation
    if (!partnerDetails.name || !partnerDetails.birth_date || !partnerDetails.birth_time || !partnerDetails.birth_location) {
      setError('Please fill in all partner details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/v1/ai/compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          primary_chart_data: chartData,
          partner_details: partnerDetails,
          analysis_focus: analysisFocus.length > 0 ? analysisFocus : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (Array.isArray(errorData.detail)) {
            setError(errorData.detail.map((e: any) => e.msg).join(', '));
          } else {
            setError('Failed to generate compatibility analysis');
          }
        } else {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const result: CompatibilityResponse = await response.json();

      if (result.success && result.content) {
        setAnalysis(result.content);
        setShowForm(false);
      } else {
        setError(result.error || 'Failed to generate compatibility analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(true);
    setAnalysis('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">Relationship Compatibility</h2>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered compatibility analysis for relationships and partnerships
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={resetForm}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Partner Details
            </CardTitle>
            <CardDescription>
              Enter your partner's birth information for compatibility analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Partner's Name</Label>
                <Input
                  id="partner-name"
                  placeholder="Enter partner's name"
                  value={partnerDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-location">Birth Location</Label>
                <Input
                  id="partner-location"
                  placeholder="City, Country"
                  value={partnerDetails.birth_location}
                  onChange={(e) => handleInputChange('birth_location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-date">Birth Date</Label>
                <Input
                  id="partner-date"
                  type="date"
                  value={partnerDetails.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-time">Birth Time</Label>
                <Input
                  id="partner-time"
                  type="time"
                  value={partnerDetails.birth_time}
                  onChange={(e) => handleInputChange('birth_time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Analysis Focus (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {focusOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={analysisFocus.includes(option.id)}
                      onCheckedChange={(checked) => handleFocusChange(option.id, checked as boolean)}
                    />
                    <Label htmlFor={option.id} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generateCompatibilityAnalysis}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Compatibility...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Generate Compatibility Analysis
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  // Navigate to Match Horoscope module
                  window.location.href = '/chart/result?module=match-horoscope';
                }}
                variant="outline"
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Match Horoscope
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Analysis Results</CardTitle>
            <CardDescription>
              Analysis between your chart and {partnerDetails.name}'s chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
