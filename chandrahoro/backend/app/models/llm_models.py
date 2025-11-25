"""LLM configuration and audit models."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text, Integer, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class LlmProvider(str, enum.Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    AZURE_OPENAI = "azure-openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OPENROUTER = "openrouter"
    MISTRAL = "mistral"
    TOGETHER = "together"
    GROQ = "groq"
    PERPLEXITY = "perplexity"
    COHERE = "cohere"
    XAI = "xai"
    OLLAMA = "ollama"
    CUSTOM = "custom"


class ResponseFormat(str, enum.Enum):
    """Response format options."""
    AUTO = "auto"
    TEXT = "text"
    JSON = "json"


class AuditAction(str, enum.Enum):
    """Audit log actions."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    TEST = "test"
    ROTATE = "rotate"
    ENABLE = "enable"
    DISABLE = "disable"
    SET_CAP = "set-cap"
    GENERATE = "generate"


class LlmSharedKey(BaseModel):
    """Shared LLM API key that can be used by multiple users."""

    __tablename__ = "llm_shared_keys"

    # Key identification
    account_name = Column(String(100), nullable=False, unique=True, index=True)  # e.g., "team-openai", "org-anthropic"
    display_name = Column(String(200), nullable=True)  # Human-readable name
    description = Column(Text, nullable=True)  # Purpose/notes

    # Owner and permissions
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)  # Who created/owns this key
    is_public = Column(Boolean, default=False, nullable=False)  # If true, all users can use it
    allowed_user_ids = Column(JSON, nullable=True)  # List of user IDs who can use this key (if not public)

    # Provider configuration
    provider = Column(Enum(LlmProvider, values_callable=lambda x: [e.value for e in x], native_enum=False), nullable=False)
    model = Column(String(100), nullable=False)
    base_url = Column(String(500), nullable=True)
    region = Column(String(50), nullable=True)  # For Azure
    deployment = Column(String(100), nullable=True)  # For Azure
    extra_headers = Column(JSON, nullable=True)
    response_format = Column(Enum(ResponseFormat), default=ResponseFormat.AUTO, nullable=False)

    # Key storage (write-only vault reference)
    key_vault_ref = Column(String(200), nullable=False)  # vault://secret/shared-{account_name}-key
    key_last_four = Column(String(4), nullable=False)  # Last 4 chars for display

    # Status and validation
    is_active = Column(Boolean, default=True, nullable=False)
    last_validated_at = Column(DateTime, nullable=True)
    last_test_latency_ms = Column(Integer, nullable=True)

    # Usage tracking (aggregate across all users)
    total_usage_count = Column(Integer, default=0, nullable=False)
    usage_today = Column(Integer, default=0, nullable=False)
    usage_this_month = Column(Integer, default=0, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    last_used_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    # Rate limiting
    daily_limit = Column(Integer, nullable=True)  # Shared daily limit across all users
    per_user_daily_limit = Column(Integer, nullable=True)  # Per-user daily limit

    # Relationships
    owner = relationship("User", foreign_keys=[owner_user_id])
    last_used_by = relationship("User", foreign_keys=[last_used_by_user_id])

    def __repr__(self):
        return f"<LlmSharedKey(account_name={self.account_name}, provider={self.provider}, owner={self.owner_user_id})>"


class LlmConfig(BaseModel):
    """User LLM configuration - can use personal key, shared key, or owner name key."""

    __tablename__ = "llm_configs"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Key source: personal key OR shared key reference OR owner name (simple sharing)
    use_shared_key = Column(Boolean, default=False, nullable=False)
    shared_key_account_name = Column(String(100), ForeignKey("llm_shared_keys.account_name"), nullable=True, index=True)

    # Owner name mode (simple key sharing for testing - no access control)
    use_owner_name = Column(Boolean, default=False, nullable=False)
    key_owner_name = Column(String(100), nullable=True, index=True)

    # Personal key configuration (only used if use_shared_key=False and use_owner_name=False)
    provider = Column(Enum(LlmProvider, values_callable=lambda x: [e.value for e in x], native_enum=False), nullable=True)  # Nullable now since shared key has provider
    model = Column(String(100), nullable=True)  # Nullable now since shared key has model
    base_url = Column(String(500), nullable=True)
    region = Column(String(50), nullable=True)  # For Azure
    deployment = Column(String(100), nullable=True)  # For Azure
    extra_headers = Column(JSON, nullable=True)
    response_format = Column(Enum(ResponseFormat), default=ResponseFormat.AUTO, nullable=False)
    daily_limit = Column(Integer, nullable=True)

    # Personal key storage (only used if use_shared_key=False and use_owner_name=False)
    key_vault_ref = Column(String(200), nullable=True)  # Nullable now
    key_last_four = Column(String(4), nullable=True)  # Nullable now

    # Status and validation
    is_active = Column(Boolean, default=True, nullable=False)
    last_validated_at = Column(DateTime, nullable=True)
    last_test_latency_ms = Column(Integer, nullable=True)

    # Usage tracking (personal usage only)
    usage_today = Column(Integer, default=0, nullable=False)
    usage_this_month = Column(Integer, default=0, nullable=False)
    last_used_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="llm_config")
    shared_key = relationship("LlmSharedKey", foreign_keys=[shared_key_account_name])

    def __repr__(self):
        if self.use_shared_key:
            return f"<LlmConfig(user_id={self.user_id}, shared_key={self.shared_key_account_name})>"
        elif self.use_owner_name:
            return f"<LlmConfig(user_id={self.user_id}, owner_name={self.key_owner_name})>"
        return f"<LlmConfig(user_id={self.user_id}, provider={self.provider}, model={self.model})>"


