"""Enhanced location search service with multiple geocoding providers."""

import asyncio
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import aiohttp
import json
from urllib.parse import quote

logger = logging.getLogger(__name__)


@dataclass
class LocationResult:
    """Standardized location result."""
    name: str
    display_name: str
    latitude: float
    longitude: float
    country: str
    country_code: str
    admin1: str  # State/Province
    admin2: str  # District/County
    admin3: str  # City/Town
    timezone: str
    population: int
    importance: float
    source: str  # Which API provided this result


class LocationCache:
    """Simple in-memory cache for location results."""

    def __init__(self, ttl_hours: int = 24):
        self._cache: Dict[str, Tuple[List[LocationResult], datetime]] = {}
        self._ttl = timedelta(hours=ttl_hours)

    def get(self, query: str) -> Optional[List[LocationResult]]:
        """Get cached results for a query."""
        key = query.lower().strip()
        if key in self._cache:
            results, timestamp = self._cache[key]
            if datetime.now() - timestamp < self._ttl:
                return results
            else:
                del self._cache[key]
        return None

    def set(self, query: str, results: List[LocationResult]) -> None:
        """Cache results for a query."""
        key = query.lower().strip()
        self._cache[key] = (results, datetime.now())

    def clear_expired(self) -> None:
        """Remove expired cache entries."""
        now = datetime.now()
        expired_keys = [
            key for key, (_, timestamp) in self._cache.items()
            if now - timestamp >= self._ttl
        ]
        for key in expired_keys:
            del self._cache[key]


class GeoNamesProvider:
    """GeoNames API provider."""

    def __init__(self, username: str):
        self.username = username
        self.base_url = "http://api.geonames.org"

    async def search(self, query: str, max_results: int = 10) -> List[LocationResult]:
        """Search locations using GeoNames API."""
        if not self.username or self.username == "your_geonames_username":
            logger.warning("GeoNames username not configured, skipping GeoNames search")
            return []

        try:
            params = {
                'q': query,
                'maxRows': max_results,
                'username': self.username,
                'type': 'json',
                'style': 'full',
                'orderby': 'relevance'
            }

            url = f"{self.base_url}/searchJSON"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_geonames_response(data)
                    else:
                        logger.error(f"GeoNames API error: {response.status}")
                        return []

        except Exception as e:
            logger.error(f"GeoNames search error: {e}")
            return []

    def _parse_geonames_response(self, data: Dict[str, Any]) -> List[LocationResult]:
        """Parse GeoNames API response."""
        results = []

        for item in data.get('geonames', []):
            try:
                # Build display name
                name_parts = [item.get('name', '')]
                if item.get('adminName1'):
                    name_parts.append(item['adminName1'])
                if item.get('countryName'):
                    name_parts.append(item['countryName'])

                display_name = ', '.join(filter(None, name_parts))

                result = LocationResult(
                    name=item.get('name', ''),
                    display_name=display_name,
                    latitude=float(item.get('lat', 0)),
                    longitude=float(item.get('lng', 0)),
                    country=item.get('countryName', ''),
                    country_code=item.get('countryCode', ''),
                    admin1=item.get('adminName1', ''),
                    admin2=item.get('adminName2', ''),
                    admin3=item.get('adminName3', ''),
                    timezone=item.get('timezone', {}).get('timeZoneId', 'UTC'),
                    population=int(item.get('population', 0)),
                    importance=float(item.get('score', 0)),
                    source='geonames'
                )
                results.append(result)

            except (ValueError, KeyError) as e:
                logger.warning(f"Error parsing GeoNames result: {e}")
                continue

        return results


