"""
Ashtakavarga (Eight-fold Division) Calculation Module

Implements the traditional Vedic system for measuring planetary strength
through eight contributing factors for each planet and house.
Each planet contributes points to specific houses based on its position.
"""

from typing import Dict, List, Any, Tuple
from datetime import datetime


class AshtakavargaCalculator:
    """Calculate Ashtakavarga (eight-fold division) for planets"""
    
    def __init__(self):
        # Ashtakavarga contribution rules for each planet
        # Each planet contributes points to specific houses from its position
        self.contribution_rules = {
            'Sun': {
                'from_sun': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_moon': [3, 6, 10, 11],
                'from_mercury': [3, 5, 6, 9, 10, 11, 12],
                'from_venus': [6, 7, 12],
                'from_mars': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_jupiter': [5, 6, 9, 11],
                'from_saturn': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_ascendant': [3, 4, 6, 10, 11, 12]
            },
            'Moon': {
                'from_sun': [3, 6, 7, 8, 10, 11],
                'from_moon': [1, 3, 6, 7, 10, 11],
                'from_mercury': [1, 3, 4, 5, 7, 8, 10, 11],
                'from_venus': [3, 4, 5, 7, 9, 10, 11],
                'from_mars': [2, 3, 5, 6, 9, 10, 11],
                'from_jupiter': [1, 4, 7, 8, 10, 11, 12],
                'from_saturn': [3, 5, 6, 11],
                'from_ascendant': [3, 6, 7, 8, 10, 11]
            },
            'Mercury': {
                'from_sun': [5, 6, 9, 11, 12],
                'from_moon': [2, 4, 6, 8, 10, 11],
                'from_mercury': [1, 3, 5, 6, 9, 10, 11, 12],
                'from_venus': [1, 2, 3, 4, 5, 8, 9, 11],
                'from_mars': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_jupiter': [6, 8, 11, 12],
                'from_saturn': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_ascendant': [1, 2, 4, 6, 8, 10, 11]
            },
            'Venus': {
                'from_sun': [8, 11, 12],
                'from_moon': [1, 2, 3, 4, 5, 8, 9, 11, 12],
                'from_mercury': [3, 5, 6, 9],
                'from_venus': [1, 2, 3, 4, 5, 8, 9, 10, 11],
                'from_mars': [3, 4, 6, 9, 11, 12],
                'from_jupiter': [5, 8, 9, 10, 11],
                'from_saturn': [3, 4, 5, 8, 9, 10, 11],
                'from_ascendant': [1, 2, 3, 4, 5, 8, 9, 11]
            },
            'Mars': {
                'from_sun': [3, 5, 6, 10, 11],
                'from_moon': [3, 6, 11],
                'from_mercury': [3, 5, 6, 11],
                'from_venus': [6, 8, 11, 12],
                'from_mars': [1, 2, 4, 7, 8, 10, 11],
                'from_jupiter': [6, 10, 11, 12],
                'from_saturn': [1, 4, 7, 8, 9, 10, 11],
                'from_ascendant': [1, 3, 6, 10, 11]
            },
            'Jupiter': {
                'from_sun': [1, 2, 3, 4, 7, 8, 9, 10, 11],
                'from_moon': [2, 5, 7, 9, 11],
                'from_mercury': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_venus': [2, 5, 6, 9, 10, 11],
                'from_mars': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_jupiter': [1, 2, 3, 4, 7, 8, 9, 10, 11],
                'from_saturn': [3, 5, 6, 12],
                'from_ascendant': [1, 2, 4, 5, 6, 7, 9, 10, 11]
            },
            'Saturn': {
                'from_sun': [1, 2, 4, 7, 8, 9, 10, 11],
                'from_moon': [3, 5, 6, 11],
                'from_mercury': [6, 8, 9, 10, 11, 12],
                'from_venus': [6, 11, 12],
                'from_mars': [3, 5, 6, 10, 11, 12],
                'from_jupiter': [5, 6, 11, 12],
                'from_saturn': [3, 5, 6, 11],
                'from_ascendant': [1, 3, 4, 6, 10, 11, 12]
            }
        }

    def calculate_ashtakavarga(self, planets: List[Dict[str, Any]], 
                              houses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate complete Ashtakavarga for all planets
        
        Args:
            planets: List of planet data with positions
            houses: List of house data
            
        Returns:
            Dictionary with Ashtakavarga calculations
        """
        # Create planet position mapping (house numbers)
        planet_houses = {}
        for planet in planets:
            if planet['name'] not in ['Rahu', 'Ketu']:  # Skip shadow planets
                planet_houses[planet['name'].lower()] = planet['house']
        
        # Add ascendant as house 1
        planet_houses['ascendant'] = 1
        
        # Calculate individual Ashtakavarga for each planet
        individual_charts = {}
        for planet_name in ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']:
            individual_charts[planet_name] = self._calculate_individual_ashtakavarga(
                planet_name, planet_houses
            )
        
        # Calculate Sarvashtakavarga (combined chart)
        sarvashtakavarga = self._calculate_sarvashtakavarga(individual_charts)
        
        # Calculate summary statistics
        summary = self._calculate_summary(individual_charts, sarvashtakavarga)
        
        return {
            'individual_charts': individual_charts,
            'sarvashtakavarga': sarvashtakavarga,
            'summary': summary,
            'strongest_houses': self._find_strongest_houses(sarvashtakavarga),
            'weakest_houses': self._find_weakest_houses(sarvashtakavarga),
            'planet_strengths': self._calculate_planet_strengths(individual_charts)
        }

    def _calculate_individual_ashtakavarga(self, planet_name: str, 
                                         planet_houses: Dict[str, int]) -> Dict[str, Any]:
        """Calculate individual Ashtakavarga chart for a planet"""
        chart = [0] * 12  # Initialize 12 houses with 0 points
        
        rules = self.contribution_rules.get(planet_name, {})
        
        # For each contributing factor
        for contributor, houses_to_contribute in rules.items():
            contributor_house = None
            
            if contributor == 'from_ascendant':
                contributor_house = 1  # Ascendant is always house 1
            else:
                # Extract planet name from 'from_planet' format
                contributor_planet = contributor.replace('from_', '')
                contributor_house = planet_houses.get(contributor_planet)
            
            if contributor_house is not None:
                # Add points to specified houses from contributor's position
                for house_offset in houses_to_contribute:
                    target_house = ((contributor_house - 1 + house_offset - 1) % 12) + 1
                    chart[target_house - 1] += 1
        
        # Calculate statistics for this planet's chart
        total_points = sum(chart)
        max_points = max(chart) if chart else 0
        min_points = min(chart) if chart else 0
        average_points = total_points / 12 if total_points > 0 else 0
        
        return {
            'chart': chart,
            'total_points': total_points,
            'max_points': max_points,
            'min_points': min_points,
            'average_points': round(average_points, 2),
            'strong_houses': [i + 1 for i, points in enumerate(chart) if points >= 4],
            'weak_houses': [i + 1 for i, points in enumerate(chart) if points <= 2]
        }

    def _calculate_sarvashtakavarga(self, individual_charts: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Sarvashtakavarga (combined chart of all planets)"""
        combined_chart = [0] * 12
        
        # Sum all individual charts
        for planet_chart in individual_charts.values():
            for i, points in enumerate(planet_chart['chart']):
                combined_chart[i] += points
        
        total_points = sum(combined_chart)
        max_points = max(combined_chart) if combined_chart else 0
        min_points = min(combined_chart) if combined_chart else 0
        average_points = total_points / 12 if total_points > 0 else 0
        
        return {
            'chart': combined_chart,
            'total_points': total_points,
            'max_points': max_points,
            'min_points': min_points,
            'average_points': round(average_points, 2),
            'strong_houses': [i + 1 for i, points in enumerate(combined_chart) if points >= 30],
            'weak_houses': [i + 1 for i, points in enumerate(combined_chart) if points <= 25]
        }

    def _calculate_summary(self, individual_charts: Dict[str, Dict[str, Any]], 
                          sarvashtakavarga: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate summary statistics"""
        total_individual_points = sum(chart['total_points'] for chart in individual_charts.values())
        
        # Planet with highest total points
        strongest_planet = max(individual_charts.keys(), 
                             key=lambda k: individual_charts[k]['total_points'])
        weakest_planet = min(individual_charts.keys(), 
                           key=lambda k: individual_charts[k]['total_points'])
        
        return {
            'total_ashtakavarga_points': total_individual_points,
            'sarvashtakavarga_points': sarvashtakavarga['total_points'],
            'strongest_planet': strongest_planet,
            'weakest_planet': weakest_planet,
            'strongest_planet_points': individual_charts[strongest_planet]['total_points'],
            'weakest_planet_points': individual_charts[weakest_planet]['total_points'],
            'average_planet_strength': round(total_individual_points / 7, 2),  # 7 planets
            'balance_score': self._calculate_balance_score(individual_charts)
        }

    def _calculate_balance_score(self, individual_charts: Dict[str, Dict[str, Any]]) -> float:
        """Calculate how balanced the planetary strengths are (0-100 scale)"""
        points = [chart['total_points'] for chart in individual_charts.values()]
        if not points:
            return 0
            
        mean_points = sum(points) / len(points)
        variance = sum((p - mean_points) ** 2 for p in points) / len(points)
        std_dev = variance ** 0.5
        
        # Convert to 0-100 scale (lower std dev = higher balance)
        max_possible_std = mean_points  # Theoretical maximum
        balance_score = max(0, 100 - (std_dev / max_possible_std * 100)) if max_possible_std > 0 else 100
        
        return round(balance_score, 1)

    def _find_strongest_houses(self, sarvashtakavarga: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find the strongest houses in Sarvashtakavarga"""
        chart = sarvashtakavarga['chart']
        house_strengths = [(i + 1, points) for i, points in enumerate(chart)]
        house_strengths.sort(key=lambda x: x[1], reverse=True)
        
        return [
            {'house': house, 'points': points, 'strength_grade': self._get_house_strength_grade(points)}
            for house, points in house_strengths[:3]
        ]

    def _find_weakest_houses(self, sarvashtakavarga: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find the weakest houses in Sarvashtakavarga"""
        chart = sarvashtakavarga['chart']
        house_strengths = [(i + 1, points) for i, points in enumerate(chart)]
        house_strengths.sort(key=lambda x: x[1])
        
        return [
            {'house': house, 'points': points, 'strength_grade': self._get_house_strength_grade(points)}
            for house, points in house_strengths[:3]
        ]

    def _calculate_planet_strengths(self, individual_charts: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Calculate relative strengths of planets based on their Ashtakavarga"""
        planet_strengths = {}
        
        for planet, chart_data in individual_charts.items():
            total_points = chart_data['total_points']
            strength_percentage = (total_points / 56) * 100  # 56 is theoretical maximum (8 contributors × 7 houses average)
            
            planet_strengths[planet] = {
                'total_points': total_points,
                'strength_percentage': round(strength_percentage, 1),
                'strength_grade': self._get_planet_strength_grade(total_points),
                'strong_houses_count': len(chart_data['strong_houses']),
                'weak_houses_count': len(chart_data['weak_houses'])
            }
        
        return planet_strengths

    def _get_house_strength_grade(self, points: int) -> str:
        """Get strength grade for a house based on Sarvashtakavarga points"""
        if points >= 35:
            return 'Excellent'
        elif points >= 30:
            return 'Very Good'
        elif points >= 25:
            return 'Good'
        elif points >= 20:
            return 'Average'
        elif points >= 15:
            return 'Weak'
        else:
            return 'Very Weak'

    def _get_planet_strength_grade(self, points: int) -> str:
        """Get strength grade for a planet based on individual Ashtakavarga points"""
        if points >= 40:
            return 'Excellent'
        elif points >= 35:
            return 'Very Good'
        elif points >= 30:
            return 'Good'
        elif points >= 25:
            return 'Average'
        elif points >= 20:
            return 'Weak'
        else:
            return 'Very Weak'
