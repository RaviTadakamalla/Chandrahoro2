"""Pydantic models for chart data structures."""

from datetime import date as date_type, time as time_type, datetime
from typing import Optional, List, ClassVar
import re
from pydantic import BaseModel, Field, field_validator, model_validator


class BirthDetails(BaseModel):
    """Birth information input model."""
    name: Optional[str] = None
    date: date_type = Field(..., description="Birth date")
    time: Optional[time_type] = None
    time_unknown: bool = Field(default=False, description="Whether birth time is unknown")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in degrees")
    timezone: str = Field(..., description="IANA timezone identifier")
    location_name: str = Field(..., description="Human-readable location name")

    @field_validator('date')
    @classmethod
    def validate_birth_date(cls, v):
        """Validate birth date is reasonable."""
        if v < date_type(1800, 1, 1):
            raise ValueError('Birth date cannot be before 1800')
        if v > date_type.today():
            raise ValueError('Birth date cannot be in the future')
        return v

    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        """Validate latitude is within valid range."""
        if not -90 <= v <= 90:
            raise ValueError('Latitude must be between -90 and 90 degrees')
        return v

    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        """Validate longitude is within valid range."""
        if not -180 <= v <= 180:
            raise ValueError('Longitude must be between -180 and 180 degrees')
        return v

    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v):
        """Validate timezone format."""
        # Basic timezone validation - should be IANA format
        if not re.match(r'^[A-Za-z_]+/[A-Za-z_]+$', v):
            raise ValueError('Timezone must be in IANA format (e.g., Asia/Kolkata)')
        return v

    @field_validator('location_name')
    @classmethod
    def validate_location_name(cls, v):
        """Validate location name."""
        if len(v.strip()) < 2:
            raise ValueError('Location name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Location name cannot exceed 100 characters')
        return v.strip()

    @model_validator(mode='after')
    def validate_time_requirement(self):
        """Validate time requirements."""
        if not self.time_unknown and self.time is None:
            raise ValueError('Time is required when time_unknown is False')
        return self


class ChartPreferences(BaseModel):
    """Chart calculation preferences."""
    methodology: str = Field(default="parashara", description="Astrology methodology (parashara, kp, jaimini, western, nadi)")
    ayanamsha: str = Field(default="Lahiri", description="Ayanamsha system")
    house_system: str = Field(default="Whole Sign", description="House system")
    chart_style: str = Field(default="North Indian", description="Chart layout style")
    divisional_charts: List[str] = Field(
        default=[],
        description="List of additional divisional charts to calculate (D1, D9, D10 are always included)"
    )
    enable_ai: bool = Field(default=False, description="Enable AI interpretations")

    # Default charts that are always included
    DEFAULT_CHARTS: ClassVar[List[str]] = ["D1", "D9", "D10"]

    def get_all_divisional_charts(self) -> List[str]:
        """
        Get complete list of divisional charts including defaults and user selections.
        Ensures no duplicates and maintains order with defaults first.
        """
        # Start with default charts
        all_charts = self.DEFAULT_CHARTS.copy()

        # Add user-selected charts that aren't already in defaults
        for chart in self.divisional_charts:
            if chart not in all_charts:
                all_charts.append(chart)

        return all_charts

    @field_validator('methodology')
    @classmethod
    def validate_methodology(cls, v):
        """Validate methodology."""
        from app.core.base_methodology import MethodologyRegistry
        valid_methodologies = MethodologyRegistry.list_available()
        if v not in valid_methodologies:
            raise ValueError(f'Methodology must be one of: {", ".join(valid_methodologies)}')
        return v

    @field_validator('ayanamsha')
    @classmethod
    def validate_ayanamsha(cls, v):
        """Validate ayanamsha system."""
        valid_ayanamshas = ["Lahiri", "Raman", "Krishnamurti", "Yukteshwar"]
        if v not in valid_ayanamshas:
            raise ValueError(f'Ayanamsha must be one of: {", ".join(valid_ayanamshas)}')
        return v

    @field_validator('house_system')
    @classmethod
    def validate_house_system(cls, v):
        """Validate house system."""
        valid_systems = ["Whole Sign", "Placidus", "Koch", "Equal"]
        if v not in valid_systems:
            raise ValueError(f'House system must be one of: {", ".join(valid_systems)}')
        return v

    @field_validator('chart_style')
    @classmethod
    def validate_chart_style(cls, v):
        """Validate chart style."""
        valid_styles = ["North Indian", "South Indian", "Bengali", "East Indian", "Kerala"]
        if v not in valid_styles:
            raise ValueError(f'Chart style must be one of: {", ".join(valid_styles)}')
        return v

    @field_validator('divisional_charts')
    @classmethod
    def validate_divisional_charts(cls, v):
        """Validate divisional charts list."""
        valid_charts = [
            "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
            "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"
        ]
        for chart in v:
            if chart not in valid_charts:
                raise ValueError(f'Invalid divisional chart: {chart}. Valid options: {", ".join(valid_charts)}')

        # Calculate total charts including defaults
        default_charts = cls.DEFAULT_CHARTS
        all_charts = list(set(default_charts + v))  # Remove duplicates

        if len(all_charts) > 16:
            raise ValueError(f'Cannot calculate more than 16 divisional charts at once. '
                           f'You have {len(default_charts)} default charts + {len(v)} selected = {len(all_charts)} total.')

        return v


class PlanetPosition(BaseModel):
    """Planetary position data."""
    name: str
    tropical_longitude: float = Field(..., description="Tropical longitude in degrees")
    sidereal_longitude: float = Field(..., description="Sidereal longitude in degrees")
    sign: str = Field(..., description="Zodiac sign name")
    degree_in_sign: float = Field(..., description="Degrees within the sign")
    nakshatra: str = Field(..., description="Nakshatra name")
    pada: int = Field(..., ge=1, le=4, description="Pada number (1-4)")
    house: int = Field(..., ge=1, le=12, description="House number")
    retrograde: bool = Field(default=False, description="Retrograde status")
    speed: float = Field(..., description="Daily motion in degrees")


class HousePosition(BaseModel):
    """House cusp data."""
    number: int = Field(..., ge=1, le=12)
    cusp_longitude: float
    sign: str
    degree_in_sign: float


class ChartData(BaseModel):
    """Complete chart calculation result."""
    birth_info: BirthDetails
    preferences: ChartPreferences
    ascendant: float = Field(..., description="Ascendant degree")
    ascendant_sign: str
    planets: List[PlanetPosition]
    houses: List[HousePosition]
    calculation_timestamp: datetime = Field(default_factory=datetime.utcnow)
    ayanamsha_value: float = Field(..., description="Ayanamsha value in degrees")


class ChartRequest(BaseModel):
    """Request model for chart calculation."""
    birth_details: BirthDetails
    preferences: Optional[ChartPreferences] = ChartPreferences()


class ChartResponse(BaseModel):
    """Response model for chart calculation."""
    success: bool
    data: Optional[ChartData] = None
    error: Optional[str] = None
    message: str = "Chart calculated successfully"