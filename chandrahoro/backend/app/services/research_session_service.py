"""Research session management service."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime, time
import logging
import uuid

logger = logging.getLogger(__name__)


@dataclass
class ResearchSession:
    """Research session data."""
    session_id: str
    user_id: str
    universe_key: str
    seed: int
    date_range_start: datetime
    date_range_end: datetime
    time_range_start: time
    time_range_end: time
    location: str
    feature_weights: Dict[str, float]
    created_at: datetime
    status: str = "active"  # active, completed, archived
    results: Dict[str, Any] = field(default_factory=dict)


class ResearchSessionManager:
    """Manage research sessions."""
    
    def __init__(self):
        """Initialize research session manager."""
        self.sessions: Dict[str, ResearchSession] = {}
    
    def create_session(
        self,
        user_id: str,
        universe_key: str,
        seed: int,
        date_range_start: datetime,
        date_range_end: datetime,
        time_range_start: time,
        time_range_end: time,
        location: str,
        feature_weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new research session.
        
        Args:
            user_id: User ID
            universe_key: Stock universe key
            seed: Random seed for reproducibility
            date_range_start: Start date for analysis
            date_range_end: End date for analysis
            time_range_start: Start time for analysis
            time_range_end: End time for analysis
            location: Location for horoscope generation
            feature_weights: Weights for astrological features
            
        Returns:
            Created session
        """
        session_id = str(uuid.uuid4())
        
        # Default feature weights
        if feature_weights is None:
            feature_weights = {
                "house_2": 0.10,
                "house_5": 0.10,
                "house_8": 0.10,
                "house_9": 0.15,
                "house_10": 0.20,
                "house_11": 0.15,
                "house_12": 0.10,
                "planetary_strength": 0.05,
                "yogas": 0.05,
            }
        
        session = ResearchSession(
            session_id=session_id,
            user_id=user_id,
            universe_key=universe_key,
            seed=seed,
            date_range_start=date_range_start,
            date_range_end=date_range_end,
            time_range_start=time_range_start,
            time_range_end=time_range_end,
            location=location,
            feature_weights=feature_weights,
            created_at=datetime.now(),
        )
        
        self.sessions[session_id] = session
        
        logger.info(f"Created research session {session_id} for user {user_id}")
        
        return {
            "session_id": session_id,
            "user_id": user_id,
            "universe_key": universe_key,
            "seed": seed,
            "date_range_start": date_range_start.isoformat(),
            "date_range_end": date_range_end.isoformat(),
            "time_range_start": time_range_start.isoformat(),
            "time_range_end": time_range_end.isoformat(),
            "location": location,
            "feature_weights": feature_weights,
            "status": "active",
            "created_at": session.created_at.isoformat(),
        }
    
    def get_session(self, session_id: str) -> Optional[ResearchSession]:
        """
        Get a research session.
        
        Args:
            session_id: Session ID
            
        Returns:
            Research session or None
        """
        return self.sessions.get(session_id)
    
    def list_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        List research sessions for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of sessions
        """
        sessions = []
        for session in self.sessions.values():
            if session.user_id == user_id:
                sessions.append({
                    "session_id": session.session_id,
                    "universe_key": session.universe_key,
                    "seed": session.seed,
                    "status": session.status,
                    "created_at": session.created_at.isoformat(),
                    "results_count": len(session.results),
                })
        
        return sessions
    
    def update_session_status(
        self,
        session_id: str,
        status: str,
    ) -> Dict[str, Any]:
        """
        Update session status.
        
        Args:
            session_id: Session ID
            status: New status (active, completed, archived)
            
        Returns:
            Updated session
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        session.status = status
        
        logger.info(f"Updated session {session_id} status to {status}")
        
        return {
            "session_id": session_id,
            "status": status,
            "updated_at": datetime.now().isoformat(),
        }
    
    def add_session_result(
        self,
        session_id: str,
        stock_symbol: str,
        result_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Add result to a session.
        
        Args:
            session_id: Session ID
            stock_symbol: Stock symbol
            result_data: Result data
            
        Returns:
            Added result
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        session.results[stock_symbol] = result_data
        
        logger.info(f"Added result for {stock_symbol} to session {session_id}")
        
        return {
            "session_id": session_id,
            "stock_symbol": stock_symbol,
            "result_data": result_data,
        }
    
    def get_session_results(self, session_id: str) -> Dict[str, Any]:
        """
        Get all results for a session.
        
        Args:
            session_id: Session ID
            
        Returns:
            Session results
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        return {
            "session_id": session_id,
            "total_results": len(session.results),
            "results": session.results,
        }
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """
        Get session summary.
        
        Args:
            session_id: Session ID
            
        Returns:
            Session summary
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        return {
            "session_id": session_id,
            "user_id": session.user_id,
            "universe_key": session.universe_key,
            "seed": session.seed,
            "status": session.status,
            "created_at": session.created_at.isoformat(),
            "total_results": len(session.results),
            "date_range": {
                "start": session.date_range_start.isoformat(),
                "end": session.date_range_end.isoformat(),
            },
            "time_range": {
                "start": session.time_range_start.isoformat(),
                "end": session.time_range_end.isoformat(),
            },
            "location": session.location,
            "feature_weights": session.feature_weights,
        }

