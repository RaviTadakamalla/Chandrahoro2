'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { StrengthMeterProps } from '@/types/chart';
import { PLANET_SYMBOLS, PLANET_COLORS } from '@/types/chart';

/**
 * StrengthMeter Component
 * 
 * Displays planetary strength as a horizontal bar with gradient colors
 * and optional detailed breakdown tooltip.
 */
export function StrengthMeter({
  planetName,
  strength,
  breakdown,
  showTooltip = true,
  className
}: StrengthMeterProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Animate the bar width on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(strength);
    }, 100);
    return () => clearTimeout(timer);
  }, [strength]);

  // Get strength grade and color
  const getStrengthInfo = (strengthValue: number) => {
    if (strengthValue >= 90) return { grade: 'Excellent', color: 'from-green-400 to-green-600', textColor: 'text-green-700' };
    if (strengthValue >= 75) return { grade: 'Very Good', color: 'from-green-400 to-green-500', textColor: 'text-green-600' };
    if (strengthValue >= 60) return { grade: 'Good', color: 'from-blue-400 to-blue-500', textColor: 'text-blue-600' };
    if (strengthValue >= 45) return { grade: 'Average', color: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-600' };
    if (strengthValue >= 30) return { grade: 'Weak', color: 'from-orange-400 to-red-500', textColor: 'text-orange-600' };
    return { grade: 'Very Weak', color: 'from-red-400 to-red-600', textColor: 'text-red-600' };
  };

  const strengthInfo = getStrengthInfo(strength);

  // Format breakdown for tooltip
  const formatBreakdown = () => {
    if (!breakdown) return null;
    
    return [
      { name: 'Sthana Bala', value: breakdown.sthana, description: 'Positional strength' },
      { name: 'Dig Bala', value: breakdown.dig, description: 'Directional strength' },
      { name: 'Kala Bala', value: breakdown.kala, description: 'Temporal strength' },
      { name: 'Chesta Bala', value: breakdown.chesta, description: 'Motional strength' },
      { name: 'Naisargika Bala', value: breakdown.naisargika, description: 'Natural strength' },
      { name: 'Drik Bala', value: breakdown.drik, description: 'Aspectual strength' }
    ];
  };

  const breakdownData = formatBreakdown();

  const MeterContent = () => (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: PLANET_COLORS[planetName] || '#6b7280' }}
          >
            {PLANET_SYMBOLS[planetName] || planetName.charAt(0)}
          </div>
          <span className="font-medium text-foreground">{planetName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('text-xs', strengthInfo.textColor)}>
            {strengthInfo.grade}
          </Badge>
          <span className="text-sm font-semibold text-foreground">
            {strength.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="relative">
        {/* Background bar */}
        <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
          {/* Animated fill */}
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
              strengthInfo.color
            )}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
        
        {/* Percentage text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-white drop-shadow-sm">
            {strength.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Breakdown details (if available) */}
      {breakdownData && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Strength Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {breakdownData.map((item) => (
              <div key={item.name} className="flex justify-between text-xs">
                <span className="text-muted-foreground" title={item.description}>
                  {item.name}:
                </span>
                <span className="font-medium text-foreground">
                  {item.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!showTooltip || !breakdownData) {
    return <MeterContent />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <MeterContent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{planetName} Strength Analysis</h4>
            <div className="space-y-1">
              {breakdownData.map((item) => (
                <div key={item.name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.name}:
                  </span>
                  <span className="font-medium">
                    {item.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Strength:</span>
                <span className={strengthInfo.textColor}>
                  {strength.toFixed(1)}% ({strengthInfo.grade})
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * StrengthMeterSkeleton Component
 * 
 * Loading skeleton for the StrengthMeter component
 */
export function StrengthMeterSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-12 bg-muted rounded animate-pulse" />
          <div className="h-4 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Bar skeleton */}
      <div className="w-full h-6 bg-muted rounded-full animate-pulse" />
    </div>
  );
}

/**
 * StrengthMeterCompact Component
 * 
 * Compact version of the strength meter for use in lists
 */
export function StrengthMeterCompact({
  planetName,
  strength,
  className
}: Pick<StrengthMeterProps, 'planetName' | 'strength' | 'className'>) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const strengthInfo = getStrengthInfo(strength);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(strength);
    }, 100);
    return () => clearTimeout(timer);
  }, [strength]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Planet icon */}
      <div 
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: PLANET_COLORS[planetName] || '#6b7280' }}
      >
        {PLANET_SYMBOLS[planetName] || planetName.charAt(0)}
      </div>
      
      {/* Planet name */}
      <span className="text-sm font-medium text-foreground min-w-0 flex-shrink-0 w-16">
        {planetName}
      </span>
      
      {/* Compact bar */}
      <div className="flex-1 relative">
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
              strengthInfo.color
            )}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
      </div>
      
      {/* Percentage */}
      <span className="text-xs font-semibold text-foreground flex-shrink-0 w-10 text-right">
        {strength.toFixed(0)}%
      </span>
    </div>
  );
}

// Helper function for strength calculation (exported for reuse)
function getStrengthInfo(strengthValue: number) {
  if (strengthValue >= 90) return { grade: 'Excellent', color: 'from-green-400 to-green-600', textColor: 'text-green-700' };
  if (strengthValue >= 75) return { grade: 'Very Good', color: 'from-green-400 to-green-500', textColor: 'text-green-600' };
  if (strengthValue >= 60) return { grade: 'Good', color: 'from-blue-400 to-blue-500', textColor: 'text-blue-600' };
  if (strengthValue >= 45) return { grade: 'Average', color: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-600' };
  if (strengthValue >= 30) return { grade: 'Weak', color: 'from-orange-400 to-red-500', textColor: 'text-orange-600' };
  return { grade: 'Very Weak', color: 'from-red-400 to-red-600', textColor: 'text-red-600' };
}