class LlmAdminDefaults(BaseModel):
    """Global admin defaults for LLM configuration."""

    __tablename__ = "llm_admin_defaults"

    # Global settings (singleton table - only one row)
    enforced = Column(Boolean, default=False, nullable=False)  # Disable BYOK globally
    default_provider = Column(Enum(LlmProvider, values_callable=lambda x: [e.value for e in x], native_enum=False), nullable=True)
    default_model = Column(String(100), nullable=True)
    allowed_providers = Column(JSON, nullable=True)  # List of allowed providers
    global_daily_cap = Column(Integer, nullable=True)  # Global daily request cap
    per_user_daily_cap = Column(Integer, nullable=True)  # Default per-user daily cap

    def __repr__(self):
        return f"<LlmAdminDefaults(enforced={self.enforced}, default_provider={self.default_provider})>"


class LlmUserAccess(BaseModel):
    """Per-user LLM access control."""

    __tablename__ = "llm_user_access"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    byok_enabled = Column(Boolean, default=True, nullable=False)  # Can user bring own key
    daily_cap = Column(Integer, nullable=True)  # User-specific daily cap (overrides global)
    is_suspended = Column(Boolean, default=False, nullable=False)  # Temporarily suspend access

    # Relationships
    user = relationship("User", back_populates="llm_access")

    def __repr__(self):
        return f"<LlmUserAccess(user_id={self.user_id}, byok_enabled={self.byok_enabled})>"


class LlmSharedKeyUsage(BaseModel):
    """Track per-user usage of shared keys for rate limiting and analytics."""

    __tablename__ = "llm_shared_key_usage"

    shared_key_account_name = Column(String(100), ForeignKey("llm_shared_keys.account_name"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # Usage tracking
    usage_today = Column(Integer, default=0, nullable=False)
    usage_this_month = Column(Integer, default=0, nullable=False)
    total_usage_count = Column(Integer, default=0, nullable=False)
    last_used_at = Column(DateTime, nullable=True)

    # Relationships
    shared_key = relationship("LlmSharedKey")
    user = relationship("User")

    def __repr__(self):
        return f"<LlmSharedKeyUsage(account_name={self.shared_key_account_name}, user_id={self.user_id})>"


class LlmAuditLog(BaseModel):
    """Audit log for LLM configuration changes."""

    __tablename__ = "llm_audit_logs"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    admin_user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)  # If admin action
    action = Column(Enum(AuditAction), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)  # "config", "access", "defaults", "shared_key"
    resource_id = Column(String(36), nullable=True)  # ID of affected resource

    # Event details
    provider = Column(Enum(LlmProvider, values_callable=lambda x: [e.value for e in x], native_enum=False), nullable=True)
    model = Column(String(100), nullable=True)
    shared_key_account_name = Column(String(100), nullable=True)  # If action involves shared key
    old_values = Column(JSON, nullable=True)  # Previous values (no secrets)
    new_values = Column(JSON, nullable=True)  # New values (no secrets)

    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv4/IPv6 (masked for privacy)
    user_agent = Column(String(500), nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    admin_user = relationship("User", foreign_keys=[admin_user_id])

    def __repr__(self):
        return f"<LlmAuditLog(user_id={self.user_id}, action={self.action}, success={self.success})>"
