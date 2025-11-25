"""KP Prediction Module.

This module implements event prediction logic using KP (Krishnamurti Paddhati) principles.
Predictions are based on significators, sub-lords, and cuspal interlinks.

Key Principles:
1. A planet gives results of houses it signifies
2. Sub-lord of the cusp is the most powerful significator
3. For an event to happen, significators of related houses must be connected
4. Timing is determined by dasha/transit of significators

House Significations:
- 1st: Self, health, personality
- 2nd: Wealth, family, speech
- 3rd: Siblings, courage, short travels
- 4th: Mother, home, property, education
- 5th: Children, intelligence, speculation
- 6th: Enemies, diseases, debts, service
- 7th: Marriage, partnerships, spouse
- 8th: Longevity, obstacles, inheritance
- 9th: Father, fortune, long travels, higher education
- 10th: Career, profession, status
- 11th: Gains, income, elder siblings
- 12th: Losses, expenses, foreign lands, moksha
"""

from typing import Dict, Any, List, Set
from dataclasses import dataclass
from datetime import datetime


@dataclass
class EventPrediction:
    """Prediction for a specific life event."""
    event_type: str
    event_name: str
    houses_involved: List[int]
    common_significators: List[str]
    promise_status: str  # "Promised", "Denied", "Delayed", "Uncertain"
    strength: str  # "Strong", "Medium", "Weak"
    description: str
    sub_lord_analysis: str
    recommendations: List[str]


# House combinations for major life events
EVENT_HOUSE_COMBINATIONS = {
    'marriage': {
        'primary': [7],  # 7th house - spouse
        'secondary': [2, 11],  # 2nd - family, 11th - fulfillment
        'denial': [1, 6, 10],  # 1st - self-denial, 6th - separation, 10th - delay
        'name': 'Marriage',
        'description': 'Marriage and partnerships'
    },
    'career': {
        'primary': [10],  # 10th house - profession
        'secondary': [2, 6, 11],  # 2nd - income, 6th - service, 11th - gains
        'denial': [4, 8, 12],  # 4th - home, 8th - obstacles, 12th - loss
        'name': 'Career Success',
        'description': 'Career and professional advancement'
    },
    'children': {
        'primary': [5],  # 5th house - children
        'secondary': [2, 11],  # 2nd - family expansion, 11th - fulfillment
        'denial': [1, 6, 10],  # 1st - self, 6th - health issues, 10th - delay
        'name': 'Children',
        'description': 'Birth of children'
    },
    'education': {
        'primary': [4],  # 4th house - basic education
        'secondary': [9, 11],  # 9th - higher education, 11th - success
        'denial': [3, 6, 8],  # 3rd - interruption, 6th - obstacles, 8th - failure
        'name': 'Education',
        'description': 'Educational achievements'
    },
    'property': {
        'primary': [4],  # 4th house - property
        'secondary': [11],  # 11th - gains
        'denial': [6, 8, 12],  # 6th - debts, 8th - obstacles, 12th - loss
        'name': 'Property Acquisition',
        'description': 'Buying or inheriting property'
    },
    'foreign_travel': {
        'primary': [12],  # 12th house - foreign lands
        'secondary': [3, 9],  # 3rd - short travel, 9th - long travel
        'denial': [1, 4, 10],  # 1st - staying put, 4th - home, 10th - work
        'name': 'Foreign Travel/Settlement',
        'description': 'Travel abroad or foreign settlement'
    },
    'business': {
        'primary': [10],  # 10th house - profession
        'secondary': [7, 11],  # 7th - partnerships, 11th - profits
        'denial': [5, 8, 12],  # 5th - speculation loss, 8th - obstacles, 12th - loss
        'name': 'Business',
        'description': 'Starting or expanding business'
    },
    'health': {
        'primary': [1],  # 1st house - body/health
        'secondary': [5, 11],  # 5th - vitality, 11th - recovery
        'denial': [6, 8, 12],  # 6th - disease, 8th - chronic, 12th - hospitalization
        'name': 'Health & Recovery',
        'description': 'Good health and recovery from illness'
    },
    'financial_gains': {
        'primary': [11],  # 11th house - gains
        'secondary': [2, 5],  # 2nd - wealth, 5th - speculation
        'denial': [6, 8, 12],  # 6th - debts, 8th - losses, 12th - expenses
        'name': 'Financial Gains',
        'description': 'Financial prosperity and income'
    },
    'spiritual_growth': {
        'primary': [12],  # 12th house - moksha
        'secondary': [9],  # 9th - dharma
        'denial': [2, 7, 11],  # 2nd - materialism, 7th - worldly, 11th - desires
        'name': 'Spiritual Growth',
        'description': 'Spiritual development and liberation'
    },
}


