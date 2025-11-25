"""Horoscope generation API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from datetime import datetime, time
from app.core.rbac import get_current_user
from app.models import User
from app.services.horoscope_generation_service import HoroscopeGenerator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
horoscope_generator = HoroscopeGenerator()


class GenerateHoroscopeRequest(BaseModel):
    """Generate horoscope request."""
    stock_symbol: str = Field(..., description="Stock symbol")
    seed: int = Field(..., description="Random seed")
    date_range_start: str = Field(..., description="Start date (ISO format)")
    date_range_end: str = Field(..., description="End date (ISO format)")
    time_range_start: str = Field(..., description="Start time (HH:MM:SS)")
    time_range_end: str = Field(..., description="End time (HH:MM:SS)")
    location: str = Field(..., description="Birth location")


class GenerateBatchHoroscopesRequest(BaseModel):
    """Generate batch horoscopes request."""
    stock_symbols: List[str] = Field(..., description="List of stock symbols")
    seed: int = Field(..., description="Random seed")
    date_range_start: str = Field(..., description="Start date (ISO format)")
    date_range_end: str = Field(..., description="End date (ISO format)")
    time_range_start: str = Field(..., description="Start time (HH:MM:SS)")
    time_range_end: str = Field(..., description="End time (HH:MM:SS)")
    location: str = Field(..., description="Birth location")


class HoroscopeResponse(BaseModel):
    """Horoscope response."""
    stock_symbol: str
    sun_sign: str
    moon_sign: str
    ascendant: str
    nakshatra: str
    dasha_lord: str


@router.post("/horoscopes/generate", response_model=HoroscopeResponse)
async def generate_horoscope(
    request: GenerateHoroscopeRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Generate a horoscope for a stock.
    
    Args:
        request: Generate horoscope request
        user: Current user
        
    Returns:
        Generated horoscope
    """
    try:
        date_start = datetime.fromisoformat(request.date_range_start)
        date_end = datetime.fromisoformat(request.date_range_end)
        time_start = datetime.fromisoformat(f"2000-01-01T{request.time_range_start}").time()
        time_end = datetime.fromisoformat(f"2000-01-01T{request.time_range_end}").time()
        
        horoscope = horoscope_generator.generate_horoscope(
            request.stock_symbol,
            request.seed,
            date_start,
            date_end,
            time_start,
            time_end,
            request.location,
        )
        
        logger.info(f"Generated horoscope for {request.stock_symbol}")
        
        return horoscope
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/horoscopes/generate-batch")
async def generate_batch_horoscopes(
    request: GenerateBatchHoroscopesRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Generate horoscopes for multiple stocks.
    
    Args:
        request: Generate batch horoscopes request
        user: Current user
        
    Returns:
        List of generated horoscopes
    """
    try:
        date_start = datetime.fromisoformat(request.date_range_start)
        date_end = datetime.fromisoformat(request.date_range_end)
        time_start = datetime.fromisoformat(f"2000-01-01T{request.time_range_start}").time()
        time_end = datetime.fromisoformat(f"2000-01-01T{request.time_range_end}").time()
        
        horoscopes = horoscope_generator.generate_batch_horoscopes(
            request.stock_symbols,
            request.seed,
            date_start,
            date_end,
            time_start,
            time_end,
            request.location,
        )
        
        logger.info(f"Generated {len(horoscopes)} horoscopes")
        
        return {
            "total": len(horoscopes),
            "horoscopes": horoscopes,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/horoscopes/zodiac-signs")
async def get_zodiac_signs(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get available zodiac signs.
    
    Args:
        user: Current user
        
    Returns:
        List of zodiac signs
    """
    return {
        "zodiac_signs": horoscope_generator.ZODIAC_SIGNS,
        "total": len(horoscope_generator.ZODIAC_SIGNS),
    }


@router.get("/horoscopes/nakshatras")
async def get_nakshatras(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get available nakshatras.
    
    Args:
        user: Current user
        
    Returns:
        List of nakshatras
    """
    return {
        "nakshatras": horoscope_generator.NAKSHATRAS,
        "total": len(horoscope_generator.NAKSHATRAS),
    }


@router.get("/horoscopes/dasha-lords")
async def get_dasha_lords(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get available dasha lords.
    
    Args:
        user: Current user
        
    Returns:
        List of dasha lords
    """
    return {
        "dasha_lords": horoscope_generator.DASHA_LORDS,
        "total": len(horoscope_generator.DASHA_LORDS),
    }


@router.get("/horoscopes/yogas")
async def get_yogas(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get available yogas.
    
    Args:
        user: Current user
        
    Returns:
        List of yogas
    """
    return {
        "yogas": horoscope_generator.YOGAS,
        "total": len(horoscope_generator.YOGAS),
    }

