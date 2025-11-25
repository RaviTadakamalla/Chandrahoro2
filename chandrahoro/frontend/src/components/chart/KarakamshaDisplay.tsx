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

interface KarakamshaData {
  planet: string;
  rasi_sign_name: string;
  rasi_sign_number: number;
  navamsa_sign_name: string;
  navamsa_sign_number: number;
  navamsa_longitude: number;
  degree_in_navamsa: number;
}

interface KarakamshaDisplayProps {
  karakamsha: KarakamshaData;
}

export default function KarakamshaDisplay({ karakamsha }: KarakamshaDisplayProps) {
  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    const sec = Math.floor(((degree - deg) * 60 - min) * 60);
    return `${deg}°${min}'${sec}"`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Karakamsha (Atmakaraka's Navamsa)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Karakamsha is the Navamsa (D9) sign where the Atmakaraka is placed.
                  It reveals spiritual path, karmic lessons, and soul's purpose.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Spiritual and karmic analysis based on Atmakaraka's Navamsa position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Atmakaraka Info */}
          <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <div className="text-sm text-purple-700 mb-1">Atmakaraka (Soul Significator)</div>
            <div className="text-2xl font-bold text-purple-900">{karakamsha.planet}</div>
          </div>

          {/* Rasi Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Rasi (D1) Sign</div>
              <div className="text-xl font-semibold text-blue-900">
                {karakamsha.rasi_sign_name}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Sign #{karakamsha.rasi_sign_number}
              </div>
            </div>

            {/* Navamsa Position */}
            <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
              <div className="text-sm text-green-700 mb-1">
                Navamsa (D9) Sign
                <Badge variant="default" className="ml-2 bg-green-600 text-xs">
                  Karakamsha
                </Badge>
              </div>
              <div className="text-xl font-semibold text-green-900">
                {karakamsha.navamsa_sign_name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatDegree(karakamsha.degree_in_navamsa)}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Spiritual Significance
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • The Karakamsha sign ({karakamsha.navamsa_sign_name}) reveals your soul's purpose
                and spiritual path.
              </p>
              <p>
                • Planets in Karakamsha indicate areas of spiritual growth and karmic lessons.
              </p>
              <p>
                • The lord of Karakamsha shows the means to achieve spiritual fulfillment.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

