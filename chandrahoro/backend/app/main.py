"""Main FastAPI application for Chandrahoro Vedic Horoscope Chart Pack."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.logging_config import LoggingMiddleware, logger
from app.core.database import init_db, close_db
from app.core.exceptions import AppException
import logging
from dotenv import load_dotenv
import os
import traceback

# Load environment variables from .env file
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Chandrahoro API",
    description="Vedic Horoscope Chart Pack Application - Astronomical calculations and chart generation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# CORS middleware
import os

# Get allowed origins from environment variable or use defaults
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:3007",
        "http://localhost:8000",
        # Azure frontend
        "http://chandrahoro-app.westus2.azurecontainer.io:3000",
        # Production domain
        "https://valuestream.in",
        "https://www.valuestream.in",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions."""
    logger.error(
        f"Application error: {exc.message}",
        extra={
            "path": str(request.url),
            "method": request.method,
            "status_code": exc.status_code,
            "details": exc.details
        }
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "type": exc.__class__.__name__,
            "path": str(request.url),
            **exc.details
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": str(request.url),
            "method": request.method,
            "traceback": traceback.format_exc()
        },
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred",
            "type": exc.__class__.__name__,
            "path": str(request.url)
        }
    )


# Import methodologies to register them
from app.core import parashara_methodology, kp_methodology, western_methodology


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}. Running in demo mode.")

    # Log registered methodologies
    from app.core.base_methodology import MethodologyRegistry
    registered_methodologies = MethodologyRegistry.list_available()
    logger.info(f"Registered methodologies: {registered_methodologies}")

    logger.info("Application started")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database on shutdown."""
    await close_db()
    logger.info("Application shutdown")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Chandrahoro API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "chandrahoro-api",
        "version": "0.1.0"
    }


@app.get("/api/v1/health")
async def api_health_check():
    """API v1 health check."""
    return {
        "status": "healthy",
        "api_version": "v1"
    }


# Include API routers
from app.api.v1 import chart, locations, transits, ai, auth, charts, profiles, timeline, calibration, journal, comparison, synergy, roles, candidates, teams, pipeline, corporate_dashboard, privacy, stock_universe, research_session, horoscope_generation, feature_extraction, feature_aggregation, price_data, prediction_metrics, research_dashboard, research_export, research_safety, performance_optimization, security_hardening, documentation, testing_qa, deployment, llm, methodologies, ai_prompts, ai_reports

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chart.router, prefix="/api/v1/chart", tags=["charts"])
app.include_router(charts.router, prefix="/api/v1", tags=["charts"])
app.include_router(methodologies.router, prefix="/api/v1/methodologies", tags=["methodologies"])
app.include_router(profiles.router, prefix="/api/v1", tags=["profiles"])
app.include_router(timeline.router, prefix="/api/v1", tags=["timeline"])
app.include_router(calibration.router, prefix="/api/v1", tags=["calibration"])
app.include_router(journal.router, prefix="/api/v1", tags=["journal"])
app.include_router(comparison.router, prefix="/api/v1", tags=["comparison"])
app.include_router(synergy.router, prefix="/api/v1", tags=["synergy"])
app.include_router(roles.router, prefix="/api/v1", tags=["roles"])
app.include_router(candidates.router, prefix="/api/v1", tags=["candidates"])
app.include_router(teams.router, prefix="/api/v1", tags=["teams"])
app.include_router(pipeline.router, prefix="/api/v1", tags=["pipeline"])
app.include_router(corporate_dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(privacy.router, prefix="/api/v1", tags=["privacy"])
app.include_router(stock_universe.router, prefix="/api/v1", tags=["stock_universe"])
app.include_router(research_session.router, prefix="/api/v1", tags=["research_session"])
app.include_router(horoscope_generation.router, prefix="/api/v1", tags=["horoscope_generation"])
app.include_router(feature_extraction.router, prefix="/api/v1", tags=["feature_extraction"])
app.include_router(feature_aggregation.router, prefix="/api/v1", tags=["feature_aggregation"])
app.include_router(price_data.router, prefix="/api/v1", tags=["price_data"])
app.include_router(prediction_metrics.router, prefix="/api/v1", tags=["prediction_metrics"])
app.include_router(research_dashboard.router, prefix="/api/v1", tags=["research_dashboard"])
app.include_router(research_export.router, prefix="/api/v1", tags=["research_export"])
app.include_router(research_safety.router, prefix="/api/v1", tags=["research_safety"])
app.include_router(performance_optimization.router, prefix="/api/v1", tags=["performance_optimization"])
app.include_router(security_hardening.router, prefix="/api/v1", tags=["security_hardening"])
app.include_router(documentation.router, prefix="/api/v1", tags=["documentation"])
app.include_router(testing_qa.router, prefix="/api/v1", tags=["testing_qa"])
app.include_router(deployment.router, prefix="/api/v1", tags=["deployment"])
app.include_router(locations.router, prefix="/api/v1/locations", tags=["locations"])
app.include_router(transits.router, prefix="/api/v1", tags=["transits"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(llm.router, prefix="/api/v1/llm", tags=["llm"])
app.include_router(ai_prompts.router, prefix="/api/v1", tags=["ai-prompts"])
app.include_router(ai_reports.router, prefix="/api/v1/ai-reports", tags=["ai-reports"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )