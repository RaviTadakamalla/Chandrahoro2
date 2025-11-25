"""Jaimini Chara Dasha Calculation Engine.

This module implements the Chara Dasha system following KN Rao's method
from "Predicting Through Jaimini's Chara Dasha".

Chara Dasha is a sign-based dasha system where:
- Each sign gets a dasha period (not planets)
- Duration is calculated by counting from sign to its lord's position
- Direction (forward/backward) depends on lagna sign
- Antar dashas are proportionally subdivided

Copyright (C) 2025 ChandraHoro Development Team

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


# Sign classification for direction determination
SAVYA_SIGNS = [1, 2, 3, 7, 8, 9]  # Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius (Forward)
APASAVYA_SIGNS = [4, 5, 6, 10, 11, 12]  # Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces (Backward)

# Sign names
SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

# Sign lords (traditional rulership)
SIGN_LORDS = {
    1: 'Mars',      # Aries
    2: 'Venus',     # Taurus
    3: 'Mercury',   # Gemini
    4: 'Moon',      # Cancer
    5: 'Sun',       # Leo
    6: 'Mercury',   # Virgo
    7: 'Venus',     # Libra
    8: 'Mars',      # Scorpio
    9: 'Jupiter',   # Sagittarius
    10: 'Saturn',   # Capricorn
    11: 'Saturn',   # Aquarius
    12: 'Jupiter'   # Pisces
}


def get_direction(lagna_sign: int) -> str:
    """
    Determine dasha direction based on lagna sign.
    
    Args:
        lagna_sign: Lagna sign number (1-12)
        
    Returns:
        'FORWARD' if lagna in Savya signs, 'BACKWARD' if in Apasavya signs
    """
    return 'FORWARD' if lagna_sign in SAVYA_SIGNS else 'BACKWARD'


def get_sign_lord_position(sign_number: int, planetary_positions: Dict[str, Dict]) -> int:
    """
    Get the sign position of a sign's lord.
    
    Args:
        sign_number: Sign number (1-12)
        planetary_positions: Dictionary of planetary positions
        
    Returns:
        Sign number where the lord is placed (1-12)
    """
    lord_name = SIGN_LORDS[sign_number]
    lord_data = planetary_positions.get(lord_name, {})
    lord_sign = lord_data.get('sign_number', 1)
    return lord_sign


def calculate_dasha_years(sign_number: int, lord_position: int, direction: str) -> int:
    """
    Calculate dasha years by counting from sign to its lord's position.
    
    Rules (KN Rao method):
    - If lord in same sign: ALWAYS 12 years
    - If FORWARD: count forward from sign to lord + 1
    - If BACKWARD: count backward from sign to lord + 1
    
    Args:
        sign_number: Current sign (1-12)
        lord_position: Sign where lord is placed (1-12)
        direction: 'FORWARD' or 'BACKWARD'
        
    Returns:
        Number of years for this dasha (1-12)
    """
    # Special case: lord in same sign = 12 years
    if sign_number == lord_position:
        return 12
    
    if direction == 'FORWARD':
        # Count forward: if sign=1, lord=3, count 1→2→3 = 3 signs
        if lord_position >= sign_number:
            years = lord_position - sign_number + 1
        else:
            # Wrap around: if sign=10, lord=2, count 10→11→12→1→2 = 5 signs
            years = (12 - sign_number) + lord_position + 1
    else:  # BACKWARD
        # Count backward: if sign=10, lord=8, count 10→9→8 = 3 signs
        if lord_position <= sign_number:
            years = sign_number - lord_position + 1
        else:
            # Wrap around: if sign=2, lord=10, count 2→1→12→11→10 = 5 signs
            years = sign_number + (12 - lord_position) + 1
    
    return years


def get_dasha_order(lagna_sign: int, direction: str) -> List[int]:
    """
    Generate sequence of 12 signs starting from lagna.
    
    Args:
        lagna_sign: Lagna sign number (1-12)
        direction: 'FORWARD' or 'BACKWARD'
        
    Returns:
        List of 12 sign numbers in dasha order
    """
    order = []
    current = lagna_sign
    
    for _ in range(12):
        order.append(current)
        if direction == 'FORWARD':
            current = (current % 12) + 1  # 1→2→...→12→1
        else:  # BACKWARD
            current = ((current - 2) % 12) + 1  # 1→12→11→...→2→1
    
    return order


def calculate_chara_dasha(
    birth_date: datetime,
    lagna_sign: int,
    planetary_positions: Dict[str, Dict]
) -> Dict[str, Any]:
    """
    Calculate complete Chara Dasha timeline.
    
    Args:
        birth_date: Birth date and time
        lagna_sign: Lagna sign number (1-12)
        planetary_positions: Dictionary of planetary positions with sign_number
        
    Returns:
        Dictionary containing:
        - direction: FORWARD or BACKWARD
        - maha_dashas: List of maha dasha periods with years and dates
        - current_dasha: Currently running dasha
    """
    direction = get_direction(lagna_sign)
    dasha_order = get_dasha_order(lagna_sign, direction)
    
    maha_dashas = []
    current_date = birth_date

    # Calculate each maha dasha
    for sign_num in dasha_order:
        lord_position = get_sign_lord_position(sign_num, planetary_positions)
        years = calculate_dasha_years(sign_num, lord_position, direction)

        # Calculate end date
        end_date = current_date + relativedelta(years=years)

        # Calculate antar dashas for this maha dasha
        antar_dashas = calculate_antar_dashas(
            sign_num, years, current_date, direction, planetary_positions
        )

        maha_dashas.append({
            'sign_number': sign_num,
            'sign_name': SIGN_NAMES[sign_num - 1],
            'lord': SIGN_LORDS[sign_num],
            'lord_position': lord_position,
            'years': years,
            'start_date': current_date.isoformat(),
            'end_date': end_date.isoformat(),
            'antar_dashas': antar_dashas
        })

        current_date = end_date

    # Find current running dasha
    now = datetime.now()
    current_dasha = None
    for md in maha_dashas:
        md_start = datetime.fromisoformat(md['start_date'])
        md_end = datetime.fromisoformat(md['end_date'])
        if md_start <= now < md_end:
            current_dasha = {
                'maha_dasha': md['sign_name'],
                'maha_dasha_lord': md['lord']
            }
            # Find current antar dasha
            for ad in md['antar_dashas']:
                ad_start = datetime.fromisoformat(ad['start_date'])
                ad_end = datetime.fromisoformat(ad['end_date'])
                if ad_start <= now < ad_end:
                    current_dasha['antar_dasha'] = ad['sign_name']
                    current_dasha['antar_dasha_lord'] = ad['lord']
                    break
            break

    return {
        'direction': direction,
        'lagna_sign': SIGN_NAMES[lagna_sign - 1],
        'maha_dashas': maha_dashas,
        'current_dasha': current_dasha,
        'total_cycle_years': sum(md['years'] for md in maha_dashas)
    }


def calculate_antar_dashas(
    maha_sign: int,
    maha_years: int,
    maha_start: datetime,
    direction: str,
    planetary_positions: Dict[str, Dict]
) -> List[Dict[str, Any]]:
    """
    Calculate antar dashas for a maha dasha period.

    Antar dashas follow the same sequence as maha dashas but are proportionally
    subdivided based on their own dasha years.

    Args:
        maha_sign: Maha dasha sign number
        maha_years: Total years of maha dasha
        maha_start: Start date of maha dasha
        direction: FORWARD or BACKWARD
        planetary_positions: Planetary positions

    Returns:
        List of antar dasha periods
    """
    antar_order = get_dasha_order(maha_sign, direction)

    # Calculate years for each antar dasha sign
    antar_years_list = []
    total_antar_years = 0
    for sign_num in antar_order:
        lord_position = get_sign_lord_position(sign_num, planetary_positions)
        years = calculate_dasha_years(sign_num, lord_position, direction)
        antar_years_list.append(years)
        total_antar_years += years

    # Proportionally distribute maha dasha years among antar dashas
    antar_dashas = []
    current_date = maha_start

    for i, sign_num in enumerate(antar_order):
        # Proportional years for this antar dasha
        proportion = antar_years_list[i] / total_antar_years
        antar_duration_years = maha_years * proportion

        # Calculate end date
        # Convert fractional years to days for precision
        days = int(antar_duration_years * 365.25)
        end_date = current_date + timedelta(days=days)

        antar_dashas.append({
            'sign_number': sign_num,
            'sign_name': SIGN_NAMES[sign_num - 1],
            'lord': SIGN_LORDS[sign_num],
            'years': round(antar_duration_years, 2),
            'start_date': current_date.isoformat(),
            'end_date': end_date.isoformat()
        })

        current_date = end_date

    return antar_dashas

