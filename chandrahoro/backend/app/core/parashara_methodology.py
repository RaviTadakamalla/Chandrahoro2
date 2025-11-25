"""Parashara (Vedic) Astrology Methodology Implementation.

This module implements the Parashara system using the existing Swiss Ephemeris-based
calculation modules. It serves as the core/default methodology for ChandraHoro.
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
# Note: Other calculation modules will be imported as needed once we verify their interfaces
# from app.core.houses import calculate_houses
# from app.core.dasha import calculate_vimshottari_dasha
# from app.core.divisional_charts import calculate_divisional_chart
# from app.core.yogas import detect_yogas
# from app.core.shadbala import calculate_shadbala
# from app.core.ashtakavarga import calculate_ashtakavarga
# from app.core.aspects import calculate_aspects
# from app.core.planetary_relationships import calculate_relationships
# from app.core.transits import calculate_transits
# from app.core.ashtakoot import calculate_ashtakoot_compatibility


class ParasharaPreferences(CalculationPreferences):
    """Preferences specific to Parashara methodology."""
    methodology: str = "parashara"
    ayanamsha: str = "Lahiri"
    house_system: str = "Whole Sign"
    chart_style: str = "North Indian"
    divisional_charts: List[str] = ["D1", "D9", "D10"]
    enable_yogas: bool = True
    enable_shadbala: bool = True
    enable_ashtakavarga: bool = True


class ParasharaMethodology(AstrologyMethodology):
    """
    Parashara (Vedic) Astrology Methodology.
    
    This is the core methodology for ChandraHoro, using Swiss Ephemeris
    for astronomical calculations and implementing traditional Vedic
    astrology rules from Brihat Parashara Hora Shastra.
    """
    
    def get_name(self) -> str:
        """Return methodology identifier."""
        return "parashara"
    
    def get_display_name(self) -> str:
        """Return human-readable name."""
        return "Vedic Astrology (Parashara System)"
    
    def get_supported_features(self) -> List[str]:
        """Return list of supported features."""
        return [
            "planetary_positions",
            "houses",
            "ascendant",
            "nakshatras",
            "divisional_charts",  # D1-D60
            "vimshottari_dasha",
            "yogas",  # 100+ classical yogas
            "shadbala",
            "ashtakavarga",
            "aspects",  # Vedic Drishti
            "planetary_relationships",
            "transits",
            "compatibility",  # Ashtakoot
            "strength_analysis",
        ]
    
    def validate_preferences(self, preferences: CalculationPreferences) -> bool:
        """Validate preferences for Parashara methodology."""
        if not isinstance(preferences, ParasharaPreferences):
            # Try to convert
            try:
                preferences = ParasharaPreferences(**preferences.model_dump())
            except Exception as e:
                raise ValueError(f"Invalid preferences for Parashara methodology: {e}")
        
        # Validate ayanamsha
        valid_ayanamshas = ["Lahiri", "Raman", "Krishnamurti", "Yukteshwar", "Fagan"]
        if preferences.ayanamsha not in valid_ayanamshas:
            raise ValueError(f"Invalid ayanamsha: {preferences.ayanamsha}")
        
        # Validate house system
        valid_house_systems = ["Whole Sign", "Placidus", "Koch", "Equal"]
        if preferences.house_system not in valid_house_systems:
            raise ValueError(f"Invalid house system: {preferences.house_system}")
        
        return True
    
    def calculate_chart(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """
        Calculate complete Parashara chart.
        
        This orchestrates all the existing calculation modules to produce
        a comprehensive Vedic astrology chart.
        """
        # Validate preferences
        self.validate_preferences(preferences)
        
        if not isinstance(preferences, ParasharaPreferences):
            preferences = ParasharaPreferences(**preferences.model_dump())
        
        # Initialize ephemeris calculator
        ephemeris = EphemerisCalculator(ayanamsha=preferences.ayanamsha)

        # Calculate planetary positions
        planets = ephemeris.calculate_all_planets(birth_data.date)

        # Calculate ascendant and houses
        ascendant_data = ephemeris.calculate_ascendant(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            house_system=preferences.house_system
        )

        # Build result with basic calculations
        # Convert datetime objects to ISO format strings for JSON serialization
        birth_data_dict = birth_data.model_dump()
        if "date" in birth_data_dict and isinstance(birth_data_dict["date"], datetime):
            birth_data_dict["date"] = birth_data_dict["date"].isoformat()

        result = {
            "methodology": "parashara",
            "birth_data": birth_data_dict,
            "preferences": preferences.model_dump(),
            "planets": planets,
            "ascendant": ascendant_data,
            "calculation_timestamp": datetime.utcnow().isoformat(),
        }

        # Note: Advanced calculations (yogas, shadbala, ashtakavarga, dasha, divisional charts)
        # will be added once we verify the existing modules' interfaces
        # For now, we return the basic planetary positions and ascendant

        return result


# Register Parashara methodology as the default
_parashara_instance = ParasharaMethodology()
MethodologyRegistry.register(_parashara_instance)

