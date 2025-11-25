"""Western Astrology Methodology Implementation.

This module implements Western tropical astrology with modern aspects,
outer planets, and Western-specific features.
"""

from typing import Dict, Any, List
from datetime import datetime
from app.core.base_methodology import (
    AstrologyMethodology,
    MethodologyRegistry,
    BirthData,
    CalculationPreferences
)
from app.core.ephemeris import EphemerisCalculator
from app.core.western_aspects import WesternAspectCalculator
from app.core.western_dignities import DignityCalculator
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)


class WesternPreferences(CalculationPreferences):
    """Western astrology specific preferences."""
    methodology: str = "western"
    house_system: str = Field(default="Placidus", description="House system")
    include_outer_planets: bool = Field(default=True, description="Include Uranus, Neptune, Pluto")
    include_asteroids: bool = Field(default=False, description="Include Chiron, Ceres, etc.")
    include_minor_aspects: bool = Field(default=False, description="Include minor aspects")
    aspect_orb_type: str = Field(default="moderate", description="tight, moderate, or wide")


class WesternMethodology(AstrologyMethodology):
    """Western tropical astrology methodology."""
    
    def get_name(self) -> str:
        return "western"
    
    def get_display_name(self) -> str:
        return "Western Astrology (Tropical)"
    
    def get_supported_features(self) -> List[str]:
        return [
            "tropical_zodiac",
            "outer_planets",
            "western_aspects",
            "planetary_dignities",
            "chart_patterns",
            "element_balance",
            "asteroids",
        ]
    
    def validate_preferences(self, preferences: CalculationPreferences) -> bool:
        """Validate Western-specific preferences."""
        if preferences.methodology != "western":
            raise ValueError(f"Invalid methodology: {preferences.methodology}")
        
        # Validate house system
        valid_house_systems = ['Placidus', 'Koch', 'Equal', 'Campanus', 'Regiomontanus', 'Whole Sign']
        if hasattr(preferences, 'house_system'):
            if preferences.house_system not in valid_house_systems:
                raise ValueError(f"Invalid house system: {preferences.house_system}")
        
        return True
    
    def calculate_chart(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """
        Calculate complete Western astrology chart.
        
        Args:
            birth_data: Birth information
            preferences: Western-specific preferences
            
        Returns:
            Complete Western chart data
        """
        logger.info(f"Calculating Western chart for {birth_data.name}")
        
        # Validate preferences
        self.validate_preferences(preferences)
        
        # Convert to Western preferences if needed
        if not isinstance(preferences, WesternPreferences):
            western_prefs = WesternPreferences(**preferences.model_dump())
        else:
            western_prefs = preferences
        
        # Initialize ephemeris calculator for tropical zodiac
        ephemeris = EphemerisCalculator(ayanamsha='Lahiri', tropical=True)
        
        # Calculate planetary positions (tropical)
        planets = self._calculate_western_planets(ephemeris, birth_data, western_prefs)
        
        # Calculate ascendant and houses (tropical)
        ascendant_data = self._calculate_ascendant_houses(ephemeris, birth_data, western_prefs)
        
        # Assign houses to planets
        planets = self._assign_houses_to_planets(planets, ascendant_data)
        
        # Calculate Western-specific data
        western_data = self._calculate_western_specifics(
            planets, ascendant_data, birth_data, ephemeris, western_prefs
        )
        
        # Build result
        birth_data_dict = birth_data.model_dump()
        if "date" in birth_data_dict and isinstance(birth_data_dict["date"], datetime):
            birth_data_dict["date"] = birth_data_dict["date"].isoformat()
        
        result = {
            "methodology": "western",
            "zodiac_type": "tropical",
            "birth_data": birth_data_dict,
            "preferences": western_prefs.model_dump(),
            "planets": planets,
            "ascendant": ascendant_data,
            "western_data": western_data,
            "calculation_timestamp": datetime.utcnow().isoformat(),
        }
        
        logger.info(f"Western chart calculation complete for {birth_data.name}")
        return result
    
    def _calculate_western_planets(
        self,
        ephemeris: EphemerisCalculator,
        birth_data: BirthData,
        preferences: WesternPreferences
    ) -> List[Dict[str, Any]]:
        """Calculate all Western planets including outer planets."""
        
        # Traditional planets (Sun-Saturn)
        traditional_planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
        planets = []
        
        for planet_name in traditional_planets:
            planet_data = ephemeris.calculate_all_planets(birth_data.date)
            break  # calculate_all_planets returns all at once
        
        # Convert to list format
        for planet_name in traditional_planets:
            if planet_name in planet_data:
                planet_info = planet_data[planet_name]
                planet_info['name'] = planet_name
                planets.append(planet_info)

        # Add outer planets if requested
        if preferences.include_outer_planets:
            outer_planets = ephemeris.calculate_outer_planets(birth_data.date)
            planets.extend(outer_planets)

        # Add asteroids if requested
        if preferences.include_asteroids:
            asteroids = ephemeris.calculate_asteroids(birth_data.date)
            planets.extend(asteroids)

        return planets

    def _calculate_ascendant_houses(
        self,
        ephemeris: EphemerisCalculator,
        birth_data: BirthData,
        preferences: WesternPreferences
    ) -> Dict[str, Any]:
        """Calculate ascendant and house cusps."""

        ascendant_data = ephemeris.calculate_ascendant(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            house_system=preferences.house_system
        )

        return ascendant_data

    def _assign_houses_to_planets(
        self,
        planets: List[Dict[str, Any]],
        ascendant_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Assign house numbers to planets based on their positions."""

        houses = ascendant_data.get('houses', [])
        if not houses:
            # If no houses, assign based on whole sign from ascendant
            asc_sign = ascendant_data.get('sign_number', 0)
            for planet in planets:
                planet_sign = planet.get('sign_number', 0)
                house_num = ((planet_sign - asc_sign) % 12) + 1
                planet['house'] = house_num
        else:
            # Assign based on house cusps
            for planet in planets:
                planet_long = planet.get('longitude', 0)
                house_num = self._find_house_for_longitude(planet_long, houses)
                planet['house'] = house_num

        return planets

    def _find_house_for_longitude(self, longitude: float, houses: List[Dict]) -> int:
        """Find which house a longitude falls into."""

        for i, house in enumerate(houses):
            next_house = houses[(i + 1) % 12]
            cusp = house.get('cusp_longitude', 0)
            next_cusp = next_house.get('cusp_longitude', 0)

            # Handle wrap-around at 360/0 degrees
            if next_cusp < cusp:
                if longitude >= cusp or longitude < next_cusp:
                    return house.get('number', i + 1)
            else:
                if cusp <= longitude < next_cusp:
                    return house.get('number', i + 1)

        return 1  # Default to first house

    def _calculate_western_specifics(
        self,
        planets: List[Dict[str, Any]],
        ascendant_data: Dict[str, Any],
        birth_data: BirthData,
        ephemeris: EphemerisCalculator,
        preferences: WesternPreferences
    ) -> Dict[str, Any]:
        """Calculate Western-specific features."""

        western_specifics = {}

        # 1. Western Aspects
        aspect_calc = WesternAspectCalculator(
            include_minor=preferences.include_minor_aspects,
            orb_type=preferences.aspect_orb_type
        )
        aspects = aspect_calc.calculate_all_aspects(planets)
        western_specifics['aspects'] = aspects

        # 2. Planetary Dignities
        dignity_calc = DignityCalculator()
        dignities = dignity_calc.calculate_all_dignities(planets)
        western_specifics['dignities'] = dignities

        # 3. Chart Patterns (Grand Trine, T-Square, etc.)
        patterns = aspect_calc.detect_chart_patterns(planets, aspects)
        western_specifics['chart_patterns'] = patterns

        # 4. Element/Modality Balance
        balance = dignity_calc.calculate_element_modality_balance(planets)
        western_specifics['element_balance'] = balance

        return western_specifics


# Register Western methodology
_western_instance = WesternMethodology()
MethodologyRegistry.register(_western_instance)

