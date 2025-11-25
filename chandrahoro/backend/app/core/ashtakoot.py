"""Ashtakoot (Guna Milan) compatibility calculation for Vedic matchmaking."""

from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class AshtakootCalculator:
    """Calculate traditional Vedic Ashtakoot (8-fold) compatibility scores."""
    
    # Varna classification by Moon sign
    VARNA_BY_SIGN = {
        'Cancer': 'Brahmin', 'Scorpio': 'Brahmin', 'Pisces': 'Brahmin',
        'Aries': 'Kshatriya', 'Leo': 'Kshatriya', 'Sagittarius': 'Kshatriya',
        'Taurus': 'Vaishya', 'Virgo': 'Vaishya', 'Capricorn': 'Vaishya',
        'Gemini': 'Shudra', 'Libra': 'Shudra', 'Aquarius': 'Shudra'
    }
    
    VARNA_HIERARCHY = {'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1}
    
    # Vasya classification by Moon sign
    VASYA_BY_SIGN = {
        'Cancer': 'Jalchar', 'Scorpio': 'Keeta', 'Pisces': 'Jalchar',
        'Aries': 'Chatushpad', 'Taurus': 'Chatushpad', 'Leo': 'Vanchar',
        'Gemini': 'Manav', 'Virgo': 'Manav', 'Libra': 'Manav', 'Aquarius': 'Manav',
        'Sagittarius': 'Manav', 'Capricorn': 'Vanchar'
    }
    
    # Vasya compatibility matrix (points out of 2)
    VASYA_COMPATIBILITY = {
        ('Jalchar', 'Jalchar'): 2, ('Jalchar', 'Chatushpad'): 1, ('Jalchar', 'Manav'): 1,
        ('Chatushpad', 'Chatushpad'): 2, ('Chatushpad', 'Manav'): 1,
        ('Manav', 'Manav'): 2, ('Manav', 'Vanchar'): 1,
        ('Vanchar', 'Vanchar'): 2, ('Vanchar', 'Chatushpad'): 1,
        ('Keeta', 'Keeta'): 2
    }
    
    # Gana classification by Nakshatra
    GANA_BY_NAKSHATRA = {
        'Ashwini': 'Devta', 'Bharani': 'Manushya', 'Krittika': 'Rakshasa',
        'Rohini': 'Manushya', 'Mrigashira': 'Devta', 'Ardra': 'Manushya',
        'Punarvasu': 'Devta', 'Pushya': 'Devta', 'Ashlesha': 'Rakshasa',
        'Magha': 'Rakshasa', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya',
        'Hasta': 'Devta', 'Chitra': 'Rakshasa', 'Swati': 'Devta',
        'Vishakha': 'Rakshasa', 'Anuradha': 'Devta', 'Jyeshtha': 'Rakshasa',
        'Mula': 'Rakshasa', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya',
        'Shravana': 'Devta', 'Dhanishta': 'Rakshasa', 'Shatabhisha': 'Rakshasa',
        'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya', 'Revati': 'Devta'
    }
    
    # Yoni (animal) classification by Nakshatra
    YONI_BY_NAKSHATRA = {
        'Ashwini': 'Ashwa', 'Bharani': 'Gaja', 'Krittika': 'Mesha',
        'Rohini': 'Sarpa', 'Mrigashira': 'Sarpa', 'Ardra': 'Shwana',
        'Punarvasu': 'Marjara', 'Pushya': 'Mesha', 'Ashlesha': 'Marjara',
        'Magha': 'Mushaka', 'Purva Phalguni': 'Mushaka', 'Uttara Phalguni': 'Gau',
        'Hasta': 'Mahisha', 'Chitra': 'Vyaghra', 'Swati': 'Mahisha',
        'Vishakha': 'Vyaghra', 'Anuradha': 'Mriga', 'Jyeshtha': 'Mriga',
        'Mula': 'Shwana', 'Purva Ashadha': 'Vanaara', 'Uttara Ashadha': 'Nakula',
        'Shravana': 'Vanaara', 'Dhanishta': 'Simha', 'Shatabhisha': 'Ashwa',
        'Purva Bhadrapada': 'Simha', 'Uttara Bhadrapada': 'Gau', 'Revati': 'Gaja'
    }
    
    # Yoni compatibility matrix (points out of 4)
    YONI_COMPATIBILITY = {
        ('Ashwa', 'Ashwa'): 4, ('Ashwa', 'Gaja'): 2, ('Ashwa', 'Vyaghra'): 1,
        ('Gaja', 'Gaja'): 4, ('Gaja', 'Simha'): 0,
        ('Mesha', 'Mesha'): 4, ('Mesha', 'Vanaara'): 1,
        ('Sarpa', 'Sarpa'): 4, ('Sarpa', 'Nakula'): 0,
        ('Shwana', 'Shwana'): 4, ('Shwana', 'Marjara'): 2,
        ('Marjara', 'Marjara'): 4, ('Marjara', 'Mushaka'): 0,
        ('Mushaka', 'Mushaka'): 4,
        ('Gau', 'Gau'): 4, ('Gau', 'Vyaghra'): 0,
        ('Mahisha', 'Mahisha'): 4, ('Mahisha', 'Simha'): 1,
        ('Vyaghra', 'Vyaghra'): 4, ('Vyaghra', 'Mriga'): 0,
        ('Mriga', 'Mriga'): 4,
        ('Vanaara', 'Vanaara'): 4, ('Vanaara', 'Simha'): 2,
        ('Nakula', 'Nakula'): 4,
        ('Simha', 'Simha'): 4
    }
    
    # Nadi classification by Nakshatra
    NADI_BY_NAKSHATRA = {
        'Ashwini': 'Aadi', 'Bharani': 'Madhya', 'Krittika': 'Antya',
        'Rohini': 'Aadi', 'Mrigashira': 'Madhya', 'Ardra': 'Antya',
        'Punarvasu': 'Aadi', 'Pushya': 'Madhya', 'Ashlesha': 'Antya',
        'Magha': 'Aadi', 'Purva Phalguni': 'Madhya', 'Uttara Phalguni': 'Antya',
        'Hasta': 'Aadi', 'Chitra': 'Madhya', 'Swati': 'Antya',
        'Vishakha': 'Aadi', 'Anuradha': 'Madhya', 'Jyeshtha': 'Antya',
        'Mula': 'Aadi', 'Purva Ashadha': 'Madhya', 'Uttara Ashadha': 'Antya',
        'Shravana': 'Aadi', 'Dhanishta': 'Madhya', 'Shatabhisha': 'Antya',
        'Purva Bhadrapada': 'Aadi', 'Uttara Bhadrapada': 'Madhya', 'Revati': 'Antya'
    }
    
    # Sign lords for Maitri calculation
    SIGN_LORDS = {
        'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
        'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
        'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    }
    
    # Planetary friendship for Maitri
    PLANETARY_FRIENDSHIP = {
        'Sun': {'friends': ['Moon', 'Mars', 'Jupiter'], 'neutral': ['Mercury'], 'enemies': ['Venus', 'Saturn']},
        'Moon': {'friends': ['Sun', 'Mercury'], 'neutral': ['Mars', 'Jupiter', 'Venus', 'Saturn'], 'enemies': []},
        'Mars': {'friends': ['Sun', 'Moon', 'Jupiter'], 'neutral': ['Venus', 'Saturn'], 'enemies': ['Mercury']},
        'Mercury': {'friends': ['Sun', 'Venus'], 'neutral': ['Mars', 'Jupiter', 'Saturn'], 'enemies': ['Moon']},
        'Jupiter': {'friends': ['Sun', 'Moon', 'Mars'], 'neutral': ['Saturn'], 'enemies': ['Mercury', 'Venus']},
        'Venus': {'friends': ['Mercury', 'Saturn'], 'neutral': ['Mars', 'Jupiter'], 'enemies': ['Sun', 'Moon']},
        'Saturn': {'friends': ['Mercury', 'Venus'], 'neutral': ['Jupiter'], 'enemies': ['Sun', 'Moon', 'Mars']}
    }
    
    def calculate_varna(self, boy_moon_sign: str, girl_moon_sign: str) -> Dict[str, Any]:
        """Calculate Varna compatibility (1 point max)."""
        boy_varna = self.VARNA_BY_SIGN.get(boy_moon_sign, 'Shudra')
        girl_varna = self.VARNA_BY_SIGN.get(girl_moon_sign, 'Shudra')
        
        boy_rank = self.VARNA_HIERARCHY.get(boy_varna, 1)
        girl_rank = self.VARNA_HIERARCHY.get(girl_varna, 1)
        
        # Boy's varna should be >= girl's varna
        points = 1 if boy_rank >= girl_rank else 0
        
        return {
            'guna': 'VARNA',
            'boy_value': boy_varna,
            'girl_value': girl_varna,
            'max_points': 1,
            'points_obtained': points,
            'area_of_life': 'Work'
        }
    
    def calculate_vasya(self, boy_moon_sign: str, girl_moon_sign: str) -> Dict[str, Any]:
        """Calculate Vasya compatibility (2 points max)."""
        boy_vasya = self.VASYA_BY_SIGN.get(boy_moon_sign, 'Manav')
        girl_vasya = self.VASYA_BY_SIGN.get(girl_moon_sign, 'Manav')
        
        # Check both directions in compatibility matrix
        key1 = (boy_vasya, girl_vasya)
        key2 = (girl_vasya, boy_vasya)
        points = self.VASYA_COMPATIBILITY.get(key1, self.VASYA_COMPATIBILITY.get(key2, 0))
        
        return {
            'guna': 'VASYA',
            'boy_value': boy_vasya,
            'girl_value': girl_vasya,
            'max_points': 2,
            'points_obtained': points,
            'area_of_life': 'Dominance'
        }
    
    def calculate_tara(self, boy_nakshatra_num: int, girl_nakshatra_num: int) -> Dict[str, Any]:
        """Calculate Tara compatibility (3 points max)."""
        # Count from boy's nakshatra to girl's nakshatra
        count = ((girl_nakshatra_num - boy_nakshatra_num) % 27) + 1
        tara_num = ((count - 1) % 9) + 1
        
        tara_names = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Vadha', 'Mitra', 'Atimitra']
        tara_name = tara_names[tara_num - 1]
        
        # Favorable: Sampat, Kshema, Sadhana, Mitra, Atimitra
        # Neutral: Janma
        # Unfavorable: Vipat, Pratyak, Vadha
        if tara_num in [2, 4, 6, 8, 9]:  # Favorable
            points = 3
        elif tara_num == 1:  # Neutral
            points = 1.5
        else:  # Unfavorable
            points = 0
        
        return {
            'guna': 'TARA',
            'boy_value': f'Nakshatra {boy_nakshatra_num}',
            'girl_value': f'{tara_name} (Nakshatra {girl_nakshatra_num})',
            'max_points': 3,
            'points_obtained': points,
            'area_of_life': 'Destiny'
        }
    
    def calculate_yoni(self, boy_nakshatra: str, girl_nakshatra: str) -> Dict[str, Any]:
        """Calculate Yoni compatibility (4 points max)."""
        boy_yoni = self.YONI_BY_NAKSHATRA.get(boy_nakshatra, 'Ashwa')
        girl_yoni = self.YONI_BY_NAKSHATRA.get(girl_nakshatra, 'Ashwa')
        
        # Check both directions in compatibility matrix
        key1 = (boy_yoni, girl_yoni)
        key2 = (girl_yoni, boy_yoni)
        points = self.YONI_COMPATIBILITY.get(key1, self.YONI_COMPATIBILITY.get(key2, 2))
        
        return {
            'guna': 'YONI',
            'boy_value': boy_yoni,
            'girl_value': girl_yoni,
            'max_points': 4,
            'points_obtained': points,
            'area_of_life': 'Mentality'
        }
    
    def calculate_maitri(self, boy_moon_sign: str, girl_moon_sign: str) -> Dict[str, Any]:
        """Calculate Maitri (Graha Maitri) compatibility (5 points max)."""
        boy_lord = self.SIGN_LORDS.get(boy_moon_sign, 'Sun')
        girl_lord = self.SIGN_LORDS.get(girl_moon_sign, 'Moon')
        
        if boy_lord == girl_lord:
            points = 5
        elif girl_lord in self.PLANETARY_FRIENDSHIP.get(boy_lord, {}).get('friends', []):
            points = 4
        elif girl_lord in self.PLANETARY_FRIENDSHIP.get(boy_lord, {}).get('neutral', []):
            points = 3
        else:
            points = 1
        
        return {
            'guna': 'MAITRI',
            'boy_value': boy_lord,
            'girl_value': girl_lord,
            'max_points': 5,
            'points_obtained': points,
            'area_of_life': 'Compatibility'
        }
    
    def calculate_gana(self, boy_nakshatra: str, girl_nakshatra: str) -> Dict[str, Any]:
        """Calculate Gana compatibility (6 points max)."""
        boy_gana = self.GANA_BY_NAKSHATRA.get(boy_nakshatra, 'Manushya')
        girl_gana = self.GANA_BY_NAKSHATRA.get(girl_nakshatra, 'Manushya')
        
        if boy_gana == girl_gana:
            points = 6
        elif (boy_gana == 'Devta' and girl_gana == 'Manushya') or (boy_gana == 'Manushya' and girl_gana == 'Devta'):
            points = 6
        else:
            points = 0
        
        return {
            'guna': 'GANA',
            'boy_value': boy_gana,
            'girl_value': girl_gana,
            'max_points': 6,
            'points_obtained': points,
            'area_of_life': 'Guna Level'
        }
    
    def calculate_bhakoot(self, boy_moon_sign: str, girl_moon_sign: str) -> Dict[str, Any]:
        """Calculate Bhakoot compatibility (7 points max)."""
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        boy_sign_num = signs.index(boy_moon_sign) + 1 if boy_moon_sign in signs else 1
        girl_sign_num = signs.index(girl_moon_sign) + 1 if girl_moon_sign in signs else 1
        
        # Count from boy to girl
        count = ((girl_sign_num - boy_sign_num) % 12) + 1
        
        # Unfavorable positions: 2nd-12th, 5th-9th, 6th-8th
        if count in [2, 12, 5, 9, 6, 8]:
            points = 0
        else:
            points = 7
        
        return {
            'guna': 'BHAKOOT',
            'boy_value': boy_moon_sign,
            'girl_value': girl_moon_sign,
            'max_points': 7,
            'points_obtained': points,
            'area_of_life': 'Love'
        }
    
    def calculate_nadi(self, boy_nakshatra: str, girl_nakshatra: str) -> Dict[str, Any]:
        """Calculate Nadi compatibility (8 points max)."""
        boy_nadi = self.NADI_BY_NAKSHATRA.get(boy_nakshatra, 'Aadi')
        girl_nadi = self.NADI_BY_NAKSHATRA.get(girl_nakshatra, 'Aadi')
        
        # Same Nadi is unfavorable (health issues)
        points = 0 if boy_nadi == girl_nadi else 8
        
        return {
            'guna': 'NADI',
            'boy_value': boy_nadi,
            'girl_value': girl_nadi,
            'max_points': 8,
            'points_obtained': points,
            'area_of_life': 'Health'
        }
    
    def calculate_ashtakoot(
        self,
        boy_moon_sign: str,
        boy_nakshatra: str,
        boy_nakshatra_num: int,
        girl_moon_sign: str,
        girl_nakshatra: str,
        girl_nakshatra_num: int
    ) -> Dict[str, Any]:
        """
        Calculate complete Ashtakoot compatibility.
        
        Args:
            boy_moon_sign: Boy's Moon sign
            boy_nakshatra: Boy's birth nakshatra name
            boy_nakshatra_num: Boy's nakshatra number (1-27)
            girl_moon_sign: Girl's Moon sign
            girl_nakshatra: Girl's birth nakshatra name
            girl_nakshatra_num: Girl's nakshatra number (1-27)
        
        Returns:
            Complete Ashtakoot analysis with all 8 Kootas
        """
        guna_details = [
            self.calculate_varna(boy_moon_sign, girl_moon_sign),
            self.calculate_vasya(boy_moon_sign, girl_moon_sign),
            self.calculate_tara(boy_nakshatra_num, girl_nakshatra_num),
            self.calculate_yoni(boy_nakshatra, girl_nakshatra),
            self.calculate_maitri(boy_moon_sign, girl_moon_sign),
            self.calculate_gana(boy_nakshatra, girl_nakshatra),
            self.calculate_bhakoot(boy_moon_sign, girl_moon_sign),
            self.calculate_nadi(boy_nakshatra, girl_nakshatra)
        ]
        
        total_points = sum(guna['points_obtained'] for guna in guna_details)
        max_points = 36
        percentage = (total_points / max_points) * 100
        
        return {
            'total_points': total_points,
            'max_points': max_points,
            'percentage': round(percentage, 1),
            'guna_details': guna_details
        }

