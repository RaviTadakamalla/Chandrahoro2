"""Transit API endpoints."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import logging

from app.core.transits import TransitCalculator
from app.models.chart import ChartData

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/transits/current")
async def get_current_transits(
    natal_chart_id: Optional[str] = Query(None, description="Natal chart ID for comparison"),
    date: Optional[str] = Query(None, description="Date for transit calculation (YYYY-MM-DD)")
):
    """
    Get current planetary transits.

    Args:
        natal_chart_id: Optional natal chart ID for comparison
        date: Optional date for calculation (default: current date)

    Returns:
        Current planetary positions and transits
    """
    try:
        # Parse date if provided
        calculation_date = None
        if date:
            try:
                calculation_date = datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        # Initialize transit calculator
        transit_calc = TransitCalculator()

        # If no natal chart provided, just return current positions
        if not natal_chart_id:
            # Create a basic chart data structure for current positions
            current_positions = transit_calc._calculate_current_positions(
                calculation_date or datetime.now()
            )

            # Convert to simple format
            positions = []
            for planet, pos_data in current_positions.items():
                from app.core.ephemeris import get_sign_name, get_nakshatra_name
                positions.append({
                    "planet": planet,
                    "longitude": pos_data['sidereal_longitude'],
                    "sign": get_sign_name(pos_data['sign_number']),
                    "degree": pos_data['degree_in_sign'],
                    "nakshatra": get_nakshatra_name(pos_data['nakshatra_number']),
                    "pada": pos_data['pada'],
                    "speed": pos_data['speed'],
                    "retrograde": pos_data['retrograde']
                })

            return {
                "success": True,
                "data": {
                    "calculation_date": (calculation_date or datetime.now()).isoformat(),
                    "current_positions": positions,
                    "message": "Current planetary positions calculated"
                }
            }

        # TODO: In a real application, you would fetch the natal chart from database
        # For now, return an error asking for natal chart data
        raise HTTPException(
            status_code=501,
            detail="Natal chart comparison not implemented. Please provide natal chart data directly."
        )

    except Exception as e:
        logger.error(f"Error calculating transits: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating transits: {str(e)}")


@router.post("/transits/compare")
async def compare_transits_to_natal(
    natal_chart_data: dict,
    date: Optional[str] = Query(None, description="Date for transit calculation (YYYY-MM-DD)")
):
    """
    Compare current transits to a natal chart.

    Args:
        natal_chart_data: Natal chart data for comparison
        date: Optional date for calculation (default: current date)

    Returns:
        Transit analysis relative to natal chart
    """
    try:
        # Parse date if provided
        calculation_date = None
        if date:
            try:
                calculation_date = datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        # Initialize transit calculator
        transit_calc = TransitCalculator()

        # Calculate transits relative to natal chart
        transit_data = transit_calc.get_current_transits(
            natal_chart_data,
            calculation_date
        )

        logger.info(f"Transit comparison completed for date: {calculation_date or 'current'}")

        return {
            "success": True,
            "data": transit_data,
            "message": "Transit analysis completed successfully"
        }

    except Exception as e:
        logger.error(f"Error in transit comparison: {e}")
        raise HTTPException(status_code=500, detail=f"Error in transit comparison: {str(e)}")


@router.get("/transits/sample")
async def get_sample_transits():
    """
    Get sample transit data for testing.

    Returns:
        Sample transit analysis
    """
    try:
        # Create sample natal chart data
        sample_natal_chart = {
            "ascendant_sign": "Aries",
            "planets": [
                {
                    "name": "Sun",
                    "sidereal_longitude": 15.0,
                    "sign": "Aries",
                    "house": 1,
                    "degree_in_sign": 15.0
                },
                {
                    "name": "Moon",
                    "sidereal_longitude": 100.0,
                    "sign": "Cancer",
                    "house": 4,
                    "degree_in_sign": 10.0
                },
                {
                    "name": "Mercury",
                    "sidereal_longitude": 25.0,
                    "sign": "Aries",
                    "house": 1,
                    "degree_in_sign": 25.0
                },
                {
                    "name": "Venus",
                    "sidereal_longitude": 45.0,
                    "sign": "Taurus",
                    "house": 2,
                    "degree_in_sign": 15.0
                },
                {
                    "name": "Mars",
                    "sidereal_longitude": 120.0,
                    "sign": "Leo",
                    "house": 5,
                    "degree_in_sign": 0.0
                },
                {
                    "name": "Jupiter",
                    "sidereal_longitude": 240.0,
                    "sign": "Sagittarius",
                    "house": 9,
                    "degree_in_sign": 0.0
                },
                {
                    "name": "Saturn",
                    "sidereal_longitude": 300.0,
                    "sign": "Aquarius",
                    "house": 11,
                    "degree_in_sign": 0.0
                },
                {
                    "name": "Rahu",
                    "sidereal_longitude": 180.0,
                    "sign": "Libra",
                    "house": 7,
                    "degree_in_sign": 0.0
                },
                {
                    "name": "Ketu",
                    "sidereal_longitude": 0.0,
                    "sign": "Aries",
                    "house": 1,
                    "degree_in_sign": 0.0
                }
            ]
        }

        # Initialize transit calculator
        transit_calc = TransitCalculator()

        # Calculate transits for sample chart
        transit_data = transit_calc.get_current_transits(sample_natal_chart)

        logger.info("Sample transit data generated successfully")

        return {
            "success": True,
            "data": transit_data,
            "message": "Sample transit data generated successfully"
        }

    except Exception as e:
        logger.error(f"Error generating sample transits: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating sample transits: {str(e)}")