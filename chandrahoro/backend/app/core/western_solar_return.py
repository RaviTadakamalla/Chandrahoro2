"""Western Solar Return Calculator.

Calculates Solar Return charts - annual charts cast for the moment
the Sun returns to its exact natal position.
"""

from typing import Dict, Any
from datetime import datetime, timedelta
from app.core.ephemeris import EphemerisCalculator
import logging

logger = logging.getLogger(__name__)


class SolarReturnCalculator:
    """Calculate Solar Return charts."""
    
    def __init__(self, ephemeris: EphemerisCalculator):
        """
        Initialize solar return calculator.
        
        Args:
            ephemeris: Ephemeris calculator instance
        """
        self.ephemeris = ephemeris
    
    def calculate_solar_return(
        self,
        birth_date: datetime,
        natal_sun_longitude: float,
        return_year: int,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Calculate Solar Return chart for a specific year.
        
        Args:
            birth_date: Original birth date
            natal_sun_longitude: Natal Sun's longitude
            return_year: Year to calculate solar return for
            latitude: Latitude for solar return location
            longitude: Longitude for solar return location
            
        Returns:
            Solar return chart data
        """
        logger.info(f"Calculating Solar Return for year {return_year}")
        
        # Find the exact moment when Sun returns to natal position
        solar_return_time = self._find_solar_return_time(
            birth_date, natal_sun_longitude, return_year
        )
        
        if not solar_return_time:
            logger.error(f"Could not find solar return time for year {return_year}")
            return {}
        
        logger.info(f"Solar return time: {solar_return_time}")
        
        # Calculate planetary positions at solar return time
        planets = self.ephemeris.calculate_all_planets(solar_return_time)
        
        # Add outer planets
        try:
            outer_planets = self.ephemeris.calculate_outer_planets(solar_return_time)
            for planet in outer_planets:
                planets[planet['name']] = planet
        except Exception as e:
            logger.warning(f"Could not calculate outer planets: {e}")
        
        # Calculate ascendant and houses for solar return location
        ascendant_data = self.ephemeris.calculate_ascendant(
            dt=solar_return_time,
            latitude=latitude,
            longitude=longitude,
            house_system='Placidus'
        )
        
        return {
            'type': 'solar_return',
            'return_year': return_year,
            'return_time': solar_return_time.isoformat(),
            'location': {
                'latitude': latitude,
                'longitude': longitude
            },
            'natal_sun_longitude': round(natal_sun_longitude, 6),
            'planets': planets,
            'ascendant': ascendant_data
        }
    
    def _find_solar_return_time(
        self,
        birth_date: datetime,
        natal_sun_longitude: float,
        return_year: int
    ) -> datetime:
        """
        Find the exact time when Sun returns to natal position.
        
        Uses binary search to find the moment within a few seconds.
        
        Args:
            birth_date: Original birth date
            natal_sun_longitude: Natal Sun's longitude
            return_year: Year to find solar return for
            
        Returns:
            Datetime of solar return
        """
        # Start with birthday in the return year
        start_date = datetime(return_year, birth_date.month, birth_date.day, 
                             birth_date.hour, birth_date.minute, birth_date.second)
        
        # Search window: 2 days before to 2 days after birthday
        search_start = start_date - timedelta(days=2)
        search_end = start_date + timedelta(days=2)
        
        # Binary search for exact solar return time
        tolerance = 0.01  # 0.01 degrees tolerance
        max_iterations = 50
        
        for _ in range(max_iterations):
            mid_time = search_start + (search_end - search_start) / 2
            
            # Calculate Sun position at mid time
            jd = self.ephemeris.calculate_julian_day(mid_time)
            sun_pos = self.ephemeris.get_planet_position('Sun', jd)
            current_sun_long = sun_pos.get('longitude', 0)
            
            # Calculate difference (accounting for 360° wrap)
            diff = self._angular_difference(current_sun_long, natal_sun_longitude)
            
            # Check if we're close enough
            if abs(diff) < tolerance:
                logger.info(f"Found solar return time with {abs(diff):.4f}° accuracy")
                return mid_time
            
            # Adjust search window
            if diff < 0:
                search_start = mid_time
            else:
                search_end = mid_time
            
            # Check if search window is too small
            if (search_end - search_start).total_seconds() < 1:
                break
        
        # Return best approximation
        logger.warning(f"Solar return time found with {abs(diff):.4f}° accuracy (tolerance: {tolerance}°)")
        return mid_time
    
    def _angular_difference(self, angle1: float, angle2: float) -> float:
        """
        Calculate the shortest angular difference between two angles.
        
        Returns positive if angle1 > angle2, negative otherwise.
        """
        diff = angle1 - angle2
        
        # Normalize to -180 to +180
        while diff > 180:
            diff -= 360
        while diff < -180:
            diff += 360
        
        return diff

