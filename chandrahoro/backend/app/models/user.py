"""User and authentication models."""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class RoleEnum(str, enum.Enum):
    """User roles."""
    INDIVIDUAL = "individual"
    CORPORATE_MANAGER = "corporate_manager"
    ADMIN = "admin"
    ANALYST = "analyst"


class User(BaseModel):
    """User model."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.INDIVIDUAL, nullable=False)

    # Profile information
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # Account status
    is_verified = Column(Boolean, default=False, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Preferences
    timezone = Column(String(50), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)

    # Astrology preferences (for Parashara system)
    default_ayanamsha = Column(String(50), default="Lahiri", nullable=False)
    default_house_system = Column(String(50), default="Whole Sign", nullable=False)
    default_chart_style = Column(String(50), default="North Indian", nullable=False)

    # Methodology preference (for future multi-methodology support)
    preferred_methodology = Column(String(50), default="parashara", nullable=False)

    # Relationships
    birth_charts = relationship("BirthChart", back_populates="user", cascade="all, delete-orphan")
    strength_profiles = relationship("StrengthProfile", back_populates="user", cascade="all, delete-orphan")
    calibration_entries = relationship("CalibrationEntry", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    profile_links = relationship("ProfileLink", back_populates="user", cascade="all, delete-orphan", foreign_keys="[ProfileLink.user_id]")
    llm_config = relationship("LlmConfig", back_populates="user", cascade="all, delete-orphan", uselist=False)
    llm_access = relationship("LlmUserAccess", back_populates="user", cascade="all, delete-orphan", uselist=False)
    subscription = relationship("Subscription", back_populates="user", cascade="all, delete-orphan", uselist=False)
    request_history = relationship("UserRequest", back_populates="user", cascade="all, delete-orphan")
    ai_prompt_configs = relationship("AiPromptConfig", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Permission(BaseModel):
    """Permission model."""

    __tablename__ = "permissions"

    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    resource = Column(String(100), nullable=False)  # e.g., "chart", "user", "organization"
    action = Column(String(100), nullable=False)    # e.g., "read", "write", "delete"


class RolePermission(BaseModel):
    """Role-Permission association."""

    __tablename__ = "role_permissions"

    role = Column(Enum(RoleEnum), nullable=False, index=True)
    permission_id = Column(String(36), ForeignKey("permissions.id"), nullable=False)

    # Relationships
    permission = relationship("Permission")
