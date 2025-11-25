import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlanetPosition {
  name: string;
  sign: string;
  degree_in_sign: number;
  house: number;
  retrograde: boolean;
}

interface ChartVisualizationProps {
  planets: PlanetPosition[];
  ascendantSign: string;
  chartStyle: string;
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
  'Rahu': '☊', 'Ketu': '☋', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇'
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

export default function ChartVisualization({ 
  planets, 
  ascendantSign, 
  chartStyle 
}: ChartVisualizationProps) {
  // Group planets by house
  const planetsByHouse = planets.reduce((acc, planet) => {
    if (!acc[planet.house]) {
      acc[planet.house] = [];
    }
    acc[planet.house].push(planet);
    return acc;
  }, {} as Record<number, PlanetPosition[]>);

  // Get ascendant house number (always 1 in Vedic astrology)
  const ascendantHouse = 1;
  const ascendantSignIndex = SIGNS.indexOf(ascendantSign);

  // Calculate sign for each house based on ascendant
  const getSignForHouse = (houseNumber: number) => {
    const signIndex = (ascendantSignIndex + houseNumber - 1) % 12;
    return SIGNS[signIndex];
  };

  // North Indian Chart Layout (Diamond shape)
  const renderNorthIndianChart = () => {
    const houses = [
      { house: 12, position: 'top-left', x: 1, y: 1 },
      { house: 1, position: 'top-center', x: 2, y: 1 },
      { house: 2, position: 'top-right', x: 3, y: 1 },
      { house: 11, position: 'middle-left', x: 1, y: 2 },
      { house: 0, position: 'center', x: 2, y: 2 }, // Center (not a house)
      { house: 3, position: 'middle-right', x: 3, y: 2 },
      { house: 10, position: 'bottom-left', x: 1, y: 3 },
      { house: 9, position: 'bottom-center', x: 2, y: 3 },
      { house: 8, position: 'bottom-right', x: 3, y: 3 },
      { house: 7, position: 'bottom-center-2', x: 2, y: 4 },
      { house: 6, position: 'bottom-right-2', x: 3, y: 4 },
      { house: 5, position: 'right', x: 4, y: 3 },
      { house: 4, position: 'right-2', x: 4, y: 2 }
    ];

    return (
      <div className="relative w-96 h-96 mx-auto">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Chart outline - Diamond shape */}
          <polygon
            points="200,50 350,200 200,350 50,200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-600 dark:text-gray-400"
          />

          {/* Internal lines */}
          <line x1="200" y1="50" x2="200" y2="350" stroke="currentColor" strokeWidth="1" className="text-gray-600 dark:text-gray-400" />
          <line x1="50" y1="200" x2="350" y2="200" stroke="currentColor" strokeWidth="1" className="text-gray-600 dark:text-gray-400" />
          <line x1="125" y1="125" x2="275" y2="275" stroke="currentColor" strokeWidth="1" className="text-gray-600 dark:text-gray-400" />
          <line x1="275" y1="125" x2="125" y2="275" stroke="currentColor" strokeWidth="1" className="text-gray-600 dark:text-gray-400" />

          {/* House numbers and content */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
            const sign = getSignForHouse(houseNum);
            const housePlanets = planetsByHouse[houseNum] || [];

            // Position calculations for diamond layout
            let x = 200, y = 200;
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';

            switch (houseNum) {
              case 1: x = 200; y = 80; break;
              case 2: x = 290; y = 110; break;
              case 3: x = 320; y = 200; break;
              case 4: x = 290; y = 290; break;
              case 5: x = 200; y = 320; break;
              case 6: x = 110; y = 290; break;
              case 7: x = 80; y = 200; break;
              case 8: x = 110; y = 110; break;
              case 9: x = 200; y = 140; break;
              case 10: x = 260; y = 200; break;
              case 11: x = 200; y = 260; break;
              case 12: x = 140; y = 200; break;
            }

            return (
              <g key={`house-${houseNum}`}>
                {/* House number */}
                <text
                  x={x}
                  y={y - 20}
                  textAnchor={textAnchor}
                  className="text-xs font-bold fill-gray-600"
                >
                  {houseNum}
                </text>

                {/* Sign symbol */}
                <text
                  x={x}
                  y={y - 5}
                  textAnchor={textAnchor}
                  className="text-sm fill-blue-600"
                >
                  {SIGN_SYMBOLS[sign as keyof typeof SIGN_SYMBOLS]}
                </text>

                {/* Planets in this house */}
                {housePlanets.map((planet, index) => (
                  <text
                    key={`house-${houseNum}-planet-${planet.name}`}
                    x={x + (index * 15) - ((housePlanets.length - 1) * 7.5)}
                    y={y + 15}
                    textAnchor="middle"
                    className={`text-sm font-semibold ${planet.retrograde ? 'fill-red-600' : 'fill-green-600'}`}
                  >
                    {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name.charAt(0)}
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
    const houseLayout = [
      [12, 1, 2, 3],
      [11, null, null, 4],
      [10, null, null, 5],
      [9, 8, 7, 6]
    ];

    return (
      <div className="grid grid-cols-4 gap-1 w-96 h-96 mx-auto border-2 border-gray-300 dark:border-gray-600">
        {houseLayout.flat().map((houseNum, index) => {
          if (houseNum === null) {
            return <div key={`empty-${index}`} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>;
          }

          const sign = getSignForHouse(houseNum);
          const housePlanets = planetsByHouse[houseNum] || [];

          return (
            <div key={`south-house-${houseNum}`} className="border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 relative">
              {/* House number */}
              <div className="absolute top-1 left-1 text-xs font-bold text-gray-600">
                {houseNum}
              </div>

              {/* Sign symbol */}
              <div className="text-center text-lg text-blue-600 mt-2">
                {SIGN_SYMBOLS[sign as keyof typeof SIGN_SYMBOLS]}
              </div>

              {/* Planets */}
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                {housePlanets.map((planet) => (
                  <span
                    key={`south-house-${houseNum}-planet-${planet.name}`}
                    className={`text-xs font-semibold ${
                      planet.retrograde ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS] || planet.name.charAt(0)}
                  </span>
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
    // Bengali chart layout: 4x3 grid with specific house arrangement
    const houseLayout = [
      [12, 1, 2, 3],
      [11, null, null, 4],
      [10, 9, 8, 7, 6, 5]
    ];

    // Flatten the layout for easier rendering
    const flatLayout = [
      { house: 12, row: 0, col: 0 },
      { house: 1, row: 0, col: 1 },
      { house: 2, row: 0, col: 2 },
      { house: 3, row: 0, col: 3 },
      { house: 11, row: 1, col: 0 },
      { house: null, row: 1, col: 1, isCenter: true },
      { house: null, row: 1, col: 2, isCenter: true },
      { house: 4, row: 1, col: 3 },
      { house: 10, row: 2, col: 0 },
      { house: 9, row: 2, col: 1 },
      { house: 8, row: 2, col: 2 },
      { house: 7, row: 2, col: 3 },
      { house: 6, row: 3, col: 2 },
      { house: 5, row: 3, col: 3 }
    ];

    return (
      <div className="w-[600px] h-[450px] mx-auto border-2 border-gray-400">
        <div className="grid grid-cols-4 h-full">
          {/* Row 1: Houses 12, 1, 2, 3 */}
          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">12</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(12) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[12] || []).map((planet) => (
                <span
                  key={`bengali-house-12-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">1</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(1) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[1] || []).map((planet) => (
                <span
                  key={`bengali-house-1-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">2</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(2) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[2] || []).map((planet) => (
                <span
                  key={`bengali-house-2-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">3</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(3) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[3] || []).map((planet) => (
                <span
                  key={`bengali-house-3-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 2: Houses 11, center, center, 4 */}
          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">11</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(11) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[11] || []).map((planet) => (
                <span
                  key={`bengali-house-11-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Center area spanning 2 columns */}
          <div className="col-span-2 border border-gray-300 bg-yellow-100 flex flex-col items-center justify-center p-4">
            <div className="text-lg font-bold text-blue-800 mb-2">Birth Rashi Chart</div>
            <div className="text-sm text-gray-700 text-center">
              <div className="font-semibold">Vedic Horoscope</div>
              <div className="text-xs mt-1">Chart Visualization</div>
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">4</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(4) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[4] || []).map((planet) => (
                <span
                  key={`bengali-house-4-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 3: Houses 10, 9, 8, 7 */}
          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">10</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(10) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[10] || []).map((planet) => (
                <span
                  key={`bengali-house-10-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">9</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(9) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[9] || []).map((planet) => (
                <span
                  key={`bengali-house-9-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">8</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(8) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[8] || []).map((planet) => (
                <span
                  key={`bengali-house-8-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">7</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(7) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[7] || []).map((planet) => (
                <span
                  key={`bengali-house-7-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 4: Empty, Empty, Houses 6, 5 */}
          <div className="border-0"></div>
          <div className="border-0"></div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">6</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(6) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[6] || []).map((planet) => (
                <span
                  key={`bengali-house-6-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 p-3 bg-yellow-50 flex flex-col">
            <div className="text-xs font-bold text-gray-600 mb-1">5</div>
            <div className="text-sm font-semibold text-blue-700 mb-2">
              {BENGALI_SIGN_NAMES[getSignForHouse(5) as keyof typeof BENGALI_SIGN_NAMES]}
            </div>
            <div className="flex flex-wrap gap-1">
              {(planetsByHouse[5] || []).map((planet) => (
                <span
                  key={`bengali-house-5-planet-${planet.name}`}
                  className={`text-xs font-semibold ${
                    planet.retrograde ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {BENGALI_PLANET_NAMES[planet.name as keyof typeof BENGALI_PLANET_NAMES] || planet.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chart Visualization</span>
          <Badge variant="outline">{chartStyle}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart display */}
          {chartStyle === 'North Indian' ? renderNorthIndianChart() :
           chartStyle === 'South Indian' ? renderSouthIndianChart() :
           (chartStyle === 'East Indian' || chartStyle === 'Bengali') ? renderBengaliChart() :
           renderNorthIndianChart() /* default fallback */}
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Planet Symbols</h4>
              <div className="space-y-1">
                {Object.entries(PLANET_SYMBOLS).slice(0, 6).map(([planet, symbol]) => (
                  <div key={`planet-legend-${planet}`} className="flex items-center space-x-2">
                    <span className="font-mono text-green-600">{symbol}</span>
                    <span>{planet}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sign Symbols</h4>
              <div className="space-y-1">
                {Object.entries(SIGN_SYMBOLS).slice(0, 6).map(([sign, symbol]) => (
                  <div key={`sign-legend-${sign}`} className="flex items-center space-x-2">
                    <span className="font-mono text-blue-600">{symbol}</span>
                    <span>{sign}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Green symbols: Direct motion planets</p>
            <p>• Red symbols: Retrograde planets</p>
            <p>• Ascendant: {ascendantSign} in House 1</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
