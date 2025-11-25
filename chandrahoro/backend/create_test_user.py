#!/usr/bin/env python3
"""
Script to create or update a test user and clear rate limits.
Usage: python create_test_user.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import User, RoleEnum
from app.core.security import hash_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_or_update_user(
    email: str,
    password: str,
    username: str = None,
    full_name: str = None,
):
    """Create or update a user."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if user exists
            stmt = select(User).where(User.email == email)
            result = await db.execute(stmt)
            user = result.scalars().first()
            
            if user:
                logger.info(f"User {email} already exists. Updating password...")
                user.password_hash = hash_password(password)
                user.is_active = True
                await db.commit()
                logger.info(f"✅ Password updated for {email}")
            else:
                logger.info(f"Creating new user {email}...")
                
                # Auto-generate username if not provided
                if not username:
                    username = email.split('@')[0]
                
                # Ensure username is unique
                original_username = username
                counter = 1
                while True:
                    stmt = select(User).where(User.username == username)
                    result = await db.execute(stmt)
                    if not result.scalars().first():
                        break
                    username = f"{original_username}{counter}"
                    counter += 1
                
                user = User(
                    email=email,
                    username=username,
                    password_hash=hash_password(password),
                    full_name=full_name or username,
                    role=RoleEnum.INDIVIDUAL,
                    is_active=True,
                )
                
                db.add(user)
                await db.commit()
                await db.refresh(user)
                logger.info(f"✅ User created: {email} (username: {username})")
            
            return user
            
        except Exception as e:
            logger.error(f"❌ Error creating/updating user: {e}")
            await db.rollback()
            raise


async def clear_rate_limits():
    """Clear all rate limits (in-memory)."""
    from app.core.rate_limit import _rate_limiter
    
    logger.info("Clearing all rate limits...")
    _rate_limiter.requests.clear()
    logger.info("✅ Rate limits cleared")


async def main():
    """Main function."""
    print("\n" + "="*60)
    print("ChandraHoro - Create Test User & Clear Rate Limits")
    print("="*60 + "\n")
    
    # User details
    email = "drtravi.ai@gmail.com"
    password = "Jairam12"
    username = "drtravi"
    full_name = "Dr. Ravi"
    
    try:
        # Create or update user
        user = await create_or_update_user(
            email=email,
            password=password,
            username=username,
            full_name=full_name,
        )
        
        # Clear rate limits
        await clear_rate_limits()
        
        print("\n" + "="*60)
        print("✅ SUCCESS!")
        print("="*60)
        print(f"\nUser Details:")
        print(f"  Email:    {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Password: {password}")
        print(f"  Role:     {user.role.value}")
        print(f"  Active:   {user.is_active}")
        print(f"\nYou can now login at: http://localhost:3001/login")
        print("="*60 + "\n")
        
    except Exception as e:
        print("\n" + "="*60)
        print("❌ FAILED!")
        print("="*60)
        print(f"\nError: {e}")
        print("="*60 + "\n")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

