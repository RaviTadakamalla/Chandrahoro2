"""Profile management API endpoints."""

from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, BirthChart, StrengthProfile, RoleEnum
from app.services.strength_attribute_service import StrengthAttributeCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class StrengthProfileCreate(BaseModel):
    """Create strength profile request."""
    risk_taking: Optional[float] = Field(None, ge=1, le=10)
    loyalty: Optional[float] = Field(None, ge=1, le=10)
    honesty: Optional[float] = Field(None, ge=1, le=10)
    hardworking: Optional[float] = Field(None, ge=1, le=10)
    logical: Optional[float] = Field(None, ge=1, le=10)
    creativity: Optional[float] = Field(None, ge=1, le=10)
    leadership: Optional[float] = Field(None, ge=1, le=10)
    adaptability: Optional[float] = Field(None, ge=1, le=10)


class StrengthProfileResponse(BaseModel):
    """Strength profile response."""
    id: str
    user_id: str
    birth_chart_id: str
    risk_taking: Optional[float]
    loyalty: Optional[float]
    honesty: Optional[float]
    hardworking: Optional[float]
    logical: Optional[float]
    creativity: Optional[float]
    leadership: Optional[float]
    adaptability: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """User profile response."""
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: RoleEnum
    phone: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    timezone: str
    language: str
    is_verified: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """Update user profile request."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None


@router.get("/charts/{chart_id}/strength-profile", response_model=StrengthProfileResponse)
async def get_strength_profile(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get strength profile for a chart.
    
    Args:
        chart_id: Chart ID
        user: Current user
        db: Database session
        
    Returns:
        Strength profile
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
    
    # Get strength profile
    stmt = select(StrengthProfile).where(
        StrengthProfile.birth_chart_id == chart_id
    )
    result = await db.execute(stmt)
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strength profile not found",
        )
    
    return profile


@router.post("/charts/{chart_id}/strength-profile", response_model=StrengthProfileResponse)
async def create_or_update_strength_profile(
    chart_id: str,
    request: StrengthProfileCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create or update strength profile for a chart.
    
    Args:
        chart_id: Chart ID
        request: Profile data
        user: Current user
        db: Database session
        
    Returns:
        Strength profile
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
    
    # Check if profile exists
    stmt = select(StrengthProfile).where(
        StrengthProfile.birth_chart_id == chart_id
    )
    result = await db.execute(stmt)
    profile = result.scalars().first()
    
    if profile:
        # Update existing profile
        if request.risk_taking is not None:
            profile.risk_taking = request.risk_taking
        if request.loyalty is not None:
            profile.loyalty = request.loyalty
        if request.honesty is not None:
            profile.honesty = request.honesty
        if request.hardworking is not None:
            profile.hardworking = request.hardworking
        if request.logical is not None:
            profile.logical = request.logical
        if request.creativity is not None:
            profile.creativity = request.creativity
        if request.leadership is not None:
            profile.leadership = request.leadership
        if request.adaptability is not None:
            profile.adaptability = request.adaptability
    else:
        # Create new profile
        profile = StrengthProfile(
            user_id=user.id,
            birth_chart_id=chart_id,
            risk_taking=request.risk_taking,
            loyalty=request.loyalty,
            honesty=request.honesty,
            hardworking=request.hardworking,
            logical=request.logical,
            creativity=request.creativity,
            leadership=request.leadership,
            adaptability=request.adaptability,
        )
        db.add(profile)
    
    await db.commit()
    await db.refresh(profile)
    
    logger.info(f"Strength profile saved for chart {chart_id}")
    return profile


@router.get("/users/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user: User = Depends(get_current_user),
):
    """
    Get current user profile.
    
    Args:
        user: Current user
        
    Returns:
        User profile
    """
    return user


@router.put("/users/profile", response_model=UserProfileResponse)
async def update_user_profile(
    request: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update user profile.
    
    Args:
        request: Update request
        user: Current user
        db: Database session
        
    Returns:
        Updated user profile
    """
    # Update fields
    if request.full_name is not None:
        user.full_name = request.full_name
    if request.phone is not None:
        user.phone = request.phone
    if request.avatar_url is not None:
        user.avatar_url = request.avatar_url
    if request.bio is not None:
        user.bio = request.bio
    if request.timezone is not None:
        user.timezone = request.timezone
    if request.language is not None:
        user.language = request.language
    
    await db.commit()
    await db.refresh(user)

    logger.info(f"User profile updated: {user.id}")
    return user


class StrengthAttributeResponse(BaseModel):
    """Strength attribute calculation response."""
    attribute_name: str
    score: float
    grade: str
    interpretation: str
    contributing_factors: Dict[str, float]
    confidence: float


class CalculatedStrengthProfileResponse(BaseModel):
    """Calculated strength profile response."""
    birth_chart_id: str
    attributes: Dict[str, StrengthAttributeResponse]
    overall_score: float
    calculation_timestamp: datetime


@router.post("/charts/{chart_id}/strength-attributes/calculate", response_model=CalculatedStrengthProfileResponse)
async def calculate_strength_attributes(
    chart_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Calculate strength attributes from Shadbala and Ashtakavarga.

    This endpoint calculates the 8 strength attributes (Risk-Taking, Loyalty, Honesty,
    Hardworking, Logical, Creativity, Leadership, Adaptability) based on the birth chart's
    Shadbala and Ashtakavarga calculations.

    Args:
        chart_id: Birth chart ID
        user: Current authenticated user
        db: Database session

    Returns:
        Calculated strength attributes with scores and interpretations
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalar_one_or_none()

    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found"
        )

    try:
        # Get chart data
        if not chart.chart_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chart data not available. Please calculate the chart first."
            )

        chart_data = chart.chart_data
        planets = chart_data.get('planets', [])
        houses = chart_data.get('houses', [])

        if not planets or not houses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid chart data. Missing planets or houses."
            )

        # Calculate strength attributes
        calculator = StrengthAttributeCalculator()
        attributes = calculator.calculate_strength_attributes(
            birth_date=chart.birth_date,
            birth_time=chart.birth_time.strftime("%H:%M:%S") if chart.birth_time else None,
            latitude=chart.birth_latitude,
            longitude=chart.birth_longitude,
            timezone=chart.birth_timezone,
            planets=planets,
            houses=houses,
            ayanamsha=chart.ayanamsha
        )

        # Build response
        response_attributes = {}
        total_score = 0.0

        for attr_name, attr in attributes.items():
            # Get grade
            if attr.score >= 8.5:
                grade = "Excellent"
            elif attr.score >= 7.0:
                grade = "Very Good"
            elif attr.score >= 5.5:
                grade = "Good"
            elif attr.score >= 4.0:
                grade = "Average"
            elif attr.score >= 2.5:
                grade = "Below Average"
            else:
                grade = "Weak"

            interpretation = calculator.get_attribute_interpretation(attr_name, attr.score)

            response_attributes[attr_name] = StrengthAttributeResponse(
                attribute_name=attr_name,
                score=attr.score,
                grade=grade,
                interpretation=interpretation,
                contributing_factors=attr.contributing_factors,
                confidence=attr.confidence
            )

            total_score += attr.score

        overall_score = total_score / len(attributes)

        logger.info(f"Calculated strength attributes for chart {chart_id}")

        return CalculatedStrengthProfileResponse(
            birth_chart_id=chart_id,
            attributes=response_attributes,
            overall_score=round(overall_score, 1),
            calculation_timestamp=datetime.utcnow()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating strength attributes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating strength attributes: {str(e)}"
        )

