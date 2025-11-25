"""Feature aggregation and scoring service."""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class AggregatedScore:
    """Aggregated score data."""
    stock_symbol: str
    astrological_score: float
    confidence: float
    feature_breakdown: Dict[str, float]
    recommendation: str


class FeatureAggregationService:
    """Aggregate features and calculate scores."""
    
    # Default feature weights
    DEFAULT_WEIGHTS = {
        "house_features": 0.35,
        "planetary_features": 0.30,
        "yoga_features": 0.25,
        "timing_features": 0.10,
    }
    
    # Confidence thresholds
    CONFIDENCE_THRESHOLDS = {
        "high": 0.75,
        "medium": 0.50,
        "low": 0.25,
    }
    
    # Recommendation thresholds
    RECOMMENDATION_THRESHOLDS = {
        "strong_buy": 0.80,
        "buy": 0.65,
        "hold": 0.50,
        "sell": 0.35,
        "strong_sell": 0.20,
    }
    
    def __init__(self):
        """Initialize feature aggregation service."""
        pass
    
    def aggregate_features(
        self,
        features: Dict[str, Any],
        custom_weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Aggregate features and calculate score.
        
        Args:
            features: Extracted features
            custom_weights: Custom feature weights
            
        Returns:
            Aggregated score
        """
        weights = custom_weights or self.DEFAULT_WEIGHTS
        
        stock_symbol = features.get("stock_symbol", "UNKNOWN")
        
        # Get feature scores
        house_score = sum(features.get("house_features", {}).values()) / max(1, len(features.get("house_features", {})))
        planetary_score = sum(features.get("planetary_features", {}).values()) / max(1, len(features.get("planetary_features", {})))
        yoga_score = sum(features.get("yoga_features", {}).values()) / max(1, len(features.get("yoga_features", {})))
        timing_score = sum(features.get("timing_features", {}).values()) / max(1, len(features.get("timing_features", {})))
        
        # Calculate weighted score
        astrological_score = (
            house_score * weights.get("house_features", 0.35) +
            planetary_score * weights.get("planetary_features", 0.30) +
            yoga_score * weights.get("yoga_features", 0.25) +
            timing_score * weights.get("timing_features", 0.10)
        )
        
        # Normalize to 0-1 range
        astrological_score = min(1.0, max(0.0, astrological_score))
        
        # Calculate confidence
        confidence = self._calculate_confidence(features)
        
        # Generate recommendation
        recommendation = self._get_recommendation(astrological_score)
        
        logger.info(f"Aggregated features for {stock_symbol}: score={astrological_score:.3f}")
        
        return {
            "stock_symbol": stock_symbol,
            "astrological_score": round(astrological_score, 3),
            "confidence": round(confidence, 3),
            "feature_breakdown": {
                "house_score": round(house_score, 3),
                "planetary_score": round(planetary_score, 3),
                "yoga_score": round(yoga_score, 3),
                "timing_score": round(timing_score, 3),
            },
            "recommendation": recommendation,
        }
    
    def aggregate_batch_features(
        self,
        features_list: List[Dict[str, Any]],
        custom_weights: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Aggregate features for multiple stocks.
        
        Args:
            features_list: List of extracted features
            custom_weights: Custom feature weights
            
        Returns:
            List of aggregated scores
        """
        aggregated = []
        for features in features_list:
            score = self.aggregate_features(features, custom_weights)
            aggregated.append(score)
        
        logger.info(f"Aggregated features for {len(features_list)} stocks")
        
        return aggregated
    
    def _calculate_confidence(self, features: Dict[str, Any]) -> float:
        """Calculate confidence level."""
        # Count non-zero features
        total_features = 0
        non_zero_features = 0
        
        for feature_type in ["house_features", "planetary_features", "yoga_features", "timing_features"]:
            feature_dict = features.get(feature_type, {})
            for value in feature_dict.values():
                total_features += 1
                if value > 0:
                    non_zero_features += 1
        
        if total_features == 0:
            return 0.5
        
        # Confidence based on feature coverage
        confidence = non_zero_features / total_features
        return min(1.0, max(0.0, confidence))
    
    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on score."""
        if score >= self.RECOMMENDATION_THRESHOLDS["strong_buy"]:
            return "STRONG_BUY"
        elif score >= self.RECOMMENDATION_THRESHOLDS["buy"]:
            return "BUY"
        elif score >= self.RECOMMENDATION_THRESHOLDS["hold"]:
            return "HOLD"
        elif score >= self.RECOMMENDATION_THRESHOLDS["sell"]:
            return "SELL"
        else:
            return "STRONG_SELL"
    
    def rank_stocks(
        self,
        aggregated_scores: List[Dict[str, Any]],
        top_n: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Rank stocks by astrological score.
        
        Args:
            aggregated_scores: List of aggregated scores
            top_n: Number of top stocks to return
            
        Returns:
            Ranked stocks
        """
        # Sort by score descending
        sorted_scores = sorted(
            aggregated_scores,
            key=lambda x: x["astrological_score"],
            reverse=True
        )
        
        # Add rank
        ranked = []
        for rank, score in enumerate(sorted_scores[:top_n], 1):
            score["rank"] = rank
            ranked.append(score)
        
        logger.info(f"Ranked {len(ranked)} stocks")
        
        return ranked
    
    def get_score_distribution(
        self,
        aggregated_scores: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Get distribution of scores.
        
        Args:
            aggregated_scores: List of aggregated scores
            
        Returns:
            Score distribution
        """
        if not aggregated_scores:
            return {}
        
        scores = [s["astrological_score"] for s in aggregated_scores]
        
        return {
            "total_stocks": len(scores),
            "average_score": round(sum(scores) / len(scores), 3),
            "min_score": round(min(scores), 3),
            "max_score": round(max(scores), 3),
            "median_score": round(sorted(scores)[len(scores) // 2], 3),
            "strong_buy_count": len([s for s in scores if s >= self.RECOMMENDATION_THRESHOLDS["strong_buy"]]),
            "buy_count": len([s for s in scores if self.RECOMMENDATION_THRESHOLDS["buy"] <= s < self.RECOMMENDATION_THRESHOLDS["strong_buy"]]),
            "hold_count": len([s for s in scores if self.RECOMMENDATION_THRESHOLDS["hold"] <= s < self.RECOMMENDATION_THRESHOLDS["buy"]]),
            "sell_count": len([s for s in scores if self.RECOMMENDATION_THRESHOLDS["sell"] <= s < self.RECOMMENDATION_THRESHOLDS["hold"]]),
            "strong_sell_count": len([s for s in scores if s < self.RECOMMENDATION_THRESHOLDS["sell"]]),
        }

