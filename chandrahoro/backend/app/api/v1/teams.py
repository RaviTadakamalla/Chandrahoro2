"""Team synergy analysis API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, Organization, Team
from app.services.team_synergy_service import TeamSynergyCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
calculator = TeamSynergyCalculator()


class TeamMemberData(BaseModel):
    """Team member data."""
    id: str
    name: str
    strengths: Dict[str, float]
    role: Optional[str] = None


class TeamSynergyRequest(BaseModel):
    """Team synergy calculation request."""
    team_members: List[TeamMemberData]


class PairwiseCompatibility(BaseModel):
    """Pairwise compatibility data."""
    member1_id: str
    member1_name: str
    member2_id: str
    member2_name: str
    compatibility_score: float


class FrictionPoint(BaseModel):
    """Friction point data."""
    member1: str
    member2: str
    compatibility_score: float
    severity: str
    recommendation: str


class TeamSynergyResponse(BaseModel):
    """Team synergy response."""
    team_synergy_score: float
    diversity_score: float
    leadership_fit: float
    pairwise_compatibility: List[PairwiseCompatibility]
    friction_points: List[FrictionPoint]
    recommendations: List[str]


@router.post("/teams/analyze-synergy", response_model=TeamSynergyResponse)
async def analyze_team_synergy(
    request: TeamSynergyRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Analyze team synergy.
    
    Args:
        request: Team synergy analysis request
        user: Current user
        
    Returns:
        Team synergy analysis
    """
    team_data = [
        {
            "id": member.id,
            "name": member.name,
            "strengths": member.strengths,
            "role": member.role,
        }
        for member in request.team_members
    ]
    
    result = calculator.calculate_team_synergy(team_data)
    
    logger.info(f"Analyzed team synergy: {result['team_synergy_score']}")
    
    return result


@router.post("/organizations/{org_id}/teams", response_model=Dict[str, Any])
async def create_team(
    org_id: str,
    name: str = Query(..., min_length=1, max_length=255),
    description: Optional[str] = None,
    member_ids: Optional[List[str]] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a new team.
    
    Args:
        org_id: Organization ID
        name: Team name
        description: Team description
        member_ids: List of member IDs
        user: Current user
        db: Database session
        
    Returns:
        Created team
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create teams for this organization",
        )
    
    # Create team
    team = Team(
        organization_id=org_id,
        name=name,
        description=description,
        member_ids=member_ids or [],
    )
    
    db.add(team)
    await db.commit()
    await db.refresh(team)
    
    logger.info(f"Created team: {team.id} for organization {org_id}")
    
    return {
        "id": team.id,
        "organization_id": team.organization_id,
        "name": team.name,
        "description": team.description,
        "member_ids": team.member_ids,
        "created_at": team.created_at,
    }


@router.get("/organizations/{org_id}/teams", response_model=List[Dict[str, Any]])
async def list_organization_teams(
    org_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    List all teams for an organization.
    
    Args:
        org_id: Organization ID
        user: Current user
        db: Database session
        
    Returns:
        List of teams
    """
    # Verify organization access
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view teams for this organization",
        )
    
    # Get teams
    stmt = select(Team).where(Team.organization_id == org_id)
    result = await db.execute(stmt)
    teams = result.scalars().all()
    
    logger.info(f"Retrieved {len(teams)} teams for organization {org_id}")
    
    return [
        {
            "id": team.id,
            "organization_id": team.organization_id,
            "name": team.name,
            "description": team.description,
            "member_ids": team.member_ids,
            "team_synergy_score": team.team_synergy_score,
            "diversity_score": team.diversity_score,
            "leadership_fit": team.leadership_fit,
            "created_at": team.created_at,
        }
        for team in teams
    ]


@router.get("/organizations/{org_id}/teams/{team_id}")
async def get_team(
    org_id: str,
    team_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get a specific team.
    
    Args:
        org_id: Organization ID
        team_id: Team ID
        user: Current user
        db: Database session
        
    Returns:
        Team data
    """
    # Verify organization access
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view teams for this organization",
        )
    
    # Get team
    stmt = select(Team).where(
        (Team.id == team_id) & (Team.organization_id == org_id)
    )
    result = await db.execute(stmt)
    team = result.scalars().first()
    
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    logger.info(f"Retrieved team {team_id}")
    
    return {
        "id": team.id,
        "organization_id": team.organization_id,
        "name": team.name,
        "description": team.description,
        "member_ids": team.member_ids,
        "team_synergy_score": team.team_synergy_score,
        "diversity_score": team.diversity_score,
        "leadership_fit": team.leadership_fit,
        "friction_points": team.friction_points,
        "created_at": team.created_at,
    }

