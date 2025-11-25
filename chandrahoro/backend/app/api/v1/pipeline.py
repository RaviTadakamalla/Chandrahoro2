"""Candidate pipeline management API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User, Organization, Candidate, CandidateStatusEnum
import logging
import csv
import io

logger = logging.getLogger(__name__)

router = APIRouter()


class CandidateFilterRequest(BaseModel):
    """Candidate filter request."""
    status: Optional[str] = None
    role_id: Optional[str] = None
    min_fit_score: Optional[float] = None
    tags: Optional[List[str]] = None
    search_query: Optional[str] = None


class CandidateUpdateRequest(BaseModel):
    """Candidate update request."""
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[Dict[str, Any]] = None


@router.get("/organizations/{org_id}/pipeline")
async def get_candidate_pipeline(
    org_id: str,
    status: Optional[str] = Query(None, description="Filter by status"),
    role_id: Optional[str] = Query(None, description="Filter by role"),
    min_fit_score: Optional[float] = Query(None, description="Minimum fit score"),
    sort_by: str = Query("fit_score", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get candidate pipeline with filtering and sorting.
    
    Args:
        org_id: Organization ID
        status: Filter by status
        role_id: Filter by role
        min_fit_score: Minimum fit score
        sort_by: Sort field
        sort_order: Sort order
        user: Current user
        db: Database session
        
    Returns:
        Candidate pipeline
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view pipeline for this organization",
        )
    
    # Build query
    query = select(Candidate).where(Candidate.organization_id == org_id)
    
    # Apply filters
    if status:
        query = query.where(Candidate.status == status)
    if role_id:
        query = query.where(Candidate.role_id == role_id)
    if min_fit_score is not None:
        query = query.where(Candidate.role_fit_score >= min_fit_score)
    
    # Apply sorting
    if sort_by == "fit_score":
        if sort_order == "asc":
            query = query.order_by(Candidate.role_fit_score.asc())
        else:
            query = query.order_by(Candidate.role_fit_score.desc())
    elif sort_by == "name":
        if sort_order == "asc":
            query = query.order_by(Candidate.name.asc())
        else:
            query = query.order_by(Candidate.name.desc())
    else:
        query = query.order_by(Candidate.created_at.desc())
    
    result = await db.execute(query)
    candidates = result.scalars().all()
    
    # Group by status
    pipeline = {}
    for candidate in candidates:
        status_key = candidate.status.value if candidate.status else "unknown"
        if status_key not in pipeline:
            pipeline[status_key] = []
        
        pipeline[status_key].append({
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "role_id": candidate.role_id,
            "fit_score": candidate.role_fit_score,
            "status": status_key,
            "created_at": candidate.created_at,
        })
    
    logger.info(f"Retrieved pipeline for organization {org_id}")
    
    return {
        "organization_id": org_id,
        "total_candidates": len(candidates),
        "pipeline": pipeline,
    }


@router.put("/organizations/{org_id}/candidates/{candidate_id}")
async def update_candidate(
    org_id: str,
    candidate_id: str,
    request: CandidateUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update candidate status and tags.
    
    Args:
        org_id: Organization ID
        candidate_id: Candidate ID
        request: Update request
        user: Current user
        db: Database session
        
    Returns:
        Updated candidate
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update candidates",
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
    
    # Update fields
    if request.status:
        candidate.status = CandidateStatusEnum(request.status)
    if request.tags:
        candidate.tags = request.tags
    if request.notes:
        candidate.notes = request.notes
    
    await db.commit()
    await db.refresh(candidate)
    
    logger.info(f"Updated candidate {candidate_id}")
    
    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "status": candidate.status.value,
        "fit_score": candidate.role_fit_score,
        "updated_at": candidate.updated_at,
    }


@router.post("/organizations/{org_id}/pipeline/export")
async def export_pipeline(
    org_id: str,
    format: str = Query("csv", description="Export format (csv or json)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Export candidate pipeline.
    
    Args:
        org_id: Organization ID
        format: Export format
        status: Filter by status
        user: Current user
        db: Database session
        
    Returns:
        Exported pipeline data
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to export pipeline",
        )
    
    # Get candidates
    query = select(Candidate).where(Candidate.organization_id == org_id)
    if status:
        query = query.where(Candidate.status == status)
    
    result = await db.execute(query)
    candidates = result.scalars().all()
    
    if format == "csv":
        # Convert to CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["Name", "Email", "Phone", "Status", "Fit Score", "Created"])
        
        # Write data
        for candidate in candidates:
            writer.writerow([
                candidate.name,
                candidate.email,
                candidate.phone or "",
                candidate.status.value if candidate.status else "",
                candidate.role_fit_score or "",
                candidate.created_at.isoformat(),
            ])
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"pipeline_{org_id}.csv",
        }
    else:
        # Return JSON format
        return {
            "format": "json",
            "data": [
                {
                    "name": c.name,
                    "email": c.email,
                    "phone": c.phone,
                    "status": c.status.value if c.status else None,
                    "fit_score": c.role_fit_score,
                    "created_at": c.created_at.isoformat(),
                }
                for c in candidates
            ],
            "filename": f"pipeline_{org_id}.json",
        }

