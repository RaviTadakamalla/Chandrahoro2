import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Home, Heart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ArudhaPada {
  sign_number: number;
  sign_name: string;
  house_sign?: number;
  house_sign_name?: string;
  lord?: string;
  lord_sign?: number;
  lord_sign_name?: string;
}

interface ArudhaPadaData {
  AL: ArudhaPada;
  UL: ArudhaPada;
  A1: ArudhaPada;
  A2: ArudhaPada;
  A3: ArudhaPada;
  A4: ArudhaPada;
  A5: ArudhaPada;
  A6: ArudhaPada;
  A7: ArudhaPada;
  A8: ArudhaPada;
  A9: ArudhaPada;
  A10: ArudhaPada;
  A11: ArudhaPada;
  A12: ArudhaPada;
}

interface ArudhaPadaDisplayProps {
  arudhaPadas: ArudhaPadaData;
}

// House significations for Arudha Padas
const PADA_INFO: Record<string, { name: string; description: string; color: string }> = {
  AL: {
    name: 'Arudha Lagna (A1)',
    description: 'Material image, public perception, how others see you',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  UL: {
    name: 'Upapada Lagna (A12)',
    description: 'Marriage, spouse, material manifestation of partnership',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  A2: {
    name: 'Dhana Pada (A2)',
    description: 'Wealth manifestation, family image, speech',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  A3: {
    name: 'Vikrama Pada (A3)',
    description: 'Courage manifestation, siblings, communication',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  A4: {
    name: 'Sukha Pada (A4)',
    description: 'Home manifestation, mother, property, happiness',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  A5: {
    name: 'Putra Pada (A5)',
    description: 'Children manifestation, creativity, intelligence',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  A6: {
    name: 'Roga Pada (A6)',
    description: 'Disease manifestation, enemies, obstacles',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  A7: {
    name: 'Dara Pada (A7)',
    description: 'Spouse manifestation, partnerships, business',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  A8: {
    name: 'Mrityu Pada (A8)',
    description: 'Longevity manifestation, transformation, occult',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  A9: {
    name: 'Dharma Pada (A9)',
    description: 'Fortune manifestation, father, spirituality',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  A10: {
    name: 'Karma Pada (A10)',
    description: 'Career manifestation, profession, status',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  A11: {
    name: 'Labha Pada (A11)',
    description: 'Gains manifestation, income, elder siblings',
    color: 'bg-lime-100 text-lime-800 border-lime-300',
  },
};

export default function ArudhaPadaDisplay({ arudhaPadas }: ArudhaPadaDisplayProps) {
  // Render special padas (AL and UL) prominently
  const renderSpecialPada = (padaKey: 'AL' | 'UL', icon: React.ReactNode) => {
    const pada = arudhaPadas[padaKey];
    const info = PADA_INFO[padaKey];
    
    return (
      <Card className={`border-2 ${info.color}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-lg">{info.name}</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{info.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sign:</span>
              <Badge variant="outline" className="text-base">
                {pada.sign_name}
              </Badge>
            </div>
            {pada.lord && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Lord:</span>
                <span>{pada.lord} in {pada.lord_sign_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold mb-2">Arudha Padas</h3>
        <p className="text-muted-foreground">
          Material manifestations of houses - K.N. Rao&apos;s method
        </p>
      </div>

      {/* Special Padas - AL and UL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSpecialPada('AL', <Home className="h-5 w-5" />)}
        {renderSpecialPada('UL', <Heart className="h-5 w-5" />)}
      </div>

      {/* All 12 Arudha Padas */}
      <Card>
        <CardHeader>
          <CardTitle>All Arudha Padas (A1-A12)</CardTitle>
          <CardDescription>
            Material manifestations of all 12 houses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(arudhaPadas)
              .filter(([key]) => key.startsWith('A') && key !== 'AL' && key !== 'UL')
              .sort((a, b) => {
                const numA = parseInt(a[0].substring(1));
                const numB = parseInt(b[0].substring(1));
                return numA - numB;
              })
              .map(([padaKey, pada]) => {
                const info = PADA_INFO[padaKey] || {
                  name: padaKey,
                  description: `Pada of ${padaKey.substring(1)}th house`,
                  color: 'bg-gray-100 text-gray-800 border-gray-300',
                };

                return (
                  <TooltipProvider key={padaKey}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`p-3 rounded-lg border-2 ${info.color} cursor-help`}>
                          <div className="font-semibold text-sm mb-1">{padaKey}</div>
                          <div className="text-xs font-medium">{pada.sign_name}</div>
                          {pada.lord && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {pada.lord}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold">{info.name}</p>
                        <p className="text-xs mt-1">{info.description}</p>
                        {pada.house_sign_name && (
                          <p className="text-xs mt-1">
                            House: {pada.house_sign_name}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Interpretation Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Understanding Arudha Padas</p>
              <p>
                Arudha Padas represent the material manifestation of each house.
                They show how the significations of a house appear in the external world.
                <strong> AL (Arudha Lagna)</strong> shows your public image, while
                <strong> UL (Upapada)</strong> reveals the material reality of your marriage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

