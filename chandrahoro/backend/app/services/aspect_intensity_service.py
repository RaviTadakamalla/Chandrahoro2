"""Aspect Intensity Calculation Engine for life aspects."""

from datetime import datetime, timedelta, date
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import logging
import math

from app.core.dasha import VimshottariDasha
from app.core.transits import TransitCalculator
from app.core.ephemeris import EphemerisCalculator
from app.models import AspectTimeline

logger = logging.getLogger(__name__)


# Mapping of life aspects to relevant strength attributes
ASPECT_STRENGTH_MAPPING = {
    "Wealth": {
        "Risk-Taking": 0.35,      # Willingness to take investment risks
        "Hardworking": 0.30,      # Effort in wealth creation
        "Logical": 0.35,          # Analytical decision-making
    },
    "Health": {
        "Adaptability": 0.40,     # Ability to adapt to health changes
        "Hardworking": 0.30,      # Discipline in health maintenance
        "Loyalty": 0.30,          # Commitment to health routines
    },
    "Business": {
        "Risk-Taking": 0.35,      # Entrepreneurial courage
        "Leadership": 0.35,       # Leadership in business
        "Creativity": 0.30,       # Innovation in business
    },
    "Spouse": {
        "Loyalty": 0.40,          # Commitment to relationship
        "Honesty": 0.35,          # Truthfulness and trust
        "Adaptability": 0.25,     # Flexibility in relationship
    },
    "Kids": {
        "Loyalty": 0.35,          # Commitment to children
        "Creativity": 0.35,       # Creative parenting
        "Leadership": 0.30,       # Guidance and leadership
    },
    "Career": {
        "Leadership": 0.35,       # Career advancement through leadership
        "Hardworking": 0.35,      # Work ethic and dedication
        "Logical": 0.30,          # Strategic career decisions
    },
}


@dataclass
class AspectIntensity:
    """Aspect intensity data."""
    aspect_name: str
    date: datetime
    intensity_score: float  # 1-10 scale
    confidence_band_low: float
    confidence_band_high: float
    dasha_period: Optional[str]
    transit_info: Optional[str]
    factors: Dict[str, float]  # Contributing factors


