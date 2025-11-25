import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PlanetTooltip, HouseTooltip } from '@/components/chart/ChartTooltip';
import type { ChartData } from '@/lib/api';

interface InteractiveNorthIndianChartProps {
  chartData: ChartData;
  size?: number;
}

interface HouseData {
  number: number;
  planets: string[];
  sign: string;
}

export default function InteractiveNorthIndianChart({ chartData, size = 400 }: InteractiveNorthIndianChartProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Create house data with planets
  // Handle cases where houses might be undefined or empty
  const houses: HouseData[] = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    planets: [],
    sign: chartData.houses?.[i]?.sign || ''
  }));

  // Place planets in houses
  if (chartData.planets && Array.isArray(chartData.planets)) {
    chartData.planets.forEach(planet => {
      if (planet.house >= 1 && planet.house <= 12) {
        houses[planet.house - 1].planets.push(planet.name);
      }
    });
  }

  // North Indian chart house positions (diamond layout)
  const housePositions = [
    { x: 50, y: 0, width: 50, height: 25 },   // House 1 (top right)
    { x: 75, y: 25, width: 25, height: 25 },  // House 2 (right top)
    { x: 75, y: 50, width: 25, height: 25 },  // House 3 (right bottom)
    { x: 50, y: 75, width: 50, height: 25 },  // House 4 (bottom right)
    { x: 25, y: 75, width: 25, height: 25 },  // House 5 (bottom left)
    { x: 0, y: 50, width: 25, height: 25 },   // House 6 (left bottom)
    { x: 0, y: 25, width: 25, height: 25 },   // House 7 (left top)
    { x: 0, y: 0, width: 25, height: 25 },    // House 8 (top left)
    { x: 25, y: 0, width: 25, height: 25 },   // House 9 (top center left)
    { x: 25, y: 25, width: 25, height: 25 },  // House 10 (center left)
    { x: 25, y: 50, width: 25, height: 25 },  // House 11 (center bottom)
    { x: 50, y: 25, width: 25, height: 25 },  // House 12 (center right)
  ];

  // Get planet symbol
  const getPlanetSymbol = (planetName: string): string => {
    const symbols: { [key: string]: string } = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Rahu': '☊',
      'Ketu': '☋'
    };
    return symbols[planetName] || planetName.charAt(0);
  };

  // Get planet abbreviation
  const getPlanetAbbr = (planetName: string): string => {
    const abbrs: { [key: string]: string } = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mercury': 'Me',
      'Venus': 'Ve',
      'Mars': 'Ma',
      'Jupiter': 'Ju',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    };
    return abbrs[planetName] || planetName.substring(0, 2);
  };

  // Get planet color based on benefic/malefic nature
  const getPlanetColor = (planetName: string): string => {
    const colors: { [key: string]: string } = {
      'Sun': '#f59e0b',      // Amber - neutral
      'Moon': '#3b82f6',     // Blue - benefic
      'Mercury': '#10b981',  // Green - neutral (depends on association)
      'Venus': '#3b82f6',    // Blue - benefic
      'Mars': '#ef4444',     // Red - malefic
      'Jupiter': '#3b82f6',  // Blue - benefic
      'Saturn': '#ef4444',   // Red - malefic
      'Rahu': '#8b5cf6',     // Purple - malefic
      'Ketu': '#8b5cf6'      // Purple - malefic
    };
    return colors[planetName] || '#6b7280';
  };

  // Check if planet is retrograde
  const isPlanetRetrograde = (planetName: string): boolean => {
    const planet = chartData.planets.find(p => p.name === planetName);
    return planet?.retrograde || false;
  };

  // Convert SVG coordinates to pixel coordinates
  const svgToPixel = (svgX: number, svgY: number) => {
    return {
      x: (svgX / 100) * size,
      y: (svgY / 100) * size
    };
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          {/* SVG Chart */}
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className="border border-gray-300 bg-white absolute inset-0"
          >
            {/* Chart outline - diamond shape */}
            <path
              d="M 50 0 L 100 25 L 100 75 L 50 100 L 0 75 L 0 25 Z"
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
            />
            
            {/* Inner lines to create houses */}
            <line x1="50" y1="0" x2="50" y2="100" stroke="#333" strokeWidth="0.3" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#333" strokeWidth="0.3" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#333" strokeWidth="0.3" />
            <line x1="25" y1="0" x2="25" y2="100" stroke="#333" strokeWidth="0.3" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#333" strokeWidth="0.3" />
            
            {/* House numbers */}
            {housePositions.map((pos, index) => (
              <text
                key={index}
                x={pos.x + 2}
                y={pos.y + 4}
                fontSize="2.5"
                fill="#666"
                fontWeight="bold"
              >
                {index + 1}
              </text>
            ))}
            
            {/* Ascendant marker */}
            <circle
              cx={housePositions[0].x + housePositions[0].width / 2}
              cy={housePositions[0].y + housePositions[0].height / 2}
              r="1"
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth="0.5"
            />
          </svg>

          {/* Interactive overlays for houses */}
          {housePositions.map((pos, index) => {
            const pixelPos = svgToPixel(pos.x, pos.y);
            const pixelSize = {
              width: (pos.width / 100) * size,
              height: (pos.height / 100) * size
            };

            return (
              <HouseTooltip
                key={`house-${index}`}
                houseNumber={index + 1}
                sign={houses[index].sign}
                planets={houses[index].planets}
              >
                <div
                  className="absolute cursor-pointer hover:bg-blue-100 hover:bg-opacity-20 transition-colors"
                  style={{
                    left: pixelPos.x,
                    top: pixelPos.y,
                    width: pixelSize.width,
                    height: pixelSize.height,
                  }}
                />
              </HouseTooltip>
            );
          })}

          {/* Interactive overlays for planets */}
          {houses.map((house, houseIndex) => {
            const pos = housePositions[houseIndex];
            const planetsInHouse = house.planets;
            
            return planetsInHouse.map((planetName, planetIndex) => {
              const planet = chartData.planets.find(p => p.name === planetName);
              if (!planet) return null;

              const isRetrograde = isPlanetRetrograde(planetName);
              const planetColor = getPlanetColor(planetName);
              
              // Calculate planet position within house
              const planetsCount = planetsInHouse.length;
              const planetX = pos.x + pos.width / 2 + (planetIndex - (planetsCount - 1) / 2) * 8;
              const planetY = pos.y + pos.height / 2 + 6;
              
              const pixelPos = svgToPixel(planetX - 4, planetY - 4);

              return (
                <PlanetTooltip key={`${planetName}-${houseIndex}`} planet={planet}>
                  <div
                    className="absolute cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: pixelPos.x,
                      top: pixelPos.y,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: planetColor,
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px' }}>
                      {getPlanetSymbol(planetName)}
                    </div>
                    <div style={{ fontSize: '8px', marginTop: '-2px' }}>
                      {getPlanetAbbr(planetName)}{isRetrograde ? 'R' : ''}
                    </div>
                  </div>
                </PlanetTooltip>
              );
            });
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 text-sm text-gray-600">
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {chartData.planets.map(planet => (
              <div key={planet.name} className="flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: getPlanetColor(planet.name) }}
                >
                  {getPlanetSymbol(planet.name)}
                </span>
                <span className="text-xs">
                  {planet.name} in {planet.sign}
                  {planet.retrograde && <span className="text-red-500 ml-1">(R)</span>}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Benefic planets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Malefic planets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Shadow planets</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
