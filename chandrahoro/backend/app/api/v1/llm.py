"""LLM configuration API endpoints."""

from typing import Optional, Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models import (
    User, LlmConfig, LlmSharedKey, LlmSharedKeyUsage, LlmAdminDefaults, LlmUserAccess, LlmAuditLog,
    LlmProvider, ResponseFormat, AuditAction, RoleEnum
)
from app.services.llm_service import LlmService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
llm_service = LlmService()


# Request/Response Models
class SharedKeyInput(BaseModel):
    """Shared key creation/update input."""
    account_name: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    display_name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    provider: LlmProvider
    model: str = Field(..., min_length=1, max_length=100)
    api_key: str = Field(..., min_length=1)
    base_url: Optional[str] = Field(None, max_length=500)
    region: Optional[str] = Field(None, max_length=50)
    deployment: Optional[str] = Field(None, max_length=100)
    extra_headers: Optional[Dict[str, str]] = None
    response_format: ResponseFormat = ResponseFormat.AUTO
    is_public: bool = False
    allowed_user_ids: Optional[List[str]] = None
    daily_limit: Optional[int] = Field(None, ge=1, le=100000)
    per_user_daily_limit: Optional[int] = Field(None, ge=1, le=10000)


class SharedKeySummary(BaseModel):
    """Shared key summary (no API key)."""
    id: str
    account_name: str
    display_name: Optional[str]
    description: Optional[str]
    owner_user_id: str
    owner_email: Optional[str]
    is_public: bool
    provider: LlmProvider
    model: str
    base_url: Optional[str]
    key_last_four: str
    is_active: bool
    last_validated_at: Optional[str]
    usage_today: int
    usage_this_month: int
    total_usage_count: int
    daily_limit: Optional[int]
    per_user_daily_limit: Optional[int]
    created_at: str
    updated_at: str
    can_edit: bool  # Whether current user can edit this key
    can_use: bool  # Whether current user can use this key


class LlmConfigInput(BaseModel):
    """LLM configuration input - can be personal key, shared key, or owner name key."""
    use_shared_key: bool = False
    shared_key_account_name: Optional[str] = Field(None, max_length=100)

    # Owner name mode (simple key sharing for testing)
    use_owner_name: bool = False
    key_owner_name: Optional[str] = Field(None, max_length=100)

    # Personal/Owner key fields (required if use_shared_key=False)
    provider: Optional[LlmProvider] = None
    model: Optional[str] = Field(None, min_length=1, max_length=100)
    api_key: Optional[str] = Field(None, min_length=1)
    base_url: Optional[str] = Field(None, max_length=500)
    region: Optional[str] = Field(None, max_length=50)
    deployment: Optional[str] = Field(None, max_length=100)
    extra_headers: Optional[Dict[str, str]] = None
    response_format: ResponseFormat = ResponseFormat.AUTO
    daily_limit: Optional[int] = Field(None, ge=1, le=10000)


class LlmConfigSummary(BaseModel):
    """LLM configuration summary (no API key)."""
    id: str
    use_shared_key: bool
    shared_key_account_name: Optional[str]
    shared_key_display_name: Optional[str]
    use_owner_name: bool
    key_owner_name: Optional[str]
    provider: Optional[LlmProvider]
    model: Optional[str]
    base_url: Optional[str]
    key_last_four: Optional[str]
    last_validated_at: Optional[str]
    usage_today: int
    daily_limit: Optional[int]
    is_active: bool
    created_at: str
    updated_at: str


class TestConnectionRequest(BaseModel):
    """Test connection request."""
    provider: LlmProvider
    model: str
    api_key: str
    base_url: Optional[str] = None
    extra_headers: Optional[Dict[str, str]] = None


class TestConnectionResult(BaseModel):
    """Test connection result."""
    ok: bool
    latency_ms: Optional[int] = None
    error: Optional[str] = None


