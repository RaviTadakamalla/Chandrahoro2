"""Corporate dashboard API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, Organization, Candidate, CorporateRole, Team, CandidateStatusEnum
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/organizations/{org_id}/dashboard")
async def get_corporate_dashboard(
    org_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get corporate dashboard with pipeline overview and metrics.
    
    Args:
        org_id: Organization ID
        user: Current user
        db: Database session
        
    Returns:
        Dashboard data
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view dashboard for this organization",
        )
    
    # Get pipeline overview
    stmt = select(Candidate).where(Candidate.organization_id == org_id)
    result = await db.execute(stmt)
    all_candidates = result.scalars().all()
    
    # Count by status
    status_counts = {}
    for status_enum in CandidateStatusEnum:
        count = len([c for c in all_candidates if c.status == status_enum])
        status_counts[status_enum.value] = count
    
    # Get role fit distribution
    stmt = select(CorporateRole).where(CorporateRole.organization_id == org_id)
    result = await db.execute(stmt)
    roles = result.scalars().all()
    
    role_fit_distribution = {}
    for role in roles:
        candidates_for_role = [c for c in all_candidates if c.role_id == role.id]
        if candidates_for_role:
            avg_fit = sum(c.role_fit_score or 0 for c in candidates_for_role) / len(candidates_for_role)
            role_fit_distribution[role.title] = {
                "count": len(candidates_for_role),
                "avg_fit_score": round(avg_fit, 1),
            }
    
    # Get strength heatmap (aggregate strengths across candidates)
    strength_heatmap = {
        "Risk-Taking": 0,
        "Loyalty": 0,
        "Honesty": 0,
        "Hardworking": 0,
        "Logical": 0,
        "Creativity": 0,
        "Leadership": 0,
        "Adaptability": 0,
    }
    
    # Get team synergy overview
    stmt = select(Team).where(Team.organization_id == org_id)
    result = await db.execute(stmt)
    teams = result.scalars().all()
    
    team_synergy_overview = []
    for team in teams:
        team_synergy_overview.append({
            "team_id": team.id,
            "team_name": team.name,
            "member_count": len(team.member_ids) if team.member_ids else 0,
            "synergy_score": team.team_synergy_score or 0,
            "diversity_score": team.diversity_score or 0,
            "leadership_fit": team.leadership_fit or 0,
        })
    
    # Generate recommendations
    recommendations = _generate_dashboard_recommendations(
        status_counts,
        role_fit_distribution,
        team_synergy_overview,
        len(all_candidates),
    )
    
    logger.info(f"Retrieved dashboard for organization {org_id}")
    
    return {
        "organization_id": org_id,
        "organization_name": org.name,
        "total_candidates": len(all_candidates),
        "pipeline_overview": {
            "status_counts": status_counts,
            "total_by_status": sum(status_counts.values()),
        },
        "role_fit_distribution": role_fit_distribution,
        "strength_heatmap": strength_heatmap,
        "team_synergy_overview": team_synergy_overview,
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat(),
    }


@router.get("/organizations/{org_id}/dashboard/metrics")
async def get_dashboard_metrics(
    org_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get detailed dashboard metrics.
    
    Args:
        org_id: Organization ID
        user: Current user
        db: Database session
        
    Returns:
        Detailed metrics
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view metrics",
        )
    
    # Get candidates
    stmt = select(Candidate).where(Candidate.organization_id == org_id)
    result = await db.execute(stmt)
    candidates = result.scalars().all()
    
    # Calculate metrics
    total_candidates = len(candidates)
    avg_fit_score = (
        sum(c.role_fit_score or 0 for c in candidates) / total_candidates
        if total_candidates > 0
        else 0
    )
    
    # Fit score distribution
    fit_distribution = {
        "excellent": len([c for c in candidates if (c.role_fit_score or 0) >= 80]),
        "good": len([c for c in candidates if 65 <= (c.role_fit_score or 0) < 80]),
        "moderate": len([c for c in candidates if 50 <= (c.role_fit_score or 0) < 65]),
        "poor": len([c for c in candidates if (c.role_fit_score or 0) < 50]),
    }
    
    # Conversion rates
    shortlisted = len([c for c in candidates if c.status == CandidateStatusEnum.SHORTLISTED])
    interviewed = len([c for c in candidates if c.status == CandidateStatusEnum.INTERVIEWED])
    offered = len([c for c in candidates if c.status == CandidateStatusEnum.OFFERED])
    hired = len([c for c in candidates if c.status == CandidateStatusEnum.HIRED])
    
    logger.info(f"Retrieved metrics for organization {org_id}")
    
    return {
        "organization_id": org_id,
        "total_candidates": total_candidates,
        "average_fit_score": round(avg_fit_score, 1),
        "fit_score_distribution": fit_distribution,
        "pipeline_metrics": {
            "shortlisted": shortlisted,
            "interviewed": interviewed,
            "offered": offered,
            "hired": hired,
            "conversion_rate": round((hired / total_candidates * 100) if total_candidates > 0 else 0, 1),
        },
    }


def _generate_dashboard_recommendations(
    status_counts: Dict[str, int],
    role_fit_distribution: Dict[str, Dict[str, Any]],
    team_synergy_overview: List[Dict[str, Any]],
    total_candidates: int,
) -> List[str]:
    """Generate dashboard recommendations."""
    recommendations = []
    
    # Pipeline recommendations
    if status_counts.get("shortlisted", 0) > 0:
        recommendations.append("✅ Active pipeline - Continue screening shortlisted candidates")
    else:
        recommendations.append("⚠️ Empty pipeline - Start recruiting new candidates")
    
    # Role fit recommendations
    if role_fit_distribution:
        avg_fit = sum(r["avg_fit_score"] for r in role_fit_distribution.values()) / len(role_fit_distribution)
        if avg_fit >= 75:
            recommendations.append("✅ Strong role fit - Candidates well-matched to roles")
        elif avg_fit < 50:
            recommendations.append("⚠️ Weak role fit - Consider role adjustments or new recruitment")
    
    # Team synergy recommendations
    if team_synergy_overview:
        avg_synergy = sum(t["synergy_score"] for t in team_synergy_overview) / len(team_synergy_overview)
        if avg_synergy >= 75:
            recommendations.append("✅ Strong team synergy - Teams are well-aligned")
        elif avg_synergy < 50:
            recommendations.append("⚠️ Weak team synergy - Consider team restructuring")
    
    # Hiring pace recommendations
    if total_candidates > 0:
        recommendations.append(f"📊 {total_candidates} candidates in pipeline")
    
    return recommendations

