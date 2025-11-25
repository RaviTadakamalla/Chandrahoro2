"""
Strength Attribute Scoring Service

Maps Shadbala and Ashtakavarga calculations to 8 strength attributes:
1. Risk-Taking - Willingness to take calculated risks
2. Loyalty - Commitment and dedication to relationships/goals
3. Honesty - Integrity and truthfulness
4. Hardworking - Diligence and work ethic
5. Logical - Analytical and rational thinking
6. Creativity - Innovation and creative thinking
7. Leadership - Ability to lead and inspire
8. Adaptability - Flexibility and ability to adjust

Mapping Logic:
- Risk-Taking: Mars strength, Jupiter optimism, Saturn caution
- Loyalty: Moon emotional stability, Venus relationships, Saturn commitment
- Honesty: Mercury communication, Sun integrity, Saturn discipline
- Hardworking: Saturn discipline, Mars energy, Sun vitality
- Logical: Mercury intellect, Saturn structure, Jupiter wisdom
- Creativity: Venus aesthetics, Mercury communication, Jupiter expansion
- Leadership: Sun authority, Jupiter expansion, Mars courage
- Adaptability: Mercury flexibility, Moon emotions, Venus harmony
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, date
from dataclasses import dataclass
from app.core.shadbala import ShadbalaCalculator
from app.core.ashtakavarga import AshtakavargaCalculator
from app.core.ephemeris import EphemerisCalculator


@dataclass
class StrengthAttribute:
    """Strength attribute with score and contributing factors."""
    name: str
    score: float  # 1-10 scale
    contributing_factors: Dict[str, float]  # Factor name -> contribution value
    confidence: float  # 0-1 scale


class StrengthAttributeCalculator:
    """Calculate 8 strength attributes from Shadbala and Ashtakavarga."""
    
    def __init__(self):
        self.shadbala_calc = ShadbalaCalculator()
        self.ashtakavarga_calc = AshtakavargaCalculator()
        self.ephemeris = EphemerisCalculator()
        
        # Planet associations with strength attributes
        self.planet_attribute_map = {
            'Risk-Taking': {
                'Mars': 0.40,      # Mars = courage, risk
                'Jupiter': 0.35,   # Jupiter = optimism, expansion
                'Saturn': -0.25,   # Saturn = caution, limitation
            },
            'Loyalty': {
                'Moon': 0.35,      # Moon = emotions, attachment
                'Venus': 0.35,     # Venus = relationships, devotion
                'Saturn': 0.30,    # Saturn = commitment, duty
            },
            'Honesty': {
                'Mercury': 0.35,   # Mercury = communication, truth
                'Sun': 0.35,       # Sun = integrity, core self
                'Saturn': 0.30,    # Saturn = discipline, rules
            },
            'Hardworking': {
                'Saturn': 0.40,    # Saturn = discipline, hard work
                'Mars': 0.35,      # Mars = energy, drive
                'Sun': 0.25,       # Sun = vitality, strength
            },
            'Logical': {
                'Mercury': 0.45,   # Mercury = intellect, logic
                'Saturn': 0.30,    # Saturn = structure, order
                'Jupiter': 0.25,   # Jupiter = wisdom, philosophy
            },
            'Creativity': {
                'Venus': 0.40,     # Venus = aesthetics, beauty
                'Mercury': 0.35,   # Mercury = communication, expression
                'Jupiter': 0.25,   # Jupiter = expansion, growth
            },
            'Leadership': {
                'Sun': 0.45,       # Sun = authority, leadership
                'Jupiter': 0.35,   # Jupiter = expansion, influence
                'Mars': 0.20,      # Mars = courage, action
            },
            'Adaptability': {
                'Mercury': 0.40,   # Mercury = flexibility, communication
                'Moon': 0.35,      # Moon = emotions, sensitivity
                'Venus': 0.25,     # Venus = harmony, balance
            }
        }
    
    def calculate_strength_attributes(
        self,
        birth_date: date,
        birth_time: Optional[str],
        latitude: float,
        longitude: float,
        timezone: str,
        planets: List[Dict[str, Any]],
        houses: List[Dict[str, Any]],
        ayanamsha: str = "Lahiri"
    ) -> Dict[str, StrengthAttribute]:
        """
        Calculate all 8 strength attributes.
        
        Args:
            birth_date: Birth date
            birth_time: Birth time (HH:MM:SS format)
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Birth timezone
            planets: List of planet data with positions
            houses: List of house data
            ayanamsha: Ayanamsha system
            
        Returns:
            Dictionary mapping attribute names to StrengthAttribute objects
        """
        # Convert to datetime
        if birth_time:
            time_parts = birth_time.split(':')
            birth_datetime = datetime.combine(
                birth_date,
                datetime.strptime(birth_time, "%H:%M:%S").time()
            )
        else:
            birth_datetime = datetime.combine(birth_date, datetime.min.time())
        
        # Calculate Shadbala
        shadbala_result = self.shadbala_calc.calculate_shadbala(
            birth_datetime, latitude, longitude, planets, houses
        )
        shadbala_scores = shadbala_result['shadbala_scores']
        
        # Calculate Ashtakavarga
        ashtakavarga_result = self.ashtakavarga_calc.calculate_ashtakavarga(
            planets, houses
        )
        planet_strengths = ashtakavarga_result['planet_strengths']
        
        # Calculate each strength attribute
        attributes = {}
        for attr_name, planet_weights in self.planet_attribute_map.items():
            score, factors, confidence = self._calculate_attribute_score(
                attr_name,
                planet_weights,
                shadbala_scores,
                planet_strengths
            )
            
            attributes[attr_name] = StrengthAttribute(
                name=attr_name,
                score=score,
                contributing_factors=factors,
                confidence=confidence
            )
        
        return attributes
    
    def _calculate_attribute_score(
        self,
        attribute_name: str,
        planet_weights: Dict[str, float],
        shadbala_scores: Dict[str, Dict[str, Any]],
        planet_strengths: Dict[str, Dict[str, Any]]
    ) -> tuple:
        """
        Calculate score for a single strength attribute.
        
        Returns:
            Tuple of (score, contributing_factors, confidence)
        """
        weighted_sum = 0.0
        total_weight = 0.0
        factors = {}
        
        for planet, weight in planet_weights.items():
            if planet not in shadbala_scores:
                continue
            
            # Get Shadbala strength percentage (0-100)
            shadbala_pct = shadbala_scores[planet]['strength_percentage'] / 100.0
            
            # Get Ashtakavarga strength percentage (0-100)
            ashtakavarga_pct = planet_strengths[planet]['strength_percentage'] / 100.0
            
            # Combine both metrics (60% Shadbala, 40% Ashtakavarga)
            combined_strength = (shadbala_pct * 0.6) + (ashtakavarga_pct * 0.4)
            
            # Apply weight (can be negative for limiting factors)
            contribution = combined_strength * weight
            weighted_sum += contribution
            total_weight += abs(weight)
            
            factors[planet] = round(contribution, 2)
        
        # Normalize to 1-10 scale
        if total_weight > 0:
            normalized_score = (weighted_sum / total_weight) * 10.0
        else:
            normalized_score = 5.0  # Default middle score
        
        # Clamp to 1-10 range
        score = max(1.0, min(10.0, normalized_score))
        
        # Calculate confidence based on number of contributing factors
        num_factors = len([w for w in planet_weights.values() if w > 0])
        confidence = min(1.0, num_factors / 3.0)  # Max 3 positive factors
        
        return round(score, 1), factors, round(confidence, 2)
    
    def get_attribute_interpretation(self, attribute_name: str, score: float) -> str:
        """
        Get interpretation text for a strength attribute score.
        
        Args:
            attribute_name: Name of the attribute
            score: Score on 1-10 scale
            
        Returns:
            Interpretation text
        """
        if score >= 8.5:
            grade = "Excellent"
        elif score >= 7.0:
            grade = "Very Good"
        elif score >= 5.5:
            grade = "Good"
        elif score >= 4.0:
            grade = "Average"
        elif score >= 2.5:
            grade = "Below Average"
        else:
            grade = "Weak"
        
        interpretations = {
            'Risk-Taking': {
                'Excellent': 'Highly courageous and willing to take calculated risks',
                'Very Good': 'Good balance of courage and caution',
                'Good': 'Moderate risk tolerance',
                'Average': 'Prefers stability over risk',
                'Below Average': 'Risk-averse, prefers safe options',
                'Weak': 'Very cautious, avoids risks'
            },
            'Loyalty': {
                'Excellent': 'Deeply committed and devoted',
                'Very Good': 'Strong sense of loyalty and commitment',
                'Good': 'Reliable and dependable',
                'Average': 'Moderately loyal',
                'Below Average': 'May struggle with long-term commitment',
                'Weak': 'Difficulty maintaining loyalty'
            },
            'Honesty': {
                'Excellent': 'Highly truthful and ethical',
                'Very Good': 'Strong integrity and honesty',
                'Good': 'Generally honest and straightforward',
                'Average': 'Moderately honest',
                'Below Average': 'May compromise on honesty',
                'Weak': 'Difficulty with truthfulness'
            },
            'Hardworking': {
                'Excellent': 'Extremely diligent and hardworking',
                'Very Good': 'Strong work ethic and dedication',
                'Good': 'Willing to put in effort',
                'Average': 'Moderately hardworking',
                'Below Average': 'May lack motivation',
                'Weak': 'Difficulty with sustained effort'
            },
            'Logical': {
                'Excellent': 'Highly analytical and rational',
                'Very Good': 'Strong logical thinking',
                'Good': 'Good analytical skills',
                'Average': 'Moderately logical',
                'Below Average': 'May struggle with analysis',
                'Weak': 'Difficulty with logical thinking'
            },
            'Creativity': {
                'Excellent': 'Highly creative and innovative',
                'Very Good': 'Strong creative abilities',
                'Good': 'Good creative thinking',
                'Average': 'Moderately creative',
                'Below Average': 'Limited creative expression',
                'Weak': 'Difficulty with creativity'
            },
            'Leadership': {
                'Excellent': 'Natural leader with strong influence',
                'Very Good': 'Strong leadership qualities',
                'Good': 'Can lead effectively',
                'Average': 'Moderate leadership ability',
                'Below Average': 'May struggle with leadership',
                'Weak': 'Difficulty with leadership roles'
            },
            'Adaptability': {
                'Excellent': 'Highly flexible and adaptable',
                'Very Good': 'Strong ability to adapt',
                'Good': 'Can adjust to changes',
                'Average': 'Moderately adaptable',
                'Below Average': 'May struggle with change',
                'Weak': 'Difficulty adapting to change'
            }
        }
        
        return interpretations.get(attribute_name, {}).get(grade, f"{grade} {attribute_name}")

