"""Rate limiting utilities."""

import time
from typing import Dict, Tuple
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        """Initialize rate limiter."""
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed.
        
        Args:
            key: Rate limit key (e.g., IP address, user ID)
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        now = time.time()
        window_start = now - window_seconds
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if req_time > window_start
        ]
        
        # Check if allowed
        current_count = len(self.requests[key])
        is_allowed = current_count < max_requests
        
        if is_allowed:
            self.requests[key].append(now)
        
        # Calculate rate limit info
        remaining = max(0, max_requests - current_count - (1 if is_allowed else 0))
        reset_time = int(self.requests[key][0] + window_seconds) if self.requests[key] else int(now + window_seconds)
        
        rate_limit_info = {
            "limit": max_requests,
            "remaining": remaining,
            "reset": reset_time,
        }
        
        return is_allowed, rate_limit_info


# Global rate limiter instance
_rate_limiter = RateLimiter()


def check_rate_limit(
    key: str,
    max_requests: int = 10,
    window_seconds: int = 3600,
) -> Tuple[bool, Dict[str, int]]:
    """
    Check if request is allowed.
    
    Args:
        key: Rate limit key
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        Tuple of (is_allowed, rate_limit_info)
    """
    return _rate_limiter.is_allowed(key, max_requests, window_seconds)


# Common rate limit configurations
RATE_LIMITS = {
    "chart_calculation": {"max_requests": 10, "window_seconds": 3600},  # 10 per hour
    "ai_interpretation": {"max_requests": 5, "window_seconds": 3600},   # 5 per hour
    "api_general": {"max_requests": 100, "window_seconds": 3600},       # 100 per hour
    "auth": {"max_requests": 5, "window_seconds": 300},                 # 5 per 5 minutes
}

