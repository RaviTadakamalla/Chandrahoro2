"""Calibration System API endpoints."""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.models import User, BirthChart, CalibrationEntry, CalibrationFactor
from app.services.calibration_service import CalibrationCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class CalibrationEntryRequest(BaseModel):
    """Request model for creating calibration entry."""
    aspect_name: str = Field(..., description="Life aspect (Wealth, Health, Business, Spouse, Kids, Career)")
    entry_date: date = Field(..., description="Date of the entry")
    model_prediction: float = Field(..., ge=1.0, le=10.0, description="Model's prediction (1-10 scale)")
    user_self_rating: float = Field(..., ge=1.0, le=10.0, description="User's self-rating (1-10 scale)")
    notes: Optional[str] = Field(None, description="Optional notes about the entry")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="User's confidence in rating (0-1 scale)")


class CalibrationEntryResponse(BaseModel):
    """Response model for calibration entry."""
    id: str
    aspect_name: str
    entry_date: date
    model_prediction: float
    user_self_rating: float
    calibration_factor: float
    notes: Optional[str]
    confidence: Optional[float]
    created_at: datetime


class CalibrationMetricsResponse(BaseModel):
    """Response model for calibration metrics."""
    aspect_name: str
    total_entries: int
    average_calibration_factor: float
    accuracy_trend: float
    mean_absolute_error: float
    root_mean_square_error: float
    correlation: float
    calibration_interpretation: str
    accuracy_interpretation: str


class CalibrationHistoryResponse(BaseModel):
    """Response model for calibration history."""
    chart_id: str
    aspect_name: str
    entries: List[CalibrationEntryResponse]
    metrics: CalibrationMetricsResponse


