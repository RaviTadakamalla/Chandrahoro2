'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import type { 
  NatalChartProps, 
  PlanetPosition, 
  HouseLayout,
  BirthChartData 
} from '@/types/chart';
import { PLANET_SYMBOLS, PLANET_COLORS, BENEFIC_PLANETS, MALEFIC_PLANETS } from '@/types/chart';

/**
 * NatalChart Component
 * 
 * Renders a circular Vedic birth chart in North or South Indian style
 * with interactive planet selection and detailed tooltips.
 */
export function NatalChart({ 
  chartData, 
  style = 'north_indian', 
  size = 400,
  interactive = true,
  onPlanetClick,
  className 
}: NatalChartProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // North Indian chart house layout (diamond shape)
  const northIndianLayout: HouseLayout[] = [
    { number: 1, x: 50, y: 0, width: 50, height: 25 },   // Top right
    { number: 2, x: 75, y: 25, width: 25, height: 25 },  // Right top
    { number: 3, x: 75, y: 50, width: 25, height: 25 },  // Right bottom
    { number: 4, x: 50, y: 75, width: 50, height: 25 },  // Bottom right
    { number: 5, x: 25, y: 75, width: 25, height: 25 },  // Bottom left
    { number: 6, x: 0, y: 50, width: 25, height: 25 },   // Left bottom
    { number: 7, x: 0, y: 25, width: 25, height: 25 },   // Left top
    { number: 8, x: 0, y: 0, width: 25, height: 25 },    // Top left
    { number: 9, x: 25, y: 0, width: 25, height: 25 },   // Top center left
    { number: 10, x: 25, y: 25, width: 25, height: 25 }, // Center left
    { number: 11, x: 25, y: 50, width: 25, height: 25 }, // Center bottom
    { number: 12, x: 50, y: 25, width: 25, height: 25 }, // Center right
  ];

  // South Indian chart house layout (square grid)
  const southIndianLayout: HouseLayout[] = [
    { number: 1, x: 75, y: 75, width: 25, height: 25 },  // Bottom right
    { number: 2, x: 50, y: 75, width: 25, height: 25 },  // Bottom center right
    { number: 3, x: 25, y: 75, width: 25, height: 25 },  // Bottom center left
    { number: 4, x: 0, y: 75, width: 25, height: 25 },   // Bottom left
    { number: 5, x: 0, y: 50, width: 25, height: 25 },   // Left center bottom
    { number: 6, x: 0, y: 25, width: 25, height: 25 },   // Left center top
    { number: 7, x: 0, y: 0, width: 25, height: 25 },    // Top left
    { number: 8, x: 25, y: 0, width: 25, height: 25 },   // Top center left
    { number: 9, x: 50, y: 0, width: 25, height: 25 },   // Top center right
    { number: 10, x: 75, y: 0, width: 25, height: 25 },  // Top right
    { number: 11, x: 75, y: 25, width: 25, height: 25 }, // Right center top
    { number: 12, x: 75, y: 50, width: 25, height: 25 }, // Right center bottom
  ];

  const layout = style === 'north_indian' ? northIndianLayout : southIndianLayout;

  // Get planets in each house
  const getHousePlanets = useCallback((houseNumber: number) => {
    return chartData.planets.filter(planet => planet.house === houseNumber);
  }, [chartData.planets]);

  // Get planet color based on benefic/malefic nature
  const getPlanetColor = useCallback((planetName: string) => {
    if (BENEFIC_PLANETS.includes(planetName)) return '#10b981'; // Green
    if (MALEFIC_PLANETS.includes(planetName)) return '#ef4444'; // Red
    return '#f59e0b'; // Amber for neutral
  }, []);

  // Handle planet click
  const handlePlanetClick = useCallback((planet: PlanetPosition) => {
    if (!interactive) return;
    setSelectedPlanet(planet);
    onPlanetClick?.(planet);
  }, [interactive, onPlanetClick]);

  // Calculate planet position within house
  const getPlanetPosition = useCallback((house: HouseLayout, planetIndex: number, totalPlanets: number) => {
    const centerX = house.x + house.width / 2;
    const centerY = house.y + house.height / 2;
    
    if (totalPlanets === 1) {
      return { x: centerX, y: centerY };
    }
    
    // Arrange multiple planets in a small circle within the house
    const radius = Math.min(house.width, house.height) * 0.15;
    const angle = (planetIndex * 2 * Math.PI) / totalPlanets;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }, []);

  // Render house
  const renderHouse = useCallback((house: HouseLayout) => {
    const housePlanets = getHousePlanets(house.number);
    const houseSign = chartData.houses.find(h => h.number === house.number)?.sign || '';
    
    return (
      <g key={house.number}>
        {/* House rectangle */}
        <rect
          x={`${house.x}%`}
          y={`${house.y}%`}
          width={`${house.width}%`}
          height={`${house.height}%`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
        />
        
        {/* House number */}
        <text
          x={`${house.x + 2}%`}
          y={`${house.y + 4}%`}
          fontSize="8"
          fill="currentColor"
          className="text-muted-foreground font-medium"
        >
          {house.number}
        </text>
        
        {/* House sign */}
        {houseSign && (
          <text
            x={`${house.x + house.width - 2}%`}
            y={`${house.y + 4}%`}
            fontSize="6"
            fill="currentColor"
            className="text-muted-foreground"
            textAnchor="end"
          >
            {houseSign.substring(0, 3)}
          </text>
        )}
        
        {/* Planets in house */}
        {housePlanets.map((planet, index) => {
          const position = getPlanetPosition(house, index, housePlanets.length);
          const isHovered = hoveredElement === `planet-${planet.name}`;
          
          return (
            <g key={planet.name}>
              {/* Planet circle */}
              <circle
                cx={`${position.x}%`}
                cy={`${position.y}%`}
                r="6"
                fill={getPlanetColor(planet.name)}
                stroke="white"
                strokeWidth="1"
                className={cn(
                  'transition-all duration-200 cursor-pointer',
                  isHovered && 'scale-110 drop-shadow-lg',
                  interactive && 'hover:scale-110'
                )}
                onClick={() => handlePlanetClick(planet)}
                onMouseEnter={() => setHoveredElement(`planet-${planet.name}`)}
                onMouseLeave={() => setHoveredElement(null)}
              />
              
              {/* Planet symbol */}
              <text
                x={`${position.x}%`}
                y={`${position.y + 1}%`}
                fontSize="10"
                fill="white"
                textAnchor="middle"
                className="pointer-events-none font-bold"
              >
                {PLANET_SYMBOLS[planet.name] || planet.name.charAt(0)}
              </text>
              
              {/* Retrograde indicator */}
              {planet.isRetrograde && (
                <text
                  x={`${position.x + 8}%`}
                  y={`${position.y - 6}%`}
                  fontSize="6"
                  fill="#ef4444"
                  className="animate-pulse font-bold"
                >
                  R
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }, [chartData.houses, getHousePlanets, getPlanetPosition, getPlanetColor, handlePlanetClick, hoveredElement, interactive]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Birth Chart</h3>
          <p className="text-sm text-muted-foreground">
            {style === 'north_indian' ? 'North Indian' : 'South Indian'} Style
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {chartData.ascendant} Rising
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Toggle chart style - this would be handled by parent component
              console.log('Toggle chart style');
            }}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 100 100"
          className={cn(
            'border rounded-lg bg-background',
            `w-[${size}px] h-[${size}px] max-w-full`
          )}
          style={{ width: size, height: size }}
        >
          {/* Render all houses */}
          {layout.map(renderHouse)}
          
          {/* Chart center (for North Indian style) */}
          {style === 'north_indian' && (
            <g>
              <rect
                x="25%"
                y="25%"
                width="50%"
                height="50%"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
              
              {/* Ascendant indicator */}
              <text
                x="50%"
                y="50%"
                fontSize="8"
                fill="currentColor"
                textAnchor="middle"
                className="text-foreground font-semibold"
              >
                ASC
              </text>
              <text
                x="50%"
                y="55%"
                fontSize="6"
                fill="currentColor"
                textAnchor="middle"
                className="text-muted-foreground"
              >
                {chartData.ascendant}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Planet Details Modal */}
      {selectedPlanet && (
        <Dialog open={!!selectedPlanet} onOpenChange={() => setSelectedPlanet(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: getPlanetColor(selectedPlanet.name) }}
                >
                  {PLANET_SYMBOLS[selectedPlanet.name]}
                </span>
                {selectedPlanet.name}
                {selectedPlanet.isRetrograde && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    Retrograde
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sign:</span>
                  <p className="font-medium">{selectedPlanet.sign}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">House:</span>
                  <p className="font-medium">{selectedPlanet.house}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Degree:</span>
                  <p className="font-medium">{selectedPlanet.degree.toFixed(2)}°</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <p className="font-medium">{selectedPlanet.longitude.toFixed(2)}°</p>
                </div>
              </div>
              
              {selectedPlanet.strength && (
                <div>
                  <span className="text-muted-foreground text-sm">Strength:</span>
                  <div className="mt-1 w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${selectedPlanet.strength}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPlanet.strength.toFixed(1)}% strength
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
