"""Core calculation modules for ChandraHoro.

This package contains all astrology calculation engines and methodologies.
"""

# Import methodologies to ensure they are registered
from app.core.parashara_methodology import ParasharaMethodology
from app.core.kp_methodology import KPMethodology
from app.core.jaimini_methodology import JaiminiMethodology

__all__ = [
    'ParasharaMethodology',
    'KPMethodology',
    'JaiminiMethodology',
]
