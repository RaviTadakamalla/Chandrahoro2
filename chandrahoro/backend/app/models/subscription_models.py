"""Subscription and user tier models for ChandraHoro."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class SubscriptionTier(str, enum.Enum):
    """Subscription tier levels."""
    FREE = "free"
    STANDARD = "standard"
    PREMIUM = "premium"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    """Subscription status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TRIAL = "trial"
    SUSPENDED = "suspended"


class Subscription(BaseModel):
    """User subscription model."""
    
    __tablename__ = "subscriptions"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True, unique=True)
    
    # Subscription details
    tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False, index=True)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False, index=True)
    
    # Billing
    price_per_month = Column(Float, default=0.0, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Dates
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=True)  # Null for ongoing subscriptions
    trial_end_date = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=True)
    
    # Payment
    payment_method = Column(String(50), nullable=True)  # stripe, paypal, etc.
    payment_id = Column(String(255), nullable=True)  # External payment system ID
    
    # Usage limits (based on tier)
    max_charts_per_month = Column(Integer, default=10, nullable=False)
    max_saved_charts = Column(Integer, default=5, nullable=False)
    max_ai_queries_per_month = Column(Integer, default=10, nullable=False)
    max_export_per_month = Column(Integer, default=10, nullable=False)
    
    # Current usage (reset monthly)
    charts_used_this_month = Column(Integer, default=0, nullable=False)
    ai_queries_used_this_month = Column(Integer, default=0, nullable=False)
    exports_used_this_month = Column(Integer, default=0, nullable=False)
    usage_reset_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Features enabled
    enable_ai = Column(Boolean, default=False, nullable=False)
    enable_advanced_charts = Column(Boolean, default=False, nullable=False)  # D2-D60
    enable_api_access = Column(Boolean, default=False, nullable=False)
    enable_priority_support = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
    
    def __repr__(self):
        return f"<Subscription(user_id={self.user_id}, tier={self.tier}, status={self.status})>"
    
    def is_feature_enabled(self, feature: str) -> bool:
        """Check if a feature is enabled for this subscription."""
        feature_map = {
            "ai": self.enable_ai,
            "advanced_charts": self.enable_advanced_charts,
            "api_access": self.enable_api_access,
            "priority_support": self.enable_priority_support,
        }
        return feature_map.get(feature, False)
    
    def can_create_chart(self) -> bool:
        """Check if user can create a new chart this month."""
        return self.charts_used_this_month < self.max_charts_per_month
    
    def can_use_ai(self) -> bool:
        """Check if user can use AI this month."""
        return self.enable_ai and self.ai_queries_used_this_month < self.max_ai_queries_per_month
    
    def can_export(self) -> bool:
        """Check if user can export this month."""
        return self.exports_used_this_month < self.max_export_per_month
    
    def increment_usage(self, usage_type: str):
        """Increment usage counter."""
        if usage_type == "chart":
            self.charts_used_this_month += 1
        elif usage_type == "ai":
            self.ai_queries_used_this_month += 1
        elif usage_type == "export":
            self.exports_used_this_month += 1
    
    def reset_monthly_usage(self):
        """Reset monthly usage counters."""
        self.charts_used_this_month = 0
        self.ai_queries_used_this_month = 0
        self.exports_used_this_month = 0
        self.usage_reset_date = datetime.utcnow()


# Tier configurations (can be moved to config file)
TIER_CONFIGS = {
    SubscriptionTier.FREE: {
        "price": 0.0,
        "max_charts_per_month": 10,
        "max_saved_charts": 5,
        "max_ai_queries_per_month": 5,
        "max_export_per_month": 5,
        "enable_ai": False,
        "enable_advanced_charts": False,
        "enable_api_access": False,
        "enable_priority_support": False,
    },
    SubscriptionTier.STANDARD: {
        "price": 9.99,
        "max_charts_per_month": 50,
        "max_saved_charts": 20,
        "max_ai_queries_per_month": 50,
        "max_export_per_month": 50,
        "enable_ai": True,
        "enable_advanced_charts": False,
        "enable_api_access": False,
        "enable_priority_support": False,
    },
    SubscriptionTier.PREMIUM: {
        "price": 19.99,
        "max_charts_per_month": 200,
        "max_saved_charts": 100,
        "max_ai_queries_per_month": 200,
        "max_export_per_month": 200,
        "enable_ai": True,
        "enable_advanced_charts": True,
        "enable_api_access": False,
        "enable_priority_support": True,
    },
}

