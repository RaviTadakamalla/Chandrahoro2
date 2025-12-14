"""
AI Generated Reports Storage Models.

Stores AI-generated astrology reports for users with versioning and regeneration support.
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime
import enum


class ReportType(str, enum.Enum):
    """Types of AI-generated reports."""
    CHART_INTERPRETATION = "chart_interpretation"
    DASHA_PREDICTIONS = "dasha_predictions"
    TRANSIT_ANALYSIS = "transit_analysis"
    YOGA_ANALYSIS = "yoga_analysis"
    REMEDIAL_MEASURES = "remedial_measures"
    COMPATIBILITY_ANALYSIS = "compatibility_analysis"
    QUESTION_ANSWER = "question_answer"


class ReportStatus(str, enum.Enum):
    """Status of report generation."""
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class AiGeneratedReport(BaseModel):
    """Model for storing AI-generated astrology reports."""

    __tablename__ = "ai_generated_reports"

    # User and Chart References
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    chart_id = Column(String(36), ForeignKey("birth_charts.id"), nullable=True, index=True)

    # Report Metadata
    report_type = Column(
        SQLEnum(ReportType, values_callable=lambda x: [e.value for e in x], native_enum=False),
        nullable=False,
        index=True
    )
    title = Column(String(255), nullable=False)  # e.g., "Birth Chart Interpretation for John Doe"
    description = Column(Text, nullable=True)  # Short description/summary

    # Report Content
    html_content = Column(Text, nullable=False)  # The actual HTML report
    prompt_used = Column(Text, nullable=True)  # The prompt that generated this report
    model_used = Column(String(100), nullable=True)  # e.g., "claude-3-5-sonnet"

    # Generation Details
    status = Column(
        SQLEnum(ReportStatus, values_callable=lambda x: [e.value for e in x], native_enum=False),
        default=ReportStatus.GENERATING,
        nullable=False
    )
    generation_time_ms = Column(String(20), nullable=True)  # Time taken to generate
    tokens_used = Column(String(20), nullable=True)  # Total tokens used

    # Birth Details (cached for display)
    person_name = Column(String(255), nullable=True)
    birth_date = Column(String(50), nullable=True)
    birth_time = Column(String(50), nullable=True)
    birth_location = Column(String(255), nullable=True)

    # Versioning
    version = Column(String(20), default="1.0", nullable=False)
    parent_report_id = Column(String(36), ForeignKey("ai_generated_reports.id"), nullable=True)  # If regenerated
    is_latest = Column(Boolean, default=True, nullable=False)  # Only latest version is True

    # User Interaction
    view_count = Column(String(20), default="0", nullable=False)
    last_viewed_at = Column(DateTime, nullable=True)
    downloaded_count = Column(String(20), default="0", nullable=False)
    last_downloaded_at = Column(DateTime, nullable=True)

    # User Rating
    user_rating = Column(String(10), nullable=True)  # 1-5 stars
    user_feedback = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="ai_reports")
    chart = relationship("BirthChart", backref="ai_reports")
    parent_report = relationship("AiGeneratedReport", remote_side="AiGeneratedReport.id", backref="regenerations")

    # Indexes for common queries
    __table_args__ = (
        Index('idx_user_report_type', 'user_id', 'report_type'),
        Index('idx_user_latest', 'user_id', 'is_latest'),
        Index('idx_chart_report', 'chart_id', 'report_type'),
    )

    def __repr__(self):
        return f"<AiGeneratedReport(id={self.id}, type={self.report_type}, user={self.user_id})>"

    class Config:
        """Pydantic config."""
        use_enum_values = True


class ReportShare(BaseModel):
    """Model for sharing reports with others."""

    __tablename__ = "ai_report_shares"

    # Report Reference
    report_id = Column(String(36), ForeignKey("ai_generated_reports.id"), nullable=False, index=True)

    # Share Details
    share_token = Column(String(64), unique=True, nullable=False, index=True)  # Unique share link token
    recipient_email = Column(String(255), nullable=True)  # Optional: for email shares
    recipient_name = Column(String(255), nullable=True)

    # Access Control
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    max_views = Column(String(10), nullable=True)  # Optional view limit
    view_count = Column(String(10), default="0", nullable=False)

    # Tracking
    last_accessed_at = Column(DateTime, nullable=True)
    access_ip = Column(String(45), nullable=True)  # Last access IP

    # Relationships
    report = relationship("AiGeneratedReport", backref="shares")

    def __repr__(self):
        return f"<ReportShare(token={self.share_token}, report_id={self.report_id})>"
