"""Profile link and synergy analysis models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class RelationshipTypeEnum(str, enum.Enum):
    """Relationship types."""
    SPOUSE = "spouse"
    PARTNER = "partner"
    CHILD = "child"
    PARENT = "parent"
    SIBLING = "sibling"
    FRIEND = "friend"
    BUSINESS_PARTNER = "business_partner"
    COLLEAGUE = "colleague"


class ProfileLink(BaseModel):
    """Profile link model for multi-profile relationships."""
    
    __tablename__ = "profile_links"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    linked_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Relationship type
    relationship_type = Column(Enum(RelationshipTypeEnum), nullable=False)
    
    # Link metadata
    link_name = Column(String(255), nullable=True)  # Custom name for the link
    notes = Column(Text, nullable=True)
    
    # Consent and privacy
    is_verified = Column(String(1), default="N", nullable=False)  # Y/N - both users confirmed
    is_public = Column(String(1), default="N", nullable=False)  # Y/N - visible to others
    
    # Relationships
    user = relationship("User", back_populates="profile_links", foreign_keys=[user_id])
    linked_user = relationship("User", foreign_keys=[linked_user_id])


class SynergyAnalysis(BaseModel):
    """Synergy analysis model for multi-profile compatibility."""
    
    __tablename__ = "synergy_analyses"
    
    profile_link_id = Column(String(36), ForeignKey("profile_links.id"), nullable=False, index=True)
    
    # Synergy scores (0-100)
    overall_synergy_score = Column(Float, nullable=True)
    house_synergy_score = Column(Float, nullable=True)
    planetary_compatibility_score = Column(Float, nullable=True)
    strength_alignment_score = Column(Float, nullable=True)
    dasha_alignment_score = Column(Float, nullable=True)
    yoga_compatibility_score = Column(Float, nullable=True)
    
    # Detailed analysis
    strengths = Column(JSON, nullable=True)  # List of compatibility strengths
    challenges = Column(JSON, nullable=True)  # List of compatibility challenges
    recommendations = Column(Text, nullable=True)
    
    # Timeline data
    high_alignment_windows = Column(JSON, nullable=True)  # Periods of high compatibility
    friction_windows = Column(JSON, nullable=True)  # Periods of friction
    
    # Metadata
    analysis_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_current = Column(String(1), default="Y", nullable=False)  # Y/N - most recent analysis