class AdminDefaults(BaseModel):
    """Admin defaults configuration."""
    enforced: bool = False
    default_provider: Optional[LlmProvider] = None
    default_model: Optional[str] = None
    allowed_providers: Optional[List[LlmProvider]] = None
    global_daily_cap: Optional[int] = None
    per_user_daily_cap: Optional[int] = None


class UserLlmRow(BaseModel):
    """User LLM management row."""
    user_id: str
    email: str
    full_name: Optional[str]
    has_config: bool
    provider: Optional[LlmProvider]
    model: Optional[str]
    byok_enabled: bool
    daily_cap: Optional[int]
    usage_today: int
    last_used_at: Optional[str]


class AuditRow(BaseModel):
    """Audit log row."""
    id: str
    user_email: str
    admin_email: Optional[str]
    action: AuditAction
    resource_type: str
    provider: Optional[LlmProvider]
    model: Optional[str]
    success: bool
    error_message: Optional[str]
    created_at: str


# Helper functions
def get_client_ip(request: Request) -> Optional[str]:
    """Get client IP address."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def get_user_agent(request: Request) -> Optional[str]:
    """Get user agent."""
    return request.headers.get("User-Agent")


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if current_user.role not in [RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# User endpoints
@router.get("/me", response_model=Optional[LlmConfigSummary])
async def get_my_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's LLM configuration."""
    config = await llm_service.get_config(db, current_user.id)

    if not config:
        return None

    # If using shared key, get shared key details
    shared_key_display_name = None
    if config.use_shared_key and config.shared_key_account_name:
        result = await db.execute(
            select(LlmSharedKey).where(
                LlmSharedKey.account_name == config.shared_key_account_name
            )
        )
        shared_key = result.scalar_one_or_none()
        if shared_key:
            shared_key_display_name = shared_key.display_name

    return LlmConfigSummary(
        id=config.id,
        use_shared_key=config.use_shared_key,
        shared_key_account_name=config.shared_key_account_name,
        shared_key_display_name=shared_key_display_name,
        use_owner_name=config.use_owner_name,
        key_owner_name=config.key_owner_name,
        provider=config.provider,
        model=config.model,
        base_url=config.base_url,
        key_last_four=config.key_last_four,
        last_validated_at=config.last_validated_at.isoformat() if config.last_validated_at else None,
        usage_today=config.usage_today,
        daily_limit=config.daily_limit,
        is_active=config.is_active,
        created_at=config.created_at.isoformat(),
        updated_at=config.updated_at.isoformat()
    )


