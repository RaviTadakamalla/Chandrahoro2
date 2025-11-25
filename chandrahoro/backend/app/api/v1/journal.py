"""Journal Entry API endpoints."""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.rate_limit import check_rate_limit, RATE_LIMITS
from app.models import User, BirthChart, JournalEntry
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class JournalEntryRequest(BaseModel):
    """Request model for creating/updating journal entry."""
    entry_date: date = Field(..., description="Date of the entry")
    entry_type: str = Field(..., description="Type: daily, weekly, monthly, event")
    title: Optional[str] = Field(None, description="Entry title")
    content: str = Field(..., description="Entry content")
    wealth_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Wealth rating (1-10)")
    health_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Health rating (1-10)")
    business_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Business rating (1-10)")
    spouse_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Spouse rating (1-10)")
    kids_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Kids rating (1-10)")
    career_rating: Optional[float] = Field(None, ge=1.0, le=10.0, description="Career rating (1-10)")
    mood: Optional[str] = Field(None, description="Mood: happy, neutral, sad, anxious, excited")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    event_markers: Optional[Dict[str, Any]] = Field(None, description="Important events")


class JournalEntryResponse(BaseModel):
    """Response model for journal entry."""
    id: str
    entry_date: date
    entry_type: str
    title: Optional[str]
    content: str
    wealth_rating: Optional[float]
    health_rating: Optional[float]
    business_rating: Optional[float]
    spouse_rating: Optional[float]
    kids_rating: Optional[float]
    career_rating: Optional[float]
    mood: Optional[str]
    tags: Optional[str]
    event_markers: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class JournalListResponse(BaseModel):
    """Response model for journal entry list."""
    chart_id: str
    total_entries: int
    entries: List[JournalEntryResponse]


