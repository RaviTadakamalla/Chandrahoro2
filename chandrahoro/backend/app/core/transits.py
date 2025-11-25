"""Transit calculations for Vedic astrology."""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

from app.core.ephemeris import EphemerisCalculator, get_sign_name, get_nakshatra_name

logger = logging.getLogger(__name__)


@dataclass
class TransitPosition:
    """Current transit position of a planet."""
    planet: str
    current_longitude: float
    current_sign: str
    current_degree: float
    current_nakshatra: str
    current_pada: int
    current_house: int  # Relative to natal chart
    speed: float
    retrograde: bool
    next_sign_change: Optional[datetime]
    days_in_current_sign: int


@dataclass
class TransitAspect:
    """Transit aspect to natal planet."""
    transiting_planet: str
    natal_planet: str
    aspect_type: str  # 'conjunction', 'opposition', 'trine', 'square', etc.
    orb: float
    exact_date: Optional[datetime]
    strength: str  # 'applying', 'exact', 'separating'
    effect: str  # 'beneficial', 'challenging', 'neutral'


@dataclass
class SignificantTransit:
    """Significant transit event."""
    planet: str
    event_type: str  # 'sign_change', 'retrograde_start', 'retrograde_end', 'aspect'
    date: datetime
    description: str
    significance: str  # 'high', 'medium', 'low'
    duration_days: Optional[int]


