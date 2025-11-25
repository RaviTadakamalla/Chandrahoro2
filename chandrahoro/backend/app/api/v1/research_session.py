"""Research session management API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, time
from app.core.rbac import get_current_user
from app.models import User
from app.services.research_session_service import ResearchSessionManager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
session_manager = ResearchSessionManager()


class CreateSessionRequest(BaseModel):
    """Create session request."""
    universe_key: str = Field(..., description="Stock universe key")
    seed: int = Field(..., description="Random seed for reproducibility")
    date_range_start: str = Field(..., description="Start date (ISO format)")
    date_range_end: str = Field(..., description="End date (ISO format)")
    time_range_start: str = Field(..., description="Start time (HH:MM:SS)")
    time_range_end: str = Field(..., description="End time (HH:MM:SS)")
    location: str = Field(..., description="Location for horoscope generation")
    feature_weights: Optional[Dict[str, float]] = Field(None, description="Feature weights")


class SessionResponse(BaseModel):
    """Session response."""
    session_id: str
    user_id: str
    universe_key: str
    seed: int
    status: str


class AddResultRequest(BaseModel):
    """Add result request."""
    stock_symbol: str = Field(..., description="Stock symbol")
    astrological_score: float = Field(..., description="Astrological score (0-1)")
    predicted_return: float = Field(..., description="Predicted return (%)")
    confidence: float = Field(..., description="Confidence level (0-1)")


@router.post("/research-sessions", response_model=SessionResponse)
async def create_research_session(
    request: CreateSessionRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Create a new research session.
    
    Args:
        request: Create session request
        user: Current user
        
    Returns:
        Created session
    """
    try:
        date_start = datetime.fromisoformat(request.date_range_start)
        date_end = datetime.fromisoformat(request.date_range_end)
        time_start = datetime.fromisoformat(f"2000-01-01T{request.time_range_start}").time()
        time_end = datetime.fromisoformat(f"2000-01-01T{request.time_range_end}").time()
        
        result = session_manager.create_session(
            user.id,
            request.universe_key,
            request.seed,
            date_start,
            date_end,
            time_start,
            time_end,
            request.location,
            request.feature_weights,
        )
        
        logger.info(f"Created research session for user {user.id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/research-sessions")
async def list_research_sessions(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    List research sessions for current user.
    
    Args:
        user: Current user
        
    Returns:
        List of sessions
    """
    sessions = session_manager.list_sessions(user.id)
    
    logger.info(f"Listed {len(sessions)} research sessions for user {user.id}")
    
    return {
        "total": len(sessions),
        "sessions": sessions,
    }


@router.get("/research-sessions/{session_id}")
async def get_research_session(
    session_id: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a research session.
    
    Args:
        session_id: Session ID
        user: Current user
        
    Returns:
        Session summary
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session or session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        summary = session_manager.get_session_summary(session_id)
        
        logger.info(f"Retrieved research session {session_id}")
        
        return summary
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put("/research-sessions/{session_id}/status")
async def update_session_status(
    session_id: str,
    status: str = Query(..., description="New status"),
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Update session status.
    
    Args:
        session_id: Session ID
        status: New status
        user: Current user
        
    Returns:
        Updated session
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session or session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        result = session_manager.update_session_status(session_id, status)
        
        logger.info(f"Updated session {session_id} status to {status}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/research-sessions/{session_id}/results")
async def add_session_result(
    session_id: str,
    request: AddResultRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Add result to a research session.
    
    Args:
        session_id: Session ID
        request: Add result request
        user: Current user
        
    Returns:
        Added result
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session or session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        result_data = {
            "astrological_score": request.astrological_score,
            "predicted_return": request.predicted_return,
            "confidence": request.confidence,
            "added_at": datetime.now().isoformat(),
        }
        
        result = session_manager.add_session_result(
            session_id,
            request.stock_symbol,
            result_data,
        )
        
        logger.info(f"Added result for {request.stock_symbol} to session {session_id}")
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/research-sessions/{session_id}/results")
async def get_session_results(
    session_id: str,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get all results for a research session.
    
    Args:
        session_id: Session ID
        user: Current user
        
    Returns:
        Session results
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session or session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        results = session_manager.get_session_results(session_id)
        
        logger.info(f"Retrieved {results['total_results']} results from session {session_id}")
        
        return results
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

