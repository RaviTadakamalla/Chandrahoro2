"""Stock universe management API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User
from app.services.stock_universe_service import StockUniverseManager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
universe_manager = StockUniverseManager()


class CreateUniverseRequest(BaseModel):
    """Create universe request."""
    name: str = Field(..., description="Universe name")
    description: str = Field(..., description="Universe description")
    stocks: List[str] = Field(..., description="List of stock symbols")


class UniverseResponse(BaseModel):
    """Universe response."""
    universe_id: Optional[str] = None
    key: Optional[str] = None
    name: str
    description: str
    stock_count: int
    universe_type: str


class AddStocksRequest(BaseModel):
    """Add stocks request."""
    stocks: List[str] = Field(..., description="List of stock symbols to add")


class RemoveStocksRequest(BaseModel):
    """Remove stocks request."""
    stocks: List[str] = Field(..., description="List of stock symbols to remove")


@router.get("/stock-universes/predefined", response_model=List[UniverseResponse])
async def list_predefined_universes(
    user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    List all predefined stock universes.
    
    Args:
        user: Current user
        
    Returns:
        List of predefined universes
    """
    universes = universe_manager.list_predefined_universes()
    
    logger.info(f"Listed predefined universes for user {user.id}")
    
    return universes


@router.get("/stock-universes/predefined/{universe_key}", response_model=UniverseResponse)
async def get_predefined_universe(
    universe_key: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a specific predefined universe.
    
    Args:
        universe_key: Universe key
        user: Current user
        
    Returns:
        Universe data
    """
    universe = universe_manager.get_predefined_universe(universe_key)
    
    if not universe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Universe {universe_key} not found",
        )
    
    logger.info(f"Retrieved predefined universe {universe_key} for user {user.id}")
    
    return universe


@router.get("/stock-universes/predefined/{universe_key}/stocks")
async def get_universe_stocks(
    universe_key: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get stocks in a predefined universe.
    
    Args:
        universe_key: Universe key
        user: Current user
        
    Returns:
        List of stocks
    """
    stocks = universe_manager.get_universe_stocks(universe_key)
    
    if stocks is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Universe {universe_key} not found",
        )
    
    logger.info(f"Retrieved {len(stocks)} stocks from universe {universe_key}")
    
    return {
        "universe_key": universe_key,
        "stock_count": len(stocks),
        "stocks": stocks,
    }


@router.post("/stock-universes/custom", response_model=UniverseResponse)
async def create_custom_universe(
    request: CreateUniverseRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Create a custom stock universe.
    
    Args:
        request: Create universe request
        user: Current user
        
    Returns:
        Created universe
    """
    if len(request.stocks) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Universe must contain at least one stock",
        )
    
    universe_id = f"custom_{user.id}_{len(universe_manager.custom_universes)}"
    
    result = universe_manager.create_custom_universe(
        universe_id,
        request.name,
        request.description,
        request.stocks,
    )
    
    logger.info(f"Created custom universe {universe_id} for user {user.id}")
    
    return result


@router.get("/stock-universes/custom")
async def list_custom_universes(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    List custom universes for current user.
    
    Args:
        user: Current user
        
    Returns:
        List of custom universes
    """
    universes = []
    for universe_id, universe in universe_manager.custom_universes.items():
        universes.append({
            "universe_id": universe_id,
            "name": universe.name,
            "description": universe.description,
            "stock_count": len(universe.stocks),
            "universe_type": "custom",
            "created_at": universe.created_at.isoformat(),
        })
    
    logger.info(f"Listed {len(universes)} custom universes for user {user.id}")
    
    return {
        "total": len(universes),
        "universes": universes,
    }


@router.post("/stock-universes/custom/{universe_id}/stocks")
async def add_stocks_to_universe(
    universe_id: str,
    request: AddStocksRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Add stocks to a custom universe.
    
    Args:
        universe_id: Universe ID
        request: Add stocks request
        user: Current user
        
    Returns:
        Updated universe
    """
    try:
        result = universe_manager.add_stocks_to_universe(universe_id, request.stocks)
        
        logger.info(f"Added {len(request.stocks)} stocks to universe {universe_id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/stock-universes/custom/{universe_id}/stocks")
async def remove_stocks_from_universe(
    universe_id: str,
    request: RemoveStocksRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Remove stocks from a custom universe.
    
    Args:
        universe_id: Universe ID
        request: Remove stocks request
        user: Current user
        
    Returns:
        Updated universe
    """
    try:
        result = universe_manager.remove_stocks_from_universe(universe_id, request.stocks)
        
        logger.info(f"Removed {len(request.stocks)} stocks from universe {universe_id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/stock-universes/custom/{universe_id}/stocks")
async def get_custom_universe_stocks(
    universe_id: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get stocks in a custom universe.
    
    Args:
        universe_id: Universe ID
        user: Current user
        
    Returns:
        List of stocks
    """
    stocks = universe_manager.get_universe_stocks(universe_id)
    
    if stocks is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Universe {universe_id} not found",
        )
    
    logger.info(f"Retrieved {len(stocks)} stocks from custom universe {universe_id}")
    
    return {
        "universe_id": universe_id,
        "stock_count": len(stocks),
        "stocks": stocks,
    }

