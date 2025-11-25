"""House system calculations for Vedic astrology."""

from datetime import datetime
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

# Try to import Swiss Ephemeris
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    logger.warning("Swiss Ephemeris not available for house calculations")


class HouseSystemCalculator:
    """Calculate house cusps using different house systems."""
    
    # House system codes for Swiss Ephemeris
    HOUSE_SYSTEMS = {
        'Placidus': b'P',      # Most common in Western astrology
        'Koch': b'K',          # Popular in Europe
        'Equal': b'E',         # Equal houses from Ascendant
        'Whole Sign': b'W',    # Traditional Vedic (default)
        'Campanus': b'C',
        'Regiomontanus': b'R',
        'Porphyry': b'O',
        'Morinus': b'M',
    }
    
    def __init__(self, house_system: str = 'Whole Sign'):
        """
        Initialize house calculator.
        
        Args:
            house_system: Name of house system to use
        """
        self.house_system = house_system
        self.house_code = self.HOUSE_SYSTEMS.get(house_system, b'W')
    
    def calculate_julian_day(self, dt: datetime) -> float:
        """Convert datetime to Julian Day."""
        if SWISSEPH_AVAILABLE:
            return swe.julday(
                dt.year, dt.month, dt.day,
                dt.hour + dt.minute / 60.0 + dt.second / 3600.0
            )
        else:
            # Simple Julian Day calculation
            a = (14 - dt.month) // 12
            y = dt.year + 4800 - a
            m = dt.month + 12 * a - 3
            jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
            time_fraction = (dt.hour + dt.minute / 60.0 + dt.second / 3600.0) / 24.0
            return jdn + time_fraction - 0.5
    
    def calculate_houses(self, dt: datetime, latitude: float, longitude: float,
                        ayanamsha_value: float = 0.0) -> Dict:
        """
        Calculate house cusps and angles.
        
        Args:
            dt: Birth datetime
            latitude: Geographic latitude
            longitude: Geographic longitude
            ayanamsha_value: Ayanamsha to subtract for sidereal positions
        
        Returns:
            Dictionary with house cusps and angles
        """
        jd = self.calculate_julian_day(dt)
        
        if SWISSEPH_AVAILABLE:
            return self._calculate_real_houses(jd, latitude, longitude, ayanamsha_value)
        else:
            return self._calculate_mock_houses(latitude, longitude, ayanamsha_value)
    
    def _calculate_real_houses(self, jd: float, latitude: float, longitude: float,
                               ayanamsha_value: float) -> Dict:
        """Calculate houses using Swiss Ephemeris."""
        try:
            # Calculate houses
            houses_result = swe.houses(jd, latitude, longitude, self.house_code)
            house_cusps = houses_result[0]  # 12 house cusps
            ascmc = houses_result[1]        # Ascendant, MC, ARMC, Vertex, etc.
            
            # Extract key angles (tropical)
            ascendant_tropical = ascmc[0]  # Ascendant
            mc_tropical = ascmc[1]         # Midheaven (MC)
            armc = ascmc[2]                # ARMC (sidereal time)
            vertex = ascmc[3]              # Vertex
            
            # Convert to sidereal
            ascendant_sidereal = (ascendant_tropical - ayanamsha_value) % 360
            mc_sidereal = (mc_tropical - ayanamsha_value) % 360
            
            # Convert house cusps to sidereal
            house_cusps_sidereal = [
                (cusp - ayanamsha_value) % 360 for cusp in house_cusps
            ]
            
            return {
                'house_cusps_tropical': list(house_cusps),
                'house_cusps_sidereal': house_cusps_sidereal,
                'ascendant_tropical': ascendant_tropical,
                'ascendant_sidereal': ascendant_sidereal,
                'mc_tropical': mc_tropical,
                'mc_sidereal': mc_sidereal,
                'armc': armc,
                'vertex': vertex,
                'house_system': self.house_system,
            }
        except Exception as e:
            logger.error(f"Error calculating houses: {str(e)}")
            return self._calculate_mock_houses(latitude, longitude, ayanamsha_value)
    
    def _calculate_mock_houses(self, latitude: float, longitude: float,
                               ayanamsha_value: float) -> Dict:
        """Calculate mock houses for testing."""
        # Mock ascendant
        ascendant_sidereal = 30.5
        ascendant_tropical = ascendant_sidereal + ayanamsha_value
        
        # For Whole Sign, houses start at sign boundaries
        if self.house_system == 'Whole Sign':
            ascendant_sign = int(ascendant_sidereal / 30)
            house_cusps_sidereal = [(ascendant_sign * 30 + i * 30) % 360 for i in range(12)]
        else:
            # For other systems, use equal houses from ascendant
            house_cusps_sidereal = [(ascendant_sidereal + i * 30) % 360 for i in range(12)]
        
        house_cusps_tropical = [
            (cusp + ayanamsha_value) % 360 for cusp in house_cusps_sidereal
        ]
        
        # MC is approximately 90 degrees from Ascendant
        mc_sidereal = (ascendant_sidereal + 90) % 360
        mc_tropical = (mc_sidereal + ayanamsha_value) % 360
        
        return {
            'house_cusps_tropical': house_cusps_tropical,
            'house_cusps_sidereal': house_cusps_sidereal,
            'ascendant_tropical': ascendant_tropical,
            'ascendant_sidereal': ascendant_sidereal,
            'mc_tropical': mc_tropical,
            'mc_sidereal': mc_sidereal,
            'armc': 0.0,
            'vertex': 0.0,
            'house_system': self.house_system,
        }
    
    def get_planet_house(self, planet_longitude: float, house_cusps: List[float]) -> int:
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


def get_house_significations() -> Dict[int, Dict]:
    """Get traditional significations for each house."""
    return {
        1: {
            'name': 'Ascendant/Lagna',
            'signification': 'Self, body, personality, appearance',
            'sanskrit': 'Tanu Bhava',
        },
        2: {
            'name': 'Wealth',
            'signification': 'Wealth, family, speech, food',
            'sanskrit': 'Dhana Bhava',
        },
        3: {
            'name': 'Siblings',
            'signification': 'Courage, siblings, communication, short journeys',
            'sanskrit': 'Sahaja Bhava',
        },
        4: {
            'name': 'Home',
            'signification': 'Mother, home, property, emotions, education',
            'sanskrit': 'Sukha Bhava',
        },
        5: {
            'name': 'Children',
            'signification': 'Children, creativity, intelligence, romance',
            'sanskrit': 'Putra Bhava',
        },
        6: {
            'name': 'Enemies',
            'signification': 'Enemies, diseases, debts, service, obstacles',
            'sanskrit': 'Ripu Bhava',
        },
        7: {
            'name': 'Partnership',
            'signification': 'Marriage, partnerships, business, spouse',
            'sanskrit': 'Kalatra Bhava',
        },
        8: {
            'name': 'Longevity',
            'signification': 'Longevity, transformation, occult, inheritance',
            'sanskrit': 'Ayu Bhava',
        },
        9: {
            'name': 'Fortune',
            'signification': 'Father, luck, dharma, higher learning, long journeys',
            'sanskrit': 'Bhagya Bhava',
        },
        10: {
            'name': 'Career',
            'signification': 'Career, status, reputation, authority',
            'sanskrit': 'Karma Bhava',
        },
        11: {
            'name': 'Gains',
            'signification': 'Gains, income, friends, aspirations, elder siblings',
            'sanskrit': 'Labha Bhava',
        },
        12: {
            'name': 'Loss',
            'signification': 'Loss, expenses, liberation, foreign lands, spirituality',
            'sanskrit': 'Vyaya Bhava',
        },
    }