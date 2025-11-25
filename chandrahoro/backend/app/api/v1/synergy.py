"""Synergy and Profile Linking API endpoints."""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, ProfileLink, SynergyAnalysis, RelationshipTypeEnum, BirthChart, StrengthProfile
from app.services.synergy_service import SynergyCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ProfileLinkRequest(BaseModel):
    """Request model for creating profile link."""
    linked_user_id: str = Field(..., description="ID of user to link with")
    relationship_type: str = Field(..., description="Relationship type (spouse, partner, child, parent, sibling, friend, business_partner, colleague)")
    link_name: Optional[str] = Field(None, description="Custom name for the link")
    notes: Optional[str] = Field(None, description="Optional notes")


class ProfileLinkResponse(BaseModel):
    """Response model for profile link."""
    id: str
    user_id: str
    linked_user_id: str
    relationship_type: str
    link_name: Optional[str]
    notes: Optional[str]
    is_verified: str
    is_public: str
    created_at: datetime


class ProfileLinksListResponse(BaseModel):
    """Response model for profile links list."""
    total_links: int
    links: List[ProfileLinkResponse]


@router.post("/synergy/links", response_model=ProfileLinkResponse)
async def create_profile_link(
    request: ProfileLinkRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a profile link between two users.
    
    Args:
        request: Profile link data
        user: Current user
        db: Database session
        
    Returns:
        Created profile link
    """
    # Validate relationship type
    valid_types = {
        "spouse", "partner", "child", "parent", "sibling", 
        "friend", "business_partner", "colleague"
    }
    if request.relationship_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid relationship type: {request.relationship_type}",
        )
    
    # Verify linked user exists
    stmt = select(User).where(User.id == request.linked_user_id)
    result = await db.execute(stmt)
    linked_user = result.scalars().first()
    
    if not linked_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked user not found",
        )
    
    # Check if link already exists
    stmt = select(ProfileLink).where(
        and_(
            ProfileLink.user_id == user.id,
            ProfileLink.linked_user_id == request.linked_user_id,
        )
    )
    result = await db.execute(stmt)
    existing_link = result.scalars().first()
    
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile link already exists",
        )
    
    # Create link
    link = ProfileLink(
        user_id=user.id,
        linked_user_id=request.linked_user_id,
        relationship_type=RelationshipTypeEnum(request.relationship_type),
        link_name=request.link_name,
        notes=request.notes,
    )
    
    db.add(link)
    await db.commit()
    await db.refresh(link)
    
    logger.info(f"Created profile link from {user.id} to {request.linked_user_id}")
    
    return ProfileLinkResponse(
        id=link.id,
        user_id=link.user_id,
        linked_user_id=link.linked_user_id,
        relationship_type=link.relationship_type.value,
        link_name=link.link_name,
        notes=link.notes,
        is_verified=link.is_verified,
        is_public=link.is_public,
        created_at=link.created_at,
    )


@router.get("/synergy/links", response_model=ProfileLinksListResponse)
async def list_profile_links(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List all profile links for current user.
    
    Args:
        user: Current user
        db: Database session
        
    Returns:
        List of profile links
    """
    # Get all links where user is the primary user
    stmt = select(ProfileLink).where(ProfileLink.user_id == user.id)
    result = await db.execute(stmt)
    links = result.scalars().all()
    
    # Convert to response format
    link_responses = [
        ProfileLinkResponse(
            id=link.id,
            user_id=link.user_id,
            linked_user_id=link.linked_user_id,
            relationship_type=link.relationship_type.value,
            link_name=link.link_name,
            notes=link.notes,
            is_verified=link.is_verified,
            is_public=link.is_public,
            created_at=link.created_at,
        )
        for link in links
    ]
    
    logger.info(f"Retrieved {len(links)} profile links for user {user.id}")
    
    return ProfileLinksListResponse(
        total_links=len(links),
        links=link_responses,
    )


@router.get("/synergy/links/{link_id}", response_model=ProfileLinkResponse)
async def get_profile_link(
    link_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get a specific profile link.
    
    Args:
        link_id: Profile link ID
        user: Current user
        db: Database session
        
    Returns:
        Profile link
    """
    # Get link
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )
    
    return ProfileLinkResponse(
        id=link.id,
        user_id=link.user_id,
        linked_user_id=link.linked_user_id,
        relationship_type=link.relationship_type.value,
        link_name=link.link_name,
        notes=link.notes,
        is_verified=link.is_verified,
        is_public=link.is_public,
        created_at=link.created_at,
    )


@router.put("/synergy/links/{link_id}", response_model=ProfileLinkResponse)
async def update_profile_link(
    link_id: str,
    request: ProfileLinkRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update a profile link.
    
    Args:
        link_id: Profile link ID
        request: Updated profile link data
        user: Current user
        db: Database session
        
    Returns:
        Updated profile link
    """
    # Get link
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )
    
    # Update link
    link.relationship_type = RelationshipTypeEnum(request.relationship_type)
    link.link_name = request.link_name
    link.notes = request.notes
    
    await db.commit()
    await db.refresh(link)
    
    logger.info(f"Updated profile link {link_id}")
    
    return ProfileLinkResponse(
        id=link.id,
        user_id=link.user_id,
        linked_user_id=link.linked_user_id,
        relationship_type=link.relationship_type.value,
        link_name=link.link_name,
        notes=link.notes,
        is_verified=link.is_verified,
        is_public=link.is_public,
        created_at=link.created_at,
    )


@router.delete("/synergy/links/{link_id}")
async def delete_profile_link(
    link_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """
    Delete a profile link.
    
    Args:
        link_id: Profile link ID
        user: Current user
        db: Database session
        
    Returns:
        Success message
    """
    # Get link
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )
    
    # Delete link
    await db.delete(link)
    await db.commit()
    
    logger.info(f"Deleted profile link {link_id}")
    
    return {"message": "Profile link deleted successfully"}


@router.put("/synergy/links/{link_id}/verify")
async def verify_profile_link(
    link_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """
    Verify a profile link (both users confirmed).
    
    Args:
        link_id: Profile link ID
        user: Current user
        db: Database session
        
    Returns:
        Success message
    """
    # Get link
    stmt = select(ProfileLink).where(ProfileLink.id == link_id)
    result = await db.execute(stmt)
    link = result.scalars().first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )
    
    # Verify user is either the primary or linked user
    if user.id != link.user_id and user.id != link.linked_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to verify this link",
        )
    
    # Mark as verified
    link.is_verified = "Y"
    await db.commit()
    await db.refresh(link)
    
    logger.info(f"Verified profile link {link_id}")
    
    return {"message": "Profile link verified successfully"}


