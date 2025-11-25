"""Authentication service."""

from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User, RoleEnum
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service."""
    
    @staticmethod
    async def register_user(
        db: AsyncSession,
        email: str,
        username: str,
        password: str,
        full_name: Optional[str] = None,
        role: RoleEnum = RoleEnum.INDIVIDUAL,
    ) -> Tuple[User, str, str]:
        """
        Register a new user.
        
        Args:
            db: Database session
            email: User email
            username: Username
            password: Plain password
            full_name: Full name
            role: User role
            
        Returns:
            Tuple of (user, access_token, refresh_token)
        """
        # Check if email exists
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        if result.scalars().first():
            raise ValueError("User with this email already exists")

        # Ensure username is unique (auto-generate if needed)
        original_username = username
        counter = 1
        while True:
            stmt = select(User).where(User.username == username)
            result = await db.execute(stmt)
            if not result.scalars().first():
                break
            username = f"{original_username}{counter}"
            counter += 1
        
        # Create user
        user = User(
            email=email,
            username=username,
            password_hash=hash_password(password),
            full_name=full_name,
            role=role,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Generate tokens
        access_token = create_access_token({"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token({"sub": user.id})
        
        logger.info(f"User registered: {user.email}")
        return user, access_token, refresh_token
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str,
    ) -> Tuple[Optional[User], Optional[str], Optional[str]]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            email: User email
            password: Plain password
            
        Returns:
            Tuple of (user, access_token, refresh_token) or (None, None, None)
        """
        # Get user
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        if not user or not verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for: {email}")
            return None, None, None
        
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {email}")
            return None, None, None
        
        # Generate tokens
        access_token = create_access_token({"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token({"sub": user.id})
        
        logger.info(f"User authenticated: {user.email}")
        return user, access_token, refresh_token
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by ID."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()
    
    @staticmethod
    def validate_access_token(token: str) -> Optional[str]:
        """
        Validate access token and return user ID.
        
        Args:
            token: JWT token
            
        Returns:
            User ID or None if invalid
        """
        token_data = decode_token(token)
        if not token_data or not verify_token_type(token_data, "access"):
            return None
        return token_data.get("sub")
    
    @staticmethod
    def validate_refresh_token(token: str) -> Optional[str]:
        """
        Validate refresh token and return user ID.
        
        Args:
            token: JWT token
            
        Returns:
            User ID or None if invalid
        """
        token_data = decode_token(token)
        if not token_data or not verify_token_type(token_data, "refresh"):
            return None
        return token_data.get("sub")

