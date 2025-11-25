"""Methodologies API endpoints.

This module provides endpoints for listing and managing astrology methodologies.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.base_methodology import MethodologyRegistry


router = APIRouter()


class MethodologyInfo(BaseModel):
    """Information about an astrology methodology."""
    name: str
    display_name: str
    description: str
    is_available: bool
    supported_features: List[str]


class MethodologyListResponse(BaseModel):
    """Response for listing methodologies."""
    methodologies: List[MethodologyInfo]
    default_methodology: str


# Define all methodologies (available and coming soon)
ALL_METHODOLOGIES = [
    {
        "name": "parashara",
        "display_name": "Parashara (Vedic)",
        "description": "Traditional Vedic astrology system based on Parashara Hora Shastra. Includes planetary positions, houses, dashas, yogas, and divisional charts.",
        "is_available": True,
        "supported_features": [
            "Planetary Positions",
            "House Systems (Whole Sign, Placidus, etc.)",
            "Vimshottari Dasha",
            "Yogas (100+ combinations)",
            "Divisional Charts (D1-D60)",
            "Shadbala",
            "Ashtakavarga",
            "Nakshatras",
            "Aspects"
        ]
    },
    {
        "name": "kp",
        "display_name": "KP System (Krishnamurti Paddhati)",
        "description": "Krishnamurti Paddhati system focusing on sub-lords, cusps, and precise timing. Uses KP ayanamsha and Placidus house system.",
        "is_available": True,
        "supported_features": [
            "Sub-Lord Analysis (Star-Lord → Sub-Lord → Sub-Sub-Lord)",
            "KP House Cusps (Placidus)",
            "Ruling Planets (5 RPs)",
            "Significators (6-step method)",
            "KP Ayanamsha (Krishnamurti)",
            "Precise Event Timing",
            "KP Transits"
        ]
    },
    {
        "name": "jaimini",
        "display_name": "Jaimini System",
        "description": "Jaimini system using Chara Karakas (variable significators), Rashi Drishti (sign aspects), and Chara Dasha (sign-based dasha system).",
        "is_available": True,
        "supported_features": [
            "Chara Karakas (7 variable significators)",
            "Karakamsha (Atmakaraka's Navamsa)",
            "Arudha Padas (AL, A1-A12, UL)",
            "Rashi Drishti (sign-based aspects)",
            "Chara Dasha (KN Rao method)",
            "Jaimini Yogas",
            "Pada Lagna"
        ]
    },
    {
        "name": "western",
        "display_name": "Western Astrology",
        "description": "Western tropical astrology with modern aspects, outer planets, and chart patterns.",
        "is_available": True,
        "supported_features": [
            "Tropical Zodiac",
            "Outer Planets (Uranus, Neptune, Pluto)",
            "Western Aspects (Conjunction, Opposition, Trine, Square, Sextile)",
            "Planetary Dignities (Domicile, Exaltation, Detriment, Fall)",
            "Chart Patterns (Grand Trine, T-Square, Stellium)",
            "Element/Modality Balance",
            "Asteroids (Chiron, Ceres, etc.)",
            "Transits"
        ]
    },
    {
        "name": "nadi",
        "display_name": "Nadi Astrology",
        "description": "Ancient Nadi system with thumb impression-based predictions. Coming soon.",
        "is_available": False,
        "supported_features": [
            "Nadi Principles",
            "Karakas",
            "Special Yogas",
            "Timing Techniques"
        ]
    }
]


@router.get("/", response_model=MethodologyListResponse)
async def list_methodologies() -> MethodologyListResponse:
    """
    List all available astrology methodologies.
    
    Returns:
        MethodologyListResponse: List of methodologies with their availability status
    """
    # Get registered methodologies from the registry
    registered = MethodologyRegistry.list_available()
    
    # Build response with availability status
    methodologies = []
    for method_info in ALL_METHODOLOGIES:
        # Check if methodology is actually registered
        is_actually_available = method_info["name"] in registered
        
        methodologies.append(MethodologyInfo(
            name=method_info["name"],
            display_name=method_info["display_name"],
            description=method_info["description"],
            is_available=is_actually_available,
            supported_features=method_info["supported_features"]
        ))
    
    return MethodologyListResponse(
        methodologies=methodologies,
        default_methodology="parashara"
    )


@router.get("/{methodology_name}")
async def get_methodology_info(methodology_name: str) -> MethodologyInfo:
    """
    Get detailed information about a specific methodology.
    
    Args:
        methodology_name: Name of the methodology
        
    Returns:
        MethodologyInfo: Detailed methodology information
        
    Raises:
        HTTPException: If methodology not found
    """
    # Find methodology in the list
    for method_info in ALL_METHODOLOGIES:
        if method_info["name"] == methodology_name:
            # Check if actually registered
            registered = MethodologyRegistry.list_available()
            is_actually_available = methodology_name in registered
            
            return MethodologyInfo(
                name=method_info["name"],
                display_name=method_info["display_name"],
                description=method_info["description"],
                is_available=is_actually_available,
                supported_features=method_info["supported_features"]
            )
    
    raise HTTPException(status_code=404, detail=f"Methodology '{methodology_name}' not found")