class TransitCalculator:
    """Calculate current planetary transits and their effects."""

    # Planet speeds (average degrees per day)
    PLANET_SPEEDS = {
        'Sun': 1.0,
        'Moon': 13.2,
        'Mercury': 1.4,
        'Venus': 1.2,
        'Mars': 0.5,
        'Jupiter': 0.083,
        'Saturn': 0.033,
        'Rahu': -0.053,  # Retrograde motion
        'Ketu': -0.053   # Retrograde motion
    }

    # Aspect orbs for transits (tighter than natal)
    TRANSIT_ORBS = {
        'conjunction': 8.0,
        'opposition': 8.0,
        'trine': 6.0,
        'square': 6.0,
        'sextile': 4.0
    }

    def __init__(self, ayanamsha: str = "LAHIRI"):
        """Initialize transit calculator."""
        self.ephemeris = EphemerisCalculator(ayanamsha=ayanamsha)

    def get_current_transits(self, natal_chart_data: Dict,
                           current_date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Get current planetary transits relative to natal chart.

        Args:
            natal_chart_data: Natal chart data with planetary positions
            current_date: Date for transit calculation (default: now)

        Returns:
            Dictionary with current transit positions and aspects
        """
        if current_date is None:
            current_date = datetime.now()

        # Calculate current planetary positions
        current_positions = self._calculate_current_positions(current_date)

        # Get natal planetary positions
        natal_positions = self._extract_natal_positions(natal_chart_data)

        # Calculate transit positions relative to natal chart
        transit_positions = self._calculate_transit_positions(
            current_positions, natal_positions, natal_chart_data.get('ascendant_sign', 'Aries')
        )

        # Calculate transit aspects to natal planets
        transit_aspects = self._calculate_transit_aspects(current_positions, natal_positions)

        # Find significant transits
        significant_transits = self._find_significant_transits(
            current_positions, natal_positions, current_date
        )

        return {
            "calculation_date": current_date.isoformat(),
            "transit_positions": [pos.__dict__ for pos in transit_positions],
            "transit_aspects": [asp.__dict__ for asp in transit_aspects],
            "significant_transits": [trans.__dict__ for trans in significant_transits],
            "summary": self._create_transit_summary(transit_positions, transit_aspects)
        }

    def _calculate_current_positions(self, date: datetime) -> Dict[str, Dict]:
        """Calculate current planetary positions."""
        positions = {}

        planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']

        for planet in planets:
            try:
                pos_data = self.ephemeris.get_planet_position(date, planet)
                positions[planet] = pos_data
            except Exception as e:
                logger.warning(f"Could not calculate position for {planet}: {e}")
                # Use approximate position
                positions[planet] = self._get_approximate_position(planet, date)

        return positions

    def _get_approximate_position(self, planet: str, date: datetime) -> Dict:
        """Get approximate position when exact calculation fails."""
        # This is a fallback - in production, you'd want more sophisticated handling
        base_longitudes = {
            'Sun': 280.0, 'Moon': 0.0, 'Mercury': 290.0, 'Venus': 300.0,
            'Mars': 120.0, 'Jupiter': 60.0, 'Saturn': 300.0, 'Rahu': 180.0, 'Ketu': 0.0
        }

        # Simple approximation based on average motion
        days_since_epoch = (date - datetime(2000, 1, 1)).days
        speed = self.PLANET_SPEEDS.get(planet, 1.0)
        longitude = (base_longitudes[planet] + speed * days_since_epoch) % 360

        sign_num = int(longitude // 30)
        degree_in_sign = longitude % 30

        return {
            'tropical_longitude': longitude,
            'sidereal_longitude': longitude,
            'sign_number': sign_num,
            'degree_in_sign': degree_in_sign,
            'nakshatra_number': int(longitude * 27 / 360) % 27,
            'pada': int((longitude * 27 / 360) % 1 * 4) + 1,
            'speed': speed,
            'retrograde': speed < 0
        }

    def _extract_natal_positions(self, natal_chart: Dict) -> Dict[str, Dict]:
        """Extract natal planetary positions from chart data."""
        natal_positions = {}

        if 'planets' in natal_chart:
            for planet in natal_chart['planets']:
                natal_positions[planet['name']] = {
                    'longitude': planet.get('sidereal_longitude', 0),
                    'sign': planet.get('sign', 'Aries'),
                    'house': planet.get('house', 1),
                    'degree': planet.get('degree_in_sign', 0)
                }

        return natal_positions

    def _calculate_transit_positions(self, current_positions: Dict, natal_positions: Dict,
                                   natal_ascendant: str) -> List[TransitPosition]:
        """Calculate transit positions relative to natal chart."""
        transit_positions = []

        # Get natal ascendant sign number
        natal_asc_num = self._get_sign_number(natal_ascendant)

        for planet, pos_data in current_positions.items():
            # Calculate house position relative to natal ascendant
            current_sign_num = pos_data['sign_number']
            house_num = ((current_sign_num - natal_asc_num) % 12) + 1

            # Calculate next sign change
            next_sign_change = self._calculate_next_sign_change(planet, pos_data)

            # Calculate days in current sign
            days_in_sign = self._calculate_days_in_current_sign(planet, pos_data)

            transit_pos = TransitPosition(
                planet=planet,
                current_longitude=pos_data['sidereal_longitude'],
                current_sign=get_sign_name(pos_data['sign_number']),
                current_degree=pos_data['degree_in_sign'],
                current_nakshatra=get_nakshatra_name(pos_data['nakshatra_number']),
                current_pada=pos_data['pada'],
                current_house=house_num,
                speed=pos_data['speed'],
                retrograde=pos_data['retrograde'],
                next_sign_change=next_sign_change,
                days_in_current_sign=days_in_sign
            )

            transit_positions.append(transit_pos)

        return transit_positions

    def _calculate_transit_aspects(self, current_positions: Dict,
                                 natal_positions: Dict) -> List[TransitAspect]:
        """Calculate transit aspects to natal planets."""
        aspects = []

        for transit_planet, transit_pos in current_positions.items():
            for natal_planet, natal_pos in natal_positions.items():
                aspect = self._check_transit_aspect(
                    transit_planet, transit_pos, natal_planet, natal_pos
                )
                if aspect:
                    aspects.append(aspect)

        return aspects

    def _check_transit_aspect(self, transit_planet: str, transit_pos: Dict,
                            natal_planet: str, natal_pos: Dict) -> Optional[TransitAspect]:
        """Check if there's a significant aspect between transiting and natal planet."""
        transit_long = transit_pos['sidereal_longitude']
        natal_long = natal_pos['longitude']

        # Calculate angular difference
        diff = abs(transit_long - natal_long)
        if diff > 180:
            diff = 360 - diff

        # Check for major aspects
        aspect_type = None
        orb_limit = 0

        if diff <= self.TRANSIT_ORBS['conjunction']:
            aspect_type = 'conjunction'
            orb_limit = self.TRANSIT_ORBS['conjunction']
        elif abs(diff - 180) <= self.TRANSIT_ORBS['opposition']:
            aspect_type = 'opposition'
            orb_limit = self.TRANSIT_ORBS['opposition']
        elif abs(diff - 120) <= self.TRANSIT_ORBS['trine']:
            aspect_type = 'trine'
            orb_limit = self.TRANSIT_ORBS['trine']
        elif abs(diff - 90) <= self.TRANSIT_ORBS['square']:
            aspect_type = 'square'
            orb_limit = self.TRANSIT_ORBS['square']
        elif abs(diff - 60) <= self.TRANSIT_ORBS['sextile']:
            aspect_type = 'sextile'
            orb_limit = self.TRANSIT_ORBS['sextile']

        if aspect_type:
            orb = min(diff, abs(diff - 180), abs(diff - 120), abs(diff - 90), abs(diff - 60))

            # Determine effect
            effect = self._determine_aspect_effect(transit_planet, natal_planet, aspect_type)

            return TransitAspect(
                transiting_planet=transit_planet,
                natal_planet=natal_planet,
                aspect_type=aspect_type,
                orb=orb,
                exact_date=None,  # Would need more calculation for exact timing
                strength='applying',  # Simplified
                effect=effect
            )

        return None

    def _find_significant_transits(self, current_positions: Dict, natal_positions: Dict,
                                 current_date: datetime) -> List[SignificantTransit]:
        """Find significant transit events."""
        significant = []

        # Check for slow planet transits (Jupiter, Saturn)
        slow_planets = ['Jupiter', 'Saturn']

        for planet in slow_planets:
            if planet in current_positions:
                pos = current_positions[planet]

                # Check if planet is changing signs soon
                if pos['degree_in_sign'] > 25 or pos['degree_in_sign'] < 5:
                    significance = 'high' if planet == 'Saturn' else 'medium'

                    event = SignificantTransit(
                        planet=planet,
                        event_type='sign_change',
                        date=current_date,
                        description=f"{planet} {'entering' if pos['degree_in_sign'] < 5 else 'about to enter'} {get_sign_name((pos['sign_number'] + 1) % 12)}",
                        significance=significance,
                        duration_days=None
                    )
                    significant.append(event)

        return significant

    def _calculate_next_sign_change(self, planet: str, pos_data: Dict) -> Optional[datetime]:
        """Calculate when planet will change signs."""
        current_degree = pos_data['degree_in_sign']
        speed = abs(pos_data['speed'])

        if speed > 0:
            degrees_to_next_sign = 30 - current_degree
            days_to_change = degrees_to_next_sign / speed
            return datetime.now() + timedelta(days=days_to_change)

        return None

    def _calculate_days_in_current_sign(self, planet: str, pos_data: Dict) -> int:
        """Calculate how many days planet has been in current sign."""
        current_degree = pos_data['degree_in_sign']
        speed = abs(pos_data['speed'])

        if speed > 0:
            return int(current_degree / speed)

        return 0

    def _determine_aspect_effect(self, transit_planet: str, natal_planet: str, aspect_type: str) -> str:
        """Determine if aspect is beneficial, challenging, or neutral."""
        benefic_planets = ['Venus', 'Jupiter', 'Moon']
        malefic_planets = ['Mars', 'Saturn', 'Rahu', 'Ketu']

        beneficial_aspects = ['trine', 'sextile']
        challenging_aspects = ['square', 'opposition']

        if aspect_type in beneficial_aspects:
            return 'beneficial'
        elif aspect_type in challenging_aspects:
            return 'challenging'
        elif aspect_type == 'conjunction':
            if transit_planet in benefic_planets:
                return 'beneficial'
            elif transit_planet in malefic_planets:
                return 'challenging'

        return 'neutral'

    def _get_sign_number(self, sign_name: str) -> int:
        """Convert sign name to number (0-11)."""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        try:
            return signs.index(sign_name)
        except ValueError:
            return 0

    def _create_transit_summary(self, positions: List[TransitPosition],
                              aspects: List[TransitAspect]) -> Dict[str, Any]:
        """Create a summary of current transits."""
        total_aspects = len(aspects)
        beneficial_aspects = len([a for a in aspects if a.effect == 'beneficial'])
        challenging_aspects = len([a for a in aspects if a.effect == 'challenging'])

        # Find most active planet (most aspects)
        planet_aspect_count = {}
        for aspect in aspects:
            planet = aspect.transiting_planet
            planet_aspect_count[planet] = planet_aspect_count.get(planet, 0) + 1

        most_active = max(planet_aspect_count.keys(), key=lambda p: planet_aspect_count[p]) if planet_aspect_count else None

        return {
            "total_aspects": total_aspects,
            "beneficial_aspects": beneficial_aspects,
            "challenging_aspects": challenging_aspects,
            "neutral_aspects": total_aspects - beneficial_aspects - challenging_aspects,
            "most_active_planet": most_active,
            "retrograde_planets": [pos.planet for pos in positions if pos.retrograde]
        }