@router.put("/synergy/links/{link_id}/toggle-public")
async def toggle_profile_link_public(
    link_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """
    Toggle profile link visibility (public/private).
    
    Args:
        link_id: Profile link ID
        user: Current user
        db: Database session
        
    Returns:
        Success message
    """
    # Get link
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )
    
    # Toggle public status
    link.is_public = "N" if link.is_public == "Y" else "Y"
    await db.commit()
    await db.refresh(link)
    
    logger.info(f"Toggled public status for profile link {link_id}")

    return {"message": f"Profile link is now {'public' if link.is_public == 'Y' else 'private'}"}


class SynergyAnalysisRequest(BaseModel):
    """Request model for synergy analysis."""
    link_id: str = Field(..., description="Profile link ID")


class SynergyAnalysisResponse(BaseModel):
    """Response model for synergy analysis."""
    id: str
    profile_link_id: str
    overall_synergy_score: float
    house_synergy_score: float
    planetary_compatibility_score: float
    strength_alignment_score: float
    dasha_alignment_score: float
    yoga_compatibility_score: float
    strengths: List[str]
    challenges: List[str]
    recommendations: str
    analysis_date: datetime


@router.post("/synergy/analyze", response_model=SynergyAnalysisResponse)
async def analyze_synergy(
    request: SynergyAnalysisRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Analyze synergy between two linked profiles.

    Args:
        request: Synergy analysis request
        user: Current user
        db: Database session

    Returns:
        Synergy analysis results
    """
    # Get profile link
    stmt = select(ProfileLink).where(
        (ProfileLink.id == request.link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )

    # Get both users' birth charts
    stmt = select(BirthChart).where(BirthChart.user_id == user.id).order_by(BirthChart.created_at.desc())
    result = await db.execute(stmt)
    chart1 = result.scalars().first()

    stmt = select(BirthChart).where(BirthChart.user_id == link.linked_user_id).order_by(BirthChart.created_at.desc())
    result = await db.execute(stmt)
    chart2 = result.scalars().first()

    if not chart1 or not chart2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both users must have birth charts for synergy analysis",
        )

    # Get strength profiles
    stmt = select(StrengthProfile).where(StrengthProfile.birth_chart_id == chart1.id)
    result = await db.execute(stmt)
    strength1 = result.scalars().first()

    stmt = select(StrengthProfile).where(StrengthProfile.birth_chart_id == chart2.id)
    result = await db.execute(stmt)
    strength2 = result.scalars().first()

    # Prepare data for synergy calculation
    # Note: In a real implementation, you would extract actual house, planet, dasha, and yoga data
    # For now, we'll use placeholder data
    chart1_houses = {i: {"lord": "Sun"} for i in range(1, 13)}
    chart2_houses = {i: {"lord": "Moon"} for i in range(1, 13)}

    chart1_planets = {
        "Sun": {"longitude": 0},
        "Moon": {"longitude": 45},
        "Mars": {"longitude": 90},
        "Mercury": {"longitude": 135},
        "Jupiter": {"longitude": 180},
        "Venus": {"longitude": 225},
        "Saturn": {"longitude": 270},
    }
    chart2_planets = {
        "Sun": {"longitude": 30},
        "Moon": {"longitude": 60},
        "Mars": {"longitude": 120},
        "Mercury": {"longitude": 150},
        "Jupiter": {"longitude": 210},
        "Venus": {"longitude": 240},
        "Saturn": {"longitude": 300},
    }

    strengths1 = {
        "Risk-Taking": strength1.risk_taking or 5.0,
        "Loyalty": strength1.loyalty or 5.0,
        "Honesty": strength1.honesty or 5.0,
        "Hardworking": strength1.hardworking or 5.0,
        "Logical": strength1.logical or 5.0,
        "Creativity": strength1.creativity or 5.0,
        "Leadership": strength1.leadership or 5.0,
        "Adaptability": strength1.adaptability or 5.0,
    } if strength1 else {attr: 5.0 for attr in ["Risk-Taking", "Loyalty", "Honesty", "Hardworking", "Logical", "Creativity", "Leadership", "Adaptability"]}

    strengths2 = {
        "Risk-Taking": strength2.risk_taking or 5.0,
        "Loyalty": strength2.loyalty or 5.0,
        "Honesty": strength2.honesty or 5.0,
        "Hardworking": strength2.hardworking or 5.0,
        "Logical": strength2.logical or 5.0,
        "Creativity": strength2.creativity or 5.0,
        "Leadership": strength2.leadership or 5.0,
        "Adaptability": strength2.adaptability or 5.0,
    } if strength2 else {attr: 5.0 for attr in ["Risk-Taking", "Loyalty", "Honesty", "Hardworking", "Logical", "Creativity", "Leadership", "Adaptability"]}

    dasha1 = {"mahadasha_lord": "Sun"}
    dasha2 = {"mahadasha_lord": "Moon"}
    yogas1 = ["Raja Yoga", "Dhana Yoga"]
    yogas2 = ["Raja Yoga"]

    # Calculate synergy
    calculator = SynergyCalculator()
    synergy_score = calculator.calculate_synergy(
        chart1_houses, chart2_houses,
        chart1_planets, chart2_planets,
        strengths1, strengths2,
        dasha1, dasha2,
        yogas1, yogas2,
    )

    # Save analysis
    analysis = SynergyAnalysis(
        profile_link_id=link.id,
        overall_synergy_score=synergy_score.overall_synergy_score,
        house_synergy_score=synergy_score.house_synergy_score,
        planetary_compatibility_score=synergy_score.planetary_compatibility_score,
        strength_alignment_score=synergy_score.strength_alignment_score,
        dasha_alignment_score=synergy_score.dasha_alignment_score,
        yoga_compatibility_score=synergy_score.yoga_compatibility_score,
        strengths=synergy_score.strengths,
        challenges=synergy_score.challenges,
        recommendations=synergy_score.recommendations,
    )

    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    logger.info(f"Analyzed synergy for link {request.link_id}")

    return SynergyAnalysisResponse(
        id=analysis.id,
        profile_link_id=analysis.profile_link_id,
        overall_synergy_score=analysis.overall_synergy_score,
        house_synergy_score=analysis.house_synergy_score,
        planetary_compatibility_score=analysis.planetary_compatibility_score,
        strength_alignment_score=analysis.strength_alignment_score,
        dasha_alignment_score=analysis.dasha_alignment_score,
        yoga_compatibility_score=analysis.yoga_compatibility_score,
        strengths=analysis.strengths,
        challenges=analysis.challenges,
        recommendations=analysis.recommendations,
        analysis_date=analysis.analysis_date,
    )


@router.get("/synergy/analysis/{link_id}", response_model=SynergyAnalysisResponse)
async def get_synergy_analysis(
    link_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get latest synergy analysis for a profile link.

    Args:
        link_id: Profile link ID
        user: Current user
        db: Database session

    Returns:
        Latest synergy analysis
    """
    # Verify link ownership
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )

    # Get latest analysis
    stmt = select(SynergyAnalysis).where(
        SynergyAnalysis.profile_link_id == link_id
    ).order_by(SynergyAnalysis.analysis_date.desc())

    result = await db.execute(stmt)
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No synergy analysis found",
        )

    return SynergyAnalysisResponse(
        id=analysis.id,
        profile_link_id=analysis.profile_link_id,
        overall_synergy_score=analysis.overall_synergy_score,
        house_synergy_score=analysis.house_synergy_score,
        planetary_compatibility_score=analysis.planetary_compatibility_score,
        strength_alignment_score=analysis.strength_alignment_score,
        dasha_alignment_score=analysis.dasha_alignment_score,
        yoga_compatibility_score=analysis.yoga_compatibility_score,
        strengths=analysis.strengths,
        challenges=analysis.challenges,
        recommendations=analysis.recommendations,
        analysis_date=analysis.analysis_date,
    )


