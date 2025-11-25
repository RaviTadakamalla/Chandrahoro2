import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AntarDasha {
  sign_number: number;
  sign_name: string;
  lord: string;
  years: number;
  start_date: string;
  end_date: string;
}

interface MahaDasha {
  sign_number: number;
  sign_name: string;
  lord: string;
  lord_position: number;
  years: number;
  start_date: string;
  end_date: string;
  antar_dashas: AntarDasha[];
}

interface CurrentDasha {
  maha_dasha: string;
  maha_dasha_lord: string;
  antara_dasha: string;
  antara_dasha_lord: string;
}

interface CharaDashaData {
  direction: string;
  lagna_sign: string;
  maha_dashas: MahaDasha[];
  current_dasha: CurrentDasha;
  total_cycle_years: number;
}

interface CharaDashaDisplayProps {
  charaDasha: CharaDashaData;
}

export default function CharaDashaDisplay({ charaDasha }: CharaDashaDisplayProps) {
  const [expandedDashas, setExpandedDashas] = useState<Set<number>>(new Set([0]));

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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

  const isCurrentMahaDasha = (mahaDasha: MahaDasha): boolean => {
    return mahaDasha.sign_name === charaDasha.current_dasha?.maha_dasha;
  };

  const isCurrentAntarDasha = (antarDasha: AntarDasha): boolean => {
    return antarDasha.sign_name === charaDasha.current_dasha?.antara_dasha;
  };

  const toggleDasha = (index: number) => {
    const newExpanded = new Set(expandedDashas);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDashas(newExpanded);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chara Dasha (Sign-Based Dasha)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Chara Dasha is a sign-based dasha system where each sign gets a period.
                  Duration is calculated by counting from sign to its lord's position.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Direction: <Badge variant="outline">{charaDasha.direction}</Badge> | 
          Lagna: <Badge variant="outline">{charaDasha.lagna_sign}</Badge> | 
          Total Cycle: <Badge variant="outline">{charaDasha.total_cycle_years} years</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {charaDasha.current_dasha && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="font-semibold text-blue-900 mb-2">Current Dasha Period</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Maha Dasha:</span>{' '}
                <span className="font-semibold">{charaDasha.current_dasha.maha_dasha}</span>
                <span className="text-blue-600"> ({charaDasha.current_dasha.maha_dasha_lord})</span>
              </div>
              <div>
                <span className="text-blue-700">Antar Dasha:</span>{' '}
                <span className="font-semibold">{charaDasha.current_dasha.antara_dasha}</span>
                <span className="text-blue-600"> ({charaDasha.current_dasha.antara_dasha_lord})</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {charaDasha.maha_dashas.map((mahaDasha, index) => {
            const isExpanded = expandedDashas.has(index);
            const isCurrent = isCurrentMahaDasha(mahaDasha);

            return (
              <div
                key={index}
                className={`border rounded-lg ${
                  isCurrent ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-gray-100"
                  onClick={() => toggleDasha(index)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {mahaDasha.sign_name} ({mahaDasha.lord})
                        {isCurrent && (
                          <Badge variant="default" className="ml-2 bg-blue-600">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(mahaDasha.start_date)} - {formatDate(mahaDasha.end_date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{formatDuration(mahaDasha.years)}</Badge>
                  </div>
                </Button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Antar Dashas:
                    </div>
                    {mahaDasha.antar_dashas.map((antarDasha, antarIndex) => {
                      const isCurrentAntar = isCurrent && isCurrentAntarDasha(antarDasha);

                      return (
                        <div
                          key={antarIndex}
                          className={`flex items-center justify-between p-3 rounded-md ${
                            isCurrentAntar
                              ? 'bg-green-100 border-2 border-green-400'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {antarDasha.sign_name} ({antarDasha.lord})
                              {isCurrentAntar && (
                                <Badge variant="default" className="ml-2 bg-green-600 text-xs">
                                  Running
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatDate(antarDasha.start_date)} - {formatDate(antarDasha.end_date)}
                            </div>
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {formatDuration(antarDasha.years)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

