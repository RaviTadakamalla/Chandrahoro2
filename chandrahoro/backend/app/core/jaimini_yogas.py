"""Jaimini Yoga Detection - K.N. Rao's Method.

This module implements Jaimini yoga detection based on K.N. Rao's research.
Jaimini yogas are based on Chara Karakas, sign aspects (Rashi Drishti),
and specific planetary combinations.

Copyright (C) 2025 ChandraHoro Development Team
Licensed under GNU AGPL v3.0
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class JaiminiYogaResult:
    """Result of a Jaimini yoga detection."""
    name: str
    type: str  # 'raja', 'spiritual', 'career', 'marriage', 'wealth'
    strength: str  # 'weak', 'moderate', 'strong', 'very_strong'
    description: str
    karakas_involved: List[str]
    planets_involved: List[str]
    conditions_met: List[str]
    effects: str


class JaiminiYogaDetector:
    """Detect Jaimini yogas based on K.N. Rao's methodology."""
    
    # Sign classification for Rashi Drishti
    MOVABLE_SIGNS = [1, 4, 7, 10]  # Aries, Cancer, Libra, Capricorn
    FIXED_SIGNS = [2, 5, 8, 11]    # Taurus, Leo, Scorpio, Aquarius
    DUAL_SIGNS = [3, 6, 9, 12]     # Gemini, Virgo, Sagittarius, Pisces
    
    # Kendra and Trikona houses
    KENDRA_HOUSES = [1, 4, 7, 10]
    TRIKONA_HOUSES = [1, 5, 9]
    
    def __init__(self):
        """Initialize Jaimini yoga detector."""
        pass
    
    def detect_all_jaimini_yogas(
        self,
        chara_karakas: Dict[str, Dict],
        planets: Dict[str, Dict],
        ascendant_sign: int,
        rashi_drishti: Dict[str, List[int]]
    ) -> List[JaiminiYogaResult]:
        """
        Detect all Jaimini yogas in the chart.
        
        Args:
            chara_karakas: Dictionary of Chara Karakas (Atmakaraka, Amatyakaraka, etc.)
            planets: Dictionary of planet positions
            ascendant_sign: Ascendant sign number (1-12)
            rashi_drishti: Dictionary of sign aspects
        
        Returns:
            List of detected Jaimini yogas
        """
        yogas = []
        
        # Detect Raja Yogas (position/power)
        yogas.extend(self._detect_karaka_raja_yogas(chara_karakas, planets, ascendant_sign, rashi_drishti))
        
        # Detect Special Yogas (Moon-Venus, etc.)
        yogas.extend(self._detect_special_yogas(planets, rashi_drishti))
        
        # Detect Career Yogas (Amatyakaraka based)
        yogas.extend(self._detect_career_yogas(chara_karakas, planets, ascendant_sign))
        
        # Detect Marriage Yogas (Darakaraka based)
        yogas.extend(self._detect_marriage_yogas(chara_karakas, planets, ascendant_sign))
        
        return yogas
    
    def _detect_karaka_raja_yogas(
        self,
        chara_karakas: Dict[str, Dict],
        planets: Dict[str, Dict],
        ascendant_sign: int,
        rashi_drishti: Dict[str, List[int]]
    ) -> List[JaiminiYogaResult]:
        """
        Detect K.N. Rao's 10 major Raja Yogas based on Karaka combinations.
        
        Raja Yogas occur when:
        1. Two karakas are in same sign (conjunction)
        2. Two karakas aspect each other (Rashi Drishti)
        """
        yogas = []
        
        # Define the 10 major Karaka combinations
        karaka_combinations = [
            ('Atmakaraka', 'Amatyakaraka', 'Supreme Raja Yoga - Self + Career'),
            ('Atmakaraka', 'Putrakaraka', 'Creative Power Yoga - Self + Children'),
            ('Atmakaraka', 'Darakaraka', 'Partnership Yoga - Self + Spouse'),
            ('Amatyakaraka', 'Putrakaraka', 'Career Success Yoga - Career + Creativity'),
            ('Amatyakaraka', 'Darakaraka', 'Professional Partnership Yoga'),
            ('Putrakaraka', 'Darakaraka', 'Creative Partnership Yoga'),
        ]
        
        # Check each combination
        for karaka1_name, karaka2_name, yoga_name in karaka_combinations:
            if karaka1_name not in chara_karakas or karaka2_name not in chara_karakas:
                continue
            
            karaka1 = chara_karakas[karaka1_name]
            karaka2 = chara_karakas[karaka2_name]
            
            planet1 = karaka1['planet']
            planet2 = karaka2['planet']
            
            sign1 = planets[planet1]['sign_number']
            sign2 = planets[planet2]['sign_number']
            
            # Check for conjunction (same sign)
            if sign1 == sign2:
                yogas.append(JaiminiYogaResult(
                    name=yoga_name,
                    type='raja',
                    strength='very_strong',
                    description=f'{karaka1_name} ({planet1}) and {karaka2_name} ({planet2}) are conjunct in same sign',
                    karakas_involved=[karaka1_name, karaka2_name],
                    planets_involved=[planet1, planet2],
                    conditions_met=['Conjunction in same sign'],
                    effects='Strong success, power, and achievement in related life areas'
                ))

            # Check for mutual aspect (Rashi Drishti)
            elif self._signs_aspect_each_other(sign1, sign2, rashi_drishti):
                yogas.append(JaiminiYogaResult(
                    name=yoga_name,
                    type='raja',
                    strength='strong',
                    description=f'{karaka1_name} ({planet1}) and {karaka2_name} ({planet2}) aspect each other',
                    karakas_involved=[karaka1_name, karaka2_name],
                    planets_involved=[planet1, planet2],
                    conditions_met=['Mutual Rashi Drishti'],
                    effects='Success and achievement through cooperation and mutual support'
                ))

        return yogas

    def _detect_special_yogas(
        self,
        planets: Dict[str, Dict],
        rashi_drishti: Dict[str, List[int]]
    ) -> List[JaiminiYogaResult]:
        """
        Detect special Jaimini yogas (Moon-Venus, etc.).
        """
        yogas = []

        # Moon-Venus Raja Yoga
        if 'Moon' in planets and 'Venus' in planets:
            moon_sign = planets['Moon']['sign_number']
            venus_sign = planets['Venus']['sign_number']

            # Conjunction
            if moon_sign == venus_sign:
                yogas.append(JaiminiYogaResult(
                    name='Moon-Venus Raja Yoga',
                    type='raja',
                    strength='very_strong',
                    description='Moon and Venus conjunct - exceptional charm and prosperity',
                    karakas_involved=[],
                    planets_involved=['Moon', 'Venus'],
                    conditions_met=['Moon-Venus conjunction'],
                    effects='Exceptional charm, beauty, wealth, artistic talents, and social success'
                ))

            # Mutual aspect
            elif self._signs_aspect_each_other(moon_sign, venus_sign, rashi_drishti):
                yogas.append(JaiminiYogaResult(
                    name='Moon-Venus Raja Yoga',
                    type='raja',
                    strength='strong',
                    description='Moon and Venus in mutual aspect - charm and prosperity',
                    karakas_involved=[],
                    planets_involved=['Moon', 'Venus'],
                    conditions_met=['Moon-Venus mutual aspect'],
                    effects='Charm, artistic talents, wealth, and social grace'
                ))

        # Moon aspected by multiple planets (K.N. Rao's special yoga)
        if 'Moon' in planets:
            moon_sign = planets['Moon']['sign_number']
            aspecting_planets = []

            for planet_name, planet_data in planets.items():
                if planet_name != 'Moon' and planet_name in ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']:
                    planet_sign = planet_data['sign_number']
                    if self._sign_aspects_target(planet_sign, moon_sign, rashi_drishti):
                        aspecting_planets.append(planet_name)

            if len(aspecting_planets) >= 3:
                yogas.append(JaiminiYogaResult(
                    name='Multi-Planet Moon Aspect Yoga',
                    type='raja',
                    strength='very_strong',
                    description=f'Moon aspected by {len(aspecting_planets)} planets: {", ".join(aspecting_planets)}',
                    karakas_involved=[],
                    planets_involved=['Moon'] + aspecting_planets,
                    conditions_met=[f'{len(aspecting_planets)} planets aspecting Moon'],
                    effects='Excellent Raja Yoga - fame, power, wealth, and recognition'
                ))

        return yogas

    def _detect_career_yogas(
        self,
        chara_karakas: Dict[str, Dict],
        planets: Dict[str, Dict],
        ascendant_sign: int
    ) -> List[JaiminiYogaResult]:
        """
        Detect career-related yogas based on Amatyakaraka position.
        """
        yogas = []

        if 'Amatyakaraka' not in chara_karakas or 'Atmakaraka' not in chara_karakas:
            return yogas

        amk = chara_karakas['Amatyakaraka']
        ak = chara_karakas['Atmakaraka']

        amk_planet = amk['planet']
        ak_planet = ak['planet']

        amk_sign = planets[amk_planet]['sign_number']
        ak_sign = planets[ak_planet]['sign_number']

        # Calculate house position of AmK from AK
        house_from_ak = ((amk_sign - ak_sign) % 12) + 1

        # AmK in Kendra from AK - Easy success
        if house_from_ak in self.KENDRA_HOUSES:
            yogas.append(JaiminiYogaResult(
                name='Amatyakaraka in Kendra from Atmakaraka',
                type='career',
                strength='strong',
                description=f'Amatyakaraka ({amk_planet}) in Kendra from Atmakaraka ({ak_planet})',
                karakas_involved=['Amatyakaraka', 'Atmakaraka'],
                planets_involved=[amk_planet, ak_planet],
                conditions_met=['AmK in Kendra from AK'],
                effects='Easy career success, recognition, and achievement with minimal struggle'
            ))

        # AmK in Trikona from AK - Fortunate career
        elif house_from_ak in self.TRIKONA_HOUSES:
            yogas.append(JaiminiYogaResult(
                name='Amatyakaraka in Trikona from Atmakaraka',
                type='career',
                strength='strong',
                description=f'Amatyakaraka ({amk_planet}) in Trikona from Atmakaraka ({ak_planet})',
                karakas_involved=['Amatyakaraka', 'Atmakaraka'],
                planets_involved=[amk_planet, ak_planet],
                conditions_met=['AmK in Trikona from AK'],
                effects='Fortunate career, dharmic work, and fulfilling professional life'
            ))

        # AmK in 6th/8th/12th from AK - Struggles
        elif house_from_ak in [6, 8, 12]:
            yogas.append(JaiminiYogaResult(
                name='Amatyakaraka in Dusthana from Atmakaraka',
                type='career',
                strength='weak',
                description=f'Amatyakaraka ({amk_planet}) in {house_from_ak}th house from Atmakaraka ({ak_planet})',
                karakas_involved=['Amatyakaraka', 'Atmakaraka'],
                planets_involved=[amk_planet, ak_planet],
                conditions_met=['AmK in Dusthana from AK'],
                effects='Career struggles, obstacles, and need for persistent effort'
            ))

        return yogas

    def _detect_marriage_yogas(
        self,
        chara_karakas: Dict[str, Dict],
        planets: Dict[str, Dict],
        ascendant_sign: int
    ) -> List[JaiminiYogaResult]:
        """
        Detect marriage-related yogas based on Darakaraka position.
        """
        yogas = []

        if 'Darakaraka' not in chara_karakas:
            return yogas

        dk = chara_karakas['Darakaraka']
        dk_planet = dk['planet']
        dk_sign = planets[dk_planet]['sign_number']

        # Calculate house position of DK from Lagna
        house_from_lagna = ((dk_sign - ascendant_sign) % 12) + 1

        # DK in 7th house - Strong marriage yoga
        if house_from_lagna == 7:
            yogas.append(JaiminiYogaResult(
                name='Darakaraka in 7th House',
                type='marriage',
                strength='very_strong',
                description=f'Darakaraka ({dk_planet}) in 7th house - excellent for marriage',
                karakas_involved=['Darakaraka'],
                planets_involved=[dk_planet],
                conditions_met=['DK in 7th house'],
                effects='Strong, harmonious, and fulfilling marriage partnership'
            ))

        # DK in Kendra - Good marriage prospects
        elif house_from_lagna in self.KENDRA_HOUSES:
            yogas.append(JaiminiYogaResult(
                name='Darakaraka in Kendra',
                type='marriage',
                strength='strong',
                description=f'Darakaraka ({dk_planet}) in Kendra ({house_from_lagna}th house)',
                karakas_involved=['Darakaraka'],
                planets_involved=[dk_planet],
                conditions_met=['DK in Kendra'],
                effects='Good marriage prospects, supportive spouse, and stable partnership'
            ))

        return yogas

    def _signs_aspect_each_other(
        self,
        sign1: int,
        sign2: int,
        rashi_drishti: Dict[str, List[int]]
    ) -> bool:
        """
        Check if two signs aspect each other mutually.

        Args:
            sign1: First sign number (1-12)
            sign2: Second sign number (1-12)
            rashi_drishti: Dictionary of sign aspects

        Returns:
            True if signs aspect each other mutually
        """
        # Check if sign1 aspects sign2
        sign1_aspects = rashi_drishti.get(str(sign1), [])
        sign1_aspects_sign2 = sign2 in sign1_aspects

        # Check if sign2 aspects sign1
        sign2_aspects = rashi_drishti.get(str(sign2), [])
        sign2_aspects_sign1 = sign1 in sign2_aspects

        # Mutual aspect requires both
        return sign1_aspects_sign2 and sign2_aspects_sign1

    def _sign_aspects_target(
        self,
        source_sign: int,
        target_sign: int,
        rashi_drishti: Dict[str, List[int]]
    ) -> bool:
        """
        Check if source sign aspects target sign.

        Args:
            source_sign: Source sign number (1-12)
            target_sign: Target sign number (1-12)
            rashi_drishti: Dictionary of sign aspects

        Returns:
            True if source aspects target
        """
        source_aspects = rashi_drishti.get(str(source_sign), [])
        return target_sign in source_aspects

