"""Timeline visualization API endpoints."""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.models import User, BirthChart, AspectTimeline, StrengthProfile
from app.services.aspect_intensity_service import AspectIntensityCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class AspectIntensityPoint(BaseModel):
    """Single aspect intensity data point."""
    date: datetime
    intensity_score: float
    confidence_band_low: float
    confidence_band_high: float
    dasha_period: Optional[str]
    transit_info: Optional[str]


class AspectTimelineResponse(BaseModel):
    """Timeline response for multiple aspects."""
    chart_id: str
    start_date: date
    end_date: date
    aspects: dict  # aspect_name -> List[AspectIntensityPoint]
    dasha_periods: List[dict]  # Dasha period markers


class IntegratedPredictionPoint(BaseModel):
    """Single integrated prediction data point with strength attributes."""
    date: datetime
    base_intensity_score: float
    integrated_prediction_score: float
    confidence_band_low: float
    confidence_band_high: float
    dasha_period: Optional[str]
    transit_info: Optional[str]
    astrological_factors: Dict[str, float]
    strength_factors: Dict[str, float]
    strength_contribution: Optional[float]


class IntegratedPredictionResponse(BaseModel):
    """Integrated prediction response with strength attributes."""
    chart_id: str
    aspect_name: str
    start_date: date
    end_date: date
    predictions: List[IntegratedPredictionPoint]
    strength_attributes_used: Optional[Dict[str, float]]


