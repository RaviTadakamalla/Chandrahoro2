"""Calibration and journal entry models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Date
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CalibrationEntry(BaseModel):
    """Calibration entry model - user self-ratings vs model predictions."""
    
    __tablename__ = "calibration_entries"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=False, index=True)
    
    # Life aspect being calibrated
    aspect_name = Column(String(50), nullable=False)  # Wealth, Health, Business, Spouse, Kids, Career
    
    # Dates
    entry_date = Column(Date, nullable=False, index=True)
    
    # Ratings
    model_prediction = Column(Float, nullable=False)  # 1-10 scale
    user_self_rating = Column(Float, nullable=False)  # 1-10 scale
    
    # Calibration factor calculation
    calibration_factor = Column(Float, nullable=True)  # user_rating / model_prediction
    
    # Additional context
    notes = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)  # User's confidence in their rating
    
    # Relationships
    user = relationship("User", back_populates="calibration_entries")
    birth_chart = relationship("BirthChart", back_populates="calibration_entries")


class CalibrationFactor(BaseModel):
    """Aggregated calibration factors for accuracy tracking."""
    
    __tablename__ = "calibration_factors"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Life aspect
    aspect_name = Column(String(50), nullable=False, index=True)
    
    # Aggregated calibration data
    total_entries = Column(Integer, default=0, nullable=False)
    average_calibration_factor = Column(Float, nullable=True)
    accuracy_trend = Column(Float, nullable=True)  # Trend over time
    
    # Metadata
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class JournalEntry(BaseModel):
    """Journal entry model for tracking life events and aspect ratings."""
    
    __tablename__ = "journal_entries"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=False, index=True)
    
    # Entry metadata
    entry_date = Column(Date, nullable=False, index=True)
    entry_type = Column(String(50), nullable=False)  # daily, weekly, monthly, event
    
    # Content
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Aspect ratings (1-10 scale)
    wealth_rating = Column(Float, nullable=True)
    health_rating = Column(Float, nullable=True)
    business_rating = Column(Float, nullable=True)
    spouse_rating = Column(Float, nullable=True)
    kids_rating = Column(Float, nullable=True)
    career_rating = Column(Float, nullable=True)
    
    # Additional metadata
    mood = Column(String(50), nullable=True)  # happy, neutral, sad, etc.
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    event_markers = Column(JSON, nullable=True)  # Important events
    
    # Relationships
    user = relationship("User", back_populates="journal_entries")
    birth_chart = relationship("BirthChart", back_populates="journal_entries")

