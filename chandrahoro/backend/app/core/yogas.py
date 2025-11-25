"""Yoga detection engine for Vedic astrology."""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class YogaResult:
    """Result of a yoga detection."""
    name: str
    type: str  # 'raja', 'dhana', 'neecha_bhanga', 'malefic', 'planetary'
    strength: str  # 'weak', 'moderate', 'strong', 'very_strong'
    description: str
    planets_involved: List[str]
    houses_involved: List[int]
    conditions_met: List[str]
    effects: str


class YogaDetector:
    """Detect various yogas in a Vedic horoscope chart."""

    # Planet classifications
    BENEFICS = ['Moon', 'Venus', 'Jupiter', 'Mercury']  # Mercury can be benefic when well-placed
    MALEFICS = ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun']  # Sun is mild malefic
    NATURAL_BENEFICS = ['Moon', 'Venus', 'Jupiter']
    NATURAL_MALEFICS = ['Mars', 'Saturn', 'Rahu', 'Ketu']

    # House classifications
    KENDRA_HOUSES = [1, 4, 7, 10]  # Angular houses
    TRIKONA_HOUSES = [1, 5, 9]     # Trinal houses
    UPACHAYA_HOUSES = [3, 6, 10, 11]  # Growth houses
    DUSTHANA_HOUSES = [6, 8, 12]   # Malefic houses

    # Exaltation and debilitation signs (0-based)
    EXALTATION_SIGNS = {
        'Sun': 0,      # Aries
        'Moon': 1,     # Taurus
        'Mars': 9,     # Capricorn
        'Mercury': 5,  # Virgo
        'Jupiter': 3,  # Cancer
        'Venus': 11,   # Pisces
        'Saturn': 6    # Libra
    }

    DEBILITATION_SIGNS = {
        'Sun': 6,      # Libra
        'Moon': 7,     # Scorpio
        'Mars': 3,     # Cancer
        'Mercury': 11, # Pisces
        'Jupiter': 9,  # Capricorn
        'Venus': 5,    # Virgo
        'Saturn': 0    # Aries
    }

    def __init__(self):
        """Initialize yoga detector."""
        pass

    def detect_all_yogas(self, planets: List[Dict], houses: List[Dict],
                        ascendant_sign: str) -> List[YogaResult]:
        """
        Detect all yogas in the chart.

        Args:
            planets: List of planet positions
            houses: List of house positions
            ascendant_sign: Ascendant sign name

        Returns:
            List of detected yogas
        """
        yogas = []

        # Convert data to internal format
        planet_data = self._convert_planet_data(planets)
        house_data = self._convert_house_data(houses)
        ascendant_sign_num = self._get_sign_number(ascendant_sign)

        # Detect different types of yogas
        yogas.extend(self._detect_raja_yogas(planet_data, ascendant_sign_num))
        yogas.extend(self._detect_dhana_yogas(planet_data, ascendant_sign_num))
        yogas.extend(self._detect_neecha_bhanga_yogas(planet_data))
        yogas.extend(self._detect_planetary_yogas(planet_data))
        yogas.extend(self._detect_malefic_yogas(planet_data))

        return yogas

    def _convert_planet_data(self, planets: List[Dict]) -> Dict[str, Dict]:
        """Convert planet list to dictionary format."""
        planet_dict = {}
        for planet in planets:
            planet_dict[planet['name']] = {
                'house': planet['house'],
                'sign': self._get_sign_number(planet['sign']),
                'degree': planet['degree_in_sign'],
                'retrograde': planet.get('retrograde', False),
                'longitude': planet.get('sidereal_longitude', 0)
            }
        return planet_dict

    def _convert_house_data(self, houses: List[Dict]) -> Dict[int, Dict]:
        """Convert house list to dictionary format."""
        house_dict = {}
        for house in houses:
            house_dict[house['number']] = {
                'sign': self._get_sign_number(house['sign']),
                'cusp': house['cusp_longitude']
            }
        return house_dict

    def _get_sign_number(self, sign_name: str) -> int:
        """Convert sign name to number (0-11)."""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        try:
            return signs.index(sign_name)
        except ValueError:
            return 0

    def _detect_raja_yogas(self, planets: Dict[str, Dict], ascendant_sign: int) -> List[YogaResult]:
        """Detect Raja Yogas (royal combinations)."""
        yogas = []

        # 1. Kendra-Trikona Raja Yoga
        kendra_lords = self._get_house_lords(self.KENDRA_HOUSES, ascendant_sign)
        trikona_lords = self._get_house_lords(self.TRIKONA_HOUSES, ascendant_sign)

        for kendra_lord in kendra_lords:
            for trikona_lord in trikona_lords:
                if kendra_lord != trikona_lord and self._are_planets_conjunct(
                    planets.get(kendra_lord, {}), planets.get(trikona_lord, {})):

                    strength = self._calculate_yoga_strength([kendra_lord, trikona_lord], planets)
                    yogas.append(YogaResult(
                        name="Kendra-Trikona Raja Yoga",
                        type="raja",
                        strength=strength,
                        description=f"Conjunction of {kendra_lord} (Kendra lord) and {trikona_lord} (Trikona lord)",
                        planets_involved=[kendra_lord, trikona_lord],
                        houses_involved=[planets[kendra_lord]['house'], planets[trikona_lord]['house']],
                        conditions_met=[f"{kendra_lord} and {trikona_lord} in conjunction"],
                        effects="Bestows power, authority, and success in endeavors"
                    ))

        # 2. Viparita Raja Yoga (Lords of dusthana houses in dusthana)
        dusthana_lords = self._get_house_lords(self.DUSTHANA_HOUSES, ascendant_sign)
        for lord in dusthana_lords:
            if lord in planets and planets[lord]['house'] in self.DUSTHANA_HOUSES:
                strength = self._calculate_yoga_strength([lord], planets)
                yogas.append(YogaResult(
                    name="Viparita Raja Yoga",
                    type="raja",
                    strength=strength,
                    description=f"{lord} (dusthana lord) placed in dusthana house",
                    planets_involved=[lord],
                    houses_involved=[planets[lord]['house']],
                    conditions_met=[f"{lord} in house {planets[lord]['house']}"],
                    effects="Transforms difficulties into opportunities and success"
                ))

        return yogas

    def _detect_dhana_yogas(self, planets: Dict[str, Dict], ascendant_sign: int) -> List[YogaResult]:
        """Detect Dhana Yogas (wealth combinations)."""
        yogas = []

        # 1. 2nd and 11th lord conjunction/mutual aspect
        second_lord = self._get_house_lord(2, ascendant_sign)
        eleventh_lord = self._get_house_lord(11, ascendant_sign)

        if (second_lord in planets and eleventh_lord in planets and
            self._are_planets_conjunct(planets[second_lord], planets[eleventh_lord])):

            strength = self._calculate_yoga_strength([second_lord, eleventh_lord], planets)
            yogas.append(YogaResult(
                name="Dhana Yoga",
                type="dhana",
                strength=strength,
                description=f"Conjunction of {second_lord} (2nd lord) and {eleventh_lord} (11th lord)",
                planets_involved=[second_lord, eleventh_lord],
                houses_involved=[planets[second_lord]['house'], planets[eleventh_lord]['house']],
                conditions_met=[f"{second_lord} and {eleventh_lord} in conjunction"],
                effects="Brings wealth, financial prosperity, and material gains"
            ))

        # 2. Jupiter in 2nd, 5th, 9th, or 11th house
        if 'Jupiter' in planets:
            jupiter_house = planets['Jupiter']['house']
            if jupiter_house in [2, 5, 9, 11]:
                strength = self._calculate_yoga_strength(['Jupiter'], planets)
                yogas.append(YogaResult(
                    name="Guru Dhana Yoga",
                    type="dhana",
                    strength=strength,
                    description=f"Jupiter placed in {jupiter_house}th house",
                    planets_involved=['Jupiter'],
                    houses_involved=[jupiter_house],
                    conditions_met=[f"Jupiter in house {jupiter_house}"],
                    effects="Jupiter's blessings bring wisdom and wealth"
                ))

        return yogas

    def _detect_neecha_bhanga_yogas(self, planets: Dict[str, Dict]) -> List[YogaResult]:
        """Detect Neecha Bhanga Raja Yogas (cancellation of debilitation)."""
        yogas = []

        for planet_name, planet_data in planets.items():
            if planet_name in self.DEBILITATION_SIGNS:
                debil_sign = self.DEBILITATION_SIGNS[planet_name]

                if planet_data['sign'] == debil_sign:
                    # Check for cancellation conditions
                    cancellation_found = False
                    cancellation_reason = ""

                    # 1. Exaltation lord of debilitated planet in Kendra
                    exalt_sign = self.EXALTATION_SIGNS[planet_name]
                    exalt_lord = self._get_sign_lord(exalt_sign)

                    if exalt_lord in planets and planets[exalt_lord]['house'] in self.KENDRA_HOUSES:
                        cancellation_found = True
                        cancellation_reason = f"Exaltation lord {exalt_lord} in Kendra"

                    # 2. Debilitation lord in Kendra
                    debil_lord = self._get_sign_lord(debil_sign)
                    if debil_lord in planets and planets[debil_lord]['house'] in self.KENDRA_HOUSES:
                        cancellation_found = True
                        cancellation_reason = f"Debilitation lord {debil_lord} in Kendra"

                    if cancellation_found:
                        strength = self._calculate_yoga_strength([planet_name], planets)
                        yogas.append(YogaResult(
                            name="Neecha Bhanga Raja Yoga",
                            type="neecha_bhanga",
                            strength=strength,
                            description=f"Debilitation of {planet_name} cancelled",
                            planets_involved=[planet_name],
                            houses_involved=[planet_data['house']],
                            conditions_met=[cancellation_reason],
                            effects="Transforms weakness into strength, brings unexpected success"
                        ))

        return yogas

    def _detect_planetary_yogas(self, planets: Dict[str, Dict]) -> List[YogaResult]:
        """Detect specific planetary yogas."""
        yogas = []

        # 1. Gaja Kesari Yoga (Moon-Jupiter relationship)
        if 'Moon' in planets and 'Jupiter' in planets:
            moon_house = planets['Moon']['house']
            jupiter_house = planets['Jupiter']['house']

            # Check if Jupiter is in Kendra from Moon
            house_diff = abs(jupiter_house - moon_house)
            if house_diff in [0, 3, 6, 9] or house_diff == 0:  # 0 = conjunction
                strength = self._calculate_yoga_strength(['Moon', 'Jupiter'], planets)
                yogas.append(YogaResult(
                    name="Gaja Kesari Yoga",
                    type="planetary",
                    strength=strength,
                    description="Jupiter in Kendra from Moon",
                    planets_involved=['Moon', 'Jupiter'],
                    houses_involved=[moon_house, jupiter_house],
                    conditions_met=["Jupiter in Kendra from Moon"],
                    effects="Brings wisdom, fame, and prosperity like an elephant and lion"
                ))

        # 2. Budha Aditya Yoga (Sun-Mercury conjunction)
        if ('Sun' in planets and 'Mercury' in planets and
            self._are_planets_conjunct(planets['Sun'], planets['Mercury'])):

            strength = self._calculate_yoga_strength(['Sun', 'Mercury'], planets)
            yogas.append(YogaResult(
                name="Budha Aditya Yoga",
                type="planetary",
                strength=strength,
                description="Sun and Mercury in conjunction",
                planets_involved=['Sun', 'Mercury'],
                houses_involved=[planets['Sun']['house']],
                conditions_met=["Sun and Mercury in conjunction"],
                effects="Enhances intelligence, communication skills, and learning"
            ))

        return yogas

    def _detect_malefic_yogas(self, planets: Dict[str, Dict]) -> List[YogaResult]:
        """Detect malefic yogas and doshas."""
        yogas = []

        # 1. Mangal Dosha (Mars in 1st, 2nd, 4th, 7th, 8th, 12th)
        if 'Mars' in planets:
            mars_house = planets['Mars']['house']
            if mars_house in [1, 2, 4, 7, 8, 12]:
                strength = "moderate"  # Dosha strength
                yogas.append(YogaResult(
                    name="Mangal Dosha",
                    type="malefic",
                    strength=strength,
                    description=f"Mars placed in {mars_house}th house",
                    planets_involved=['Mars'],
                    houses_involved=[mars_house],
                    conditions_met=[f"Mars in house {mars_house}"],
                    effects="May cause delays or challenges in marriage and relationships"
                ))

        return yogas

    def _get_house_lords(self, houses: List[int], ascendant_sign: int) -> List[str]:
        """Get ruling planets for given houses."""
        lords = []
        for house in houses:
            lord = self._get_house_lord(house, ascendant_sign)
            if lord:
                lords.append(lord)
        return lords

    def _get_house_lord(self, house_num: int, ascendant_sign: int) -> Optional[str]:
        """Get the ruling planet of a house."""
        # Calculate the sign of the house
        house_sign = (ascendant_sign + house_num - 1) % 12
        return self._get_sign_lord(house_sign)

    def _get_sign_lord(self, sign_num: int) -> Optional[str]:
        """Get the ruling planet of a sign."""
        sign_lords = [
            'Mars',     # Aries
            'Venus',    # Taurus
            'Mercury',  # Gemini
            'Moon',     # Cancer
            'Sun',      # Leo
            'Mercury',  # Virgo
            'Venus',    # Libra
            'Mars',     # Scorpio
            'Jupiter',  # Sagittarius
            'Saturn',   # Capricorn
            'Saturn',   # Aquarius
            'Jupiter'   # Pisces
        ]
        return sign_lords[sign_num] if 0 <= sign_num < 12 else None

    def _are_planets_conjunct(self, planet1: Dict, planet2: Dict, orb: float = 10.0) -> bool:
        """Check if two planets are in conjunction within orb."""
        if not planet1 or not planet2:
            return False

        # Same house is a simple conjunction check
        if planet1.get('house') == planet2.get('house'):
            return True

        # Check degree difference if longitude available
        if 'longitude' in planet1 and 'longitude' in planet2:
            diff = abs(planet1['longitude'] - planet2['longitude'])
            # Handle 360-degree wrap
            if diff > 180:
                diff = 360 - diff
            return diff <= orb

        return False

    def _calculate_yoga_strength(self, planets_involved: List[str], planets: Dict[str, Dict]) -> str:
        """Calculate the strength of a yoga based on planetary conditions."""
        strength_score = 0

        for planet in planets_involved:
            if planet in planets:
                planet_data = planets[planet]

                # Check if planet is exalted
                if (planet in self.EXALTATION_SIGNS and
                    planet_data['sign'] == self.EXALTATION_SIGNS[planet]):
                    strength_score += 3

                # Check if planet is in own sign
                elif self._is_planet_in_own_sign(planet, planet_data['sign']):
                    strength_score += 2

                # Check if planet is in Kendra or Trikona
                if planet_data['house'] in self.KENDRA_HOUSES + self.TRIKONA_HOUSES:
                    strength_score += 1

                # Reduce strength if debilitated
                if (planet in self.DEBILITATION_SIGNS and
                    planet_data['sign'] == self.DEBILITATION_SIGNS[planet]):
                    strength_score -= 2

        # Convert score to strength category
        if strength_score >= 6:
            return "very_strong"
        elif strength_score >= 4:
            return "strong"
        elif strength_score >= 2:
            return "moderate"
        else:
            return "weak"

    def _is_planet_in_own_sign(self, planet: str, sign: int) -> bool:
        """Check if planet is in its own sign."""
        own_signs = {
            'Sun': [4],        # Leo
            'Moon': [3],       # Cancer
            'Mars': [0, 7],    # Aries, Scorpio
            'Mercury': [2, 5], # Gemini, Virgo
            'Jupiter': [8, 11], # Sagittarius, Pisces
            'Venus': [1, 6],   # Taurus, Libra
            'Saturn': [9, 10]  # Capricorn, Aquarius
        }
        return planet in own_signs and sign in own_signs[planet]