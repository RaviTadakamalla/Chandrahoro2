"""Privacy and consent management API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import User
from app.services.privacy_service import PrivacyManager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
privacy_manager = PrivacyManager()


class ConsentRequest(BaseModel):
    """Consent request."""
    consent_type: str = Field(..., description="Type of consent")


class ConsentResponse(BaseModel):
    """Consent response."""
    user_id: str
    consent_type: str
    granted: bool
    timestamp: str


class ConsentStatusResponse(BaseModel):
    """Consent status response."""
    user_id: str
    consent_status: Dict[str, bool]
    last_updated: Optional[str]


@router.get("/consent/types")
async def get_consent_types(
    user: User = Depends(get_current_user),
) -> Dict[str, Dict[str, str]]:
    """
    Get available consent types.
    
    Args:
        user: Current user
        
    Returns:
        Available consent types with descriptions
    """
    return {
        "consent_types": privacy_manager.CONSENT_TYPES,
    }


@router.get("/consent/status", response_model=ConsentStatusResponse)
async def get_consent_status(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get consent status for current user.
    
    Args:
        user: Current user
        
    Returns:
        Consent status
    """
    status = privacy_manager.get_consent_status(user.id)
    summary = privacy_manager.get_consent_summary(user.id)
    
    logger.info(f"Retrieved consent status for user {user.id}")
    
    return {
        "user_id": user.id,
        "consent_status": status,
        "last_updated": summary.get("last_updated"),
    }


@router.post("/consent/grant", response_model=ConsentResponse)
async def grant_consent(
    request: ConsentRequest,
    user: User = Depends(get_current_user),
    http_request: Request = None,
) -> Dict[str, Any]:
    """
    Grant consent for a user.
    
    Args:
        request: Consent request
        user: Current user
        http_request: HTTP request
        
    Returns:
        Consent record
    """
    try:
        ip_address = http_request.client.host if http_request else None
        user_agent = http_request.headers.get("user-agent") if http_request else None
        
        result = privacy_manager.grant_consent(
            user.id,
            request.consent_type,
            ip_address,
            user_agent,
        )
        
        logger.info(f"Granted {request.consent_type} consent for user {user.id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/consent/revoke", response_model=ConsentResponse)
async def revoke_consent(
    request: ConsentRequest,
    user: User = Depends(get_current_user),
    http_request: Request = None,
) -> Dict[str, Any]:
    """
    Revoke consent for a user.
    
    Args:
        request: Consent request
        user: Current user
        http_request: HTTP request
        
    Returns:
        Revocation record
    """
    try:
        ip_address = http_request.client.host if http_request else None
        
        result = privacy_manager.revoke_consent(
            user.id,
            request.consent_type,
            ip_address,
        )
        
        logger.info(f"Revoked {request.consent_type} consent for user {user.id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/consent/audit-log")
async def get_audit_log(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get audit log for current user.
    
    Args:
        user: Current user
        
    Returns:
        Audit log entries
    """
    audit_log = privacy_manager.get_audit_log(user.id)
    
    logger.info(f"Retrieved audit log for user {user.id}")
    
    return {
        "user_id": user.id,
        "audit_log": audit_log,
        "total_entries": len(audit_log),
    }


@router.post("/privacy/anonymize")
async def anonymize_data(
    data: Dict[str, Any] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Anonymize user data.
    
    Args:
        data: Data to anonymize
        user: Current user
        
    Returns:
        Anonymized data
    """
    if not data:
        data = {
            "email": user.email,
            "username": user.username,
            "id": user.id,
        }
    
    anonymized = privacy_manager.anonymize_data(data)
    
    logger.info(f"Anonymized data for user {user.id}")
    
    return {
        "original_fields": list(data.keys()),
        "anonymized_data": anonymized,
    }


@router.post("/privacy/data-export")
async def export_user_data(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Export user data (GDPR compliance).
    
    Args:
        user: Current user
        
    Returns:
        User data export
    """
    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role.value if user.role else None,
        "created_at": user.created_at.isoformat(),
        "is_verified": user.is_verified,
    }
    
    logger.info(f"Exported data for user {user.id}")
    
    return {
        "user_id": user.id,
        "export_date": datetime.now().isoformat(),
        "user_data": user_data,
    }


@router.post("/privacy/data-deletion")
async def request_data_deletion(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Request data deletion (GDPR right to be forgotten).
    
    Args:
        user: Current user
        
    Returns:
        Deletion request confirmation
    """
    logger.info(f"Data deletion requested for user {user.id}")
    
    return {
        "user_id": user.id,
        "status": "deletion_requested",
        "message": "Your data deletion request has been received. We will process it within 30 days.",
        "request_date": datetime.now().isoformat(),
    }


@router.get("/privacy/gdpr-compliance")
async def get_gdpr_compliance_info(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get GDPR compliance information.
    
    Args:
        user: Current user
        
    Returns:
        GDPR compliance information
    """
    return {
        "user_id": user.id,
        "gdpr_rights": [
            "Right to access your personal data",
            "Right to rectification of inaccurate data",
            "Right to erasure (right to be forgotten)",
            "Right to restrict processing",
            "Right to data portability",
            "Right to object to processing",
        ],
        "data_controller": "Chandrahoro",
        "privacy_policy_url": "/privacy-policy",
        "contact_email": "privacy@chandrahoro.com",
    }

