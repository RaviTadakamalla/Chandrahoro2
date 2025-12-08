"""AI Prompt Configuration models."""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class PromptScope(str, enum.Enum):
    """Scope of prompt configuration."""
    SYSTEM = "system"  # System-wide default prompts
    USER = "user"      # User-specific custom prompts


class AiModuleType(str, enum.Enum):
    """AI insight module types."""
    CHART_INTERPRETATION = "chart_interpretation"
    DASHA_PREDICTIONS = "dasha_predictions"
    TRANSIT_ANALYSIS = "transit_analysis"
    YOGA_ANALYSIS = "yoga_analysis"
    REMEDIAL_MEASURES = "remedial_measures"
    COMPATIBILITY_ANALYSIS = "compatibility_analysis"
    MATCH_HOROSCOPE = "match_horoscope"
    PERSONALITY_INSIGHTS = "personality_insights"
    CAREER_GUIDANCE = "career_guidance"
    RELATIONSHIP_INSIGHTS = "relationship_insights"
    HEALTH_ANALYSIS = "health_analysis"
    FINANCIAL_PREDICTIONS = "financial_predictions"
    PRASHNA_HORARY = "prashna_horary"
    DAILY_PREDICTIONS = "daily_predictions"
    CHAT = "chat"  # For general chat interactions


