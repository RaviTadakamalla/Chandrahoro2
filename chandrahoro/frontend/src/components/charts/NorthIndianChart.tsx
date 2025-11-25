'use client';

import React from 'react';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

interface NorthIndianChartProps {
  planets: Planet[];
  ascendant: number;
  className?: string;
}

export function NorthIndianChart({ planets, ascendant, className = '' }: NorthIndianChartProps) {
  const size = 400;
  const center = size / 2;
  const outerRadius = size * 0.45;
  
  const getHousePosition = (house: number): { x: number; y: number } => {
    const positions: { [key: number]: { x: number; y: number } } = {
      1: { x: center, y: center - outerRadius * 0.7 },
      2: { x: center + outerRadius * 0.5, y: center - outerRadius * 0.5 },
      3: { x: center + outerRadius * 0.7, y: center },
      4: { x: center + outerRadius * 0.5, y: center + outerRadius * 0.5 },
      5: { x: center, y: center + outerRadius * 0.7 },
      6: { x: center - outerRadius * 0.5, y: center + outerRadius * 0.5 },
      7: { x: center - outerRadius * 0.7, y: center },
      8: { x: center - outerRadius * 0.5, y: center - outerRadius * 0.5 },
      9: { x: center, y: center - outerRadius * 0.3 },
      10: { x: center + outerRadius * 0.3, y: center },
      11: { x: center, y: center + outerRadius * 0.3 },
      12: { x: center - outerRadius * 0.3, y: center },
    };
    return positions[house] || { x: center, y: center };
  };

  const planetsByHouse: { [key: number]: Planet[] } = {};
  planets.forEach(planet => {
    if (!planetsByHouse[planet.house]) {
      planetsByHouse[planet.house] = [];
    }
    planetsByHouse[planet.house].push(planet);
  });

  return (
    <div className={`inline-block ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="border rounded-lg bg-background">
        <path
          d={`M ${center} ${center - outerRadius}
              L ${center + outerRadius} ${center}
              L ${center} ${center + outerRadius}
              L ${center - outerRadius} ${center}
              Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
        
        <line x1={center} y1={center - outerRadius} x2={center} y2={center + outerRadius} stroke="currentColor" strokeWidth="1" className="text-border" />
        <line x1={center - outerRadius} y1={center} x2={center + outerRadius} y2={center} stroke="currentColor" strokeWidth="1" className="text-border" />
        
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
          const pos = getHousePosition(house);
          return (
            <text
              key={`house-${house}`}
              x={pos.x}
              y={pos.y - 30}
              textAnchor="middle"
              className="text-xs fill-muted-foreground font-medium"
            >
              {house}
            </text>
          );
        })}

        {Object.entries(planetsByHouse).map(([house, housePlanets]) => {
          const pos = getHousePosition(parseInt(house));
          return (
            <g key={`planets-${house}`}>
              {housePlanets.map((planet, index) => (
                <text
                  key={`${planet.name}-${house}`}
                  x={pos.x}
                  y={pos.y + (index * 15)}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-primary"
                >
                  {planet.name.substring(0, 2)}{planet.retrograde ? 'R' : ''}
                </text>
              ))}
            </g>
          );
        })}

        <text
          x={center}
          y={center - outerRadius - 20}
          textAnchor="middle"
          className="text-sm font-bold fill-primary"
        >
          ASC
        </text>

        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          className="text-xs fill-muted-foreground"
        >
          North Indian
        </text>
      </svg>
    </div>
  );
}