"""Synergy calculation service for multi-profile compatibility analysis."""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime, date, timedelta
import math
import logging

logger = logging.getLogger(__name__)


@dataclass
class SynergyScore:
    """Synergy score data."""
    overall_synergy_score: float
    house_synergy_score: float
    planetary_compatibility_score: float
    strength_alignment_score: float
    dasha_alignment_score: float
    yoga_compatibility_score: float
    strengths: List[str]
    challenges: List[str]
    recommendations: str


class SynergyCalculator:
    """Calculate synergy between two birth charts."""
    
    # House synergy weights
    HOUSE_WEIGHTS = {
        2: 0.15,   # Wealth
        5: 0.15,   # Children
        7: 0.20,   # Partnership
        9: 0.15,   # Fortune
        10: 0.15,  # Career
        11: 0.15,  # Gains
        12: 0.05,  # Losses/Spirituality
    }
    
    # Planetary compatibility matrix (0-1 scale)
    PLANETARY_COMPATIBILITY = {
        "Sun": {"Sun": 0.7, "Moon": 0.8, "Mars": 0.6, "Mercury": 0.7, "Jupiter": 0.9, "Venus": 0.8, "Saturn": 0.5},
        "Moon": {"Sun": 0.8, "Moon": 0.9, "Mars": 0.6, "Mercury": 0.8, "Jupiter": 0.9, "Venus": 0.9, "Saturn": 0.6},
        "Mars": {"Sun": 0.6, "Moon": 0.6, "Mars": 0.7, "Mercury": 0.7, "Jupiter": 0.8, "Venus": 0.5, "Saturn": 0.5},
        "Mercury": {"Sun": 0.7, "Moon": 0.8, "Mars": 0.7, "Mercury": 0.8, "Jupiter": 0.8, "Venus": 0.8, "Saturn": 0.6},
        "Jupiter": {"Sun": 0.9, "Moon": 0.9, "Mars": 0.8, "Mercury": 0.8, "Jupiter": 0.9, "Venus": 0.9, "Saturn": 0.7},
        "Venus": {"Sun": 0.8, "Moon": 0.9, "Mars": 0.5, "Mercury": 0.8, "Jupiter": 0.9, "Venus": 0.9, "Saturn": 0.6},
        "Saturn": {"Sun": 0.5, "Moon": 0.6, "Mars": 0.5, "Mercury": 0.6, "Jupiter": 0.7, "Venus": 0.6, "Saturn": 0.7},
    }
    
    def calculate_house_synergy(
        self,
        chart1_houses: Dict[int, Dict[str, Any]],
        chart2_houses: Dict[int, Dict[str, Any]],
    ) -> float:
        """
        Calculate house synergy score (0-100).
        
        Compares key houses between two charts:
        - 2nd house (wealth)
        - 5th house (children)
        - 7th house (partnership)
        - 9th house (fortune)
        - 10th house (career)
        - 11th house (gains)
        - 12th house (spirituality)
        
        Args:
            chart1_houses: First chart's house data
            chart2_houses: Second chart's house data
            
        Returns:
            House synergy score (0-100)
        """
        total_score = 0.0
        total_weight = 0.0
        
        for house_num, weight in self.HOUSE_WEIGHTS.items():
            if house_num in chart1_houses and house_num in chart2_houses:
                # Get house lords
                lord1 = chart1_houses[house_num].get("lord", "")
                lord2 = chart2_houses[house_num].get("lord", "")
                
                # Calculate compatibility
                if lord1 and lord2 and lord1 in self.PLANETARY_COMPATIBILITY:
                    compat = self.PLANETARY_COMPATIBILITY[lord1].get(lord2, 0.5)
                    total_score += compat * weight * 100
                    total_weight += weight
        
        if total_weight > 0:
            return total_score / total_weight
        return 50.0
    
    def calculate_planetary_compatibility(
        self,
        chart1_planets: Dict[str, Dict[str, Any]],
        chart2_planets: Dict[str, Dict[str, Any]],
    ) -> float:
        """
        Calculate planetary compatibility score (0-100).
        
        Compares planetary positions and aspects between charts.
        
        Args:
            chart1_planets: First chart's planetary data
            chart2_planets: Second chart's planetary data
            
        Returns:
            Planetary compatibility score (0-100)
        """
        total_score = 0.0
        count = 0
        
        for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
            if planet in chart1_planets and planet in chart2_planets:
                p1_long = chart1_planets[planet].get("longitude", 0)
                p2_long = chart2_planets[planet].get("longitude", 0)
                
                # Calculate angular distance
                diff = abs(p1_long - p2_long)
                if diff > 180:
                    diff = 360 - diff
                
                # Compatibility based on distance
                # 0° (conjunction) = 0.9, 60° (sextile) = 0.8, 90° (square) = 0.4, 180° (opposition) = 0.5
                if diff < 10:
                    compat = 0.9
                elif diff < 30:
                    compat = 0.8
                elif diff < 60:
                    compat = 0.75
                elif diff < 90:
                    compat = 0.6
                elif diff < 120:
                    compat = 0.5
                elif diff < 150:
                    compat = 0.6
                else:
                    compat = 0.5
                
                total_score += compat * 100
                count += 1
        
        if count > 0:
            return total_score / count
        return 50.0
    
    def calculate_strength_alignment(
        self,
        strengths1: Dict[str, float],
        strengths2: Dict[str, float],
    ) -> float:
        """
        Calculate strength attribute alignment (0-100).
        
        Compares 8 strength attributes between two profiles.
        
        Args:
            strengths1: First profile's strength attributes
            strengths2: Second profile's strength attributes
            
        Returns:
            Strength alignment score (0-100)
        """
        total_score = 0.0
        count = 0
        
        for attr in ["Risk-Taking", "Loyalty", "Honesty", "Hardworking", "Logical", "Creativity", "Leadership", "Adaptability"]:
            if attr in strengths1 and attr in strengths2:
                s1 = strengths1[attr]
                s2 = strengths2[attr]
                
                # Calculate alignment (1-10 scale)
                diff = abs(s1 - s2)
                alignment = 10 - diff  # 0 diff = 10, 9 diff = 1
                alignment = max(1, min(10, alignment))
                
                total_score += (alignment / 10) * 100
                count += 1
        
        if count > 0:
            return total_score / count
        return 50.0
    
    def calculate_dasha_alignment(
        self,
        dasha1: Dict[str, Any],
        dasha2: Dict[str, Any],
    ) -> float:
        """
        Calculate dasha period alignment (0-100).
        
        Compares current dasha periods between two charts.
        
        Args:
            dasha1: First chart's current dasha
            dasha2: Second chart's current dasha
            
        Returns:
            Dasha alignment score (0-100)
        """
        # Get mahadasha lords
        lord1 = dasha1.get("mahadasha_lord", "")
        lord2 = dasha2.get("mahadasha_lord", "")
        
        if lord1 and lord2 and lord1 in self.PLANETARY_COMPATIBILITY:
            compat = self.PLANETARY_COMPATIBILITY[lord1].get(lord2, 0.5)
            return compat * 100
        
        return 50.0
    
    def calculate_yoga_compatibility(
        self,
        yogas1: List[str],
        yogas2: List[str],
    ) -> float:
        """
        Calculate yoga compatibility (0-100).
        
        Compares yogas between two charts.
        
        Args:
            yogas1: First chart's yogas
            yogas2: Second chart's yogas
            
        Returns:
            Yoga compatibility score (0-100)
        """
        if not yogas1 or not yogas2:
            return 50.0
        
        # Count matching yogas
        matching = len(set(yogas1) & set(yogas2))
        total = len(set(yogas1) | set(yogas2))
        
        if total > 0:
            return (matching / total) * 100
        return 50.0
    
    def calculate_synergy(
        self,
        chart1_houses: Dict[int, Dict[str, Any]],
        chart2_houses: Dict[int, Dict[str, Any]],
        chart1_planets: Dict[str, Dict[str, Any]],
        chart2_planets: Dict[str, Dict[str, Any]],
        strengths1: Dict[str, float],
        strengths2: Dict[str, float],
        dasha1: Dict[str, Any],
        dasha2: Dict[str, Any],
        yogas1: List[str],
        yogas2: List[str],
    ) -> SynergyScore:
        """
        Calculate overall synergy between two charts.
        
        Args:
            chart1_houses: First chart's house data
            chart2_houses: Second chart's house data
            chart1_planets: First chart's planetary data
            chart2_planets: Second chart's planetary data
            strengths1: First profile's strength attributes
            strengths2: Second profile's strength attributes
            dasha1: First chart's current dasha
            dasha2: Second chart's current dasha
            yogas1: First chart's yogas
            yogas2: Second chart's yogas
            
        Returns:
            Synergy score with detailed breakdown
        """
        # Calculate individual scores
        house_score = self.calculate_house_synergy(chart1_houses, chart2_houses)
        planetary_score = self.calculate_planetary_compatibility(chart1_planets, chart2_planets)
        strength_score = self.calculate_strength_alignment(strengths1, strengths2)
        dasha_score = self.calculate_dasha_alignment(dasha1, dasha2)
        yoga_score = self.calculate_yoga_compatibility(yogas1, yogas2)
        
        # Calculate weighted overall score
        overall_score = (
            house_score * 0.25 +
            planetary_score * 0.25 +
            strength_score * 0.20 +
            dasha_score * 0.15 +
            yoga_score * 0.15
        )
        
        # Generate strengths and challenges
        strengths = []
        challenges = []
        
        if house_score > 70:
            strengths.append("Strong house alignment for partnership and wealth")
        if planetary_score > 70:
            strengths.append("Excellent planetary compatibility")
        if strength_score > 70:
            strengths.append("Well-aligned strength attributes")
        if dasha_score > 70:
            strengths.append("Favorable dasha period alignment")
        if yoga_score > 70:
            strengths.append("Compatible yogas between charts")
        
        if house_score < 40:
            challenges.append("Weak house alignment - may face partnership challenges")
        if planetary_score < 40:
            challenges.append("Planetary conflicts - potential friction points")
        if strength_score < 40:
            challenges.append("Misaligned strength attributes - different approaches")
        if dasha_score < 40:
            challenges.append("Challenging dasha alignment - timing issues")
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            overall_score, house_score, planetary_score, strength_score, dasha_score, yoga_score
        )
        
        return SynergyScore(
            overall_synergy_score=round(overall_score, 2),
            house_synergy_score=round(house_score, 2),
            planetary_compatibility_score=round(planetary_score, 2),
            strength_alignment_score=round(strength_score, 2),
            dasha_alignment_score=round(dasha_score, 2),
            yoga_compatibility_score=round(yoga_score, 2),
            strengths=strengths,
            challenges=challenges,
            recommendations=recommendations,
        )
    
    def _generate_recommendations(
        self,
        overall: float,
        house: float,
        planetary: float,
        strength: float,
        dasha: float,
        yoga: float,
    ) -> str:
        """Generate recommendations based on synergy scores."""
        if overall > 75:
            return "Excellent compatibility. This is a highly favorable match with strong potential for success."
        elif overall > 60:
            return "Good compatibility. The relationship has solid foundations with some areas to work on."
        elif overall > 45:
            return "Moderate compatibility. Success depends on mutual effort and understanding."
        else:
            return "Challenging compatibility. Significant effort and compromise will be needed."

