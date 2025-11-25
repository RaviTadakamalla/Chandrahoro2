"""Chart calculation and persistence service with caching."""

from typing import Dict, Any, Optional, List
from datetime import datetime, date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import json
import hashlib

from app.models.chart_models import BirthChart
from app.models.cache_models import ChartCache, CacheType, UserRequest
from app.models.subscription_models import Subscription
from app.core.base_methodology import MethodologyRegistry, BirthData
from app.core.parashara_methodology import ParasharaPreferences


class ChartService:
    """Service for chart calculations with caching and persistence."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_chart(
        self,
        user_id: str,
        name: Optional[str],
        birth_date: date,
        birth_time: Optional[time],
        latitude: float,
        longitude: float,
        timezone: str,
        location_name: str,
        ayanamsha: str = "Lahiri",
        house_system: str = "Whole Sign",
        chart_style: str = "North Indian",
        methodology: str = "parashara",
        chart_name: Optional[str] = None,
    ) -> BirthChart:
        """
        Create and save a new birth chart with calculations.
        
        This method:
        1. Checks user's subscription limits
        2. Creates birth chart record
        3. Performs calculations using appropriate methodology
        4. Caches one-time calculations
        5. Updates usage counters
        """
        # Check subscription limits
        subscription = await self._get_subscription(user_id)
        if not subscription.can_create_chart():
            raise ValueError(f"Chart creation limit reached. You have used {subscription.charts_used_this_month}/{subscription.max_charts_per_month} charts this month.")
        
        # Combine date and time
        if birth_time:
            birth_datetime = datetime.combine(birth_date, birth_time)
        else:
            birth_datetime = datetime.combine(birth_date, time(12, 0))  # Noon if time unknown
        
        # Create birth chart record
        birth_chart = BirthChart(
            user_id=user_id,
            name=name,
            birth_date=birth_date,
            birth_time=birth_time,
            birth_latitude=latitude,
            birth_longitude=longitude,
            birth_timezone=timezone,
            birth_location=location_name,
            ayanamsha=ayanamsha,
            house_system=house_system,
            chart_style=chart_style,
            methodology=methodology,
            chart_name=chart_name or f"{name}'s Chart" if name else "Unnamed Chart",
        )
        
        self.db.add(birth_chart)
        await self.db.flush()  # Get the ID
        
        # Calculate chart using methodology
        start_time = datetime.utcnow()
        chart_data = await self._calculate_chart(
            birth_datetime=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            location_name=location_name,
            methodology=methodology,
            ayanamsha=ayanamsha,
            house_system=house_system,
        )
        calculation_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Store chart data
        birth_chart.chart_data = chart_data
        
        # Cache one-time calculations
        await self._cache_natal_calculations(
            birth_chart_id=birth_chart.id,
            chart_data=chart_data,
            calculation_time_ms=calculation_time_ms,
        )
        
        # Update subscription usage
        subscription.increment_usage("chart")
        
        # Log request
        await self._log_request(
            user_id=user_id,
            birth_chart_id=birth_chart.id,
            request_type="chart_calculation",
            response_time_ms=calculation_time_ms,
        )
        
        await self.db.commit()
        await self.db.refresh(birth_chart)
        
        return birth_chart
    
    async def get_chart(self, chart_id: str, user_id: str) -> Optional[BirthChart]:
        """Get a chart by ID, ensuring user owns it."""
        result = await self.db.execute(
            select(BirthChart).where(
                and_(
                    BirthChart.id == chart_id,
                    BirthChart.user_id == user_id,
                    BirthChart.is_active == True
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_user_charts(self, user_id: str, skip: int = 0, limit: int = 100) -> List[BirthChart]:
        """List all charts for a user."""
        result = await self.db.execute(
            select(BirthChart)
            .where(and_(BirthChart.user_id == user_id, BirthChart.is_active == True))
            .order_by(BirthChart.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def delete_chart(self, chart_id: str, user_id: str) -> bool:
        """Soft delete a chart."""
        chart = await self.get_chart(chart_id, user_id)
        if not chart:
            return False
        
        chart.is_active = False
        await self.db.commit()
        return True
    
    async def get_cached_calculation(
        self,
        birth_chart_id: str,
        cache_type: CacheType,
        cache_key: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Get cached calculation if available and not expired."""
        if cache_key is None:
            cache_key = cache_type.value
        
        result = await self.db.execute(
            select(ChartCache).where(
                and_(
                    ChartCache.birth_chart_id == birth_chart_id,
                    ChartCache.cache_type == cache_type,
                    ChartCache.cache_key == cache_key,
                    ChartCache.is_active == True
                )
            )
        )
        cache_entry = result.scalar_one_or_none()
        
        if cache_entry and not cache_entry.is_expired():
            return cache_entry.cache_data
        
        return None

    async def _get_subscription(self, user_id: str) -> Subscription:
        """Get user's subscription."""
        result = await self.db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        subscription = result.scalar_one_or_none()

        if not subscription:
            # Create default free subscription
            subscription = Subscription(user_id=user_id)
            self.db.add(subscription)
            await self.db.flush()

        return subscription

    async def _calculate_chart(
        self,
        birth_datetime: datetime,
        latitude: float,
        longitude: float,
        timezone: str,
        location_name: str,
        methodology: str,
        ayanamsha: str,
        house_system: str,
    ) -> Dict[str, Any]:
        """Calculate chart using specified methodology."""
        # Get methodology calculator
        calculator = MethodologyRegistry.get(methodology)
        if not calculator:
            raise ValueError(f"Unsupported methodology: {methodology}")

        # Prepare birth data
        birth_data = BirthData(
            date=birth_datetime,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            location_name=location_name,
        )

        # Prepare preferences
        if methodology == "parashara":
            preferences = ParasharaPreferences(
                ayanamsha=ayanamsha,
                house_system=house_system,
            )
        else:
            # For future methodologies
            from app.core.base_methodology import CalculationPreferences
            preferences = CalculationPreferences(methodology=methodology)

        # Calculate
        return calculator.calculate_chart(birth_data, preferences)

    async def _cache_natal_calculations(
        self,
        birth_chart_id: str,
        chart_data: Dict[str, Any],
        calculation_time_ms: int,
    ):
        """Cache one-time (natal) calculations."""
        # Cache planetary positions
        if "planets" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_POSITIONS,
                cache_key="natal_positions",
                cache_data=chart_data["planets"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache houses
        if "houses" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_HOUSES,
                cache_key="natal_houses",
                cache_data=chart_data["houses"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache divisional charts
        if "divisional_charts" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_DIVISIONAL,
                cache_key="natal_divisional",
                cache_data=chart_data["divisional_charts"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache dasha balance
        if "dasha" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_DASHA_BALANCE,
                cache_key="natal_dasha",
                cache_data=chart_data["dasha"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache yogas
        if "yogas" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_YOGAS,
                cache_key="natal_yogas",
                cache_data=chart_data["yogas"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache Shadbala
        if "shadbala" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_SHADBALA,
                cache_key="natal_shadbala",
                cache_data=chart_data["shadbala"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

        # Cache Ashtakavarga
        if "ashtakavarga" in chart_data:
            cache_entry = ChartCache.create_cache_entry(
                birth_chart_id=birth_chart_id,
                cache_type=CacheType.NATAL_ASHTAKAVARGA,
                cache_key="natal_ashtakavarga",
                cache_data=chart_data["ashtakavarga"],
                calculation_time_ms=calculation_time_ms,
            )
            self.db.add(cache_entry)

    async def _log_request(
        self,
        user_id: str,
        birth_chart_id: Optional[str],
        request_type: str,
        response_time_ms: int,
        response_status: int = 200,
    ):
        """Log user request."""
        request_log = UserRequest(
            user_id=user_id,
            birth_chart_id=birth_chart_id,
            request_type=request_type,
            response_status=response_status,
            response_time_ms=response_time_ms,
        )
        self.db.add(request_log)

