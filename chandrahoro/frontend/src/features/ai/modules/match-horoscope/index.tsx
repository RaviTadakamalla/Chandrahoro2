/**
 * Match Horoscope AI Module - Traditional Vedic Astrology Matchmaking
 */

import React, { useState } from 'react';
import { Users, RefreshCw, User, Calendar, Clock, MapPin, Loader2, Download, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/constants';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';
import LocationSearch from '@/components/forms/LocationSearch';
import type { LocationResult } from '@/lib/api';

export const meta: AiModuleMeta = {
  id: 'match-horoscope',
  title: 'Match Horoscope',
  description: 'Traditional Vedic astrology matchmaking with Ashtakoot analysis and detailed scoring.',
  category: 'Matchmaking',
  requiresChart: true,
  requiresAuth: true,
  featureFlag: 'match-horoscope',
  icon: Users,
  priority: 4,
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

interface BirthDetails {
  name: string;
  sex: string;
  date_of_birth: string;
  time_of_birth: string;
  day_of_birth: string;
  place_of_birth: string;
  latitude: string;
  longitude: string;
  time_zone: string;
  lagna: string;
  rashi: string;
  nakshatra_pada: string;
  nakshatra_lord: string;
}

interface GunaDetail {
  guna: string;
  boy_value: string;
  girl_value: string;
  max_points: number;
  points_obtained: number;
  area_of_life: string;
}

interface AshtakootAnalysis {
  total_points: number;
  max_points: number;
  percentage: number;
  guna_details: GunaDetail[];
}

interface ManglikAnalysis {
  male_status: string;
  female_status: string;
  compatibility_note: string;
}

interface DetailedInterpretations {
  varna: string;
  vasya: string;
  tara: string;
  yoni: string;
  maitri: string;
  gana: string;
  bhakoot: string;
  nadi: string;
}

interface MatchHoroscopeResponse {
  success: boolean;
  report_title?: string;
  birth_details?: {
    male: BirthDetails;
    female: BirthDetails;
  };
  ashtakoot_analysis?: AshtakootAnalysis;
  manglik_analysis?: ManglikAnalysis;
  conclusion?: string;
  detailed_interpretations?: DetailedInterpretations;
  model?: string;
  tokens?: { input: number; output: number };
  timestamp?: string;
  error?: string;
}

export default function MatchHoroscopeModule({ chartData, user, onClose }: AiModuleProps) {
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails>({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    latitude: 0,
    longitude: 0,
    timezone: ''
  });

  const [analysis, setAnalysis] = useState<MatchHoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(true);

  // Helper function to populate test data
  const fillTestData = () => {
    setPartnerDetails({
      name: 'Test Partner',
      birth_date: '1985-06-15',
      birth_time: '14:30',
      birth_location: 'Mumbai, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    });
  };

  const handleInputChange = (field: keyof PartnerDetails, value: string) => {
    setPartnerDetails(prev => ({
      ...prev,
      [field]: field === 'latitude' || field === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };

  const handleLocationSelect = (location: LocationResult) => {
    console.log('Location selected:', location);
    setPartnerDetails(prev => {
      const updated = {
        ...prev,
        birth_location: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone
      };
      console.log('Updated partner details:', updated);
      return updated;
    });
  };

  const generateMatchAnalysis = async () => {
    if (!chartData || !user) return;

    console.log('Generating match analysis with partner details:', partnerDetails);

    // Basic validation - check for missing or invalid values
    if (!partnerDetails.name || !partnerDetails.birth_date || !partnerDetails.birth_time ||
        !partnerDetails.birth_location || !partnerDetails.timezone) {
      const missingFields = [];
      if (!partnerDetails.name) missingFields.push('name');
      if (!partnerDetails.birth_date) missingFields.push('birth_date');
      if (!partnerDetails.birth_time) missingFields.push('birth_time');
      if (!partnerDetails.birth_location) missingFields.push('birth_location');
      if (!partnerDetails.timezone) missingFields.push('timezone');

      console.error('Validation failed. Missing fields:', missingFields);
      console.error('Current partner details:', partnerDetails);
      setError(`Please fill in all partner details. Missing: ${missingFields.join(', ')}`);
      return;
    }

    // Check if coordinates are valid (not 0,0 which indicates location wasn't selected from search)
    if (partnerDetails.latitude === 0 && partnerDetails.longitude === 0) {
      console.error('Invalid coordinates: 0, 0');
      setError('Please select a valid location from the search results to auto-populate coordinates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending match analysis request to:', `${API_URL}/api/v1/ai/match-horoscope`);
      console.log('Request payload:', {
        primary_chart_data: chartData,
        partner_details: partnerDetails
      });

      const response = await fetch(`${API_URL}/api/v1/ai/match-horoscope`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          primary_chart_data: chartData,
          partner_details: partnerDetails
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            setError(errorData.detail);
          } else if (Array.isArray(errorData.detail)) {
            setError(errorData.detail.map((e: any) => e.msg).join(', '));
          } else {
            setError('Failed to generate match analysis');
          }
        } else {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const result: MatchHoroscopeResponse = await response.json();
      console.log('Match analysis result:', result);

      if (result.success) {
        setAnalysis(result);
        setShowForm(false);
      } else {
        setError(result.error || 'Failed to generate match analysis');
      }
    } catch (err) {
      console.error('Match analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(true);
    setAnalysis(null);
    setError('');
  };

  const exportToPDF = async () => {
    if (!analysis) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/ai/match-horoscope/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          analysis_data: analysis,
          partner_name: partnerDetails.name,
          user_name: user?.name || 'User'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `match-horoscope-${partnerDetails.name.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export PDF');
      }
    } catch (err) {
      setError('Failed to export PDF');
    }
  };

  const getCompatibilityColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityLabel = (percentage: number) => {
    if (percentage >= 70) return 'Excellent Match';
    if (percentage >= 60) return 'Very Good Match';
    if (percentage >= 50) return 'Good Match';
    if (percentage >= 40) return 'Average Match';
    return 'Needs Consideration';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">Match Horoscope</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Traditional Vedic astrology matchmaking with Ashtakoot analysis
          </p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Partner Details
                </CardTitle>
                <CardDescription>
                  Enter your partner's birth information for traditional Vedic matchmaking analysis
                </CardDescription>
              </div>
              <Button
                onClick={fillTestData}
                variant="outline"
                size="sm"
              >
                Fill Test Data
              </Button>
            </div>
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
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Birth Location
                </Label>
                <LocationSearch
                  value={partnerDetails.birth_location}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for city, state, country..."
                />
                {partnerDetails.birth_location && partnerDetails.latitude !== 0 && partnerDetails.longitude !== 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p><strong>Selected:</strong> {partnerDetails.birth_location}</p>
                    <p><strong>Coordinates:</strong> {partnerDetails.latitude.toFixed(4)}, {partnerDetails.longitude.toFixed(4)}</p>
                    <p><strong>Timezone:</strong> {partnerDetails.timezone}</p>
                  </div>
                )}
                {partnerDetails.birth_location && (partnerDetails.latitude === 0 || partnerDetails.longitude === 0) && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <p>⚠️ Please select a location from the search results to auto-populate coordinates</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-date">Birth Date</Label>
                <Input
                  id="partner-date"
                  type="date"
                  value={partnerDetails.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  autoComplete="bday"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-time">Birth Time</Label>
                <Input
                  id="partner-time"
                  type="time"
                  value={partnerDetails.birth_time}
                  onChange={(e) => handleInputChange('birth_time', e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <Button
              onClick={generateMatchAnalysis}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Generate Match Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : analysis && (
        <div className="space-y-6">
          {/* Report Title */}
          {analysis.report_title && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {analysis.report_title}
              </h2>
            </div>
          )}

          {/* Birth Details Table */}
          {analysis.birth_details && (
            <Card>
              <CardHeader>
                <CardTitle>Birth Details</CardTitle>
                <CardDescription>
                  Comprehensive birth information for both partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Detail</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                          {analysis.birth_details.male?.name || 'Male'}
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">
                          {analysis.birth_details.female?.name || 'Female'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">SEX</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.sex}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.sex}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">DATE OF BIRTH</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.date_of_birth}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.date_of_birth}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">TIME OF BIRTH</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.time_of_birth}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.time_of_birth}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">DAY OF BIRTH</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.day_of_birth}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.day_of_birth}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">PLACE OF BIRTH</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.place_of_birth}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.place_of_birth}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">LATITUDE</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.latitude}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.latitude}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">LONGITUDE</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.longitude}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.longitude}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">LAGNA</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.lagna}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.lagna}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">RASHI</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.rashi}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.rashi}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-medium">NAKSHATRA-PADA</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.male?.nakshatra_pada}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.birth_details.female?.nakshatra_pada}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ashtakoota Points Table */}
          {analysis.ashtakoot_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Ashtakoota Points Table
                </CardTitle>
                <CardDescription>
                  Traditional 8-fold Vedic astrology compatibility analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Guna</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Boy</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Girl</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Max Points</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Points Obtained</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Area of Life</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.ashtakoot_analysis.guna_details.map((guna, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                          <td className="border border-gray-300 px-3 py-2 font-medium">{guna.guna}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{guna.boy_value}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{guna.girl_value}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{guna.max_points}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <Badge variant={guna.points_obtained === guna.max_points ? "default" : guna.points_obtained >= guna.max_points / 2 ? "secondary" : "destructive"}>
                              {guna.points_obtained}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{guna.area_of_life}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                        <td className="border border-gray-300 px-3 py-2" colSpan={3}>TOTAL</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{analysis.ashtakoot_analysis.max_points}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <Badge variant="default" className="text-lg">
                            {analysis.ashtakoot_analysis.total_points}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <Badge variant={analysis.ashtakoot_analysis.percentage >= 50 ? "default" : "destructive"}>
                            {analysis.ashtakoot_analysis.percentage.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mangal Dosha Analysis */}
          {analysis.manglik_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Mangal Dosha Analysis</CardTitle>
                <CardDescription>
                  Mars placement and its effects on marriage compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Male ({analysis.birth_details?.male?.name || 'Male'})</Label>
                    <Badge variant={analysis.manglik_analysis.male_status.includes('High') ? "destructive" : analysis.manglik_analysis.male_status.includes('Low') ? "secondary" : "default"}>
                      {analysis.manglik_analysis.male_status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Female ({analysis.birth_details?.female?.name || 'Female'})</Label>
                    <Badge variant={analysis.manglik_analysis.female_status.includes('High') ? "destructive" : analysis.manglik_analysis.female_status.includes('Low') ? "secondary" : "default"}>
                      {analysis.manglik_analysis.female_status}
                    </Badge>
                  </div>
                </div>

                {analysis.manglik_analysis.compatibility_note && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Compatibility Note:</strong> {analysis.manglik_analysis.compatibility_note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conclusion */}
          {analysis.conclusion && (
            <Card>
              <CardHeader>
                <CardTitle>Conclusion</CardTitle>
                <CardDescription>
                  Overall compatibility assessment and recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {analysis.conclusion}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Interpretations for Each Guna */}
          {analysis.detailed_interpretations && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Guna Interpretations</CardTitle>
                <CardDescription>
                  In-depth analysis of each of the 8 compatibility factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(analysis.detailed_interpretations).map(([guna, interpretation]) => (
                  <div key={guna} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2 uppercase text-blue-700 dark:text-blue-300">
                      {guna}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {interpretation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