class NominatimProvider:
    """OpenStreetMap Nominatim API provider."""

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"

    async def search(self, query: str, max_results: int = 10) -> List[LocationResult]:
        """Search locations using Nominatim API."""
        try:
            params = {
                'q': query,
                'format': 'json',
                'limit': max_results,
                'addressdetails': 1,
                'extratags': 1,
                'namedetails': 1,
                'accept-language': 'en'
            }

            headers = {
                'User-Agent': 'Chandrahoro-Astrology-App/1.0 (contact@example.com)'
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/search",
                    params=params,
                    headers=headers,
                    timeout=5
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_nominatim_response(data)
                    else:
                        logger.error(f"Nominatim API error: {response.status}")
                        return []

        except Exception as e:
            logger.error(f"Nominatim search error: {e}")
            return []

    def _parse_nominatim_response(self, data: List[Dict[str, Any]]) -> List[LocationResult]:
        """Parse Nominatim API response."""
        results = []

        for item in data:
            try:
                address = item.get('address', {})

                # Extract location components
                name = (
                    address.get('city') or
                    address.get('town') or
                    address.get('village') or
                    address.get('hamlet') or
                    item.get('display_name', '').split(',')[0]
                )

                result = LocationResult(
                    name=name,
                    display_name=item.get('display_name', ''),
                    latitude=float(item.get('lat', 0)),
                    longitude=float(item.get('lon', 0)),
                    country=address.get('country', ''),
                    country_code=address.get('country_code', '').upper(),
                    admin1=address.get('state', ''),
                    admin2=address.get('county', ''),
                    admin3=address.get('city', ''),
                    timezone=self._get_timezone_from_coords(
                        float(item.get('lat', 0)),
                        float(item.get('lon', 0))
                    ),
                    population=int(item.get('extratags', {}).get('population', 0)),
                    importance=float(item.get('importance', 0)),
                    source='nominatim'
                )
                results.append(result)

            except (ValueError, KeyError) as e:
                logger.warning(f"Error parsing Nominatim result: {e}")
                continue

        return results

    def _get_timezone_from_coords(self, lat: float, lon: float) -> str:
        """Simple timezone estimation based on coordinates."""
        # This is a simplified approach - in production, use a proper timezone API
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


class EnhancedLocationService:
    """Enhanced location search service with multiple providers."""

    def __init__(self, geonames_username: Optional[str] = None):
        self.cache = LocationCache()
        self.geonames = GeoNamesProvider(geonames_username) if geonames_username else None
        self.nominatim = NominatimProvider()

        # Indian cities database for better coverage
        self.indian_cities = self._load_indian_cities()

    def _load_indian_cities(self) -> List[LocationResult]:
        """Load comprehensive Indian cities database."""
        # This would typically be loaded from a database or file
        # For now, including major Indian cities with common variations
        cities_data = [
            ("Mumbai", "Mumbai, Maharashtra, India", 19.0760, 72.8777, "Maharashtra", 20411000, ["Bombay"]),
            ("Delhi", "New Delhi, Delhi, India", 28.6139, 77.2090, "Delhi", 28514000, ["New Delhi"]),
            ("Bangalore", "Bangalore, Karnataka, India", 12.9716, 77.5946, "Karnataka", 8443675, ["Bengaluru"]),
            ("Hyderabad", "Hyderabad, Telangana, India", 17.3850, 78.4867, "Telangana", 6809970, []),
            ("Ahmedabad", "Ahmedabad, Gujarat, India", 23.0225, 72.5714, "Gujarat", 5570585, []),
            ("Chennai", "Chennai, Tamil Nadu, India", 13.0827, 80.2707, "Tamil Nadu", 4681087, ["Madras"]),
            ("Kolkata", "Kolkata, West Bengal, India", 22.5726, 88.3639, "West Bengal", 4496694, ["Calcutta"]),
            ("Surat", "Surat, Gujarat, India", 21.1702, 72.8311, "Gujarat", 4467797, []),
            ("Pune", "Pune, Maharashtra, India", 18.5204, 73.8567, "Maharashtra", 3124458, ["Poona"]),
            ("Jaipur", "Jaipur, Rajasthan, India", 26.9124, 75.7873, "Rajasthan", 3046163, []),
            ("Lucknow", "Lucknow, Uttar Pradesh, India", 26.8467, 80.9462, "Uttar Pradesh", 2901474, []),
            ("Kanpur", "Kanpur, Uttar Pradesh, India", 26.4499, 80.3319, "Uttar Pradesh", 2767031, []),
            ("Nagpur", "Nagpur, Maharashtra, India", 21.1458, 79.0882, "Maharashtra", 2405421, []),
            ("Indore", "Indore, Madhya Pradesh, India", 22.7196, 75.8577, "Madhya Pradesh", 1994397, []),
            ("Thane", "Thane, Maharashtra, India", 19.2183, 72.9781, "Maharashtra", 1841488, []),
            ("Bhopal", "Bhopal, Madhya Pradesh, India", 23.2599, 77.4126, "Madhya Pradesh", 1798218, []),
            ("Visakhapatnam", "Visakhapatnam, Andhra Pradesh, India", 17.6868, 83.2185, "Andhra Pradesh", 1730320, ["Vizag"]),
            ("Pimpri-Chinchwad", "Pimpri-Chinchwad, Maharashtra, India", 18.6298, 73.7997, "Maharashtra", 1729359, []),
            ("Patna", "Patna, Bihar, India", 25.5941, 85.1376, "Bihar", 1684222, []),
            ("Vadodara", "Vadodara, Gujarat, India", 22.3072, 73.1812, "Gujarat", 1666703, ["Baroda"]),
            ("Ghaziabad", "Ghaziabad, Uttar Pradesh, India", 28.6692, 77.4538, "Uttar Pradesh", 1636068, []),
            ("Ludhiana", "Ludhiana, Punjab, India", 30.9010, 75.8573, "Punjab", 1618879, []),
            ("Agra", "Agra, Uttar Pradesh, India", 27.1767, 78.0081, "Uttar Pradesh", 1585704, []),
            ("Nashik", "Nashik, Maharashtra, India", 19.9975, 73.7898, "Maharashtra", 1486973, []),
            ("Faridabad", "Faridabad, Haryana, India", 28.4089, 77.3178, "Haryana", 1414050, []),
            ("Meerut", "Meerut, Uttar Pradesh, India", 28.9845, 77.7064, "Uttar Pradesh", 1305429, []),
            ("Rajkot", "Rajkot, Gujarat, India", 22.3039, 70.8022, "Gujarat", 1286995, []),
            ("Kalyan-Dombivli", "Kalyan-Dombivli, Maharashtra, India", 19.2403, 73.1305, "Maharashtra", 1246381, []),
            ("Vasai-Virar", "Vasai-Virar, Maharashtra, India", 19.4912, 72.8054, "Maharashtra", 1221233, []),
            ("Varanasi", "Varanasi, Uttar Pradesh, India", 25.3176, 82.9739, "Uttar Pradesh", 1201815, ["Benares", "Kashi"]),
        ]

        results = []
        for name, display_name, lat, lon, state, population, aliases in cities_data:
            # Add main city
            results.append(LocationResult(
                name=name,
                display_name=display_name,
                latitude=lat,
                longitude=lon,
                country="India",
                country_code="IN",
                admin1=state,
                admin2="",
                admin3=name,
                timezone="Asia/Kolkata",
                population=population,
                importance=1.0,
                source="builtin"
            ))

            # Add aliases
            for alias in aliases:
                results.append(LocationResult(
                    name=alias,
                    display_name=f"{alias} ({name}), {state}, India",
                    latitude=lat,
                    longitude=lon,
                    country="India",
                    country_code="IN",
                    admin1=state,
                    admin2="",
                    admin3=alias,
                    timezone="Asia/Kolkata",
                    population=population,
                    importance=0.9,
                    source="builtin"
                ))

        return results

    async def search_locations(self, query: str, max_results: int = 10) -> List[LocationResult]:
        """Search for locations using multiple providers with caching."""
        if not query or len(query.strip()) < 2:
            return []

        # Check cache first
        cached_results = self.cache.get(query)
        if cached_results:
            logger.info(f"Returning cached results for query: {query}")
            return cached_results[:max_results]

        # Clean up expired cache entries periodically
        self.cache.clear_expired()

        # Search in built-in database first (for Indian cities)
        builtin_results = self._search_builtin(query)

        # Search using external APIs
        api_results = []

        # Try multiple providers concurrently
        tasks = []
        if self.geonames:
            tasks.append(self.geonames.search(query, max_results))
        tasks.append(self.nominatim.search(query, max_results))

        if tasks:
            try:
                api_responses = await asyncio.gather(*tasks, return_exceptions=True)
                for response in api_responses:
                    if isinstance(response, list):
                        api_results.extend(response)
                    elif isinstance(response, Exception):
                        logger.warning(f"API search error: {response}")
            except Exception as e:
                logger.error(f"Error in concurrent API search: {e}")

        # Combine and deduplicate results
        all_results = builtin_results + api_results
        deduplicated_results = self._deduplicate_results(all_results)

        # Sort by relevance and importance
        sorted_results = self._sort_results(deduplicated_results, query)

        # Cache the results
        self.cache.set(query, sorted_results)

        logger.info(f"Found {len(sorted_results)} locations for query: {query}")
        return sorted_results[:max_results]

    def _search_builtin(self, query: str) -> List[LocationResult]:
        """Search in built-in Indian cities database."""
        query_lower = query.lower().strip()
        results = []

        for city in self.indian_cities:
            # Check if query matches city name or display name
            if (query_lower in city.name.lower() or
                query_lower in city.display_name.lower()):
                results.append(city)

        return results

    def _deduplicate_results(self, results: List[LocationResult]) -> List[LocationResult]:
        """Remove duplicate locations based on coordinates."""
        seen_coords = set()
        deduplicated = []

        for result in results:
            # Round coordinates to avoid minor differences
            coord_key = (round(result.latitude, 4), round(result.longitude, 4))

            if coord_key not in seen_coords:
                seen_coords.add(coord_key)
                deduplicated.append(result)

        return deduplicated

    def _sort_results(self, results: List[LocationResult], query: str) -> List[LocationResult]:
        """Sort results by relevance to the query."""
        query_lower = query.lower().strip()

        def relevance_score(result: LocationResult) -> float:
            score = result.importance

            # Boost exact matches
            if result.name.lower() == query_lower:
                score += 10.0
            elif result.name.lower().startswith(query_lower):
                score += 5.0
            elif query_lower in result.name.lower():
                score += 2.0

            # Boost by population (larger cities are more likely to be searched)
            if result.population > 0:
                score += min(result.population / 1000000, 5.0)  # Max 5 points for population

            # Boost built-in results for Indian cities
            if result.source == "builtin":
                score += 1.0

            return score

        return sorted(results, key=relevance_score, reverse=True)


# Global instance
_location_service: Optional[EnhancedLocationService] = None


def get_location_service(geonames_username: Optional[str] = None) -> EnhancedLocationService:
    """Get or create the global location service instance."""
    global _location_service
    if _location_service is None:
        _location_service = EnhancedLocationService(geonames_username)
    return _location_service