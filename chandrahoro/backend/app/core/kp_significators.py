"""KP Significator Calculation Module.

This module implements the KP (Krishnamurti Paddhati) significator calculation system.
Significators are planets that have a connection to a house through various means.

The 6-step significator calculation method:
1. Planets occupying the house (strongest)
2. Planets owning the sign in the house
3. Planets in the star of occupants
4. Planets in the star of owners
5. Planets aspecting the house
6. Planets in the star of planets aspecting the house

In KP, the sub-lord of the cusp is considered the most powerful significator.
"""

from typing import Dict, Any, List, Set, Tuple
from dataclasses import dataclass


@dataclass
class SignificatorResult:
    """Result of significator calculation for a house."""
    house_number: int
    cusp_longitude: float
    cusp_sign: str
    cusp_star_lord: str
    cusp_sub_lord: str
    cusp_sub_sub_lord: str
    
    # Significators by category
    occupants: List[str]  # Step 1: Planets in the house
    owners: List[str]  # Step 2: Planets owning the sign
    star_of_occupants: List[str]  # Step 3: Planets in star of occupants
    star_of_owners: List[str]  # Step 4: Planets in star of owners
    aspecting_planets: List[str]  # Step 5: Planets aspecting the house
    star_of_aspecting: List[str]  # Step 6: Planets in star of aspecting planets
    
    # Combined list (ordered by strength)
    all_significators: List[str]
    
    # Strength ranking
    strong_significators: List[str]  # Sub-lord + occupants
    medium_significators: List[str]  # Owners + star of occupants
    weak_significators: List[str]  # Aspects + star lords


