"""Location search API endpoints."""

from typing import List, Dict, Any
import logging
import os

from fastapi import APIRouter, HTTPException, Query

from app.services.location_service import get_location_service, LocationResult

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/search")
async def search_locations(
    q: str = Query(..., description="Search query for location (city, state, country)"),
    limit: int = Query(10, description="Maximum number of results to return", ge=1, le=50)
) -> Dict[str, Any]:
    """
    Search for locations by name using multiple geocoding providers.

    Args:
        q: Search query string
        limit: Maximum number of results to return (1-50)

    Returns:
        List of matching locations with coordinates and timezone info
    """
    try:
        logger.info(f"Searching locations for query: {q} (limit: {limit})")

        # Get GeoNames username from environment
        geonames_username = os.getenv("GEONAMES_USERNAME")

        # Get location service instance
        location_service = get_location_service(geonames_username)

        # Search for locations
        location_results = await location_service.search_locations(q, limit)

        # Convert to API response format
        results = []
        for location in location_results:
            results.append({
                "name": location.display_name,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "timezone": location.timezone,
                "country": location.country,
                "admin1": location.admin1,
                "population": location.population,
                "source": location.source
            })

        logger.info(f"Found {len(results)} locations for query: {q}")

        return {
            "success": True,
            "query": q,
            "results": results,
            "count": len(results),
            "sources_used": list(set(r["source"] for r in results))
        }

    except Exception as e:
        logger.error(f"Error searching locations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching locations: {str(e)}"
        )


@router.get("/reverse")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lon: float = Query(..., description="Longitude", ge=-180, le=180)
) -> Dict[str, Any]:
    """
    Reverse geocode coordinates to get location information.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Location information for the given coordinates
    """
    try:
        logger.info(f"Reverse geocoding coordinates: {lat}, {lon}")

        # For now, return a simple timezone estimation
        # In production, this would use a proper reverse geocoding service
        timezone = _estimate_timezone_from_coords(lat, lon)

        return {
            "success": True,
            "latitude": lat,
            "longitude": lon,
            "timezone": timezone,
            "message": "Reverse geocoding completed (basic implementation)"
        }

    except Exception as e:
        logger.error(f"Error in reverse geocoding: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error in reverse geocoding: {str(e)}"
        )


def _estimate_timezone_from_coords(lat: float, lon: float) -> str:
    """Simple timezone estimation based on coordinates."""
    if 68.7 <= lon <= 97.25 and 8.4 <= lat <= 37.6:  # India
        return "Asia/Kolkata"
    elif -125 <= lon <= -66.9 and 20.7 <= lat <= 71.5:  # USA
        if lon > -87:
            return "America/New_York"
        elif lon > -101:
            return "America/Chicago"
        elif lon > -115:
            return "America/Denver"
        else:
            return "America/Los_Angeles"
    elif -10 <= lon <= 40 and 35 <= lat <= 70:  # Europe
        return "Europe/London"
    else:
        return "UTC"


@router.get("/test")
async def test_locations_api():
    """Test endpoint to verify locations API is working."""
    geonames_username = os.getenv("GEONAMES_USERNAME")

    return {
        "status": "healthy",
        "message": "Enhanced Locations API is operational",
        "geonames_configured": bool(geonames_username and geonames_username != "your_geonames_username"),
        "endpoints": [
            "GET /api/v1/locations/search?q={query}&limit={limit} - Search for locations",
            "GET /api/v1/locations/reverse?lat={lat}&lon={lon} - Reverse geocode coordinates",
            "GET /api/v1/locations/test - This test endpoint"
        ]
    }