@router.post("/charts/{chart_id}/calibration/entries", response_model=CalibrationEntryResponse)
async def create_calibration_entry(
    chart_id: str,
    request: CalibrationEntryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a calibration entry for an aspect.
    
    Args:
        chart_id: Birth chart ID
        request: Calibration entry data
        user: Current user
        db: Database session
        
    Returns:
        Created calibration entry
    """
    # Verify chart ownership
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
    
    # Validate aspect
    valid_aspects = {"Wealth", "Health", "Business", "Spouse", "Kids", "Career"}
    if request.aspect_name not in valid_aspects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid aspect: {request.aspect_name}",
        )
    
    # Calculate calibration factor
    calculator = CalibrationCalculator()
    calibration_factor = calculator.calculate_calibration_factor(
        request.model_prediction,
        request.user_self_rating,
    )
    
    # Create entry
    entry = CalibrationEntry(
        user_id=user.id,
        birth_chart_id=chart_id,
        aspect_name=request.aspect_name,
        entry_date=request.entry_date,
        model_prediction=request.model_prediction,
        user_self_rating=request.user_self_rating,
        calibration_factor=calibration_factor,
        notes=request.notes,
        confidence=request.confidence,
    )
    
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    logger.info(f"Created calibration entry for chart {chart_id}, aspect {request.aspect_name}")
    
    return CalibrationEntryResponse(
        id=entry.id,
        aspect_name=entry.aspect_name,
        entry_date=entry.entry_date,
        model_prediction=entry.model_prediction,
        user_self_rating=entry.user_self_rating,
        calibration_factor=entry.calibration_factor,
        notes=entry.notes,
        confidence=entry.confidence,
        created_at=entry.created_at,
    )


@router.get("/charts/{chart_id}/calibration/history", response_model=CalibrationHistoryResponse)
async def get_calibration_history(
    chart_id: str,
    aspect_name: str = Query(..., description="Life aspect name"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get calibration history and metrics for an aspect.
    
    Args:
        chart_id: Birth chart ID
        aspect_name: Life aspect name
        user: Current user
        db: Database session
        
    Returns:
        Calibration history with metrics
    """
    # Verify chart ownership
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
    
    # Get calibration entries
    stmt = select(CalibrationEntry).where(
        and_(
            CalibrationEntry.birth_chart_id == chart_id,
            CalibrationEntry.aspect_name == aspect_name,
        )
    ).order_by(desc(CalibrationEntry.entry_date))
    
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    # Convert to response format
    entry_responses = [
        CalibrationEntryResponse(
            id=e.id,
            aspect_name=e.aspect_name,
            entry_date=e.entry_date,
            model_prediction=e.model_prediction,
            user_self_rating=e.user_self_rating,
            calibration_factor=e.calibration_factor,
            notes=e.notes,
            confidence=e.confidence,
            created_at=e.created_at,
        )
        for e in entries
    ]
    
    # Calculate metrics
    calculator = CalibrationCalculator()
    entry_dicts = [
        {
            "model_prediction": e.model_prediction,
            "user_self_rating": e.user_self_rating,
        }
        for e in entries
    ]
    
    metrics = calculator.calculate_metrics(entry_dicts)
    metrics.aspect_name = aspect_name
    
    calibration_interp = calculator.get_calibration_interpretation(
        metrics.average_calibration_factor,
        metrics.total_entries,
    )
    accuracy_interp = calculator.get_accuracy_interpretation(
        metrics.mean_absolute_error,
        metrics.root_mean_square_error,
    )
    
    logger.info(f"Retrieved calibration history for chart {chart_id}, aspect {aspect_name}")
    
    return CalibrationHistoryResponse(
        chart_id=chart_id,
        aspect_name=aspect_name,
        entries=entry_responses,
        metrics=CalibrationMetricsResponse(
            aspect_name=metrics.aspect_name,
            total_entries=metrics.total_entries,
            average_calibration_factor=metrics.average_calibration_factor,
            accuracy_trend=metrics.accuracy_trend,
            mean_absolute_error=metrics.mean_absolute_error,
            root_mean_square_error=metrics.root_mean_square_error,
            correlation=metrics.correlation,
            calibration_interpretation=calibration_interp,
            accuracy_interpretation=accuracy_interp,
        ),
    )


@router.get("/charts/{chart_id}/calibration/metrics", response_model=Dict[str, CalibrationMetricsResponse])
async def get_all_calibration_metrics(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get calibration metrics for all aspects.
    
    Args:
        chart_id: Birth chart ID
        user: Current user
        db: Database session
        
    Returns:
        Dictionary of metrics for each aspect
    """
    # Verify chart ownership
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
    
    # Get all calibration entries for this chart
    stmt = select(CalibrationEntry).where(
        CalibrationEntry.birth_chart_id == chart_id
    )
    result = await db.execute(stmt)
    all_entries = result.scalars().all()
    
    # Group by aspect
    aspects_data = {}
    for entry in all_entries:
        if entry.aspect_name not in aspects_data:
            aspects_data[entry.aspect_name] = []
        aspects_data[entry.aspect_name].append({
            "model_prediction": entry.model_prediction,
            "user_self_rating": entry.user_self_rating,
        })
    
    # Calculate metrics for each aspect
    calculator = CalibrationCalculator()
    metrics_response = {}
    
    for aspect_name, entries in aspects_data.items():
        metrics = calculator.calculate_metrics(entries)
        metrics.aspect_name = aspect_name
        
        calibration_interp = calculator.get_calibration_interpretation(
            metrics.average_calibration_factor,
            metrics.total_entries,
        )
        accuracy_interp = calculator.get_accuracy_interpretation(
            metrics.mean_absolute_error,
            metrics.root_mean_square_error,
        )
        
        metrics_response[aspect_name] = CalibrationMetricsResponse(
            aspect_name=metrics.aspect_name,
            total_entries=metrics.total_entries,
            average_calibration_factor=metrics.average_calibration_factor,
            accuracy_trend=metrics.accuracy_trend,
            mean_absolute_error=metrics.mean_absolute_error,
            root_mean_square_error=metrics.root_mean_square_error,
            correlation=metrics.correlation,
            calibration_interpretation=calibration_interp,
            accuracy_interpretation=accuracy_interp,
        )
    
    logger.info(f"Retrieved all calibration metrics for chart {chart_id}")
    
    return metrics_response