# Sign lordship mapping (1-based indexing)
SIGN_LORDS = {
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

# Sign names
SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

# KP Aspects (planets aspect houses)
# In KP, aspects are based on degrees, not signs
# Full aspects: 7th house (180°)
# Special aspects: Mars (4th, 8th), Jupiter (5th, 9th), Saturn (3rd, 10th)
KP_ASPECTS = {
    'Sun': [7],
    'Moon': [7],
    'Mars': [4, 7, 8],
    'Mercury': [7],
    'Jupiter': [5, 7, 9],
    'Venus': [7],
    'Saturn': [3, 7, 10],
    'Rahu': [5, 7, 9],  # Same as Jupiter
    'Ketu': [5, 7, 9],  # Same as Jupiter
}


class KPSignificatorCalculator:
    """
    KP Significator Calculator.
    
    Calculates significators for all 12 houses using the 6-step method.
    """
    
    def __init__(self):
        """Initialize the significator calculator."""
        self.sign_lords = SIGN_LORDS
        self.sign_names = SIGN_NAMES
        self.kp_aspects = KP_ASPECTS
    
    def calculate_all_house_significators(
        self,
        planets: Dict[str, Any],
        house_cusps: List[float],
        planet_sub_lords: Dict[str, Any],
        ascendant_data: Dict[str, Any]
    ) -> Dict[int, SignificatorResult]:
        """
        Calculate significators for all 12 houses.
        
        Args:
            planets: Dictionary of planet positions
            house_cusps: List of 12 house cusp longitudes (sidereal)
            planet_sub_lords: Dictionary of sub-lord data for each planet
            ascendant_data: Ascendant information
            
        Returns:
            Dictionary mapping house number (1-12) to SignificatorResult
        """
        results = {}
        
        for house_num in range(1, 13):
            result = self.calculate_house_significators(
                house_num=house_num,
                planets=planets,
                house_cusps=house_cusps,
                planet_sub_lords=planet_sub_lords,
                ascendant_data=ascendant_data
            )
            results[house_num] = result
        
        return results
    
    def calculate_house_significators(
        self,
        house_num: int,
        planets: Dict[str, Any],
        house_cusps: List[float],
        planet_sub_lords: Dict[str, Any],
        ascendant_data: Dict[str, Any]
    ) -> SignificatorResult:
        """
        Calculate significators for a single house using the 6-step method.
        
        Args:
            house_num: House number (1-12)
            planets: Dictionary of planet positions
            house_cusps: List of 12 house cusp longitudes
            planet_sub_lords: Dictionary of sub-lord data for each planet
            ascendant_data: Ascendant information
            
        Returns:
            SignificatorResult object
        """
        # Get cusp information
        cusp_index = house_num - 1
        cusp_longitude = house_cusps[cusp_index]

        # Get cusp sign
        cusp_sign_num = int(cusp_longitude / 30) + 1
        cusp_sign = self.sign_names[cusp_sign_num - 1]

        # Get cusp sub-lord data (need to calculate from cusp longitude)
        # This should come from the KP methodology's _calculate_sub_lord method
        # For now, we'll extract it from the ascendant_sub_lord if house_num == 1
        # Otherwise, we need to pass cusp sub-lords separately
        cusp_star_lord = ""
        cusp_sub_lord = ""
        cusp_sub_sub_lord = ""

        # We'll need to calculate this - for now use placeholder
        # This will be filled in when we integrate with kp_methodology.py

        # STEP 1: Find planets occupying the house
        occupants = self._find_occupants(house_num, planets, house_cusps)

        # STEP 2: Find planets owning the sign in the house
        owners = self._find_owners(cusp_sign_num)

        # STEP 3: Find planets in the star of occupants
        star_of_occupants = self._find_star_lords(occupants, planet_sub_lords)

        # STEP 4: Find planets in the star of owners
        star_of_owners = self._find_star_lords(owners, planet_sub_lords)

        # STEP 5: Find planets aspecting the house
        aspecting_planets = self._find_aspecting_planets(house_num, planets, house_cusps)

        # STEP 6: Find planets in the star of aspecting planets
        star_of_aspecting = self._find_star_lords(aspecting_planets, planet_sub_lords)

        # Combine all significators (ordered by strength)
        # Priority: Sub-lord > Occupants > Owners > Star of Occupants > Star of Owners > Aspecting > Star of Aspecting
        all_significators = []

        # Add cusp sub-lord first (most powerful)
        if cusp_sub_lord and cusp_sub_lord not in all_significators:
            all_significators.append(cusp_sub_lord)

        # Add occupants
        for planet in occupants:
            if planet not in all_significators:
                all_significators.append(planet)

        # Add owners
        for planet in owners:
            if planet not in all_significators:
                all_significators.append(planet)

        # Add star of occupants
        for planet in star_of_occupants:
            if planet not in all_significators:
                all_significators.append(planet)

        # Add star of owners
        for planet in star_of_owners:
            if planet not in all_significators:
                all_significators.append(planet)

        # Add aspecting planets
        for planet in aspecting_planets:
            if planet not in all_significators:
                all_significators.append(planet)

        # Add star of aspecting
        for planet in star_of_aspecting:
            if planet not in all_significators:
                all_significators.append(planet)

        # Categorize by strength
        strong_significators = [cusp_sub_lord] if cusp_sub_lord else []
        strong_significators.extend(occupants)

        medium_significators = list(owners)
        medium_significators.extend(star_of_occupants)
        medium_significators.extend(star_of_owners)

        weak_significators = list(aspecting_planets)
        weak_significators.extend(star_of_aspecting)

        return SignificatorResult(
            house_number=house_num,
            cusp_longitude=cusp_longitude,
            cusp_sign=cusp_sign,
            cusp_star_lord=cusp_star_lord,
            cusp_sub_lord=cusp_sub_lord,
            cusp_sub_sub_lord=cusp_sub_sub_lord,
            occupants=occupants,
            owners=owners,
            star_of_occupants=star_of_occupants,
            star_of_owners=star_of_owners,
            aspecting_planets=aspecting_planets,
            star_of_aspecting=star_of_aspecting,
            all_significators=all_significators,
            strong_significators=strong_significators,
            medium_significators=medium_significators,
            weak_significators=weak_significators
        )

    def _find_occupants(self, house_num: int, planets: Dict[str, Any], house_cusps: List[float]) -> List[str]:
        """
        Find planets occupying a house.

        Args:
            house_num: House number (1-12)
            planets: Dictionary of planet positions
            house_cusps: List of house cusp longitudes

        Returns:
            List of planet names occupying the house
        """
        occupants = []

        cusp_start = house_cusps[house_num - 1]
        cusp_end = house_cusps[house_num % 12]  # Next house cusp

        for planet_name, planet_data in planets.items():
            planet_longitude = planet_data.get('sidereal_longitude', 0)

            # Check if planet is in this house
            # Handle wrap-around at 360/0 degrees
            if cusp_start < cusp_end:
                if cusp_start <= planet_longitude < cusp_end:
                    occupants.append(planet_name)
            else:  # Wraps around 0
                if planet_longitude >= cusp_start or planet_longitude < cusp_end:
                    occupants.append(planet_name)

        return occupants

    def _find_owners(self, sign_num: int) -> List[str]:
        """
        Find planets owning a sign.

        Args:
            sign_num: Sign number (1-12)

        Returns:
            List of planet names owning the sign (usually 1 planet)
        """
        owner = self.sign_lords.get(sign_num)
        return [owner] if owner else []

    def _find_star_lords(self, planet_list: List[str], planet_sub_lords: Dict[str, Any]) -> List[str]:
        """
        Find planets that are star lords of the given planets.

        Args:
            planet_list: List of planet names
            planet_sub_lords: Dictionary of sub-lord data for each planet

        Returns:
            List of planets that are in the stars of the given planets
        """
        star_lords = []

        for planet_name in planet_list:
            if planet_name in planet_sub_lords:
                sub_lord_data = planet_sub_lords[planet_name]
                star_lord = sub_lord_data.get('star_lord')
                if star_lord and star_lord not in star_lords:
                    star_lords.append(star_lord)

        return star_lords

    def _find_aspecting_planets(self, house_num: int, planets: Dict[str, Any], house_cusps: List[float]) -> List[str]:
        """
        Find planets aspecting a house.

        In KP, aspects are based on house positions:
        - All planets aspect the 7th house from their position
        - Mars aspects 4th, 7th, 8th houses
        - Jupiter aspects 5th, 7th, 9th houses
        - Saturn aspects 3rd, 7th, 10th houses
        - Rahu/Ketu aspect like Jupiter (5th, 7th, 9th)

        Args:
            house_num: House number being aspected (1-12)
            planets: Dictionary of planet positions
            house_cusps: List of house cusp longitudes

        Returns:
            List of planet names aspecting the house
        """
        aspecting = []

        for planet_name, planet_data in planets.items():
            # Find which house the planet is in
            planet_house = self._get_planet_house(planet_data.get('sidereal_longitude', 0), house_cusps)

            # Get aspect houses for this planet
            aspect_houses = self.kp_aspects.get(planet_name, [7])

            # Check if this planet aspects the target house
            for aspect_offset in aspect_houses:
                aspected_house = ((planet_house - 1 + aspect_offset) % 12) + 1
                if aspected_house == house_num:
                    aspecting.append(planet_name)
                    break

        return aspecting

    def _get_planet_house(self, planet_longitude: float, house_cusps: List[float]) -> int:
        """
        Determine which house a planet is in.

        Args:
            planet_longitude: Sidereal longitude of planet (0-360)
            house_cusps: List of 12 house cusp longitudes

        Returns:
            House number (1-12)
        """
        for i in range(12):
            cusp_start = house_cusps[i]
            cusp_end = house_cusps[(i + 1) % 12]

            # Handle wrap-around at 360/0 degrees
            if cusp_start < cusp_end:
                if cusp_start <= planet_longitude < cusp_end:
                    return i + 1
            else:  # Wraps around 0
                if planet_longitude >= cusp_start or planet_longitude < cusp_end:
                    return i + 1

        return 1  # Default to first house

    def get_planet_significators(
        self,
        planet_name: str,
        planets: Dict[str, Any],
        house_cusps: List[float],
        planet_sub_lords: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Get houses for which a planet is a significator.

        This is the reverse lookup - given a planet, find all houses it signifies.

        Args:
            planet_name: Name of the planet
            planets: Dictionary of planet positions
            house_cusps: List of house cusp longitudes
            planet_sub_lords: Dictionary of sub-lord data

        Returns:
            Dictionary with houses signified by this planet
        """
        signified_houses = {
            'by_occupation': [],
            'by_ownership': [],
            'by_star_lordship': [],
            'by_aspect': [],
            'by_sub_lordship': [],
            'all_houses': []
        }

        # Find houses occupied by this planet
        planet_longitude = planets[planet_name].get('sidereal_longitude', 0)
        planet_house = self._get_planet_house(planet_longitude, house_cusps)
        signified_houses['by_occupation'].append(planet_house)

        # Find houses owned by this planet
        for sign_num, owner in self.sign_lords.items():
            if owner == planet_name:
                # Find which house has this sign on its cusp
                for house_num in range(1, 13):
                    cusp_longitude = house_cusps[house_num - 1]
                    cusp_sign_num = int(cusp_longitude / 30) + 1
                    if cusp_sign_num == sign_num:
                        signified_houses['by_ownership'].append(house_num)

        # Find houses where this planet is star lord of occupants/owners
        for house_num in range(1, 13):
            occupants = self._find_occupants(house_num, planets, house_cusps)
            for occupant in occupants:
                if occupant in planet_sub_lords:
                    if planet_sub_lords[occupant].get('star_lord') == planet_name:
                        if house_num not in signified_houses['by_star_lordship']:
                            signified_houses['by_star_lordship'].append(house_num)

        # Find houses aspected by this planet
        planet_house_pos = self._get_planet_house(planet_longitude, house_cusps)
        aspect_offsets = self.kp_aspects.get(planet_name, [7])
        for offset in aspect_offsets:
            aspected_house = ((planet_house_pos - 1 + offset) % 12) + 1
            signified_houses['by_aspect'].append(aspected_house)

        # Combine all houses (remove duplicates)
        all_houses = set()
        for category in ['by_occupation', 'by_ownership', 'by_star_lordship', 'by_aspect']:
            all_houses.update(signified_houses[category])
        signified_houses['all_houses'] = sorted(list(all_houses))

        return signified_houses

    def format_significators_for_display(self, significator_result: SignificatorResult) -> Dict[str, Any]:
        """
        Format significator result for frontend display.

        Args:
            significator_result: SignificatorResult object

        Returns:
            Dictionary formatted for JSON serialization
        """
        return {
            'house_number': significator_result.house_number,
            'cusp_longitude': significator_result.cusp_longitude,
            'cusp_sign': significator_result.cusp_sign,
            'cusp_star_lord': significator_result.cusp_star_lord,
            'cusp_sub_lord': significator_result.cusp_sub_lord,
            'cusp_sub_sub_lord': significator_result.cusp_sub_sub_lord,
            'significators': {
                'strong': {
                    'planets': significator_result.strong_significators,
                    'description': 'Sub-lord and occupants (strongest)'
                },
                'medium': {
                    'planets': significator_result.medium_significators,
                    'description': 'Owners and star lords'
                },
                'weak': {
                    'planets': significator_result.weak_significators,
                    'description': 'Aspecting planets and their star lords'
                }
            },
            'detailed_breakdown': {
                'step_1_occupants': significator_result.occupants,
                'step_2_owners': significator_result.owners,
                'step_3_star_of_occupants': significator_result.star_of_occupants,
                'step_4_star_of_owners': significator_result.star_of_owners,
                'step_5_aspecting': significator_result.aspecting_planets,
                'step_6_star_of_aspecting': significator_result.star_of_aspecting
            },
            'all_significators': significator_result.all_significators
        }

