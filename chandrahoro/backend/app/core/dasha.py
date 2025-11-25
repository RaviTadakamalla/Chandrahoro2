"""
Vimshottari Dasha calculation module for Vedic astrology.
Implements the 120-year planetary period system.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class VimshottariDasha:
    """Calculator for Vimshottari Dasha periods."""

    # Vimshottari Dasha periods in years
    DASHA_PERIODS = {
        'Ketu': 7,
        'Venus': 20,
        'Sun': 6,
        'Moon': 10,
        'Mars': 7,
        'Rahu': 18,
        'Jupiter': 16,
        'Saturn': 19,
        'Mercury': 17
    }

    # Dasha sequence (starting from Ketu)
    DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']

    # Nakshatra rulers (1-27)
    NAKSHATRA_RULERS = {
        1: 'Ketu',     # Ashwini
        2: 'Venus',    # Bharani
        3: 'Sun',      # Krittika
        4: 'Moon',     # Rohini
        5: 'Mars',     # Mrigashira
        6: 'Rahu',     # Ardra
        7: 'Jupiter',  # Punarvasu
        8: 'Saturn',   # Pushya
        9: 'Mercury',  # Ashlesha
        10: 'Ketu',    # Magha
        11: 'Venus',   # Purva Phalguni
        12: 'Sun',     # Uttara Phalguni
        13: 'Moon',    # Hasta
        14: 'Mars',    # Chitra
        15: 'Rahu',    # Swati
        16: 'Jupiter', # Vishakha
        17: 'Saturn',  # Anuradha
        18: 'Mercury', # Jyeshtha
        19: 'Ketu',    # Mula
        20: 'Venus',   # Purva Ashadha
        21: 'Sun',     # Uttara Ashadha
        22: 'Moon',    # Shravana
        23: 'Mars',    # Dhanishta
        24: 'Rahu',    # Shatabhisha
        25: 'Jupiter', # Purva Bhadrapada
        26: 'Saturn',  # Uttara Bhadrapada
        27: 'Mercury'  # Revati
    }

    def __init__(self):
        """Initialize Vimshottari Dasha calculator."""
        pass

    def calculate_birth_nakshatra(self, moon_longitude: float) -> Tuple[int, float]:
        """
        Calculate birth nakshatra from Moon's longitude.

        Args:
            moon_longitude: Moon's sidereal longitude in degrees

        Returns:
            Tuple of (nakshatra_number, degrees_in_nakshatra)
        """
        # Each nakshatra is 13°20' (13.333... degrees)
        nakshatra_size = 360.0 / 27.0

        # Calculate nakshatra number (1-27)
        nakshatra_number = int(moon_longitude / nakshatra_size) + 1

        # Calculate degrees within the nakshatra
        degrees_in_nakshatra = moon_longitude % nakshatra_size

        return nakshatra_number, degrees_in_nakshatra

    def calculate_dasha_balance(self, moon_longitude: float) -> Tuple[str, float]:
        """
        Calculate the balance of the birth dasha.

        Args:
            moon_longitude: Moon's sidereal longitude in degrees

        Returns:
            Tuple of (ruling_planet, balance_in_years)
        """
        nakshatra_number, degrees_in_nakshatra = self.calculate_birth_nakshatra(moon_longitude)

        # Get the ruling planet
        ruling_planet = self.NAKSHATRA_RULERS[nakshatra_number]

        # Calculate how much of the nakshatra has been traversed
        nakshatra_size = 360.0 / 27.0  # 13.333... degrees
        traversed_fraction = degrees_in_nakshatra / nakshatra_size

        # Calculate remaining balance
        total_period = self.DASHA_PERIODS[ruling_planet]
        balance = total_period * (1 - traversed_fraction)

        return ruling_planet, balance

    def get_dasha_at_date(self, birth_date: datetime, target_date: datetime) -> Dict[str, str]:
        """
        Get the Mahadasha and Antardasha at a specific date.

        Args:
            birth_date: Birth date
            target_date: Target date to find dasha for

        Returns:
            Dictionary with 'mahadasha' and 'antardasha' keys
        """
        # For now, return a simplified version
        # In a full implementation, this would calculate based on actual dasha periods
        days_since_birth = (target_date - birth_date).days
        years_since_birth = days_since_birth / 365.25

        # Find which mahadasha we're in (simplified)
        total_years = 0
        current_mahadasha = None
        for planet in self.DASHA_SEQUENCE:
            period = self.DASHA_PERIODS[planet]
            if total_years + period > years_since_birth:
                current_mahadasha = planet
                break
            total_years += period

        if not current_mahadasha:
            current_mahadasha = self.DASHA_SEQUENCE[0]

        # Find antardasha (simplified)
        current_antardasha = self.DASHA_SEQUENCE[0]

        return {
            "mahadasha": current_mahadasha,
            "antardasha": current_antardasha,
        }

    def calculate_mahadasha_sequence(self, birth_date: datetime, moon_longitude: float,
                                   years_ahead: int = 120) -> List[Dict]:
        """
        Calculate the sequence of Mahadashas from birth.

        Args:
            birth_date: Birth datetime
            moon_longitude: Moon's sidereal longitude
            years_ahead: Number of years to calculate ahead

        Returns:
            List of Mahadasha periods with start/end dates
        """
        ruling_planet, balance = self.calculate_dasha_balance(moon_longitude)

        # Find the starting index in the sequence
        start_index = self.DASHA_SEQUENCE.index(ruling_planet)

        mahadashas = []

        # Calculate the actual start date of the birth Dasha
        # The birth Dasha started before the birth date
        total_period = self.DASHA_PERIODS[ruling_planet]
        elapsed_period = total_period - balance
        birth_dasha_start = birth_date - timedelta(days=elapsed_period * 365.25)

        current_date = birth_dasha_start

        # First Mahadasha (birth Dasha - full period)
        if balance > 0:
            end_date = current_date + timedelta(days=total_period * 365.25)
            mahadashas.append({
                'planet': ruling_planet,
                'start_date': current_date,
                'end_date': end_date,
                'duration_years': total_period,
                'is_birth_dasha': True
            })
            current_date = end_date

        # Calculate subsequent Mahadashas
        # We need to track years from birth_date forward, not from birth_dasha_start
        years_from_birth = balance  # Years remaining in birth Dasha from birth date
        sequence_index = (start_index + 1) % 9

        while years_from_birth < years_ahead:
            planet = self.DASHA_SEQUENCE[sequence_index]
            duration = self.DASHA_PERIODS[planet]

            end_date = current_date + timedelta(days=duration * 365.25)

            mahadashas.append({
                'planet': planet,
                'start_date': current_date,
                'end_date': end_date,
                'duration_years': duration,
                'is_birth_dasha': False
            })

            current_date = end_date
            years_from_birth += duration
            sequence_index = (sequence_index + 1) % 9

        return mahadashas

    def calculate_antardashas(self, mahadasha_planet: str, mahadasha_start: datetime,
                            mahadasha_duration: float) -> List[Dict]:
        """
        Calculate Antardashas (sub-periods) within a Mahadasha.

        Args:
            mahadasha_planet: Planet ruling the Mahadasha
            mahadasha_start: Start date of the Mahadasha
            mahadasha_duration: Duration of Mahadasha in years

        Returns:
            List of Antardasha periods
        """
        # Find the starting index for this Mahadasha
        start_index = self.DASHA_SEQUENCE.index(mahadasha_planet)

        antardashas = []
        current_date = mahadasha_start

        # Calculate total proportional units for this Mahadasha
        mahadasha_period = self.DASHA_PERIODS[mahadasha_planet]

        for i in range(9):
            # Get the Antardasha planet (starting from Mahadasha planet)
            antardasha_index = (start_index + i) % 9
            antardasha_planet = self.DASHA_SEQUENCE[antardasha_index]
            antardasha_period = self.DASHA_PERIODS[antardasha_planet]

            # Calculate proportional duration
            proportional_duration = (antardasha_period / mahadasha_period) * mahadasha_duration

            end_date = current_date + timedelta(days=proportional_duration * 365.25)

            antardashas.append({
                'planet': antardasha_planet,
                'start_date': current_date,
                'end_date': end_date,
                'duration_years': proportional_duration,
                'mahadasha_planet': mahadasha_planet
            })

            current_date = end_date

        return antardashas

    def calculate_pratyantardashas(self, antardasha_planet: str, antardasha_start: datetime,
                                 antardasha_duration: float, mahadasha_planet: str) -> List[Dict]:
        """
        Calculate Pratyantardashas (sub-sub-periods) within an Antardasha.

        Args:
            antardasha_planet: Planet ruling the Antardasha
            antardasha_start: Start date of the Antardasha
            antardasha_duration: Duration of Antardasha in years
            mahadasha_planet: Planet ruling the parent Mahadasha

        Returns:
            List of Pratyantardasha periods
        """
        # Find the starting index for this Antardasha
        start_index = self.DASHA_SEQUENCE.index(antardasha_planet)

        pratyantardashas = []
        current_date = antardasha_start

        # Calculate total proportional units for this Antardasha
        antardasha_period = self.DASHA_PERIODS[antardasha_planet]

        for i in range(9):
            # Get the Pratyantardasha planet (starting from Antardasha planet)
            pratyantardasha_index = (start_index + i) % 9
            pratyantardasha_planet = self.DASHA_SEQUENCE[pratyantardasha_index]
            pratyantardasha_period = self.DASHA_PERIODS[pratyantardasha_planet]

            # Calculate proportional duration
            proportional_duration = (pratyantardasha_period / antardasha_period) * antardasha_duration

            end_date = current_date + timedelta(days=proportional_duration * 365.25)

            pratyantardashas.append({
                'planet': pratyantardasha_planet,
                'start_date': current_date,
                'end_date': end_date,
                'duration_years': proportional_duration,
                'antardasha_planet': antardasha_planet,
                'mahadasha_planet': mahadasha_planet
            })

            current_date = end_date

        return pratyantardashas

    def get_current_dasha(self, birth_date: datetime, moon_longitude: float,
                         current_date: Optional[datetime] = None) -> Dict:
        """
        Get the current running Dasha periods.

        Args:
            birth_date: Birth datetime
            moon_longitude: Moon's sidereal longitude at birth
            current_date: Date to check (defaults to now)

        Returns:
            Dictionary with current Mahadasha, Antardasha, and Pratyantardasha
        """
        if current_date is None:
            current_date = datetime.now()

        # Calculate Mahadashas
        mahadashas = self.calculate_mahadasha_sequence(birth_date, moon_longitude, 120)

        # Find current Mahadasha
        current_mahadasha = None
        for maha in mahadashas:
            if maha['start_date'] <= current_date <= maha['end_date']:
                current_mahadasha = maha
                break

        if not current_mahadasha:
            return {'error': 'Could not determine current Mahadasha'}

        # Calculate Antardashas for current Mahadasha
        antardashas = self.calculate_antardashas(
            current_mahadasha['planet'],
            current_mahadasha['start_date'],
            current_mahadasha['duration_years']
        )

        # Find current Antardasha
        current_antardasha = None
        for antara in antardashas:
            if antara['start_date'] <= current_date <= antara['end_date']:
                current_antardasha = antara
                break

        if not current_antardasha:
            return {
                'mahadasha': current_mahadasha,
                'error': 'Could not determine current Antardasha'
            }

        # Calculate Pratyantardashas for current Antardasha
        pratyantardashas = self.calculate_pratyantardashas(
            current_antardasha['planet'],
            current_antardasha['start_date'],
            current_antardasha['duration_years'],
            current_mahadasha['planet']
        )

        # Find current Pratyantardasha
        current_pratyantardasha = None
        for pratya in pratyantardashas:
            if pratya['start_date'] <= current_date <= pratya['end_date']:
                current_pratyantardasha = pratya
                break

        return {
            'mahadasha': current_mahadasha,
            'antardasha': current_antardasha,
            'pratyantardasha': current_pratyantardasha,
            'calculation_date': current_date
        }

    def get_dasha_timeline(self, birth_date: datetime, moon_longitude: float,
                          years_ahead: int = 20) -> Dict:
        """
        Get a comprehensive Dasha timeline.

        Args:
            birth_date: Birth datetime
            moon_longitude: Moon's sidereal longitude at birth
            years_ahead: Number of years to calculate

        Returns:
            Complete Dasha timeline with all levels
        """
        mahadashas = self.calculate_mahadasha_sequence(birth_date, moon_longitude, years_ahead)

        timeline = {
            'birth_date': birth_date,
            'moon_longitude': moon_longitude,
            'years_calculated': years_ahead,
            'mahadashas': []
        }

        for maha in mahadashas:
            # Calculate Antardashas for this Mahadasha
            antardashas = self.calculate_antardashas(
                maha['planet'],
                maha['start_date'],
                maha['duration_years']
            )

            maha_data = maha.copy()
            maha_data['antardashas'] = []

            for antara in antardashas:
                # Calculate Pratyantardashas for this Antardasha
                pratyantardashas = self.calculate_pratyantardashas(
                    antara['planet'],
                    antara['start_date'],
                    antara['duration_years'],
                    maha['planet']
                )

                antara_data = antara.copy()
                antara_data['pratyantardashas'] = pratyantardashas
                maha_data['antardashas'].append(antara_data)

            timeline['mahadashas'].append(maha_data)

        return timeline

    def get_comprehensive_dasha_navigator(self, birth_date: datetime, moon_longitude: float,
                                        years_ahead: int = 120) -> Dict:
        """
        Get comprehensive Dasha navigator data matching the reference format.

        Args:
            birth_date: Birth datetime
            moon_longitude: Moon's sidereal longitude at birth
            years_ahead: Number of years to calculate (default full 120-year cycle)

        Returns:
            Dictionary with comprehensive Dasha navigator data
        """
        # Calculate birth nakshatra and balance
        ruling_planet, balance = self.calculate_dasha_balance(moon_longitude)
        nakshatra_number, _ = self.calculate_birth_nakshatra(moon_longitude)

        # Calculate full Mahadasha sequence
        mahadashas = self.calculate_mahadasha_sequence(birth_date, moon_longitude, years_ahead)

        # Calculate Antardashas for each Mahadasha
        navigator_data = []
        current_date = datetime.now()

        for mahadasha in mahadashas:
            # Calculate all Antardashas for this Mahadasha
            antardashas = self.calculate_antardashas(
                mahadasha['planet'],
                mahadasha['start_date'],
                mahadasha['duration_years']
            )

            # Determine if this Mahadasha is current, past, or future
            maha_start = mahadasha['start_date']
            maha_end = mahadasha['end_date']

            if current_date < maha_start:
                status = 'future'
            elif current_date > maha_end:
                status = 'past'
            else:
                status = 'current'

            # Add current Antardasha information if this is the current Mahadasha
            current_antardasha = None
            if status == 'current':
                for antardasha in antardashas:
                    antar_start = antardasha['start_date']
                    antar_end = antardasha['end_date']
                    if antar_start <= current_date <= antar_end:
                        current_antardasha = antardasha['planet']
                        break

            navigator_data.append({
                'mahadasha': mahadasha['planet'],
                'start_date': maha_start,
                'end_date': maha_end,
                'duration_years': mahadasha['duration_years'],
                'status': status,
                'is_birth_dasha': mahadasha.get('is_birth_dasha', False),
                'current_antardasha': current_antardasha,
                'antardashas': antardashas
            })

        return {
            'birth_nakshatra_lord': ruling_planet,
            'balance_at_birth_years': balance,
            'current_date': current_date.isoformat(),
            'navigator_data': navigator_data,
            'calculation_timestamp': datetime.now().isoformat()
        }


def get_nakshatra_name(nakshatra_number: int) -> str:
    """Get the name of a nakshatra by number."""
    nakshatra_names = {
        1: 'Ashwini', 2: 'Bharani', 3: 'Krittika', 4: 'Rohini',
        5: 'Mrigashira', 6: 'Ardra', 7: 'Punarvasu', 8: 'Pushya',
        9: 'Ashlesha', 10: 'Magha', 11: 'Purva Phalguni', 12: 'Uttara Phalguni',
        13: 'Hasta', 14: 'Chitra', 15: 'Swati', 16: 'Vishakha',
        17: 'Anuradha', 18: 'Jyeshtha', 19: 'Mula', 20: 'Purva Ashadha',
        21: 'Uttara Ashadha', 22: 'Shravana', 23: 'Dhanishta', 24: 'Shatabhisha',
        25: 'Purva Bhadrapada', 26: 'Uttara Bhadrapada', 27: 'Revati'
    }
    return nakshatra_names.get(nakshatra_number, f'Nakshatra {nakshatra_number}')


def get_planet_dasha_significance(planet: str) -> Dict:
    """Get the significance and effects of a planet's Dasha period."""
    significances = {
        'Sun': {
            'general': 'Authority, government, father, health, leadership',
            'positive': 'Recognition, promotion, government favor, good health',
            'negative': 'Ego conflicts, health issues, problems with authority',
            'duration': 6
        },
        'Moon': {
            'general': 'Mind, emotions, mother, public, travel, water',
            'positive': 'Mental peace, popularity, travel, property gains',
            'negative': 'Mental stress, emotional instability, health issues',
            'duration': 10
        },
        'Mars': {
            'general': 'Energy, courage, property, siblings, accidents',
            'positive': 'Success in competition, property gains, courage',
            'negative': 'Accidents, conflicts, blood-related issues, surgery',
            'duration': 7
        },
        'Mercury': {
            'general': 'Intelligence, communication, business, education',
            'positive': 'Business success, education, communication skills',
            'negative': 'Mental confusion, speech problems, business losses',
            'duration': 17
        },
        'Jupiter': {
            'general': 'Wisdom, spirituality, children, wealth, guru',
            'positive': 'Spiritual growth, children, wealth, knowledge',
            'negative': 'Over-optimism, weight gain, liver issues',
            'duration': 16
        },
        'Venus': {
            'general': 'Love, marriage, arts, luxury, vehicles, women',
            'positive': 'Marriage, artistic success, luxury, vehicles',
            'negative': 'Relationship problems, over-indulgence, kidney issues',
            'duration': 20
        },
        'Saturn': {
            'general': 'Discipline, delays, hard work, service, longevity',
            'positive': 'Steady progress, discipline, service recognition',
            'negative': 'Delays, obstacles, depression, chronic health issues',
            'duration': 19
        },
        'Rahu': {
            'general': 'Materialism, foreign connections, technology, illusion',
            'positive': 'Foreign gains, technology success, material progress',
            'negative': 'Confusion, deception, addiction, mental disturbance',
            'duration': 18
        },
        'Ketu': {
            'general': 'Spirituality, detachment, research, occult, liberation',
            'positive': 'Spiritual growth, research success, detachment',
            'negative': 'Confusion, accidents, health issues, isolation',
            'duration': 7
        }
    }
    return significances.get(planet, {'general': 'Unknown planet', 'duration': 0})