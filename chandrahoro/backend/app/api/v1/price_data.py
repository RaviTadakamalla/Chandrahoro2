"""Price data integration API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime
from app.core.rbac import get_current_user
from app.models import User
from app.services.price_data_service import PriceDataService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
price_service = PriceDataService()


class FetchPricesRequest(BaseModel):
    """Fetch prices request."""
    stock_symbol: str = Field(..., description="Stock symbol")
    start_date: str = Field(..., description="Start date (ISO format)")
    end_date: str = Field(..., description="End date (ISO format)")


class CalculateReturnsRequest(BaseModel):
    """Calculate returns request."""
    prices: List[Dict[str, Any]] = Field(..., description="List of price data")
    periods: Optional[List[int]] = Field(None, description="Periods for return calculation")


@router.post("/prices/fetch")
async def fetch_historical_prices(
    request: FetchPricesRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Fetch historical prices for a stock.
    
    Args:
        request: Fetch prices request
        user: Current user
        
    Returns:
        Historical price data
    """
    try:
        start_date = datetime.fromisoformat(request.start_date)
        end_date = datetime.fromisoformat(request.end_date)
        
        prices = price_service.fetch_historical_prices(
            request.stock_symbol,
            start_date,
            end_date,
        )
        
        logger.info(f"Fetched {len(prices)} prices for {request.stock_symbol}")
        
        return {
            "stock_symbol": request.stock_symbol,
            "total_records": len(prices),
            "prices": prices,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/prices/calculate-returns")
async def calculate_returns(
    request: CalculateReturnsRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate returns over multiple horizons.
    
    Args:
        request: Calculate returns request
        user: Current user
        
    Returns:
        Returns for each period
    """
    try:
        returns = price_service.calculate_returns(request.prices, request.periods)
        
        logger.info(f"Calculated returns for {len(request.periods or [])} periods")
        
        return {
            "returns": returns,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/prices/calculate-volatility")
async def calculate_volatility(
    prices: List[Dict[str, Any]] = None,
    window: int = Query(20, description="Window size"),
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate volatility.
    
    Args:
        prices: List of price data
        window: Window size
        user: Current user
        
    Returns:
        Volatility
    """
    if not prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prices data is required",
        )
    
    try:
        volatility = price_service.calculate_volatility(prices, window)
        
        logger.info(f"Calculated volatility: {volatility}")
        
        return {
            "volatility": volatility,
            "window": window,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/prices/calculate-moving-average")
async def calculate_moving_average(
    prices: List[Dict[str, Any]] = None,
    window: int = Query(20, description="Window size"),
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate moving average.
    
    Args:
        prices: List of price data
        window: Window size
        user: Current user
        
    Returns:
        Prices with moving average
    """
    if not prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prices data is required",
        )
    
    try:
        result = price_service.calculate_moving_average(prices, window)
        
        logger.info(f"Calculated {window}-day moving average")
        
        return {
            "total_records": len(result),
            "window": window,
            "prices": result,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/prices/summary")
async def get_price_summary(
    prices: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get price summary statistics.
    
    Args:
        prices: List of price data
        user: Current user
        
    Returns:
        Summary statistics
    """
    if not prices:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prices data is required",
        )
    
    try:
        summary = price_service.get_price_summary(prices)
        
        logger.info(f"Generated price summary")
        
        return {
            "summary": summary,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

