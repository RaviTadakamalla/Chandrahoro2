"""Prediction accuracy metrics service."""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import math
import logging

logger = logging.getLogger(__name__)


@dataclass
class PredictionMetrics:
    """Prediction metrics data."""
    hit_rate: float
    rmse: float
    mae: float
    sharpe_ratio: float
    max_drawdown: float
    total_predictions: int
    correct_predictions: int


class PredictionMetricsService:
    """Calculate prediction accuracy metrics."""
    
    def __init__(self):
        """Initialize metrics service."""
        pass
    
    def calculate_hit_rate(
        self,
        predictions: List[Dict[str, Any]],
    ) -> float:
        """
        Calculate hit rate (accuracy).
        
        Args:
            predictions: List of predictions with actual and predicted values
            
        Returns:
            Hit rate (0-1)
        """
        if not predictions:
            return 0.0
        
        correct = 0
        for pred in predictions:
            actual = pred.get("actual", 0)
            predicted = pred.get("predicted", 0)
            
            # Check if direction is correct (both positive or both negative)
            if (actual >= 0 and predicted >= 0) or (actual < 0 and predicted < 0):
                correct += 1
        
        hit_rate = correct / len(predictions)
        logger.info(f"Hit rate: {hit_rate:.3f}")
        
        return round(hit_rate, 3)
    
    def calculate_rmse(
        self,
        predictions: List[Dict[str, Any]],
    ) -> float:
        """
        Calculate Root Mean Squared Error.
        
        Args:
            predictions: List of predictions
            
        Returns:
            RMSE
        """
        if not predictions:
            return 0.0
        
        squared_errors = []
        for pred in predictions:
            actual = pred.get("actual", 0)
            predicted = pred.get("predicted", 0)
            error = actual - predicted
            squared_errors.append(error ** 2)
        
        mse = sum(squared_errors) / len(squared_errors)
        rmse = math.sqrt(mse)
        
        logger.info(f"RMSE: {rmse:.3f}")
        
        return round(rmse, 3)
    
    def calculate_mae(
        self,
        predictions: List[Dict[str, Any]],
    ) -> float:
        """
        Calculate Mean Absolute Error.
        
        Args:
            predictions: List of predictions
            
        Returns:
            MAE
        """
        if not predictions:
            return 0.0
        
        absolute_errors = []
        for pred in predictions:
            actual = pred.get("actual", 0)
            predicted = pred.get("predicted", 0)
            error = abs(actual - predicted)
            absolute_errors.append(error)
        
        mae = sum(absolute_errors) / len(absolute_errors)
        
        logger.info(f"MAE: {mae:.3f}")
        
        return round(mae, 3)
    
    def calculate_sharpe_ratio(
        self,
        returns: List[float],
        risk_free_rate: float = 0.02,
    ) -> float:
        """
        Calculate Sharpe Ratio.
        
        Args:
            returns: List of returns
            risk_free_rate: Risk-free rate (annual)
            
        Returns:
            Sharpe Ratio
        """
        if len(returns) < 2:
            return 0.0
        
        # Calculate mean return
        mean_return = sum(returns) / len(returns)
        
        # Calculate standard deviation
        variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
        std_dev = math.sqrt(variance)
        
        if std_dev == 0:
            return 0.0
        
        # Calculate Sharpe Ratio (annualized)
        sharpe_ratio = (mean_return - risk_free_rate) / std_dev * math.sqrt(252)
        
        logger.info(f"Sharpe Ratio: {sharpe_ratio:.3f}")
        
        return round(sharpe_ratio, 3)
    
    def calculate_max_drawdown(
        self,
        returns: List[float],
    ) -> float:
        """
        Calculate Maximum Drawdown.
        
        Args:
            returns: List of returns
            
        Returns:
            Maximum Drawdown (0-1)
        """
        if not returns:
            return 0.0
        
        # Calculate cumulative returns
        cumulative = 1.0
        peak = 1.0
        max_dd = 0.0
        
        for ret in returns:
            cumulative *= (1 + ret)
            if cumulative > peak:
                peak = cumulative
            
            drawdown = (peak - cumulative) / peak
            if drawdown > max_dd:
                max_dd = drawdown
        
        logger.info(f"Max Drawdown: {max_dd:.3f}")
        
        return round(max_dd, 3)
    
    def calculate_all_metrics(
        self,
        predictions: List[Dict[str, Any]],
        returns: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        """
        Calculate all metrics.
        
        Args:
            predictions: List of predictions
            returns: List of returns
            
        Returns:
            All metrics
        """
        hit_rate = self.calculate_hit_rate(predictions)
        rmse = self.calculate_rmse(predictions)
        mae = self.calculate_mae(predictions)
        
        sharpe_ratio = 0.0
        max_drawdown = 0.0
        
        if returns:
            sharpe_ratio = self.calculate_sharpe_ratio(returns)
            max_drawdown = self.calculate_max_drawdown(returns)
        
        logger.info(f"Calculated all metrics")
        
        return {
            "hit_rate": hit_rate,
            "rmse": rmse,
            "mae": mae,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "total_predictions": len(predictions),
        }
    
    def calculate_batch_metrics(
        self,
        sessions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Calculate metrics for multiple sessions.
        
        Args:
            sessions: List of sessions with predictions
            
        Returns:
            List of metrics
        """
        metrics_list = []
        
        for session in sessions:
            predictions = session.get("predictions", [])
            returns = session.get("returns", None)
            
            metrics = self.calculate_all_metrics(predictions, returns)
            metrics["session_id"] = session.get("session_id")
            metrics_list.append(metrics)
        
        logger.info(f"Calculated metrics for {len(sessions)} sessions")
        
        return metrics_list

