"""
AI Interpretation API endpoints for Vedic astrology charts.
Provides chart interpretation and Q&A functionality.
"""

import logging
import os
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai_service import AIService
from app.services.llm_service import LlmService
from app.services.ai_report_service import AiReportService
from app.core.database import get_db
from app.core.rbac import get_current_user
from app.core.exceptions import (
    ValidationError, ConfigurationError, ExternalAPIError,
    DatabaseError, NotFoundError
)
from app.models import User
from app.models.ai_report_models import ReportType, ReportStatus
from app.schemas.ai_report_schemas import AiReportCreate
import time

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
llm_service = LlmService()
ai_report_service = AiReportService()


class ChartInterpretationRequest(BaseModel):
    """Request model for chart interpretation."""
    chart_data: Dict[str, Any]
    include_sections: Optional[List[str]] = None


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    chart_data: Dict[str, Any]
    question: str
    conversation_history: Optional[List[ChatMessage]] = None


class FeedbackRequest(BaseModel):
    """Request model for feedback."""
    interpretation_id: str
    feedback: str  # "positive" or "negative"
    comments: Optional[str] = None


class PartnerDetails(BaseModel):
    """Partner birth details for compatibility analysis."""
    name: str
    birth_date: str  # YYYY-MM-DD format
    birth_time: str  # HH:MM format
    birth_location: str
    latitude: float
    longitude: float
    timezone: str


class CompatibilityRequest(BaseModel):
    """Request model for compatibility analysis."""
    primary_chart_data: Dict[str, Any]
    partner_details: PartnerDetails
    analysis_focus: Optional[List[str]] = None  # e.g., ["emotional", "intellectual", "physical", "spiritual"]


class MatchHoroscopeRequest(BaseModel):
    """Request model for traditional Vedic matchmaking analysis."""
    primary_chart_data: Dict[str, Any]
    partner_details: PartnerDetails