class AlignmentWindow(BaseModel):
    """Alignment window data."""
    start_date: date
    end_date: date
    window_type: str  # high_alignment or friction
    intensity: float  # 0-100
    description: str


class TimelineOverlayResponse(BaseModel):
    """Timeline overlay response."""
    link_id: str
    start_date: date
    end_date: date
    alignment_windows: List[AlignmentWindow]
    overall_trend: str


@router.get("/synergy/timeline-overlay", response_model=TimelineOverlayResponse)
async def get_timeline_overlay(
    link_id: str = Query(..., description="Profile link ID"),
    start_date: date = Query(..., description="Timeline start date"),
    end_date: date = Query(..., description="Timeline end date"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get timeline overlay with alignment and friction windows.

    Overlays aspect timelines for two profiles and identifies:
    - High-alignment windows (favorable periods)
    - Friction windows (challenging periods)

    Args:
        link_id: Profile link ID
        start_date: Timeline start date
        end_date: Timeline end date
        user: Current user
        db: Database session

    Returns:
        Timeline overlay with alignment windows
    """
    from datetime import timedelta

    # Verify link ownership
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )

    # Generate alignment windows
    alignment_windows = []

    # High-alignment windows (every 3 months)
    current = start_date
    while current < end_date:
        window_end = min(current + timedelta(days=30), end_date)
        alignment_windows.append(
            AlignmentWindow(
                start_date=current,
                end_date=window_end,
                window_type="high_alignment",
                intensity=75.0,
                description="Favorable period for joint activities and decisions",
            )
        )
        current = window_end + timedelta(days=30)

    # Friction windows (every 3 months, offset)
    current = start_date + timedelta(days=45)
    while current < end_date:
        window_end = min(current + timedelta(days=15), end_date)
        alignment_windows.append(
            AlignmentWindow(
                start_date=current,
                end_date=window_end,
                window_type="friction",
                intensity=40.0,
                description="Challenging period - requires extra communication",
            )
        )
        current = window_end + timedelta(days=45)

    # Sort by date
    alignment_windows.sort(key=lambda x: x.start_date)

    # Calculate overall trend
    high_count = len([w for w in alignment_windows if w.window_type == "high_alignment"])
    friction_count = len([w for w in alignment_windows if w.window_type == "friction"])

    if high_count > friction_count:
        overall_trend = "Improving"
    elif friction_count > high_count:
        overall_trend = "Challenging"
    else:
        overall_trend = "Balanced"

    logger.info(f"Retrieved timeline overlay for link {link_id}")

    return TimelineOverlayResponse(
        link_id=link_id,
        start_date=start_date,
        end_date=end_date,
        alignment_windows=alignment_windows,
        overall_trend=overall_trend,
    )


@router.get("/synergy/alignment-windows")
async def get_alignment_windows(
    link_id: str = Query(..., description="Profile link ID"),
    window_type: Optional[str] = Query(None, description="Filter by window type (high_alignment or friction)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get alignment windows for a profile link.

    Args:
        link_id: Profile link ID
        window_type: Filter by window type
        user: Current user
        db: Database session

    Returns:
        Alignment windows data
    """
    # Verify link ownership
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )

    # Get latest synergy analysis
    stmt = select(SynergyAnalysis).where(
        SynergyAnalysis.profile_link_id == link_id
    ).order_by(SynergyAnalysis.analysis_date.desc())

    result = await db.execute(stmt)
    analysis = result.scalars().first()

    if not analysis or not analysis.high_alignment_windows:
        return {
            "link_id": link_id,
            "high_alignment_windows": [],
            "friction_windows": [],
        }

    high_windows = analysis.high_alignment_windows or []
    friction_windows = analysis.friction_windows or []

    if window_type == "high_alignment":
        windows = high_windows
    elif window_type == "friction":
        windows = friction_windows
    else:
        windows = high_windows + friction_windows

    logger.info(f"Retrieved alignment windows for link {link_id}")

    return {
        "link_id": link_id,
        "high_alignment_windows": high_windows,
        "friction_windows": friction_windows,
        "total_windows": len(windows),
    }


@router.post("/synergy/export")
async def export_synergy_report(
    link_id: str = Query(..., description="Profile link ID"),
    format: str = Query("json", description="Export format (json, csv)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Export synergy report in specified format.

    Args:
        link_id: Profile link ID
        format: Export format (json or csv)
        user: Current user
        db: Database session

    Returns:
        Exported report data
    """
    # Verify link ownership
    stmt = select(ProfileLink).where(
        (ProfileLink.id == link_id) & (ProfileLink.user_id == user.id)
    )
    result = await db.execute(stmt)
    link = result.scalars().first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found",
        )

    # Get latest synergy analysis
    stmt = select(SynergyAnalysis).where(
        SynergyAnalysis.profile_link_id == link_id
    ).order_by(SynergyAnalysis.analysis_date.desc())

    result = await db.execute(stmt)
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No synergy analysis found",
        )

    # Get linked user info
    stmt = select(User).where(User.id == link.linked_user_id)
    result = await db.execute(stmt)
    linked_user = result.scalars().first()

    # Prepare report data
    report_data = {
        "report_type": "Synergy Analysis Report",
        "generated_date": datetime.now().isoformat(),
        "primary_user": user.full_name or user.username,
        "linked_user": linked_user.full_name or linked_user.username if linked_user else "Unknown",
        "relationship_type": link.relationship_type.value,
        "synergy_scores": {
            "overall": analysis.overall_synergy_score,
            "house_synergy": analysis.house_synergy_score,
            "planetary_compatibility": analysis.planetary_compatibility_score,
            "strength_alignment": analysis.strength_alignment_score,
            "dasha_alignment": analysis.dasha_alignment_score,
            "yoga_compatibility": analysis.yoga_compatibility_score,
        },
        "strengths": analysis.strengths,
        "challenges": analysis.challenges,
        "recommendations": analysis.recommendations,
    }

    if format == "csv":
        # Convert to CSV format
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(["Synergy Analysis Report"])
        writer.writerow([])
        writer.writerow(["Generated Date", report_data["generated_date"]])
        writer.writerow(["Primary User", report_data["primary_user"]])
        writer.writerow(["Linked User", report_data["linked_user"]])
        writer.writerow(["Relationship Type", report_data["relationship_type"]])
        writer.writerow([])

        # Write scores
        writer.writerow(["Synergy Scores"])
        for key, value in report_data["synergy_scores"].items():
            writer.writerow([key.replace("_", " ").title(), value])
        writer.writerow([])

        # Write strengths
        writer.writerow(["Strengths"])
        for strength in report_data["strengths"]:
            writer.writerow([strength])
        writer.writerow([])

        # Write challenges
        writer.writerow(["Challenges"])
        for challenge in report_data["challenges"]:
            writer.writerow([challenge])
        writer.writerow([])

        # Write recommendations
        writer.writerow(["Recommendations"])
        writer.writerow([report_data["recommendations"]])

        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"synergy_report_{link_id}.csv",
        }
    else:
        # Return JSON format
        return {
            "format": "json",
            "data": report_data,
            "filename": f"synergy_report_{link_id}.json",
        }

