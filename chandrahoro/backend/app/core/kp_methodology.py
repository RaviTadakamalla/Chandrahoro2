"""Krishnamurti Paddhati (KP) Astrology Methodology Implementation.

This module implements the KP System using Swiss Ephemeris for astronomical calculations
and KP-specific rules for sub-lords, significators, and predictions.
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
from app.core.kp_significators import KPSignificatorCalculator
from app.core.kp_prediction import KPPredictionEngine


class KPPreferences(CalculationPreferences):
    """Preferences specific to KP methodology."""
    methodology: str = "kp"
    ayanamsha: str = "Krishnamurti"  # KP/Krishnamurti ayanamsha
    house_system: str = "Placidus"  # KP uses Placidus only
    chart_style: str = "South Indian"  # Traditional for KP
    enable_sub_lords: bool = True
    enable_significators: bool = True
    enable_ruling_planets: bool = True


# KP Sub-Lord Division Table
# Based on Vimshottari Dasha proportions
# Each nakshatra is divided into 9 sub-lords in the same proportion as Vimshottari Dasha
KP_SUB_LORD_PROPORTIONS = {
    'Ketu': 7,
    'Venus': 20,
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17,
}

# Total of all proportions = 120 years (Vimshottari cycle)
KP_TOTAL_PROPORTION = sum(KP_SUB_LORD_PROPORTIONS.values())  # 120

# Nakshatra lords (27 nakshatras, repeating pattern of 9 lords)
NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',  # 1-9
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',  # 10-18
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',  # 19-27
]


class KPMethodology(AstrologyMethodology):
    """
    Krishnamurti Paddhati (KP) Astrology Methodology.
    
    KP System is a stellar astrology system developed by Prof. K.S. Krishnamurti.
    It uses sub-lords (Star-Lord → Sub-Lord → Sub-Sub-Lord) for precise predictions.
    """
    
    def get_name(self) -> str:
        """Return methodology identifier."""
        return "kp"
    
    def get_display_name(self) -> str:
        """Return human-readable name."""
        return "Krishnamurti Paddhati (KP System)"
    
    def get_supported_features(self) -> List[str]:
        """Return list of supported features."""
        return [
            "planetary_positions",
            "houses",
            "ascendant",
            "nakshatras",
            "kp_cusps",  # KP house cusps (Placidus)
            "sub_lords",  # Star-Lord → Sub-Lord → Sub-Sub-Lord
            "ruling_planets",  # Day Lord, Ascendant Lord, Moon Lord, etc.
            "significators",  # 6-step significator method
            "kp_predictions",  # Event timing predictions
            "kp_transits",  # KP transit system
        ]
    
    def validate_preferences(self, preferences: CalculationPreferences) -> bool:
        """Validate preferences for KP methodology."""
        if not isinstance(preferences, KPPreferences):
            # Try to convert
            try:
                preferences = KPPreferences(**preferences.model_dump())
            except Exception as e:
                raise ValueError(f"Invalid preferences for KP methodology: {e}")

        # KP must use Krishnamurti ayanamsha
        if preferences.ayanamsha != "Krishnamurti":
            raise ValueError("KP methodology requires Krishnamurti ayanamsha")

        # KP must use Placidus house system
        if preferences.house_system != "Placidus":
            raise ValueError("KP methodology requires Placidus house system")

        return True
    
    def calculate_chart(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """
        Calculate complete KP chart.
        
        This includes planetary positions, cusps, sub-lords, and KP-specific calculations.
        """
        # Validate preferences
        self.validate_preferences(preferences)
        
        if not isinstance(preferences, KPPreferences):
            preferences = KPPreferences(**preferences.model_dump())
        
        # Initialize ephemeris calculator with KP ayanamsha
        ephemeris = EphemerisCalculator(ayanamsha="KP")

        # Calculate planetary positions
        planets = ephemeris.calculate_all_planets(birth_data.date)

        # Calculate ascendant and houses using Placidus
        ascendant_data = ephemeris.calculate_ascendant(
            dt=birth_data.date,
            latitude=birth_data.latitude,
            longitude=birth_data.longitude,
            house_system="Placidus"
        )

        # Calculate KP-specific data
        kp_data = self._calculate_kp_specifics(planets, ascendant_data, birth_data, ephemeris)

        # Build result
        birth_data_dict = birth_data.model_dump()
        if "date" in birth_data_dict and isinstance(birth_data_dict["date"], datetime):
            birth_data_dict["date"] = birth_data_dict["date"].isoformat()

        result = {
            "methodology": "kp",
            "birth_data": birth_data_dict,
            "preferences": preferences.model_dump(),
            "planets": planets,
            "ascendant": ascendant_data,
            "kp_data": kp_data,
            "calculation_timestamp": datetime.utcnow().isoformat(),
        }

        return result

    def _calculate_kp_specifics(self, planets: Dict, ascendant_data: Dict, birth_data: BirthData, ephemeris: EphemerisCalculator) -> Dict[str, Any]:
        """Calculate KP-specific data: sub-lords, ruling planets, significators, etc."""
        kp_specifics = {}

        # Calculate sub-lords for all planets
        if True:  # preferences.enable_sub_lords
            planet_sub_lords = {}
            for planet_name, planet_data in planets.items():
                sub_lord_data = self._calculate_sub_lord(planet_data['sidereal_longitude'])
                planet_sub_lords[planet_name] = sub_lord_data
            kp_specifics['planet_sub_lords'] = planet_sub_lords

            # Calculate sub-lord for ascendant
            asc_sub_lord = self._calculate_sub_lord(ascendant_data['sidereal_longitude'])
            kp_specifics['ascendant_sub_lord'] = asc_sub_lord

        # Calculate ruling planets
        if True:  # preferences.enable_ruling_planets
            ruling_planets = self._calculate_ruling_planets(planets, ascendant_data, birth_data)
            kp_specifics['ruling_planets'] = ruling_planets

        # Calculate house cusps (Placidus system)
        # Get house cusps from ascendant data
        house_cusps_sidereal = ascendant_data.get('house_cusps_sidereal', [])

        # If house cusps not available, calculate them
        if not house_cusps_sidereal:
            from app.core.houses import HouseSystemCalculator
            house_calc = HouseSystemCalculator(house_system="Placidus")
            # Get ayanamsha value from ascendant data
            ayanamsha_value = ascendant_data.get('ayanamsha_value', 0.0)
            house_data = house_calc.calculate_houses(
                dt=birth_data.date,
                latitude=birth_data.latitude,
                longitude=birth_data.longitude,
                ayanamsha_value=ayanamsha_value
            )
            house_cusps_sidereal = house_data.get('house_cusps_sidereal', [])

        # Calculate sub-lords for all house cusps
        house_cusp_sub_lords = {}
        for i, cusp_longitude in enumerate(house_cusps_sidereal):
            house_num = i + 1
            cusp_sub_lord_data = self._calculate_sub_lord(cusp_longitude)
            house_cusp_sub_lords[house_num] = cusp_sub_lord_data

        kp_specifics['house_cusps'] = house_cusps_sidereal
        kp_specifics['house_cusp_sub_lords'] = house_cusp_sub_lords

        # Calculate significators for all houses
        if True:  # preferences.enable_significators
            significator_calc = KPSignificatorCalculator()

            # Calculate significators for all 12 houses
            house_significators_raw = significator_calc.calculate_all_house_significators(
                planets=planets,
                house_cusps=house_cusps_sidereal,
                planet_sub_lords=planet_sub_lords,
                ascendant_data=ascendant_data
            )

            # Update cusp sub-lord information in significators
            for house_num, sig_result in house_significators_raw.items():
                if house_num in house_cusp_sub_lords:
                    cusp_data = house_cusp_sub_lords[house_num]
                    sig_result.cusp_star_lord = cusp_data.get('star_lord', '')
                    sig_result.cusp_sub_lord = cusp_data.get('sub_lord', '')
                    sig_result.cusp_sub_sub_lord = cusp_data.get('sub_sub_lord', '')

                    # Update strong significators to include cusp sub-lord
                    if sig_result.cusp_sub_lord and sig_result.cusp_sub_lord not in sig_result.strong_significators:
                        sig_result.strong_significators.insert(0, sig_result.cusp_sub_lord)

                    # Update all_significators to include cusp sub-lord at the beginning
                    if sig_result.cusp_sub_lord and sig_result.cusp_sub_lord not in sig_result.all_significators:
                        sig_result.all_significators.insert(0, sig_result.cusp_sub_lord)

            # Format for JSON serialization
            house_significators = {}
            for house_num, sig_result in house_significators_raw.items():
                house_significators[house_num] = significator_calc.format_significators_for_display(sig_result)

            kp_specifics['house_significators'] = house_significators

            # Calculate planet significators (reverse lookup)
            planet_significators = {}
            for planet_name in planets.keys():
                planet_sig = significator_calc.get_planet_significators(
                    planet_name=planet_name,
                    planets=planets,
                    house_cusps=house_cusps_sidereal,
                    planet_sub_lords=planet_sub_lords
                )
                planet_significators[planet_name] = planet_sig

            kp_specifics['planet_significators'] = planet_significators

        # Calculate predictions for major life events
        if True:  # preferences.enable_predictions
            prediction_engine = KPPredictionEngine()

            # Generate predictions
            predictions = prediction_engine.predict_all_events(
                house_significators=house_significators,
                planet_significators=planet_significators,
                ruling_planets=ruling_planets
            )

            # Format for JSON
            formatted_predictions = prediction_engine.format_predictions_for_display(predictions)
            kp_specifics['predictions'] = formatted_predictions

        return kp_specifics

    def _calculate_sub_lord(self, longitude: float) -> Dict[str, Any]:
        """
        Calculate KP sub-lord for a given longitude.

        KP divides each nakshatra (13°20') into 9 sub-divisions based on
        Vimshottari Dasha proportions.

        Args:
            longitude: Sidereal longitude in degrees (0-360)

        Returns:
            Dict containing star lord, sub-lord, and sub-sub-lord information
        """
        # Each nakshatra is 13.333... degrees (360/27)
        nakshatra_size = 360.0 / 27.0  # 13.333...

        # Determine which nakshatra (1-27, 1-based)
        nakshatra_num = int(longitude / nakshatra_size) + 1

        # Position within the nakshatra (0 to 13.333...)
        position_in_nakshatra = longitude % nakshatra_size

        # Star Lord (Nakshatra Lord)
        star_lord = NAKSHATRA_LORDS[nakshatra_num - 1]

        # Calculate sub-lord
        # Each nakshatra is divided into 9 parts based on Vimshottari proportions
        # Total proportion = 120, so each degree of nakshatra = 120/13.333... = 9 units
        units_per_degree = KP_TOTAL_PROPORTION / nakshatra_size
        position_in_units = position_in_nakshatra * units_per_degree

        # Find which sub-lord this falls into
        cumulative_units = 0
        sub_lord = None
        sub_lord_start = 0
        sub_lord_end = 0

        for lord, proportion in KP_SUB_LORD_PROPORTIONS.items():
            cumulative_units += proportion
            if position_in_units < cumulative_units:
                sub_lord = lord
                sub_lord_end = cumulative_units
                sub_lord_start = cumulative_units - proportion
                break

        # Calculate position within sub-lord (for sub-sub-lord calculation)
        position_in_sub_lord_units = position_in_units - sub_lord_start
        sub_lord_size_units = sub_lord_end - sub_lord_start

        # Calculate sub-sub-lord (further division of sub-lord)
        # Each sub-lord is again divided into 9 parts in the same proportion
        cumulative_sub_sub_units = 0
        sub_sub_lord = None

        for lord, proportion in KP_SUB_LORD_PROPORTIONS.items():
            # Normalize proportion to sub-lord size
            sub_sub_proportion = (proportion / KP_TOTAL_PROPORTION) * sub_lord_size_units
            cumulative_sub_sub_units += sub_sub_proportion
            if position_in_sub_lord_units < cumulative_sub_sub_units:
                sub_sub_lord = lord
                break

        return {
            'nakshatra_number': nakshatra_num,
            'star_lord': star_lord,
            'sub_lord': sub_lord,
            'sub_sub_lord': sub_sub_lord,
            'longitude': longitude,
            'position_in_nakshatra': position_in_nakshatra,
        }

    def _calculate_ruling_planets(self, planets: Dict, ascendant_data: Dict, birth_data: BirthData) -> Dict[str, Any]:
        """
        Calculate KP Ruling Planets.

        Ruling Planets are used for horary questions and event timing.
        The 5 ruling planets are:
        1. Day Lord (Lord of the weekday)
        2. Ascendant Star Lord
        3. Ascendant Sub Lord
        4. Moon Star Lord
        5. Moon Sub Lord

        Returns:
            Dict containing the 5 ruling planets
        """
        # 1. Day Lord (Lord of the weekday)
        weekday_lords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
        day_of_week = birth_data.date.weekday()  # 0=Monday, 6=Sunday
        # Adjust to start from Sunday (0=Sunday, 6=Saturday)
        day_index = (day_of_week + 1) % 7
        day_lord = weekday_lords[day_index]

        # 2 & 3. Ascendant Star Lord and Sub Lord
        asc_longitude = ascendant_data['sidereal_longitude']
        asc_sub_lord_data = self._calculate_sub_lord(asc_longitude)
        asc_star_lord = asc_sub_lord_data['star_lord']
        asc_sub_lord = asc_sub_lord_data['sub_lord']

        # 4 & 5. Moon Star Lord and Sub Lord
        moon_longitude = planets['Moon']['sidereal_longitude']
        moon_sub_lord_data = self._calculate_sub_lord(moon_longitude)
        moon_star_lord = moon_sub_lord_data['star_lord']
        moon_sub_lord = moon_sub_lord_data['sub_lord']

        return {
            'day_lord': day_lord,
            'ascendant_star_lord': asc_star_lord,
            'ascendant_sub_lord': asc_sub_lord,
            'moon_star_lord': moon_star_lord,
            'moon_sub_lord': moon_sub_lord,
            'ruling_planets_list': [day_lord, asc_star_lord, asc_sub_lord, moon_star_lord, moon_sub_lord],
        }


# Register KP methodology
_kp_instance = KPMethodology()
MethodologyRegistry.register(_kp_instance)

