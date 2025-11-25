"""Authentication API endpoints."""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.core.security import hash_password, verify_password
from app.models import User, RoleEnum
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """User response."""
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    """Profile update request."""
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)


class PasswordChangeRequest(BaseModel):
    """Password change request."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)


class DeleteAccountRequest(BaseModel):
    """Delete account request."""
    password: str = Field(..., min_length=8)
    confirmation: str = Field(..., description="Must be 'DELETE MY ACCOUNT'")


class ExportDataResponse(BaseModel):
    """Export data response."""
    user_id: str
    email: str
    username: str
    full_name: Optional[str]
    created_at: str
    birth_charts: list
    journal_entries: list
    calibration_entries: list
    profile_links: list


@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user.
    
    Args:
        request: Registration request
        db: Database session
        
    Returns:
        Access and refresh tokens
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"register:{request.email}",
        **RATE_LIMITS["auth"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )
    
    try:
        # Auto-generate username from email if not provided
        username = request.username or request.email.split('@')[0]

        user, access_token, refresh_token = await AuthService.register_user(
            db=db,
            email=request.email,
            username=username,
            password=request.password,
            full_name=request.full_name,
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Login user.
    
    Args:
        request: Login request
        db: Database session
        
    Returns:
        Access and refresh tokens
    """
    # Check rate limit
    is_allowed, rate_limit_info = check_rate_limit(
        f"login:{request.email}",
        **RATE_LIMITS["auth"]
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts",
            headers={"Retry-After": str(rate_limit_info["reset"])},
        )
    
    user, access_token, refresh_token = await AuthService.authenticate_user(
        db=db,
        email=request.email,
        password=request.password,
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user: User = Depends(get_current_user),
):
    """
    Get current user information.
    
    Args:
        user: Current user
        
    Returns:
        User information
    """
    return user


@router.post("/logout")
async def logout(
    user: User = Depends(get_current_user),
):
    """
    Logout user (client-side token deletion).

    Args:
        user: Current user

    Returns:
        Success message
    """
    logger.info(f"User logged out: {user.email}")
    return {"message": "Logged out successfully"}


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update user profile information.

    Args:
        request: Profile update request
        user: Current user
        db: Database session

    Returns:
        Updated user information
    """
    try:
        # Check if email is being changed and if it's already taken
        if request.email and request.email != user.email:
            stmt = select(User).where(User.email == request.email)
            result = await db.execute(stmt)
            if result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use",
                )

        # Update fields
        if request.full_name is not None:
            user.full_name = request.full_name
        if request.email is not None:
            user.email = request.email
        if request.phone is not None:
            user.phone = request.phone
        if request.timezone is not None:
            user.timezone = request.timezone
        if request.language is not None:
            user.language = request.language

        db.add(user)
        await db.commit()
        await db.refresh(user)

        logger.info(f"User profile updated: {user.email}")
        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )


@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Change user password.

    Args:
        request: Password change request
        user: Current user
        db: Database session

    Returns:
        Success message
    """
    try:
        # Verify current password
        if not verify_password(request.current_password, user.password_hash):
            logger.warning(f"Failed password change attempt for: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

        # Validate new password
        if request.new_password == request.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password",
            )

        # Update password
        user.password_hash = hash_password(request.new_password)
        db.add(user)
        await db.commit()

        logger.info(f"User password changed: {user.email}")
        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password",
        )


@router.get("/export-data", response_model=ExportDataResponse)
async def export_user_data(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Export all user data for GDPR compliance.

    Args:
        user: Current user
        db: Database session

    Returns:
        User data export
    """
    try:
        # Refresh user to get all relationships
        await db.refresh(user)

        # Prepare birth charts data
        birth_charts = []
        for chart in user.birth_charts:
            birth_charts.append({
                "id": chart.id,
                "name": chart.name,
                "birth_date": chart.birth_date.isoformat() if chart.birth_date else None,
                "birth_time": chart.birth_time.isoformat() if chart.birth_time else None,
                "birth_location": chart.birth_location,
                "created_at": chart.created_at.isoformat() if chart.created_at else None,
            })

        # Prepare journal entries data
        journal_entries = []
        for entry in user.journal_entries:
            journal_entries.append({
                "id": entry.id,
                "entry_date": entry.entry_date.isoformat() if entry.entry_date else None,
                "entry_type": entry.entry_type,
                "title": entry.title,
                "content": entry.content,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
            })

        # Prepare calibration entries data
        calibration_entries = []
        for entry in user.calibration_entries:
            calibration_entries.append({
                "id": entry.id,
                "aspect_name": entry.aspect_name,
                "entry_date": entry.entry_date.isoformat() if entry.entry_date else None,
                "model_prediction": entry.model_prediction,
                "user_self_rating": entry.user_self_rating,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
            })

        # Prepare profile links data
        profile_links = []
        for link in user.profile_links:
            profile_links.append({
                "id": link.id,
                "relationship_type": link.relationship_type,
                "created_at": link.created_at.isoformat() if link.created_at else None,
            })

        logger.info(f"User data exported: {user.email}")

        return ExportDataResponse(
            user_id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            created_at=user.created_at.isoformat() if user.created_at else None,
            birth_charts=birth_charts,
            journal_entries=journal_entries,
            calibration_entries=calibration_entries,
            profile_links=profile_links,
        )

    except Exception as e:
        logger.error(f"Data export error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export data",
        )


@router.delete("/account")
async def delete_account(
    request: DeleteAccountRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete user account and all associated data.

    Args:
        request: Delete account request
        user: Current user
        db: Database session

    Returns:
        Success message
    """
    try:
        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Failed account deletion attempt for: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password is incorrect",
            )

        # Verify confirmation text
        if request.confirmation != "DELETE MY ACCOUNT":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Confirmation text must be exactly 'DELETE MY ACCOUNT'",
            )

        # Log the deletion
        user_email = user.email
        logger.warning(f"User account deleted: {user_email}")

        # Delete user (cascade will delete all related data)
        await db.delete(user)
        await db.commit()

        return {"message": "Account deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account",
        )

