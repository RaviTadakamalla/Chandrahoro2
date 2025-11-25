"""Research safety and disclaimers API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class DisclaimerAcknowledgment(BaseModel):
    """Disclaimer acknowledgment."""
    user_id: str = Field(..., description="User ID")
    acknowledged: bool = Field(..., description="Acknowledged")
    quiz_passed: bool = Field(..., description="Quiz passed")


class RateLimitCheck(BaseModel):
    """Rate limit check."""
    user_id: str = Field(..., description="User ID")
    session_count: int = Field(0, description="Session count")
    limit: int = Field(10, description="Daily limit")


# In-memory storage for disclaimers and rate limits
disclaimer_acknowledgments: Dict[str, Dict[str, Any]] = {}
rate_limits: Dict[str, Dict[str, Any]] = {}


@router.get("/research-safety/disclaimer")
async def get_disclaimer(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get research disclaimer.
    
    Args:
        user: Current user
        
    Returns:
        Disclaimer text
    """
    disclaimer = {
        "title": "Important Disclaimer",
        "content": """
        This research tool uses astrological analysis for experimental market research purposes only.
        
        IMPORTANT DISCLAIMERS:
        1. Astrological analysis is NOT a reliable predictor of market performance
        2. Past performance does not guarantee future results
        3. This tool is for educational and research purposes only
        4. Do NOT use this for actual investment decisions
        5. Always consult with a qualified financial advisor
        6. The creators assume no liability for any losses
        7. Markets are influenced by many factors beyond astrology
        8. Use at your own risk
        
        By using this tool, you acknowledge that you understand these risks.
        """,
        "version": "1.0",
        "last_updated": datetime.now().isoformat(),
    }
    
    logger.info(f"Retrieved disclaimer for user {user.id}")
    
    return disclaimer


@router.post("/research-safety/acknowledge-disclaimer")
async def acknowledge_disclaimer(
    request: DisclaimerAcknowledgment,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Acknowledge disclaimer.
    
    Args:
        request: Acknowledgment request
        user: Current user
        
    Returns:
        Acknowledgment confirmation
    """
    if not request.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Disclaimer must be acknowledged",
        )
    
    if not request.quiz_passed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz must be passed",
        )
    
    disclaimer_acknowledgments[user.id] = {
        "acknowledged": True,
        "quiz_passed": True,
        "timestamp": datetime.now().isoformat(),
    }
    
    logger.info(f"User {user.id} acknowledged disclaimer")
    
    return {
        "status": "acknowledged",
        "user_id": user.id,
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/research-safety/disclaimer-status")
async def get_disclaimer_status(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get disclaimer acknowledgment status.
    
    Args:
        user: Current user
        
    Returns:
        Status
    """
    status_info = disclaimer_acknowledgments.get(user.id, {})
    
    return {
        "user_id": user.id,
        "acknowledged": status_info.get("acknowledged", False),
        "quiz_passed": status_info.get("quiz_passed", False),
        "timestamp": status_info.get("timestamp"),
    }


@router.get("/research-safety/quiz")
async def get_quiz(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get disclaimer quiz.
    
    Args:
        user: Current user
        
    Returns:
        Quiz questions
    """
    quiz = {
        "questions": [
            {
                "id": 1,
                "question": "Is astrological analysis a reliable predictor of market performance?",
                "options": ["Yes", "No"],
                "correct_answer": "No",
            },
            {
                "id": 2,
                "question": "Should you use this tool for actual investment decisions?",
                "options": ["Yes", "No"],
                "correct_answer": "No",
            },
            {
                "id": 3,
                "question": "What should you do before making investment decisions?",
                "options": ["Consult a financial advisor", "Use this tool", "Ask friends"],
                "correct_answer": "Consult a financial advisor",
            },
        ],
    }
    
    logger.info(f"Retrieved quiz for user {user.id}")
    
    return quiz


@router.post("/research-safety/check-rate-limit")
async def check_rate_limit(
    user: User = Depends(get_current_user),
    daily_limit: int = Query(10, description="Daily session limit"),
) -> Dict[str, Any]:
    """
    Check rate limit for user.
    
    Args:
        user: Current user
        daily_limit: Daily limit
        
    Returns:
        Rate limit status
    """
    if user.id not in rate_limits:
        rate_limits[user.id] = {
            "session_count": 0,
            "reset_time": (datetime.now() + timedelta(days=1)).isoformat(),
        }
    
    limit_info = rate_limits[user.id]
    session_count = limit_info.get("session_count", 0)
    
    if session_count >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit of {daily_limit} sessions exceeded",
        )
    
    logger.info(f"Rate limit check for user {user.id}: {session_count}/{daily_limit}")
    
    return {
        "user_id": user.id,
        "session_count": session_count,
        "daily_limit": daily_limit,
        "remaining": daily_limit - session_count,
        "reset_time": limit_info.get("reset_time"),
    }


@router.post("/research-safety/increment-session-count")
async def increment_session_count(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Increment session count for rate limiting.
    
    Args:
        user: Current user
        
    Returns:
        Updated count
    """
    if user.id not in rate_limits:
        rate_limits[user.id] = {
            "session_count": 0,
            "reset_time": (datetime.now() + timedelta(days=1)).isoformat(),
        }
    
    rate_limits[user.id]["session_count"] += 1
    
    logger.info(f"Incremented session count for user {user.id}")
    
    return {
        "user_id": user.id,
        "session_count": rate_limits[user.id]["session_count"],
    }


@router.get("/research-safety/watermark")
async def get_watermark(
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get watermark for exports.
    
    Args:
        user: Current user
        
    Returns:
        Watermark text
    """
    watermark = {
        "text": "FOR RESEARCH PURPOSES ONLY - NOT FOR INVESTMENT DECISIONS",
        "disclaimer": "This analysis is based on astrological calculations and should not be used for actual investment decisions.",
        "timestamp": datetime.now().isoformat(),
    }
    
    logger.info(f"Generated watermark for user {user.id}")
    
    return watermark

