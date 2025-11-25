/**
 * Western Aspects Table Component
 * 
 * Displays Western astrology aspects in a table format with:
 * - Planet pairs
 * - Aspect type (conjunction, trine, square, etc.)
 * - Orb (deviation from exact)
 * - Applying/Separating status
 * - Color-coded by nature (hard/soft/neutral)
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface WesternAspect {
  planet1: string;
  planet2: string;
  aspect_type: string;
  angle: number;
  orb: number;
  nature: string; // 'hard', 'soft', 'neutral', 'minor'
  strength: number;
  applying: boolean;
}

interface WesternAspectsTableProps {
  aspects: WesternAspect[];
}

const ASPECT_SYMBOLS: Record<string, string> = {
  'Conjunction': '☌',
  'Opposition': '☍',
  'Trine': '△',
  'Square': '□',
  'Sextile': '⚹',
  'Semi-sextile': '⚺',
  'Semi-square': '∠',
  'Sesquiquadrate': '⚼',
  'Quincunx': '⚻',
};

const getNatureBadgeColor = (nature: string) => {
  switch (nature) {
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'soft':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'neutral':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'minor':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const getStrengthLabel = (strength: number) => {
  if (strength >= 0.8) return 'Very Strong';
  if (strength >= 0.6) return 'Strong';
  if (strength >= 0.4) return 'Moderate';
  if (strength >= 0.2) return 'Weak';
  return 'Very Weak';
};

export function WesternAspectsTable({ aspects }: WesternAspectsTableProps) {
  if (!aspects || aspects.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Western Aspects
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No aspects found in this chart.
        </p>
      </Card>
    );
  }

  // Sort aspects by strength (strongest first)
  const sortedAspects = [...aspects].sort((a, b) => b.strength - a.strength);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Western Aspects ({aspects.length})
      </h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Planets</TableHead>
              <TableHead>Aspect</TableHead>
              <TableHead>Angle</TableHead>
              <TableHead>Orb</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAspects.map((aspect, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {aspect.planet1} - {aspect.planet2}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {ASPECT_SYMBOLS[aspect.aspect_type] || '•'}
                    </span>
                    <span>{aspect.aspect_type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {aspect.angle.toFixed(1)}°
                </TableCell>
                <TableCell>
                  {aspect.orb.toFixed(2)}°
                </TableCell>
                <TableCell>
                  <Badge className={getNatureBadgeColor(aspect.nature)}>
                    {aspect.nature}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-400"
                        style={{ width: `${aspect.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {getStrengthLabel(aspect.strength)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={aspect.applying ? 'default' : 'outline'}>
                    {aspect.applying ? 'Applying' : 'Separating'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-semibold mb-2">Legend:</p>
        <div className="grid grid-cols-2 gap-2">
          <div><span className="font-medium">Hard:</span> Challenging aspects (Square, Opposition)</div>
          <div><span className="font-medium">Soft:</span> Harmonious aspects (Trine, Sextile)</div>
          <div><span className="font-medium">Neutral:</span> Conjunction (depends on planets)</div>
          <div><span className="font-medium">Applying:</span> Aspect getting tighter</div>
        </div>
      </div>
    </Card>
  );
}

export default WesternAspectsTable;
