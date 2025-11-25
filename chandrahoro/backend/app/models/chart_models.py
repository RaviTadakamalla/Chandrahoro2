"""Birth chart and strength profile models."""

from datetime import datetime, date
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Date, Time
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class BirthChart(BaseModel):
    """Birth chart model."""
    
    __tablename__ = "birth_charts"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Birth details
    name = Column(String(255), nullable=True)
    birth_date = Column(Date, nullable=False)
    birth_time = Column(Time, nullable=True)
    birth_latitude = Column(Float, nullable=False)
    birth_longitude = Column(Float, nullable=False)
    birth_timezone = Column(String(50), nullable=False)
    birth_location = Column(String(255), nullable=False)
    
    # Chart preferences
    ayanamsha = Column(String(50), default="Lahiri", nullable=False)
    house_system = Column(String(50), default="Whole Sign", nullable=False)
    chart_style = Column(String(50), default="North Indian", nullable=False)

    # Methodology (for multi-methodology support)
    methodology = Column(String(50), default="parashara", nullable=False, index=True)

    # Calculated data (stored as JSON)
    chart_data = Column(JSON, nullable=True)  # Full chart calculation result

    # Metadata
    is_public = Column(String(1), default="N", nullable=False)  # Y/N
    notes = Column(Text, nullable=True)
    chart_name = Column(String(255), nullable=True)  # User-friendly name for the chart
    
    # Relationships
    user = relationship("User", back_populates="birth_charts")
    strength_profile = relationship("StrengthProfile", back_populates="birth_chart", uselist=False)
    aspect_timelines = relationship("AspectTimeline", back_populates="birth_chart", cascade="all, delete-orphan")
    calibration_entries = relationship("CalibrationEntry", back_populates="birth_chart", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="birth_chart", cascade="all, delete-orphan")
    cache_entries = relationship("ChartCache", back_populates="birth_chart", cascade="all, delete-orphan")
    request_history = relationship("UserRequest", back_populates="birth_chart", cascade="all, delete-orphan")


class StrengthProfile(BaseModel):
    """Strength profile model."""
    
    __tablename__ = "strength_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=False, index=True)
    
    # 8 Strength Attributes (1-10 scale)
    risk_taking = Column(Float, nullable=True)
    loyalty = Column(Float, nullable=True)
    honesty = Column(Float, nullable=True)
    hardworking = Column(Float, nullable=True)
    logical = Column(Float, nullable=True)
    creativity = Column(Float, nullable=True)
    leadership = Column(Float, nullable=True)
    adaptability = Column(Float, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="strength_profiles")
    birth_chart = relationship("BirthChart", back_populates="strength_profile")


class AspectTimeline(BaseModel):
    """Aspect timeline model for time-series data."""
    
    __tablename__ = "aspect_timelines"
    
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=False, index=True)
    
    # Life aspect (Wealth, Health, Business, Spouse, Kids, Career)
    aspect_name = Column(String(50), nullable=False)
    
    # Timeline data
    timeline_date = Column(DateTime, nullable=False, index=True)
    intensity_score = Column(Float, nullable=False)  # 1-10 scale
    confidence_band_low = Column(Float, nullable=True)
    confidence_band_high = Column(Float, nullable=True)
    
    # Additional metadata
    dasha_period = Column(String(100), nullable=True)
    transit_info = Column(Text, nullable=True)
    
    # Relationships
    birth_chart = relationship("BirthChart", back_populates="aspect_timelines")

