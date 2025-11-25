"""Calibration System Service

Manages calibration entries and calculates calibration factors by comparing
model predictions with user self-ratings to improve prediction accuracy.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, date
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import logging

logger = logging.getLogger(__name__)


@dataclass
class CalibrationMetrics:
    """Calibration metrics for an aspect."""
    aspect_name: str
    total_entries: int
    average_calibration_factor: float
    accuracy_trend: float  # Trend over time (-1 to 1)
    mean_absolute_error: float  # MAE between predictions and ratings
    root_mean_square_error: float  # RMSE
    correlation: float  # Correlation between predictions and ratings


class CalibrationCalculator:
    """Calculate calibration factors and accuracy metrics."""
    
    def __init__(self):
        """Initialize calibration calculator."""
        pass
    
    def calculate_calibration_factor(
        self,
        model_prediction: float,
        user_self_rating: float,
    ) -> float:
        """
        Calculate calibration factor for a single entry.
        
        Calibration factor = user_rating / model_prediction
        - Factor > 1.0: User rates higher than model predicts
        - Factor < 1.0: User rates lower than model predicts
        - Factor = 1.0: Perfect alignment
        
        Args:
            model_prediction: Model's prediction (1-10 scale)
            user_self_rating: User's self-rating (1-10 scale)
            
        Returns:
            Calibration factor
        """
        if model_prediction <= 0:
            return 1.0  # Default to neutral if invalid prediction
        
        factor = user_self_rating / model_prediction
        # Clamp to reasonable range (0.5 to 2.0)
        return max(0.5, min(2.0, factor))
    
    def calculate_metrics(
        self,
        entries: List[Dict[str, float]],
    ) -> CalibrationMetrics:
        """
        Calculate aggregated calibration metrics.
        
        Args:
            entries: List of dicts with 'model_prediction' and 'user_self_rating'
            
        Returns:
            CalibrationMetrics object
        """
        if not entries:
            return CalibrationMetrics(
                aspect_name="",
                total_entries=0,
                average_calibration_factor=1.0,
                accuracy_trend=0.0,
                mean_absolute_error=0.0,
                root_mean_square_error=0.0,
                correlation=0.0,
            )
        
        # Calculate calibration factors
        factors = [
            self.calculate_calibration_factor(
                e["model_prediction"],
                e["user_self_rating"]
            )
            for e in entries
        ]
        
        # Calculate MAE (Mean Absolute Error)
        errors = [
            abs(e["user_self_rating"] - e["model_prediction"])
            for e in entries
        ]
        mae = sum(errors) / len(errors) if errors else 0.0
        
        # Calculate RMSE (Root Mean Square Error)
        squared_errors = [e ** 2 for e in errors]
        rmse = (sum(squared_errors) / len(squared_errors)) ** 0.5 if squared_errors else 0.0
        
        # Calculate correlation
        correlation = self._calculate_correlation(
            [e["model_prediction"] for e in entries],
            [e["user_self_rating"] for e in entries]
        )
        
        # Calculate accuracy trend (recent vs older entries)
        accuracy_trend = self._calculate_trend(errors)
        
        return CalibrationMetrics(
            aspect_name="",
            total_entries=len(entries),
            average_calibration_factor=round(sum(factors) / len(factors), 3),
            accuracy_trend=round(accuracy_trend, 3),
            mean_absolute_error=round(mae, 2),
            root_mean_square_error=round(rmse, 2),
            correlation=round(correlation, 3),
        )
    
    def _calculate_correlation(
        self,
        predictions: List[float],
        ratings: List[float],
    ) -> float:
        """Calculate Pearson correlation coefficient."""
        if len(predictions) < 2:
            return 0.0
        
        n = len(predictions)
        mean_pred = sum(predictions) / n
        mean_rating = sum(ratings) / n
        
        numerator = sum(
            (predictions[i] - mean_pred) * (ratings[i] - mean_rating)
            for i in range(n)
        )
        
        denominator_pred = sum((p - mean_pred) ** 2 for p in predictions) ** 0.5
        denominator_rating = sum((r - mean_rating) ** 2 for r in ratings) ** 0.5
        
        if denominator_pred == 0 or denominator_rating == 0:
            return 0.0
        
        return numerator / (denominator_pred * denominator_rating)
    
    def _calculate_trend(self, errors: List[float]) -> float:
        """
        Calculate accuracy trend over time.
        
        Returns:
            -1 to 1 scale where:
            - Positive: Accuracy improving (errors decreasing)
            - Negative: Accuracy worsening (errors increasing)
            - 0: No trend
        """
        if len(errors) < 2:
            return 0.0
        
        # Split into two halves
        mid = len(errors) // 2
        first_half = errors[:mid]
        second_half = errors[mid:]
        
        if not first_half or not second_half:
            return 0.0
        
        avg_first = sum(first_half) / len(first_half)
        avg_second = sum(second_half) / len(second_half)
        
        # Trend: negative if second half has lower errors (improving)
        trend = (avg_second - avg_first) / 5.0  # Normalize to -1 to 1
        return max(-1.0, min(1.0, trend))
    
    def apply_calibration_adjustment(
        self,
        prediction_score: float,
        calibration_factor: Optional[float] = None,
    ) -> float:
        """
        Apply calibration factor to adjust prediction.
        
        Args:
            prediction_score: Original prediction (1-10 scale)
            calibration_factor: Calibration factor to apply
            
        Returns:
            Adjusted prediction score
        """
        if calibration_factor is None or calibration_factor == 1.0:
            return prediction_score
        
        adjusted = prediction_score * calibration_factor
        # Clamp to 1-10 range
        return max(1.0, min(10.0, adjusted))
    
    def get_calibration_interpretation(
        self,
        calibration_factor: float,
        total_entries: int,
    ) -> str:
        """
        Get interpretation of calibration factor.
        
        Args:
            calibration_factor: Calibration factor value
            total_entries: Number of calibration entries
            
        Returns:
            Interpretation text
        """
        if total_entries < 3:
            return "Insufficient data for calibration (need at least 3 entries)"
        
        if calibration_factor > 1.2:
            return "You tend to rate yourself higher than model predicts - consider being more conservative"
        elif calibration_factor > 1.05:
            return "You rate slightly higher than model predicts - minor positive bias"
        elif calibration_factor < 0.8:
            return "You tend to rate yourself lower than model predicts - consider being more optimistic"
        elif calibration_factor < 0.95:
            return "You rate slightly lower than model predicts - minor negative bias"
        else:
            return "Your ratings align well with model predictions - excellent calibration"
    
    def get_accuracy_interpretation(
        self,
        mae: float,
        rmse: float,
    ) -> str:
        """
        Get interpretation of accuracy metrics.
        
        Args:
            mae: Mean Absolute Error
            rmse: Root Mean Square Error
            
        Returns:
            Interpretation text
        """
        if mae < 1.0:
            return "Excellent accuracy - predictions are very close to actual outcomes"
        elif mae < 2.0:
            return "Good accuracy - predictions are reasonably close to actual outcomes"
        elif mae < 3.0:
            return "Moderate accuracy - predictions have some deviation from actual outcomes"
        else:
            return "Low accuracy - predictions differ significantly from actual outcomes"

