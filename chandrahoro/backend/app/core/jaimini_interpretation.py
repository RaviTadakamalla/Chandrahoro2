"""Jaimini Interpretation Engine - K.N. Rao's Method.

This module implements interpretation and prediction logic based on K.N. Rao's
Jaimini methodology. It analyzes Chara Dasha periods, Yogas, and Karakas to
generate life event predictions.

Copyright (C) 2025 ChandraHoro Development Team
Licensed under GNU AGPL v3.0
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class JaiminiInterpreter:
    """Interpret Jaimini chart data and generate predictions."""
    
    # Life stages (Ashramas)
    LIFE_STAGES = {
        'brahmacharya': {'age_range': (0, 25), 'focus': 'Education, learning, discipline'},
        'grihastha': {'age_range': (25, 50), 'focus': 'Career, family, worldly achievements'},
        'vanaprastha': {'age_range': (50, 75), 'focus': 'Mentoring, service, detachment'},
        'sannyasa': {'age_range': (75, 100), 'focus': 'Spirituality, liberation, wisdom'},
    }
    
    # Purusharthas (Life goals)
    PURUSHARTHAS = {
        'dharma': {'houses': [1, 5, 9], 'meaning': 'Righteousness, duty, spiritual law'},
        'artha': {'houses': [2, 6, 10], 'meaning': 'Wealth, career, material success'},
        'kama': {'houses': [3, 7, 11], 'meaning': 'Desires, relationships, pleasures'},
        'moksha': {'houses': [4, 8, 12], 'meaning': 'Liberation, spirituality, transcendence'},
    }
    
    def __init__(self):
        """Initialize Jaimini interpreter."""
        pass
    
    def interpret_dasha_period(
        self,
        dasha_sign: int,
        dasha_sign_name: str,
        start_date: datetime,
        end_date: datetime,
        planets_in_sign: List[str],
        aspecting_signs: List[int],
        chara_karakas: Dict[str, Dict],
        ascendant_sign: int
    ) -> Dict[str, Any]:
        """
        Interpret a Chara Dasha period using K.N. Rao's method.
        
        K.N. Rao's Key Principle:
        "Treat the running dasha rashi as Lagna and analyze which houses
        are strong from that rashi."
        
        Args:
            dasha_sign: Sign number of the dasha (1-12)
            dasha_sign_name: Name of the dasha sign
            start_date: Start date of the dasha
            end_date: End date of the dasha
            planets_in_sign: Planets placed in the dasha sign
            aspecting_signs: Signs that aspect the dasha sign
            chara_karakas: Chara Karaka data
            ascendant_sign: Birth chart ascendant sign
        
        Returns:
            Dictionary with interpretation and predictions
        """
        interpretation = {
            'dasha_sign': dasha_sign,
            'dasha_sign_name': dasha_sign_name,
            'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            'themes': [],
            'predictions': [],
            'favorable_areas': [],
            'challenging_areas': [],
            'life_stage': self._determine_life_stage(start_date),
            'purushartha_focus': self._determine_purushartha(dasha_sign, ascendant_sign),
        }
        
        # Analyze planets in dasha sign
        if planets_in_sign:
            interpretation['themes'].append(f"Planets in {dasha_sign_name}: {', '.join(planets_in_sign)}")
            
            # Check for Karakas in dasha sign
            for karaka_name, karaka_data in chara_karakas.items():
                if karaka_data['planet'] in planets_in_sign:
                    interpretation['themes'].append(
                        f"{karaka_name} ({karaka_data['planet']}) activates {self._get_karaka_meaning(karaka_name)}"
                    )
        
        # Analyze house position from ascendant
        house_from_lagna = ((dasha_sign - ascendant_sign) % 12) + 1
        interpretation['house_from_lagna'] = house_from_lagna
        interpretation['house_signification'] = self._get_house_signification(house_from_lagna)
        
        # Generate predictions based on house
        interpretation['predictions'].extend(
            self._generate_house_predictions(house_from_lagna, dasha_sign_name)
        )
        
        # Analyze Kendra/Trikona positions
        if house_from_lagna in [1, 4, 7, 10]:
            interpretation['favorable_areas'].append('Kendra house - Strong period for action and achievement')
        elif house_from_lagna in [1, 5, 9]:
            interpretation['favorable_areas'].append('Trikona house - Fortunate period with divine grace')
        elif house_from_lagna in [6, 8, 12]:
            interpretation['challenging_areas'].append('Dusthana house - Period requiring effort and perseverance')
        
        return interpretation
    
    def _determine_life_stage(self, date: datetime) -> str:
        """Determine life stage based on age (approximate)."""
        # This is a simplified version - in real implementation,
        # we would calculate age from birth date
        year = date.year
        current_year = datetime.now().year
        
        # For demonstration, use year ranges
        if year < 2000:
            return 'brahmacharya'
        elif year < 2025:
            return 'grihastha'
        elif year < 2050:
            return 'vanaprastha'
        else:
            return 'sannyasa'
    
    def _determine_purushartha(self, dasha_sign: int, ascendant_sign: int) -> str:
        """Determine which Purushartha is emphasized in this dasha."""
        house_from_lagna = ((dasha_sign - ascendant_sign) % 12) + 1
        
        for purushartha, data in self.PURUSHARTHAS.items():
            if house_from_lagna in data['houses']:
                return purushartha
        
        return 'dharma'  # Default
    
    def _get_karaka_meaning(self, karaka_name: str) -> str:
        """Get the meaning of a Karaka."""
        meanings = {
            'Atmakaraka': 'self-realization and soul purpose',
            'Amatyakaraka': 'career and professional achievements',
            'Bhratrikaraka': 'courage and sibling relationships',
            'Matrikaraka': 'mother and emotional well-being',
            'Putrakaraka': 'children and creative expression',
            'Gnatikaraka': 'obstacles and health challenges',
            'Darakaraka': 'spouse and partnerships',
        }
        return meanings.get(karaka_name, 'life themes')

    def _get_house_signification(self, house: int) -> str:
        """Get the signification of a house."""
        significations = {
            1: 'Self, personality, health, vitality',
            2: 'Wealth, family, speech, food',
            3: 'Courage, siblings, communication, short journeys',
            4: 'Mother, home, property, emotions, education',
            5: 'Children, creativity, intelligence, romance',
            6: 'Enemies, diseases, obstacles, service',
            7: 'Spouse, partnerships, business',
            8: 'Longevity, transformation, occult, inheritance',
            9: 'Fortune, father, spirituality, long journeys',
            10: 'Career, profession, status, reputation',
            11: 'Gains, income, elder siblings, aspirations',
            12: 'Losses, expenses, spirituality, foreign lands',
        }
        return significations.get(house, 'Unknown')

    def _generate_house_predictions(self, house: int, sign_name: str) -> List[str]:
        """Generate predictions based on house position."""
        predictions = []

        house_predictions = {
            1: [
                'Focus on personal development and self-improvement',
                'Good period for health initiatives and physical fitness',
                'Increased self-confidence and leadership abilities',
            ],
            2: [
                'Financial opportunities and wealth accumulation',
                'Family matters gain importance',
                'Focus on speech, communication, and learning',
            ],
            3: [
                'Courage and initiative bring success',
                'Good for sibling relationships and teamwork',
                'Communication skills and short travels highlighted',
            ],
            4: [
                'Home and property matters come to focus',
                'Emotional well-being and inner peace',
                'Mother\'s influence or property gains possible',
            ],
            5: [
                'Creative projects and romantic relationships flourish',
                'Children bring joy and fulfillment',
                'Intelligence and speculative gains favored',
            ],
            6: [
                'Period requiring effort to overcome obstacles',
                'Health issues may need attention',
                'Service to others brings growth',
            ],
            7: [
                'Marriage and partnerships emphasized',
                'Business collaborations favored',
                'Spouse plays important role in life',
            ],
            8: [
                'Transformative period with deep changes',
                'Interest in occult and hidden knowledge',
                'Inheritance or sudden gains possible',
            ],
            9: [
                'Fortune and divine grace active',
                'Spiritual growth and higher learning',
                'Father\'s influence or long journeys',
            ],
            10: [
                'Career advancement and professional recognition',
                'Public status and reputation improve',
                'Authority and leadership opportunities',
            ],
            11: [
                'Financial gains and income increase',
                'Aspirations and goals fulfilled',
                'Elder siblings or friends bring benefits',
            ],
            12: [
                'Spiritual pursuits and meditation favored',
                'Foreign connections or travel possible',
                'Period for letting go and detachment',
            ],
        }

        return house_predictions.get(house, ['General life themes active'])

    def interpret_yoga_effects(self, yoga: Dict[str, Any]) -> Dict[str, Any]:
        """
        Interpret the effects of a Jaimini yoga.

        Args:
            yoga: Yoga data from JaiminiYogaDetector

        Returns:
            Dictionary with detailed interpretation
        """
        interpretation = {
            'yoga_name': yoga['name'],
            'type': yoga['type'],
            'strength': yoga['strength'],
            'timing': self._get_yoga_timing(yoga),
            'manifestation': self._get_yoga_manifestation(yoga),
            'recommendations': self._get_yoga_recommendations(yoga),
        }

        return interpretation

    def _get_yoga_timing(self, yoga: Dict[str, Any]) -> str:
        """Determine when a yoga is likely to manifest."""
        strength = yoga.get('strength', 'moderate')

        if strength == 'very_strong':
            return 'Manifests strongly throughout life, especially during related dasha periods'
        elif strength == 'strong':
            return 'Manifests during dasha periods of involved planets'
        elif strength == 'moderate':
            return 'Manifests moderately during favorable transits'
        else:
            return 'Weak manifestation, requires supporting factors'

    def _get_yoga_manifestation(self, yoga: Dict[str, Any]) -> str:
        """Describe how a yoga manifests in life."""
        yoga_type = yoga.get('type', 'raja')

        manifestations = {
            'raja': 'Power, position, recognition, and success in worldly affairs',
            'career': 'Professional achievements, career advancement, and work satisfaction',
            'marriage': 'Harmonious relationships, supportive spouse, and partnership success',
            'spiritual': 'Spiritual growth, inner peace, and connection to higher consciousness',
            'wealth': 'Financial prosperity, material abundance, and economic stability',
        }

        return manifestations.get(yoga_type, 'General positive effects in life')

    def _get_yoga_recommendations(self, yoga: Dict[str, Any]) -> List[str]:
        """Get recommendations to maximize yoga benefits."""
        yoga_type = yoga.get('type', 'raja')
        strength = yoga.get('strength', 'moderate')

        recommendations = []

        if strength in ['very_strong', 'strong']:
            recommendations.append('This yoga is strong - actively pursue related opportunities')
        else:
            recommendations.append('Strengthen this yoga through remedies and conscious effort')

        type_recommendations = {
            'raja': [
                'Take leadership roles and positions of authority',
                'Build your public image and reputation',
                'Engage in activities that bring recognition',
            ],
            'career': [
                'Focus on professional development and skill building',
                'Network with influential people in your field',
                'Take calculated risks in career advancement',
            ],
            'marriage': [
                'Invest time and energy in your relationship',
                'Communicate openly with your partner',
                'Create harmony and balance in partnership',
            ],
            'spiritual': [
                'Dedicate time to meditation and spiritual practices',
                'Study sacred texts and philosophical teachings',
                'Seek guidance from spiritual mentors',
            ],
            'wealth': [
                'Make wise financial investments',
                'Develop multiple income streams',
                'Practice generosity and charitable giving',
            ],
        }

        recommendations.extend(type_recommendations.get(yoga_type, []))

        return recommendations

    def perform_three_dimensional_analysis(
        self,
        birth_date: datetime,
        chara_karakas: Dict[str, Dict],
        karakamsha: Dict[str, Any],
        arudha_padas: Dict[str, Any],
        current_dasha: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Perform K.N. Rao's three-dimensional analysis.

        Triangle 1: Life Stages (Ashramas)
        Triangle 2: Life Goals (Purusharthas)
        Triangle 3: Spiritual Progression

        Args:
            birth_date: Date of birth
            chara_karakas: Chara Karaka data
            karakamsha: Karakamsha data
            arudha_padas: Arudha Pada data
            current_dasha: Current dasha period (optional)

        Returns:
            Dictionary with three-dimensional analysis
        """
        analysis = {
            'triangle_1_life_stages': self._analyze_life_stages(birth_date),
            'triangle_2_purusharthas': self._analyze_purusharthas(chara_karakas, karakamsha),
            'triangle_3_spiritual': self._analyze_spiritual_progression(
                chara_karakas, karakamsha, arudha_padas
            ),
            'synthesis': self._synthesize_three_dimensions(
                birth_date, chara_karakas, karakamsha, arudha_padas
            ),
        }

        return analysis

    def _analyze_life_stages(self, birth_date: datetime) -> Dict[str, Any]:
        """Analyze life stages (Ashramas)."""
        current_year = datetime.now().year
        birth_year = birth_date.year
        age = current_year - birth_year

        # Determine current life stage
        current_stage = 'brahmacharya'
        for stage, data in self.LIFE_STAGES.items():
            age_min, age_max = data['age_range']
            if age_min <= age < age_max:
                current_stage = stage
                break

        return {
            'current_age': age,
            'current_stage': current_stage,
            'stage_focus': self.LIFE_STAGES[current_stage]['focus'],
            'all_stages': self.LIFE_STAGES,
            'recommendations': self._get_stage_recommendations(current_stage),
        }

    def _analyze_purusharthas(
        self,
        chara_karakas: Dict[str, Dict],
        karakamsha: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze life goals (Purusharthas)."""
        # Determine dominant Purushartha based on Atmakaraka and Karakamsha
        atmakaraka = chara_karakas.get('Atmakaraka', {})
        karakamsha_sign = karakamsha.get('navamsa_sign_number', 1)

        # Classify Karakamsha sign into Purushartha
        purushartha_classification = {
            1: 'dharma', 2: 'artha', 3: 'kama', 4: 'moksha',
            5: 'dharma', 6: 'artha', 7: 'kama', 8: 'moksha',
            9: 'dharma', 10: 'artha', 11: 'kama', 12: 'moksha',
        }

        dominant_purushartha = purushartha_classification.get(karakamsha_sign, 'dharma')

        return {
            'dominant_purushartha': dominant_purushartha,
            'meaning': self.PURUSHARTHAS[dominant_purushartha]['meaning'],
            'life_focus': self._get_purushartha_focus(dominant_purushartha),
            'all_purusharthas': self.PURUSHARTHAS,
            'balance_recommendations': self._get_purushartha_balance_recommendations(dominant_purushartha),
        }

    def _analyze_spiritual_progression(
        self,
        chara_karakas: Dict[str, Dict],
        karakamsha: Dict[str, Any],
        arudha_padas: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze spiritual progression (K.N. Rao's third triangle)."""
        # Compare Karakamsha (spiritual) with Arudha Lagna (material)
        karakamsha_sign = karakamsha.get('navamsa_sign_number', 1)
        arudha_lagna = arudha_padas.get('AL', {})
        al_sign = arudha_lagna.get('sign_number', 1)

        # Calculate distance between spiritual and material
        distance = abs(karakamsha_sign - al_sign)

        # Determine spiritual progression stage
        if distance <= 2:
            stage = 'extroversion_control'
            description = 'Learning to control external desires and material attachments'
        elif distance <= 6:
            stage = 'introversion'
            description = 'Turning inward, developing self-awareness and introspection'
        else:
            stage = 'spiritual_blossoming'
            description = 'Advanced spiritual development, seeking liberation and higher truth'

        return {
            'current_stage': stage,
            'description': description,
            'karakamsha_sign': karakamsha.get('navamsa_sign_name', 'Unknown'),
            'arudha_lagna_sign': arudha_lagna.get('sign_name', 'Unknown'),
            'material_spiritual_balance': self._assess_material_spiritual_balance(distance),
            'spiritual_practices': self._recommend_spiritual_practices(stage),
        }

    def _synthesize_three_dimensions(
        self,
        birth_date: datetime,
        chara_karakas: Dict[str, Dict],
        karakamsha: Dict[str, Any],
        arudha_padas: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Synthesize all three dimensions into comprehensive guidance."""
        life_stage_analysis = self._analyze_life_stages(birth_date)
        purushartha_analysis = self._analyze_purusharthas(chara_karakas, karakamsha)
        spiritual_analysis = self._analyze_spiritual_progression(chara_karakas, karakamsha, arudha_padas)

        return {
            'overall_life_path': self._determine_life_path(
                life_stage_analysis['current_stage'],
                purushartha_analysis['dominant_purushartha'],
                spiritual_analysis['current_stage']
            ),
            'current_priorities': self._determine_current_priorities(
                life_stage_analysis, purushartha_analysis, spiritual_analysis
            ),
            'long_term_guidance': self._provide_long_term_guidance(
                life_stage_analysis, purushartha_analysis, spiritual_analysis
            ),
        }

    def _get_stage_recommendations(self, stage: str) -> List[str]:
        """Get recommendations for current life stage."""
        recommendations = {
            'brahmacharya': [
                'Focus on education and skill development',
                'Build strong foundations for future',
                'Practice discipline and self-control',
            ],
            'grihastha': [
                'Balance career and family responsibilities',
                'Build wealth and security for family',
                'Fulfill social and familial duties',
            ],
            'vanaprastha': [
                'Begin gradual detachment from worldly affairs',
                'Mentor younger generation',
                'Increase spiritual practices',
            ],
            'sannyasa': [
                'Focus on spiritual liberation',
                'Share wisdom with seekers',
                'Prepare for final transition',
            ],
        }
        return recommendations.get(stage, [])

    def _get_purushartha_focus(self, purushartha: str) -> str:
        """Get focus areas for dominant Purushartha."""
        focus = {
            'dharma': 'Righteousness, duty, spiritual law, and ethical living',
            'artha': 'Wealth creation, career success, and material prosperity',
            'kama': 'Fulfillment of desires, relationships, and sensory pleasures',
            'moksha': 'Spiritual liberation, self-realization, and transcendence',
        }
        return focus.get(purushartha, 'Balanced life approach')

    def _get_purushartha_balance_recommendations(self, dominant: str) -> List[str]:
        """Get recommendations to balance Purusharthas."""
        return [
            f'Your dominant Purushartha is {dominant.upper()}',
            'While pursuing your dominant goal, maintain balance with other Purusharthas',
            'Dharma should guide all pursuits',
            'Artha and Kama should be pursued within Dharmic boundaries',
            'Moksha is the ultimate goal that transcends all others',
        ]

    def _assess_material_spiritual_balance(self, distance: int) -> str:
        """Assess balance between material and spiritual."""
        if distance <= 2:
            return 'Highly material focus - spiritual development needs attention'
        elif distance <= 6:
            return 'Balanced approach - integrating material and spiritual'
        else:
            return 'Strong spiritual orientation - material life may need grounding'

    def _recommend_spiritual_practices(self, stage: str) -> List[str]:
        """Recommend spiritual practices based on stage."""
        practices = {
            'extroversion_control': [
                'Practice mindfulness and present-moment awareness',
                'Reduce excessive material pursuits',
                'Begin simple meditation practices',
            ],
            'introversion': [
                'Deepen meditation practice',
                'Study spiritual texts and philosophy',
                'Seek guidance from spiritual teachers',
            ],
            'spiritual_blossoming': [
                'Advanced meditation and contemplation',
                'Service to humanity without expectation',
                'Preparation for self-realization',
            ],
        }
        return practices.get(stage, [])

    def _determine_life_path(self, life_stage: str, purushartha: str, spiritual_stage: str) -> str:
        """Determine overall life path based on three dimensions."""
        return (
            f"Currently in {life_stage.upper()} stage, with {purushartha.upper()} as dominant life goal, "
            f"and at {spiritual_stage.replace('_', ' ').upper()} level of spiritual development."
        )

    def _determine_current_priorities(
        self,
        life_stage: Dict,
        purushartha: Dict,
        spiritual: Dict
    ) -> List[str]:
        """Determine current life priorities."""
        return [
            f"Life Stage Priority: {life_stage['stage_focus']}",
            f"Purushartha Priority: {purushartha['meaning']}",
            f"Spiritual Priority: {spiritual['description']}",
        ]

    def _provide_long_term_guidance(
        self,
        life_stage: Dict,
        purushartha: Dict,
        spiritual: Dict
    ) -> str:
        """Provide long-term guidance."""
        return (
            "Integrate all three dimensions for holistic development. "
            "Honor your current life stage while pursuing your dominant Purushartha. "
            "Simultaneously, progress on the spiritual path according to your current level. "
            "Remember that all worldly pursuits should ultimately lead to spiritual growth and liberation."
        )