class KPPredictionEngine:
    """
    KP Prediction Engine.

    Generates predictions for life events based on KP significators and sub-lords.
    """

    def __init__(self):
        """Initialize the prediction engine."""
        self.event_combinations = EVENT_HOUSE_COMBINATIONS

    def predict_all_events(
        self,
        house_significators: Dict[int, Any],
        planet_significators: Dict[str, Any],
        ruling_planets: Dict[str, Any]
    ) -> List[EventPrediction]:
        """
        Generate predictions for all major life events.

        Args:
            house_significators: Significators for each house
            planet_significators: Houses signified by each planet
            ruling_planets: Ruling planets at birth

        Returns:
            List of EventPrediction objects
        """
        predictions = []

        for event_type, event_config in self.event_combinations.items():
            prediction = self.predict_event(
                event_type=event_type,
                event_config=event_config,
                house_significators=house_significators,
                planet_significators=planet_significators,
                ruling_planets=ruling_planets
            )
            predictions.append(prediction)

        return predictions

    def predict_event(
        self,
        event_type: str,
        event_config: Dict,
        house_significators: Dict[int, Any],
        planet_significators: Dict[str, Any],
        ruling_planets: Dict[str, Any]
    ) -> EventPrediction:
        """
        Predict a specific event using KP principles.

        Args:
            event_type: Type of event (e.g., 'marriage', 'career')
            event_config: Configuration for the event
            house_significators: Significators for each house
            planet_significators: Houses signified by each planet
            ruling_planets: Ruling planets at birth

        Returns:
            EventPrediction object
        """
        # Get houses involved
        primary_houses = event_config['primary']
        secondary_houses = event_config['secondary']
        denial_houses = event_config.get('denial', [])
        all_houses = primary_houses + secondary_houses

        # Find common significators
        common_sigs = self._find_common_significators(
            all_houses, house_significators
        )

        # Check sub-lord promise
        promise_status, sub_lord_analysis = self._check_sub_lord_promise(
            primary_houses, secondary_houses, denial_houses, house_significators
        )

        # Determine strength
        strength = self._determine_strength(
            common_sigs, ruling_planets, promise_status
        )

        # Generate recommendations
        recommendations = self._generate_recommendations(
            event_type, promise_status, strength, common_sigs
        )

        return EventPrediction(
            event_type=event_type,
            event_name=event_config['name'],
            houses_involved=all_houses,
            common_significators=common_sigs,
            promise_status=promise_status,
            strength=strength,
            description=event_config['description'],
            sub_lord_analysis=sub_lord_analysis,
            recommendations=recommendations
        )

    def _find_common_significators(
        self,
        houses: List[int],
        house_significators: Dict[int, Any]
    ) -> List[str]:
        """
        Find planets that are common significators of multiple houses.

        Args:
            houses: List of house numbers
            house_significators: Significators for each house

        Returns:
            List of common significator planet names
        """
        if not houses:
            return []

        # Get significators for first house
        first_house = houses[0]
        if first_house not in house_significators:
            return []

        common_set = set(house_significators[first_house].get('all_significators', []))

        # Find intersection with other houses
        for house_num in houses[1:]:
            if house_num in house_significators:
                house_sigs = set(house_significators[house_num].get('all_significators', []))
                common_set = common_set.intersection(house_sigs)

        return list(common_set)

    def _check_sub_lord_promise(
        self,
        primary_houses: List[int],
        secondary_houses: List[int],
        denial_houses: List[int],
        house_significators: Dict[int, Any]
    ) -> tuple:
        """
        Check if sub-lords promise the event.

        The sub-lord of the cusp is the most powerful significator.
        If sub-lord signifies denial houses, event is denied.
        If sub-lord signifies promise houses, event is promised.

        Args:
            primary_houses: Primary houses for the event
            secondary_houses: Secondary houses for the event
            denial_houses: Houses that deny the event
            house_significators: Significators for each house

        Returns:
            Tuple of (promise_status, analysis_text)
        """
        analysis_parts = []
        promise_count = 0
        denial_count = 0

        # Check sub-lords of primary houses
        for house_num in primary_houses:
            if house_num not in house_significators:
                continue

            sub_lord = house_significators[house_num].get('cusp_sub_lord', '')
            if not sub_lord:
                continue

            # Check what this sub-lord signifies
            signified_houses = self._get_houses_signified_by_planet(
                sub_lord, house_significators
            )

            # Check for promise
            promise_houses = set(primary_houses + secondary_houses)
            if promise_houses.intersection(signified_houses):
                promise_count += 1
                analysis_parts.append(
                    f"House {house_num} sub-lord {sub_lord} signifies promise houses {sorted(promise_houses.intersection(signified_houses))}"
                )

            # Check for denial
            if set(denial_houses).intersection(signified_houses):
                denial_count += 1
                analysis_parts.append(
                    f"House {house_num} sub-lord {sub_lord} signifies denial houses {sorted(set(denial_houses).intersection(signified_houses))}"
                )

        # Determine overall status
        if denial_count > promise_count:
            status = "Denied"
        elif promise_count > denial_count:
            status = "Promised"
        elif promise_count > 0:
            status = "Delayed"
        else:
            status = "Uncertain"

        analysis = "; ".join(analysis_parts) if analysis_parts else "Insufficient data for sub-lord analysis"

        return status, analysis

    def _get_houses_signified_by_planet(
        self,
        planet_name: str,
        house_significators: Dict[int, Any]
    ) -> Set[int]:
        """
        Get all houses signified by a planet.

        Args:
            planet_name: Name of the planet
            house_significators: Significators for each house

        Returns:
            Set of house numbers
        """
        houses = set()

        for house_num, sig_data in house_significators.items():
            all_sigs = sig_data.get('all_significators', [])
            if planet_name in all_sigs:
                houses.add(house_num)

        return houses

    def _determine_strength(
        self,
        common_significators: List[str],
        ruling_planets: Dict[str, Any],
        promise_status: str
    ) -> str:
        """
        Determine the strength of the prediction.

        Args:
            common_significators: Common significators for the event
            ruling_planets: Ruling planets at birth
            promise_status: Promise status from sub-lord analysis

        Returns:
            Strength rating: "Strong", "Medium", or "Weak"
        """
        strength_score = 0

        # More common significators = stronger
        if len(common_significators) >= 3:
            strength_score += 2
        elif len(common_significators) >= 1:
            strength_score += 1

        # Ruling planets involved = stronger
        if ruling_planets:
            ruling_planet_names = []
            if 'day_lord' in ruling_planets:
                ruling_planet_names.append(ruling_planets['day_lord'])
            if 'ascendant_star_lord' in ruling_planets:
                ruling_planet_names.append(ruling_planets['ascendant_star_lord'])
            if 'moon_star_lord' in ruling_planets:
                ruling_planet_names.append(ruling_planets['moon_star_lord'])

            for planet in common_significators:
                if planet in ruling_planet_names:
                    strength_score += 1
                    break

        # Promise status affects strength
        if promise_status == "Promised":
            strength_score += 2
        elif promise_status == "Delayed":
            strength_score += 1
        elif promise_status == "Denied":
            strength_score -= 2

        # Determine final strength
        if strength_score >= 4:
            return "Strong"
        elif strength_score >= 2:
            return "Medium"
        else:
            return "Weak"

    def _generate_recommendations(
        self,
        event_type: str,
        promise_status: str,
        strength: str,
        common_significators: List[str]
    ) -> List[str]:
        """
        Generate recommendations based on the prediction.

        Args:
            event_type: Type of event
            promise_status: Promise status
            strength: Strength of prediction
            common_significators: Common significators

        Returns:
            List of recommendation strings
        """
        recommendations = []

        if promise_status == "Promised" and strength == "Strong":
            recommendations.append(
                f"The event is strongly promised. Favorable periods are during dasha/antardasha of: {', '.join(common_significators[:3])}"
            )
        elif promise_status == "Promised" and strength == "Medium":
            recommendations.append(
                f"The event is promised but with moderate strength. Watch for periods of: {', '.join(common_significators[:3])}"
            )
        elif promise_status == "Delayed":
            recommendations.append(
                "The event may be delayed. Patience and proper timing are important."
            )
            if common_significators:
                recommendations.append(
                    f"Favorable periods: dasha/antardasha of {', '.join(common_significators[:2])}"
                )
        elif promise_status == "Denied":
            recommendations.append(
                "The event faces significant obstacles or denial. Consider alternative approaches."
            )
        else:
            recommendations.append(
                "Uncertain outcome. Consult detailed horoscope analysis for clarity."
            )

        # Event-specific recommendations
        if event_type == "marriage" and promise_status in ["Promised", "Delayed"]:
            recommendations.append(
                "Consider matching horoscopes (Kundali Milan) for compatibility."
            )
        elif event_type == "career" and promise_status in ["Promised", "Delayed"]:
            recommendations.append(
                "Focus on skill development and networking during favorable periods."
            )
        elif event_type == "health" and promise_status == "Denied":
            recommendations.append(
                "Take preventive health measures and consult medical professionals."
            )

        return recommendations

    def format_predictions_for_display(
        self,
        predictions: List[EventPrediction]
    ) -> List[Dict[str, Any]]:
        """
        Format predictions for JSON serialization.

        Args:
            predictions: List of EventPrediction objects

        Returns:
            List of dictionaries
        """
        formatted = []

        for pred in predictions:
            formatted.append({
                'event_type': pred.event_type,
                'event_name': pred.event_name,
                'houses_involved': pred.houses_involved,
                'common_significators': pred.common_significators,
                'promise_status': pred.promise_status,
                'strength': pred.strength,
                'description': pred.description,
                'sub_lord_analysis': pred.sub_lord_analysis,
                'recommendations': pred.recommendations
            })

        return formatted
