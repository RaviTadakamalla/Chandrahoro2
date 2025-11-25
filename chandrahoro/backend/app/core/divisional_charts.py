"""Divisional chart calculations for Vedic astrology."""

from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class DivisionalChartCalculator:
    """Calculate various divisional charts (Vargas) in Vedic astrology."""
    
    # Divisional chart definitions
    DIVISIONAL_CHARTS = {
        'D1': {'name': 'Rasi', 'divisions': 1, 'description': 'Main birth chart'},
        'D2': {'name': 'Hora', 'divisions': 2, 'description': 'Wealth and prosperity'},
        'D3': {'name': 'Drekkana', 'divisions': 3, 'description': 'Siblings and courage'},
        'D4': {'name': 'Chaturthamsa', 'divisions': 4, 'description': 'Fortune and property'},
        'D7': {'name': 'Saptamsa', 'divisions': 7, 'description': 'Children and creativity'},
        'D9': {'name': 'Navamsa', 'divisions': 9, 'description': 'Marriage and dharma'},
        'D10': {'name': 'Dasamsa', 'divisions': 10, 'description': 'Career and profession'},
        'D12': {'name': 'Dvadasamsa', 'divisions': 12, 'description': 'Parents and ancestry'},
        'D16': {'name': 'Shodasamsa', 'divisions': 16, 'description': 'Vehicles and happiness'},
        'D20': {'name': 'Vimsamsa', 'divisions': 20, 'description': 'Spiritual pursuits'},
        'D24': {'name': 'Chaturvimsamsa', 'divisions': 24, 'description': 'Learning and education'},
        'D27': {'name': 'Bhamsa', 'divisions': 27, 'description': 'Strengths and weaknesses'},
        'D30': {'name': 'Trimsamsa', 'divisions': 30, 'description': 'Misfortunes and evils'},
        'D40': {'name': 'Khavedamsa', 'divisions': 40, 'description': 'Maternal heritage'},
        'D45': {'name': 'Akshavedamsa', 'divisions': 45, 'description': 'Character and conduct'},
        'D60': {'name': 'Shashtyamsa', 'divisions': 60, 'description': 'Past life karma'}
    }
    
    def __init__(self):
        """Initialize divisional chart calculator."""
        pass
    
    def calculate_divisional_position(self, longitude: float, chart_type: str) -> Dict[str, Any]:
        """
        Calculate position in a divisional chart.
        
        Args:
            longitude: Sidereal longitude of planet in degrees
            chart_type: Type of divisional chart (D1, D9, D10, etc.)
            
        Returns:
            Dictionary with divisional chart position
        """
        if chart_type not in self.DIVISIONAL_CHARTS:
            raise ValueError(f"Unknown divisional chart type: {chart_type}")
        
        divisions = self.DIVISIONAL_CHARTS[chart_type]['divisions']
        
        if chart_type == 'D1':
            # D1 is the main chart, no conversion needed
            return self._get_position_details(longitude)
        elif chart_type == 'D9':
            # Navamsa calculation
            return self._calculate_navamsa(longitude)
        elif chart_type == 'D10':
            # Dasamsa calculation
            return self._calculate_dasamsa(longitude)
        else:
            # Generic divisional chart calculation
            return self._calculate_generic_divisional(longitude, divisions)
    
    def _calculate_navamsa(self, longitude: float) -> Dict[str, Any]:
        """
        Calculate Navamsa (D9) position.
        
        Navamsa calculation:
        - Each sign is divided into 9 parts of 3°20' each
        - The navamsa sign depends on the sign and the navamsa within that sign
        """
        # Get the sign (0-11) and degree within sign
        sign_num = int(longitude / 30)
        degree_in_sign = longitude % 30
        
        # Calculate navamsa number within the sign (0-8)
        navamsa_in_sign = int(degree_in_sign / (30 / 9))
        
        # Calculate navamsa sign based on the original sign and navamsa number
        # Navamsa signs follow a specific pattern based on the original sign
        if sign_num % 3 == 0:  # Aries, Cancer, Libra, Capricorn (Movable signs)
            navamsa_sign = (sign_num + navamsa_in_sign) % 12
        elif sign_num % 3 == 1:  # Taurus, Leo, Scorpio, Aquarius (Fixed signs)
            navamsa_sign = (sign_num + 8 + navamsa_in_sign) % 12
        else:  # Gemini, Virgo, Sagittarius, Pisces (Dual signs)
            navamsa_sign = (sign_num + 4 + navamsa_in_sign) % 12
        
        # Calculate degree within navamsa sign
        degree_in_navamsa_part = degree_in_sign % (30 / 9)
        navamsa_longitude = navamsa_sign * 30 + (degree_in_navamsa_part * 9)
        
        return self._get_position_details(navamsa_longitude)
    
    def _calculate_dasamsa(self, longitude: float) -> Dict[str, Any]:
        """
        Calculate Dasamsa (D10) position.
        
        Dasamsa calculation:
        - Each sign is divided into 10 parts of 3° each
        - For odd signs: starts from the same sign
        - For even signs: starts from the 9th sign from it
        """
        # Get the sign (0-11) and degree within sign
        sign_num = int(longitude / 30)
        degree_in_sign = longitude % 30
        
        # Calculate dasamsa number within the sign (0-9)
        dasamsa_in_sign = int(degree_in_sign / (30 / 10))
        
        # Calculate dasamsa sign
        if sign_num % 2 == 0:  # Odd signs (Aries=0, Gemini=2, etc.)
            dasamsa_sign = (sign_num + dasamsa_in_sign) % 12
        else:  # Even signs (Taurus=1, Cancer=3, etc.)
            dasamsa_sign = (sign_num + 8 + dasamsa_in_sign) % 12
        
        # Calculate degree within dasamsa sign
        degree_in_dasamsa_part = degree_in_sign % (30 / 10)
        dasamsa_longitude = dasamsa_sign * 30 + (degree_in_dasamsa_part * 10)
        
        return self._get_position_details(dasamsa_longitude)
    
    def _calculate_generic_divisional(self, longitude: float, divisions: int) -> Dict[str, Any]:
        """
        Calculate generic divisional chart position.
        
        Args:
            longitude: Sidereal longitude
            divisions: Number of divisions per sign
        """
        # Get the sign and degree within sign
        sign_num = int(longitude / 30)
        degree_in_sign = longitude % 30
        
        # Calculate division within the sign
        division_size = 30 / divisions
        division_in_sign = int(degree_in_sign / division_size)
        
        # For generic calculation, map to signs sequentially
        divisional_sign = (sign_num * divisions + division_in_sign) % 12
        
        # Calculate degree within divisional sign
        degree_in_division = degree_in_sign % division_size
        divisional_longitude = divisional_sign * 30 + (degree_in_division * divisions)
        
        return self._get_position_details(divisional_longitude)
    
    def _get_position_details(self, longitude: float) -> Dict[str, Any]:
        """Get detailed position information from longitude."""
        sign_num = int(longitude / 30) % 12
        degree_in_sign = longitude % 30
        
        # Calculate nakshatra (for reference, though less relevant in divisional charts)
        nakshatra_num = int(longitude / (360 / 27)) % 27
        nakshatra_degree = longitude % (360 / 27)
        pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
        
        return {
            'longitude': longitude,
            'sign_number': sign_num,
            'degree_in_sign': degree_in_sign,
            'nakshatra_number': nakshatra_num,
            'pada': pada
        }
    
    def calculate_all_divisional_charts(self, planet_positions: Dict[str, Dict], 
                                     chart_types: List[str] = None) -> Dict[str, Dict]:
        """
        Calculate multiple divisional charts for all planets.
        
        Args:
            planet_positions: Dictionary of planet positions from main chart
            chart_types: List of chart types to calculate (default: D1, D9, D10)
            
        Returns:
            Dictionary with divisional chart data
        """
        if chart_types is None:
            chart_types = ['D1', 'D9', 'D10']
        
        divisional_charts = {}
        
        for chart_type in chart_types:
            if chart_type not in self.DIVISIONAL_CHARTS:
                logger.warning(f"Unknown chart type: {chart_type}")
                continue
            
            chart_data = {
                'name': self.DIVISIONAL_CHARTS[chart_type]['name'],
                'description': self.DIVISIONAL_CHARTS[chart_type]['description'],
                'planets': {}
            }
            
            for planet_name, position_data in planet_positions.items():
                sidereal_longitude = position_data.get('sidereal_longitude', 0.0)
                
                divisional_position = self.calculate_divisional_position(
                    sidereal_longitude, chart_type
                )
                
                chart_data['planets'][planet_name] = divisional_position
            
            divisional_charts[chart_type] = chart_data
        
        return divisional_charts
    
    def get_chart_info(self, chart_type: str) -> Dict[str, Any]:
        """Get information about a specific divisional chart."""
        return self.DIVISIONAL_CHARTS.get(chart_type, {})
    
    def get_available_charts(self) -> List[str]:
        """Get list of available divisional chart types."""
        return list(self.DIVISIONAL_CHARTS.keys())


def get_sign_name(sign_number: int) -> str:
    """Get zodiac sign name from number (0-11)."""
    signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]
    return signs[sign_number % 12]


def get_nakshatra_name(nakshatra_number: int) -> str:
    """Get nakshatra name from number (0-26)."""
    nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    return nakshatras[nakshatra_number % 27]