@router.post("/test", response_model=TestConnectionResult)
async def test_connection(
    request: Request,
    test_request: TestConnectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Test LLM API connection."""
    try:
        success, latency_ms, error_msg = await llm_service.test_connection(
            test_request.provider,
            test_request.model,
            test_request.api_key,
            test_request.base_url,
            test_request.extra_headers
        )
        
        # Log test attempt
        await llm_service._log_audit(
            db, current_user.id, AuditAction.TEST, "config",
            provider=test_request.provider, model=test_request.model,
            ip_address=get_client_ip(request), user_agent=get_user_agent(request),
            success=success, error_message=error_msg
        )
        
        return TestConnectionResult(
            ok=success,
            latency_ms=latency_ms,
            error=error_msg
        )
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Test connection error: {error_msg}")

        # Provide user-friendly error messages
        if "Invalid model" in error_msg:
            user_error = error_msg  # Pass through the API's error message
        elif "401" in error_msg or "unauthorized" in error_msg.lower():
            user_error = "Authentication failed. Please check your API key."
        elif "403" in error_msg or "forbidden" in error_msg.lower():
            user_error = "Access denied. Please check your API key permissions."
        elif "404" in error_msg:
            user_error = "API endpoint not found. Please check your base URL and model name."
        elif "timeout" in error_msg.lower():
            user_error = "Connection timeout. Please check your network connection and try again."
        elif "connection" in error_msg.lower():
            user_error = "Failed to connect to the API. Please check your network and base URL."
        else:
            user_error = f"Test failed: {error_msg}"

        return TestConnectionResult(
            ok=False,
            error=user_error
        )


@router.post("/save")
async def save_config(
    request: Request,
    config_input: LlmConfigInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save LLM configuration - can use personal key, shared key, or owner name key."""
    try:
        if config_input.use_shared_key:
            # Using shared key
            if not config_input.shared_key_account_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="shared_key_account_name is required when use_shared_key is true"
                )

            # Verify shared key exists and user has access
            result = await db.execute(
                select(LlmSharedKey).where(
                    LlmSharedKey.account_name == config_input.shared_key_account_name
                )
            )
            shared_key = result.scalar_one_or_none()

            if not shared_key:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Shared key '{config_input.shared_key_account_name}' not found"
                )

            # Check access
            can_use = (
                shared_key.is_public or
                shared_key.owner_user_id == current_user.id or
                (shared_key.allowed_user_ids and current_user.id in shared_key.allowed_user_ids)
            )

            if not can_use:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this shared key"
                )

            if not shared_key.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This shared key is not active"
                )

            # Get or create user config
            result = await db.execute(
                select(LlmConfig).where(LlmConfig.user_id == current_user.id)
            )
            config = result.scalar_one_or_none()

            if config:
                # Update existing config to use shared key
                config.use_shared_key = True
                config.shared_key_account_name = config_input.shared_key_account_name
                config.is_active = True
            else:
                # Create new config with shared key
                config = LlmConfig(
                    user_id=current_user.id,
                    use_shared_key=True,
                    shared_key_account_name=config_input.shared_key_account_name,
                    is_active=True
                )
                db.add(config)

            await db.commit()

            # Log audit
            await llm_service._log_audit(
                db, current_user.id, AuditAction.UPDATE, "config",
                resource_id=config.id,
                shared_key_account_name=config_input.shared_key_account_name,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request),
                success=True
            )

            return {"ok": True}

        elif config_input.use_owner_name:
            # Using owner name (simple key sharing for testing)
            if not config_input.key_owner_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="key_owner_name is required when use_owner_name is true"
                )

            if not config_input.provider or not config_input.model or not config_input.api_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="provider, model, and api_key are required for owner name configuration"
                )

            # Save configuration with owner name
            config = await llm_service.save_config_with_owner_name(
                db, current_user.id,
                config_input.key_owner_name,
                config_input.provider, config_input.model, config_input.api_key,
                config_input.base_url, config_input.region, config_input.deployment,
                config_input.extra_headers, config_input.response_format,
                config_input.daily_limit,
                get_client_ip(request), get_user_agent(request)
            )

            return {"ok": True}

        else:
            # Using personal key (BYOK)
            if not config_input.provider or not config_input.model or not config_input.api_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="provider, model, and api_key are required for personal key configuration"
                )

            # Check if BYOK is disabled globally
            result = await db.execute(select(LlmAdminDefaults))
            defaults = result.scalar_one_or_none()

            if defaults and defaults.enforced:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="BYOK is disabled by administrator"
                )

            # Check user-specific BYOK permission
            result = await db.execute(
                select(LlmUserAccess).where(LlmUserAccess.user_id == current_user.id)
            )
            user_access = result.scalar_one_or_none()

            if user_access and not user_access.byok_enabled:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="BYOK is disabled for your account"
                )

            # Validate provider is allowed
            if defaults and defaults.allowed_providers:
                if config_input.provider not in defaults.allowed_providers:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Provider {config_input.provider} is not allowed"
                    )

            # Save configuration
            config = await llm_service.save_config(
                db, current_user.id,
                config_input.provider, config_input.model, config_input.api_key,
                config_input.base_url, config_input.region, config_input.deployment,
                config_input.extra_headers, config_input.response_format,
                config_input.daily_limit,
                get_client_ip(request), get_user_agent(request)
            )

            return {"ok": True}

    except HTTPException:
        raise
    except ValueError as e:
        # Handle validation errors with user-friendly messages
        error_msg = str(e)
        logger.error(f"Validation error in save config: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        # Handle database and other errors
        error_msg = str(e)
        logger.error(f"Save config error: {error_msg}")

        # Provide user-friendly error messages for common issues
        if "is not among the defined enum values" in error_msg:
            # Extract provider name from error if possible
            if "perplexity" in error_msg.lower():
                detail = "The provider 'perplexity' is not supported. Please contact support to enable this provider."
            else:
                detail = "The selected provider is not supported. Please choose a different provider."
        elif "Duplicate entry" in error_msg:
            detail = "A configuration already exists. Please update your existing configuration instead."
        elif "foreign key constraint fails" in error_msg.lower():
            detail = "Invalid reference. Please check your configuration and try again."
        elif "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            detail = "Database connection error. Please try again in a moment."
        else:
            detail = "Failed to save configuration. Please check your inputs and try again."

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.post("/rotate")
async def rotate_key(
    request: Request,
    new_key_request: dict,  # {"api_key": "new_key"}
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Rotate API key."""
    try:
        config = await llm_service.get_config(db, current_user.id)
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No LLM configuration found"
            )
        
        new_api_key = new_key_request.get("api_key")
        if not new_api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New API key is required"
            )
        
        # Test new key first
        success, _, error_msg = await llm_service.test_connection(
            config.provider, config.model, new_api_key,
            config.base_url, config.extra_headers
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"New API key test failed: {error_msg}"
            )
        
        # Update key
        await llm_service.save_config(
            db, current_user.id,
            config.provider, config.model, new_api_key,
            config.base_url, config.region, config.deployment,
            config.extra_headers, config.response_format,
            config.daily_limit,
            get_client_ip(request), get_user_agent(request)
        )
        
        # Log rotation
        await llm_service._log_audit(
            db, current_user.id, AuditAction.ROTATE, "config", config.id,
            provider=config.provider, model=config.model,
            ip_address=get_client_ip(request), user_agent=get_user_agent(request),
            success=True
        )
        
        return {"ok": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rotate key error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rotate key"
        )


@router.delete("/me")
async def delete_my_config(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete current user's LLM configuration."""
    try:
        success = await llm_service.delete_config(
            db, current_user.id,
            get_client_ip(request), get_user_agent(request)
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No configuration found"
            )
        
        return {"ok": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete config error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete configuration"
        )


# Admin endpoints
@router.get("/admin/defaults", response_model=AdminDefaults)
async def get_admin_defaults(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get admin defaults."""
    result = await db.execute(select(LlmAdminDefaults))
    defaults = result.scalar_one_or_none()

    if not defaults:
        return AdminDefaults()

    return AdminDefaults(
        enforced=defaults.enforced,
        default_provider=defaults.default_provider,
        default_model=defaults.default_model,
        allowed_providers=defaults.allowed_providers,
        global_daily_cap=defaults.global_daily_cap,
        per_user_daily_cap=defaults.per_user_daily_cap
    )


@router.post("/admin/defaults")
async def save_admin_defaults(
    request: Request,
    defaults_input: AdminDefaults,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Save admin defaults."""
    try:
        result = await db.execute(select(LlmAdminDefaults))
        defaults = result.scalar_one_or_none()

        if defaults:
            # Update existing
            defaults.enforced = defaults_input.enforced
            defaults.default_provider = defaults_input.default_provider
            defaults.default_model = defaults_input.default_model
            defaults.allowed_providers = defaults_input.allowed_providers
            defaults.global_daily_cap = defaults_input.global_daily_cap
            defaults.per_user_daily_cap = defaults_input.per_user_daily_cap
            defaults.updated_at = datetime.utcnow()
        else:
            # Create new
            defaults = LlmAdminDefaults(
                enforced=defaults_input.enforced,
                default_provider=defaults_input.default_provider,
                default_model=defaults_input.default_model,
                allowed_providers=defaults_input.allowed_providers,
                global_daily_cap=defaults_input.global_daily_cap,
                per_user_daily_cap=defaults_input.per_user_daily_cap
            )
            db.add(defaults)

        await db.commit()

        # Log audit event
        await llm_service._log_audit(
            db, admin_user.id, AuditAction.UPDATE, "defaults", defaults.id,
            admin_user_id=admin_user.id,
            ip_address=get_client_ip(request), user_agent=get_user_agent(request),
            success=True
        )

        return {"ok": True}

    except Exception as e:
        logger.error(f"Save admin defaults error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save defaults"
        )


@router.get("/admin/users", response_model=Dict[str, Any])
async def get_users(
    page: int = 1,
    limit: int = 50,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get users with LLM configuration info."""
    try:
        offset = (page - 1) * limit

        # Get users with their LLM configs and access settings
        query = (
            select(User, LlmConfig, LlmUserAccess)
            .outerjoin(LlmConfig, User.id == LlmConfig.user_id)
            .outerjoin(LlmUserAccess, User.id == LlmUserAccess.user_id)
            .offset(offset)
            .limit(limit)
            .order_by(User.created_at.desc())
        )

        result = await db.execute(query)
        rows = result.all()

        users = []
        for user, config, access in rows:
            users.append(UserLlmRow(
                user_id=user.id,
                email=user.email,
                full_name=user.full_name,
                has_config=config is not None,
                provider=config.provider if config else None,
                model=config.model if config else None,
                byok_enabled=access.byok_enabled if access else True,
                daily_cap=access.daily_cap if access else None,
                usage_today=config.usage_today if config else 0,
                last_used_at=config.last_used_at.isoformat() if config and config.last_used_at else None
            ))

        # Get total count
        count_query = select(func.count(User.id))
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        return {
            "rows": users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }

    except Exception as e:
        logger.error(f"Get users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get users"
        )


@router.post("/admin/users/{user_id}/toggle-byok")
async def toggle_user_byok(
    user_id: str,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Toggle BYOK for a user."""
    try:
        # Check if user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get or create user access
        result = await db.execute(
            select(LlmUserAccess).where(LlmUserAccess.user_id == user_id)
        )
        access = result.scalar_one_or_none()

        if access:
            access.byok_enabled = not access.byok_enabled
            access.updated_at = datetime.utcnow()
        else:
            access = LlmUserAccess(
                user_id=user_id,
                byok_enabled=False  # Default is True, so toggle to False
            )
            db.add(access)

        await db.commit()

        # Log audit event
        action = AuditAction.ENABLE if access.byok_enabled else AuditAction.DISABLE
        await llm_service._log_audit(
            db, user_id, action, "access", access.id,
            admin_user_id=admin_user.id,
            ip_address=get_client_ip(request), user_agent=get_user_agent(request),
            success=True
        )

        return {"ok": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Toggle BYOK error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle BYOK"
        )


@router.post("/admin/users/{user_id}/set-cap")
async def set_user_cap(
    user_id: str,
    cap_request: dict,  # {"daily_cap": 100}
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Set daily cap for a user."""
    try:
        daily_cap = cap_request.get("daily_cap")
        if daily_cap is not None and (daily_cap < 0 or daily_cap > 10000):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daily cap must be between 0 and 10000"
            )

        # Check if user exists
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get or create user access
        result = await db.execute(
            select(LlmUserAccess).where(LlmUserAccess.user_id == user_id)
        )
        access = result.scalar_one_or_none()

        if access:
            access.daily_cap = daily_cap
            access.updated_at = datetime.utcnow()
        else:
            access = LlmUserAccess(
                user_id=user_id,
                daily_cap=daily_cap
            )
            db.add(access)

        await db.commit()

        # Log audit event
        await llm_service._log_audit(
            db, user_id, AuditAction.SET_CAP, "access", access.id,
            admin_user_id=admin_user.id,
            new_values={"daily_cap": daily_cap},
            ip_address=get_client_ip(request), user_agent=get_user_agent(request),
            success=True
        )

        return {"ok": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Set user cap error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set user cap"
        )


@router.get("/admin/audit", response_model=Dict[str, Any])
async def get_audit_logs(
    page: int = 1,
    limit: int = 50,
    user_id: Optional[str] = None,
    action: Optional[AuditAction] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get audit logs with filtering."""
    try:
        offset = (page - 1) * limit

        # Build query with filters
        query = (
            select(LlmAuditLog, User.email.label("user_email"))
            .join(User, LlmAuditLog.user_id == User.id)
            .outerjoin(User.alias("admin_user"), LlmAuditLog.admin_user_id == User.alias("admin_user").id)
        )

        if user_id:
            query = query.where(LlmAuditLog.user_id == user_id)
        if action:
            query = query.where(LlmAuditLog.action == action)

        query = query.order_by(desc(LlmAuditLog.created_at)).offset(offset).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        audit_logs = []
        for log, user_email in rows:
            # Get admin email if admin action
            admin_email = None
            if log.admin_user_id:
                admin_result = await db.execute(
                    select(User.email).where(User.id == log.admin_user_id)
                )
                admin_email = admin_result.scalar_one_or_none()

            audit_logs.append(AuditRow(
                id=log.id,
                user_email=user_email,
                admin_email=admin_email,
                action=log.action,
                resource_type=log.resource_type,
                provider=log.provider,
                model=log.model,
                success=log.success,
                error_message=log.error_message,
                created_at=log.created_at.isoformat()
            ))

        # Get total count
        count_query = select(func.count(LlmAuditLog.id))
        if user_id:
            count_query = count_query.where(LlmAuditLog.user_id == user_id)
        if action:
            count_query = count_query.where(LlmAuditLog.action == action)

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        return {
            "rows": audit_logs,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }

    except Exception as e:
        logger.error(f"Get audit logs error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get audit logs"
        )


@router.get("/admin/users/export")
async def export_users_csv(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Export users to CSV."""
    try:
        # Get all users with LLM info
        query = (
            select(User, LlmConfig, LlmUserAccess)
            .outerjoin(LlmConfig, User.id == LlmConfig.user_id)
            .outerjoin(LlmUserAccess, User.id == LlmUserAccess.user_id)
            .order_by(User.created_at.desc())
        )

        result = await db.execute(query)
        rows = result.all()

        # Build CSV content
        csv_lines = [
            "user_id,email,full_name,has_config,provider,model,byok_enabled,daily_cap,usage_today,last_used_at"
        ]

        for user, config, access in rows:
            csv_lines.append(
                f"{user.id},{user.email},{user.full_name or ''},"
                f"{config is not None},{config.provider if config else ''},"
                f"{config.model if config else ''},{access.byok_enabled if access else True},"
                f"{access.daily_cap if access else ''},{config.usage_today if config else 0},"
                f"{config.last_used_at.isoformat() if config and config.last_used_at else ''}"
            )

        csv_content = "\n".join(csv_lines)

        from fastapi.responses import Response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_llm_export.csv"}
        )

    except Exception as e:
        logger.error(f"Export users CSV error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export users"
        )


# ============================================================================
# Shared Key Management Endpoints
# ============================================================================

@router.get("/shared-keys", response_model=List[SharedKeySummary])
async def list_shared_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all shared keys accessible to the current user."""
    try:
        # Get all shared keys that user can access (owned, public, or explicitly allowed)
        query = select(LlmSharedKey).where(
            or_(
                LlmSharedKey.owner_user_id == current_user.id,
                LlmSharedKey.is_public == True,
                LlmSharedKey.allowed_user_ids.contains([current_user.id])
            )
        ).order_by(desc(LlmSharedKey.created_at))

        result = await db.execute(query)
        shared_keys = result.scalars().all()

        # Get owner emails
        owner_ids = [sk.owner_user_id for sk in shared_keys]
        owner_query = select(User).where(User.id.in_(owner_ids))
        owner_result = await db.execute(owner_query)
        owners = {u.id: u.email for u in owner_result.scalars().all()}

        summaries = []
        for sk in shared_keys:
            can_edit = sk.owner_user_id == current_user.id or current_user.role == RoleEnum.ADMIN
            can_use = (
                sk.is_active and (
                    sk.is_public or
                    sk.owner_user_id == current_user.id or
                    (sk.allowed_user_ids and current_user.id in sk.allowed_user_ids)
                )
            )

            summaries.append(SharedKeySummary(
                id=sk.id,
                account_name=sk.account_name,
                display_name=sk.display_name,
                description=sk.description,
                owner_user_id=sk.owner_user_id,
                owner_email=owners.get(sk.owner_user_id),
                is_public=sk.is_public,
                provider=sk.provider,
                model=sk.model,
                base_url=sk.base_url,
                key_last_four=sk.key_last_four,
                is_active=sk.is_active,
                last_validated_at=sk.last_validated_at.isoformat() if sk.last_validated_at else None,
                usage_today=sk.usage_today,
                usage_this_month=sk.usage_this_month,
                total_usage_count=sk.total_usage_count,
                daily_limit=sk.daily_limit,
                per_user_daily_limit=sk.per_user_daily_limit,
                created_at=sk.created_at.isoformat(),
                updated_at=sk.updated_at.isoformat(),
                can_edit=can_edit,
                can_use=can_use
            ))

        return summaries

    except Exception as e:
        logger.error(f"List shared keys error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list shared keys"
        )


@router.post("/shared-keys")
async def create_shared_key(
    request: Request,
    key_input: SharedKeyInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new shared API key."""
    try:
        # Check if account name already exists
        result = await db.execute(
            select(LlmSharedKey).where(LlmSharedKey.account_name == key_input.account_name)
        )
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Account name '{key_input.account_name}' already exists"
            )

        # Test connection first
        success, latency_ms, error_msg = await llm_service.test_connection(
            key_input.provider,
            key_input.model,
            key_input.api_key,
            key_input.base_url,
            key_input.extra_headers
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"API key test failed: {error_msg}"
            )

        # Encrypt and store API key
        key_vault_ref = f"vault://secret/shared-{key_input.account_name}-key"
        await llm_service.vault.store_key(key_vault_ref, key_input.api_key)

        # Create shared key
        shared_key = LlmSharedKey(
            account_name=key_input.account_name,
            display_name=key_input.display_name,
            description=key_input.description,
            owner_user_id=current_user.id,
            is_public=key_input.is_public,
            allowed_user_ids=key_input.allowed_user_ids,
            provider=key_input.provider,
            model=key_input.model,
            base_url=key_input.base_url,
            region=key_input.region,
            deployment=key_input.deployment,
            extra_headers=key_input.extra_headers,
            response_format=key_input.response_format,
            key_vault_ref=key_vault_ref,
            key_last_four=key_input.api_key[-4:],
            is_active=True,
            last_validated_at=datetime.utcnow(),
            last_test_latency_ms=latency_ms,
            daily_limit=key_input.daily_limit,
            per_user_daily_limit=key_input.per_user_daily_limit
        )

        db.add(shared_key)
        await db.commit()
        await db.refresh(shared_key)

        # Log audit
        await llm_service._log_audit(
            db, current_user.id, AuditAction.CREATE, "shared_key",
            resource_id=shared_key.id,
            provider=key_input.provider,
            model=key_input.model,
            shared_key_account_name=key_input.account_name,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            success=True
        )

        return {"ok": True, "account_name": key_input.account_name}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create shared key error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create shared key"
        )


@router.get("/shared-keys/{account_name}", response_model=SharedKeySummary)
async def get_shared_key(
    account_name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific shared key."""
    try:
        result = await db.execute(
            select(LlmSharedKey).where(LlmSharedKey.account_name == account_name)
        )
        shared_key = result.scalar_one_or_none()

        if not shared_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shared key '{account_name}' not found"
            )

        # Check access
        can_access = (
            shared_key.owner_user_id == current_user.id or
            shared_key.is_public or
            (shared_key.allowed_user_ids and current_user.id in shared_key.allowed_user_ids) or
            current_user.role == RoleEnum.ADMIN
        )

        if not can_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this shared key"
            )

        # Get owner email
        owner_result = await db.execute(select(User).where(User.id == shared_key.owner_user_id))
        owner = owner_result.scalar_one_or_none()

        can_edit = shared_key.owner_user_id == current_user.id or current_user.role == RoleEnum.ADMIN
        can_use = shared_key.is_active and can_access

        return SharedKeySummary(
            id=shared_key.id,
            account_name=shared_key.account_name,
            display_name=shared_key.display_name,
            description=shared_key.description,
            owner_user_id=shared_key.owner_user_id,
            owner_email=owner.email if owner else None,
            is_public=shared_key.is_public,
            provider=shared_key.provider,
            model=shared_key.model,
            base_url=shared_key.base_url,
            key_last_four=shared_key.key_last_four,
            is_active=shared_key.is_active,
            last_validated_at=shared_key.last_validated_at.isoformat() if shared_key.last_validated_at else None,
            usage_today=shared_key.usage_today,
            usage_this_month=shared_key.usage_this_month,
            total_usage_count=shared_key.total_usage_count,
            daily_limit=shared_key.daily_limit,
            per_user_daily_limit=shared_key.per_user_daily_limit,
            created_at=shared_key.created_at.isoformat(),
            updated_at=shared_key.updated_at.isoformat(),
            can_edit=can_edit,
            can_use=can_use
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get shared key error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get shared key"
        )


@router.delete("/shared-keys/{account_name}")
async def delete_shared_key(
    request: Request,
    account_name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a shared key (owner or admin only)."""
    try:
        result = await db.execute(
            select(LlmSharedKey).where(LlmSharedKey.account_name == account_name)
        )
        shared_key = result.scalar_one_or_none()

        if not shared_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shared key '{account_name}' not found"
            )

        # Check permission
        if shared_key.owner_user_id != current_user.id and current_user.role != RoleEnum.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner or admin can delete this shared key"
            )

        # Delete the key from vault
        await llm_service.vault.delete_key(shared_key.key_vault_ref)

        # Delete usage records
        await db.execute(
            select(LlmSharedKeyUsage).where(
                LlmSharedKeyUsage.shared_key_account_name == account_name
            )
        )

        # Update any configs using this shared key
        await db.execute(
            select(LlmConfig).where(
                and_(
                    LlmConfig.use_shared_key == True,
                    LlmConfig.shared_key_account_name == account_name
                )
            )
        )
        configs_result = await db.execute(
            select(LlmConfig).where(
                and_(
                    LlmConfig.use_shared_key == True,
                    LlmConfig.shared_key_account_name == account_name
                )
            )
        )
        affected_configs = configs_result.scalars().all()
        for config in affected_configs:
            config.use_shared_key = False
            config.shared_key_account_name = None
            config.is_active = False

        # Delete the shared key
        await db.delete(shared_key)
        await db.commit()

        # Log audit
        await llm_service._log_audit(
            db, current_user.id, AuditAction.DELETE, "shared_key",
            resource_id=shared_key.id,
            shared_key_account_name=account_name,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
            success=True
        )

        return {"ok": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete shared key error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete shared key"
        )