@router.post("/charts/{chart_id}/journal/entries", response_model=JournalEntryResponse)
async def create_journal_entry(
    chart_id: str,
    request: JournalEntryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a journal entry.
    
    Args:
        chart_id: Birth chart ID
        request: Journal entry data
        user: Current user
        db: Database session
        
    Returns:
        Created journal entry
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Validate entry type
    valid_types = {"daily", "weekly", "monthly", "event"}
    if request.entry_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid entry type: {request.entry_type}",
        )
    
    # Create entry
    entry = JournalEntry(
        user_id=user.id,
        birth_chart_id=chart_id,
        entry_date=request.entry_date,
        entry_type=request.entry_type,
        title=request.title,
        content=request.content,
        wealth_rating=request.wealth_rating,
        health_rating=request.health_rating,
        business_rating=request.business_rating,
        spouse_rating=request.spouse_rating,
        kids_rating=request.kids_rating,
        career_rating=request.career_rating,
        mood=request.mood,
        tags=request.tags,
        event_markers=request.event_markers,
    )
    
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    logger.info(f"Created journal entry for chart {chart_id}")
    
    return JournalEntryResponse(
        id=entry.id,
        entry_date=entry.entry_date,
        entry_type=entry.entry_type,
        title=entry.title,
        content=entry.content,
        wealth_rating=entry.wealth_rating,
        health_rating=entry.health_rating,
        business_rating=entry.business_rating,
        spouse_rating=entry.spouse_rating,
        kids_rating=entry.kids_rating,
        career_rating=entry.career_rating,
        mood=entry.mood,
        tags=entry.tags,
        event_markers=entry.event_markers,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.get("/charts/{chart_id}/journal/entries", response_model=JournalListResponse)
async def list_journal_entries(
    chart_id: str,
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    mood: Optional[str] = Query(None, description="Filter by mood"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    skip: int = Query(0, ge=0, description="Skip entries"),
    limit: int = Query(20, ge=1, le=100, description="Limit entries"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List journal entries with filtering and search.
    
    Args:
        chart_id: Birth chart ID
        start_date: Filter from date
        end_date: Filter to date
        entry_type: Filter by entry type
        mood: Filter by mood
        tags: Filter by tags
        search: Search in title and content
        skip: Skip entries
        limit: Limit entries
        user: Current user
        db: Database session
        
    Returns:
        List of journal entries
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Build query
    filters = [JournalEntry.birth_chart_id == chart_id]
    
    if start_date:
        filters.append(JournalEntry.entry_date >= start_date)
    if end_date:
        filters.append(JournalEntry.entry_date <= end_date)
    if entry_type:
        filters.append(JournalEntry.entry_type == entry_type)
    if mood:
        filters.append(JournalEntry.mood == mood)
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        tag_filters = [JournalEntry.tags.contains(t) for t in tag_list]
        filters.append(or_(*tag_filters))
    if search:
        search_filters = [
            JournalEntry.title.contains(search),
            JournalEntry.content.contains(search),
        ]
        filters.append(or_(*search_filters))
    
    # Get total count
    count_stmt = select(JournalEntry).where(and_(*filters))
    count_result = await db.execute(count_stmt)
    total_entries = len(count_result.scalars().all())
    
    # Get entries
    stmt = select(JournalEntry).where(and_(*filters)).order_by(
        desc(JournalEntry.entry_date)
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    # Convert to response format
    entry_responses = [
        JournalEntryResponse(
            id=e.id,
            entry_date=e.entry_date,
            entry_type=e.entry_type,
            title=e.title,
            content=e.content,
            wealth_rating=e.wealth_rating,
            health_rating=e.health_rating,
            business_rating=e.business_rating,
            spouse_rating=e.spouse_rating,
            kids_rating=e.kids_rating,
            career_rating=e.career_rating,
            mood=e.mood,
            tags=e.tags,
            event_markers=e.event_markers,
            created_at=e.created_at,
            updated_at=e.updated_at,
        )
        for e in entries
    ]
    
    logger.info(f"Retrieved {len(entries)} journal entries for chart {chart_id}")
    
    return JournalListResponse(
        chart_id=chart_id,
        total_entries=total_entries,
        entries=entry_responses,
    )


@router.get("/charts/{chart_id}/journal/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    chart_id: str,
    entry_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get a specific journal entry.
    
    Args:
        chart_id: Birth chart ID
        entry_id: Journal entry ID
        user: Current user
        db: Database session
        
    Returns:
        Journal entry
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Get entry
    stmt = select(JournalEntry).where(
        (JournalEntry.id == entry_id) & (JournalEntry.birth_chart_id == chart_id)
    )
    result = await db.execute(stmt)
    entry = result.scalars().first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found",
        )
    
    return JournalEntryResponse(
        id=entry.id,
        entry_date=entry.entry_date,
        entry_type=entry.entry_type,
        title=entry.title,
        content=entry.content,
        wealth_rating=entry.wealth_rating,
        health_rating=entry.health_rating,
        business_rating=entry.business_rating,
        spouse_rating=entry.spouse_rating,
        kids_rating=entry.kids_rating,
        career_rating=entry.career_rating,
        mood=entry.mood,
        tags=entry.tags,
        event_markers=entry.event_markers,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.put("/charts/{chart_id}/journal/entries/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    chart_id: str,
    entry_id: str,
    request: JournalEntryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update a journal entry.
    
    Args:
        chart_id: Birth chart ID
        entry_id: Journal entry ID
        request: Updated journal entry data
        user: Current user
        db: Database session
        
    Returns:
        Updated journal entry
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Get entry
    stmt = select(JournalEntry).where(
        (JournalEntry.id == entry_id) & (JournalEntry.birth_chart_id == chart_id)
    )
    result = await db.execute(stmt)
    entry = result.scalars().first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found",
        )
    
    # Update entry
    entry.entry_date = request.entry_date
    entry.entry_type = request.entry_type
    entry.title = request.title
    entry.content = request.content
    entry.wealth_rating = request.wealth_rating
    entry.health_rating = request.health_rating
    entry.business_rating = request.business_rating
    entry.spouse_rating = request.spouse_rating
    entry.kids_rating = request.kids_rating
    entry.career_rating = request.career_rating
    entry.mood = request.mood
    entry.tags = request.tags
    entry.event_markers = request.event_markers
    
    await db.commit()
    await db.refresh(entry)
    
    logger.info(f"Updated journal entry {entry_id} for chart {chart_id}")
    
    return JournalEntryResponse(
        id=entry.id,
        entry_date=entry.entry_date,
        entry_type=entry.entry_type,
        title=entry.title,
        content=entry.content,
        wealth_rating=entry.wealth_rating,
        health_rating=entry.health_rating,
        business_rating=entry.business_rating,
        spouse_rating=entry.spouse_rating,
        kids_rating=entry.kids_rating,
        career_rating=entry.career_rating,
        mood=entry.mood,
        tags=entry.tags,
        event_markers=entry.event_markers,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.delete("/charts/{chart_id}/journal/entries/{entry_id}")
async def delete_journal_entry(
    chart_id: str,
    entry_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """
    Delete a journal entry.
    
    Args:
        chart_id: Birth chart ID
        entry_id: Journal entry ID
        user: Current user
        db: Database session
        
    Returns:
        Success message
    """
    # Verify chart ownership
    stmt = select(BirthChart).where(
        (BirthChart.id == chart_id) & (BirthChart.user_id == user.id)
    )
    result = await db.execute(stmt)
    chart = result.scalars().first()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found",
        )
    
    # Get entry
    stmt = select(JournalEntry).where(
        (JournalEntry.id == entry_id) & (JournalEntry.birth_chart_id == chart_id)
    )
    result = await db.execute(stmt)
    entry = result.scalars().first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found",
        )
    
    # Delete entry
    await db.delete(entry)
    await db.commit()
    
    logger.info(f"Deleted journal entry {entry_id} for chart {chart_id}")
    
    return {"message": "Journal entry deleted successfully"}

