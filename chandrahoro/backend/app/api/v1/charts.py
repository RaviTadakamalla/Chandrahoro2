"""Chart management API endpoints with caching and methodology support."""

from typing import Optional, List
from datetime import date, time, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.models import User, BirthChart, StrengthProfile
from app.services.chart_service import ChartService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class BirthChartCreate(BaseModel):
    """Create birth chart request."""
    name: Optional[str] = None
    birth_date: date
    birth_time: Optional[time] = None
    birth_latitude: float = Field(..., ge=-90, le=90)
    birth_longitude: float = Field(..., ge=-180, le=180)
    birth_timezone: str
    birth_location: str
    ayanamsha: str = "Lahiri"
    house_system: str = "Whole Sign"
    chart_style: str = "North Indian"
    methodology: str = "parashara"  # NEW: Support for multi-methodology
    chart_name: Optional[str] = None  # NEW: User-friendly chart name
    is_public: str = "N"
    notes: Optional[str] = None


class BirthChartUpdate(BaseModel):
    """Update birth chart request."""
    name: Optional[str] = None
    ayanamsha: Optional[str] = None
    house_system: Optional[str] = None
    chart_style: Optional[str] = None
    is_public: Optional[str] = None
    notes: Optional[str] = None


class BirthChartResponse(BaseModel):
    """Birth chart response."""
    id: str
    user_id: str
    name: Optional[str]
    birth_date: date
    birth_time: Optional[time]
    birth_latitude: float
    birth_longitude: float
    birth_timezone: str
    birth_location: str
    ayanamsha: str
    house_system: str
    chart_style: str
    is_public: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/charts", response_model=BirthChartResponse)
async def create_chart(
    request: BirthChartCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new birth chart with calculations and caching.

    This endpoint now:
    - Checks subscription limits
    - Performs calculations using specified methodology
    - Caches one-time calculations for performance
    - Tracks usage for billing

    Args:
        request: Chart creation request
        user: Current user
        db: Database session

    Returns:
        Created chart with calculated data
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"chart:{user.id}",
        **RATE_LIMITS["chart_calculation"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Chart calculation limit exceeded",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )

    try:
        # Use new ChartService with caching and methodology support
        chart_service = ChartService(db)

        chart = await chart_service.create_chart(
            user_id=user.id,
            name=request.name,
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            latitude=request.birth_latitude,
            longitude=request.birth_longitude,
            timezone=request.birth_timezone,
            location_name=request.birth_location,
            ayanamsha=request.ayanamsha,
            house_system=request.house_system,
            chart_style=request.chart_style,
            methodology=request.methodology,
            chart_name=request.chart_name,
        )

        logger.info(f"Chart created with caching: {chart.id} for user {user.id}, methodology: {request.methodology}")
        return chart

    except ValueError as e:
        logger.error(f"Chart creation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Chart creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create chart: {str(e)}"
        )


@router.get("/charts", response_model=List[BirthChartResponse])
async def list_charts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    """
    List user's birth charts.
    
    Args:
        user: Current user
        db: Database session
        skip: Number of records to skip
        limit: Maximum records to return
        
    Returns:
        List of charts
    """
    stmt = select(BirthChart).where(
        BirthChart.user_id == user.id
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    charts = result.scalars().all()
    
    return charts


@router.get("/charts/{chart_id}", response_model=BirthChartResponse)
async def get_chart(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get specific chart details.
    
    Args:
        chart_id: Chart ID
        user: Current user
        db: Database session
        
    Returns:
        Chart details
    """
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    return chart


@router.put("/charts/{chart_id}", response_model=BirthChartResponse)
async def update_chart(
    chart_id: str,
    request: BirthChartUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update chart details.
    
    Args:
        chart_id: Chart ID
        request: Update request
        user: Current user
        db: Database session
        
    Returns:
        Updated chart
    """
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Update fields
    if request.name is not None:
        chart.name = request.name
    if request.ayanamsha is not None:
        chart.ayanamsha = request.ayanamsha
    if request.house_system is not None:
        chart.house_system = request.house_system
    if request.chart_style is not None:
        chart.chart_style = request.chart_style
    if request.is_public is not None:
        chart.is_public = request.is_public
    if request.notes is not None:
        chart.notes = request.notes
    
    await db.commit()
    await db.refresh(chart)
    
    logger.info(f"Chart updated: {chart.id}")
    return chart


@router.delete("/charts/{chart_id}")
async def delete_chart(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete chart.
    
    Args:
        chart_id: Chart ID
        user: Current user
        db: Database session
        
    Returns:
        Success message
    """
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    await db.delete(chart)
    await db.commit()
    
    logger.info(f"Chart deleted: {chart.id}")
    return {"message": "Chart deleted successfully"}

