"""Pydantic schemas for AI generated reports."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.ai_report_models import ReportType, ReportStatus


class AiReportCreate(BaseModel):
    """Schema for creating a new AI report."""

    chart_id: Optional[str] = None
    report_type: ReportType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    html_content: str = Field(..., min_length=1)
    prompt_used: Optional[str] = None
    model_used: Optional[str] = None
    generation_time_ms: Optional[str] = None
    tokens_used: Optional[str] = None

    # Birth details for display
    person_name: Optional[str] = None
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    birth_location: Optional[str] = None


class AiReportUpdate(BaseModel):
    """Schema for updating an AI report."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    user_rating: Optional[str] = None
    user_feedback: Optional[str] = None


class AiReportResponse(BaseModel):
    """Schema for AI report response."""

    id: str
    user_id: str
    chart_id: Optional[str]
    report_type: ReportType
    title: str
    description: Optional[str]
    html_content: str
    prompt_used: Optional[str]
    model_used: Optional[str]
    status: ReportStatus
    generation_time_ms: Optional[str]
    tokens_used: Optional[str]

    # Birth details
    person_name: Optional[str]
    birth_date: Optional[str]
    birth_time: Optional[str]
    birth_location: Optional[str]

    # Versioning
    version: str
    parent_report_id: Optional[str]
    is_latest: bool

    # User interaction
    view_count: str
    last_viewed_at: Optional[datetime]
    downloaded_count: str
    last_downloaded_at: Optional[datetime]

    # User feedback
    user_rating: Optional[str]
    user_feedback: Optional[str]

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class AiReportListItem(BaseModel):
    """Schema for report list item (summary view)."""

    id: str
    report_type: ReportType
    title: str
    description: Optional[str]
    person_name: Optional[str]
    birth_date: Optional[str]
    status: ReportStatus
    version: str
    is_latest: bool
    view_count: str
    downloaded_count: str
    user_rating: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class AiReportListResponse(BaseModel):
    """Schema for paginated report list."""

    reports: List[AiReportListItem]
    total: int
    page: int = 1
    page_size: int = 20
    has_more: bool


class RegenerateReportRequest(BaseModel):
    """Schema for regenerating a report."""

    custom_prompt: Optional[str] = None  # Optional custom prompt override
    model_override: Optional[str] = None  # Optional model override


class RegenerateReportResponse(BaseModel):
    """Schema for regenerate response."""

    success: bool
    new_report_id: str
    message: str
    report: AiReportResponse


class ReportShareCreate(BaseModel):
    """Schema for creating a report share."""

    recipient_email: Optional[str] = None
    recipient_name: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_views: Optional[str] = None


class ReportShareResponse(BaseModel):
    """Schema for report share response."""

    id: str
    report_id: str
    share_token: str
    share_url: str
    recipient_email: Optional[str]
    recipient_name: Optional[str]
    is_active: bool
    expires_at: Optional[datetime]
    max_views: Optional[str]
    view_count: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportStatsResponse(BaseModel):
    """Schema for user's report statistics."""

    total_reports: int
    reports_by_type: dict
    total_views: int
    total_downloads: int
    latest_report_date: Optional[datetime]
    favorite_report_type: Optional[str]
