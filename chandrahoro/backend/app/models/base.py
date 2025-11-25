"""Base model with common fields for all database models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, DateTime, String, Boolean
from sqlalchemy.orm import declarative_mixin
from app.core.database import Base
import uuid


@declarative_mixin
class TimestampMixin:
    """Mixin for timestamp fields."""
    
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        index=True,
    )


@declarative_mixin
class UUIDMixin:
    """Mixin for UUID primary key."""
    
    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )


class BaseModel(Base, UUIDMixin, TimestampMixin):
    """Base model with common fields."""
    
    __abstract__ = True
    
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    def __repr__(self):
        """String representation."""
        return f"<{self.__class__.__name__}(id={self.id})>"

