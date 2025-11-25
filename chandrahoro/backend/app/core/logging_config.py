"""Logging configuration."""

import logging
import json
from datetime import datetime
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

# Configure structured logging
class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def setup_logging():
    """Set up structured logging."""
    # Create logger
    logger = logging.getLogger("chandrahoro")
    logger.setLevel(logging.INFO)
    
    # Create console handler
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = JSONFormatter()
    handler.setFormatter(formatter)
    
    # Add handler
    logger.addHandler(handler)
    
    return logger


# Create logger
logger = setup_logging()


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response."""
        # Request info
        request_id = request.headers.get("X-Request-ID", "unknown")
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        
        # Start time
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {method} {path}",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "client_ip": client_ip,
            }
        )
        
        try:
            # Call next middleware
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {method} {path} - {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "duration_ms": duration * 1000,
                }
            )
            
            # Add headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(duration)
            
            return response
        
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time
            
            # Log error
            logger.error(
                f"Error: {method} {path} - {str(e)}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "duration_ms": duration * 1000,
                    "error": str(e),
                },
                exc_info=True,
            )
            
            raise

