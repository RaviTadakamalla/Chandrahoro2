import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CharaKaraka {
  planet: string;
  longitude: number;
  degree_in_sign: number;
  sign_name: string;
  sign_number: number;
}

interface CharaKarakaData {
  Atmakaraka: CharaKaraka;
  Amatyakaraka: CharaKaraka;
  Bhratrikaraka: CharaKaraka;
  Matrikaraka: CharaKaraka;
  Putrakaraka: CharaKaraka;
  Gnatikaraka: CharaKaraka;
  Darakaraka: CharaKaraka;
}

interface CharaKarakaDisplayProps {
  charaKarakas: CharaKarakaData;
}

// Karaka meanings and descriptions
const KARAKA_INFO: Record<string, { meaning: string; description: string; color: string }> = {
  Atmakaraka: {
    meaning: 'Self, Soul',
    description: 'Represents the soul, self-realization, and spiritual path',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  Amatyakaraka: {
    meaning: 'Career, Minister',
    description: 'Represents career, profession, and worldly achievements',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  Bhratrikaraka: {
    meaning: 'Siblings, Courage',
    description: 'Represents siblings, courage, and initiative',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  Matrikaraka: {
    meaning: 'Mother, Emotions',
    description: 'Represents mother, emotions, and nurturing',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  Putrakaraka: {
    meaning: 'Children, Creativity',
    description: 'Represents children, creativity, and intelligence',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  Gnatikaraka: {
    meaning: 'Obstacles, Enemies',
    description: 'Represents obstacles, enemies, and diseases',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  Darakaraka: {
    meaning: 'Spouse, Relationships',
    description: 'Represents spouse, relationships, and partnerships',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
};

export default function CharaKarakaDisplay({ charaKarakas }: CharaKarakaDisplayProps) {
  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    const sec = Math.floor(((degree - deg) * 60 - min) * 60);
    return `${deg}°${min}'${sec}"`;
  };

  const karakaOrder = [
    'Atmakaraka',
    'Amatyakaraka',
    'Bhratrikaraka',
    'Matrikaraka',
    'Putrakaraka',
    'Gnatikaraka',
    'Darakaraka',
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chara Karakas (Variable Significators)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Chara Karakas are determined by planetary degrees (highest to lowest).
                  They represent different life areas and change with each chart.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Seven variable significators based on planetary degrees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {karakaOrder.map((karakaName) => {
            const karaka = charaKarakas[karakaName as keyof CharaKarakaData];
            const info = KARAKA_INFO[karakaName];
            
            if (!karaka) return null;

            const isAtmakaraka = karakaName === 'Atmakaraka';

            return (
              <div
                key={karakaName}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  isAtmakaraka ? 'bg-purple-50 border-purple-400' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {karakaName}
                    </span>
                    {isAtmakaraka && (
                      <Badge variant="default" className="bg-purple-600">
                        Most Important
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {info.meaning}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-gray-500 mt-1 cursor-help">
                          {info.description}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{info.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {karaka.planet}
                  </div>
                  <div className="text-sm text-gray-600">
                    {karaka.sign_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDegree(karaka.degree_in_sign)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