class AspectIntensityCalculator:
    """Calculate intensity scores for life aspects."""
    
    # Life aspects
    LIFE_ASPECTS = ["Wealth", "Health", "Business", "Spouse", "Kids", "Career"]
    
    # House associations for each aspect
    ASPECT_HOUSES = {
        "Wealth": [2, 5, 8, 9, 11],      # 2nd (wealth), 5th (speculation), 8th (inheritance), 9th (luck), 11th (gains)
        "Health": [1, 6, 8, 12],          # 1st (body), 6th (disease), 8th (chronic), 12th (hospitalization)
        "Business": [10, 11, 2, 5],       # 10th (career), 11th (gains), 2nd (wealth), 5th (speculation)
        "Spouse": [7, 8, 12],             # 7th (marriage), 8th (longevity), 12th (separation)
        "Kids": [5, 7, 11],               # 5th (children), 7th (partnership), 11th (gains)
        "Career": [10, 6, 2, 11],         # 10th (career), 6th (service), 2nd (wealth), 11th (gains)
    }
    
    # Planet associations for each aspect
    ASPECT_PLANETS = {
        "Wealth": ["Jupiter", "Venus", "Mercury"],
        "Health": ["Sun", "Moon", "Mars"],
        "Business": ["Mercury", "Jupiter", "Saturn"],
        "Spouse": ["Venus", "Jupiter", "Mars"],
        "Kids": ["Jupiter", "Venus", "Sun"],
        "Career": ["Saturn", "Sun", "Mercury"],
    }
    
    def __init__(self):
        """Initialize calculator."""
        self.dasha_calc = VimshottariDasha()
        self.transit_calc = TransitCalculator()
        self.ephemeris = EphemerisCalculator()
    
    def calculate_aspect_intensity(
        self,
        aspect_name: str,
        birth_date: date,
        birth_time: Optional[str],
        latitude: float,
        longitude: float,
        timezone: str,
        target_date: datetime,
        ayanamsha: str = "Lahiri",
    ) -> AspectIntensity:
        """
        Calculate intensity score for an aspect on a specific date.
        
        Args:
            aspect_name: Name of life aspect
            birth_date: Birth date
            birth_time: Birth time (HH:MM:SS)
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Birth timezone
            target_date: Date to calculate intensity for
            ayanamsha: Ayanamsha system
            
        Returns:
            AspectIntensity object
        """
        if aspect_name not in self.LIFE_ASPECTS:
            raise ValueError(f"Unknown aspect: {aspect_name}")
        
        # Calculate dasha period
        dasha_info = self.dasha_calc.get_dasha_at_date(birth_date, target_date)
        dasha_period = f"{dasha_info['mahadasha']} - {dasha_info['antardasha']}"
        
        # Calculate transit influences
        transit_score = self._calculate_transit_influence(
            aspect_name, target_date, latitude, longitude, timezone, ayanamsha
        )
        
        # Calculate dasha influence
        dasha_score = self._calculate_dasha_influence(aspect_name, dasha_info)
        
        # Calculate house influence
        house_score = self._calculate_house_influence(
            aspect_name, target_date, latitude, longitude, timezone, ayanamsha
        )
        
        # Aggregate scores
        factors = {
            "transit_influence": transit_score,
            "dasha_influence": dasha_score,
            "house_influence": house_score,
        }
        
        # Calculate weighted intensity (1-10 scale)
        intensity_score = self._aggregate_scores(factors)
        
        # Calculate confidence bands
        confidence_low, confidence_high = self._calculate_confidence_bands(
            intensity_score, factors
        )
        
        # Get transit info
        transit_info = self._get_transit_info(aspect_name, target_date, latitude, longitude, timezone)
        
        return AspectIntensity(
            aspect_name=aspect_name,
            date=target_date,
            intensity_score=intensity_score,
            confidence_band_low=confidence_low,
            confidence_band_high=confidence_high,
            dasha_period=dasha_period,
            transit_info=transit_info,
            factors=factors,
        )
    
    def _calculate_transit_influence(
        self,
        aspect_name: str,
        target_date: datetime,
        latitude: float,
        longitude: float,
        timezone: str,
        ayanamsha: str,
    ) -> float:
        """Calculate transit influence on aspect (0-10 scale)."""
        score = 5.0  # Neutral baseline
        
        # Get current planetary positions
        planets = self.ephemeris.calculate_planets(
            target_date, latitude, longitude, timezone, ayanamsha
        )
        
        # Check positions of relevant planets
        for planet_name in self.ASPECT_PLANETS[aspect_name]:
            if planet_name in planets:
                planet = planets[planet_name]
                # Planets in favorable houses increase score
                if planet.get("house") in self.ASPECT_HOUSES[aspect_name]:
                    score += 1.5
                # Retrograde planets decrease score
                if planet.get("retrograde"):
                    score -= 0.5
        
        return min(10.0, max(1.0, score))
    
    def _calculate_dasha_influence(
        self,
        aspect_name: str,
        dasha_info: Dict,
    ) -> float:
        """Calculate dasha influence on aspect (0-10 scale)."""
        score = 5.0  # Neutral baseline
        
        # Favorable dashas for each aspect
        favorable_dashas = {
            "Wealth": ["Jupiter", "Venus", "Mercury"],
            "Health": ["Sun", "Moon"],
            "Business": ["Mercury", "Jupiter"],
            "Spouse": ["Venus", "Jupiter"],
            "Kids": ["Jupiter", "Venus"],
            "Career": ["Saturn", "Sun"],
        }
        
        mahadasha = dasha_info.get("mahadasha", "")
        antardasha = dasha_info.get("antardasha", "")
        
        # Check if current dasha is favorable
        if mahadasha in favorable_dashas[aspect_name]:
            score += 2.0
        if antardasha in favorable_dashas[aspect_name]:
            score += 1.5
        
        return min(10.0, max(1.0, score))
    
    def _calculate_house_influence(
        self,
        aspect_name: str,
        target_date: datetime,
        latitude: float,
        longitude: float,
        timezone: str,
        ayanamsha: str,
    ) -> float:
        """Calculate house influence on aspect (0-10 scale)."""
        score = 5.0  # Neutral baseline
        
        # Get current planetary positions
        planets = self.ephemeris.calculate_planets(
            target_date, latitude, longitude, timezone, ayanamsha
        )
        
        # Count planets in favorable houses
        favorable_count = 0
        for planet_name, planet in planets.items():
            if planet.get("house") in self.ASPECT_HOUSES[aspect_name]:
                favorable_count += 1
        
        # Adjust score based on favorable planets
        score += favorable_count * 0.5
        
        return min(10.0, max(1.0, score))
    
    def _aggregate_scores(self, factors: Dict[str, float]) -> float:
        """Aggregate factor scores into final intensity score."""
        # Weighted average: transit (40%), dasha (35%), house (25%)
        weights = {
            "transit_influence": 0.40,
            "dasha_influence": 0.35,
            "house_influence": 0.25,
        }
        
        total = sum(factors[key] * weights[key] for key in factors)
        return round(total, 2)
    
    def _calculate_confidence_bands(
        self,
        intensity_score: float,
        factors: Dict[str, float],
    ) -> Tuple[float, float]:
        """Calculate confidence bands around intensity score."""
        # Standard deviation based on factor variance
        variance = sum((factors[key] - intensity_score) ** 2 for key in factors) / len(factors)
        std_dev = math.sqrt(variance)
        
        # Confidence bands (±1 standard deviation)
        confidence_low = max(1.0, intensity_score - std_dev)
        confidence_high = min(10.0, intensity_score + std_dev)
        
        return round(confidence_low, 2), round(confidence_high, 2)
    
    def _get_transit_info(
        self,
        aspect_name: str,
        target_date: datetime,
        latitude: float,
        longitude: float,
        timezone: str,
    ) -> str:
        """Get transit information for the aspect."""
        info_parts = []
        
        # Get current planetary positions
        planets = self.ephemeris.calculate_planets(
            target_date, latitude, longitude, timezone, "Lahiri"
        )
        
        # Collect info about relevant planets
        for planet_name in self.ASPECT_PLANETS[aspect_name]:
            if planet_name in planets:
                planet = planets[planet_name]
                sign = planet.get("sign", "Unknown")
                house = planet.get("house", 0)
                retrograde = " (R)" if planet.get("retrograde") else ""
                info_parts.append(f"{planet_name} in {sign} H{house}{retrograde}")
        
        return "; ".join(info_parts) if info_parts else "No transit info"
    
    def calculate_timeline(
        self,
        aspect_name: str,
        birth_date: date,
        birth_time: Optional[str],
        latitude: float,
        longitude: float,
        timezone: str,
        start_date: datetime,
        end_date: datetime,
        interval_days: int = 7,
        ayanamsha: str = "Lahiri",
    ) -> List[AspectIntensity]:
        """
        Calculate aspect intensity timeline for a date range.

        Args:
            aspect_name: Name of life aspect
            birth_date: Birth date
            birth_time: Birth time
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Birth timezone
            start_date: Timeline start date
            end_date: Timeline end date
            interval_days: Days between calculations
            ayanamsha: Ayanamsha system

        Returns:
            List of AspectIntensity objects
        """
        timeline = []
        current_date = start_date

        while current_date <= end_date:
            intensity = self.calculate_aspect_intensity(
                aspect_name, birth_date, birth_time, latitude, longitude,
                timezone, current_date, ayanamsha
            )
            timeline.append(intensity)
            current_date += timedelta(days=interval_days)

        return timeline

    def calculate_integrated_prediction(
        self,
        aspect_name: str,
        birth_date: date,
        birth_time: Optional[str],
        latitude: float,
        longitude: float,
        timezone: str,
        target_date: datetime,
        strength_attributes: Optional[Dict[str, float]] = None,
        ayanamsha: str = "Lahiri",
    ) -> Dict[str, Any]:
        """
        Calculate integrated prediction for an aspect using strength attributes.

        This method combines:
        1. Astrological factors (transit, dasha, house)
        2. Strength attributes relevant to the aspect

        Args:
            aspect_name: Name of life aspect
            birth_date: Birth date
            birth_time: Birth time (HH:MM:SS)
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Birth timezone
            target_date: Date to calculate prediction for
            strength_attributes: Dict of strength attribute scores (1-10 scale)
            ayanamsha: Ayanamsha system

        Returns:
            Dictionary with integrated prediction data
        """
        if aspect_name not in self.LIFE_ASPECTS:
            raise ValueError(f"Unknown aspect: {aspect_name}")

        # Get base astrological intensity
        base_intensity = self.calculate_aspect_intensity(
            aspect_name, birth_date, birth_time, latitude, longitude,
            timezone, target_date, ayanamsha
        )

        # Initialize integrated score with base intensity
        integrated_score = base_intensity.intensity_score
        strength_contribution = 0.0
        strength_factors = {}

        # Apply strength attribute adjustments if provided
        if strength_attributes:
            aspect_strengths = ASPECT_STRENGTH_MAPPING.get(aspect_name, {})
            total_strength_weight = 0.0

            for attr_name, attr_weight in aspect_strengths.items():
                if attr_name in strength_attributes:
                    attr_score = strength_attributes[attr_name]
                    # Normalize attribute score (1-10) to adjustment factor (0.8-1.2)
                    # Score of 5 = 1.0 (neutral), 10 = 1.2 (boost), 1 = 0.8 (reduce)
                    adjustment_factor = 0.8 + (attr_score - 1.0) * 0.04
                    contribution = adjustment_factor * attr_weight
                    strength_factors[attr_name] = round(contribution, 2)
                    strength_contribution += contribution
                    total_strength_weight += attr_weight

            # Apply strength adjustment to integrated score
            if total_strength_weight > 0:
                strength_multiplier = strength_contribution / total_strength_weight
                integrated_score = base_intensity.intensity_score * strength_multiplier
                integrated_score = max(1.0, min(10.0, integrated_score))

        # Calculate adjusted confidence bands
        confidence_low = max(1.0, integrated_score - 1.5)
        confidence_high = min(10.0, integrated_score + 1.5)

        return {
            "aspect_name": aspect_name,
            "date": target_date,
            "base_intensity_score": round(base_intensity.intensity_score, 2),
            "integrated_prediction_score": round(integrated_score, 2),
            "confidence_band_low": round(confidence_low, 2),
            "confidence_band_high": round(confidence_high, 2),
            "dasha_period": base_intensity.dasha_period,
            "transit_info": base_intensity.transit_info,
            "astrological_factors": base_intensity.factors,
            "strength_factors": strength_factors,
            "strength_contribution": round(strength_contribution, 2) if strength_attributes else None,
        }

    def calculate_integrated_timeline(
        self,
        aspect_name: str,
        birth_date: date,
        birth_time: Optional[str],
        latitude: float,
        longitude: float,
        timezone: str,
        start_date: datetime,
        end_date: datetime,
        strength_attributes: Optional[Dict[str, float]] = None,
        interval_days: int = 7,
        ayanamsha: str = "Lahiri",
    ) -> List[Dict[str, Any]]:
        """
        Calculate integrated prediction timeline for a date range.

        Args:
            aspect_name: Name of life aspect
            birth_date: Birth date
            birth_time: Birth time
            latitude: Birth latitude
            longitude: Birth longitude
            timezone: Birth timezone
            start_date: Timeline start date
            end_date: Timeline end date
            strength_attributes: Dict of strength attribute scores
            interval_days: Days between calculations
            ayanamsha: Ayanamsha system

        Returns:
            List of integrated prediction dictionaries
        """
        timeline = []
        current_date = start_date

        while current_date <= end_date:
            prediction = self.calculate_integrated_prediction(
                aspect_name, birth_date, birth_time, latitude, longitude,
                timezone, current_date, strength_attributes, ayanamsha
            )
            timeline.append(prediction)
            current_date += timedelta(days=interval_days)

        return timeline

