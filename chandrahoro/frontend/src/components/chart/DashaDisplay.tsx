import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashaData {
  mahadasha?: {
    planet: string;
    start_date: string;
    end_date: string;
    duration_years: number;
    is_birth_dasha?: boolean;
  };
  antardasha?: {
    planet: string;
    start_date: string;
    end_date: string;
    duration_years: number;
    mahadasha_planet: string;
  };
  pratyantardasha?: {
    planet: string;
    start_date: string;
    end_date: string;
    duration_years: number;
    antardasha_planet: string;
    mahadasha_planet: string;
  };
  calculation_date?: string;
}

interface DashaDisplayProps {
  currentDasha: DashaData;
}

export default function DashaDisplay({ currentDasha }: DashaDisplayProps) {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (years: number): string => {
    const totalMonths = Math.round(years * 12);
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    
    if (yearsPart === 0) {
      return `${monthsPart}m`;
    } else if (monthsPart === 0) {
      return `${yearsPart}y`;
    } else {
      return `${yearsPart}y ${monthsPart}m`;
    }
  };

  const getRemainingTime = (endDate: string): string => {
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'Completed';
      } else if (diffDays < 30) {
        return `${diffDays} days left`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} months left`;
      } else {
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return years > 0 ? `${years}y ${months}m left` : `${months}m left`;
      }
    } catch {
      return 'Unknown';
    }
  };

  const getPlanetColor = (planet: string): string => {
    const colors: { [key: string]: string } = {
      'Sun': 'bg-orange-100 text-orange-800',
      'Moon': 'bg-blue-100 text-blue-800',
      'Mercury': 'bg-green-100 text-green-800',
      'Venus': 'bg-pink-100 text-pink-800',
      'Mars': 'bg-red-100 text-red-800',
      'Jupiter': 'bg-yellow-100 text-yellow-800',
      'Saturn': 'bg-gray-100 text-gray-800',
      'Rahu': 'bg-purple-100 text-purple-800',
      'Ketu': 'bg-indigo-100 text-indigo-800'
    };
    return colors[planet] || 'bg-gray-100 text-gray-800';
  };

  const getPlanetSignificance = (planet: string): string => {
    const significance: { [key: string]: string } = {
      'Sun': 'Authority, government, father, health, leadership',
      'Moon': 'Mind, emotions, mother, public, travel',
      'Mercury': 'Intelligence, communication, business, education',
      'Venus': 'Love, marriage, arts, luxury, vehicles',
      'Mars': 'Energy, courage, property, siblings',
      'Jupiter': 'Wisdom, spirituality, children, wealth',
      'Saturn': 'Discipline, delays, hard work, service',
      'Rahu': 'Materialism, foreign connections, technology',
      'Ketu': 'Spirituality, detachment, research, occult'
    };
    return significance[planet] || 'General planetary influence';
  };

  if (!currentDasha.mahadasha) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Dasha Periods</CardTitle>
          <CardDescription>Planetary time periods affecting your life</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Dasha information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Dasha Periods</CardTitle>
        <CardDescription>
          Planetary time periods affecting your life as of {currentDasha.calculation_date ? formatDate(currentDasha.calculation_date) : 'now'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mahadasha */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mahadasha (Main Period)</h3>
            <Badge className={getPlanetColor(currentDasha.mahadasha.planet)}>
              {currentDasha.mahadasha.planet}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Period</label>
              <p className="font-medium">
                {formatDate(currentDasha.mahadasha.start_date)} - {formatDate(currentDasha.mahadasha.end_date)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <p className="font-medium">{formatDuration(currentDasha.mahadasha.duration_years)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Remaining</label>
              <p className="font-medium">{getRemainingTime(currentDasha.mahadasha.end_date)}</p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Significance:</strong> {getPlanetSignificance(currentDasha.mahadasha.planet)}
            </p>
          </div>
        </div>

        {/* Antardasha */}
        {currentDasha.antardasha && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Antardasha (Sub-period)</h3>
              <Badge className={getPlanetColor(currentDasha.antardasha.planet)}>
                {currentDasha.antardasha.planet}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Period</label>
                <p className="font-medium">
                  {formatDate(currentDasha.antardasha.start_date)} - {formatDate(currentDasha.antardasha.end_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="font-medium">{formatDuration(currentDasha.antardasha.duration_years)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Remaining</label>
                <p className="font-medium">{getRemainingTime(currentDasha.antardasha.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pratyantardasha */}
        {currentDasha.pratyantardasha && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pratyantardasha (Sub-sub-period)</h3>
              <Badge className={getPlanetColor(currentDasha.pratyantardasha.planet)}>
                {currentDasha.pratyantardasha.planet}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Period</label>
                <p className="font-medium">
                  {formatDate(currentDasha.pratyantardasha.start_date)} - {formatDate(currentDasha.pratyantardasha.end_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="font-medium">{formatDuration(currentDasha.pratyantardasha.duration_years)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Remaining</label>
                <p className="font-medium">{getRemainingTime(currentDasha.pratyantardasha.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Combination */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <h4 className="font-semibold mb-2">Current Planetary Combination</h4>
          <p className="text-sm text-muted-foreground">
            You are currently under the influence of{' '}
            <span className="font-medium text-foreground">{currentDasha.mahadasha.planet}</span> Mahadasha
            {currentDasha.antardasha && (
              <>
                {' '}→ <span className="font-medium text-foreground">{currentDasha.antardasha.planet}</span> Antardasha
              </>
            )}
            {currentDasha.pratyantardasha && (
              <>
                {' '}→ <span className="font-medium text-foreground">{currentDasha.pratyantardasha.planet}</span> Pratyantardasha
              </>
            )}
            . This combination influences your current life experiences and opportunities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
