"""Custom exception classes for better error handling."""

from typing import Optional, Dict, Any


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Raised when input validation fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=400, details=details)


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=401, details=details)


class AuthorizationError(AppException):
    """Raised when user lacks permission."""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, details=details)


class NotFoundError(AppException):
    """Raised when a resource is not found."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, details=details)


class DatabaseError(AppException):
    """Raised when database operations fail."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message="Database operation failed" if not message else message,
            status_code=500,
            details=details
        )


class ExternalAPIError(AppException):
    """Raised when external API calls fail."""

    def __init__(
        self,
        message: str,
        service: str,
        status_code: int = 502,
        details: Optional[Dict[str, Any]] = None
    ):
        details = details or {}
        details["service"] = service
        super().__init__(message, status_code=status_code, details=details)


class RateLimitError(AppException):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=429, details=details)


class ConfigurationError(AppException):
    """Raised when configuration is invalid or missing."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=500, details=details)
