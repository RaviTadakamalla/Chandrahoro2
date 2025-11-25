"""Role definition API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.models import User, Organization, CorporateRole
from app.services.role_definition_service import RoleDefinitionCalculator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
calculator = RoleDefinitionCalculator()


class RoleTemplateResponse(BaseModel):
    """Role template response."""
    title: str
    description: str
    department: Optional[str]
    level: Optional[str]
    required_strengths: Dict[str, float]
    tags: Optional[List[str]]


class RoleDefinitionRequest(BaseModel):
    """Role definition request."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    required_strengths: Dict[str, float] = Field(default_factory=dict)
    tags: Optional[List[str]] = None


class RoleDefinitionResponse(BaseModel):
    """Role definition response."""
    id: str
    organization_id: str
    title: str
    description: Optional[str]
    department: Optional[str]
    level: Optional[str]
    required_strengths: Dict[str, float]
    tags: Optional[List[str]]
    created_at: datetime


class RoleFitRequest(BaseModel):
    """Role fit calculation request."""
    candidate_strengths: Dict[str, float]
    required_strengths: Dict[str, float]


class RoleFitResponse(BaseModel):
    """Role fit response."""
    fit_score: float
    gaps: List[Dict[str, Any]]
    strengths: List[Dict[str, Any]]
    recommendations: List[str]


@router.get("/roles/templates", response_model=List[RoleTemplateResponse])
async def list_role_templates(
    user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    List all available role templates.
    
    Args:
        user: Current user
        
    Returns:
        List of role templates
    """
    templates = calculator.list_role_templates()
    logger.info(f"Retrieved {len(templates)} role templates")
    return templates


@router.get("/roles/templates/{template_name}", response_model=RoleTemplateResponse)
async def get_role_template(
    template_name: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a specific role template.
    
    Args:
        template_name: Role template name
        user: Current user
        
    Returns:
        Role template data
    """
    template = calculator.get_role_template(template_name)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role template '{template_name}' not found",
        )
    
    logger.info(f"Retrieved role template: {template_name}")
    return template


@router.post("/organizations/{org_id}/roles", response_model=RoleDefinitionResponse)
async def create_role(
    org_id: str,
    request: RoleDefinitionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a new role definition for an organization.
    
    Args:
        org_id: Organization ID
        request: Role definition data
        user: Current user
        db: Database session
        
    Returns:
        Created role definition
    """
    # Verify organization ownership
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create roles for this organization",
        )
    
    # Create role
    role = CorporateRole(
        organization_id=org_id,
        title=request.title,
        description=request.description,
        required_strengths=request.required_strengths,
    )
    
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    logger.info(f"Created role: {role.id} for organization {org_id}")
    
    return RoleDefinitionResponse(
        id=role.id,
        organization_id=role.organization_id,
        title=role.title,
        description=role.description,
        department=request.department,
        level=request.level,
        required_strengths=role.required_strengths or {},
        tags=request.tags,
        created_at=role.created_at,
    )


@router.get("/organizations/{org_id}/roles", response_model=List[RoleDefinitionResponse])
async def list_organization_roles(
    org_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    List all roles for an organization.
    
    Args:
        org_id: Organization ID
        user: Current user
        db: Database session
        
    Returns:
        List of role definitions
    """
    # Verify organization access
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalars().first()
    
    if not org or org.admin_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view roles for this organization",
        )
    
    # Get roles
    stmt = select(CorporateRole).where(CorporateRole.organization_id == org_id)
    result = await db.execute(stmt)
    roles = result.scalars().all()
    
    logger.info(f"Retrieved {len(roles)} roles for organization {org_id}")
    
    return [
        RoleDefinitionResponse(
            id=role.id,
            organization_id=role.organization_id,
            title=role.title,
            description=role.description,
            department=None,
            level=None,
            required_strengths=role.required_strengths or {},
            tags=None,
            created_at=role.created_at,
        )
        for role in roles
    ]


@router.post("/roles/calculate-fit", response_model=RoleFitResponse)
async def calculate_role_fit(
    request: RoleFitRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculate role fit for a candidate.
    
    Args:
        request: Role fit calculation request
        user: Current user
        
    Returns:
        Role fit analysis
    """
    result = calculator.calculate_role_fit(
        request.candidate_strengths,
        request.required_strengths,
    )
    
    logger.info(f"Calculated role fit: {result['fit_score']}")
    
    return result

