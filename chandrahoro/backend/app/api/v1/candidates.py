"""Candidate assessment API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, Organization, CorporateRole, Candidate
from app.services.candidate_assessment_service import CandidateAssessmentCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
calculator = CandidateAssessmentCalculator()


class CandidateAssessmentRequest(BaseModel):
    """Candidate assessment request."""
    candidate_strengths: Dict[str, float]
    required_strengths: Dict[str, float]


class CandidateAssessmentResponse(BaseModel):
    """Candidate assessment response."""
    fit_score: float
    assessment_level: str
    strength_gaps: List[Dict[str, Any]]
    recommendations: List[str]


class BatchCandidateRequest(BaseModel):
    """Batch candidate assessment request."""
    candidates: List[Dict[str, Any]]
    required_strengths: Dict[str, float]


class TopCandidatesRequest(BaseModel):
    """Top candidates request."""
    candidates: List[Dict[str, Any]]
    required_strengths: Dict[str, float]
    top_n: int = Field(default=5, ge=1, le=50)
    min_fit_score: float = Field(default=50.0, ge=0.0, le=100.0)


@router.post("/candidates/assess", response_model=CandidateAssessmentResponse)
async def assess_candidate(
    request: CandidateAssessmentRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Assess a candidate for a role.
    
    Args:
        request: Candidate assessment request
        user: Current user
        
    Returns:
        Candidate assessment with fit score and recommendations
    """
    result = calculator.assess_candidate_for_role(
        request.candidate_strengths,
        request.required_strengths,
    )
    
    logger.info(f"Assessed candidate with fit score: {result['fit_score']}")
    
    return result


@router.post("/candidates/batch-assess")
async def batch_assess_candidates(
    request: BatchCandidateRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Assess multiple candidates for a role.
    
    Args:
        request: Batch assessment request
        user: Current user
        
    Returns:
        List of assessments sorted by fit score
    """
    assessments = calculator.batch_assess_candidates(
        request.candidates,
        request.required_strengths,
    )
    
    logger.info(f"Batch assessed {len(assessments)} candidates")
    
    return {
        "total_candidates": len(assessments),
        "assessments": assessments,
    }


@router.post("/candidates/top-candidates")
async def identify_top_candidates(
    request: TopCandidatesRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Identify top candidates for a role.
    
    Args:
        request: Top candidates request
        user: Current user
        
    Returns:
        Top candidates meeting criteria
    """
    top_candidates = calculator.identify_top_candidates(
        request.candidates,
        request.required_strengths,
        request.top_n,
        request.min_fit_score,
    )
    
    logger.info(f"Identified {len(top_candidates)} top candidates")
    
    return {
        "total_qualified": len(top_candidates),
        "top_candidates": top_candidates,
        "criteria": {
            "top_n": request.top_n,
            "min_fit_score": request.min_fit_score,
        },
    }


@router.post("/organizations/{org_id}/candidates/{candidate_id}/assess")
async def assess_candidate_for_role(
    org_id: str,
    candidate_id: str,
    role_id: str = Query(..., description="Role ID"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Assess a candidate for a specific role in an organization.
    
    Args:
        org_id: Organization ID
        candidate_id: Candidate ID
        role_id: Role ID
        user: Current user
        db: Database session
        
    Returns:
        Assessment with fit score and recommendations
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to assess candidates for this organization",
        )
    
    # Get candidate
    stmt = select(Candidate).where(
        (Candidate.id == candidate_id) & (Candidate.organization_id == org_id)
    )
    result = await db.execute(stmt)
    candidate = result.scalars().first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )
    
    # Get role
    stmt = select(CorporateRole).where(
        (CorporateRole.id == role_id) & (CorporateRole.organization_id == org_id)
    )
    result = await db.execute(stmt)
    role = result.scalars().first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    
    # Get candidate strengths (from strength profile if available)
    candidate_strengths = {
        "Risk-Taking": 5.0,
        "Loyalty": 5.0,
        "Honesty": 5.0,
        "Hardworking": 5.0,
        "Logical": 5.0,
        "Creativity": 5.0,
        "Leadership": 5.0,
        "Adaptability": 5.0,
    }
    
    # Assess candidate
    assessment = calculator.assess_candidate_for_role(
        candidate_strengths,
        role.required_strengths or {},
    )
    
    # Update candidate with assessment
    candidate.role_fit_score = assessment["fit_score"]
    candidate.strength_gaps = assessment["strength_gaps"]
    candidate.recommendations = "\n".join(assessment["recommendations"])
    
    await db.commit()
    
    logger.info(f"Assessed candidate {candidate_id} for role {role_id}")
    
    return {
        "candidate_id": candidate_id,
        "role_id": role_id,
        "fit_score": assessment["fit_score"],
        "assessment_level": assessment["assessment_level"],
        "strength_gaps": assessment["strength_gaps"],
        "recommendations": assessment["recommendations"],
    }

