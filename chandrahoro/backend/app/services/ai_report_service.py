"""Service for managing AI generated reports."""

import logging
import secrets
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.models.ai_report_models import (
    AiGeneratedReport, ReportShare, ReportType, ReportStatus
)
from app.schemas.ai_report_schemas import (
    AiReportCreate, AiReportUpdate, AiReportListItem, RegenerateReportRequest
)

logger = logging.getLogger("chandrahoro")


class AiReportService:
    """Service for managing AI generated reports."""

    async def create_report(
        self,
        db: AsyncSession,
        user_id: str,
        report_data: AiReportCreate
    ) -> AiGeneratedReport:
        """
        Create a new AI report.

        Args:
            db: Database session
            user_id: User ID
            report_data: Report creation data

        Returns:
            Created AiGeneratedReport
        """
        # Check if there's an existing latest report for this chart + type
        if report_data.chart_id:
            await self._mark_previous_versions_as_old(
                db, user_id, report_data.chart_id, report_data.report_type
            )

        # Create new report
        report = AiGeneratedReport(
            user_id=user_id,
            chart_id=report_data.chart_id,
            report_type=report_data.report_type,
            title=report_data.title,
            description=report_data.description,
            html_content=report_data.html_content,
            prompt_used=report_data.prompt_used,
            model_used=report_data.model_used,
            status=ReportStatus.COMPLETED,
            generation_time_ms=report_data.generation_time_ms,
            tokens_used=report_data.tokens_used,
            person_name=report_data.person_name,
            birth_date=report_data.birth_date,
            birth_time=report_data.birth_time,
            birth_location=report_data.birth_location,
            version="1.0",
            is_latest=True,
            view_count="0",
            downloaded_count="0"
        )

        db.add(report)
        await db.commit()
        await db.refresh(report)

        logger.info(f"Created report {report.id} for user {user_id}, type {report_data.report_type}")
        return report

    async def _mark_previous_versions_as_old(
        self,
        db: AsyncSession,
        user_id: str,
        chart_id: str,
        report_type: ReportType
    ):
        """Mark all previous versions of this report type as not latest."""
        stmt = select(AiGeneratedReport).where(
            and_(
                AiGeneratedReport.user_id == user_id,
                AiGeneratedReport.chart_id == chart_id,
                AiGeneratedReport.report_type == report_type,
                AiGeneratedReport.is_latest == True
            )
        )
        result = await db.execute(stmt)
        existing_reports = result.scalars().all()

        for report in existing_reports:
            report.is_latest = False

        await db.commit()

    async def get_user_reports(
        self,
        db: AsyncSession,
        user_id: str,
        report_type: Optional[ReportType] = None,
        chart_id: Optional[str] = None,
        only_latest: bool = True,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[AiGeneratedReport], int]:
        """
        Get user's reports with filtering and pagination.

        Args:
            db: Database session
            user_id: User ID
            report_type: Optional filter by report type
            chart_id: Optional filter by chart
            only_latest: Only return latest versions
            page: Page number (1-indexed)
            page_size: Items per page

        Returns:
            Tuple of (reports list, total count)
        """
        # Build query
        conditions = [AiGeneratedReport.user_id == user_id]

        if report_type:
            conditions.append(AiGeneratedReport.report_type == report_type)

        if chart_id:
            conditions.append(AiGeneratedReport.chart_id == chart_id)

        if only_latest:
            conditions.append(AiGeneratedReport.is_latest == True)

        # Count total
        count_stmt = select(func.count(AiGeneratedReport.id)).where(and_(*conditions))
        result = await db.execute(count_stmt)
        total = result.scalar() or 0

        # Get paginated results
        stmt = (
            select(AiGeneratedReport)
            .where(and_(*conditions))
            .order_by(desc(AiGeneratedReport.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await db.execute(stmt)
        reports = result.scalars().all()

        return list(reports), total

    async def get_report_by_id(
        self,
        db: AsyncSession,
        report_id: str,
        user_id: Optional[str] = None
    ) -> Optional[AiGeneratedReport]:
        """
        Get a specific report by ID.

        Args:
            db: Database session
            report_id: Report ID
            user_id: Optional user ID for ownership check

        Returns:
            AiGeneratedReport or None
        """
        stmt = select(AiGeneratedReport).where(AiGeneratedReport.id == report_id)

        if user_id:
            stmt = stmt.where(AiGeneratedReport.user_id == user_id)

        result = await db.execute(stmt)
        report = result.scalar_one_or_none()

        # Increment view count
        if report:
            current_count = int(report.view_count or "0")
            report.view_count = str(current_count + 1)
            report.last_viewed_at = datetime.utcnow()
            await db.commit()
            await db.refresh(report)

        return report

    async def update_report(
        self,
        db: AsyncSession,
        report_id: str,
        user_id: str,
        update_data: AiReportUpdate
    ) -> Optional[AiGeneratedReport]:
        """
        Update report metadata (not content).

        Args:
            db: Database session
            report_id: Report ID
            user_id: User ID (for ownership check)
            update_data: Update data

        Returns:
            Updated report or None
        """
        report = await self.get_report_by_id(db, report_id, user_id)

        if not report:
            return None

        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(report, field, value)

        await db.commit()
        await db.refresh(report)

        logger.info(f"Updated report {report_id}")
        return report

    async def delete_report(
        self,
        db: AsyncSession,
        report_id: str,
        user_id: str
    ) -> bool:
        """
        Delete a report.

        Args:
            db: Database session
            report_id: Report ID
            user_id: User ID (for ownership check)

        Returns:
            True if deleted, False if not found
        """
        report = await self.get_report_by_id(db, report_id, user_id)

        if not report:
            return False

        await db.delete(report)
        await db.commit()

        logger.info(f"Deleted report {report_id}")
        return True

    async def increment_download_count(
        self,
        db: AsyncSession,
        report_id: str
    ):
        """Increment download count for a report."""
        stmt = select(AiGeneratedReport).where(AiGeneratedReport.id == report_id)
        result = await db.execute(stmt)
        report = result.scalar_one_or_none()

        if report:
            current_count = int(report.downloaded_count or "0")
            report.downloaded_count = str(current_count + 1)
            report.last_downloaded_at = datetime.utcnow()
            await db.commit()

    async def regenerate_report(
        self,
        db: AsyncSession,
        report_id: str,
        user_id: str,
        regenerate_data: RegenerateReportRequest,
        ai_service: Any  # AiService instance for regeneration
    ) -> Optional[AiGeneratedReport]:
        """
        Regenerate an existing report with new AI content.

        Args:
            db: Database session
            report_id: Original report ID
            user_id: User ID
            regenerate_data: Regeneration parameters
            ai_service: AI service instance

        Returns:
            New regenerated report or None
        """
        # Get original report
        original_report = await self.get_report_by_id(db, report_id, user_id)

        if not original_report:
            return None

        # Mark original as not latest
        original_report.is_latest = False

        # Calculate new version
        version_parts = original_report.version.split('.')
        major, minor = int(version_parts[0]), int(version_parts[1])
        new_version = f"{major}.{minor + 1}"

        # TODO: Call AI service to regenerate content
        # For now, we'll create a placeholder
        # In actual implementation, this should call ai_service.generate_interpretation()

        new_report = AiGeneratedReport(
            user_id=user_id,
            chart_id=original_report.chart_id,
            report_type=original_report.report_type,
            title=original_report.title,
            description=original_report.description,
            html_content=original_report.html_content,  # Will be replaced with new AI generation
            prompt_used=regenerate_data.custom_prompt or original_report.prompt_used,
            model_used=regenerate_data.model_override or original_report.model_used,
            status=ReportStatus.COMPLETED,
            person_name=original_report.person_name,
            birth_date=original_report.birth_date,
            birth_time=original_report.birth_time,
            birth_location=original_report.birth_location,
            version=new_version,
            parent_report_id=report_id,
            is_latest=True,
            view_count="0",
            downloaded_count="0"
        )

        db.add(new_report)
        await db.commit()
        await db.refresh(new_report)

        logger.info(f"Regenerated report {report_id} as new report {new_report.id}")
        return new_report

    async def create_share_link(
        self,
        db: AsyncSession,
        report_id: str,
        user_id: str,
        share_data: Dict[str, Any]
    ) -> Optional[ReportShare]:
        """
        Create a shareable link for a report.

        Args:
            db: Database session
            report_id: Report ID
            user_id: User ID (for ownership check)
            share_data: Share configuration

        Returns:
            ReportShare or None
        """
        # Verify report ownership
        report = await self.get_report_by_id(db, report_id, user_id)

        if not report:
            return None

        # Generate unique share token
        share_token = secrets.token_urlsafe(32)

        share = ReportShare(
            report_id=report_id,
            share_token=share_token,
            recipient_email=share_data.get('recipient_email'),
            recipient_name=share_data.get('recipient_name'),
            is_active=True,
            expires_at=share_data.get('expires_at'),
            max_views=share_data.get('max_views'),
            view_count="0"
        )

        db.add(share)
        await db.commit()
        await db.refresh(share)

        logger.info(f"Created share link for report {report_id}")
        return share

    async def get_user_stats(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get statistics about user's reports.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Dictionary of statistics
        """
        # Total reports
        count_stmt = select(func.count(AiGeneratedReport.id)).where(
            and_(
                AiGeneratedReport.user_id == user_id,
                AiGeneratedReport.is_latest == True
            )
        )
        result = await db.execute(count_stmt)
        total_reports = result.scalar() or 0

        # Reports by type
        type_stmt = select(
            AiGeneratedReport.report_type,
            func.count(AiGeneratedReport.id)
        ).where(
            and_(
                AiGeneratedReport.user_id == user_id,
                AiGeneratedReport.is_latest == True
            )
        ).group_by(AiGeneratedReport.report_type)

        result = await db.execute(type_stmt)
        reports_by_type = {row[0]: row[1] for row in result.all()}

        # Total views and downloads
        stats_stmt = select(
            func.sum(func.cast(AiGeneratedReport.view_count, func.Integer())),
            func.sum(func.cast(AiGeneratedReport.downloaded_count, func.Integer())),
            func.max(AiGeneratedReport.created_at)
        ).where(AiGeneratedReport.user_id == user_id)

        result = await db.execute(stats_stmt)
        row = result.one()

        return {
            "total_reports": total_reports,
            "reports_by_type": reports_by_type,
            "total_views": row[0] or 0,
            "total_downloads": row[1] or 0,
            "latest_report_date": row[2],
            "favorite_report_type": max(reports_by_type.items(), key=lambda x: x[1])[0] if reports_by_type else None
        }
