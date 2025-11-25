'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Heart, 
  Activity, 
  DollarSign, 
  Users, 
  Sparkles 
} from 'lucide-react';
import type { AspectRadarChartProps } from '@/types/chart';

/**
 * AspectRadarChart Component
 * 
 * Displays life aspects (Work, Love, Health, Finance, Family, Spiritual)
 * as a radar chart with interactive tooltips and responsive design.
 */
export function AspectRadarChart({
  data,
  maxValue = 10,
  showGrid = true,
  animated = true,
  className
}: AspectRadarChartProps) {
  const [hoveredAspect, setHoveredAspect] = useState<string | null>(null);

  // Transform data for Recharts
  const chartData = [
    { 
      aspect: 'Work', 
      value: data.work, 
      fullMark: maxValue,
      icon: Briefcase,
      color: '#3b82f6',
      description: 'Career and professional life'
    },
    { 
      aspect: 'Love', 
      value: data.love, 
      fullMark: maxValue,
      icon: Heart,
      color: '#ec4899',
      description: 'Relationships and romance'
    },
    { 
      aspect: 'Health', 
      value: data.health, 
      fullMark: maxValue,
      icon: Activity,
      color: '#10b981',
      description: 'Physical and mental wellbeing'
    },
    { 
      aspect: 'Finance', 
      value: data.finance, 
      fullMark: maxValue,
      icon: DollarSign,
      color: '#f59e0b',
      description: 'Money and financial matters'
    },
    { 
      aspect: 'Family', 
      value: data.family, 
      fullMark: maxValue,
      icon: Users,
      color: '#8b5cf6',
      description: 'Family relationships and home'
    },
    { 
      aspect: 'Spiritual', 
      value: data.spiritual, 
      fullMark: maxValue,
      icon: Sparkles,
      color: '#f97316',
      description: 'Spiritual growth and wisdom'
    }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const Icon = data.icon;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4" style={{ color: data.color }} />
            <span className="font-semibold text-foreground">{label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Score:</span>
              <span className="font-medium text-foreground">
                {payload[0].value.toFixed(1)}/{maxValue}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {data.description}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom angle axis tick
  const CustomAngleAxisTick = ({ payload, x, y, textAnchor, ...props }: any) => {
    const data = chartData.find(item => item.aspect === payload.value);
    if (!data) return null;
    
    const Icon = data.icon;
    const isHovered = hoveredAspect === payload.value;
    
    return (
      <g 
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => setHoveredAspect(payload.value)}
        onMouseLeave={() => setHoveredAspect(null)}
      >
        {/* Background circle for icon */}
        <circle
          cx={x}
          cy={y - 15}
          r={isHovered ? 14 : 12}
          fill={data.color}
          className="transition-all duration-200"
          opacity={isHovered ? 1 : 0.8}
        />
        
        {/* Icon */}
        <foreignObject
          x={x - 8}
          y={y - 23}
          width={16}
          height={16}
          className="pointer-events-none"
        >
          <Icon className="h-4 w-4 text-white" />
        </foreignObject>
        
        {/* Label */}
        <text
          x={x}
          y={y + 8}
          textAnchor={textAnchor}
          fontSize="12"
          fontWeight={isHovered ? 'bold' : 'normal'}
          fill="currentColor"
          className={cn(
            'text-foreground transition-all duration-200',
            isHovered && 'text-saffron-600'
          )}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Calculate average score
  const averageScore = Object.values(data).reduce((sum, value) => sum + value, 0) / Object.values(data).length;

  // Get overall rating
  const getOverallRating = (avg: number) => {
    if (avg >= 8) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    if (avg >= 6) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
    if (avg >= 4) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { label: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' };
  };

  const overallRating = getOverallRating(averageScore);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Life Aspects Analysis</h3>
          <Badge 
            variant="outline" 
            className={cn('text-xs', overallRating.color, overallRating.bgColor)}
          >
            {overallRating.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Comprehensive analysis across six key life areas
        </p>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            {showGrid && (
              <PolarGrid 
                stroke="currentColor" 
                className="text-border opacity-30"
              />
            )}
            
            <PolarAngleAxis 
              dataKey="aspect" 
              tick={<CustomAngleAxisTick />}
              className="text-foreground"
            />
            
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-muted-foreground"
            />
            
            <Radar
              name="Life Aspects"
              dataKey="value"
              stroke="#ff6b35"
              fill="#ff6b35"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: '#ff6b35', strokeWidth: 2, r: 4 }}
              animationBegin={animated ? 0 : undefined}
              animationDuration={animated ? 1000 : 0}
            />
            
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-foreground">
            {averageScore.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Average Score
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-foreground">
            {Math.max(...Object.values(data)).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Highest Score
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/50 col-span-2 md:col-span-1">
          <div className="text-lg font-bold text-foreground">
            {Math.min(...Object.values(data)).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Lowest Score
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Detailed Breakdown</h4>
        <div className="grid gap-2">
          {chartData.map((item) => {
            const Icon = item.icon;
            const percentage = (item.value / maxValue) * 100;
            
            return (
              <div 
                key={item.aspect}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                  hoveredAspect === item.aspect ? 'bg-muted' : 'bg-muted/30',
                  'hover:bg-muted'
                )}
                onMouseEnter={() => setHoveredAspect(item.aspect)}
                onMouseLeave={() => setHoveredAspect(null)}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {item.aspect}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {item.value.toFixed(1)}/{maxValue}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * AspectRadarChartSkeleton Component
 * 
 * Loading skeleton for the AspectRadarChart component
 */
export function AspectRadarChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>

      {/* Chart skeleton */}
      <div className="w-full h-80 bg-muted rounded-lg animate-pulse" />

      {/* Summary skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-muted animate-pulse">
            <div className="h-6 w-8 bg-muted-foreground/20 rounded mx-auto mb-2" />
            <div className="h-3 w-16 bg-muted-foreground/20 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Breakdown skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted animate-pulse">
              <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
                  <div className="h-4 w-12 bg-muted-foreground/20 rounded" />
                </div>
                <div className="h-2 w-full bg-muted-foreground/20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
