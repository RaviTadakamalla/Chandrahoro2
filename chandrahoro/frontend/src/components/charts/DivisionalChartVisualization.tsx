import React from 'react';
import { DivisionalChart } from '@/lib/api';

interface DivisionalChartVisualizationProps {
  chartData: DivisionalChart;
  chartKey: string;
  chartStyle: string;
  size?: 'small' | 'medium' | 'large';
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANET_SYMBOLS = {
  'Sun': '☉', 'Moon': '☽', 'Mars': '♂', 'Mercury': '☿',
  'Jupiter': '♃', 'Venus': '♀', 'Saturn': '♄',
  'Rahu': '☊', 'Ketu': '☋'
};

// Bengali/Sanskrit sign names for East Indian style
const BENGALI_SIGN_NAMES = {
  'Aries': 'Mesh', 'Taurus': 'Vrisha', 'Gemini': 'Mithun', 'Cancer': 'Karka',
  'Leo': 'Simha', 'Virgo': 'Kanya', 'Libra': 'Tula', 'Scorpio': 'Vrischik',
  'Sagittarius': 'Dhanu', 'Capricorn': 'Makar', 'Aquarius': 'Kumbh', 'Pisces': 'Meena'
};

// Bengali/Sanskrit planet names for East Indian style
const BENGALI_PLANET_NAMES = {
  'Sun': 'Surya', 'Moon': 'Chandra', 'Mars': 'Mangal', 'Mercury': 'Budh',
  'Jupiter': 'Guru', 'Venus': 'Shukra', 'Saturn': 'Sani',
  'Rahu': 'Rahu', 'Ketu': 'Ketu'
};

export default function DivisionalChartVisualization({ 
  chartData, 
  chartKey, 
  chartStyle,
  size = 'medium'
}: DivisionalChartVisualizationProps) {
  // Convert divisional chart planet data to format expected by visualization
  const convertPlanetsData = () => {
    return Object.entries(chartData.planets).map(([planetName, planetData]) => ({
      name: planetName,
      sign: SIGNS[planetData.sign_number], // sign_number is 0-based in API response
      degree_in_sign: planetData.degree_in_sign,
      house: planetData.sign_number + 1, // Convert to 1-based for visualization
      retrograde: false // Retrograde info not available in divisional chart data
    }));
  };

  const planets = convertPlanetsData();

  // Group planets by sign (house in divisional chart context)
  const planetsBySign = planets.reduce((acc, planet) => {
    const signIndex = planet.house;
    if (!acc[signIndex]) {
      acc[signIndex] = [];
    }
    acc[signIndex].push(planet);
    return acc;
  }, {} as Record<number, typeof planets>);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return {
        container: 'w-80 h-80',
        text: 'text-xs',
        planetText: 'text-xs',
        signText: 'text-sm',
        viewBox: 400,
        fontSize: '10px'
      };
      case 'large': return {
        container: 'w-[600px] h-[600px]',
        text: 'text-sm',
        planetText: 'text-sm',
        signText: 'text-lg',
        viewBox: 600,
        fontSize: '14px'
      };
      default: return {
        container: 'w-96 h-96',
        text: 'text-sm',
        planetText: 'text-sm',
        signText: 'text-base',
        viewBox: 500,
        fontSize: '12px'
      };
    }
  };

  const sizeClasses = getSizeClasses();

  // North Indian Chart Layout (Diamond shape)
  const renderNorthIndianChart = () => {
    const viewBoxSize = sizeClasses.viewBox;
    const center = viewBoxSize / 2;
    const radius = viewBoxSize * 0.4;

    return (
      <div className={`relative ${sizeClasses.container} mx-auto`}>
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full">
          {/* Chart outline - Diamond shape */}
          <polygon
            points={`${center},${center-radius} ${center+radius},${center} ${center},${center+radius} ${center-radius},${center}`}
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Internal lines */}
          <line x1={center} y1={center-radius} x2={center} y2={center+radius} stroke="#374151" strokeWidth="1" />
          <line x1={center-radius} y1={center} x2={center+radius} y2={center} stroke="#374151" strokeWidth="1" />
          <line x1={center-radius*0.7} y1={center-radius*0.7} x2={center+radius*0.7} y2={center+radius*0.7} stroke="#374151" strokeWidth="1" />
          <line x1={center+radius*0.7} y1={center-radius*0.7} x2={center-radius*0.7} y2={center+radius*0.7} stroke="#374151" strokeWidth="1" />

          {/* Signs and planets */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((signNum) => {
            const sign = SIGNS[signNum - 1];
            const signPlanets = planetsBySign[signNum] || [];

            // Position calculations for diamond layout
            let x, y;
            const offset = radius * 0.85;

            switch (signNum) {
              case 1: x = center; y = center - offset; break;
              case 2: x = center + offset * 0.7; y = center - offset * 0.7; break;
              case 3: x = center + offset; y = center; break;
              case 4: x = center + offset * 0.7; y = center + offset * 0.7; break;
              case 5: x = center; y = center + offset; break;
              case 6: x = center - offset * 0.7; y = center + offset * 0.7; break;
              case 7: x = center - offset; y = center; break;
              case 8: x = center - offset * 0.7; y = center - offset * 0.7; break;
              case 9: x = center; y = center - offset * 0.5; break;
              case 10: x = center + offset * 0.5; y = center; break;
              case 11: x = center; y = center + offset * 0.5; break;
              case 12: x = center - offset * 0.5; y = center; break;
              default: x = center; y = center;
            }

            return (
              <g key={`sign-${signNum}`}>
                {/* Sign number */}
                <text
                  x={x}
                  y={y - 30}
                  textAnchor="middle"
                  fontSize={sizeClasses.fontSize}
                  className="font-bold fill-gray-600"
                >
                  {signNum}
                </text>

                {/* Sign name */}
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  fontSize={sizeClasses.fontSize}
                  className="font-medium fill-blue-600"
                >
                  {sign}
                </text>

                {/* Planets in this sign */}
                {signPlanets.map((planet, index) => (
                  <text
                    key={`sign-${signNum}-planet-${planet.name}`}
                    x={x}
                    y={y + 5 + (index * 15)}
                    textAnchor="middle"
                    fontSize={sizeClasses.fontSize}
                    className="font-semibold fill-green-600"
                  >
                    {planet.name}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // South Indian Chart Layout (Square grid)
  const renderSouthIndianChart = () => {
    const signLayout = [
      [12, 1, 2, 3],
      [11, null, null, 4],
      [10, null, null, 5],
      [9, 8, 7, 6]
    ];

    return (
      <div className={`grid grid-cols-4 gap-2 ${sizeClasses.container} mx-auto border-2 border-gray-300 dark:border-gray-600`}>
        {signLayout.flat().map((signNum, index) => {
          if (signNum === null) {
            return <div key={`empty-${index}`} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>;
          }

          const sign = SIGNS[signNum - 1];
          const signPlanets = planetsBySign[signNum] || [];

          return (
            <div key={`south-sign-${signNum}`} className="border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 relative min-h-[80px] flex flex-col">
              {/* Sign number */}
              <div className={`absolute top-1 left-1 ${sizeClasses.text} font-bold text-gray-600`}>
                {signNum}
              </div>

              {/* Sign name */}
              <div className={`text-center ${sizeClasses.signText} text-blue-600 font-medium mt-1 mb-2`}>
                {sign}
              </div>

              {/* Planets */}
              <div className="flex flex-col items-center gap-1 flex-1 justify-center">
                {signPlanets.map((planet) => (
                  <div
                    key={`south-sign-${signNum}-planet-${planet.name}`}
                    className={`${sizeClasses.planetText} font-semibold text-green-600 text-center`}
                  >
                    {planet.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Bengali/East Indian Chart Layout (Rectangular grid)
  const renderBengaliChart = () => {
    const containerSize = size === 'small' ? 'w-80 h-60' : size === 'medium' ? 'w-96 h-72' : 'w-[600px] h-[450px]';
    const textSize = size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base';
    const houseTextSize = size === 'small' ? 'text-xs' : 'text-sm';
    const planetTextSize = size === 'small' ? 'text-xs' : 'text-sm';

    return (
      <div className={`${containerSize} mx-auto border-2 border-gray-400`}>
        <div className="grid grid-cols-4 h-full">
          {/* Row 1: Houses 12, 1, 2, 3 */}
          {[12, 1, 2, 3].map((houseNum) => {
            const sign = SIGNS[houseNum - 1];
            const signPlanets = planetsBySign[houseNum] || [];

            return (
              <div key={`bengali-house-${houseNum}`} className="border border-gray-300 p-2 bg-yellow-50 flex flex-col">
                <div className={`${houseTextSize} font-bold text-gray-600 mb-1`}>{houseNum}</div>
                <div className={`${textSize} font-semibold text-blue-700 mb-1`}>
                  {BENGALI_SIGN_NAMES[sign as keyof typeof BENGALI_SIGN_NAMES]}
                </div>
                <div className="flex flex-wrap gap-1">
                  {signPlanets.map((planet) => (
                    <span
                      key={`bengali-house-${houseNum}-planet-${planet.name}`}
                      className={`${planetTextSize} font-semibold text-green-700`}
                    >
                      {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Row 2: House 11, center area, House 4 */}
          <div className="border border-gray-300 p-2 bg-yellow-50 flex flex-col">
            <div className={`${houseTextSize} font-bold text-gray-600 mb-1`}>11</div>
            <div className={`${textSize} font-semibold text-blue-700 mb-1`}>
              {BENGALI_SIGN_NAMES[SIGNS[10] as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsBySign[11] || []).map((planet) => (
                <span
                  key={`bengali-house-11-planet-${planet.name}`}
                  className={`${planetTextSize} font-semibold text-green-700`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Center area spanning 2 columns */}
          <div className="col-span-2 border border-gray-300 bg-yellow-100 flex flex-col items-center justify-center p-2">
            <div className={`${textSize} font-bold text-blue-800 mb-1`}>{chartKey}</div>
            <div className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-700 text-center`}>
              <div className="font-semibold">{chartData.name}</div>
            </div>
          </div>

          <div className="border border-gray-300 p-2 bg-yellow-50 flex flex-col">
            <div className={`${houseTextSize} font-bold text-gray-600 mb-1`}>4</div>
            <div className={`${textSize} font-semibold text-blue-700 mb-1`}>
              {BENGALI_SIGN_NAMES[SIGNS[3] as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsBySign[4] || []).map((planet) => (
                <span
                  key={`bengali-house-4-planet-${planet.name}`}
                  className={`${planetTextSize} font-semibold text-green-700`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 3: Houses 10, 9, 8, 7 */}
          {[10, 9, 8, 7].map((houseNum) => {
            const sign = SIGNS[houseNum - 1];
            const signPlanets = planetsBySign[houseNum] || [];

            return (
              <div key={`bengali-house-${houseNum}`} className="border border-gray-300 p-2 bg-yellow-50 flex flex-col">
                <div className={`${houseTextSize} font-bold text-gray-600 mb-1`}>{houseNum}</div>
                <div className={`${textSize} font-semibold text-blue-700 mb-1`}>
                  {BENGALI_SIGN_NAMES[sign as keyof typeof BENGALI_SIGN_NAMES]}
                </div>
                <div className="flex flex-wrap gap-1">
                  {signPlanets.map((planet) => (
                    <span
                      key={`bengali-house-${houseNum}-planet-${planet.name}`}
                      className={`${planetTextSize} font-semibold text-green-700`}
                    >
                      {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Row 4: Empty, Empty, Houses 6, 5 */}
          <div className="border-0"></div>
          <div className="border-0"></div>

          {[6, 5].map((houseNum) => {
            const sign = SIGNS[houseNum - 1];
            const signPlanets = planetsBySign[houseNum] || [];

            return (
              <div key={`bengali-house-${houseNum}`} className="border border-gray-300 p-2 bg-yellow-50 flex flex-col">
                <div className={`${houseTextSize} font-bold text-gray-600 mb-1`}>{houseNum}</div>
                <div className={`${textSize} font-semibold text-blue-700 mb-1`}>
                  {BENGALI_SIGN_NAMES[sign as keyof typeof BENGALI_SIGN_NAMES]}
                </div>
                <div className="flex flex-wrap gap-1">
                  {signPlanets.map((planet) => (
                    <span
                      key={`bengali-house-${houseNum}-planet-${planet.name}`}
                      className={`${planetTextSize} font-semibold text-green-700`}
                    >
                      {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Chart display */}
      {chartStyle === 'North Indian' ? renderNorthIndianChart() :
       chartStyle === 'South Indian' ? renderSouthIndianChart() :
       (chartStyle === 'East Indian' || chartStyle === 'Bengali') ? renderBengaliChart() :
       renderNorthIndianChart() /* default fallback */}

      {/* Chart title */}
      <div className="text-center">
        <h4 className={`font-semibold text-gray-700 ${sizeClasses.signText}`}>
          {chartKey} - {chartData.name}
        </h4>
      </div>
    </div>
  );
}
