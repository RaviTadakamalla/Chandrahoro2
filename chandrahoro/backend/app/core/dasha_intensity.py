"""
Dasha-Bhukti Intensity Analysis Calculator.

This module calculates intensity scores (1-10 scale) for six life areas
across all Mahadasha-Bhukti periods in the 120-year Vimshottari cycle.
"""

from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class DashaIntensityCalculator:
    """Calculate Dasha-Bhukti intensity scores for life areas."""
    
    # Life areas and their primary/secondary houses
    LIFE_AREAS = {
        'wealth': {
            'primary': [2, 11],      # 2nd house (wealth), 11th house (gains)
            'secondary': [1, 9],     # 1st house (self), 9th house (fortune)
            'weight': 1.0,
            'description': 'Financial prosperity and material gains'
        },
        'business': {
            'primary': [10, 6],      # 10th house (career), 6th house (service)
            'secondary': [3, 11],    # 3rd house (initiative), 11th house (profits)
            'weight': 1.0,
            'description': 'Business success and professional achievements'
        },
        'health': {
            'primary': [1, 6],       # 1st house (body), 6th house (diseases)
            'secondary': [8, 12],    # 8th house (longevity), 12th house (hospitalization)
            'weight': 1.0,
            'description': 'Physical well-being and vitality'
        },
        'wife': {
            'primary': [7],          # 7th house (spouse)
            'secondary': [2, 4, 8],  # 2nd house (family), 4th house (happiness), 8th house (in-laws)
            'weight': 1.0,
            'description': 'Marriage and spousal relationships'
        },
        'kids': {
            'primary': [5],          # 5th house (children)
            'secondary': [9, 11],    # 9th house (progeny), 11th house (fulfillment)
            'weight': 1.0,
            'description': 'Children and creative expression'
        },
        'career': {
            'primary': [10],         # 10th house (profession)
            'secondary': [1, 6, 11], # 1st house (self), 6th house (service), 11th house (achievements)
            'weight': 1.0,
            'description': 'Professional success and recognition'
        }
    }
    
    # Planet exaltation signs (0-based)
    EXALTATION_SIGNS = {
        'Sun': 0,      # Aries
        'Moon': 1,     # Taurus
        'Mars': 9,     # Capricorn
        'Mercury': 5,  # Virgo
        'Jupiter': 3,  # Cancer
        'Venus': 11,   # Pisces
        'Saturn': 6,   # Libra
        'Rahu': 5,     # Virgo (some traditions)
        'Ketu': 11     # Pisces (some traditions)
    }
    
    # Planet debilitation signs (0-based)
    DEBILITATION_SIGNS = {
        'Sun': 6,      # Libra
        'Moon': 7,     # Scorpio
        'Mars': 3,     # Cancer
        'Mercury': 11, # Pisces
        'Jupiter': 9,  # Capricorn
        'Venus': 5,    # Virgo
        'Saturn': 0,   # Aries
        'Rahu': 11,    # Pisces (some traditions)
        'Ketu': 5     # Virgo (some traditions)
    }
    
    # Planet natural benefic/malefic nature
    NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Moon', 'Mercury']
    NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']
    
    def __init__(self):
        """Initialize intensity calculator."""
        pass
    
    def calculate_all_intensities(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate intensity scores for all Dasha-Bhukti periods.
        
        Args:
            chart_data: Complete chart data with planets, houses, dasha
            
        Returns:
            Dictionary with intensity scores and reasoning
        """
        try:
            logger.info("Starting Dasha-Bhukti intensity analysis")
            
            # Get dasha timeline (full 120-year cycle)
            # Check both dasha_navigator and dasha_timeline for compatibility
            dasha_navigator = chart_data.get('dasha_navigator', {})
            dasha_timeline = chart_data.get('dasha_timeline', {})
            planets = chart_data.get('planets', [])
            houses = chart_data.get('houses', [])
            birth_info = chart_data.get('birth_info', {})

            # Prefer dasha_navigator if it has navigator_data, otherwise use dasha_timeline
            if dasha_navigator and 'navigator_data' in dasha_navigator and dasha_navigator['navigator_data']:
                dasha_source = dasha_navigator
                mahadashas = dasha_source.get('navigator_data', [])
                logger.info(f"Using dasha_navigator format with {len(mahadashas)} Mahadashas")
            elif dasha_timeline and 'mahadashas' in dasha_timeline and dasha_timeline['mahadashas']:
                dasha_source = dasha_timeline
                mahadashas = dasha_source.get('mahadashas', [])
                logger.info(f"Using dasha_timeline format with {len(mahadashas)} Mahadashas")
            else:
                logger.warning("No valid dasha data found for intensity analysis")
                return self._get_empty_result()

            if not mahadashas or not planets:
                logger.warning("Missing dasha or planet data for intensity analysis")
                return self._get_empty_result()

            # Convert to internal format
            planet_data = self._convert_planet_data(planets)
            house_data = self._convert_house_data(houses)

            # Calculate intensities for each period
            intensity_results = []
            logger.info(f"Processing {len(mahadashas)} Mahadashas for intensity analysis")

            if not mahadashas:
                logger.warning("No mahadashas found in dasha data")
                return self._get_empty_result()

            for maha_idx, mahadasha in enumerate(mahadashas):
                try:
                    logger.debug(f"Processing mahadasha {maha_idx}: {type(mahadasha)} with keys {list(mahadasha.keys()) if isinstance(mahadasha, dict) else 'Not a dict'}")
                    # Handle both 'planet' and 'mahadasha' keys for planet name
                    maha_planet = mahadasha.get('planet', mahadasha.get('mahadasha'))
                    if not maha_planet:
                        raise KeyError("Neither 'planet' nor 'mahadasha' key found in mahadasha data")
                    logger.debug(f"Mahadasha planet: {maha_planet}")

                    # Handle both 'bhuktis' and 'antardashas' naming conventions
                    bhuktis = mahadasha.get('bhuktis', mahadasha.get('antardashas', []))
                    logger.debug(f"Processing Mahadasha {maha_planet} with {len(bhuktis)} Bhuktis/Antardashas")

                    for bhukti_idx, bhukti in enumerate(bhuktis):
                        try:
                            logger.debug(f"Processing bhukti {bhukti_idx}: {type(bhukti)} with keys {list(bhukti.keys()) if isinstance(bhukti, dict) else 'Not a dict'}")
                            bhukti_planet = bhukti['planet']
                            logger.debug(f"Bhukti planet: {bhukti_planet}")

                            # Calculate scores for all life areas
                            period_scores = self._calculate_period_scores(
                                maha_planet, bhukti_planet, planet_data, house_data
                            )

                            # Generate reasoning
                            reasoning = self._generate_period_reasoning(
                                maha_planet, bhukti_planet, period_scores, planet_data, house_data
                            )

                            # Format dates
                            start_date = bhukti.get('start_date', '')
                            end_date = bhukti.get('end_date', '')

                            if isinstance(start_date, datetime):
                                start_date = start_date.strftime('%Y-%m-%d')
                            if isinstance(end_date, datetime):
                                end_date = end_date.strftime('%Y-%m-%d')

                            intensity_results.append({
                                'mahadasha': maha_planet,
                                'bhukti': bhukti_planet,
                                'start_date': start_date,
                                'end_date': end_date,
                                'period_years': bhukti.get('duration_years', 0),
                                'scores': period_scores,
                                'reasoning': reasoning,
                                'maha_index': maha_idx,
                                'bhukti_index': bhukti_idx
                            })

                        except KeyError as e:
                            logger.error(f"KeyError in bhukti {bhukti_idx}: {e}")
                            logger.error(f"Bhukti data: {bhukti}")
                            raise
                except KeyError as e:
                    logger.error(f"KeyError in mahadasha {maha_idx}: {e}")
                    logger.error(f"Mahadasha data: {mahadasha}")
                    raise
            
            # Generate summary and analysis
            summary = self._generate_summary(intensity_results)
            methodology = self._get_methodology_notes()
            trends = self._calculate_trends(intensity_results)
            
            logger.info(f"Completed intensity analysis for {len(intensity_results)} periods")
            
            return {
                'success': True,
                'intensity_table': intensity_results,
                'summary': summary,
                'trends': trends,
                'methodology': methodology,
                'birth_info': birth_info,
                'total_periods': len(intensity_results),
                'life_areas': list(self.LIFE_AREAS.keys())
            }
            
        except Exception as e:
            logger.error(f"Error calculating intensities: {e}")
            return self._get_empty_result(error=str(e))
    
    def _calculate_period_scores(self, maha_planet: str, bhukti_planet: str,
                                planet_data: Dict, house_data: Dict) -> Dict[str, float]:
        """Calculate intensity scores for a specific Dasha-Bhukti period."""
        scores = {}
        
        for area, config in self.LIFE_AREAS.items():
            # Base score from Mahadasha planet (70% weight)
            maha_score = self._calculate_planet_score_for_area(
                maha_planet, area, config, planet_data, house_data
            )
            
            # Modifier from Bhukti planet (30% weight)
            bhukti_score = self._calculate_planet_score_for_area(
                bhukti_planet, area, config, planet_data, house_data
            )
            
            # Combined score (weighted average)
            combined_score = (maha_score * 0.7) + (bhukti_score * 0.3)
            
            # Apply additional modifiers
            combined_score = self._apply_planetary_combinations(
                combined_score, maha_planet, bhukti_planet, area, planet_data
            )
            
            # Normalize to 1-10 scale
            final_score = max(1.0, min(10.0, combined_score))
            scores[area] = round(final_score, 1)
        
        return scores
    
    def _calculate_planet_score_for_area(self, planet: str, area: str, 
                                       config: Dict, planet_data: Dict, 
                                       house_data: Dict) -> float:
        """Calculate how a planet affects a specific life area."""
        if planet not in planet_data:
            return 5.0  # Neutral score for missing planet data
        
        planet_info = planet_data[planet]
        planet_house = planet_info.get('house', 1)
        planet_sign = planet_info.get('sign_number', 0)
        
        # Base score
        score = 5.0
        
        # House placement effect
        primary_houses = config['primary']
        secondary_houses = config['secondary']
        
        if planet_house in primary_houses:
            score += 2.5  # Strong positive effect
        elif planet_house in secondary_houses:
            score += 1.0  # Moderate positive effect
        
        # Special house considerations
        if area == 'health' and planet_house == 6:
            # 6th house can be challenging for health
            score -= 1.0
        elif area == 'health' and planet_house == 8:
            # 8th house can indicate health challenges
            score -= 0.5
        
        # Sign strength effect
        sign_strength = self._get_planet_sign_strength(planet, planet_sign)
        score += sign_strength
        
        # Natural benefic/malefic effect
        nature_effect = self._get_planet_nature_effect(planet, area)
        score += nature_effect
        
        # Aspect effects (simplified)
        aspect_effect = self._calculate_aspect_effects(planet, area, planet_data)
        score += aspect_effect
        
        return score
    
    def _get_planet_sign_strength(self, planet: str, sign_number: int) -> float:
        """Get planet strength in sign (-2 to +2)."""
        if planet in self.EXALTATION_SIGNS and self.EXALTATION_SIGNS[planet] == sign_number:
            return 2.0  # Exalted
        elif planet in self.DEBILITATION_SIGNS and self.DEBILITATION_SIGNS[planet] == sign_number:
            return -2.0  # Debilitated
        elif planet in ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']:
            # Own sign check (simplified)
            own_signs = {
                'Sun': [4],      # Leo
                'Moon': [3],     # Cancer
                'Mars': [0, 7],  # Aries, Scorpio
                'Mercury': [2, 5], # Gemini, Virgo
                'Jupiter': [8, 11], # Sagittarius, Pisces
                'Venus': [1, 6],   # Taurus, Libra
                'Saturn': [9, 10]  # Capricorn, Aquarius
            }
            if planet in own_signs and sign_number in own_signs[planet]:
                return 1.0  # Own sign
        
        return 0.0  # Neutral
    
    def _get_planet_nature_effect(self, planet: str, area: str) -> float:
        """Get effect based on planet's natural benefic/malefic nature."""
        if planet in self.NATURAL_BENEFICS:
            return 0.5  # Benefics generally give positive results
        elif planet in self.NATURAL_MALEFICS:
            # Malefics can be good for certain areas
            if area in ['business', 'career'] and planet in ['Mars', 'Saturn']:
                return 0.3  # Mars and Saturn can be good for work
            else:
                return -0.3  # Generally challenging
        
        return 0.0  # Neutral

    def _calculate_aspect_effects(self, planet: str, area: str, planet_data: Dict) -> float:
        """Calculate aspect effects on life area (simplified)."""
        # This is a simplified version - full implementation would be more complex
        aspect_effect = 0.0

        # Check if benefics aspect the planet
        benefic_aspects = 0
        malefic_aspects = 0

        for other_planet, other_info in planet_data.items():
            if other_planet == planet:
                continue

            # Simplified aspect calculation (7th house aspect for all planets)
            planet_house = planet_data[planet].get('house', 1)
            other_house = other_info.get('house', 1)

            house_diff = abs(planet_house - other_house)
            if house_diff == 6 or house_diff == 7:  # 7th house aspect
                if other_planet in self.NATURAL_BENEFICS:
                    benefic_aspects += 1
                elif other_planet in self.NATURAL_MALEFICS:
                    malefic_aspects += 1

        # Apply aspect effects
        aspect_effect += (benefic_aspects * 0.2) - (malefic_aspects * 0.1)

        return min(1.0, max(-1.0, aspect_effect))

    def _apply_planetary_combinations(self, base_score: float, maha_planet: str,
                                    bhukti_planet: str, area: str, planet_data: Dict) -> float:
        """Apply special planetary combination effects."""
        score = base_score

        # Jupiter-Venus combination (generally auspicious)
        if {maha_planet, bhukti_planet} == {'Jupiter', 'Venus'}:
            score += 0.5

        # Mars-Saturn combination (can be challenging)
        elif {maha_planet, bhukti_planet} == {'Mars', 'Saturn'}:
            score -= 0.3

        # Sun-Moon combination (good for leadership)
        elif {maha_planet, bhukti_planet} == {'Sun', 'Moon'}:
            if area in ['career', 'business']:
                score += 0.3

        # Mercury with benefics (good for business)
        elif 'Mercury' in {maha_planet, bhukti_planet} and area == 'business':
            other_planet = bhukti_planet if maha_planet == 'Mercury' else maha_planet
            if other_planet in self.NATURAL_BENEFICS:
                score += 0.4

        return score

    def _generate_period_reasoning(self, maha_planet: str, bhukti_planet: str,
                                 scores: Dict[str, float], planet_data: Dict,
                                 house_data: Dict) -> Dict[str, str]:
        """Generate detailed reasoning for each life area score."""
        reasoning = {}

        for area, score in scores.items():
            reason_parts = []

            # Get planet information
            maha_info = planet_data.get(maha_planet, {})
            bhukti_info = planet_data.get(bhukti_planet, {})

            maha_house = maha_info.get('house', 1)
            maha_sign = maha_info.get('sign', 'Unknown')
            bhukti_house = bhukti_info.get('house', 1)
            bhukti_sign = bhukti_info.get('sign', 'Unknown')

            # Mahadasha analysis
            reason_parts.append(f"Mahadasha of {maha_planet} in {maha_house}th house ({maha_sign})")

            # Bhukti analysis
            reason_parts.append(f"Bhukti of {bhukti_planet} in {bhukti_house}th house ({bhukti_sign})")

            # Area-specific analysis
            area_config = self.LIFE_AREAS[area]
            primary_houses = area_config['primary']
            secondary_houses = area_config['secondary']

            # House placement effects
            if maha_house in primary_houses:
                reason_parts.append(f"{maha_planet} strongly influences {area} from {maha_house}th house")
            elif maha_house in secondary_houses:
                reason_parts.append(f"{maha_planet} moderately supports {area} from {maha_house}th house")

            if bhukti_house in primary_houses:
                reason_parts.append(f"{bhukti_planet} enhances {area} results from {bhukti_house}th house")
            elif bhukti_house in secondary_houses:
                reason_parts.append(f"{bhukti_planet} provides additional support for {area}")

            # Sign strength effects
            maha_sign_strength = self._get_planet_sign_strength(maha_planet, maha_info.get('sign_number', 0))
            bhukti_sign_strength = self._get_planet_sign_strength(bhukti_planet, bhukti_info.get('sign_number', 0))

            if maha_sign_strength > 1.0:
                reason_parts.append(f"{maha_planet} is exalted, providing excellent results")
            elif maha_sign_strength < -1.0:
                reason_parts.append(f"{maha_planet} is debilitated, creating challenges")
            elif maha_sign_strength > 0:
                reason_parts.append(f"{maha_planet} is well-placed in own sign")

            if bhukti_sign_strength > 1.0:
                reason_parts.append(f"{bhukti_planet} exaltation amplifies positive outcomes")
            elif bhukti_sign_strength < -1.0:
                reason_parts.append(f"{bhukti_planet} debilitation may create obstacles")

            # Score interpretation
            if score >= 8.5:
                reason_parts.append("Excellent period with outstanding results expected")
            elif score >= 7.0:
                reason_parts.append("Very good period with significant positive outcomes")
            elif score >= 5.5:
                reason_parts.append("Good period with generally favorable results")
            elif score >= 4.0:
                reason_parts.append("Average period with mixed results")
            elif score >= 2.5:
                reason_parts.append("Challenging period requiring careful planning")
            else:
                reason_parts.append("Difficult period requiring patience and remedial measures")

            reasoning[area] = ". ".join(reason_parts) + "."

        return reasoning

    def _convert_planet_data(self, planets: List[Dict]) -> Dict[str, Dict]:
        """Convert planet list to dictionary format."""
        planet_dict = {}
        for planet in planets:
            planet_dict[planet['name']] = {
                'house': planet.get('house', 1),
                'sign': planet.get('sign', 'Aries'),
                'sign_number': planet.get('sign_number', 0),
                'longitude': planet.get('sidereal_longitude', 0.0),
                'degree_in_sign': planet.get('degree_in_sign', 0.0)
            }
        return planet_dict

    def _convert_house_data(self, houses: List[Dict]) -> Dict[int, Dict]:
        """Convert house list to dictionary format."""
        house_dict = {}
        for house in houses:
            house_dict[house['number']] = {
                'cusp_longitude': house.get('cusp_longitude', 0.0),
                'sign': house.get('sign', 'Aries')
            }
        return house_dict

    def _generate_summary(self, intensity_results: List[Dict]) -> Dict[str, Any]:
        """Generate summary statistics."""
        if not intensity_results:
            return {}

        # Calculate average scores by life area
        area_averages = {}
        area_counts = {}

        for area in self.LIFE_AREAS.keys():
            scores = [result['scores'][area] for result in intensity_results if area in result['scores']]
            if scores:
                area_averages[area] = round(sum(scores) / len(scores), 1)
                area_counts[area] = len(scores)
            else:
                area_averages[area] = 5.0
                area_counts[area] = 0

        # Find best and worst periods
        best_periods = {}
        worst_periods = {}

        for area in self.LIFE_AREAS.keys():
            best_score = 0
            worst_score = 10
            best_period = None
            worst_period = None

            for result in intensity_results:
                if area not in result['scores']:
                    continue

                score = result['scores'][area]
                period_name = f"{result['mahadasha']}-{result['bhukti']}"
                period_years = f"({result['start_date'][:4]}-{result['end_date'][:4]})"

                if score > best_score:
                    best_score = score
                    best_period = f"{period_name} {period_years}"
                if score < worst_score:
                    worst_score = score
                    worst_period = f"{period_name} {period_years}"

            best_periods[area] = {'period': best_period, 'score': best_score}
            worst_periods[area] = {'period': worst_period, 'score': worst_score}

        # Calculate overall statistics
        all_scores = []
        for result in intensity_results:
            all_scores.extend(result['scores'].values())

        overall_average = round(sum(all_scores) / len(all_scores), 1) if all_scores else 5.0

        return {
            'area_averages': area_averages,
            'area_counts': area_counts,
            'best_periods': best_periods,
            'worst_periods': worst_periods,
            'total_periods': len(intensity_results),
            'overall_average': overall_average,
            'score_distribution': self._calculate_score_distribution(all_scores)
        }

    def _calculate_score_distribution(self, scores: List[float]) -> Dict[str, int]:
        """Calculate distribution of scores across ranges."""
        if not scores:
            return {}

        distribution = {
            'excellent': 0,  # 8.5-10
            'very_good': 0,  # 7.0-8.4
            'good': 0,       # 5.5-6.9
            'average': 0,    # 4.0-5.4
            'challenging': 0, # 2.5-3.9
            'difficult': 0   # 1.0-2.4
        }

        for score in scores:
            if score >= 8.5:
                distribution['excellent'] += 1
            elif score >= 7.0:
                distribution['very_good'] += 1
            elif score >= 5.5:
                distribution['good'] += 1
            elif score >= 4.0:
                distribution['average'] += 1
            elif score >= 2.5:
                distribution['challenging'] += 1
            else:
                distribution['difficult'] += 1

        return distribution

    def _calculate_trends(self, intensity_results: List[Dict]) -> Dict[str, List[Dict]]:
        """Calculate trend data for visualization."""
        trends = {}

        for area in self.LIFE_AREAS.keys():
            area_trends = []

            for result in intensity_results:
                if area in result['scores']:
                    area_trends.append({
                        'period': f"{result['mahadasha']}-{result['bhukti']}",
                        'start_year': int(result['start_date'][:4]) if result['start_date'] else 0,
                        'end_year': int(result['end_date'][:4]) if result['end_date'] else 0,
                        'score': result['scores'][area],
                        'mahadasha': result['mahadasha'],
                        'bhukti': result['bhukti']
                    })

            # Sort by start year
            area_trends.sort(key=lambda x: x['start_year'])
            trends[area] = area_trends

        return trends

    def _get_methodology_notes(self) -> Dict[str, str]:
        """Get methodology explanation."""
        return {
            'scoring_system': "Scores range from 1-10, where 10 is most favorable and 1 is most challenging",
            'calculation_method': "Weighted combination of Mahadasha planet (70%) and Bhukti planet (30%) effects",
            'house_analysis': "Primary and secondary house influences are considered for each life area",
            'planetary_strength': "Exaltation, debilitation, own sign placement, and natural benefic/malefic nature included",
            'life_areas': "Six key areas analyzed: Wealth (financial prosperity), Business (professional success), Health (physical well-being), Wife (marriage/relationships), Kids (children/creativity), Career (professional recognition)",
            'aspect_effects': "Planetary aspects and combinations are factored into the calculations",
            'time_period': "Analysis covers the complete 120-year Vimshottari Dasha cycle from birth"
        }

    def _get_empty_result(self, error: str = None) -> Dict[str, Any]:
        """Return empty result structure."""
        return {
            'success': False,
            'error': error,
            'intensity_table': [],
            'summary': {},
            'trends': {},
            'methodology': self._get_methodology_notes(),
            'birth_info': {},
            'total_periods': 0,
            'life_areas': list(self.LIFE_AREAS.keys())
        }
