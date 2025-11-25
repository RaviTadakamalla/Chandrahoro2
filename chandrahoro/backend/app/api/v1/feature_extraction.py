"""Astrological feature extraction API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
from app.services.astrological_feature_extraction_service import AstrologicalFeatureExtractor
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
feature_extractor = AstrologicalFeatureExtractor()


class ExtractFeaturesRequest(BaseModel):
    """Extract features request."""
    horoscope: Dict[str, Any] = Field(..., description="Horoscope data")


class ExtractBatchFeaturesRequest(BaseModel):
    """Extract batch features request."""
    horoscopes: List[Dict[str, Any]] = Field(..., description="List of horoscopes")


class FeaturesResponse(BaseModel):
    """Features response."""
    stock_symbol: str
    total_score: float


@router.post("/features/extract", response_model=FeaturesResponse)
async def extract_features(
    request: ExtractFeaturesRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Extract astrological features from a horoscope.
    
    Args:
        request: Extract features request
        user: Current user
        
    Returns:
        Extracted features
    """
    try:
        features = feature_extractor.extract_features(request.horoscope)
        
        logger.info(f"Extracted features for {request.horoscope.get('stock_symbol')}")
        
        return features
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/features/extract-batch")
async def extract_batch_features(
    request: ExtractBatchFeaturesRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Extract features from multiple horoscopes.
    
    Args:
        request: Extract batch features request
        user: Current user
        
    Returns:
        List of extracted features
    """
    try:
        features_list = feature_extractor.extract_batch_features(request.horoscopes)
        
        logger.info(f"Extracted features from {len(request.horoscopes)} horoscopes")
        
        return {
            "total": len(features_list),
            "features": features_list,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/features/wealth-houses")
async def get_wealth_houses(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get wealth houses for feature extraction.
    
    Args:
        user: Current user
        
    Returns:
        Wealth houses
    """
    return {
        "wealth_houses": feature_extractor.WEALTH_HOUSES,
        "description": "Houses that influence wealth and prosperity",
    }


@router.get("/features/planetary-weights")
async def get_planetary_weights(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get planetary weights for feature extraction.
    
    Args:
        user: Current user
        
    Returns:
        Planetary weights
    """
    return {
        "planetary_weights": feature_extractor.PLANETARY_WEIGHTS,
        "description": "Weights for planetary influence on wealth",
    }


@router.get("/features/yoga-scores")
async def get_yoga_scores(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get yoga scores for feature extraction.
    
    Args:
        user: Current user
        
    Returns:
        Yoga scores
    """
    return {
        "yoga_scores": feature_extractor.YOGA_SCORES,
        "description": "Scores for different yogas",
    }


@router.post("/features/calculate-score")
async def calculate_feature_score(
    features: Dict[str, Any] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate overall feature score.
    
    Args:
        features: Feature data
        user: Current user
        
    Returns:
        Calculated score
    """
    if not features:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Features data is required",
        )
    
    try:
        house_score = sum(features.get("house_features", {}).values()) * 0.35
        planetary_score = sum(features.get("planetary_features", {}).values()) * 0.30
        yoga_score = sum(features.get("yoga_features", {}).values()) * 0.25
        timing_score = sum(features.get("timing_features", {}).values()) * 0.10
        
        total_score = house_score + planetary_score + yoga_score + timing_score
        
        logger.info(f"Calculated feature score: {total_score}")
        
        return {
            "house_score": round(house_score, 3),
            "planetary_score": round(planetary_score, 3),
            "yoga_score": round(yoga_score, 3),
            "timing_score": round(timing_score, 3),
            "total_score": round(total_score, 3),
            "score_breakdown": {
                "house_weight": 0.35,
                "planetary_weight": 0.30,
                "yoga_weight": 0.25,
                "timing_weight": 0.10,
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

