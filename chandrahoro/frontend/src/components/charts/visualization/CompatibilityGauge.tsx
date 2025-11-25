'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Star, Heart } from 'lucide-react';
import type { CompatibilityGaugeProps } from '@/types/chart';

/**
 * CompatibilityGauge Component
 * 
 * Displays compatibility score as an animated 180° arc gauge
 * with needle rotation and star rating.
 */
export function CompatibilityGauge({
  score,
  title = 'Compatibility Score',
  subtitle,
  animated = true,
  size = 200,
  className
}: CompatibilityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStroke, setAnimatedStroke] = useState(0);

  // Clamp score between 0 and 10
  const clampedScore = Math.max(0, Math.min(10, score));

  // Animate the gauge on mount
  useEffect(() => {
    if (!animated) {
      setAnimatedScore(clampedScore);
      setAnimatedStroke(100);
      return;
    }

    const timer1 = setTimeout(() => {
      setAnimatedStroke(100);
    }, 200);

    const timer2 = setTimeout(() => {
      setAnimatedScore(clampedScore);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [clampedScore, animated]);

  // Calculate gauge properties
  const radius = size * 0.35;
  const strokeWidth = size * 0.06;
  const center = size / 2;
  const circumference = Math.PI * radius; // Half circle
  
  // Calculate needle angle (0° = left, 180° = right)
  const needleAngle = (animatedScore / 10) * 180;
  
  // Calculate stroke dash offset for arc animation
  const strokeDashOffset = circumference - (animatedStroke / 100) * circumference;

  // Get color based on score
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 8) return { color: '#10b981', name: 'Excellent' }; // Green
    if (scoreValue >= 6) return { color: '#f59e0b', name: 'Good' }; // Amber
    if (scoreValue >= 4) return { color: '#f97316', name: 'Fair' }; // Orange
    return { color: '#ef4444', name: 'Poor' }; // Red
  };

  const scoreColor = getScoreColor(animatedScore);

  // Generate star rating
  const starRating = Math.round((clampedScore / 10) * 5);

  // Calculate needle coordinates
  const needleLength = radius * 0.8;
  const needleX = center + needleLength * Math.cos((needleAngle - 90) * (Math.PI / 180));
  const needleY = center + needleLength * Math.sin((needleAngle - 90) * (Math.PI / 180));

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Gauge SVG */}
      <div className="relative">
        <svg
          width={size}
          height={size * 0.7}
          viewBox={`0 0 ${size} ${size * 0.7}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Animated arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashOffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle */}
          <g className="transition-transform duration-1000 ease-out" style={{ transformOrigin: `${center}px ${center}px` }}>
            <line
              x1={center}
              y1={center}
              x2={needleX}
              y2={needleY}
              stroke={scoreColor.color}
              strokeWidth={3}
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
            
            {/* Needle center dot */}
            <circle
              cx={center}
              cy={center}
              r={6}
              fill={scoreColor.color}
              className="drop-shadow-sm"
            />
          </g>

          {/* Score markers */}
          {[0, 2, 4, 6, 8, 10].map((markerScore) => {
            const markerAngle = (markerScore / 10) * 180;
            const markerX1 = center + (radius - strokeWidth / 2) * Math.cos((markerAngle - 90) * (Math.PI / 180));
            const markerY1 = center + (radius - strokeWidth / 2) * Math.sin((markerAngle - 90) * (Math.PI / 180));
            const markerX2 = center + (radius + strokeWidth / 2) * Math.cos((markerAngle - 90) * (Math.PI / 180));
            const markerY2 = center + (radius + strokeWidth / 2) * Math.sin((markerAngle - 90) * (Math.PI / 180));

            return (
              <g key={markerScore}>
                <line
                  x1={markerX1}
                  y1={markerY1}
                  x2={markerX2}
                  y2={markerY2}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-muted-foreground"
                />
                <text
                  x={center + (radius + strokeWidth + 10) * Math.cos((markerAngle - 90) * (Math.PI / 180))}
                  y={center + (radius + strokeWidth + 10) * Math.sin((markerAngle - 90) * (Math.PI / 180)) + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  className="text-muted-foreground font-medium"
                >
                  {markerScore}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <div className="text-center">
            <div 
              className="text-3xl font-bold transition-colors duration-500"
              style={{ color: scoreColor.color }}
            >
              {animatedScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {scoreColor.name}
            </div>
          </div>
        </div>
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'h-4 w-4 transition-colors duration-300',
              index < starRating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-muted-foreground'
            )}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {starRating}/5 stars
        </span>
      </div>

      {/* Score interpretation */}
      <div className="text-center max-w-xs">
        <p className="text-xs text-muted-foreground">
          {clampedScore >= 8 && "Exceptional compatibility with strong harmonious connections."}
          {clampedScore >= 6 && clampedScore < 8 && "Good compatibility with positive potential for growth."}
          {clampedScore >= 4 && clampedScore < 6 && "Moderate compatibility requiring understanding and effort."}
          {clampedScore < 4 && "Challenging compatibility that may require significant work."}
        </p>
      </div>
    </div>
  );
}

/**
 * CompatibilityGaugeSkeleton Component
 * 
 * Loading skeleton for the CompatibilityGauge component
 */
export function CompatibilityGaugeSkeleton({ 
  size = 200, 
  className 
}: { 
  size?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Title skeleton */}
      <div className="text-center space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* Gauge skeleton */}
      <div className="relative">
        <div 
          className="bg-muted rounded-full animate-pulse"
          style={{ width: size, height: size * 0.7 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse mt-2" />
        </div>
      </div>

      {/* Star rating skeleton */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 w-4 bg-muted rounded animate-pulse" />
        ))}
        <div className="ml-2 h-4 w-16 bg-muted rounded animate-pulse" />
      </div>

      {/* Description skeleton */}
      <div className="text-center max-w-xs space-y-1">
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}

/**
 * CompatibilityGaugeCompact Component
 * 
 * Compact version for use in cards or lists
 */
export function CompatibilityGaugeCompact({
  score,
  title,
  className
}: Pick<CompatibilityGaugeProps, 'score' | 'title' | 'className'>) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const scoreColor = getScoreColor(clampedScore);
  const starRating = Math.round((clampedScore / 10) * 5);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Score circle */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: scoreColor.color }}
      >
        {clampedScore.toFixed(1)}
      </div>
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-medium text-foreground text-sm">{title}</div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'h-3 w-3',
                  index < starRating 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {scoreColor.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function for score color calculation (exported for reuse)
function getScoreColor(scoreValue: number) {
  if (scoreValue >= 8) return { color: '#10b981', name: 'Excellent' };
  if (scoreValue >= 6) return { color: '#f59e0b', name: 'Good' };
  if (scoreValue >= 4) return { color: '#f97316', name: 'Fair' };
  return { color: '#ef4444', name: 'Poor' };
}
