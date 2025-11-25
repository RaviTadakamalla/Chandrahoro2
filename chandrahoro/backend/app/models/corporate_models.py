"""Corporate module models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class CandidateStatusEnum(str, enum.Enum):
    """Candidate status."""
    SHORTLISTED = "shortlisted"
    INTERVIEWED = "interviewed"
    OFFERED = "offered"
    HIRED = "hired"
    REJECTED = "rejected"


class Organization(BaseModel):
    """Organization model."""
    
    __tablename__ = "organizations"
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)  # small, medium, large
    
    # Admin user
    admin_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    roles = relationship("CorporateRole", back_populates="organization", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="organization", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="organization", cascade="all, delete-orphan")


class CorporateRole(BaseModel):
    """Corporate role definition model."""
    
    __tablename__ = "corporate_roles"
    
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Role details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Required strength attributes (JSON with weights)
    required_strengths = Column(JSON, nullable=True)  # {attribute: weight}
    
    # Relationships
    organization = relationship("Organization", back_populates="roles")
    candidates = relationship("Candidate", back_populates="role")


class Candidate(BaseModel):
    """Candidate model for HR assessment."""
    
    __tablename__ = "candidates"
    
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    role_id = Column(String(36), ForeignKey("corporate_roles.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Candidate info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Assessment
    role_fit_score = Column(Float, nullable=True)  # 0-100
    strength_gaps = Column(JSON, nullable=True)  # Identified gaps
    recommendations = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(CandidateStatusEnum), default=CandidateStatusEnum.SHORTLISTED, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="candidates")
    role = relationship("CorporateRole", back_populates="candidates")


class Team(BaseModel):
    """Team model for team synergy analysis."""
    
    __tablename__ = "teams"
    
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Team info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Team composition (JSON with member IDs)
    member_ids = Column(JSON, nullable=True)
    
    # Team metrics
    team_synergy_score = Column(Float, nullable=True)  # 0-100
    diversity_score = Column(Float, nullable=True)
    leadership_fit = Column(Float, nullable=True)
    friction_points = Column(JSON, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="teams")

