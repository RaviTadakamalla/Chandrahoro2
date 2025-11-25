import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_balance?: boolean;
}

interface CurrentDasha {
  mahadasha: DashaPeriod;
  antardasha?: DashaPeriod;
  pratyantardasha?: DashaPeriod;
}

interface DashaData {
  birth_nakshatra_lord: string;
  balance_at_birth_years: number;
  current_dasha?: CurrentDasha;
  mahadashas: DashaPeriod[];
}

interface DashaTimelineProps {
  dashaData: DashaData;
}

const PLANET_COLORS: Record<string, string> = {
  Sun: 'bg-orange-500',
  Moon: 'bg-blue-400',
  Mars: 'bg-red-500',
  Mercury: 'bg-green-500',
  Jupiter: 'bg-yellow-500',
  Venus: 'bg-pink-500',
  Saturn: 'bg-indigo-600',
  Rahu: 'bg-gray-700',
  Ketu: 'bg-gray-500',
};

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const formatDuration = (years: number): string => {
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  
  if (months === 0) {
    return `${wholeYears}y`;
  }
  return `${wholeYears}y ${months}m`;
};

const isCurrentPeriod = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now < end;
};

export const DashaTimeline: React.FC<DashaTimelineProps> = ({ dashaData }) => {
  const [expandedMaha, setExpandedMaha] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedMahadashas = showAll 
    ? dashaData.mahadashas 
    : dashaData.mahadashas.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current Dasha Card */}
      {dashaData.current_dasha && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            Current Running Dasha
          </h3>
          
          <div className="space-y-3">
            {/* Mahadasha */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${PLANET_COLORS[dashaData.current_dasha.mahadasha.planet]} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {PLANET_ICONS[dashaData.current_dasha.mahadasha.planet]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">
                  {dashaData.current_dasha.mahadasha.planet} Mahadasha
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(dashaData.current_dasha.mahadasha.start_date)} - {formatDate(dashaData.current_dasha.mahadasha.end_date)}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {formatDuration(dashaData.current_dasha.mahadasha.duration_years)}
              </div>
            </div>

            {/* Antardasha */}
            {dashaData.current_dasha.antardasha && (
              <div className="flex items-center gap-3 ml-8 pl-4 border-l-2 border-primary/30">
                <div className={`w-10 h-10 rounded-full ${PLANET_COLORS[dashaData.current_dasha.antardasha.planet]} flex items-center justify-center text-white text-xl shadow-md`}>
                  {PLANET_ICONS[dashaData.current_dasha.antardasha.planet]}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {dashaData.current_dasha.antardasha.planet} Antardasha
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(dashaData.current_dasha.antardasha.start_date)} - {formatDate(dashaData.current_dasha.antardasha.end_date)}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {formatDuration(dashaData.current_dasha.antardasha.duration_years)}
                </div>
              </div>
            )}

            {/* Pratyantardasha */}
            {dashaData.current_dasha.pratyantardasha && (
              <div className="flex items-center gap-3 ml-16 pl-4 border-l-2 border-primary/20">
                <div className={`w-8 h-8 rounded-full ${PLANET_COLORS[dashaData.current_dasha.pratyantardasha.planet]} flex items-center justify-center text-white text-sm shadow`}>
                  {PLANET_ICONS[dashaData.current_dasha.pratyantardasha.planet]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {dashaData.current_dasha.pratyantardasha.planet} Pratyantardasha
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(dashaData.current_dasha.pratyantardasha.start_date)} - {formatDate(dashaData.current_dasha.pratyantardasha.end_date)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Birth Nakshatra Info */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Birth Nakshatra Lord</div>
            <div className="font-semibold text-lg">{dashaData.birth_nakshatra_lord}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Balance at Birth</div>
            <div className="font-semibold text-lg">{formatDuration(dashaData.balance_at_birth_years)}</div>
          </div>
        </div>
      </Card>

      {/* Mahadasha Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mahadasha Periods</h3>
        <div className="space-y-2">
          {displayedMahadashas.map((maha, index) => {
            const isCurrent = isCurrentPeriod(maha.start_date, maha.end_date);
            const isExpanded = expandedMaha === `${maha.planet}-${index}`;

            return (
              <Card
                key={`${maha.planet}-${index}`}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                  isCurrent ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => setExpandedMaha(isExpanded ? null : `${maha.planet}-${index}`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${PLANET_COLORS[maha.planet]} flex items-center justify-center text-white text-xl shadow-md`}>
                    {PLANET_ICONS[maha.planet]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {maha.planet} Mahadasha
                      {maha.is_balance && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full">
                          Balance
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(maha.start_date)} → {formatDate(maha.end_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatDuration(maha.duration_years)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(maha.start_date).getFullYear()}-{new Date(maha.end_date).getFullYear()}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {dashaData.mahadashas.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${dashaData.mahadashas.length} Periods`}
          </button>
        )}
      </div>

      {/* Visual Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Visual Timeline</h3>
        <div className="relative h-24 bg-muted/30 rounded-lg overflow-hidden">
          {displayedMahadashas.map((maha, index) => {
            const totalDuration = displayedMahadashas.reduce((sum, m) => sum + m.duration_years, 0);
            const widthPercent = (maha.duration_years / totalDuration) * 100;
            const isCurrent = isCurrentPeriod(maha.start_date, maha.end_date);

            return (
              <div
                key={`timeline-${maha.planet}-${index}`}
                className={`absolute h-full ${PLANET_COLORS[maha.planet]} opacity-80 hover:opacity-100 transition-opacity group`}
                style={{
                  left: `${displayedMahadashas.slice(0, index).reduce((sum, m) => sum + (m.duration_years / totalDuration) * 100, 0)}%`,
                  width: `${widthPercent}%`,
                }}
              >
                <div className="h-full flex flex-col items-center justify-center text-white text-xs font-medium">
                  <div className="text-lg">{PLANET_ICONS[maha.planet]}</div>
                  <div className="hidden group-hover:block">{maha.planet}</div>
                </div>
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-t-md shadow-lg">
                      Now
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatDate(displayedMahadashas[0]?.start_date)}</span>
          <span>{formatDate(displayedMahadashas[displayedMahadashas.length - 1]?.end_date)}</span>
        </div>
      </Card>
    </div>
  );
};