@router.post("/interpret")
async def interpret_chart(
    request: ChartInterpretationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate comprehensive AI interpretation of a Vedic astrology chart.

    Args:
        request: Chart data and interpretation preferences
        current_user: Current authenticated user
        db: Database session

    Returns:
        AI-generated interpretation with sections and metadata
    """
    try:
        start_time = time.time()
        print(f"DEBUG: Starting interpretation for user {current_user.id}")
        logger.info(f"Generating chart interpretation for user {current_user.id}")

        # Debug: Log received chart data
        logger.info("=== Received Chart Data ===")
        logger.info(f"Chart data keys: {list(request.chart_data.keys())}")
        if "birth_info" in request.chart_data:
            birth_info = request.chart_data["birth_info"]
            logger.info(f"Birth info received: {birth_info}")
        else:
            logger.warning("No birth_info in received chart_data!")

        # Get user's LLM configuration
        llm_config = await llm_service.get_config(db, current_user.id)
        if not llm_config:
            raise ConfigurationError(
                "No LLM configuration found. Please configure your AI settings first."
            )

        if not llm_config.is_active:
            raise ConfigurationError(
                "LLM configuration is inactive. Please check your AI settings."
            )

        # Generate interpretation using user's LLM configuration
        result = await llm_service.generate_interpretation(
            db, current_user.id, request.chart_data, request.include_sections
        )

        if not result.get("success"):
            error_code = result.get('error', 'Unknown error')
            error_msg = result.get('message', error_code)

            # Check for encryption key errors
            if error_code == 'API_KEY_ENCRYPTION_ERROR' or 'InvalidToken' in error_code or 'decrypt' in error_code.lower():
                raise ConfigurationError(
                    error_msg if error_code == 'API_KEY_ENCRYPTION_ERROR' else "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                )
            raise ExternalAPIError(
                f"Failed to generate interpretation: {error_msg}",
                service="LLM Service"
            )

        # Auto-save report to database
        report_id = None
        try:
            generation_time_ms = str(int((time.time() - start_time) * 1000))
            birth_info = request.chart_data.get("birth_info", {})

            # Extract chart_id if available
            chart_id = request.chart_data.get("chart_id") or birth_info.get("chart_id")

            # Calculate total tokens
            tokens = result.get("tokens", {})
            total_tokens = str(tokens.get("input", 0) + tokens.get("output", 0))

            # Generate title
            person_name = birth_info.get("name") or birth_info.get("person_name", "User")
            title = f"Vedic Astrology Report - {person_name}"

            # Create report data
            report_data = AiReportCreate(
                chart_id=chart_id,
                report_type=ReportType.CHART_INTERPRETATION,
                title=title,
                description=f"Complete chart interpretation generated on {datetime.utcnow().strftime('%Y-%m-%d')}",
                html_content=result.get("content"),
                prompt_used=None,  # Could be added if we track the prompt
                model_used=result.get("model"),
                generation_time_ms=generation_time_ms,
                tokens_used=total_tokens,
                person_name=person_name,
                birth_date=birth_info.get("date"),
                birth_time=birth_info.get("time"),
                birth_location=birth_info.get("location_name")
            )

            # Save report
            saved_report = await ai_report_service.create_report(
                db=db,
                user_id=current_user.id,
                report_data=report_data
            )

            report_id = saved_report.id
            logger.info(f"Auto-saved report {report_id} for user {current_user.id}")

        except Exception as e:
            logger.error(f"Failed to auto-save report: {e}")
            # Continue even if save fails - user still gets the interpretation

        return {
            "success": True,
            "content": result.get("content"),
            "model": result.get("model"),
            "tokens": result.get("tokens"),
            "timestamp": result.get("timestamp"),
            "report_id": report_id  # Include report ID in response
        }
    
    except (ConfigurationError, ExternalAPIError, DatabaseError):
        raise
    except Exception as e:
        logger.error(f"Error generating interpretation: {e}", exc_info=True)
        # Check for encryption/decryption errors
        error_str = str(e)
        if 'InvalidToken' in error_str or 'decrypt' in error_str.lower() or 'Signature did not match' in error_str:
            raise ConfigurationError(
                "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
            )
        logger.error(f"Unexpected error in AI endpoint: {error_str}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while processing your request",
            service="AI Service",
            details={"error": error_str}
        )


@router.post("/chat")
async def chat_about_chart(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Answer questions about a Vedic astrology chart.

    Args:
        request: Chart data, question, and conversation history
        current_user: Current authenticated user
        db: Database session

    Returns:
        AI-generated answer with context
    """
    try:
        logger.info(f"Processing chart question for user {current_user.id}: {request.question[:50]}...")

        # Get user's LLM configuration
        llm_config = await llm_service.get_config(db, current_user.id)
        if not llm_config:
            raise ConfigurationError(
                "No LLM configuration found. Please configure your AI settings first."
            )

        if not llm_config.is_active:
            raise ConfigurationError(
                "LLM configuration is inactive. Please check your AI settings."
            )
        
        # Convert ChatMessage objects to dicts
        history = []
        if request.conversation_history:
            history = [{"role": msg.role, "content": msg.content}
                      for msg in request.conversation_history]

        # Generate response using user's LLM configuration
        result = await llm_service.generate_chat_response(
            db, current_user.id, request.chart_data, request.question, history
        )

        if not result.get("success"):
            error_msg = result.get('error', 'Unknown error')
            # Check for encryption key errors
            if 'InvalidToken' in error_msg or 'decrypt' in error_msg.lower():
                raise ConfigurationError(
                    "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                )
            raise ExternalAPIError(
                f"Failed to generate response: {error_msg}",
                service="LLM Service"
            )

        return {
            "success": True,
            "answer": result.get("content"),
            "model": result.get("model"),
            "tokens": result.get("tokens"),
            "timestamp": result.get("timestamp")
        }

    except (ConfigurationError, ExternalAPIError, DatabaseError):
        raise
    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        # Check for encryption/decryption errors
        error_str = str(e)
        if 'InvalidToken' in error_str or 'decrypt' in error_str.lower() or 'Signature did not match' in error_str:
            raise ConfigurationError(
                "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
            )
        logger.error(f"Unexpected error in AI endpoint: {error_str}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while processing your request",
            service="AI Service",
            details={"error": error_str}
        )


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit feedback on AI interpretation quality.
    
    Args:
        request: Feedback data
        
    Returns:
        Confirmation of feedback submission
    """
    try:
        logger.info(f"Feedback received: {request.feedback}")
        
        # In a real implementation, this would save to a database
        # For now, just log it
        feedback_data = {
            "interpretation_id": request.interpretation_id,
            "feedback": request.feedback,
            "comments": request.comments,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat()
        }
        
        logger.info(f"Feedback data: {feedback_data}")
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "data": feedback_data
        }
    
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}", exc_info=True)
        raise DatabaseError(
            "Failed to submit feedback. Please try again.",
            details={"error": str(e)}
        )


@router.get("/usage")
async def get_usage_stats(user_id: Optional[str] = Query(None)):
    """
    Get AI usage statistics for a user.
    
    Args:
        user_id: Optional user ID for tracking
        
    Returns:
        Usage statistics including tokens and costs
    """
    try:
        # In a real implementation, this would query a database
        # For now, return placeholder data
        return {
            "success": True,
            "data": {
                "user_id": user_id or "anonymous",
                "total_interpretations": 0,
                "total_questions": 0,
                "total_tokens_used": 0,
                "estimated_cost": 0.0,
                "daily_limit": 10,
                "daily_used": 0,
                "monthly_limit": 100,
                "monthly_used": 0
            },
            "message": "Usage statistics retrieved successfully"
        }
    
    except Exception as e:
        logger.error(f"Error retrieving usage stats: {e}", exc_info=True)
        raise DatabaseError(
            "Failed to retrieve usage statistics. Please try again.",
            details={"error": str(e)}
        )


@router.post("/regenerate")
async def regenerate_interpretation(request: ChartInterpretationRequest):
    """
    Regenerate chart interpretation (alternative version).
    
    Args:
        request: Chart data for regeneration
        
    Returns:
        New AI-generated interpretation
    """
    try:
        logger.info("Regenerating chart interpretation")
        
        # Check if AI is enabled
        if not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
            raise ConfigurationError(
                "AI features are not configured. Please contact the administrator."
            )
        
        # Generate new interpretation
        result = await ai_service.interpret_chart(request.chart_data)
        
        if not result.get("success"):
            raise ExternalAPIError(
                f"Failed to regenerate interpretation: {result.get('error')}",
                service="AI Service"
            )
        
        return {
            "success": True,
            "data": {
                "interpretation": result.get("content"),
                "model": result.get("model"),
                "tokens": result.get("tokens"),
                "timestamp": result.get("timestamp")
            },
            "message": "Chart interpretation regenerated successfully"
        }
    
    except (ConfigurationError, ExternalAPIError):
        raise
    except Exception as e:
        logger.error(f"Error regenerating interpretation: {e}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while regenerating interpretation",
            service="AI Service",
            details={"error": str(e)}
        )


@router.post("/compatibility")
async def analyze_compatibility(
    request: CompatibilityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate compatibility analysis between two Vedic astrology charts.

    Args:
        request: Primary chart data and partner details
        current_user: Current authenticated user
        db: Database session

    Returns:
        AI-generated compatibility analysis
    """
    try:
        logger.info(f"Generating compatibility analysis for user {current_user.id}")

        # Get user's LLM configuration
        llm_config = await llm_service.get_config(db, current_user.id)
        if not llm_config:
            raise ConfigurationError(
                "No LLM configuration found. Please configure your AI settings first."
            )

        if not llm_config.is_active:
            raise ConfigurationError(
                "LLM configuration is inactive. Please check your AI settings."
            )

        # Generate partner's chart data (this would typically involve calling the chart calculation service)
        # For now, we'll pass the partner details to the LLM service
        partner_chart_data = {
            "birth_info": {
                "name": request.partner_details.name,
                "date": request.partner_details.birth_date,
                "time": request.partner_details.birth_time,
                "location": request.partner_details.birth_location,
                "latitude": request.partner_details.latitude,
                "longitude": request.partner_details.longitude,
                "timezone": request.partner_details.timezone
            }
        }

        # Generate compatibility analysis using user's LLM configuration
        result = await llm_service.generate_compatibility_analysis(
            db,
            current_user.id,
            request.primary_chart_data,
            partner_chart_data,
            request.analysis_focus
        )

        if not result.get("success"):
            error_msg = result.get('error', 'Unknown error')
            # Check for encryption key errors
            if 'InvalidToken' in error_msg or 'decrypt' in error_msg.lower():
                raise ConfigurationError(
                    "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                )
            raise ExternalAPIError(
                f"Failed to generate compatibility analysis: {error_msg}",
                service="LLM Service"
            )

        return {
            "success": True,
            "content": result.get("content"),
            "model": result.get("model"),
            "tokens": result.get("tokens"),
            "timestamp": result.get("timestamp"),
            "compatibility_score": result.get("compatibility_score"),
            "key_insights": result.get("key_insights")
        }

    except (ConfigurationError, ExternalAPIError, DatabaseError):
        raise
    except Exception as e:
        logger.error(f"Error generating compatibility analysis: {e}", exc_info=True)
        # Check for encryption/decryption errors
        error_str = str(e)
        if 'InvalidToken' in error_str or 'decrypt' in error_str.lower() or 'Signature did not match' in error_str:
            raise ConfigurationError(
                "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
            )
        logger.error(f"Unexpected error in AI endpoint: {error_str}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while processing your request",
            service="AI Service",
            details={"error": error_str}
        )


@router.post("/match-horoscope")
async def analyze_match_horoscope(
    request: MatchHoroscopeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate traditional Vedic astrology matchmaking analysis with Ashtakoot scoring.

    Args:
        request: Primary chart data and partner details
        current_user: Current authenticated user
        db: Database session

    Returns:
        Traditional matchmaking analysis with detailed Ashtakoot scores
    """
    try:
        from datetime import datetime
        from app.core.ephemeris import EphemerisCalculator, get_sign_name, get_nakshatra_name
        from app.core.ashtakoot import AshtakootCalculator

        logger.info(f"Generating match horoscope analysis for user {current_user.id}")

        # Parse partner's birth details
        partner_birth_date = datetime.strptime(request.partner_details.birth_date, "%Y-%m-%d").date()
        partner_birth_time = datetime.strptime(request.partner_details.birth_time, "%H:%M").time()
        partner_birth_datetime = datetime.combine(partner_birth_date, partner_birth_time)

        # Calculate partner's chart
        ephemeris = EphemerisCalculator(ayanamsha='Lahiri')
        partner_planets = ephemeris.calculate_all_planets(partner_birth_datetime)
        partner_ascendant = ephemeris.calculate_ascendant(
            partner_birth_datetime,
            request.partner_details.latitude,
            request.partner_details.longitude
        )

        # Extract Moon data for both charts
        # Primary person (from chartData)
        primary_moon = None
        primary_moon_sign = None
        primary_nakshatra = None
        primary_nakshatra_num = None
        primary_name = request.primary_chart_data.get('birth_info', {}).get('name', 'Person 1')
        primary_sex = request.primary_chart_data.get('birth_info', {}).get('sex', 'Male')

        if 'planets' in request.primary_chart_data:
            planets = request.primary_chart_data['planets']
            if isinstance(planets, list):
                for planet in planets:
                    if planet.get('name') == 'Moon':
                        primary_moon = planet
                        primary_moon_sign = planet.get('sign', 'Unknown')
                        primary_nakshatra = planet.get('nakshatra', 'Unknown')
                        primary_nakshatra_num = planet.get('nakshatra_number', 1)
                        break

        # Partner (from calculated chart)
        partner_moon = partner_planets.get('Moon', {})
        partner_moon_sign = get_sign_name(partner_moon.get('sign_number', 0))
        partner_nakshatra_num = partner_moon.get('nakshatra_number', 1)
        partner_nakshatra = get_nakshatra_name(partner_nakshatra_num)

        # Determine gender roles for Ashtakoot (traditionally boy/girl)
        if primary_sex.lower() == 'male':
            boy_moon_sign = primary_moon_sign
            boy_nakshatra = primary_nakshatra
            boy_nakshatra_num = primary_nakshatra_num
            girl_moon_sign = partner_moon_sign
            girl_nakshatra = partner_nakshatra
            girl_nakshatra_num = partner_nakshatra_num
            male_name = primary_name
            female_name = request.partner_details.name
        else:
            boy_moon_sign = partner_moon_sign
            boy_nakshatra = partner_nakshatra
            boy_nakshatra_num = partner_nakshatra_num
            girl_moon_sign = primary_moon_sign
            girl_nakshatra = primary_nakshatra
            girl_nakshatra_num = primary_nakshatra_num
            male_name = request.partner_details.name
            female_name = primary_name

        # Calculate Ashtakoot compatibility
        ashtakoot_calc = AshtakootCalculator()
        ashtakoot_analysis = ashtakoot_calc.calculate_ashtakoot(
            boy_moon_sign, boy_nakshatra, boy_nakshatra_num,
            girl_moon_sign, girl_nakshatra, girl_nakshatra_num
        )

        # Build birth details for report
        primary_birth_info = request.primary_chart_data.get('birth_info', {})
        primary_ascendant_sign = request.primary_chart_data.get('ascendant_sign', 'Unknown')

        partner_ascendant_sign = get_sign_name(int(partner_ascendant.get('sidereal_longitude', 0) / 30))

        # Format birth details
        birth_details = {
            'male': {
                'name': male_name,
                'sex': 'Male',
                'date_of_birth': primary_birth_info.get('date', 'Unknown') if primary_sex.lower() == 'male' else request.partner_details.birth_date,
                'time_of_birth': primary_birth_info.get('time', 'Unknown') if primary_sex.lower() == 'male' else request.partner_details.birth_time,
                'day_of_birth': 'Unknown',
                'place_of_birth': primary_birth_info.get('location', 'Unknown') if primary_sex.lower() == 'male' else request.partner_details.birth_location,
                'latitude': str(primary_birth_info.get('latitude', 0)) if primary_sex.lower() == 'male' else str(request.partner_details.latitude),
                'longitude': str(primary_birth_info.get('longitude', 0)) if primary_sex.lower() == 'male' else str(request.partner_details.longitude),
                'time_zone': primary_birth_info.get('timezone', 'Unknown') if primary_sex.lower() == 'male' else request.partner_details.timezone,
                'lagna': primary_ascendant_sign if primary_sex.lower() == 'male' else partner_ascendant_sign,
                'rashi': boy_moon_sign,
                'nakshatra_pada': f"{boy_nakshatra} - Pada {primary_moon.get('pada', 1) if primary_sex.lower() == 'male' else partner_moon.get('pada', 1)}",
                'nakshatra_lord': 'Unknown'
            },
            'female': {
                'name': female_name,
                'sex': 'Female',
                'date_of_birth': request.partner_details.birth_date if primary_sex.lower() == 'male' else primary_birth_info.get('date', 'Unknown'),
                'time_of_birth': request.partner_details.birth_time if primary_sex.lower() == 'male' else primary_birth_info.get('time', 'Unknown'),
                'day_of_birth': 'Unknown',
                'place_of_birth': request.partner_details.birth_location if primary_sex.lower() == 'male' else primary_birth_info.get('location', 'Unknown'),
                'latitude': str(request.partner_details.latitude) if primary_sex.lower() == 'male' else str(primary_birth_info.get('latitude', 0)),
                'longitude': str(request.partner_details.longitude) if primary_sex.lower() == 'male' else str(primary_birth_info.get('longitude', 0)),
                'time_zone': request.partner_details.timezone if primary_sex.lower() == 'male' else primary_birth_info.get('timezone', 'Unknown'),
                'lagna': partner_ascendant_sign if primary_sex.lower() == 'male' else primary_ascendant_sign,
                'rashi': girl_moon_sign,
                'nakshatra_pada': f"{girl_nakshatra} - Pada {partner_moon.get('pada', 1) if primary_sex.lower() == 'male' else primary_moon.get('pada', 1)}",
                'nakshatra_lord': 'Unknown'
            }
        }

        # Generate conclusion based on score
        total_points = ashtakoot_analysis['total_points']
        if total_points >= 24:
            conclusion = f"The match between {male_name} and {female_name} is excellent with {total_points} out of 36 points. This indicates strong compatibility across multiple dimensions of life. The couple is likely to have a harmonious and prosperous married life."
        elif total_points >= 18:
            conclusion = f"The match between {male_name} and {female_name} is good with {total_points} out of 36 points. This indicates satisfactory compatibility. With mutual understanding and effort, the couple can have a successful married life."
        else:
            conclusion = f"The match between {male_name} and {female_name} has {total_points} out of 36 points, which is below the traditional threshold of 18 points. This suggests some areas of incompatibility that should be carefully considered. Consultation with an experienced astrologer is recommended."

        # Return structured response
        result = {
            'success': True,
            'report_title': f"Matching between {male_name} and {female_name} - Match Horoscope",
            'birth_details': birth_details,
            'ashtakoot_analysis': ashtakoot_analysis,
            'manglik_analysis': {
                'male_status': 'Analysis pending',
                'female_status': 'Analysis pending',
                'compatibility_note': 'Mangal Dosha analysis requires detailed chart examination.'
            },
            'conclusion': conclusion,
            'detailed_interpretations': {
                'varna': 'Varna represents spiritual compatibility and work ethics.',
                'vasya': 'Vasya indicates mutual attraction and control in the relationship.',
                'tara': 'Tara represents destiny and fortune compatibility.',
                'yoni': 'Yoni indicates mental and sexual compatibility.',
                'maitri': 'Maitri represents psychological compatibility and friendship.',
                'gana': 'Gana indicates temperament and behavioral compatibility.',
                'bhakoot': 'Bhakoot represents love, affection, and emotional compatibility.',
                'nadi': 'Nadi indicates health and progeny compatibility.'
            },
            'model': 'Ashtakoot Calculator',
            'timestamp': datetime.utcnow().isoformat()
        }

        return result

    except (ConfigurationError, ExternalAPIError, DatabaseError):
        raise
    except Exception as e:
        logger.error(f"Error generating match horoscope analysis: {e}", exc_info=True)
        # Check for encryption/decryption errors
        error_str = str(e)
        if 'InvalidToken' in error_str or 'decrypt' in error_str.lower() or 'Signature did not match' in error_str:
            raise ConfigurationError(
                "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
            )
        logger.error(f"Unexpected error in AI endpoint: {error_str}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while processing your request",
            service="AI Service",
            details={"error": error_str}
        )


@router.post("/match-horoscope/export")
async def export_match_horoscope_pdf(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export match horoscope analysis as PDF.

    Args:
        request: Analysis data and user details
        current_user: Current authenticated user
        db: Database session

    Returns:
        PDF file download
    """
    try:
        logger.info(f"Exporting match horoscope PDF for user {current_user.id}")

        # Generate PDF using the analysis data
        pdf_result = await llm_service.generate_match_horoscope_pdf(
            request.get("analysis_data"),
            request.get("user_name"),
            request.get("partner_name")
        )

        if not pdf_result.get("success"):
            raise ExternalAPIError(
                f"Failed to generate PDF: {pdf_result.get('error')}",
                service="PDF Service"
            )

        # Return PDF as response
        from fastapi.responses import Response
        return Response(
            content=pdf_result.get("pdf_content"),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=match-horoscope-{request.get('partner_name', 'partner').replace(' ', '-')}.pdf"
            }
        )

    except ExternalAPIError:
        raise
    except Exception as e:
        logger.error(f"Error exporting match horoscope PDF: {e}", exc_info=True)
        raise ExternalAPIError(
            "An unexpected error occurred while exporting PDF",
            service="PDF Service",
            details={"error": str(e)}
        )


@router.post("/generate-html-report")
async def generate_html_report(
    request: ChartInterpretationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a complete standalone HTML Vedic horoscope report.

    This endpoint generates a comprehensive, beautifully formatted HTML document
    with inline CSS that can be:
    - Viewed directly in a browser
    - Saved as a standalone HTML file
    - Printed or converted to PDF

    Args:
        request: Chart data and optional configuration
        current_user: Current authenticated user
        db: Database session

    Returns:
        Complete HTML document as a string
    """
    try:
        logger.info(f"Generating HTML report for user {current_user.id}")
        start_time = time.time()

        # Get user's LLM configuration
        llm_config = await llm_service.get_config(db, current_user.id)
        if not llm_config:
            raise ConfigurationError(
                "No LLM configuration found. Please configure your AI settings first."
            )

        if not llm_config.is_active:
            raise ConfigurationError(
                "LLM configuration is inactive. Please check your AI settings."
            )

        # Generate the HTML report
        result = await llm_service.generate_html_report(
            db, current_user.id, request.chart_data
        )

        if not result.get("success"):
            error_msg = result.get('error', 'Unknown error')
            # Check for encryption key errors
            if 'InvalidToken' in error_msg or 'decrypt' in error_msg.lower():
                raise ConfigurationError(
                    "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
                )
            raise ExternalAPIError(
                f"Failed to generate HTML report: {error_msg}",
                service="LLM Service"
            )

        # Calculate generation time
        generation_time_ms = int((time.time() - start_time) * 1000)

        # Extract HTML content from result
        html_content = result.get("content", "")

        # Save the HTML report to database
        try:
            # Extract birth info for report metadata
            birth_info = request.chart_data.get("birth_info", {})
            person_name = birth_info.get("name", "Unknown")
            birth_date = birth_info.get("date")
            birth_time = birth_info.get("time")
            birth_location = birth_info.get("location_name", birth_info.get("location"))

            # Find chart ID from request (if available)
            chart_id = request.chart_data.get("chart_id") or request.chart_data.get("id")

            # Create report record
            report_data = AiReportCreate(
                chart_id=chart_id,
                report_type=ReportType.FULL_INTERPRETATION,
                title=f"Vedic Horoscope - {person_name}",
                description="Comprehensive HTML Vedic horoscope report with detailed analysis",
                html_content=html_content,
                prompt_used="HTML Report Generation",
                model_used=result.get("model", llm_config.model),
                generation_time_ms=generation_time_ms,
                tokens_used=result.get("tokens", {}),
                person_name=person_name,
                birth_date=birth_date,
                birth_time=birth_time,
                birth_location=birth_location
            )

            saved_report = await ai_report_service.create_report(
                db, current_user.id, report_data
            )
            report_id = saved_report.id
            logger.info(f"HTML report saved with ID: {report_id}")

        except Exception as e:
            logger.warning(f"Could not save HTML report to database: {e}")
            report_id = None

        return {
            "success": True,
            "html_content": html_content,
            "model": result.get("model"),
            "tokens": result.get("tokens"),
            "generation_time_ms": generation_time_ms,
            "timestamp": result.get("timestamp"),
            "report_id": report_id
        }

    except (ConfigurationError, ExternalAPIError, DatabaseError):
        raise
    except Exception as e:
        logger.error(f"Error generating HTML report: {e}", exc_info=True)
        error_str = str(e)
        if 'InvalidToken' in error_str or 'decrypt' in error_str.lower() or 'Signature did not match' in error_str:
            raise ConfigurationError(
                "Your API key needs to be re-saved. The encryption key has changed. Please go to AI Settings and re-save your API key."
            )
        raise ExternalAPIError(
            "An unexpected error occurred while generating HTML report",
            service="AI Service",
            details={"error": error_str}
        )


@router.get("/test")
async def test_ai_api():
    """Test endpoint to verify AI API is working."""
    return {
        "status": "healthy",
        "message": "AI API is operational",
        "service": "llm_service",
        "endpoints": [
            "POST /api/v1/ai/interpret - Generate chart interpretation",
            "POST /api/v1/ai/chat - Ask questions about chart",
            "POST /api/v1/ai/feedback - Submit feedback",
            "GET /api/v1/ai/usage - Get usage statistics",
            "POST /api/v1/ai/regenerate - Regenerate interpretation",
            "POST /api/v1/ai/generate-html-report - Generate standalone HTML report"
        ]
    }

