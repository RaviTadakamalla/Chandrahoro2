import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GeneralCharacteristicsProps {
  chartData: any;
}

export default function GeneralCharacteristics({ chartData }: GeneralCharacteristicsProps) {
  if (!chartData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No chart data available</p>
        </CardContent>
      </Card>
    );
  }

  // Extract birth info
  const birthInfo = chartData.birth_info || {};
  const planets = chartData.planets || [];
  const currentDasha = chartData.current_dasha || {};
  const ayanamshaValue = chartData.ayanamsha_value || 0;

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('GeneralCharacteristics - chartData:', chartData);
    console.log('GeneralCharacteristics - birthInfo:', birthInfo);
    console.log('GeneralCharacteristics - location_name:', birthInfo.location_name);
  }

  // Find Moon and Sun positions
  const moonPosition = planets.find((p: any) => p.name === 'Moon');
  const sunPosition = planets.find((p: any) => p.name === 'Sun');
  const ascendantSign = chartData.ascendant_sign || 'Unknown';
  const ascendantDegree = chartData.ascendant || 0;

  // Get location name with multiple fallback options
  const getLocationName = () => {
    // Try different property names
    if (birthInfo.location_name) return birthInfo.location_name;
    if (birthInfo.location) return birthInfo.location;
    if (birthInfo.city) return birthInfo.city;

    // Try to construct from available data
    const parts = [];
    if (birthInfo.city) parts.push(birthInfo.city);
    if (birthInfo.state) parts.push(birthInfo.state);
    if (birthInfo.country) parts.push(birthInfo.country);
    if (parts.length > 0) return parts.join(', ');

    return 'Unknown';
  };

  // Format date and time
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Format time
  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Unknown';
    try {
      const [hours, minutes, seconds] = timeStr.split(':');
      return `${hours}:${minutes}${seconds ? ':' + seconds : ''}`;
    } catch {
      return timeStr;
    }
  };

  // Format dasha period
  const formatDashaPeriod = (period: any) => {
    if (!period) return 'N/A';
    return `${period.planet || 'Unknown'} (${period.duration_years?.toFixed(1) || 'N/A'} years)`;
  };

  return (
    <div className="space-y-6">
      {/* Basic Birth Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Birth Information</CardTitle>
          <CardDescription>Your birth details and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{birthInfo.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <p className="text-lg font-semibold">{formatDate(birthInfo.date || birthInfo.birth_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Time of Birth</label>
              <p className="text-lg font-semibold">{formatTime(birthInfo.time || birthInfo.birth_time)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-lg font-semibold">{getLocationName()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Latitude</label>
              <p className="text-lg font-semibold">{birthInfo.latitude?.toFixed(4) || 'N/A'}°</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Longitude</label>
              <p className="text-lg font-semibold">{birthInfo.longitude?.toFixed(4) || 'N/A'}°</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ascendant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ascendant (Lagna)</CardTitle>
          <CardDescription>Your rising sign and degree</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sign</label>
              <p className="text-2xl font-bold text-saffron-600">{ascendantSign}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Degree</label>
              <p className="text-2xl font-bold">{ascendantDegree.toFixed(2)}°</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ayanamsha</label>
              <p className="text-2xl font-bold">{ayanamshaValue.toFixed(2)}°</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moon Sign Information */}
      {moonPosition && (
        <Card>
          <CardHeader>
            <CardTitle>Moon Sign (Rashi)</CardTitle>
            <CardDescription>Your emotional nature and mind</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sign</label>
                <p className="text-2xl font-bold text-saffron-600">{moonPosition.sign}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Degree</label>
                <p className="text-lg font-semibold">{moonPosition.degree_in_sign?.toFixed(2) || 'N/A'}°</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nakshatra</label>
                <p className="text-lg font-semibold">{moonPosition.nakshatra || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pada</label>
                <p className="text-lg font-semibold">{moonPosition.pada || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sun Sign Information */}
      {sunPosition && (
        <Card>
          <CardHeader>
            <CardTitle>Sun Sign</CardTitle>
            <CardDescription>Your core identity and life purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sign</label>
                <p className="text-2xl font-bold text-saffron-600">{sunPosition.sign}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Degree</label>
                <p className="text-lg font-semibold">{sunPosition.degree_in_sign?.toFixed(2) || 'N/A'}°</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nakshatra</label>
                <p className="text-lg font-semibold">{sunPosition.nakshatra || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pada</label>
                <p className="text-lg font-semibold">{sunPosition.pada || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Birth Nakshatra Details */}
      {moonPosition && (
        <Card>
          <CardHeader>
            <CardTitle>Birth Nakshatra (Birth Star)</CardTitle>
            <CardDescription>Your birth constellation and its characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nakshatra Name</label>
                <p className="text-lg font-semibold">{moonPosition.nakshatra || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pada</label>
                <p className="text-lg font-semibold">{moonPosition.pada || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ruling Planet</label>
                <p className="text-lg font-semibold">See Dasha section</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Dasha */}
      <Card>
        <CardHeader>
          <CardTitle>Current Dasha Periods</CardTitle>
          <CardDescription>Your current planetary periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mahadasha</label>
              <p className="text-lg font-semibold">{formatDashaPeriod(currentDasha.mahadasha)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Antardasha</label>
              <p className="text-lg font-semibold">{formatDashaPeriod(currentDasha.antardasha)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Pratyantardasha</label>
              <p className="text-lg font-semibold">{formatDashaPeriod(currentDasha.pratyantardasha)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Details</CardTitle>
          <CardDescription>Technical information about your chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ayanamsha System</label>
              <p className="text-lg font-semibold">{chartData.preferences?.ayanamsha || 'Lahiri'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">House System</label>
              <p className="text-lg font-semibold">{chartData.preferences?.house_system || 'Whole Sign'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ayanamsha Value</label>
              <p className="text-lg font-semibold">{ayanamshaValue.toFixed(2)}°</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Calculation Time</label>
              <p className="text-lg font-semibold">{formatDate(chartData.calculation_timestamp)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

