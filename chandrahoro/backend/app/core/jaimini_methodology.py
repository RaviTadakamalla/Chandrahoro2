"""Jaimini Astrology Methodology Implementation.

This module implements the Jaimini system using Swiss Ephemeris for astronomical calculations
and Jaimini-specific rules for Chara Karakas, Arudha Padas, Rashi Drishti, and Chara Dasha.

Copyright (C) 2025 ChandraHoro Development Team

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.base_methodology import (
    AstrologyMethodology,
    BirthData,
    CalculationPreferences,
    MethodologyRegistry
)

# Import existing calculation modules
from app.core.ephemeris import EphemerisCalculator
from app.core.jaimini_chara_dasha import calculate_chara_dasha
from app.core.jaimini_yogas import JaiminiYogaDetector
from app.core.jaimini_interpretation import JaiminiInterpreter


class JaiminiPreferences(CalculationPreferences):
    """Preferences specific to Jaimini methodology."""
    methodology: str = "jaimini"
    ayanamsha: str = "Lahiri"  # Jaimini typically uses Lahiri
    house_system: str = "Whole Sign"  # Jaimini uses whole sign houses
    chart_style: str = "South Indian"
    enable_chara_karakas: bool = True
    enable_arudha_padas: bool = True
    enable_chara_dasha: bool = True
    enable_rashi_drishti: bool = True


# Karaka order (based on degrees, highest to lowest)
KARAKA_NAMES = [
    'Atmakaraka',      # Self, soul
    'Amatyakaraka',    # Career, minister
    'Bhratrikaraka',   # Siblings, courage
    'Matrikaraka',     # Mother, education
    'Putrakaraka',     # Children, creativity
    'Gnatikaraka',     # Enemies, obstacles
    'Darakaraka'       # Spouse, relationships
]

# Planets eligible for Chara Karakas (excluding Rahu/Ketu)
KARAKA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

# Sign classification for Rashi Drishti
MOVABLE_SIGNS = [1, 4, 7, 10]  # Aries, Cancer, Libra, Capricorn
FIXED_SIGNS = [2, 5, 8, 11]    # Taurus, Leo, Scorpio, Aquarius
DUAL_SIGNS = [3, 6, 9, 12]     # Gemini, Virgo, Sagittarius, Pisces


class JaiminiMethodology(AstrologyMethodology):
    """
    Jaimini Astrology Methodology.
    
    Jaimini is a sign-based system that uses Chara Karakas (variable significators),
    Arudha Padas (material manifestations), Rashi Drishti (sign aspects),
    and Chara Dasha (sign-based dasha system).
    """
    
    def get_name(self) -> str:
        """Return methodology identifier."""
        return "jaimini"
    
    def get_display_name(self) -> str:
        """Return human-readable name."""
        return "Jaimini System"
    
    def get_supported_features(self) -> List[str]:
        """Return list of supported features."""
        return [
            "planetary_positions",
            "houses",
            "ascendant",
            "chara_karakas",      # 7 variable significators
            "karakamsha",         # Atmakaraka's Navamsa position
            "arudha_padas",       # AL, A1-A12, UL
            "rashi_drishti",      # Sign-based aspects
            "chara_dasha",        # Sign-based dasha system
            "jaimini_yogas",      # Jaimini-specific yogas
            "pada_lagna",         # Special lagnas
        ]
    
    def validate_preferences(self, preferences: CalculationPreferences) -> bool:
        """Validate preferences for Jaimini methodology."""
        if not isinstance(preferences, JaiminiPreferences):
            # Try to convert
            try:
                preferences = JaiminiPreferences(**preferences.model_dump())
            except Exception as e:
                raise ValueError(f"Invalid preferences for Jaimini methodology: {e}")
        
        # Jaimini typically uses whole sign houses
        if preferences.house_system not in ["Whole Sign", "Equal"]:
            raise ValueError("Jaimini methodology typically uses Whole Sign or Equal house system")
        
        return True
    
    def calculate_chart(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """
        Calculate complete Jaimini chart.
        
        This includes planetary positions, Chara Karakas, Arudha Padas,
        Rashi Drishti, and Chara Dasha.
        """
        # Validate preferences
        self.validate_preferences(preferences)
        
        if not isinstance(preferences, JaiminiPreferences):
            preferences = JaiminiPreferences(**preferences.model_dump())
        
        # Initialize ephemeris calculator
        ayanamsha = preferences.ayanamsha if hasattr(preferences, 'ayanamsha') else "Lahiri"
        ephemeris = EphemerisCalculator(ayanamsha=ayanamsha)

        # Calculate planetary positions
        planets = ephemeris.calculate_all_planets(birth_data.date)

        # Calculate ascendant and houses
        ascendant_data = ephemeris.calculate_ascendant(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            house_system=preferences.house_system
        )

        # Calculate Jaimini-specific data
        jaimini_data = self._calculate_jaimini_specifics(
            planets, ascendant_data, birth_data, ephemeris, preferences
        )

        # Build result
        birth_data_dict = birth_data.model_dump()
        if "date" in birth_data_dict and isinstance(birth_data_dict["date"], datetime):
            birth_data_dict["date"] = birth_data_dict["date"].isoformat()

        result = {
            "methodology": "jaimini",
            "birth_data": birth_data_dict,
            "preferences": preferences.model_dump(),
            "planets": planets,
            "ascendant": ascendant_data,
            "jaimini_data": jaimini_data,
            "calculation_timestamp": datetime.utcnow().isoformat(),
        }

        return result

    def _calculate_jaimini_specifics(
        self,
        planets: Dict,
        ascendant_data: Dict,
        birth_data: BirthData,
        ephemeris: EphemerisCalculator,
        preferences: JaiminiPreferences
    ) -> Dict[str, Any]:
        """Calculate Jaimini-specific data: Chara Karakas, Arudha Padas, Sthira Karakas, Yogas, etc."""
        jaimini_specifics = {}

        # Calculate Chara Karakas
        if preferences.enable_chara_karakas:
            karakas = self._calculate_chara_karakas(planets)
            jaimini_specifics['chara_karakas'] = karakas

            # Calculate Karakamsha (Atmakaraka's Navamsa position)
            atmakaraka = karakas['Atmakaraka']
            karakamsha = self._calculate_karakamsha(atmakaraka, ephemeris, birth_data)
            jaimini_specifics['karakamsha'] = karakamsha

        # Calculate Sthira Karakas (Fixed Significators) - K.N. Rao's method
        sthira_karakas = self._calculate_sthira_karakas(planets, ascendant_data)
        jaimini_specifics['sthira_karakas'] = sthira_karakas

        # Calculate Arudha Padas
        if preferences.enable_arudha_padas:
            arudha_padas = self._calculate_arudha_padas(planets, ascendant_data)
            jaimini_specifics['arudha_padas'] = arudha_padas

        # Calculate Rashi Drishti (sign aspects)
        if preferences.enable_rashi_drishti:
            rashi_drishti = self._calculate_rashi_drishti()
            jaimini_specifics['rashi_drishti'] = rashi_drishti
        else:
            rashi_drishti = {}

        # Calculate Chara Dasha
        if preferences.enable_chara_dasha:
            lagna_sign = ascendant_data.get('sign_number', 1)
            chara_dasha = calculate_chara_dasha(
                birth_date=birth_data.date,
                lagna_sign=lagna_sign,
                planetary_positions=planets
            )
            jaimini_specifics['chara_dasha'] = chara_dasha

        # Calculate Jaimini Yogas - K.N. Rao's method
        if preferences.enable_chara_karakas and preferences.enable_rashi_drishti:
            yoga_detector = JaiminiYogaDetector()
            lagna_sign = ascendant_data.get('sign_number', 1)

            # Detect all Jaimini yogas
            yogas = yoga_detector.detect_all_jaimini_yogas(
                chara_karakas=jaimini_specifics.get('chara_karakas', {}),
                planets=planets,
                ascendant_sign=lagna_sign,
                rashi_drishti=rashi_drishti
            )

            # Convert yoga objects to dictionaries for JSON serialization
            jaimini_specifics['jaimini_yogas'] = [
                {
                    'name': yoga.name,
                    'type': yoga.type,
                    'strength': yoga.strength,
                    'description': yoga.description,
                    'karakas_involved': yoga.karakas_involved,
                    'planets_involved': yoga.planets_involved,
                    'conditions_met': yoga.conditions_met,
                    'effects': yoga.effects
                }
                for yoga in yogas
            ]

        # Calculate Three-Dimensional Analysis - K.N. Rao's method
        if (preferences.enable_chara_karakas and
            preferences.enable_arudha_padas and
            'chara_karakas' in jaimini_specifics and
            'karakamsha' in jaimini_specifics and
            'arudha_padas' in jaimini_specifics):

            interpreter = JaiminiInterpreter()
            three_dimensional_analysis = interpreter.perform_three_dimensional_analysis(
                birth_date=birth_data.date,
                chara_karakas=jaimini_specifics['chara_karakas'],
                karakamsha=jaimini_specifics['karakamsha'],
                arudha_padas=jaimini_specifics['arudha_padas']
            )
            jaimini_specifics['three_dimensional_analysis'] = three_dimensional_analysis

        return jaimini_specifics

    def _calculate_chara_karakas(self, planets: Dict) -> Dict[str, Dict]:
        """
        Calculate Chara Karakas (variable significators).

        Chara Karakas are determined by planetary degrees (highest to lowest).
        Only 7 planets are used (Sun through Saturn, excluding Rahu/Ketu).

        Returns:
            Dictionary mapping karaka names to planet data
        """
        # Get degrees for eligible planets
        planet_degrees = []
        for planet_name in KARAKA_PLANETS:
            if planet_name in planets:
                planet_data = planets[planet_name]
                # Use absolute longitude (0-360)
                longitude = planet_data.get('sidereal_longitude', 0)
                # Convert to degrees within sign (0-30) for comparison
                degree_in_sign = longitude % 30
                planet_degrees.append({
                    'name': planet_name,
                    'longitude': longitude,
                    'degree_in_sign': degree_in_sign,
                    'sign_number': planet_data.get('sign_number', 1),
                    'data': planet_data
                })

        # Sort by degree_in_sign (descending)
        planet_degrees.sort(key=lambda x: x['degree_in_sign'], reverse=True)

        # Assign karakas
        karakas = {}
        for i, karaka_name in enumerate(KARAKA_NAMES):
            if i < len(planet_degrees):
                planet = planet_degrees[i]
                karakas[karaka_name] = {
                    'planet': planet['name'],
                    'degree_in_sign': planet['degree_in_sign'],
                    'sign_number': planet['sign_number'],
                    'longitude': planet['longitude']
                }

        return karakas

    def _calculate_karakamsha(
        self,
        atmakaraka: Dict,
        ephemeris: EphemerisCalculator,
        birth_data: BirthData
    ) -> Dict[str, Any]:
        """
        Calculate Karakamsha (Atmakaraka's Navamsa position).

        Karakamsha is the Navamsa sign where Atmakaraka is placed.
        It's used for spiritual and karmic analysis.

        Args:
            atmakaraka: Atmakaraka data from chara_karakas
            ephemeris: Ephemeris calculator
            birth_data: Birth data

        Returns:
            Dictionary with Karakamsha sign and related data
        """
        # Calculate Navamsa (D9) position
        longitude = atmakaraka['longitude']

        # Navamsa calculation: divide each sign into 9 parts
        # Each part is 3°20' (30°/9 = 3.333...)
        sign_number = int(longitude / 30) + 1
        degree_in_sign = longitude % 30
        navamsa_part = int(degree_in_sign / (30/9))  # 0-8

        # Calculate Navamsa sign
        # Formula varies by sign type (movable, fixed, dual)
        if sign_number in MOVABLE_SIGNS:
            navamsa_sign = ((sign_number - 1) + navamsa_part) % 12 + 1
        elif sign_number in FIXED_SIGNS:
            navamsa_sign = ((sign_number - 1) + 8 + navamsa_part) % 12 + 1
        else:  # DUAL_SIGNS
            navamsa_sign = ((sign_number - 1) + 4 + navamsa_part) % 12 + 1

        sign_names = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]

        return {
            'planet': atmakaraka['planet'],
            'navamsa_sign_number': navamsa_sign,
            'navamsa_sign_name': sign_names[navamsa_sign - 1],
            'rasi_sign_number': sign_number,
            'rasi_sign_name': sign_names[sign_number - 1]
        }

    def _calculate_sthira_karakas(self, planets: Dict, ascendant_data: Dict) -> Dict[str, Any]:
        """
        Calculate Sthira Karakas (Fixed Significators) - K.N. Rao's Method.

        Sthira Karakas are fixed planetary significators for specific life areas,
        used alongside Chara Karakas for comprehensive analysis.

        K.N. Rao's Sthira Karaka System:
        - Sun: Lagna (1st house), Father (stronger of Sun/Venus)
        - Moon: 4th house, Mother (stronger of Moon/Venus)
        - Mars: 3rd & 6th houses, Younger siblings, Mother
        - Mercury: 10th house, Uncles/Aunts
        - Jupiter: 2nd, 5th, 9th, 11th houses, Paternal grandfather
        - Venus: 7th house, Husband, Father/Mother (when stronger)
        - Saturn: 8th & 12th houses, Sons
        - Rahu: Paternal/maternal male grandparents
        - Ketu: Paternal/maternal female grandparents

        Returns:
            Dictionary mapping each planet to its fixed significations
        """
        sthira_karakas = {
            'Sun': {
                'planet': 'Sun',
                'houses': [1],
                'significations': ['Self', 'Lagna', 'Father (if stronger than Venus)'],
                'life_areas': ['Identity', 'Personality', 'Paternal lineage'],
                'position': planets.get('Sun', {})
            },
            'Moon': {
                'planet': 'Moon',
                'houses': [4],
                'significations': ['4th house', 'Mother (if stronger than Venus)', 'Emotions'],
                'life_areas': ['Home', 'Mother', 'Emotional well-being', 'Property'],
                'position': planets.get('Moon', {})
            },
            'Mars': {
                'planet': 'Mars',
                'houses': [3, 6],
                'significations': ['3rd house', '6th house', 'Younger siblings', 'Mother (secondary)'],
                'life_areas': ['Courage', 'Siblings', 'Enemies', 'Diseases', 'Accidents'],
                'position': planets.get('Mars', {})
            },
            'Mercury': {
                'planet': 'Mercury',
                'houses': [10],
                'significations': ['10th house', 'Uncles', 'Aunts', 'Maternal relatives'],
                'life_areas': ['Career', 'Profession', 'Communication', 'Extended family'],
                'position': planets.get('Mercury', {})
            },
            'Jupiter': {
                'planet': 'Jupiter',
                'houses': [2, 5, 9, 11],
                'significations': ['2nd, 5th, 9th, 11th houses', 'Paternal grandfather', 'Wisdom'],
                'life_areas': ['Wealth', 'Children', 'Dharma', 'Gains', 'Spiritual guidance'],
                'position': planets.get('Jupiter', {})
            },
            'Venus': {
                'planet': 'Venus',
                'houses': [7],
                'significations': ['7th house', 'Husband', 'Father (if stronger)', 'Mother (if stronger)'],
                'life_areas': ['Marriage', 'Spouse', 'Partnerships', 'Luxury', 'Comfort'],
                'position': planets.get('Venus', {})
            },
            'Saturn': {
                'planet': 'Saturn',
                'houses': [8, 12],
                'significations': ['8th house', '12th house', 'Sons', 'Longevity'],
                'life_areas': ['Longevity', 'Obstacles', 'Losses', 'Spirituality', 'Children (sons)'],
                'position': planets.get('Saturn', {})
            },
            'Rahu': {
                'planet': 'Rahu',
                'houses': [],
                'significations': ['Paternal grandfather (male)', 'Maternal grandfather (male)'],
                'life_areas': ['Grandparents (male)', 'Illusions', 'Foreign connections'],
                'position': planets.get('Rahu', {})
            },
            'Ketu': {
                'planet': 'Ketu',
                'houses': [],
                'significations': ['Paternal grandmother (female)', 'Maternal grandmother (female)'],
                'life_areas': ['Grandparents (female)', 'Spirituality', 'Moksha'],
                'position': planets.get('Ketu', {})
            }
        }

        # Determine stronger planet for Father/Mother signification
        sun_strength = self._calculate_planet_strength(planets.get('Sun', {}))
        venus_strength = self._calculate_planet_strength(planets.get('Venus', {}))
        moon_strength = self._calculate_planet_strength(planets.get('Moon', {}))

        # Add notes about which planet is stronger for Father/Mother
        sthira_karakas['father_significator'] = 'Sun' if sun_strength > venus_strength else 'Venus'
        sthira_karakas['mother_significator'] = 'Moon' if moon_strength > venus_strength else 'Venus'

        return sthira_karakas

    def _calculate_planet_strength(self, planet_data: Dict) -> float:
        """
        Calculate simple strength score for a planet.

        Factors:
        - Degree (higher degree = stronger)
        - Retrograde status (retrograde = stronger)

        Returns:
            Strength score (0-100)
        """
        if not planet_data:
            return 0.0

        strength = 0.0

        # Degree strength (0-30 degrees in sign)
        degree = planet_data.get('degree_in_sign', 0)
        strength += degree  # 0-30 points

        # Retrograde bonus
        if planet_data.get('retrograde', False):
            strength += 10  # +10 points for retrograde

        # Longitude-based strength (higher absolute degree)
        longitude = planet_data.get('sidereal_longitude', 0)
        strength += (longitude % 30)  # 0-30 points

        return strength

    def _calculate_arudha_padas(self, planets: Dict, ascendant_data: Dict) -> Dict[str, Any]:
        """
        Calculate Arudha Padas (material manifestations of houses).

        K.N. Rao's Method:
        1. Count from house to its lord (direct counting)
        2. Count same distance again from the lord
        3. Result is the Arudha Pada of that house

        Exception Rules (Varanasi tradition):
        - If lord is in own house → Pada is 10th from that house
        - If pada falls in same house or 7th from it → Use 10th from pada

        Returns:
            Dictionary with AL (Arudha Lagna), UL (Upapada Lagna), and A1-A12
        """
        # Sign names for reference
        sign_names = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]

        # Sign lords (1-based indexing)
        sign_lords = {
            1: 'Mars',      # Aries
            2: 'Venus',     # Taurus
            3: 'Mercury',   # Gemini
            4: 'Moon',      # Cancer
            5: 'Sun',       # Leo
            6: 'Mercury',   # Virgo
            7: 'Venus',     # Libra
            8: 'Mars',      # Scorpio
            9: 'Jupiter',   # Sagittarius
            10: 'Saturn',   # Capricorn
            11: 'Saturn',   # Aquarius
            12: 'Jupiter'   # Pisces
        }

        # Get ascendant sign (1-based)
        lagna_sign = ascendant_data.get('sign_number', 1)

        # Get planet positions (sign numbers, 1-based)
        planet_signs = {}
        for planet_name, planet_data in planets.items():
            if planet_name in ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']:
                sign_num = planet_data.get('sign_number', 1)
                planet_signs[planet_name] = sign_num

        def calculate_pada_for_house(house_num: int) -> Dict[str, Any]:
            """
            Calculate Arudha Pada for a specific house.

            Args:
                house_num: House number (1-12)

            Returns:
                Dictionary with sign_number and sign_name
            """
            # Calculate the sign of this house (1-based)
            house_sign = ((lagna_sign - 1 + house_num - 1) % 12) + 1

            # Get the lord of this house
            house_lord = sign_lords[house_sign]

            # Get the sign where the lord is placed
            lord_sign = planet_signs.get(house_lord, house_sign)

            # Count from house to lord (direct counting, 1-based)
            # Distance = (lord_sign - house_sign) mod 12
            distance = ((lord_sign - house_sign) % 12)
            if distance == 0:
                distance = 12  # Lord in own house

            # Count same distance from lord
            pada_sign = ((lord_sign - 1 + distance) % 12) + 1

            # Apply exception rules
            # Rule 1: If pada is same as house or 7th from house, use 10th from pada
            if pada_sign == house_sign or pada_sign == ((house_sign + 6 - 1) % 12) + 1:
                pada_sign = ((pada_sign + 9 - 1) % 12) + 1  # 10th from pada

            # Rule 2: If lord is in own house (distance = 12), pada is 10th from house
            if distance == 12:
                pada_sign = ((house_sign + 9 - 1) % 12) + 1  # 10th from house

            return {
                'sign_number': pada_sign,
                'sign_name': sign_names[pada_sign - 1],
                'house_sign': house_sign,
                'house_sign_name': sign_names[house_sign - 1],
                'lord': house_lord,
                'lord_sign': lord_sign,
                'lord_sign_name': sign_names[lord_sign - 1]
            }

        # Calculate all 12 Arudha Padas
        arudha_padas = {}

        for house in range(1, 13):
            pada = calculate_pada_for_house(house)
            pada_key = f'A{house}'
            arudha_padas[pada_key] = pada

        # Special names for important padas
        # AL (Arudha Lagna) = A1 (Pada of 1st house)
        arudha_padas['AL'] = arudha_padas['A1']

        # UL (Upapada Lagna) = A12 (Pada of 12th house)
        arudha_padas['UL'] = arudha_padas['A12']

        return arudha_padas

    def _calculate_rashi_drishti(self) -> Dict[str, List[int]]:
        """
        Calculate Rashi Drishti (sign-based aspects).

        Jaimini aspects are sign-based, not degree-based:
        - Movable signs (1,4,7,10) aspect fixed signs (2,5,8,11) except adjacent
        - Fixed signs (2,5,8,11) aspect dual signs (3,6,9,12) except adjacent
        - Dual signs (3,6,9,12) aspect movable signs (1,4,7,10) except adjacent

        Returns:
            Dictionary mapping each sign to list of signs it aspects
        """
        drishti = {}

        for sign in range(1, 13):
            aspected_signs = []

            if sign in MOVABLE_SIGNS:
                # Movable aspects fixed (except adjacent)
                for target in FIXED_SIGNS:
                    if abs(target - sign) not in [1, 11]:  # Not adjacent
                        aspected_signs.append(target)

            elif sign in FIXED_SIGNS:
                # Fixed aspects dual (except adjacent)
                for target in DUAL_SIGNS:
                    if abs(target - sign) not in [1, 11]:  # Not adjacent
                        aspected_signs.append(target)

            else:  # DUAL_SIGNS
                # Dual aspects movable (except adjacent)
                for target in MOVABLE_SIGNS:
                    if abs(target - sign) not in [1, 11]:  # Not adjacent
                        aspected_signs.append(target)

            sign_names = [
                'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
            ]

            drishti[sign_names[sign - 1]] = [sign_names[s - 1] for s in aspected_signs]

        return drishti


# Register Jaimini methodology
_jaimini_instance = JaiminiMethodology()
MethodologyRegistry.register(_jaimini_instance)

