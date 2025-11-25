"""ShareMarks research module models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Date
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class StockUniverse(BaseModel):
    """Stock universe model for research."""
    
    __tablename__ = "stock_universes"
    
    # Universe details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    universe_type = Column(String(50), nullable=False)  # predefined, custom
    
    # Stock list (JSON with symbols)
    stock_symbols = Column(JSON, nullable=False)
    
    # Metadata
    total_stocks = Column(Integer, nullable=False)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)


class ResearchSession(BaseModel):
    """Research session model for backtesting."""
    
    __tablename__ = "research_sessions"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    stock_universe_id = Column(String(36), ForeignKey("stock_universes.id"), nullable=False)
    
    # Session parameters
    seed = Column(Integer, nullable=False)  # For reproducibility
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    time_range = Column(String(50), nullable=True)  # e.g., "09:15-15:30"
    location = Column(String(255), nullable=True)
    
    # Feature weights (JSON)
    feature_weights = Column(JSON, nullable=True)
    
    # Results
    total_predictions = Column(Integer, nullable=True)
    hit_rate = Column(Float, nullable=True)  # Percentage
    rmse = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    
    # Metadata
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    stock_universe = relationship("StockUniverse")
    predictions = relationship("Prediction", back_populates="research_session", cascade="all, delete-orphan")


class AstroFeature(BaseModel):
    """Astrological feature extraction model."""
    
    __tablename__ = "astro_features"
    
    research_session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False, index=True)
    stock_symbol = Column(String(20), nullable=False)
    
    # Horoscope parameters (generated from seed)
    horoscope_data = Column(JSON, nullable=True)
    
    # Extracted features
    house_features = Column(JSON, nullable=True)  # Houses 2,5,8,9,10,11,12
    planetary_features = Column(JSON, nullable=True)
    yoga_features = Column(JSON, nullable=True)
    timing_cues = Column(JSON, nullable=True)
    
    # Aggregated score
    astrological_score = Column(Float, nullable=True)  # 0-1
    
    # Relationships
    research_session = relationship("ResearchSession")


class Prediction(BaseModel):
    """Prediction model for research results."""
    
    __tablename__ = "predictions"
    
    research_session_id = Column(String(36), ForeignKey("research_sessions.id"), nullable=False, index=True)
    stock_symbol = Column(String(20), nullable=False)
    
    # Prediction
    predicted_direction = Column(String(10), nullable=False)  # UP, DOWN, NEUTRAL
    predicted_score = Column(Float, nullable=False)  # 0-1
    
    # Actual outcome
    actual_direction = Column(String(10), nullable=True)
    actual_return = Column(Float, nullable=True)
    
    # Accuracy
    is_correct = Column(String(1), nullable=True)  # Y/N
    
    # Relationships
    research_session = relationship("ResearchSession", back_populates="predictions")


class AuditLog(BaseModel):
    """Audit log model for compliance and tracking."""
    
    __tablename__ = "audit_logs"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    # Action details
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(36), nullable=True)
    
    # Changes
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    
    # Metadata
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Timestamp (inherited from TimestampMixin)

