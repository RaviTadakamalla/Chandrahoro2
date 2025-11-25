'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Star,
  Circle,
  Home,
  Zap,
  Clock,
  TrendingUp,
  Heart,
  ExternalLink,
  Maximize2,
} from 'lucide-react';

import type { ChartReferenceCardProps, ChartReference } from '@/types/chat';
import { CHART_REFERENCE_TYPES } from '@/types/chat';

/**
 * Chart Reference Card Component
 * 
 * Displays inline chart references with expandable modal view.
 */
export function ChartReferenceCard({
  reference,
  onClick,
  variant = 'inline',
  className,
}: ChartReferenceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTypeIcon = (type: ChartReference['type']) => {
    switch (type) {
      case 'planet':
        return <Star className="w-4 h-4" />;
      case 'house':
        return <Home className="w-4 h-4" />;
      case 'aspect':
        return <Zap className="w-4 h-4" />;
      case 'dasha':
        return <Clock className="w-4 h-4" />;
      case 'strength':
        return <TrendingUp className="w-4 h-4" />;
      case 'compatibility':
        return <Heart className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ChartReference['type']) => {
    switch (type) {
      case 'planet':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'house':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'aspect':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'dasha':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'strength':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'compatibility':
        return 'bg-pink-500/20 text-pink-700 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const handleCardClick = () => {
    if (variant === 'modal') {
      setIsModalOpen(true);
    } else {
      onClick?.(reference);
    }
  };

  const renderCardContent = () => (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md cursor-pointer',
      'border border-white/20 bg-white/10 backdrop-blur-sm',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', getTypeColor(reference.type))}
            >
              {getTypeIcon(reference.type)}
              <span className="ml-1">{CHART_REFERENCE_TYPES[reference.type]}</span>
            </Badge>
          </div>
          
          {variant === 'inline' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/60 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <CardTitle className="text-sm text-white font-medium">
          {reference.title}
        </CardTitle>
        
        {reference.description && (
          <CardDescription className="text-xs text-white/70">
            {reference.description}
          </CardDescription>
        )}
      </CardHeader>

      {variant !== 'compact' && reference.data && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {renderReferenceData(reference)}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderReferenceData = (ref: ChartReference) => {
    switch (ref.type) {
      case 'planet':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>
              <span className="text-white/60">Sign:</span>
              <span className="ml-1 font-medium">{ref.data.sign}</span>
            </div>
            <div>
              <span className="text-white/60">House:</span>
              <span className="ml-1 font-medium">{ref.data.house}</span>
            </div>
            <div>
              <span className="text-white/60">Degree:</span>
              <span className="ml-1 font-medium">{ref.data.degree}°</span>
            </div>
            {ref.data.strength && (
              <div>
                <span className="text-white/60">Strength:</span>
                <span className="ml-1 font-medium">{ref.data.strength}%</span>
              </div>
            )}
          </div>
        );

      case 'house':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>
              <span className="text-white/60">Lord:</span>
              <span className="ml-1 font-medium">{ref.data.lord}</span>
            </div>
            <div>
              <span className="text-white/60">Sign:</span>
              <span className="ml-1 font-medium">{ref.data.sign}</span>
            </div>
            {ref.data.planets && ref.data.planets.length > 0 && (
              <div className="col-span-2">
                <span className="text-white/60">Planets:</span>
                <span className="ml-1 font-medium">{ref.data.planets.join(', ')}</span>
              </div>
            )}
          </div>
        );

      case 'aspect':
        return (
          <div className="space-y-1 text-xs text-white/80">
            <div>
              <span className="text-white/60">Planets:</span>
              <span className="ml-1 font-medium">{ref.data.planet1} - {ref.data.planet2}</span>
            </div>
            <div>
              <span className="text-white/60">Type:</span>
              <span className="ml-1 font-medium">{ref.data.aspectType}</span>
            </div>
            <div>
              <span className="text-white/60">Orb:</span>
              <span className="ml-1 font-medium">{ref.data.orb}°</span>
            </div>
          </div>
        );

      case 'dasha':
        return (
          <div className="space-y-1 text-xs text-white/80">
            <div>
              <span className="text-white/60">Period:</span>
              <span className="ml-1 font-medium">{ref.data.planet} Dasha</span>
            </div>
            <div>
              <span className="text-white/60">Duration:</span>
              <span className="ml-1 font-medium">{ref.data.startDate} - {ref.data.endDate}</span>
            </div>
            {ref.data.subPeriod && (
              <div>
                <span className="text-white/60">Sub-period:</span>
                <span className="ml-1 font-medium">{ref.data.subPeriod}</span>
              </div>
            )}
          </div>
        );

      case 'strength':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Overall Strength</span>
              <span className="font-medium">{ref.data.overall}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-300"
                style={{ width: `${ref.data.overall}%` }}
              />
            </div>
          </div>
        );

      case 'compatibility':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Compatibility Score</span>
              <span className="font-medium">{ref.data.score}/10</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i < Math.floor(ref.data.score / 2)
                      ? 'text-yellow-400 fill-current'
                      : 'text-white/30'
                  )}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-white/60">
            {JSON.stringify(ref.data, null, 2)}
          </div>
        );
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCardClick}
        className={cn(
          'h-auto p-2 justify-start text-left',
          'border-white/20 bg-white/10 hover:bg-white/20',
          'text-white hover:text-white',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {getTypeIcon(reference.type)}
          <span className="text-xs font-medium">{reference.title}</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </div>
      </Button>
    );
  }

  return (
    <>
      <div onClick={handleCardClick}>
        {renderCardContent()}
      </div>

      {/* Modal View */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getTypeIcon(reference.type)}
              {reference.title}
              <Badge variant="outline" className={getTypeColor(reference.type)}>
                {CHART_REFERENCE_TYPES[reference.type]}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {reference.description && (
              <p className="text-muted-foreground">{reference.description}</p>
            )}

            {reference.data && (
              <div className="space-y-4">
                <h4 className="font-medium">Details</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  {renderReferenceData(reference)}
                </div>
              </div>
            )}

            {reference.thumbnail && (
              <div className="space-y-2">
                <h4 className="font-medium">Chart Preview</h4>
                <div className="border rounded-lg p-4 bg-muted/20">
                  <img
                    src={reference.thumbnail}
                    alt={`${reference.title} preview`}
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {reference.chartId && (
                <Button onClick={() => onClick?.(reference)}>
                  View Full Chart
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
