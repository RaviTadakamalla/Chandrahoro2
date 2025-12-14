"""API endpoints for AI generated reports."""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.ai_report_models import ReportType
from app.schemas.ai_report_schemas import (
    AiReportCreate, AiReportUpdate, AiReportResponse, AiReportListResponse,
    RegenerateReportRequest, RegenerateReportResponse,
    ReportShareCreate, ReportShareResponse, ReportStatsResponse
)
from app.services.ai_report_service import AiReportService

logger = logging.getLogger("chandrahoro")
router = APIRouter()
ai_report_service = AiReportService()


@router.post("/", response_model=AiReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: AiReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create and save a new AI-generated report.

    This endpoint is called automatically after AI generation to persist the report.
    """
    try:
        report = await ai_report_service.create_report(
            db=db,
            user_id=current_user.id,
            report_data=report_data
        )

        return AiReportResponse.model_validate(report)

    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save report"
        )


@router.get("/", response_model=AiReportListResponse)
async def list_user_reports(
    report_type: Optional[ReportType] = None,
    chart_id: Optional[str] = None,
    only_latest: bool = True,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of user's AI reports with filtering and pagination.

    Query Parameters:
    - report_type: Filter by report type (optional)
    - chart_id: Filter by chart ID (optional)
    - only_latest: Only return latest versions (default: true)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    """
    # Validate page_size
    if page_size > 100:
        page_size = 100

    try:
        reports, total = await ai_report_service.get_user_reports(
            db=db,
            user_id=current_user.id,
            report_type=report_type,
            chart_id=chart_id,
            only_latest=only_latest,
            page=page,
            page_size=page_size
        )

        return AiReportListResponse(
            reports=[AiReportResponse.model_validate(r) for r in reports],
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )

    except Exception as e:
        logger.error(f"Error listing reports: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve reports"
        )


@router.get("/{report_id}", response_model=AiReportResponse)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific report by ID.

    This endpoint also increments the view count.
    """
    report = await ai_report_service.get_report_by_id(
        db=db,
        report_id=report_id,
        user_id=current_user.id
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return AiReportResponse.model_validate(report)


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Download report as HTML file.

    Returns the HTML content with appropriate headers for download.
    """
    report = await ai_report_service.get_report_by_id(
        db=db,
        report_id=report_id,
        user_id=current_user.id
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Increment download count
    await ai_report_service.increment_download_count(db=db, report_id=report_id)

    # Generate filename
    filename = f"{report.title.replace(' ', '_')}_{report.created_at.strftime('%Y%m%d')}.html"

    # Return HTML content with download headers
    return Response(
        content=report.html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.put("/{report_id}", response_model=AiReportResponse)
async def update_report(
    report_id: str,
    update_data: AiReportUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update report metadata (title, description, rating, feedback).

    This endpoint does not modify the HTML content.
    """
    report = await ai_report_service.update_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        update_data=update_data
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return AiReportResponse.model_validate(report)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a report permanently.
    """
    success = await ai_report_service.delete_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{report_id}/regenerate", response_model=RegenerateReportResponse)
async def regenerate_report(
    report_id: str,
    regenerate_data: RegenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerate an existing report with new AI content.

    This creates a new version of the report while keeping the original.
    The new version becomes the "latest" version.

    Note: Actual AI regeneration implementation pending.
    """
    # TODO: Integrate with ai_service for actual regeneration
    # For now, this creates a new version with the same content

    new_report = await ai_report_service.regenerate_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        regenerate_data=regenerate_data,
        ai_service=None  # Will be injected when implemented
    )

    if not new_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original report not found"
        )

    return RegenerateReportResponse(
        success=True,
        new_report_id=new_report.id,
        message=f"Report regenerated successfully. New version: {new_report.version}",
        report=AiReportResponse.model_validate(new_report)
    )


@router.post("/{report_id}/share", response_model=ReportShareResponse)
async def create_share_link(
    report_id: str,
    share_data: ReportShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a shareable link for a report.

    The link can be configured with:
    - Expiration date
    - Maximum number of views
    - Recipient information (optional)
    """
    share = await ai_report_service.create_share_link(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
        share_data=share_data.model_dump()
    )

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Generate share URL (adjust domain as needed)
    share_url = f"/shared/reports/{share.share_token}"

    response = ReportShareResponse.model_validate(share)
    response.share_url = share_url

    return response


@router.get("/stats/summary", response_model=ReportStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics about user's reports.

    Returns:
    - Total number of reports
    - Reports by type
    - Total views and downloads
    - Latest report date
    - Favorite report type
    """
    stats = await ai_report_service.get_user_stats(
        db=db,
        user_id=current_user.id
    )

    return ReportStatsResponse(**stats)
