"""Base classes for multi-methodology astrology system.

This module provides abstract base classes for implementing different astrology methodologies
(Parashara, KP, Jaimini, Western, Chinese, etc.) in a unified architecture.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel


class BirthData(BaseModel):
    """Standardized birth data structure for all methodologies."""
    date: datetime
    latitude: float
    longitude: float
    timezone: str
    location_name: str
    name: Optional[str] = None


class CalculationPreferences(BaseModel):
    """Base preferences for calculations."""
    methodology: str  # parashara, kp, jaimini, western, chinese, etc.


class MethodologyFeature(ABC):
    """Base class for a specific feature within a methodology."""
    
    @abstractmethod
    def calculate(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """Calculate this feature."""
        pass
    
    @abstractmethod
    def get_feature_name(self) -> str:
        """Return the name of this feature."""
        pass


class AstrologyMethodology(ABC):
    """
    Abstract base class for all astrology methodologies.
    
    Each methodology (Parashara, KP, Jaimini, Western, Chinese, etc.) should inherit
    from this class and implement all required methods.
    """
    
    @abstractmethod
    def get_name(self) -> str:
        """
        Return the methodology name.
        
        Returns:
            str: Methodology identifier (e.g., 'parashara', 'kp', 'western')
        """
        pass
    
    @abstractmethod
    def get_display_name(self) -> str:
        """
        Return the human-readable methodology name.
        
        Returns:
            str: Display name (e.g., 'Vedic Astrology (Parashara)', 'Krishnamurti Paddhati')
        """
        pass
    
    @abstractmethod
    def get_supported_features(self) -> List[str]:
        """
        Return list of supported features for this methodology.
        
        Returns:
            List[str]: Feature names (e.g., ['dasha', 'yogas', 'divisional_charts'])
        """
        pass
    
    @abstractmethod
    def calculate_chart(self, birth_data: BirthData, preferences: CalculationPreferences) -> Dict[str, Any]:
        """
        Calculate complete chart for this methodology.
        
        Args:
            birth_data: Birth information
            preferences: Calculation preferences
            
        Returns:
            Dict[str, Any]: Complete chart data
        """
        pass
    
    @abstractmethod
    def validate_preferences(self, preferences: CalculationPreferences) -> bool:
        """
        Validate that preferences are compatible with this methodology.
        
        Args:
            preferences: Preferences to validate
            
        Returns:
            bool: True if valid, raises ValueError if invalid
        """
        pass
    
    def get_feature(self, feature_name: str) -> Optional[MethodologyFeature]:
        """
        Get a specific feature calculator.
        
        Args:
            feature_name: Name of the feature
            
        Returns:
            Optional[MethodologyFeature]: Feature calculator or None if not supported
        """
        return None
    
    def is_feature_supported(self, feature_name: str) -> bool:
        """
        Check if a feature is supported by this methodology.
        
        Args:
            feature_name: Name of the feature
            
        Returns:
            bool: True if supported
        """
        return feature_name in self.get_supported_features()


class MethodologyRegistry:
    """
    Registry for all available astrology methodologies.
    
    This allows dynamic registration and retrieval of methodology calculators.
    """
    
    _methodologies: Dict[str, AstrologyMethodology] = {}
    
    @classmethod
    def register(cls, methodology: AstrologyMethodology):
        """
        Register a methodology.
        
        Args:
            methodology: Methodology instance to register
        """
        cls._methodologies[methodology.get_name()] = methodology
    
    @classmethod
    def get(cls, methodology_name: str) -> Optional[AstrologyMethodology]:
        """
        Get a registered methodology.
        
        Args:
            methodology_name: Name of the methodology
            
        Returns:
            Optional[AstrologyMethodology]: Methodology instance or None
        """
        return cls._methodologies.get(methodology_name)
    
    @classmethod
    def get_all(cls) -> Dict[str, AstrologyMethodology]:
        """
        Get all registered methodologies.
        
        Returns:
            Dict[str, AstrologyMethodology]: All registered methodologies
        """
        return cls._methodologies.copy()
    
    @classmethod
    def list_available(cls) -> List[str]:
        """
        List all available methodology names.
        
        Returns:
            List[str]: List of methodology names
        """
        return list(cls._methodologies.keys())