class AiPromptConfig(BaseModel):
    """AI prompt configuration for different insight modules."""

    __tablename__ = "ai_prompt_configs"

    # Module identification
    module_type = Column(
        Enum(AiModuleType, values_callable=lambda x: [e.value for e in x], native_enum=False),
        nullable=False,
        index=True
    )
    module_name = Column(String(100), nullable=False)  # Display name
    module_description = Column(Text, nullable=True)

    # Scope and ownership
    scope = Column(
        Enum(PromptScope, values_callable=lambda x: [e.value for e in x], native_enum=False),
        nullable=False,
        default=PromptScope.SYSTEM,
        index=True
    )
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)  # NULL for system prompts

    # Prompt configuration
    custom_prompt = Column(Text, nullable=False)  # The actual prompt template
    system_variables = Column(JSON, nullable=True)  # Available variables like {chart_data}, {birth_info}, etc.
    output_format = Column(Text, nullable=True)  # Expected output format/structure
    
    # Settings
    is_enabled = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)  # True for system default prompts
    
    # Model parameters (optional overrides)
    temperature = Column(String(10), nullable=True)  # e.g., "0.7"
    max_tokens = Column(String(10), nullable=True)  # e.g., "2000"
    model_override = Column(String(100), nullable=True)  # Override user's default model for this module
    
    # Metadata
    version = Column(String(20), default="1.0", nullable=False)
    tags = Column(JSON, nullable=True)  # For categorization/filtering
    
    # Usage tracking
    usage_count = Column(String(20), default="0", nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    
    # Validation and testing
    is_validated = Column(Boolean, default=False, nullable=False)
    validation_notes = Column(Text, nullable=True)
    test_results = Column(JSON, nullable=True)  # Store test outputs

    # Sample format file upload
    sample_format_filename = Column(String(255), nullable=True)  # Original filename
    sample_format_path = Column(String(500), nullable=True)  # Path to stored file
    sample_format_type = Column(String(50), nullable=True)  # File type (html, pdf, etc.)
    sample_format_uploaded_at = Column(DateTime, nullable=True)  # Upload timestamp

    # Relationships
    user = relationship("User", back_populates="ai_prompt_configs")

    def __repr__(self):
        return f"<AiPromptConfig(module={self.module_type}, scope={self.scope}, user_id={self.user_id})>"

    class Config:
        """Pydantic config."""
        use_enum_values = True


class AiPromptVersion(BaseModel):
    """Version history for AI prompts."""

    __tablename__ = "ai_prompt_versions"

    # Reference to the prompt config
    prompt_config_id = Column(String(36), ForeignKey("ai_prompt_configs.id"), nullable=False, index=True)
    
    # Version details
    version_number = Column(String(20), nullable=False)
    prompt_content = Column(Text, nullable=False)
    output_format = Column(Text, nullable=True)
    
    # Change tracking
    changed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    change_notes = Column(Text, nullable=True)
    
    # Performance metrics
    avg_response_time_ms = Column(String(20), nullable=True)
    success_rate = Column(String(10), nullable=True)  # Percentage
    user_satisfaction = Column(String(10), nullable=True)  # Rating
    
    # Relationships
    prompt_config = relationship("AiPromptConfig", backref="versions")
    changed_by = relationship("User")

    def __repr__(self):
        return f"<AiPromptVersion(config_id={self.prompt_config_id}, version={self.version_number})>"


# Default system prompts for each module
DEFAULT_PROMPTS = {
    AiModuleType.CHART_INTERPRETATION: {
        "name": "AI Chart Interpretation",
        "description": "Comprehensive birth chart interpretation covering personality, life path, and key themes",
        "prompt": """You are an expert Vedic astrologer. Generate a comprehensive horoscope report in structured JSON format that will be used to create a detailed HTML report.

Chart Data:
{chart_data}

Generate a complete analysis with the following structure (return as valid JSON):

{{
  "birth_details": {{
    "name": "string",
    "gender": "string",
    "date_of_birth": "string (DD Month YYYY format)",
    "time_of_birth": "string (HH:MM AM/PM IST)",
    "place_of_birth": "string",
    "lagna": "string (Sign name with degree)",
    "rashi": "string (Moon sign)",
    "nakshatra": "string (Nakshatra name with pada)"
  }},
  "planetary_positions": [
    {{
      "planet": "string (e.g., Sun, Moon, Mars)",
      "longitude": "string (degrees)",
      "sign": "string",
      "degree_in_sign": "string",
      "house": "string (e.g., 1st, 2nd)",
      "nakshatra": "string",
      "pada": "number",
      "dignity": "string (Own/Exalted/Debilitated/Friendly/Enemy/Neutral)",
      "navamsa": "string",
      "karaka": "string (AK/AmK/BK/MK/PK/GK/DK or -)",
      "is_retrograde": boolean
    }}
  ],
  "vimsottari_dasha": {{
    "moon_nakshatra": "string",
    "nakshatra_lord": "string",
    "mahadashas": [
      {{
        "planet": "string",
        "duration_years": number,
        "start_date": "string (Mon YYYY)",
        "end_date": "string (Mon YYYY)",
        "position": "string (house and karaka)",
        "status": "string (Completed/Current/Upcoming)",
        "is_current": boolean
      }}
    ],
    "current_antardashas": [
      {{
        "period": "string (e.g., Saturn-Mercury)",
        "start_date": "string",
        "end_date": "string",
        "duration": "string",
        "is_current": boolean
      }}
    ]
  }},
  "yoga_analysis": [
    {{
      "name": "string (e.g., Gajakesari Yoga)",
      "planets_involved": "string (description of planetary combination)",
      "interpretation": "string (detailed explanation of effects)"
    }}
  ],
  "house_analysis": [
    {{
      "house_number": "string (e.g., 1st House)",
      "sign": "string",
      "planets": "string (comma-separated or 'Empty')",
      "lord_position": "string (where house lord is placed)",
      "interpretation": "string (detailed analysis)"
    }}
  ],
  "life_areas": {{
    "personality": "string (detailed analysis based on Ascendant, Moon, Jupiter aspects)",
    "education_career": "string (based on 4th, 5th, 10th houses, Jupiter, Mercury)",
    "wealth": "string (based on 2nd, 11th houses, dhana yogas)",
    "marriage": "string (based on 7th house, Venus, Darakaraka)",
    "current_period": "string (analysis of current Mahadasha)",
    "favorable_periods": "string (list of good and cautious periods)"
  }},
  "remedies": {{
    "primary_planet": "string (planet name)",
    "primary_remedy": "string (mantra, day, practices)",
    "secondary_planet": "string",
    "secondary_remedy": "string",
    "general_practices": "string (meditation, temple visits, etc.)",
    "gemstones": {{
      "primary": "string (gemstone, metal, finger, day)",
      "secondary": "string"
    }}
  }},
  "summary": {{
    "ascendant": "string",
    "moon_sign": "string",
    "nakshatra": "string",
    "navamsa_lagna": "string",
    "atmakaraka": "string",
    "darakaraka": "string",
    "current_dasha": "string",
    "major_yogas": "string (comma-separated)",
    "assessments": [
      {{
        "category": "string (e.g., Strongest Planet, Career, Wealth)",
        "rating": "string (Strong/Good/Moderate/Weak)",
        "key_factors": "string"
      }}
    ]
  }}
}}

IMPORTANT INSTRUCTIONS:
1. Use actual chart data provided to fill all fields accurately
2. Calculate Jaimini Karakas (AK, AmK, BK, MK, PK, GK, DK) based on planetary degrees
3. Identify all major yogas present in the chart (Gajakesari, Budha-Aditya, Dhana, Raja, etc.)
4. Provide specific, actionable interpretations based on classical Vedic astrology principles
5. Include Sanskrit terms where appropriate with English translations
6. Be compassionate and constructive in all interpretations
7. Return ONLY valid JSON, no additional text or markdown formatting
8. Ensure all dates, degrees, and positions are accurate from the chart data""",
        "output_format": "json",
        "variables": ["chart_data", "birth_info", "planets", "houses", "aspects", "dashas", "yogas"]
    },
    AiModuleType.DASHA_PREDICTIONS: {
        "name": "Dasha Period Predictions",
        "description": "AI-powered insights into current and upcoming Dasha periods",
        "prompt": """Analyze the Dasha periods for this birth chart and provide predictions:

Chart Data:
{chart_data}

Current Dasha: {current_dasha}
Upcoming Dashas: {upcoming_dashas}

Please provide:
1. **Current Period Analysis** - Opportunities and challenges in the current Mahadasha/Antardasha
2. **Timing Guidance** - Best times for important decisions and actions
3. **Upcoming Transitions** - What to expect in the next Dasha period
4. **Remedial Suggestions** - How to maximize positive influences

Focus on practical guidance and specific timing.""",
        "output_format": "Timeline-based predictions with specific dates and actionable advice",
        "variables": ["chart_data", "current_dasha", "upcoming_dashas", "dasha_timeline"]
    },
    AiModuleType.TRANSIT_ANALYSIS: {
        "name": "Current Transits",
        "description": "AI analysis of current planetary transits and their impact",
        "prompt": """Analyze current planetary transits and their impact on this birth chart:

Birth Chart:
{chart_data}

Current Transits:
{current_transits}

Please analyze:
1. **Major Transit Influences** - Key planetary transits affecting the chart
2. **House-wise Impact** - How transits affect different life areas
3. **Timing Windows** - Favorable and challenging periods
4. **Practical Guidance** - Actions to take during these transits

Be specific about dates and planetary positions.""",
        "output_format": "Transit-by-transit analysis with dates and practical recommendations",
        "variables": ["chart_data", "current_transits", "transit_dates", "affected_houses"]
    },
    AiModuleType.YOGA_ANALYSIS: {
        "name": "Yoga Interpretations",
        "description": "Discover the meaning and significance of planetary yogas",
        "prompt": """Analyze the yogas (planetary combinations) in this birth chart:

Chart Data:
{chart_data}

Identified Yogas:
{yogas}

Please provide:
1. **Yoga Descriptions** - Meaning and significance of each yoga
2. **Strength Assessment** - How strong/active each yoga is
3. **Life Impact** - Practical effects on different life areas
4. **Activation Periods** - When these yogas become most active
5. **Remedial Guidance** - How to enhance positive yogas

Focus on practical interpretation and real-life manifestations.""",
        "output_format": "Yoga-by-yoga analysis with strength ratings and practical guidance",
        "variables": ["chart_data", "yogas", "yoga_strengths", "activation_periods"]
    },
    AiModuleType.REMEDIAL_MEASURES: {
        "name": "Remedial Measures",
        "description": "Personalized remedial suggestions based on chart analysis",
        "prompt": """Provide personalized Vedic remedial measures for this birth chart:

Chart Data:
{chart_data}

Challenging Factors:
{challenging_factors}

Please suggest:
1. **Gemstone Recommendations** - Based on weak or afflicted planets
2. **Mantra Practices** - Specific mantras for planetary strengthening
3. **Charitable Activities** - Donations and service aligned with planetary energies
4. **Lifestyle Adjustments** - Daily practices and habits
5. **Timing Recommendations** - Best days/times for remedial practices

Provide practical, accessible remedies that can be easily implemented.""",
        "output_format": "Categorized remedies with specific instructions and timing",
        "variables": ["chart_data", "challenging_factors", "weak_planets", "afflictions"]
    },
    AiModuleType.COMPATIBILITY_ANALYSIS: {
        "name": "Relationship Compatibility",
        "description": "AI-powered compatibility analysis for relationships",
        "prompt": """Provide a comprehensive compatibility analysis between these two birth charts:

Primary Chart:
{primary_chart}

Partner Chart:
{partner_chart}

Focus Areas: {focus_areas}

Please analyze:
1. **Overall Compatibility Score** - Based on Guna Milan and synastry
2. **Emotional Compatibility** - Moon and Venus connections
3. **Mental Compatibility** - Mercury and communication styles
4. **Physical Compatibility** - Mars and attraction factors
5. **Long-term Potential** - Saturn and commitment indicators
6. **Challenge Areas** - Potential conflicts and how to navigate them
7. **Strengths** - Natural harmonies and supportive factors

Use traditional Vedic astrology principles including Guna Milan, Manglik Dosha, and planetary aspects.""",
        "output_format": "Structured compatibility report with scores and detailed analysis",
        "variables": ["primary_chart", "partner_chart", "focus_areas", "guna_milan_score"]
    },
    AiModuleType.MATCH_HOROSCOPE: {
        "name": "Match Horoscope (Kundali Milan)",
        "description": "Traditional Vedic matchmaking with Ashtakoot scoring",
        "prompt": """Perform a traditional Vedic astrology matchmaking analysis (Kundali Milan) between these two birth charts using the Ashtakoot (8-fold) system:

Primary Chart:
{primary_chart}

Partner Chart:
{partner_chart}

Please provide:
1. **Ashtakoot Scores** - Detailed breakdown of all 8 Kutas
2. **Total Compatibility Score** - Out of 36 points
3. **Manglik Dosha Analysis** - For both charts
4. **Nadi Dosha Check** - And remedies if present
5. **Bhakoot Analysis** - Sign compatibility
6. **Recommendations** - Marriage suitability and timing

Follow traditional Vedic matchmaking principles strictly.""",
        "output_format": "Traditional Ashtakoot report with scores and recommendations",
        "variables": ["primary_chart", "partner_chart", "ashtakoot_scores", "doshas"]
    },
    AiModuleType.PERSONALITY_INSIGHTS: {
        "name": "Personality Insights",
        "description": "Deep dive into personality traits and behavioral patterns",
        "prompt": """Provide a detailed personality analysis based on this Vedic birth chart:

Chart Data:
{chart_data}

Please analyze:
1. **Core Personality** - Based on Ascendant, Sun, and Moon
2. **Emotional Nature** - Moon sign and placement
3. **Communication Style** - Mercury placement and aspects
4. **Social Behavior** - Venus and 11th house influences
5. **Ambition & Drive** - Mars and 10th house
6. **Wisdom & Philosophy** - Jupiter placement
7. **Discipline & Structure** - Saturn influences
8. **Unique Traits** - Rahu/Ketu axis and special yogas

Focus on practical insights that help with self-understanding and personal growth.""",
        "output_format": "Detailed personality profile with behavioral insights",
        "variables": ["chart_data", "birth_info", "planets", "houses", "aspects"]
    },
    AiModuleType.CAREER_GUIDANCE: {
        "name": "Career Guidance",
        "description": "Professional path and career recommendations",
        "prompt": """Provide comprehensive career guidance based on this Vedic birth chart:

Chart Data:
{chart_data}

Please analyze:
1. **Natural Talents** - Based on planetary strengths
2. **Career Indicators** - 10th house, its lord, and aspects
3. **Suitable Professions** - Based on planetary combinations
4. **Business vs Employment** - Entrepreneurial indicators
5. **Success Periods** - Favorable Dasha periods for career growth
6. **Challenges** - Obstacles and how to overcome them
7. **Recommendations** - Specific career paths and industries

Provide practical, actionable career advice aligned with astrological indicators.""",
        "output_format": "Career analysis with specific recommendations and timing",
        "variables": ["chart_data", "planets", "houses", "current_dasha", "yogas"]
    },
    AiModuleType.RELATIONSHIP_INSIGHTS: {
        "name": "Relationship Insights",
        "description": "Understanding relationship patterns and romantic life",
        "prompt": """Analyze relationship patterns and romantic life based on this birth chart:

Chart Data:
{chart_data}

Please provide insights on:
1. **Relationship Style** - Based on Venus and 7th house
2. **Emotional Needs** - Moon and 4th house influences
3. **Attraction Patterns** - Mars and Rahu influences
4. **Commitment Approach** - Saturn and 7th lord
5. **Relationship Challenges** - Afflictions and doshas
6. **Ideal Partner Traits** - Based on 7th house and Venus
7. **Timing for Relationships** - Favorable periods for love and marriage

Focus on understanding relationship dynamics and finding compatible partnerships.""",
        "output_format": "Relationship analysis with partner compatibility insights",
        "variables": ["chart_data", "planets", "houses", "aspects", "current_dasha"]
    },
    AiModuleType.HEALTH_ANALYSIS: {
        "name": "Health Analysis",
        "description": "Health tendencies and wellness recommendations",
        "prompt": """Provide health analysis and wellness recommendations based on this birth chart:

Chart Data:
{chart_data}

Please analyze:
1. **Constitutional Type** - Based on Ascendant and planetary influences
2. **Health Vulnerabilities** - 6th house, its lord, and afflictions
3. **Body Systems** - Planetary influences on different organs
4. **Mental Health** - Moon, Mercury, and 5th house
5. **Vitality & Energy** - Sun and Mars strength
6. **Chronic Conditions** - Saturn and Rahu influences
7. **Preventive Measures** - Lifestyle and dietary recommendations
8. **Favorable Periods** - Times for medical treatments and recovery

Provide practical health guidance while noting this is for awareness, not medical diagnosis.""",
        "output_format": "Health analysis with wellness recommendations",
        "variables": ["chart_data", "planets", "houses", "aspects", "weak_planets"]
    },
    AiModuleType.FINANCIAL_PREDICTIONS: {
        "name": "Financial Predictions",
        "description": "Wealth potential and financial guidance",
        "prompt": """Analyze financial potential and provide wealth guidance based on this birth chart:

Chart Data:
{chart_data}

Please analyze:
1. **Wealth Indicators** - 2nd and 11th houses, their lords
2. **Income Sources** - Planetary combinations for earnings
3. **Savings Ability** - Saturn and Jupiter influences
4. **Investment Aptitude** - Rahu and speculative indicators
5. **Financial Challenges** - Debts and losses (6th, 8th, 12th houses)
6. **Prosperity Periods** - Favorable Dashas for wealth accumulation
7. **Money Management** - Spending patterns and financial discipline
8. **Recommendations** - Strategies for financial growth

Provide practical financial guidance aligned with astrological indicators.""",
        "output_format": "Financial analysis with wealth-building recommendations",
        "variables": ["chart_data", "planets", "houses", "current_dasha", "yogas"]
    },
    AiModuleType.PRASHNA_HORARY: {
        "name": "Prashna (Horary) Analysis",
        "description": "Answer specific questions using horary astrology",
        "prompt": """Provide a Prashna (Horary) astrology analysis for this specific question:

Question: {question}

Chart Data (Question Chart):
{chart_data}

Please analyze:
1. **Question Validity** - Is the chart radical and fit for judgment?
2. **Primary Significators** - Planets and houses relevant to the question
3. **Answer Indication** - Yes/No or descriptive answer based on chart
4. **Timing** - When the matter will manifest or resolve
5. **Additional Insights** - Supporting factors and considerations
6. **Recommendations** - Actions to take based on the analysis

Use traditional Prashna principles including Lagna, Moon, and relevant house lords.""",
        "output_format": "Horary analysis with clear answer and timing",
        "variables": ["chart_data", "question", "prashna_time", "significators"]
    },
    AiModuleType.DAILY_PREDICTIONS: {
        "name": "Daily Predictions",
        "description": "Daily astrological guidance and predictions",
        "prompt": """Provide daily astrological predictions for this birth chart:

Chart Data:
{chart_data}

Current Date: {current_date}
Current Transits: {current_transits}

Please provide:
1. **Overall Day Rating** - Energy level and general outlook (1-10)
2. **Favorable Activities** - Best things to do today
3. **Areas to Avoid** - Challenging areas or activities
4. **Lucky Hours** - Most auspicious times of the day
5. **Emotional Tone** - Moon's influence on mood and feelings
6. **Practical Guidance** - Specific advice for the day
7. **Color & Direction** - Auspicious color and direction for the day

Keep predictions practical, positive, and actionable.""",
        "output_format": "Daily forecast with ratings and practical guidance",
        "variables": ["chart_data", "current_date", "current_transits", "moon_position"]
    },
    AiModuleType.CHAT: {
        "name": "AI Chat Assistant",
        "description": "General astrological questions and chart discussions",
        "prompt": """You are an expert Vedic astrologer. Answer the following question about this birth chart:

Chart Data:
{chart_data}

Previous Conversation:
{conversation_history}

Question: {question}

Please provide a detailed answer based on Vedic astrology principles and the chart data above.""",
        "output_format": "Conversational response with astrological insights",
        "variables": ["chart_data", "question", "conversation_history"]
    }
}

