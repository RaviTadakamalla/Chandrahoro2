"""Vedic aspects (Drishti) calculation engine."""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class AspectResult:
    """Result of an aspect calculation."""
    aspecting_planet: str
    aspected_planet: str
    aspected_house: int
    aspect_type: str  # 'full', 'partial', 'special'
    aspect_strength: float  # 0.0 to 1.0
    orb: float  # Degrees of orb
    description: str
    benefic: bool  # True if benefic aspect, False if malefic


class VedicAspectCalculator:
    """Calculate Vedic planetary aspects (Drishti)."""
    
    # Standard Vedic aspects for each planet
    PLANET_ASPECTS = {
        'Sun': [7],           # 7th house aspect
        'Moon': [7],          # 7th house aspect
        'Mars': [4, 7, 8],    # 4th, 7th, 8th house aspects
        'Mercury': [7],       # 7th house aspect
        'Jupiter': [5, 7, 9], # 5th, 7th, 9th house aspects
        'Venus': [7],         # 7th house aspect
        'Saturn': [3, 7, 10], # 3rd, 7th, 10th house aspects
        'Rahu': [5, 7, 9],    # Same as Jupiter (some traditions)
        'Ketu': [5, 7, 9]     # Same as Jupiter (some traditions)
    }
    
    # Planet classifications for benefic/malefic aspects
    BENEFIC_PLANETS = ['Moon', 'Venus', 'Jupiter', 'Mercury']
    MALEFIC_PLANETS = ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun']
    
    # Orb allowances for aspects (in degrees)
    ASPECT_ORBS = {
        'tight': 3.0,    # Very strong aspect
        'moderate': 5.0, # Moderate aspect
        'wide': 8.0      # Weak aspect
    }
    
    def __init__(self):
        """Initialize aspect calculator."""
        pass
    
    def calculate_all_aspects(self, planets: List[Dict], houses: List[Dict]) -> List[AspectResult]:
        """
        Calculate all planetary aspects in the chart.
        
        Args:
            planets: List of planet positions
            houses: List of house positions
            
        Returns:
            List of aspect results
        """
        aspects = []
        
        # Convert data to internal format
        planet_data = self._convert_planet_data(planets)
        house_data = self._convert_house_data(houses)
        
        # Calculate aspects for each planet
        for planet_name, planet_info in planet_data.items():
            if planet_name in self.PLANET_ASPECTS:
                planet_aspects = self._calculate_planet_aspects(
                    planet_name, planet_info, planet_data, house_data
                )
                aspects.extend(planet_aspects)
        
        return aspects
    
    def _convert_planet_data(self, planets: List[Dict]) -> Dict[str, Dict]:
        """Convert planet list to dictionary format."""
        planet_dict = {}
        for planet in planets:
            planet_dict[planet['name']] = {
                'house': planet['house'],
                'sign': planet['sign'],
                'degree': planet['degree_in_sign'],
                'longitude': planet.get('sidereal_longitude', 0),
                'retrograde': planet.get('retrograde', False)
            }
        return planet_dict
    
    def _convert_house_data(self, houses: List[Dict]) -> Dict[int, Dict]:
        """Convert house list to dictionary format."""
        house_dict = {}
        for house in houses:
            house_dict[house['number']] = {
                'sign': house['sign'],
                'cusp': house.get('cusp_longitude', 0)
            }
        return house_dict
    
    def _calculate_planet_aspects(self, planet_name: str, planet_info: Dict,
                                 all_planets: Dict[str, Dict], 
                                 houses: Dict[int, Dict]) -> List[AspectResult]:
        """Calculate aspects for a specific planet."""
        aspects = []
        planet_house = planet_info['house']
        
        # Get the houses this planet aspects
        aspected_houses = self.PLANET_ASPECTS[planet_name]
        
        for aspect_offset in aspected_houses:
            aspected_house_num = ((planet_house - 1 + aspect_offset - 1) % 12) + 1
            
            # Check if any planets are in the aspected house
            aspected_planets = self._get_planets_in_house(aspected_house_num, all_planets)
            
            for aspected_planet_name in aspected_planets:
                if aspected_planet_name != planet_name:  # Planet can't aspect itself
                    aspect = self._calculate_aspect_strength(
                        planet_name, planet_info,
                        aspected_planet_name, all_planets[aspected_planet_name],
                        aspect_offset, aspected_house_num
                    )
                    if aspect:
                        aspects.append(aspect)
            
            # Also create aspect to empty house if significant
            if not aspected_planets and self._is_significant_house_aspect(aspect_offset):
                aspect = self._create_house_aspect(
                    planet_name, planet_info, aspected_house_num, aspect_offset
                )
                if aspect:
                    aspects.append(aspect)
        
        return aspects
    
    def _get_planets_in_house(self, house_num: int, planets: Dict[str, Dict]) -> List[str]:
        """Get list of planets in a specific house."""
        planets_in_house = []
        for planet_name, planet_info in planets.items():
            if planet_info['house'] == house_num:
                planets_in_house.append(planet_name)
        return planets_in_house
    
    def _calculate_aspect_strength(self, aspecting_planet: str, aspecting_info: Dict,
                                  aspected_planet: str, aspected_info: Dict,
                                  aspect_offset: int, aspected_house: int) -> Optional[AspectResult]:
        """Calculate the strength of an aspect between two planets."""
        
        # Calculate orb (degree difference)
        orb = self._calculate_orb(aspecting_info, aspected_info, aspect_offset)
        
        # Determine aspect strength based on orb
        if orb <= self.ASPECT_ORBS['tight']:
            strength = 1.0
            aspect_type = 'full'
        elif orb <= self.ASPECT_ORBS['moderate']:
            strength = 0.7
            aspect_type = 'partial'
        elif orb <= self.ASPECT_ORBS['wide']:
            strength = 0.4
            aspect_type = 'partial'
        else:
            return None  # Aspect too weak
        
        # Determine if benefic or malefic
        is_benefic = aspecting_planet in self.BENEFIC_PLANETS
        
        # Create description
        description = self._create_aspect_description(
            aspecting_planet, aspected_planet, aspect_offset, strength, is_benefic
        )
        
        return AspectResult(
            aspecting_planet=aspecting_planet,
            aspected_planet=aspected_planet,
            aspected_house=aspected_house,
            aspect_type=aspect_type,
            aspect_strength=strength,
            orb=orb,
            description=description,
            benefic=is_benefic
        )
    
    def _create_house_aspect(self, planet_name: str, planet_info: Dict,
                           aspected_house: int, aspect_offset: int) -> Optional[AspectResult]:
        """Create aspect to an empty house."""
        is_benefic = planet_name in self.BENEFIC_PLANETS
        
        description = f"{planet_name} aspects {aspected_house}th house ({self._get_house_significance(aspected_house)})"
        
        return AspectResult(
            aspecting_planet=planet_name,
            aspected_planet="",  # Empty house
            aspected_house=aspected_house,
            aspect_type='full',
            aspect_strength=0.8,  # House aspects are generally strong
            orb=0.0,
            description=description,
            benefic=is_benefic
        )
    
    def _calculate_orb(self, aspecting_info: Dict, aspected_info: Dict, aspect_offset: int) -> float:
        """Calculate the orb (degree difference) for an aspect."""
        # For house-based aspects, calculate based on house positions
        # This is a simplified calculation - in practice, you'd use exact degrees
        
        aspecting_longitude = aspecting_info.get('longitude', 0)
        aspected_longitude = aspected_info.get('longitude', 0)
        
        # Calculate expected aspect longitude
        expected_aspect_longitude = (aspecting_longitude + (aspect_offset - 1) * 30) % 360
        
        # Calculate orb
        orb = abs(expected_aspect_longitude - aspected_longitude)
        if orb > 180:
            orb = 360 - orb
        
        return orb
    
    def _is_significant_house_aspect(self, aspect_offset: int) -> bool:
        """Check if an aspect to an empty house is significant."""
        # 7th house aspects are always significant
        # Special aspects (Mars 4th/8th, Jupiter 5th/9th, Saturn 3rd/10th) are significant
        return aspect_offset in [4, 5, 7, 8, 9, 10]
    
    def _create_aspect_description(self, aspecting_planet: str, aspected_planet: str,
                                  aspect_offset: int, strength: float, is_benefic: bool) -> str:
        """Create a description for the aspect."""
        aspect_names = {
            3: "3rd house aspect",
            4: "4th house aspect", 
            5: "5th house aspect",
            7: "7th house aspect (opposition)",
            8: "8th house aspect",
            9: "9th house aspect",
            10: "10th house aspect"
        }
        
        aspect_name = aspect_names.get(aspect_offset, f"{aspect_offset}th house aspect")
        strength_desc = "strong" if strength >= 0.8 else "moderate" if strength >= 0.6 else "weak"
        effect_desc = "beneficial" if is_benefic else "challenging"
        
        return f"{aspecting_planet} casts {aspect_name} on {aspected_planet} - {strength_desc} {effect_desc} influence"
    
    def _get_house_significance(self, house_num: int) -> str:
        """Get the significance of a house."""
        house_meanings = {
            1: "Self, personality, health",
            2: "Wealth, family, speech",
            3: "Siblings, courage, communication",
            4: "Home, mother, happiness",
            5: "Children, creativity, intelligence",
            6: "Enemies, diseases, service",
            7: "Marriage, partnerships, business",
            8: "Longevity, transformation, occult",
            9: "Fortune, dharma, higher learning",
            10: "Career, reputation, authority",
            11: "Gains, friends, aspirations",
            12: "Losses, spirituality, foreign lands"
        }
        return house_meanings.get(house_num, f"House {house_num}")
    
    def get_aspect_summary(self, aspects: List[AspectResult]) -> Dict[str, Any]:
        """Get a summary of all aspects in the chart."""
        total_aspects = len(aspects)
        benefic_aspects = len([a for a in aspects if a.benefic])
        malefic_aspects = total_aspects - benefic_aspects
        
        strong_aspects = len([a for a in aspects if a.aspect_strength >= 0.8])
        moderate_aspects = len([a for a in aspects if 0.6 <= a.aspect_strength < 0.8])
        weak_aspects = len([a for a in aspects if a.aspect_strength < 0.6])
        
        # Group by aspecting planet
        by_planet = {}
        for aspect in aspects:
            planet = aspect.aspecting_planet
            if planet not in by_planet:
                by_planet[planet] = []
            by_planet[planet].append(aspect)
        
        return {
            "total_aspects": total_aspects,
            "benefic_aspects": benefic_aspects,
            "malefic_aspects": malefic_aspects,
            "strong_aspects": strong_aspects,
            "moderate_aspects": moderate_aspects,
            "weak_aspects": weak_aspects,
            "aspects_by_planet": {planet: len(aspects) for planet, aspects in by_planet.items()},
            "most_aspecting_planet": max(by_planet.keys(), key=lambda p: len(by_planet[p])) if by_planet else None
        }