@router.get("/charts/{chart_id}/timeline", response_model=AspectTimelineResponse)
async def get_chart_timeline(
    chart_id: str,
    start_date: date = Query(..., description="Timeline start date"),
    end_date: date = Query(..., description="Timeline end date"),
    aspects: Optional[str] = Query(
        None,
        description="Comma-separated aspect names (Wealth,Health,Business,Spouse,Kids,Career)"
    ),
    interval_days: int = Query(7, ge=1, le=30, description="Days between data points"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get timeline data for multiple aspects.
    
    Args:
        chart_id: Chart ID
        start_date: Timeline start date
        end_date: Timeline end date
        aspects: Comma-separated aspect names (default: all)
        interval_days: Days between calculations
        user: Current user
        db: Database session
        
    Returns:
        Timeline data with aspect intensities
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"timeline:{user.id}",
        **RATE_LIMITS["chart_calculation"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Timeline calculation limit exceeded",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )
    
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
    
    # Parse aspects
    if aspects:
        aspect_list = [a.strip() for a in aspects.split(",")]
    else:
        aspect_list = ["Wealth", "Health", "Business", "Spouse", "Kids", "Career"]
    
    # Validate aspects
    valid_aspects = {"Wealth", "Health", "Business", "Spouse", "Kids", "Career"}
    for aspect in aspect_list:
        if aspect not in valid_aspects:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aspect: {aspect}",
            )
    
    # Calculate timelines
    calculator = AspectIntensityCalculator()
    timeline_data = {}
    
    try:
        for aspect in aspect_list:
            intensities = calculator.calculate_timeline(
                aspect_name=aspect,
                birth_date=chart.birth_date,
                birth_time=chart.birth_time.isoformat() if chart.birth_time else None,
                latitude=chart.birth_latitude,
                longitude=chart.birth_longitude,
                timezone=chart.birth_timezone,
                start_date=datetime.combine(start_date, datetime.min.time()),
                end_date=datetime.combine(end_date, datetime.max.time()),
                interval_days=interval_days,
                ayanamsha=chart.ayanamsha,
            )
            
            # Convert to response format
            timeline_data[aspect] = [
                AspectIntensityPoint(
                    date=intensity.date,
                    intensity_score=intensity.intensity_score,
                    confidence_band_low=intensity.confidence_band_low,
                    confidence_band_high=intensity.confidence_band_high,
                    dasha_period=intensity.dasha_period,
                    transit_info=intensity.transit_info,
                )
                for intensity in intensities
            ]
    except Exception as e:
        logger.error(f"Error calculating timeline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating timeline",
        )
    
    # Get dasha period markers (simplified)
    dasha_periods = []
    
    return AspectTimelineResponse(
        chart_id=chart_id,
        start_date=start_date,
        end_date=end_date,
        aspects=timeline_data,
        dasha_periods=dasha_periods,
    )


@router.post("/charts/{chart_id}/timeline/save")
async def save_timeline(
    chart_id: str,
    aspect_name: str = Query(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Save timeline data to database.
    
    Args:
        chart_id: Chart ID
        aspect_name: Aspect name
        user: Current user
        db: Database session
        
    Returns:
        Success message
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
    
    # Check if timeline already exists
    stmt = select(AspectTimeline).where(
        (AspectTimeline.birth_chart_id == chart_id) &
        (AspectTimeline.aspect_name == aspect_name)
    )
    result = await db.execute(stmt)
    timeline = result.scalars().first()
    
    if not timeline:
        # Create new timeline
        timeline = AspectTimeline(
            user_id=user.id,
            birth_chart_id=chart_id,
            aspect_name=aspect_name,
            timeline_data={},
        )
        db.add(timeline)
    
    await db.commit()

    logger.info(f"Timeline saved for chart {chart_id}, aspect {aspect_name}")
    return {"message": "Timeline saved successfully"}


@router.get("/charts/{chart_id}/predictions/integrated", response_model=IntegratedPredictionResponse)
async def get_integrated_predictions(
    chart_id: str,
    aspect_name: str = Query(..., description="Life aspect name"),
    start_date: date = Query(..., description="Timeline start date"),
    end_date: date = Query(..., description="Timeline end date"),
    interval_days: int = Query(7, ge=1, le=30, description="Days between data points"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get integrated predictions for an aspect using strength attributes.

    This endpoint combines astrological factors with strength attributes
    to provide more personalized predictions.

    Args:
        chart_id: Chart ID
        aspect_name: Life aspect name (Wealth, Health, Business, Spouse, Kids, Career)
        start_date: Timeline start date
        end_date: Timeline end date
        interval_days: Days between calculations
        user: Current user
        db: Database session

    Returns:
        Integrated prediction timeline with strength attribute adjustments
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"prediction:{user.id}",
        **RATE_LIMITS["chart_calculation"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Prediction calculation limit exceeded",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )

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
    if aspect_name not in valid_aspects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid aspect: {aspect_name}",
        )

    # Get strength attributes if available
    strength_attributes = None
    stmt = select(StrengthProfile).where(
        (StrengthProfile.birth_chart_id == chart_id) &
        (StrengthProfile.user_id == user.id)
    )
    result = await db.execute(stmt)
    strength_profile = result.scalars().first()

    if strength_profile:
        strength_attributes = {
            "Risk-Taking": strength_profile.risk_taking,
            "Loyalty": strength_profile.loyalty,
            "Honesty": strength_profile.honesty,
            "Hardworking": strength_profile.hardworking,
            "Logical": strength_profile.logical,
            "Creativity": strength_profile.creativity,
            "Leadership": strength_profile.leadership,
            "Adaptability": strength_profile.adaptability,
        }
        # Filter out None values
        strength_attributes = {k: v for k, v in strength_attributes.items() if v is not None}

    # Calculate integrated predictions
    calculator = AspectIntensityCalculator()

    try:
        predictions = calculator.calculate_integrated_timeline(
            aspect_name=aspect_name,
            birth_date=chart.birth_date,
            birth_time=chart.birth_time.isoformat() if chart.birth_time else None,
            latitude=chart.birth_latitude,
            longitude=chart.birth_longitude,
            timezone=chart.birth_timezone,
            start_date=datetime.combine(start_date, datetime.min.time()),
            end_date=datetime.combine(end_date, datetime.max.time()),
            strength_attributes=strength_attributes,
            interval_days=interval_days,
            ayanamsha=chart.ayanamsha,
        )

        # Convert to response format
        prediction_points = [
            IntegratedPredictionPoint(
                date=pred["date"],
                base_intensity_score=pred["base_intensity_score"],
                integrated_prediction_score=pred["integrated_prediction_score"],
                confidence_band_low=pred["confidence_band_low"],
                confidence_band_high=pred["confidence_band_high"],
                dasha_period=pred["dasha_period"],
                transit_info=pred["transit_info"],
                astrological_factors=pred["astrological_factors"],
                strength_factors=pred["strength_factors"],
                strength_contribution=pred["strength_contribution"],
            )
            for pred in predictions
        ]

        logger.info(f"Calculated integrated predictions for chart {chart_id}, aspect {aspect_name}")

        return IntegratedPredictionResponse(
            chart_id=chart_id,
            aspect_name=aspect_name,
            start_date=start_date,
            end_date=end_date,
            predictions=prediction_points,
            strength_attributes_used=strength_attributes,
        )

    except Exception as e:
        logger.error(f"Error calculating integrated predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating integrated predictions",
        )


class DashaPeriodMarker(BaseModel):
    """Dasha period marker for timeline."""
    start_date: date
    end_date: date
    mahadasha: str
    antardasha: str
    duration_years: float


class TimelineEventMarker(BaseModel):
    """Event marker for timeline."""
    date: date
    event_type: str  # journal_entry, calibration, prediction_peak, prediction_low
    description: str
    intensity: Optional[float]


class EnhancedTimelineResponse(BaseModel):
    """Enhanced timeline response with dasha markers and event markers."""
    chart_id: str
    start_date: date
    end_date: date
    aspects: Dict[str, List[IntegratedPredictionPoint]]
    dasha_periods: List[DashaPeriodMarker]
    event_markers: List[TimelineEventMarker]
    zoom_level: int  # 1-7 (day, week, month, quarter, year, 2-year, 5-year)


@router.get("/charts/{chart_id}/timeline/enhanced", response_model=EnhancedTimelineResponse)
async def get_enhanced_timeline(
    chart_id: str,
    start_date: date = Query(..., description="Timeline start date"),
    end_date: date = Query(..., description="Timeline end date"),
    aspects: Optional[str] = Query(
        None,
        description="Comma-separated aspect names (Wealth,Health,Business,Spouse,Kids,Career)"
    ),
    include_dasha_markers: bool = Query(True, description="Include dasha period markers"),
    include_event_markers: bool = Query(True, description="Include event markers"),
    zoom_level: int = Query(2, ge=1, le=7, description="Zoom level (1=day, 2=week, 3=month, 4=quarter, 5=year, 6=2-year, 7=5-year)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get enhanced timeline with dasha markers and event markers.

    This endpoint provides a comprehensive timeline view with:
    - Multi-aspect predictions
    - Dasha period separators
    - Event markers from journal entries and calibration
    - Zoom level support for different time scales

    Args:
        chart_id: Chart ID
        start_date: Timeline start date
        end_date: Timeline end date
        aspects: Comma-separated aspect names (default: all)
        include_dasha_markers: Include dasha period markers
        include_event_markers: Include event markers
        zoom_level: Zoom level (1-7)
        user: Current user
        db: Database session

    Returns:
        Enhanced timeline data
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"timeline_enhanced:{user.id}",
        **RATE_LIMITS["chart_calculation"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Timeline calculation limit exceeded",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )

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

    # Parse aspects
    if aspects:
        aspect_list = [a.strip() for a in aspects.split(",")]
    else:
        aspect_list = ["Wealth", "Health", "Business", "Spouse", "Kids", "Career"]

    # Validate aspects
    valid_aspects = {"Wealth", "Health", "Business", "Spouse", "Kids", "Career"}
    for aspect in aspect_list:
        if aspect not in valid_aspects:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid aspect: {aspect}",
            )

    # Calculate interval based on zoom level
    zoom_intervals = {1: 1, 2: 7, 3: 30, 4: 90, 5: 365, 6: 730, 7: 1825}
    interval_days = zoom_intervals.get(zoom_level, 7)

    # Get strength attributes
    strength_attributes = None
    stmt = select(StrengthProfile).where(
        (StrengthProfile.birth_chart_id == chart_id) &
        (StrengthProfile.user_id == user.id)
    )
    result = await db.execute(stmt)
    strength_profile = result.scalars().first()

    if strength_profile:
        strength_attributes = {
            "Risk-Taking": strength_profile.risk_taking,
            "Loyalty": strength_profile.loyalty,
            "Honesty": strength_profile.honesty,
            "Hardworking": strength_profile.hardworking,
            "Logical": strength_profile.logical,
            "Creativity": strength_profile.creativity,
            "Leadership": strength_profile.leadership,
            "Adaptability": strength_profile.adaptability,
        }
        strength_attributes = {k: v for k, v in strength_attributes.items() if v is not None}

    # Calculate timelines
    calculator = AspectIntensityCalculator()
    timeline_data = {}

    try:
        for aspect in aspect_list:
            predictions = calculator.calculate_integrated_timeline(
                aspect_name=aspect,
                birth_date=chart.birth_date,
                birth_time=chart.birth_time.isoformat() if chart.birth_time else None,
                latitude=chart.birth_latitude,
                longitude=chart.birth_longitude,
                timezone=chart.birth_timezone,
                start_date=datetime.combine(start_date, datetime.min.time()),
                end_date=datetime.combine(end_date, datetime.max.time()),
                strength_attributes=strength_attributes,
                interval_days=interval_days,
                ayanamsha=chart.ayanamsha,
            )

            # Convert to response format
            timeline_data[aspect] = [
                IntegratedPredictionPoint(
                    date=pred["date"],
                    base_intensity_score=pred["base_intensity_score"],
                    integrated_prediction_score=pred["integrated_prediction_score"],
                    confidence_band_low=pred["confidence_band_low"],
                    confidence_band_high=pred["confidence_band_high"],
                    dasha_period=pred["dasha_period"],
                    transit_info=pred["transit_info"],
                    astrological_factors=pred["astrological_factors"],
                    strength_factors=pred["strength_factors"],
                    strength_contribution=pred["strength_contribution"],
                )
                for pred in predictions
            ]
    except Exception as e:
        logger.error(f"Error calculating timeline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating timeline",
        )

    # Get dasha period markers
    dasha_periods = []
    if include_dasha_markers:
        from app.core.dasha import VimshottariDasha
        dasha_calc = VimshottariDasha()

        # Get dasha timeline for the period
        moon_longitude = 0.0  # Would need to calculate from chart data
        dasha_timeline = dasha_calc.get_dasha_timeline(
            datetime.combine(chart.birth_date, datetime.min.time()),
            moon_longitude,
            years_ahead=int((end_date - start_date).days / 365) + 1
        )

        for dasha in dasha_timeline:
            if dasha["start_date"].date() <= end_date and dasha["end_date"].date() >= start_date:
                dasha_periods.append(
                    DashaPeriodMarker(
                        start_date=dasha["start_date"].date(),
                        end_date=dasha["end_date"].date(),
                        mahadasha=dasha.get("mahadasha", ""),
                        antardasha=dasha.get("antardasha", ""),
                        duration_years=dasha.get("duration_years", 0),
                    )
                )

    # Get event markers
    event_markers = []
    if include_event_markers:
        from app.models import JournalEntry

        # Get journal entries in date range
        stmt = select(JournalEntry).where(
            (JournalEntry.birth_chart_id == chart_id) &
            (JournalEntry.entry_date >= start_date) &
            (JournalEntry.entry_date <= end_date)
        )
        result = await db.execute(stmt)
        journal_entries = result.scalars().all()

        for entry in journal_entries:
            # Calculate average rating
            ratings = [
                entry.wealth_rating, entry.health_rating, entry.business_rating,
                entry.spouse_rating, entry.kids_rating, entry.career_rating
            ]
            ratings = [r for r in ratings if r is not None]
            avg_rating = sum(ratings) / len(ratings) if ratings else 5.0

            event_markers.append(
                TimelineEventMarker(
                    date=entry.entry_date,
                    event_type="journal_entry",
                    description=entry.title or entry.content[:50],
                    intensity=avg_rating,
                )
            )

    logger.info(f"Retrieved enhanced timeline for chart {chart_id}")

    return EnhancedTimelineResponse(
        chart_id=chart_id,
        start_date=start_date,
        end_date=end_date,
        aspects=timeline_data,
        dasha_periods=dasha_periods,
        event_markers=event_markers,
        zoom_level=zoom_level,
    )

