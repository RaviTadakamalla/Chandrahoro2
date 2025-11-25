"""Astrological feature extraction service."""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class AstrologicalFeatures:
    """Astrological features data."""
    stock_symbol: str
    house_features: Dict[str, float]
    planetary_features: Dict[str, float]
    yoga_features: Dict[str, float]
    timing_features: Dict[str, float]
    total_score: float


class AstrologicalFeatureExtractor:
    """Extract astrological features from horoscopes."""
    
    # Wealth houses
    WEALTH_HOUSES = [2, 5, 8, 9, 10, 11, 12]
    
    # Planetary strength weights
    PLANETARY_WEIGHTS = {
        "Sun": 0.15,
        "Moon": 0.12,
        "Mars": 0.12,
        "Mercury": 0.10,
        "Jupiter": 0.18,
        "Venus": 0.15,
        "Saturn": 0.10,
        "Rahu": 0.05,
        "Ketu": 0.03,
    }
    
    # Yoga scores
    YOGA_SCORES = {
        "Raj Yoga": 0.20,
        "Dhana Yoga": 0.25,
        "Neecha Bhanga Yoga": 0.15,
        "Parivartana Yoga": 0.12,
        "Gaja Kesari Yoga": 0.18,
        "Panch Mahapurusha Yoga": 0.22,
        "Vipreet Raj Yoga": 0.10,
        "Amala Yoga": 0.08,
        "Saraswati Yoga": 0.12,
        "Lakshmi Yoga": 0.25,
    }
    
    def __init__(self):
        """Initialize feature extractor."""
        pass
    
    def extract_features(
        self,
        horoscope: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Extract astrological features from a horoscope.
        
        Args:
            horoscope: Horoscope data
            
        Returns:
            Extracted features
        """
        stock_symbol = horoscope["stock_symbol"]
        
        # Extract house features
        house_features = self._extract_house_features(horoscope)
        
        # Extract planetary features
        planetary_features = self._extract_planetary_features(horoscope)
        
        # Extract yoga features
        yoga_features = self._extract_yoga_features(horoscope)
        
        # Extract timing features
        timing_features = self._extract_timing_features(horoscope)
        
        # Calculate total score
        total_score = (
            sum(house_features.values()) * 0.35 +
            sum(planetary_features.values()) * 0.30 +
            sum(yoga_features.values()) * 0.25 +
            sum(timing_features.values()) * 0.10
        )
        
        logger.info(f"Extracted features for {stock_symbol}")
        
        return {
            "stock_symbol": stock_symbol,
            "house_features": {k: round(v, 3) for k, v in house_features.items()},
            "planetary_features": {k: round(v, 3) for k, v in planetary_features.items()},
            "yoga_features": {k: round(v, 3) for k, v in yoga_features.items()},
            "timing_features": {k: round(v, 3) for k, v in timing_features.items()},
            "total_score": round(total_score, 3),
        }
    
    def _extract_house_features(self, horoscope: Dict[str, Any]) -> Dict[str, float]:
        """Extract house features."""
        house_positions = horoscope.get("house_positions", {})
        features = {}
        
        for house_num in self.WEALTH_HOUSES:
            house_key = f"House {house_num}"
            if house_key in house_positions:
                # Normalize position to 0-1 scale
                position = house_positions[house_key]
                normalized = (position % 360) / 360
                features[f"house_{house_num}"] = normalized
            else:
                features[f"house_{house_num}"] = 0.5
        
        return features
    
    def _extract_planetary_features(self, horoscope: Dict[str, Any]) -> Dict[str, float]:
        """Extract planetary features."""
        planetary_positions = horoscope.get("planetary_positions", {})
        features = {}
        
        for planet, weight in self.PLANETARY_WEIGHTS.items():
            if planet in planetary_positions:
                # Normalize position to 0-1 scale
                position = planetary_positions[planet]
                normalized = (position % 360) / 360
                features[f"planet_{planet.lower()}"] = normalized * weight
            else:
                features[f"planet_{planet.lower()}"] = 0.5 * weight
        
        return features
    
    def _extract_yoga_features(self, horoscope: Dict[str, Any]) -> Dict[str, float]:
        """Extract yoga features."""
        yogas = horoscope.get("yogas", [])
        features = {}
        
        for yoga in yogas:
            score = self.YOGA_SCORES.get(yoga, 0.10)
            features[f"yoga_{yoga.lower().replace(' ', '_')}"] = score
        
        # Add missing yogas with 0 score
        for yoga in self.YOGA_SCORES.keys():
            yoga_key = f"yoga_{yoga.lower().replace(' ', '_')}"
            if yoga_key not in features:
                features[yoga_key] = 0.0
        
        return features
    
    def _extract_timing_features(self, horoscope: Dict[str, Any]) -> Dict[str, float]:
        """Extract timing features."""
        dasha_lord = horoscope.get("dasha_lord", "")
        nakshatra = horoscope.get("nakshatra", "")
        
        features = {}
        
        # Dasha lord strength (0-1)
        dasha_weight = self.PLANETARY_WEIGHTS.get(dasha_lord, 0.10)
        features["dasha_strength"] = dasha_weight
        
        # Nakshatra influence (0-1)
        # Nakshatras are 27, so normalize
        nakshatra_index = 0
        if nakshatra:
            from app.services.horoscope_generation_service import HoroscopeGenerator
            gen = HoroscopeGenerator()
            if nakshatra in gen.NAKSHATRAS:
                nakshatra_index = gen.NAKSHATRAS.index(nakshatra)
        
        features["nakshatra_influence"] = (nakshatra_index + 1) / 27
        
        return features
    
    def extract_batch_features(
        self,
        horoscopes: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Extract features from multiple horoscopes.
        
        Args:
            horoscopes: List of horoscopes
            
        Returns:
            List of extracted features
        """
        features_list = []
        for horoscope in horoscopes:
            features = self.extract_features(horoscope)
            features_list.append(features)
        
        logger.info(f"Extracted features from {len(horoscopes)} horoscopes")
        
        return features_list

