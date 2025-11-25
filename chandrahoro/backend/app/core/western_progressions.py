"""Western Progressions Calculator.

Implements:
- Secondary Progressions (1 day = 1 year)
- Solar Arc Directions
- Progressed Moon phases
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.core.ephemeris import EphemerisCalculator
import logging

logger = logging.getLogger(__name__)


class ProgressionCalculator:
    """Calculate Western astrological progressions."""
    
    def __init__(self, ephemeris: EphemerisCalculator):
        """
        Initialize progression calculator.
        
        Args:
            ephemeris: Ephemeris calculator instance
        """
        self.ephemeris = ephemeris
    
    def calculate_secondary_progressions(
        self,
        birth_date: datetime,
        target_date: datetime
    ) -> Dict[str, Any]:
        """
        Calculate secondary progressions.
        
        In secondary progressions, 1 day after birth = 1 year of life.
        
        Args:
            birth_date: Date and time of birth
            target_date: Date to calculate progressions for
            
        Returns:
            Progressed planetary positions
        """
        # Calculate age in years
        age_days = (target_date - birth_date).days
        age_years = age_days / 365.25
        
        # Progressed date = birth_date + age_years days
        progressed_date = birth_date + timedelta(days=age_years)
        
        logger.info(f"Calculating secondary progressions for age {age_years:.2f} years")
        logger.info(f"Progressed date: {progressed_date}")
        
        # Calculate planetary positions for progressed date
        progressed_planets = self.ephemeris.calculate_all_planets(progressed_date)
        
        # Add outer planets if available
        try:
            outer_planets = self.ephemeris.calculate_outer_planets(progressed_date)
            for planet in outer_planets:
                progressed_planets[planet['name']] = planet
        except Exception as e:
            logger.warning(f"Could not calculate outer planets for progressions: {e}")
        
        return {
            'type': 'secondary_progressions',
            'birth_date': birth_date.isoformat(),
            'target_date': target_date.isoformat(),
            'progressed_date': progressed_date.isoformat(),
            'age_years': round(age_years, 2),
            'progressed_planets': progressed_planets
        }
    
    def calculate_solar_arc_directions(
        self,
        birth_date: datetime,
        target_date: datetime,
        natal_planets: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate Solar Arc Directions.
        
        In Solar Arc, all planets move by the same amount as the Sun
        has progressed (approximately 1° per year).
        
        Args:
            birth_date: Date and time of birth
            target_date: Date to calculate for
            natal_planets: Natal planet positions
            
        Returns:
            Solar arc directed positions
        """
        # Calculate age in years
        age_days = (target_date - birth_date).days
        age_years = age_days / 365.25
        
        # Calculate progressed Sun position
        progressed_date = birth_date + timedelta(days=age_years)
        progressed_sun = self.ephemeris.get_planet_position('Sun', 
                                                            self.ephemeris.calculate_julian_day(progressed_date))
        
        # Get natal Sun position
        natal_sun_long = natal_planets.get('Sun', {}).get('longitude', 0)
        progressed_sun_long = progressed_sun.get('longitude', 0)
        
        # Calculate solar arc (difference between progressed and natal Sun)
        solar_arc = (progressed_sun_long - natal_sun_long) % 360
        
        logger.info(f"Solar arc for age {age_years:.2f} years: {solar_arc:.2f}°")
        
        # Apply solar arc to all natal planets
        directed_planets = {}
        for planet_name, planet_data in natal_planets.items():
            natal_long = planet_data.get('longitude', 0)
            directed_long = (natal_long + solar_arc) % 360
            
            sign_num = int(directed_long / 30)
            degree_in_sign = directed_long % 30
            
            directed_planets[planet_name] = {
                'longitude': directed_long,
                'sign_number': sign_num,
                'degree_in_sign': degree_in_sign,
                'natal_longitude': natal_long,
                'arc_applied': solar_arc
            }
        
        return {
            'type': 'solar_arc_directions',
            'birth_date': birth_date.isoformat(),
            'target_date': target_date.isoformat(),
            'age_years': round(age_years, 2),
            'solar_arc': round(solar_arc, 2),
            'directed_planets': directed_planets
        }
    
    def calculate_progressed_moon_phase(
        self,
        birth_date: datetime,
        target_date: datetime
    ) -> Dict[str, Any]:
        """
        Calculate progressed Moon phase.
        
        Args:
            birth_date: Date and time of birth
            target_date: Date to calculate for
            
        Returns:
            Progressed Moon phase information
        """
        # Calculate age in years
        age_days = (target_date - birth_date).days
        age_years = age_days / 365.25
        
        # Progressed date
        progressed_date = birth_date + timedelta(days=age_years)
        
        # Calculate progressed Sun and Moon
        jd = self.ephemeris.calculate_julian_day(progressed_date)
        prog_sun = self.ephemeris.get_planet_position('Sun', jd)
        prog_moon = self.ephemeris.get_planet_position('Moon', jd)
        
        sun_long = prog_sun.get('longitude', 0)
        moon_long = prog_moon.get('longitude', 0)
        
        # Calculate phase angle
        phase_angle = (moon_long - sun_long) % 360
        
        # Determine phase name
        phase_name = self._get_moon_phase_name(phase_angle)
        
        return {
            'progressed_date': progressed_date.isoformat(),
            'age_years': round(age_years, 2),
            'phase_angle': round(phase_angle, 2),
            'phase_name': phase_name,
            'sun_longitude': round(sun_long, 2),
            'moon_longitude': round(moon_long, 2)
        }
    
    def _get_moon_phase_name(self, phase_angle: float) -> str:
        """Get Moon phase name from phase angle."""
        if phase_angle < 45:
            return "New Moon"
        elif phase_angle < 90:
            return "Waxing Crescent"
        elif phase_angle < 135:
            return "First Quarter"
        elif phase_angle < 180:
            return "Waxing Gibbous"
        elif phase_angle < 225:
            return "Full Moon"
        elif phase_angle < 270:
            return "Waning Gibbous"
        elif phase_angle < 315:
            return "Last Quarter"
        else:
            return "Waning Crescent"

