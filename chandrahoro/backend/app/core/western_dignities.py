"""Planetary Dignities Calculator for Western Astrology.

Calculates essential dignities:
- Domicile (rulership)
- Exaltation
- Detriment
- Fall
- Peregrine (no dignity)
"""

from typing import Dict, Any, List


class DignityCalculator:
    """Calculate planetary dignities in Western astrology."""
    
    # Planetary rulerships (domicile)
    RULERSHIPS = {
        'Sun': [4],          # Leo
        'Moon': [3],         # Cancer
        'Mercury': [2, 5],   # Gemini, Virgo
        'Venus': [1, 6],     # Taurus, Libra
        'Mars': [0, 7],      # Aries, Scorpio (traditional)
        'Jupiter': [8, 11],  # Sagittarius, Pisces (traditional)
        'Saturn': [9, 10],   # Capricorn, Aquarius (traditional)
        'Uranus': [10],      # Aquarius (modern)
        'Neptune': [11],     # Pisces (modern)
        'Pluto': [7],        # Scorpio (modern)
    }
    
    # Exaltations
    EXALTATIONS = {
        'Sun': 0,      # Aries
        'Moon': 1,     # Taurus
        'Mercury': 5,  # Virgo
        'Venus': 11,   # Pisces
        'Mars': 9,     # Capricorn
        'Jupiter': 3,  # Cancer
        'Saturn': 6,   # Libra
    }
    
    # Sign names
    SIGN_NAMES = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    
    def calculate_all_dignities(self, planets: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Calculate dignities for all planets."""
        dignities = {}
        
        for planet in planets:
            planet_name = planet.get('name', '')
            if planet_name:
                dignities[planet_name] = self.calculate_dignity(planet_name, planet)
        
        return dignities
    
    def calculate_dignity(self, planet_name: str, planet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate dignity for a single planet."""
        sign_num = planet_data.get('sign_number', 0)
        
        dignity_type = 'Peregrine'  # Default: no dignity
        score = 0
        
        # Check domicile
        if planet_name in self.RULERSHIPS:
            if sign_num in self.RULERSHIPS[planet_name]:
                dignity_type = 'Domicile'
                score = 5
        
        # Check exaltation (overrides domicile if both apply)
        if planet_name in self.EXALTATIONS:
            if sign_num == self.EXALTATIONS[planet_name]:
                dignity_type = 'Exaltation'
                score = 4
        
        # Check detriment (opposite of domicile)
        if dignity_type == 'Peregrine' and planet_name in self.RULERSHIPS:
            detriment_signs = [(s + 6) % 12 for s in self.RULERSHIPS[planet_name]]
            if sign_num in detriment_signs:
                dignity_type = 'Detriment'
                score = -4
        
        # Check fall (opposite of exaltation)
        if dignity_type == 'Peregrine' and planet_name in self.EXALTATIONS:
            fall_sign = (self.EXALTATIONS[planet_name] + 6) % 12
            if sign_num == fall_sign:
                dignity_type = 'Fall'
                score = -5
        
        return {
            'dignity': dignity_type,
            'score': score,
            'sign': sign_num,
            'sign_name': self.SIGN_NAMES[sign_num % 12],
            'description': self._get_dignity_description(planet_name, dignity_type, sign_num)
        }
    
    def _get_dignity_description(self, planet: str, dignity: str, sign: int) -> str:
        """Get human-readable description of dignity."""
        sign_name = self.SIGN_NAMES[sign % 12]
        
        descriptions = {
            'Domicile': f"{planet} is in its own sign ({sign_name}) - very strong",
            'Exaltation': f"{planet} is exalted in {sign_name} - very favorable",
            'Detriment': f"{planet} is in detriment in {sign_name} - challenged",
            'Fall': f"{planet} is in fall in {sign_name} - weakened",
            'Peregrine': f"{planet} has no essential dignity in {sign_name}"
        }
        
        return descriptions.get(dignity, '')
    
    def calculate_element_modality_balance(
        self,
        planets: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate distribution of planets by element and modality."""
        
        ELEMENTS = {
            'Fire': [0, 4, 8],      # Aries, Leo, Sagittarius
            'Earth': [1, 5, 9],     # Taurus, Virgo, Capricorn
            'Air': [2, 6, 10],      # Gemini, Libra, Aquarius
            'Water': [3, 7, 11]     # Cancer, Scorpio, Pisces
        }
        
        MODALITIES = {
            'Cardinal': [0, 3, 6, 9],    # Aries, Cancer, Libra, Capricorn
            'Fixed': [1, 4, 7, 10],      # Taurus, Leo, Scorpio, Aquarius
            'Mutable': [2, 5, 8, 11]     # Gemini, Virgo, Sagittarius, Pisces
        }
        
        element_count = {'Fire': 0, 'Earth': 0, 'Air': 0, 'Water': 0}
        modality_count = {'Cardinal': 0, 'Fixed': 0, 'Mutable': 0}
        
        # Count planets in each element/modality
        for planet in planets:
            sign_num = planet.get('sign_number', 0)
            
            for element, signs in ELEMENTS.items():
                if sign_num in signs:
                    element_count[element] += 1
            
            for modality, signs in MODALITIES.items():
                if sign_num in signs:
                    modality_count[modality] += 1
        
        return {
            'elements': element_count,
            'modalities': modality_count,
            'dominant_element': max(element_count, key=element_count.get) if any(element_count.values()) else None,
            'dominant_modality': max(modality_count, key=modality_count.get) if any(modality_count.values()) else None
        }

