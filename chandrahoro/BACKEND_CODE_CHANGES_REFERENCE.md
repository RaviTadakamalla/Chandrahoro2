# Backend Code Changes - Reference ✅

**File Modified:** `backend/app/api/v1/auth.py`  
**Lines Added:** 282  
**Date:** 2025-10-24  

---

## Summary of Changes

### 1. New Imports Added
```python
from typing import Optional, Dict, Any  # Added Dict, Any
from sqlalchemy import select  # Added
from app.core.security import hash_password, verify_password  # Added
```

### 2. New Pydantic Models Added

#### ProfileUpdateRequest
```python
class ProfileUpdateRequest(BaseModel):
    """Profile update request."""
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)
```

#### PasswordChangeRequest
```python
class PasswordChangeRequest(BaseModel):
    """Password change request."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
```

#### DeleteAccountRequest
```python
class DeleteAccountRequest(BaseModel):
    """Delete account request."""
    password: str = Field(..., min_length=8)
    confirmation: str = Field(..., description="Must be 'DELETE MY ACCOUNT'")
```

#### ExportDataResponse
```python
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
```

---

## 3. New Endpoints Added

### Endpoint 1: PUT /api/v1/auth/profile
```python
@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile information."""
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
```

### Endpoint 2: POST /api/v1/auth/change-password
```python
@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password."""
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
```

### Endpoint 3: GET /api/v1/auth/export-data
```python
@router.get("/export-data", response_model=ExportDataResponse)
async def export_user_data(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export all user data for GDPR compliance."""
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
```

### Endpoint 4: DELETE /api/v1/auth/account
```python
@router.delete("/account")
async def delete_account(
    request: DeleteAccountRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete user account and all associated data."""
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
```

---

## Key Features

✅ **Async/Await:** All operations use async patterns  
✅ **Error Handling:** Comprehensive try-catch blocks  
✅ **Validation:** Pydantic models for all requests  
✅ **Security:** Password verification, email validation  
✅ **Logging:** All operations logged  
✅ **Type Safety:** Full type hints  
✅ **Database:** Proper transaction handling  
✅ **HTTP Status:** Proper status codes  

---

## Testing

See BACKEND_TESTING_GUIDE.md for complete testing instructions.

---

## Deployment

1. Review changes
2. Run tests
3. Deploy to production
4. Monitor logs

---

**Implementation Complete!** ✅

