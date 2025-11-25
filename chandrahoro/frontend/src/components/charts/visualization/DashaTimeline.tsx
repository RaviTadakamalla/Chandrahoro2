'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-react';
import type { DashaTimelineProps, DashaPeriod } from '@/types/chart';
import { PLANET_SYMBOLS, PLANET_COLORS, DASHA_ORDER } from '@/types/chart';

/**
 * DashaTimeline Component
 * 
 * Displays Vimshottari Dasha periods in a horizontal timeline
 * with expandable sub-periods and current period highlighting.
 */
export function DashaTimeline({
  dashaData,
  currentDate = new Date(),
  onPeriodClick,
  showSubPeriods = true,
  className
}: DashaTimelineProps) {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);

  const currentDateObj = new Date(currentDate);

  // Check if a period is current
  const isPeriodCurrent = useCallback((period: DashaPeriod) => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return currentDateObj >= startDate && currentDateObj <= endDate;
  }, [currentDateObj]);

  // Check if a period is in the past
  const isPeriodPast = useCallback((period: DashaPeriod) => {
    const endDate = new Date(period.endDate);
    return currentDateObj > endDate;
  }, [currentDateObj]);

  // Toggle expanded state for a period
  const toggleExpanded = useCallback((periodId: string) => {
    setExpandedPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodId)) {
        newSet.delete(periodId);
      } else {
        newSet.add(periodId);
      }
      return newSet;
    });
  }, []);

  // Handle period click
  const handlePeriodClick = useCallback((period: DashaPeriod) => {
    onPeriodClick?.(period);
  }, [onPeriodClick]);

  // Format date for display
  const formatDate = useCallback((date: Date | string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  }, []);

  // Get planet color
  const getPlanetColor = useCallback((planetName: string) => {
    return PLANET_COLORS[planetName] || '#6b7280';
  }, []);

  // Calculate timeline position (simplified - in real implementation would be proportional to time)
  const getTimelinePosition = useCallback((index: number, total: number) => {
    return (index / (total - 1)) * 100;
  }, []);

  // Render main dasha period
  const renderDashaPeriod = useCallback((period: DashaPeriod, index: number) => {
    const isCurrent = isPeriodCurrent(period);
    const isPast = isPeriodPast(period);
    const isExpanded = expandedPeriods.has(`${period.planet}-${index}`);
    const isHovered = hoveredPeriod === `${period.planet}-${index}`;
    const hasSubPeriods = period.subPeriods && period.subPeriods.length > 0;
    
    return (
      <div key={`${period.planet}-${index}`} className="space-y-2">
        {/* Main period */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-6 w-full h-1 bg-border" />
          
          {/* Period marker */}
          <div className="relative flex items-start gap-4">
            {/* Planet icon */}
            <div 
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300',
                isCurrent && 'animate-pulse ring-4 ring-saffron-300',
                isHovered && 'scale-110',
                'cursor-pointer'
              )}
              style={{ backgroundColor: getPlanetColor(period.planet) }}
              onClick={() => handlePeriodClick(period)}
              onMouseEnter={() => setHoveredPeriod(`${period.planet}-${index}`)}
              onMouseLeave={() => setHoveredPeriod(null)}
            >
              {PLANET_SYMBOLS[period.planet] || period.planet.charAt(0)}
            </div>
            
            {/* Period details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  'font-semibold text-foreground',
                  isCurrent && 'text-saffron-600'
                )}>
                  {period.planet} Mahadasha
                </h4>
                
                {isCurrent && (
                  <Badge variant="default" className="bg-saffron-500 text-white">
                    Current
                  </Badge>
                )}
                
                {isPast && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Past
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{period.duration.toFixed(1)} years</span>
                </div>
              </div>
              
              {/* Expand/collapse button for sub-periods */}
              {hasSubPeriods && showSubPeriods && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(`${period.planet}-${index}`)}
                  className="h-6 px-2 text-xs"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Hide Sub-periods
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Show Sub-periods ({period.subPeriods?.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Sub-periods (Antardashas) */}
        {isExpanded && hasSubPeriods && (
          <div className="ml-16 space-y-2 border-l-2 border-border pl-4">
            {period.subPeriods!.map((subPeriod, subIndex) => (
              <div 
                key={`${subPeriod.planet}-${subIndex}`}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer',
                  isPeriodCurrent(subPeriod) && 'bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800',
                  'hover:bg-muted'
                )}
                onClick={() => handlePeriodClick(subPeriod)}
              >
                {/* Sub-period planet icon */}
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: getPlanetColor(subPeriod.planet) }}
                >
                  {PLANET_SYMBOLS[subPeriod.planet] || subPeriod.planet.charAt(0)}
                </div>
                
                {/* Sub-period details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium',
                      isPeriodCurrent(subPeriod) && 'text-saffron-600'
                    )}>
                      {subPeriod.planet} Antardasha
                    </span>
                    
                    {isPeriodCurrent(subPeriod) && (
                      <Badge variant="default" size="sm" className="bg-saffron-500 text-white text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDate(subPeriod.startDate)} - {formatDate(subPeriod.endDate)} 
                    <span className="ml-2">({subPeriod.duration.toFixed(1)} years)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    isPeriodCurrent, 
    isPeriodPast, 
    expandedPeriods, 
    hoveredPeriod, 
    showSubPeriods,
    getPlanetColor,
    handlePeriodClick,
    formatDate,
    toggleExpanded
  ]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Dasha Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Vimshottari Dasha periods showing planetary influences over time
        </p>
      </div>

      {/* Timeline container */}
      <div className="relative">
        {/* Horizontal scroll container for mobile */}
        <div className="overflow-x-auto">
          <div className="min-w-full space-y-8">
            {dashaData.map((period, index) => renderDashaPeriod(period, index))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DashaTimelineSkeleton Component
 * 
 * Loading skeleton for the DashaTimeline component
 */
export function DashaTimelineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Timeline skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-56 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DashaTimelineCompact Component
 * 
 * Compact version showing only current and next few periods
 */
export function DashaTimelineCompact({
  dashaData,
  currentDate = new Date(),
  className
}: Pick<DashaTimelineProps, 'dashaData' | 'currentDate' | 'className'>) {
  const currentDateObj = new Date(currentDate);
  
  // Find current and next 2 periods
  const relevantPeriods = dashaData
    .filter(period => {
      const endDate = new Date(period.endDate);
      return endDate >= currentDateObj;
    })
    .slice(0, 3);

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-semibold text-foreground">Upcoming Dasha Periods</h4>
      
      <div className="space-y-2">
        {relevantPeriods.map((period, index) => {
          const isCurrent = new Date(period.startDate) <= currentDateObj && new Date(period.endDate) >= currentDateObj;
          
          return (
            <div key={`${period.planet}-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: PLANET_COLORS[period.planet] || '#6b7280' }}
              >
                {PLANET_SYMBOLS[period.planet] || period.planet.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {period.planet}
                  </span>
                  {isCurrent && (
                    <Badge variant="default" size="sm" className="bg-saffron-500 text-white text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
