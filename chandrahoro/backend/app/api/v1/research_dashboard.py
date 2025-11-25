"""Research dashboard API endpoints."""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from app.core.rbac import get_current_user
from app.models import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class SessionDashboardRequest(BaseModel):
    """Session dashboard request."""
    session_id: str = Field(..., description="Session ID")
    results: List[Dict[str, Any]] = Field(..., description="Session results")


@router.post("/research-dashboard/session")
async def get_session_dashboard(
    request: SessionDashboardRequest,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get session dashboard.
    
    Args:
        request: Session dashboard request
        user: Current user
        
    Returns:
        Session dashboard
    """
    if not request.results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results are required",
        )
    
    # Calculate statistics
    scores = [r.get("astrological_score", 0) for r in request.results]
    recommendations = [r.get("recommendation", "") for r in request.results]
    
    avg_score = sum(scores) / len(scores) if scores else 0
    
    recommendation_counts = {}
    for rec in recommendations:
        recommendation_counts[rec] = recommendation_counts.get(rec, 0) + 1
    
    logger.info(f"Generated dashboard for session {request.session_id}")
    
    return {
        "session_id": request.session_id,
        "total_stocks": len(request.results),
        "average_score": round(avg_score, 3),
        "min_score": round(min(scores), 3) if scores else 0,
        "max_score": round(max(scores), 3) if scores else 0,
        "recommendation_distribution": recommendation_counts,
        "top_stocks": sorted(request.results, key=lambda x: x.get("astrological_score", 0), reverse=True)[:10],
    }


@router.post("/research-dashboard/leaderboard")
async def get_leaderboard(
    sessions: List[Dict[str, Any]] = None,
    top_n: int = Query(10, description="Number of top sessions"),
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get leaderboard of sessions.
    
    Args:
        sessions: List of sessions
        top_n: Number of top sessions
        user: Current user
        
    Returns:
        Leaderboard
    """
    if not sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessions are required",
        )
    
    # Sort by average score
    ranked = sorted(
        sessions,
        key=lambda x: x.get("average_score", 0),
        reverse=True
    )[:top_n]
    
    # Add rank
    for rank, session in enumerate(ranked, 1):
        session["rank"] = rank
    
    logger.info(f"Generated leaderboard with {len(ranked)} sessions")
    
    return {
        "total_sessions": len(sessions),
        "leaderboard": ranked,
    }


@router.post("/research-dashboard/outcome-tracking")
async def get_outcome_tracking(
    results: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get outcome tracking.
    
    Args:
        results: List of results
        user: Current user
        
    Returns:
        Outcome tracking
    """
    if not results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results are required",
        )
    
    # Track outcomes by recommendation
    outcomes = {}
    for result in results:
        rec = result.get("recommendation", "UNKNOWN")
        if rec not in outcomes:
            outcomes[rec] = {"count": 0, "avg_return": 0, "total_return": 0}
        
        outcomes[rec]["count"] += 1
        outcomes[rec]["total_return"] += result.get("actual_return", 0)
    
    # Calculate averages
    for rec in outcomes:
        if outcomes[rec]["count"] > 0:
            outcomes[rec]["avg_return"] = outcomes[rec]["total_return"] / outcomes[rec]["count"]
    
    logger.info(f"Generated outcome tracking for {len(results)} results")
    
    return {
        "total_results": len(results),
        "outcomes": outcomes,
    }


@router.post("/research-dashboard/feature-analysis")
async def get_feature_analysis(
    results: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get feature analysis.
    
    Args:
        results: List of results
        user: Current user
        
    Returns:
        Feature analysis
    """
    if not results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results are required",
        )
    
    # Aggregate features
    feature_importance = {}
    
    for result in results:
        features = result.get("feature_breakdown", {})
        for feature, value in features.items():
            if feature not in feature_importance:
                feature_importance[feature] = []
            feature_importance[feature].append(value)
    
    # Calculate average importance
    avg_importance = {}
    for feature, values in feature_importance.items():
        avg_importance[feature] = round(sum(values) / len(values), 3)
    
    logger.info(f"Generated feature analysis for {len(results)} results")
    
    return {
        "total_results": len(results),
        "feature_importance": avg_importance,
    }


@router.post("/research-dashboard/multi-session-comparison")
async def get_multi_session_comparison(
    sessions: List[Dict[str, Any]] = None,
    user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get multi-session comparison.
    
    Args:
        sessions: List of sessions
        user: Current user
        
    Returns:
        Multi-session comparison
    """
    if not sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessions are required",
        )
    
    # Compare metrics across sessions
    comparison = {
        "total_sessions": len(sessions),
        "average_hit_rate": 0,
        "average_sharpe_ratio": 0,
        "best_session": None,
        "worst_session": None,
    }
    
    if sessions:
        hit_rates = [s.get("hit_rate", 0) for s in sessions]
        sharpe_ratios = [s.get("sharpe_ratio", 0) for s in sessions]
        
        comparison["average_hit_rate"] = round(sum(hit_rates) / len(hit_rates), 3)
        comparison["average_sharpe_ratio"] = round(sum(sharpe_ratios) / len(sharpe_ratios), 3)
        
        comparison["best_session"] = max(sessions, key=lambda x: x.get("hit_rate", 0))
        comparison["worst_session"] = min(sessions, key=lambda x: x.get("hit_rate", 0))
    
    logger.info(f"Generated multi-session comparison for {len(sessions)} sessions")
    
    return comparison

