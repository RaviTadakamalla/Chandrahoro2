"""Role-Based Access Control (RBAC) utilities."""

from typing import List, Optional
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.authentication import AuthCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, RoleEnum
from app.core.database import get_db
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# Authentication configuration


async def get_current_user(
    credentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user.
    
    Args:
        credentials: HTTP bearer credentials
        db: Database session
        
    Returns:
        Current user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    user_id = AuthService.validate_access_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await AuthService.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def require_role(
    required_roles: List[RoleEnum],
) -> callable:
    """
    Create a dependency that requires specific roles.
    
    Args:
        required_roles: List of required roles
        
    Returns:
        Dependency function
    """
    async def check_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role {user.role} not authorized for this action",
            )
        return user
    
    return check_role


# Convenience functions for common role checks
async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return user


async def require_corporate_manager(user: User = Depends(get_current_user)) -> User:
    """Require corporate manager role."""
    if user.role not in [RoleEnum.CORPORATE_MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Corporate manager role required",
        )
    return user


async def require_analyst(user: User = Depends(get_current_user)) -> User:
    """Require analyst role."""
    if user.role not in [RoleEnum.ANALYST, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Analyst role required",
        )
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise None.

    Args:
        credentials: HTTP bearer credentials
        db: Database session

    Returns:
        Current user or None
    """
    if not credentials:
        return None

    token = credentials.credentials
    user_id = AuthService.validate_access_token(token)

    if not user_id:
        return None

    user = await AuthService.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        return None

    return user


async def get_current_user_or_guest(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user.

    Args:
        credentials: HTTP bearer credentials
        db: Database session

    Returns:
        Current authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    # Require authentication - no guest mode
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    user_id = AuthService.validate_access_token(token)

    if user_id:
        user = await AuthService.get_user_by_id(db, user_id)
        if user and user.is_active:
            return user

    # No valid authentication
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

