"""Comparison Dashboard API endpoints."""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, BirthChart, CalibrationEntry
from app.services.aspect_intensity_service import AspectIntensityCalculator
from app.services.calibration_service import CalibrationCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ComparisonDataPoint(BaseModel):
    """Single comparison data point."""
    date: date
    model_prediction: float
    user_self_rating: float
    calibration_factor: float
    error: float  # Absolute difference


class AspectComparisonResponse(BaseModel):
    """Comparison data for a single aspect."""
    aspect_name: str
    total_entries: int
    data_points: List[ComparisonDataPoint]
    average_calibration_factor: float
    mean_absolute_error: float
    root_mean_square_error: float
    correlation: float
    accuracy_trend: float
    calibration_interpretation: str
    accuracy_interpretation: str


class ComparisonDashboardResponse(BaseModel):
    """Comparison dashboard response."""
    chart_id: str
    start_date: Optional[date]
    end_date: Optional[date]
    aspects: Dict[str, AspectComparisonResponse]
    overall_accuracy: float
    overall_trend: float


@router.get("/charts/{chart_id}/comparison/dashboard", response_model=ComparisonDashboardResponse)
async def get_comparison_dashboard(
    chart_id: str,
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    aspect_name: Optional[str] = Query(None, description="Filter by aspect (optional)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get comparison dashboard showing model predictions vs user self-ratings.
    
    This endpoint displays:
    - Side-by-side comparison of predictions and ratings
    - Calibration factors for each entry
    - Accuracy metrics (MAE, RMSE, correlation)
    - Trend analysis
    - Interpretations
    
    Args:
        chart_id: Birth chart ID
        start_date: Filter from date
        end_date: Filter to date
        aspect_name: Filter by specific aspect
        user: Current user
        db: Database session
        
    Returns:
        Comparison dashboard data
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
    
    # Build query
    filters = [CalibrationEntry.birth_chart_id == chart_id]
    
    if start_date:
        filters.append(CalibrationEntry.entry_date >= start_date)
    if end_date:
        filters.append(CalibrationEntry.entry_date <= end_date)
    if aspect_name:
        filters.append(CalibrationEntry.aspect_name == aspect_name)
    
    # Get calibration entries
    stmt = select(CalibrationEntry).where(and_(*filters))
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    # Group by aspect
    aspects_data = {}
    for entry in entries:
        if entry.aspect_name not in aspects_data:
            aspects_data[entry.aspect_name] = []
        aspects_data[entry.aspect_name].append(entry)
    
    # Calculate metrics for each aspect
    calculator = CalibrationCalculator()
    aspects_response = {}
    all_errors = []
    all_trends = []
    
    for aspect_name, aspect_entries in aspects_data.items():
        # Create data points
        data_points = []
        entry_dicts = []
        
        for entry in aspect_entries:
            error = abs(entry.user_self_rating - entry.model_prediction)
            data_points.append(
                ComparisonDataPoint(
                    date=entry.entry_date,
                    model_prediction=entry.model_prediction,
                    user_self_rating=entry.user_self_rating,
                    calibration_factor=entry.calibration_factor,
                    error=error,
                )
            )
            entry_dicts.append({
                "model_prediction": entry.model_prediction,
                "user_self_rating": entry.user_self_rating,
            })
            all_errors.append(error)
        
        # Calculate metrics
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
        
        aspects_response[aspect_name] = AspectComparisonResponse(
            aspect_name=aspect_name,
            total_entries=metrics.total_entries,
            data_points=data_points,
            average_calibration_factor=metrics.average_calibration_factor,
            mean_absolute_error=metrics.mean_absolute_error,
            root_mean_square_error=metrics.root_mean_square_error,
            correlation=metrics.correlation,
            accuracy_trend=metrics.accuracy_trend,
            calibration_interpretation=calibration_interp,
            accuracy_interpretation=accuracy_interp,
        )
        
        all_trends.append(metrics.accuracy_trend)
    
    # Calculate overall metrics
    overall_accuracy = 10.0 - (sum(all_errors) / len(all_errors)) if all_errors else 5.0
    overall_accuracy = max(1.0, min(10.0, overall_accuracy))
    overall_trend = sum(all_trends) / len(all_trends) if all_trends else 0.0
    
    logger.info(f"Retrieved comparison dashboard for chart {chart_id}")
    
    return ComparisonDashboardResponse(
        chart_id=chart_id,
        start_date=start_date,
        end_date=end_date,
        aspects=aspects_response,
        overall_accuracy=round(overall_accuracy, 2),
        overall_trend=round(overall_trend, 3),
    )


@router.get("/charts/{chart_id}/comparison/accuracy-trend")
async def get_accuracy_trend(
    chart_id: str,
    aspect_name: str = Query(..., description="Life aspect name"),
    window_size: int = Query(5, ge=1, le=30, description="Rolling window size"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get accuracy trend over time with rolling window.
    
    Args:
        chart_id: Birth chart ID
        aspect_name: Life aspect name
        window_size: Rolling window size for trend calculation
        user: Current user
        db: Database session
        
    Returns:
        Accuracy trend data
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
    ).order_by(CalibrationEntry.entry_date)
    
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    if not entries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No calibration entries found",
        )
    
    # Calculate rolling window accuracy
    trend_points = []
    errors = [abs(e.user_self_rating - e.model_prediction) for e in entries]
    
    for i in range(len(errors)):
        start_idx = max(0, i - window_size + 1)
        window_errors = errors[start_idx:i + 1]
        window_mae = sum(window_errors) / len(window_errors)
        accuracy = 10.0 - window_mae
        accuracy = max(1.0, min(10.0, accuracy))
        
        trend_points.append({
            "date": entries[i].entry_date,
            "accuracy": round(accuracy, 2),
            "mae": round(window_mae, 2),
            "window_size": len(window_errors),
        })
    
    logger.info(f"Retrieved accuracy trend for chart {chart_id}, aspect {aspect_name}")
    
    return {
        "chart_id": chart_id,
        "aspect_name": aspect_name,
        "window_size": window_size,
        "trend_points": trend_points,
    }


@router.get("/charts/{chart_id}/comparison/calibration-factors")
async def get_calibration_factors(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get calibration factors for all aspects.
    
    Args:
        chart_id: Birth chart ID
        user: Current user
        db: Database session
        
    Returns:
        Calibration factors by aspect
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
    
    # Get all calibration entries
    stmt = select(CalibrationEntry).where(
        CalibrationEntry.birth_chart_id == chart_id
    )
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    # Group by aspect and calculate average calibration factor
    aspects_factors = {}
    for entry in entries:
        if entry.aspect_name not in aspects_factors:
            aspects_factors[entry.aspect_name] = []
        aspects_factors[entry.aspect_name].append(entry.calibration_factor)
    
    # Calculate averages
    calibration_factors = {}
    for aspect_name, factors in aspects_factors.items():
        avg_factor = sum(factors) / len(factors)
        calibration_factors[aspect_name] = {
            "average_factor": round(avg_factor, 3),
            "total_entries": len(factors),
            "min_factor": round(min(factors), 3),
            "max_factor": round(max(factors), 3),
            "interpretation": CalibrationCalculator().get_calibration_interpretation(
                avg_factor,
                len(factors),
            ),
        }
    
    logger.info(f"Retrieved calibration factors for chart {chart_id}")
    
    return {
        "chart_id": chart_id,
        "calibration_factors": calibration_factors,
    }

