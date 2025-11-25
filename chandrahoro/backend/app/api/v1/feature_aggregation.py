"""Feature aggregation and scoring API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
from app.services.feature_aggregation_service import FeatureAggregationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
aggregation_service = FeatureAggregationService()


class AggregateRequest(BaseModel):
    """Aggregate request."""
    features: Dict[str, Any] = Field(..., description="Extracted features")
    custom_weights: Optional[Dict[str, float]] = Field(None, description="Custom feature weights")


class AggregateBatchRequest(BaseModel):
    """Aggregate batch request."""
    features_list: List[Dict[str, Any]] = Field(..., description="List of extracted features")
    custom_weights: Optional[Dict[str, float]] = Field(None, description="Custom feature weights")


class AggregatedScoreResponse(BaseModel):
    """Aggregated score response."""
    stock_symbol: str
    astrological_score: float
    confidence: float
    recommendation: str


@router.post("/aggregation/aggregate", response_model=AggregatedScoreResponse)
async def aggregate_features(
    request: AggregateRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Aggregate features and calculate score.
    
    Args:
        request: Aggregate request
        user: Current user
        
    Returns:
        Aggregated score
    """
    try:
        result = aggregation_service.aggregate_features(
            request.features,
            request.custom_weights,
        )
        
        logger.info(f"Aggregated features for {request.features.get('stock_symbol')}")
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/aggregation/aggregate-batch")
async def aggregate_batch_features(
    request: AggregateBatchRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Aggregate features for multiple stocks.
    
    Args:
        request: Aggregate batch request
        user: Current user
        
    Returns:
        List of aggregated scores
    """
    try:
        results = aggregation_service.aggregate_batch_features(
            request.features_list,
            request.custom_weights,
        )
        
        logger.info(f"Aggregated features for {len(request.features_list)} stocks")
        
        return {
            "total": len(results),
            "aggregated_scores": results,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/aggregation/rank-stocks")
async def rank_stocks(
    request: AggregateBatchRequest,
    top_n: int = Query(10, description="Number of top stocks to return"),
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Rank stocks by astrological score.
    
    Args:
        request: Aggregate batch request
        top_n: Number of top stocks
        user: Current user
        
    Returns:
        Ranked stocks
    """
    try:
        aggregated = aggregation_service.aggregate_batch_features(
            request.features_list,
            request.custom_weights,
        )
        
        ranked = aggregation_service.rank_stocks(aggregated, top_n)
        
        logger.info(f"Ranked {len(ranked)} stocks")
        
        return {
            "total": len(ranked),
            "ranked_stocks": ranked,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/aggregation/score-distribution")
async def get_score_distribution(
    request: AggregateBatchRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get distribution of scores.
    
    Args:
        request: Aggregate batch request
        user: Current user
        
    Returns:
        Score distribution
    """
    try:
        aggregated = aggregation_service.aggregate_batch_features(
            request.features_list,
            request.custom_weights,
        )
        
        distribution = aggregation_service.get_score_distribution(aggregated)
        
        logger.info(f"Calculated score distribution for {len(aggregated)} stocks")
        
        return {
            "distribution": distribution,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/aggregation/default-weights")
async def get_default_weights(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get default feature weights.
    
    Args:
        user: Current user
        
    Returns:
        Default weights
    """
    return {
        "default_weights": aggregation_service.DEFAULT_WEIGHTS,
        "description": "Default weights for feature aggregation",
    }


@router.get("/aggregation/recommendation-thresholds")
async def get_recommendation_thresholds(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get recommendation thresholds.
    
    Args:
        user: Current user
        
    Returns:
        Recommendation thresholds
    """
    return {
        "recommendation_thresholds": aggregation_service.RECOMMENDATION_THRESHOLDS,
        "description": "Score thresholds for recommendations",
    }

