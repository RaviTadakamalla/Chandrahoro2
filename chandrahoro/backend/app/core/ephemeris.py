"""Swiss Ephemeris wrapper for astronomical calculations."""

from datetime import datetime, timezone
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

# Try to import Swiss Ephemeris, fall back to mock if not available
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
    logger.info("Swiss Ephemeris loaded successfully")
except ImportError:
    SWISSEPH_AVAILABLE = False
    logger.warning("Swiss Ephemeris not available, using mock calculations")


class EphemerisCalculator:
    """Calculate planetary positions using Swiss Ephemeris."""
    
    # Planet constants
    PLANETS = {
        'Sun': 0,      # SE_SUN
        'Moon': 1,     # SE_MOON
        'Mercury': 2,  # SE_MERCURY
        'Venus': 3,    # SE_VENUS
        'Mars': 4,     # SE_MARS
        'Jupiter': 5,  # SE_JUPITER
        'Saturn': 6,   # SE_SATURN
        'Rahu': 10,    # SE_MEAN_NODE (North Node)
        'Ketu': -1,    # Calculated as opposite of Rahu
        # Outer planets (Western astrology)
        'Uranus': 7,   # SE_URANUS
        'Neptune': 8,  # SE_NEPTUNE
        'Pluto': 9,    # SE_PLUTO
    }

    # Asteroids (Western astrology)
    ASTEROIDS = {
        'Chiron': 2060,  # SE_CHIRON
        'Ceres': 1,      # SE_CERES
        'Pallas': 2,     # SE_PALLAS
        'Juno': 3,       # SE_JUNO
        'Vesta': 4,      # SE_VESTA
    }
    
    # Ayanamsha constants
    AYANAMSHA_SYSTEMS = {
        'Lahiri': 1,        # SE_SIDM_LAHIRI
        'Raman': 3,         # SE_SIDM_RAMAN
        'KP': 5,            # SE_SIDM_KRISHNAMURTI
        'Fagan': 0,         # SE_SIDM_FAGAN_BRADLEY
        'Yukteshwar': 7,    # SE_SIDM_YUKTESHWAR
    }
    
    def __init__(self, ayanamsha: str = 'Lahiri', tropical: bool = False):
        """
        Initialize ephemeris calculator.

        Args:
            ayanamsha: Ayanamsha system (ignored if tropical=True)
            tropical: If True, use tropical zodiac (no ayanamsha correction)
        """
        self.ayanamsha = ayanamsha
        self.tropical = tropical

        if SWISSEPH_AVAILABLE and not tropical:
            # Set ayanamsha system only for sidereal
            ayanamsha_id = self.AYANAMSHA_SYSTEMS.get(ayanamsha, 1)
            swe.set_sid_mode(ayanamsha_id)
    
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
    
    def get_planet_position(self, planet_name: str, jd: float) -> Dict:
        """Get position of a planet at given Julian Day."""
        if SWISSEPH_AVAILABLE:
            return self._calculate_real_position(planet_name, jd)
        else:
            return self._calculate_mock_position(planet_name, jd)
    
    def _calculate_real_position(self, planet_name: str, jd: float) -> Dict:
        """Calculate real position using Swiss Ephemeris."""
        planet_id = self.PLANETS.get(planet_name)

        if planet_name == 'Ketu':
            # Ketu is 180 degrees opposite to Rahu
            rahu_pos = swe.calc_ut(jd, self.PLANETS['Rahu'])[0]
            tropical_long = (rahu_pos[0] + 180) % 360
            speed = -rahu_pos[3]
        else:
            result = swe.calc_ut(jd, planet_id)
            tropical_long = result[0][0]
            speed = result[0][3]

        # For tropical zodiac, use tropical longitude directly
        if self.tropical:
            longitude = tropical_long
            ayanamsha_value = 0.0
        else:
            # For sidereal, subtract ayanamsha
            ayanamsha_value = swe.get_ayanamsa_ut(jd)
            longitude = (tropical_long - ayanamsha_value) % 360

        # Determine sign and degree within sign
        sign_num = int(longitude / 30)
        degree_in_sign = longitude % 30

        # Nakshatras only for Vedic (sidereal)
        if not self.tropical:
            # Determine nakshatra (27 nakshatras, each 13°20')
            # Use 1-based indexing (1-27) to match Dasha calculations
            nakshatra_size = 360 / 27
            nakshatra_num = int(longitude / nakshatra_size) + 1
            nakshatra_degree = longitude % nakshatra_size
            pada = int(nakshatra_degree / (nakshatra_size / 4)) + 1
            # Ensure pada is in valid range (1-4)
            pada = max(1, min(4, pada))
        else:
            nakshatra_num = None
            pada = None

        # Check retrograde
        retrograde = speed < 0

        return {
            'tropical_longitude': tropical_long,
            'sidereal_longitude': longitude if not self.tropical else None,
            'longitude': longitude,  # Primary longitude (tropical or sidereal)
            'sign_number': sign_num,
            'degree_in_sign': degree_in_sign,
            'nakshatra_number': nakshatra_num,
            'pada': pada,
            'speed': speed,
            'retrograde': retrograde,
            'ayanamsha_value': ayanamsha_value,
        }
    
    def _calculate_mock_position(self, planet_name: str, jd: float) -> Dict:
        """Calculate mock position for testing without Swiss Ephemeris."""
        # Mock positions based on planet
        mock_positions = {
            'Sun': 30.5,
            'Moon': 99.8,
            'Mars': 324.7,
            'Mercury': 45.2,
            'Jupiter': 110.5,
            'Venus': 78.3,
            'Saturn': 288.6,
            'Rahu': 150.0,
            'Ketu': 330.0,
        }
        
        sidereal_long = mock_positions.get(planet_name, 0.0)
        sign_num = int(sidereal_long / 30)
        degree_in_sign = sidereal_long % 30
        nakshatra_num = int(sidereal_long / (360 / 27))
        nakshatra_degree = sidereal_long % (360 / 27)
        pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
        
        return {
            'tropical_longitude': sidereal_long + 24.0,  # Mock ayanamsha
            'sidereal_longitude': sidereal_long,
            'sign_number': sign_num,
            'degree_in_sign': degree_in_sign,
            'nakshatra_number': nakshatra_num,
            'pada': pada,
            'speed': 1.0 if planet_name != 'Mars' else -0.5,
            'retrograde': planet_name == 'Mars',
            'ayanamsha_value': 24.0,
        }
    
    def calculate_all_planets(self, dt: datetime) -> Dict[str, Dict]:
        """Calculate positions for all planets."""
        jd = self.calculate_julian_day(dt)
        positions = {}
        
        for planet_name in self.PLANETS.keys():
            if planet_name == 'Ketu':  # Skip Ketu, calculated with Rahu
                continue
            positions[planet_name] = self.get_planet_position(planet_name, jd)
        
        # Calculate Ketu
        positions['Ketu'] = self.get_planet_position('Ketu', jd)
        
        return positions
    
    def calculate_ascendant(self, dt: datetime, latitude: float, longitude: float, house_system: str = 'Placidus') -> Dict:
        """Calculate ascendant (Lagna)."""
        jd = self.calculate_julian_day(dt)

        if SWISSEPH_AVAILABLE:
            # House system mapping
            house_systems = {
                'Placidus': b'P',
                'Whole Sign': b'W',
                'Koch': b'K',
                'Equal': b'E'
            }
            house_code = house_systems.get(house_system, b'P')  # Default to Placidus

            # Calculate houses using specified system
            houses = swe.houses(jd, latitude, longitude, house_code)
            ascendant_tropical = houses[0][0]  # First house cusp is ascendant

            # Get ayanamsha
            ayanamsha_value = swe.get_ayanamsa_ut(jd)
            ascendant_sidereal = (ascendant_tropical - ayanamsha_value) % 360
        else:
            # Mock ascendant calculation
            ascendant_sidereal = 30.5
            ascendant_tropical = 54.5
            ayanamsha_value = 24.0
        
        sign_num = int(ascendant_sidereal / 30)
        degree_in_sign = ascendant_sidereal % 30
        
        return {
            'tropical_longitude': ascendant_tropical,
            'sidereal_longitude': ascendant_sidereal,
            'sign_number': sign_num,
            'degree_in_sign': degree_in_sign,
            'ayanamsha_value': ayanamsha_value,
        }

    def calculate_outer_planets(self, dt: datetime) -> List[Dict]:
        """
        Calculate outer planets (Uranus, Neptune, Pluto) for Western astrology.

        Args:
            dt: Date and time

        Returns:
            List of outer planet positions
        """
        jd = self.calculate_julian_day(dt)
        outer_planets = []

        for planet_name in ['Uranus', 'Neptune', 'Pluto']:
            position = self.get_planet_position(planet_name, jd)
            position['name'] = planet_name
            outer_planets.append(position)

        return outer_planets

    def calculate_asteroids(self, dt: datetime) -> List[Dict]:
        """
        Calculate asteroid positions for Western astrology.

        Args:
            dt: Date and time

        Returns:
            List of asteroid positions
        """
        if not SWISSEPH_AVAILABLE:
            return []

        jd = self.calculate_julian_day(dt)
        asteroids = []

        for asteroid_name, asteroid_id in self.ASTEROIDS.items():
            try:
                result = swe.calc_ut(jd, asteroid_id)
                tropical_long = result[0][0]
                speed = result[0][3]

                if self.tropical:
                    longitude = tropical_long
                    ayanamsha_value = 0.0
                else:
                    ayanamsha_value = swe.get_ayanamsa_ut(jd)
                    longitude = (tropical_long - ayanamsha_value) % 360

                sign_num = int(longitude / 30)
                degree_in_sign = longitude % 30

                asteroids.append({
                    'name': asteroid_name,
                    'tropical_longitude': tropical_long,
                    'sidereal_longitude': longitude if not self.tropical else None,
                    'longitude': longitude,
                    'sign_number': sign_num,
                    'degree_in_sign': degree_in_sign,
                    'speed': speed,
                    'retrograde': speed < 0,
                    'ayanamsha_value': ayanamsha_value,
                })
            except Exception as e:
                logger.warning(f"Failed to calculate {asteroid_name}: {e}")

        return asteroids


def get_sign_name(sign_number: int) -> str:
    """Get zodiac sign name from number (0-11)."""
    signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    return signs[sign_number % 12]


def get_nakshatra_name(nakshatra_number: int) -> str:
    """Get nakshatra name from number (1-27, 1-based indexing)."""
    nakshatras = [
        '',  # Placeholder for index 0 (not used)
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    # Ensure nakshatra_number is in valid range (1-27)
    nakshatra_number = ((nakshatra_number - 1) % 27) + 1
    return nakshatras[nakshatra_number]