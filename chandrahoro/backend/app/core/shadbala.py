"""
Shadbala (Six-fold Strength) Calculation Module

Implements the traditional Vedic system for measuring planetary strength
through six different factors:
1. Sthana Bala (Positional Strength)
2. Dig Bala (Directional Strength) 
3. Kala Bala (Temporal Strength)
4. Chesta Bala (Motional Strength)
5. Naisargika Bala (Natural Strength)
6. Drik Bala (Aspectual Strength)
"""

import math
from typing import Dict, List, Tuple, Any
from datetime import datetime
from .ephemeris import EphemerisCalculator


class ShadbalaCalculator:
    """Calculate Shadbala (six-fold strength) for planets"""
    
    def __init__(self):
        self.ephemeris = EphemerisCalculator()
        
        # Natural strength values (in Rupas)
        self.naisargika_bala = {
            'Sun': 60,
            'Moon': 51.43,
            'Mercury': 25.60,
            'Venus': 42.00,
            'Mars': 17.14,
            'Jupiter': 34.29,
            'Saturn': 8.57
        }
        
        # Exaltation degrees
        self.exaltation_degrees = {
            'Sun': 10,      # Aries 10°
            'Moon': 33,     # Taurus 3° (30+3)
            'Mercury': 165, # Virgo 15° (150+15)
            'Venus': 357,   # Pisces 27° (330+27)
            'Mars': 298,    # Capricorn 28° (270+28)
            'Jupiter': 95,  # Cancer 5° (90+5)
            'Saturn': 200   # Libra 20° (180+20)
        }
        
        # Directional strength houses
        self.dig_bala_houses = {
            'Sun': 10,      # 10th house
            'Moon': 4,      # 4th house
            'Mercury': 1,   # 1st house
            'Venus': 4,     # 4th house
            'Mars': 10,     # 10th house
            'Jupiter': 1,   # 1st house
            'Saturn': 7     # 7th house
        }

    def calculate_shadbala(self, birth_datetime: datetime, latitude: float, longitude: float, 
                          planets: List[Dict[str, Any]], houses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate complete Shadbala for all planets
        
        Args:
            birth_datetime: Birth date and time
            latitude: Birth latitude
            longitude: Birth longitude
            planets: List of planet data with positions
            houses: List of house data
            
        Returns:
            Dictionary with Shadbala calculations for each planet
        """
        results = {}
        
        for planet_data in planets:
            planet_name = planet_data['name']
            if planet_name in ['Rahu', 'Ketu']:  # Skip shadow planets for Shadbala
                continue
                
            planet_position = planet_data.get('sidereal_longitude', planet_data.get('longitude', 0))
            planet_house = planet_data['house']
            
            # Calculate each component of Shadbala
            sthana_bala = self._calculate_sthana_bala(planet_name, planet_position, planet_house)
            dig_bala = self._calculate_dig_bala(planet_name, planet_house)
            kala_bala = self._calculate_kala_bala(planet_name, birth_datetime)
            chesta_bala = self._calculate_chesta_bala(planet_name, planet_data.get('speed', 0))
            naisargika_bala = self.naisargika_bala.get(planet_name, 0)
            drik_bala = self._calculate_drik_bala(planet_name, planets)
            
            # Total Shadbala
            total_shadbala = (sthana_bala + dig_bala + kala_bala + 
                            chesta_bala + naisargika_bala + drik_bala)
            
            results[planet_name] = {
                'sthana_bala': round(sthana_bala, 2),
                'dig_bala': round(dig_bala, 2),
                'kala_bala': round(kala_bala, 2),
                'chesta_bala': round(chesta_bala, 2),
                'naisargika_bala': round(naisargika_bala, 2),
                'drik_bala': round(drik_bala, 2),
                'total_shadbala': round(total_shadbala, 2),
                'strength_percentage': round((total_shadbala / 390) * 100, 1),  # 390 is theoretical maximum
                'strength_grade': self._get_strength_grade(total_shadbala)
            }
        
        return {
            'shadbala_scores': results,
            'strongest_planet': max(results.keys(), key=lambda k: results[k]['total_shadbala']),
            'weakest_planet': min(results.keys(), key=lambda k: results[k]['total_shadbala']),
            'average_strength': round(sum(r['total_shadbala'] for r in results.values()) / len(results), 2)
        }

    def _calculate_sthana_bala(self, planet_name: str, planet_position: float, planet_house: int) -> float:
        """Calculate Sthana Bala (Positional Strength)"""
        # Uccha Bala (Exaltation strength)
        exalt_degree = self.exaltation_degrees.get(planet_name, 0)
        
        # Calculate distance from exaltation point
        distance = abs(planet_position - exalt_degree)
        if distance > 180:
            distance = 360 - distance
            
        # Uccha Bala formula: 60 * (1 - distance/180)
        uccha_bala = 60 * (1 - distance / 180)
        
        # Saptavargaja Bala (simplified - based on own sign, exaltation, etc.)
        saptavargaja_bala = self._calculate_saptavargaja_bala(planet_name, planet_position)
        
        # Ojayugmarasyamsa Bala (odd/even sign strength)
        ojayugma_bala = self._calculate_ojayugma_bala(planet_name, planet_position)
        
        # Kendra Bala (angular house strength)
        kendra_bala = 60 if planet_house in [1, 4, 7, 10] else 30 if planet_house in [2, 5, 8, 11] else 15
        
        # Drekkana Bala (decanate strength)
        drekkana_bala = self._calculate_drekkana_bala(planet_name, planet_position)
        
        return uccha_bala + saptavargaja_bala + ojayugma_bala + kendra_bala + drekkana_bala

    def _calculate_dig_bala(self, planet_name: str, planet_house: int) -> float:
        """Calculate Dig Bala (Directional Strength)"""
        strong_house = self.dig_bala_houses.get(planet_name, 1)
        
        if planet_house == strong_house:
            return 60
        elif planet_house == ((strong_house + 6) % 12) or planet_house == ((strong_house + 6) % 12 + 1):
            return 0  # Opposite house
        else:
            # Proportional strength based on distance from strong house
            distance = min(abs(planet_house - strong_house), 12 - abs(planet_house - strong_house))
            return 60 * (1 - distance / 6)

    def _calculate_kala_bala(self, planet_name: str, birth_datetime: datetime) -> float:
        """Calculate Kala Bala (Temporal Strength)"""
        # Simplified Kala Bala calculation
        hour = birth_datetime.hour
        
        # Diurnal/Nocturnal strength
        if planet_name in ['Sun', 'Jupiter', 'Venus']:
            # Diurnal planets stronger during day
            diurnal_strength = 60 if 6 <= hour <= 18 else 30
        else:
            # Nocturnal planets stronger during night
            diurnal_strength = 60 if hour < 6 or hour > 18 else 30
            
        # Weekday strength (simplified)
        weekday_rulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
        weekday = birth_datetime.weekday()  # 0 = Monday
        weekday_strength = 30 if weekday_rulers[weekday] == planet_name else 15
        
        # Month strength (simplified)
        month_strength = 15  # Base strength
        
        return diurnal_strength + weekday_strength + month_strength

    def _calculate_chesta_bala(self, planet_name: str, planet_speed: float) -> float:
        """Calculate Chesta Bala (Motional Strength)"""
        if planet_name in ['Sun', 'Moon']:
            return 60  # Luminaries always get full Chesta Bala
            
        # For other planets, strength based on speed
        if planet_speed < 0:  # Retrograde
            return 60
        elif planet_speed > 1:  # Fast motion
            return 45
        else:  # Normal motion
            return 30

    def _calculate_drik_bala(self, planet_name: str, planets: List[Dict[str, Any]]) -> float:
        """Calculate Drik Bala (Aspectual Strength)"""
        # Simplified aspectual strength calculation
        # Based on beneficial vs malefic aspects received
        
        benefic_aspects = 0
        malefic_aspects = 0
        
        planet_position = None
        for p in planets:
            if p['name'] == planet_name:
                planet_position = p.get('sidereal_longitude', p.get('longitude', 0))
                break
                
        if planet_position is None:
            return 30
            
        for other_planet in planets:
            if other_planet['name'] == planet_name:
                continue
                
            # Calculate aspect (simplified - using 7th house aspect for all)
            other_position = other_planet.get('sidereal_longitude', other_planet.get('longitude', 0))
            aspect_distance = abs(planet_position - other_position)
            if aspect_distance > 180:
                aspect_distance = 360 - aspect_distance
                
            # Check if within orb of aspect (±10 degrees)
            if 170 <= aspect_distance <= 190:  # 7th house aspect
                if other_planet['name'] in ['Jupiter', 'Venus', 'Moon']:
                    benefic_aspects += 1
                elif other_planet['name'] in ['Mars', 'Saturn']:
                    malefic_aspects += 1
                    
        # Calculate Drik Bala based on net beneficial aspects
        net_beneficial = benefic_aspects - malefic_aspects
        return max(0, min(60, 30 + net_beneficial * 10))

    def _calculate_saptavargaja_bala(self, planet_name: str, planet_position: float) -> float:
        """Calculate Saptavargaja Bala (simplified)"""
        # Simplified calculation based on sign position
        sign_num = int(planet_position // 30) + 1
        
        # Basic strength based on sign compatibility
        base_strength = 20
        
        # Additional strength for own signs, exaltation, etc. (simplified)
        if planet_name == 'Sun' and sign_num == 5:  # Leo
            base_strength += 10
        elif planet_name == 'Moon' and sign_num == 4:  # Cancer
            base_strength += 10
        # Add more sign rulerships as needed
            
        return base_strength

    def _calculate_ojayugma_bala(self, planet_name: str, planet_position: float) -> float:
        """Calculate Ojayugma Bala (odd/even sign strength)"""
        sign_num = int(planet_position // 30) + 1
        is_odd_sign = sign_num % 2 == 1
        
        # Male planets stronger in odd signs, female planets in even signs
        male_planets = ['Sun', 'Mars', 'Jupiter']
        female_planets = ['Moon', 'Venus']
        
        if planet_name in male_planets and is_odd_sign:
            return 15
        elif planet_name in female_planets and not is_odd_sign:
            return 15
        else:
            return 7.5

    def _calculate_drekkana_bala(self, planet_name: str, planet_position: float) -> float:
        """Calculate Drekkana Bala (decanate strength)"""
        # Simplified decanate strength
        degree_in_sign = planet_position % 30
        
        if degree_in_sign < 10:
            return 10  # First decanate
        elif degree_in_sign < 20:
            return 15  # Second decanate
        else:
            return 5   # Third decanate

    def _get_strength_grade(self, total_shadbala: float) -> str:
        """Get strength grade based on total Shadbala"""
        if total_shadbala >= 300:
            return 'Excellent'
        elif total_shadbala >= 250:
            return 'Very Good'
        elif total_shadbala >= 200:
            return 'Good'
        elif total_shadbala >= 150:
            return 'Average'
        elif total_shadbala >= 100:
            return 'Weak'
        else:
            return 'Very Weak'
