"""
Planetary Relationships Analysis Module

Implements three types of planetary relationships in Vedic astrology:
1. Naisargika Maitri (Natural Friendship)
2. Tatkalika Maitri (Temporary Friendship) 
3. Panchadha Maitri (Five-fold Friendship)
"""

from typing import Dict, List, Any, Tuple
from enum import Enum


class RelationshipType(Enum):
    GREAT_FRIEND = "Great Friend"
    FRIEND = "Friend"
    NEUTRAL = "Neutral"
    ENEMY = "Enemy"
    GREAT_ENEMY = "Great Enemy"


class PlanetaryRelationshipAnalyzer:
    """Analyze planetary relationships using traditional Vedic methods"""
    
    def __init__(self):
        # Natural friendship relationships (Naisargika Maitri)
        self.natural_relationships = {
            'Sun': {
                'friends': ['Moon', 'Mars', 'Jupiter'],
                'enemies': ['Venus', 'Saturn'],
                'neutral': ['Mercury']
            },
            'Moon': {
                'friends': ['Sun', 'Mercury'],
                'enemies': [],
                'neutral': ['Mars', 'Jupiter', 'Venus', 'Saturn']
            },
            'Mercury': {
                'friends': ['Sun', 'Venus'],
                'enemies': ['Moon'],
                'neutral': ['Mars', 'Jupiter', 'Saturn']
            },
            'Venus': {
                'friends': ['Mercury', 'Saturn'],
                'enemies': ['Sun', 'Moon'],
                'neutral': ['Mars', 'Jupiter']
            },
            'Mars': {
                'friends': ['Sun', 'Moon', 'Jupiter'],
                'enemies': ['Mercury'],
                'neutral': ['Venus', 'Saturn']
            },
            'Jupiter': {
                'friends': ['Sun', 'Moon', 'Mars'],
                'enemies': ['Mercury', 'Venus'],
                'neutral': ['Saturn']
            },
            'Saturn': {
                'friends': ['Mercury', 'Venus'],
                'enemies': ['Sun', 'Moon', 'Mars'],
                'neutral': ['Jupiter']
            }
        }
        
        # Planet ownership of signs
        self.sign_rulers = {
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

    def analyze_relationships(self, planets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze all planetary relationships in the chart
        
        Args:
            planets: List of planet data with positions
            
        Returns:
            Dictionary with relationship analysis
        """
        results = {}
        
        # Create planet position mapping
        planet_positions = {}
        for planet in planets:
            if planet['name'] not in ['Rahu', 'Ketu']:  # Skip shadow planets
                planet_positions[planet['name']] = planet.get('sidereal_longitude', planet.get('longitude', 0))
        
        # Analyze relationships for each planet
        for planet1 in planet_positions:
            results[planet1] = {}
            
            for planet2 in planet_positions:
                if planet1 != planet2:
                    relationship = self._calculate_panchadha_maitri(
                        planet1, planet2, planet_positions
                    )
                    results[planet1][planet2] = relationship
        
        # Generate summary
        summary = self._generate_relationship_summary(results)
        
        return {
            'relationships': results,
            'summary': summary,
            'strongest_friendships': self._find_strongest_relationships(results, 'friend'),
            'strongest_enmities': self._find_strongest_relationships(results, 'enemy')
        }

    def _calculate_panchadha_maitri(self, planet1: str, planet2: str, 
                                  planet_positions: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculate Panchadha Maitri (Five-fold friendship)
        
        Combines natural and temporary relationships to determine final relationship
        """
        # Get natural relationship
        natural_rel = self._get_natural_relationship(planet1, planet2)
        
        # Get temporary relationship
        temporary_rel = self._get_temporary_relationship(planet1, planet2, planet_positions)
        
        # Calculate final relationship using Panchadha Maitri rules
        final_rel = self._combine_relationships(natural_rel, temporary_rel)
        
        return {
            'natural_relationship': natural_rel,
            'temporary_relationship': temporary_rel,
            'final_relationship': final_rel,
            'relationship_strength': self._calculate_relationship_strength(final_rel),
            'description': self._get_relationship_description(planet1, planet2, final_rel)
        }

    def _get_natural_relationship(self, planet1: str, planet2: str) -> str:
        """Get natural relationship between two planets"""
        relationships = self.natural_relationships.get(planet1, {})
        
        if planet2 in relationships.get('friends', []):
            return 'Friend'
        elif planet2 in relationships.get('enemies', []):
            return 'Enemy'
        else:
            return 'Neutral'

    def _get_temporary_relationship(self, planet1: str, planet2: str, 
                                  planet_positions: Dict[str, float]) -> str:
        """
        Calculate temporary relationship based on house positions
        
        Temporary friendship is determined by the houses where planets are placed
        relative to each other
        """
        pos1 = planet_positions[planet1]
        pos2 = planet_positions[planet2]
        
        # Calculate house difference
        sign1 = int(pos1 // 30) + 1
        sign2 = int(pos2 // 30) + 1
        
        # Calculate relative position (how many houses apart)
        house_diff = abs(sign1 - sign2)
        if house_diff > 6:
            house_diff = 12 - house_diff
            
        # Temporary friendship rules:
        # 2nd, 3rd, 4th, 10th, 11th, 12th houses = Friend
        # 1st, 5th, 6th, 7th, 8th, 9th houses = Enemy
        if house_diff in [2, 3, 4, 10, 11, 12]:
            return 'Friend'
        else:
            return 'Enemy'

    def _combine_relationships(self, natural: str, temporary: str) -> str:
        """
        Combine natural and temporary relationships using Panchadha Maitri rules
        
        Rules:
        - Friend + Friend = Great Friend
        - Friend + Enemy = Neutral
        - Friend + Neutral = Friend
        - Enemy + Enemy = Great Enemy
        - Enemy + Friend = Neutral
        - Enemy + Neutral = Enemy
        - Neutral + Neutral = Neutral
        """
        if natural == 'Friend' and temporary == 'Friend':
            return 'Great Friend'
        elif natural == 'Enemy' and temporary == 'Enemy':
            return 'Great Enemy'
        elif (natural == 'Friend' and temporary == 'Enemy') or \
             (natural == 'Enemy' and temporary == 'Friend'):
            return 'Neutral'
        elif natural == 'Friend' and temporary == 'Neutral':
            return 'Friend'
        elif natural == 'Enemy' and temporary == 'Neutral':
            return 'Enemy'
        else:
            return 'Neutral'

    def _calculate_relationship_strength(self, relationship: str) -> int:
        """Calculate numerical strength of relationship"""
        strength_map = {
            'Great Friend': 5,
            'Friend': 3,
            'Neutral': 0,
            'Enemy': -3,
            'Great Enemy': -5
        }
        return strength_map.get(relationship, 0)

    def _get_relationship_description(self, planet1: str, planet2: str, relationship: str) -> str:
        """Get descriptive text for the relationship"""
        descriptions = {
            'Great Friend': f"{planet1} and {planet2} have an excellent relationship, supporting each other's significations strongly.",
            'Friend': f"{planet1} and {planet2} have a good relationship, generally supporting each other.",
            'Neutral': f"{planet1} and {planet2} have a neutral relationship, neither helping nor harming each other significantly.",
            'Enemy': f"{planet1} and {planet2} have a challenging relationship, potentially creating conflicts in their significations.",
            'Great Enemy': f"{planet1} and {planet2} have a very difficult relationship, strongly opposing each other's influences."
        }
        return descriptions.get(relationship, "Relationship status unclear.")

    def _generate_relationship_summary(self, relationships: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary statistics of all relationships"""
        total_relationships = 0
        relationship_counts = {
            'Great Friend': 0,
            'Friend': 0,
            'Neutral': 0,
            'Enemy': 0,
            'Great Enemy': 0
        }
        
        for planet1 in relationships:
            for planet2 in relationships[planet1]:
                final_rel = relationships[planet1][planet2]['final_relationship']
                relationship_counts[final_rel] += 1
                total_relationships += 1
        
        # Calculate percentages
        percentages = {}
        for rel_type, count in relationship_counts.items():
            percentages[rel_type] = round((count / total_relationships) * 100, 1) if total_relationships > 0 else 0
        
        # Overall harmony score
        harmony_score = 0
        for rel_type, count in relationship_counts.items():
            strength = self._calculate_relationship_strength(rel_type)
            harmony_score += strength * count
        
        # Normalize harmony score to 0-100 scale
        max_possible_score = total_relationships * 5  # All Great Friends
        min_possible_score = total_relationships * -5  # All Great Enemies
        
        if max_possible_score != min_possible_score:
            normalized_harmony = ((harmony_score - min_possible_score) / 
                                (max_possible_score - min_possible_score)) * 100
        else:
            normalized_harmony = 50
        
        return {
            'total_relationships': total_relationships,
            'relationship_counts': relationship_counts,
            'relationship_percentages': percentages,
            'harmony_score': round(normalized_harmony, 1),
            'harmony_grade': self._get_harmony_grade(normalized_harmony)
        }

    def _find_strongest_relationships(self, relationships: Dict[str, Dict[str, Any]], 
                                    rel_type: str) -> List[Dict[str, str]]:
        """Find the strongest friendships or enmities"""
        target_relationships = []
        
        if rel_type == 'friend':
            target_types = ['Great Friend', 'Friend']
        else:
            target_types = ['Great Enemy', 'Enemy']
        
        for planet1 in relationships:
            for planet2 in relationships[planet1]:
                final_rel = relationships[planet1][planet2]['final_relationship']
                if final_rel in target_types:
                    target_relationships.append({
                        'planet1': planet1,
                        'planet2': planet2,
                        'relationship': final_rel,
                        'strength': self._calculate_relationship_strength(final_rel)
                    })
        
        # Sort by strength and return top relationships
        target_relationships.sort(key=lambda x: abs(x['strength']), reverse=True)
        return target_relationships[:5]  # Top 5

    def _get_harmony_grade(self, harmony_score: float) -> str:
        """Get harmony grade based on score"""
        if harmony_score >= 80:
            return 'Excellent'
        elif harmony_score >= 65:
            return 'Very Good'
        elif harmony_score >= 50:
            return 'Good'
        elif harmony_score >= 35:
            return 'Average'
        elif harmony_score >= 20:
            return 'Below Average'
        else:
            return 'Poor'
