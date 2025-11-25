"""Chart cache models for ChandraHoro."""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, JSON, Boolean, Enum, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class CacheType(str, enum.Enum):
    """Types of cached calculations."""
    # One-time calculations (permanent cache)
    NATAL_POSITIONS = "natal_positions"
    NATAL_HOUSES = "natal_houses"
    NATAL_DIVISIONAL = "natal_divisional"
    NATAL_DASHA_BALANCE = "natal_dasha_balance"
    NATAL_YOGAS = "natal_yogas"
    NATAL_SHADBALA = "natal_shadbala"
    NATAL_ASHTAKAVARGA = "natal_ashtakavarga"
    
    # Time-based calculations (expiring cache)
    CURRENT_TRANSITS = "current_transits"
    CURRENT_DASHA = "current_dasha"
    COMPATIBILITY = "compatibility"
    PRASHNA = "prashna"
    MUHURTA = "muhurta"


class ChartCache(BaseModel):
    """Chart calculation cache model."""
    
    __tablename__ = "chart_cache"
    
    # Foreign keys
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=False, index=True)
    
    # Cache metadata
    cache_type = Column(Enum(CacheType), nullable=False, index=True)
    cache_key = Column(String(255), nullable=False, index=True)  # Unique identifier for this cache entry
    
    # Cached data
    cache_data = Column(JSON, nullable=False)  # The actual calculation result
    
    # Expiry management
    expires_at = Column(DateTime, nullable=True, index=True)  # NULL for permanent cache
    is_permanent = Column(Boolean, default=False, nullable=False, index=True)
    
    # Calculation metadata
    calculation_time_ms = Column(Integer, nullable=True)  # How long calculation took
    calculation_params = Column(JSON, nullable=True)  # Parameters used for calculation
    
    # Version tracking
    cache_version = Column(String(20), default="1.0", nullable=False)  # For cache invalidation
    
    # Relationships
    birth_chart = relationship("BirthChart", back_populates="cache_entries")
    
    # Composite index for efficient lookups
    __table_args__ = (
        Index('idx_chart_cache_lookup', 'birth_chart_id', 'cache_type', 'cache_key'),
        Index('idx_cache_expiry', 'expires_at', 'is_permanent'),
    )
    
    def __repr__(self):
        return f"<ChartCache(chart_id={self.birth_chart_id}, type={self.cache_type}, expires={self.expires_at})>"
    
    def is_expired(self) -> bool:
        """Check if cache entry has expired."""
        if self.is_permanent:
            return False
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
    
    @classmethod
    def get_expiry_duration(cls, cache_type: CacheType) -> Optional[timedelta]:
        """Get expiry duration for a cache type."""
        expiry_map = {
            # Permanent caches (None = never expires)
            CacheType.NATAL_POSITIONS: None,
            CacheType.NATAL_HOUSES: None,
            CacheType.NATAL_DIVISIONAL: None,
            CacheType.NATAL_DASHA_BALANCE: None,
            CacheType.NATAL_YOGAS: None,
            CacheType.NATAL_SHADBALA: None,
            CacheType.NATAL_ASHTAKAVARGA: None,
            CacheType.COMPATIBILITY: None,  # Permanent, linked to two charts
            CacheType.PRASHNA: None,  # Permanent with timestamp
            CacheType.MUHURTA: None,  # Permanent
            
            # Expiring caches
            CacheType.CURRENT_TRANSITS: timedelta(hours=24),  # 24 hours
            CacheType.CURRENT_DASHA: timedelta(days=30),  # 1 month
        }
        return expiry_map.get(cache_type)
    
    @classmethod
    def create_cache_entry(
        cls,
        birth_chart_id: str,
        cache_type: CacheType,
        cache_key: str,
        cache_data: Dict[str, Any],
        calculation_time_ms: Optional[int] = None,
        calculation_params: Optional[Dict[str, Any]] = None,
    ) -> "ChartCache":
        """Create a new cache entry with appropriate expiry."""
        expiry_duration = cls.get_expiry_duration(cache_type)
        
        expires_at = None
        is_permanent = True
        
        if expiry_duration is not None:
            expires_at = datetime.utcnow() + expiry_duration
            is_permanent = False
        
        return cls(
            birth_chart_id=birth_chart_id,
            cache_type=cache_type,
            cache_key=cache_key,
            cache_data=cache_data,
            expires_at=expires_at,
            is_permanent=is_permanent,
            calculation_time_ms=calculation_time_ms,
            calculation_params=calculation_params,
        )


class UserRequest(BaseModel):
    """User request history model."""
    
    __tablename__ = "user_requests"
    
    # Foreign keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    birth_chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=True, index=True)
    
    # Request details
    request_type = Column(String(50), nullable=False, index=True)  # chart_calculation, ai_query, export, etc.
    request_endpoint = Column(String(255), nullable=True)
    request_method = Column(String(10), nullable=True)  # GET, POST, etc.
    
    # Request/Response data
    request_params = Column(JSON, nullable=True)
    response_status = Column(Integer, nullable=True)  # HTTP status code
    response_time_ms = Column(Integer, nullable=True)
    
    # AI-specific fields
    ai_query = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    ai_model = Column(String(50), nullable=True)
    ai_tokens_used = Column(Integer, nullable=True)
    
    # Export-specific fields
    export_format = Column(String(20), nullable=True)  # pdf, json, csv
    export_file_size = Column(Integer, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="request_history")
    birth_chart = relationship("BirthChart", back_populates="request_history")
    
    def __repr__(self):
        return f"<UserRequest(user_id={self.user_id}, type={self.request_type}, status={self.response_status})>"

