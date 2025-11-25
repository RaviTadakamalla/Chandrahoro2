"""Prediction accuracy metrics API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
from app.services.prediction_metrics_service import PredictionMetricsService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
metrics_service = PredictionMetricsService()


class PredictionData(BaseModel):
    """Prediction data."""
    actual: float = Field(..., description="Actual value")
    predicted: float = Field(..., description="Predicted value")


class CalculateMetricsRequest(BaseModel):
    """Calculate metrics request."""
    predictions: List[PredictionData] = Field(..., description="List of predictions")
    returns: Optional[List[float]] = Field(None, description="List of returns")


class CalculateBatchMetricsRequest(BaseModel):
    """Calculate batch metrics request."""
    sessions: List[Dict[str, Any]] = Field(..., description="List of sessions")


class MetricsResponse(BaseModel):
    """Metrics response."""
    hit_rate: float
    rmse: float
    mae: float
    sharpe_ratio: float
    max_drawdown: float


@router.post("/metrics/hit-rate")
async def calculate_hit_rate(
    predictions: List[PredictionData],
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate hit rate.
    
    Args:
        predictions: List of predictions
        user: Current user
        
    Returns:
        Hit rate
    """
    try:
        pred_dicts = [{"actual": p.actual, "predicted": p.predicted} for p in predictions]
        hit_rate = metrics_service.calculate_hit_rate(pred_dicts)
        
        logger.info(f"Calculated hit rate: {hit_rate}")
        
        return {
            "hit_rate": hit_rate,
            "total_predictions": len(predictions),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/rmse")
async def calculate_rmse(
    predictions: List[PredictionData],
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate RMSE.
    
    Args:
        predictions: List of predictions
        user: Current user
        
    Returns:
        RMSE
    """
    try:
        pred_dicts = [{"actual": p.actual, "predicted": p.predicted} for p in predictions]
        rmse = metrics_service.calculate_rmse(pred_dicts)
        
        logger.info(f"Calculated RMSE: {rmse}")
        
        return {
            "rmse": rmse,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/mae")
async def calculate_mae(
    predictions: List[PredictionData],
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate MAE.
    
    Args:
        predictions: List of predictions
        user: Current user
        
    Returns:
        MAE
    """
    try:
        pred_dicts = [{"actual": p.actual, "predicted": p.predicted} for p in predictions]
        mae = metrics_service.calculate_mae(pred_dicts)
        
        logger.info(f"Calculated MAE: {mae}")
        
        return {
            "mae": mae,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/sharpe-ratio")
async def calculate_sharpe_ratio(
    returns: List[float],
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate Sharpe Ratio.
    
    Args:
        returns: List of returns
        user: Current user
        
    Returns:
        Sharpe Ratio
    """
    try:
        sharpe_ratio = metrics_service.calculate_sharpe_ratio(returns)
        
        logger.info(f"Calculated Sharpe Ratio: {sharpe_ratio}")
        
        return {
            "sharpe_ratio": sharpe_ratio,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/max-drawdown")
async def calculate_max_drawdown(
    returns: List[float],
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate Maximum Drawdown.
    
    Args:
        returns: List of returns
        user: Current user
        
    Returns:
        Maximum Drawdown
    """
    try:
        max_dd = metrics_service.calculate_max_drawdown(returns)
        
        logger.info(f"Calculated Max Drawdown: {max_dd}")
        
        return {
            "max_drawdown": max_dd,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/all", response_model=MetricsResponse)
async def calculate_all_metrics(
    request: CalculateMetricsRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate all metrics.
    
    Args:
        request: Calculate metrics request
        user: Current user
        
    Returns:
        All metrics
    """
    try:
        pred_dicts = [{"actual": p.actual, "predicted": p.predicted} for p in request.predictions]
        metrics = metrics_service.calculate_all_metrics(pred_dicts, request.returns)
        
        logger.info(f"Calculated all metrics")
        
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/metrics/batch")
async def calculate_batch_metrics(
    request: CalculateBatchMetricsRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate metrics for multiple sessions.
    
    Args:
        request: Calculate batch metrics request
        user: Current user
        
    Returns:
        List of metrics
    """
    try:
        metrics_list = metrics_service.calculate_batch_metrics(request.sessions)
        
        logger.info(f"Calculated metrics for {len(request.sessions)} sessions")
        
        return {
            "total_sessions": len(metrics_list),
            "metrics": metrics_list,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

