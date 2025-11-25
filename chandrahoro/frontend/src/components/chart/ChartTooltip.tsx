'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlanetPosition } from '@/lib/api';

interface PlanetTooltipProps {
  planet: PlanetPosition;
  children: React.ReactNode;
}

export function PlanetTooltip({ planet, children }: PlanetTooltipProps) {
  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree);
    const min = Math.floor((degree - deg) * 60);
    const sec = Math.floor(((degree - deg) * 60 - min) * 60);
    return `${deg}°${min}'${sec}"`;
  };

  const getPlanetDescription = (planetName: string): string => {
    const descriptions: { [key: string]: string } = {
      'Sun': 'Soul, ego, vitality, father, authority',
      'Moon': 'Mind, emotions, mother, intuition',
      'Mercury': 'Communication, intellect, business',
      'Venus': 'Love, beauty, relationships, luxury',
      'Mars': 'Energy, courage, conflict, siblings',
      'Jupiter': 'Wisdom, spirituality, teacher, expansion',
      'Saturn': 'Discipline, karma, delays, hard work',
      'Rahu': 'Desires, illusion, foreign elements',
      'Ketu': 'Spirituality, detachment, past life karma'
    };
    return descriptions[planetName] || 'Celestial body';
  };

  const getSignDescription = (signName: string): string => {
    const descriptions: { [key: string]: string } = {
      'Aries': 'Fire sign - Leadership, initiative, courage',
      'Taurus': 'Earth sign - Stability, material comfort, persistence',
      'Gemini': 'Air sign - Communication, versatility, curiosity',
      'Cancer': 'Water sign - Emotions, nurturing, home',
      'Leo': 'Fire sign - Creativity, leadership, self-expression',
      'Virgo': 'Earth sign - Service, analysis, perfectionism',
      'Libra': 'Air sign - Balance, relationships, harmony',
      'Scorpio': 'Water sign - Transformation, intensity, secrets',
      'Sagittarius': 'Fire sign - Philosophy, adventure, higher learning',
      'Capricorn': 'Earth sign - Ambition, structure, responsibility',
      'Aquarius': 'Air sign - Innovation, humanitarian, independence',
      'Pisces': 'Water sign - Spirituality, compassion, imagination'
    };
    return descriptions[signName] || 'Zodiac sign';
  };

  const getNakshatraDescription = (nakshatraName: string): string => {
    // Simplified nakshatra descriptions
    const descriptions: { [key: string]: string } = {
      'Ashwini': 'Healing, swift action, new beginnings',
      'Bharani': 'Transformation, creativity, restraint',
      'Krittika': 'Cutting through illusion, purification',
      'Rohini': 'Growth, beauty, material abundance',
      'Mrigashira': 'Searching, curiosity, gentle nature',
      'Ardra': 'Destruction and renewal, storms',
      'Punarvasu': 'Return to source, renewal, safety',
      'Pushya': 'Nourishment, spirituality, protection',
      'Ashlesha': 'Mystical knowledge, serpent energy',
      'Magha': 'Ancestral power, leadership, tradition',
      'Purva Phalguni': 'Creativity, pleasure, relationships',
      'Uttara Phalguni': 'Service, friendship, contracts',
      'Hasta': 'Skill, craftsmanship, healing hands',
      'Chitra': 'Beauty, creativity, illusion',
      'Swati': 'Independence, flexibility, trade',
      'Vishakha': 'Determination, goal-oriented, transformation',
      'Anuradha': 'Friendship, cooperation, devotion',
      'Jyeshtha': 'Seniority, protection, responsibility',
      'Mula': 'Root causes, investigation, destruction',
      'Purva Ashadha': 'Invincibility, purification, victory',
      'Uttara Ashadha': 'Final victory, leadership, permanence',
      'Shravana': 'Learning, listening, connection',
      'Dhanishta': 'Wealth, music, rhythm',
      'Shatabhisha': 'Healing, mysticism, solitude',
      'Purva Bhadrapada': 'Spiritual fire, transformation',
      'Uttara Bhadrapada': 'Deep wisdom, cosmic connection',
      'Revati': 'Completion, journey\'s end, prosperity'
    };
    return descriptions[nakshatraName] || 'Lunar mansion';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <div className="space-y-2">
          <div className="font-semibold text-primary">{planet.name}</div>
          
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Position:</span> {formatDegree(planet.sidereal_longitude)}
            </div>
            
            <div>
              <span className="font-medium">Sign:</span> {planet.sign}
              {planet.retrograde && <span className="text-red-500 ml-1">(R)</span>}
            </div>
            
            <div>
              <span className="font-medium">House:</span> {planet.house}
            </div>
            
            <div>
              <span className="font-medium">Nakshatra:</span> {planet.nakshatra} (Pada {planet.pada})
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
            <div>{getPlanetDescription(planet.name)}</div>
            <div>{getSignDescription(planet.sign)}</div>
            <div>{getNakshatraDescription(planet.nakshatra)}</div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface HouseTooltipProps {
  houseNumber: number;
  sign: string;
  planets: string[];
  children: React.ReactNode;
}

export function HouseTooltip({ houseNumber, sign, planets, children }: HouseTooltipProps) {
  const getHouseDescription = (house: number): string => {
    const descriptions: { [key: number]: string } = {
      1: 'Self, personality, physical body, first impressions',
      2: 'Wealth, family, speech, food, values',
      3: 'Siblings, courage, communication, short journeys',
      4: 'Home, mother, emotions, property, education',
      5: 'Children, creativity, intelligence, romance, speculation',
      6: 'Health, enemies, service, daily routine, obstacles',
      7: 'Marriage, partnerships, business, open enemies',
      8: 'Transformation, occult, longevity, inheritance, secrets',
      9: 'Dharma, higher learning, father, spirituality, luck',
      10: 'Career, reputation, status, authority, public image',
      11: 'Gains, friends, hopes, elder siblings, income',
      12: 'Loss, expenses, spirituality, foreign lands, liberation'
    };
    return descriptions[house] || 'House of life experiences';
  };

  const getHouseName = (house: number): string => {
    const names: { [key: number]: string } = {
      1: 'Lagna (Ascendant)',
      2: 'Dhana Bhava',
      3: 'Sahaja Bhava',
      4: 'Sukha Bhava',
      5: 'Putra Bhava',
      6: 'Ripu Bhava',
      7: 'Kalatra Bhava',
      8: 'Mrityu Bhava',
      9: 'Dharma Bhava',
      10: 'Karma Bhava',
      11: 'Labha Bhava',
      12: 'Vyaya Bhava'
    };
    return names[house] || `House ${house}`;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <div className="space-y-2">
          <div className="font-semibold text-primary">
            {getHouseName(houseNumber)}
          </div>
          
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Sign:</span> {sign}
            </div>
            
            {planets.length > 0 && (
              <div>
                <span className="font-medium">Planets:</span> {planets.join(', ')}
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground border-t pt-2">
            {getHouseDescription(houseNumber)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
