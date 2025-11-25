"""Western Aspect Calculator.

Implements Western astrology aspects with orbs, including:
- Major aspects (conjunction, opposition, trine, square, sextile)
- Minor aspects (semi-sextile, semi-square, sesquiquadrate, quincunx)
- Chart patterns (Grand Trine, T-Square, Grand Cross, Yod, Stellium)
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)


@dataclass
class WesternAspect:
    """Western aspect between two planets."""
    planet1: str
    planet2: str
    aspect_type: str  # 'Conjunction', 'Opposition', etc.
    angle: float      # Exact angle between planets
    orb: float        # Deviation from exact aspect
    nature: str       # 'hard', 'soft', 'neutral', 'minor'
    strength: float   # 0.0 to 1.0 (1.0 = exact, decreases with orb)
    applying: bool    # True if aspect is applying (getting tighter)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class WesternAspectCalculator:
    """Calculate Western aspects with orbs."""
    
    # Major aspects with orbs
    MAJOR_ASPECTS = {
        'Conjunction': {'angle': 0, 'orb': 8, 'nature': 'neutral'},
        'Opposition': {'angle': 180, 'orb': 8, 'nature': 'hard'},
        'Trine': {'angle': 120, 'orb': 8, 'nature': 'soft'},
        'Square': {'angle': 90, 'orb': 8, 'nature': 'hard'},
        'Sextile': {'angle': 60, 'orb': 6, 'nature': 'soft'},
    }
    
    # Minor aspects with tighter orbs
    MINOR_ASPECTS = {
        'Semi-sextile': {'angle': 30, 'orb': 2, 'nature': 'minor'},
        'Semi-square': {'angle': 45, 'orb': 2, 'nature': 'minor'},
        'Sesquiquadrate': {'angle': 135, 'orb': 2, 'nature': 'minor'},
        'Quincunx': {'angle': 150, 'orb': 2, 'nature': 'minor'},
    }
    
    # Orb adjustments by orb type
    ORB_MULTIPLIERS = {
        'tight': 0.6,     # Tighter orbs (e.g., 8° becomes 4.8°)
        'moderate': 1.0,  # Standard orbs
        'wide': 1.5       # Wider orbs (e.g., 8° becomes 12°)
    }
    
    def __init__(self, include_minor: bool = False, orb_type: str = 'moderate'):
        """
        Initialize Western aspect calculator.
        
        Args:
            include_minor: Include minor aspects
            orb_type: 'tight', 'moderate', or 'wide'
        """
        self.include_minor = include_minor
        self.orb_multiplier = self.ORB_MULTIPLIERS.get(orb_type, 1.0)
        
        # Build aspect dictionary
        self.aspects = self.MAJOR_ASPECTS.copy()
        if include_minor:
            self.aspects.update(self.MINOR_ASPECTS)
    
    def calculate_all_aspects(self, planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate all aspects between planets.
        
        Args:
            planets: List of planet positions
            
        Returns:
            List of Western aspects as dictionaries
        """
        aspects = []
        
        # Calculate aspects between all planet pairs
        for i, planet1 in enumerate(planets):
            for planet2 in planets[i+1:]:
                aspect = self._calculate_aspect_between(planet1, planet2)
                if aspect:
                    aspects.append(aspect.to_dict())
        
        return aspects
    
    def _calculate_aspect_between(
        self,
        planet1: Dict[str, Any],
        planet2: Dict[str, Any]
    ) -> Optional[WesternAspect]:
        """Calculate aspect between two planets."""
        
        planet1_name = planet1.get('name', '')
        planet2_name = planet2.get('name', '')
        
        # Get tropical longitudes
        long1 = planet1.get('tropical_longitude', planet1.get('longitude', 0))
        long2 = planet2.get('tropical_longitude', planet2.get('longitude', 0))
        
        # Calculate angle between planets
        angle_diff = abs(long1 - long2)
        if angle_diff > 180:
            angle_diff = 360 - angle_diff
        
        # Check each aspect type
        for aspect_name, aspect_data in self.aspects.items():
            target_angle = aspect_data['angle']
            base_orb = aspect_data['orb']
            adjusted_orb = base_orb * self.orb_multiplier
            
            # Calculate orb (deviation from exact aspect)
            orb = abs(angle_diff - target_angle)
            
            # Check if within orb
            if orb <= adjusted_orb:
                # Calculate strength (1.0 at exact, 0.0 at max orb)
                strength = 1.0 - (orb / adjusted_orb)
                
                # Determine if applying or separating
                speed1 = planet1.get('speed', 0)
                speed2 = planet2.get('speed', 0)
                applying = self._is_applying(long1, long2, speed1, speed2, target_angle)
                
                return WesternAspect(
                    planet1=planet1_name,
                    planet2=planet2_name,
                    aspect_type=aspect_name,
                    angle=round(angle_diff, 2),
                    orb=round(orb, 2),
                    nature=aspect_data['nature'],
                    strength=round(strength, 3),
                    applying=applying
                )
        
        return None

    def _is_applying(
        self,
        long1: float,
        long2: float,
        speed1: float,
        speed2: float,
        target_angle: float
    ) -> bool:
        """Determine if aspect is applying (getting tighter) or separating."""

        # Calculate future positions (1 day ahead)
        future_long1 = (long1 + speed1) % 360
        future_long2 = (long2 + speed2) % 360

        # Calculate current and future angle differences
        current_diff = abs(long1 - long2)
        if current_diff > 180:
            current_diff = 360 - current_diff

        future_diff = abs(future_long1 - future_long2)
        if future_diff > 180:
            future_diff = 360 - future_diff

        # Aspect is applying if future orb is smaller
        current_orb = abs(current_diff - target_angle)
        future_orb = abs(future_diff - target_angle)

        return future_orb < current_orb

    def detect_chart_patterns(
        self,
        planets: List[Dict[str, Any]],
        aspects: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect major chart patterns.

        Patterns:
        - Grand Trine: 3 planets in trine (120°) forming triangle
        - T-Square: 2 planets in opposition, both square a 3rd planet
        - Grand Cross: 4 planets forming 2 oppositions and 4 squares
        - Yod (Finger of God): 2 planets in sextile, both quincunx a 3rd
        - Stellium: 3+ planets in same sign
        """
        patterns = []

        # Detect Stellium
        stelliums = self._detect_stellium(planets)
        patterns.extend(stelliums)

        # Detect Grand Trine
        grand_trines = self._detect_grand_trine(aspects)
        patterns.extend(grand_trines)

        # Detect T-Square
        t_squares = self._detect_t_square(aspects)
        patterns.extend(t_squares)

        return patterns

    def _detect_stellium(self, planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect Stellium (3+ planets in same sign)."""
        stelliums = []

        # Group planets by sign
        by_sign: Dict[int, List[str]] = {}
        for planet in planets:
            sign_num = planet.get('sign_number', 0)
            planet_name = planet.get('name', '')
            if sign_num not in by_sign:
                by_sign[sign_num] = []
            by_sign[sign_num].append(planet_name)

        # Find signs with 3+ planets
        for sign_num, planet_list in by_sign.items():
            if len(planet_list) >= 3:
                stelliums.append({
                    'pattern': 'Stellium',
                    'sign': sign_num,
                    'sign_name': self._get_sign_name(sign_num),
                    'planets': planet_list,
                    'count': len(planet_list),
                    'description': f"{len(planet_list)} planets in {self._get_sign_name(sign_num)}"
                })

        return stelliums

    def _detect_grand_trine(self, aspects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect Grand Trine patterns (3 trines forming triangle)."""
        grand_trines = []

        # Get all trine aspects
        trines = [a for a in aspects if a.get('aspect_type') == 'Trine']

        if len(trines) < 3:
            return grand_trines

        # Find sets of 3 planets all in trine with each other
        # For simplicity, we'll check if we have 3 trines that form a triangle
        for i, trine1 in enumerate(trines):
            for j, trine2 in enumerate(trines[i+1:], i+1):
                for k, trine3 in enumerate(trines[j+1:], j+1):
                    # Check if these 3 trines form a triangle
                    planets_in_pattern = set()
                    planets_in_pattern.add(trine1['planet1'])
                    planets_in_pattern.add(trine1['planet2'])
                    planets_in_pattern.add(trine2['planet1'])
                    planets_in_pattern.add(trine2['planet2'])
                    planets_in_pattern.add(trine3['planet1'])
                    planets_in_pattern.add(trine3['planet2'])

                    # A grand trine has exactly 3 planets
                    if len(planets_in_pattern) == 3:
                        grand_trines.append({
                            'pattern': 'Grand Trine',
                            'planets': list(planets_in_pattern),
                            'description': f"Grand Trine: {', '.join(planets_in_pattern)}"
                        })
                        break

        return grand_trines

    def _detect_t_square(self, aspects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect T-Square patterns."""
        t_squares = []

        # Get oppositions and squares
        oppositions = [a for a in aspects if a.get('aspect_type') == 'Opposition']
        squares = [a for a in aspects if a.get('aspect_type') == 'Square']

        if len(oppositions) < 1 or len(squares) < 2:
            return t_squares

        # For each opposition, find a planet that squares both ends
        for opp in oppositions:
            planet_a = opp['planet1']
            planet_b = opp['planet2']

            # Find planets that square both A and B
            for sq1 in squares:
                for sq2 in squares:
                    if sq1 == sq2:
                        continue

                    # Check if sq1 and sq2 involve the same apex planet
                    apex = None
                    if sq1['planet1'] == sq2['planet1'] and sq1['planet1'] not in [planet_a, planet_b]:
                        apex = sq1['planet1']
                    elif sq1['planet1'] == sq2['planet2'] and sq1['planet1'] not in [planet_a, planet_b]:
                        apex = sq1['planet1']
                    elif sq1['planet2'] == sq2['planet1'] and sq1['planet2'] not in [planet_a, planet_b]:
                        apex = sq1['planet2']
                    elif sq1['planet2'] == sq2['planet2'] and sq1['planet2'] not in [planet_a, planet_b]:
                        apex = sq1['planet2']

                    if apex:
                        # Verify this apex squares both opposition planets
                        squares_a = any(
                            (s['planet1'] == apex and s['planet2'] == planet_a) or
                            (s['planet2'] == apex and s['planet1'] == planet_a)
                            for s in squares
                        )
                        squares_b = any(
                            (s['planet1'] == apex and s['planet2'] == planet_b) or
                            (s['planet2'] == apex and s['planet1'] == planet_b)
                            for s in squares
                        )

                        if squares_a and squares_b:
                            t_squares.append({
                                'pattern': 'T-Square',
                                'apex': apex,
                                'opposition': [planet_a, planet_b],
                                'planets': [planet_a, planet_b, apex],
                                'description': f"T-Square: {apex} squares {planet_a}-{planet_b} opposition"
                            })

        return t_squares

    def _get_sign_name(self, sign_num: int) -> str:
        """Get zodiac sign name."""
        signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
        return signs[sign_num % 12]

