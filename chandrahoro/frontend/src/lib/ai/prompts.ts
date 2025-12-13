/**
 * ChandraHoro V2.1 - AI Prompt Templates
 * 
 * Comprehensive prompt templates for Vedic astrology AI features.
 * Includes system prompts, user prompt builders, and response formatting.
 * 
 * Features:
 * - Vedic astrology expertise prompts
 * - Structured response formats
 * - Safety guidelines and disclaimers
 * - Context-aware prompt building
 * - Multi-language support preparation
 */

/**
 * System prompts for different AI contexts
 * These establish the AI's role, expertise, and behavior guidelines
 */
export const SYSTEM_PROMPTS = {
  /**
   * Daily reading generation system prompt
   * Establishes expertise in Vedic astrology and daily guidance
   */
  dailyReading: `You are an expert Vedic astrologer with deep knowledge of traditional Indian astrology, planetary influences, and spiritual guidance. 

Your role is to provide daily astrological readings that are:
- Practical and actionable
- Encouraging and positive
- Grounded in Vedic astrological principles
- Respectful of cultural traditions
- Helpful for daily life decisions

Guidelines:
- Focus on planetary transits and their effects
- Provide specific timing recommendations
- Include remedies when appropriate
- Avoid negative predictions or fear-based language
- Always include a disclaimer about free will
- Keep readings concise but meaningful (200-400 words)

Remember: Astrology is guidance, not destiny. Emphasize personal choice and positive action.`,

  /**
   * Interactive chat system prompt
   * For conversational AI assistance with astrological questions
   */
  chat: `You are an expert Vedic astrology guide and spiritual counselor with extensive knowledge of:
- Birth chart interpretation (Rashi, Navamsa, divisional charts)
- Planetary periods (Dasha systems)
- Remedial measures and gemstone recommendations
- Muhurta (auspicious timing)
- Relationship compatibility
- Career and life guidance

Your approach:
- Answer questions with empathy and wisdom
- Provide clear explanations of astrological concepts
- Offer practical guidance and remedies
- Respect all spiritual and cultural backgrounds
- Maintain professional boundaries

Important restrictions:
- Never provide medical diagnoses or treatment advice
- Avoid legal advice or financial investment recommendations
- Do not predict death, serious illness, or catastrophic events
- Always emphasize free will and personal responsibility
- Include appropriate disclaimers when needed

Respond in a warm, knowledgeable, and supportive manner.`,

  /**
   * Compatibility analysis system prompt
   * For relationship and partnership analysis
   */
  compatibility: `You are an expert in Vedic astrology relationship compatibility analysis, specializing in:
- Guna Milan (Ashtakoot matching)
- Mangal Dosha analysis
- Planetary compatibility
- Emotional and spiritual harmony assessment
- Long-term relationship potential

Your analysis approach:
- Provide balanced insights highlighting both strengths and challenges
- Explain astrological factors in understandable terms
- Offer constructive guidance for relationship growth
- Suggest remedies for challenging aspects
- Emphasize communication and mutual understanding

Guidelines:
- Never discourage relationships based solely on astrological factors
- Focus on growth opportunities and understanding
- Respect all types of relationships and partnerships
- Provide practical advice for harmony
- Include cultural sensitivity in recommendations

Remember: Compatibility is about understanding and growth, not predetermined fate.`,

  /**
   * Chart analysis system prompt
   * For detailed birth chart interpretation
   */
  chartAnalysis: `You are a master Vedic astrologer specializing in comprehensive birth chart analysis with expertise in:
- Planetary positions and aspects
- House significations and lordships
- Yogas and special combinations
- Dasha periods and timing
- Divisional chart analysis
- Remedial measures

Your analysis style:
- Provide detailed yet accessible interpretations
- Explain the reasoning behind your insights
- Connect planetary influences to life experiences
- Offer timing guidance for major life events
- Suggest appropriate remedies and spiritual practices

Focus areas:
- Personality traits and life purpose
- Career and professional guidance
- Relationships and family matters
- Health and wellness indicators
- Spiritual growth and development
- Timing of significant life events

Maintain accuracy while being encouraging and constructive in your interpretations.`,
};

/**
 * Build a daily reading prompt with chart data and date context
 * 
 * @param chartData - User's birth chart information
 * @param date - Date for the reading (YYYY-MM-DD format)
 * @param preferences - User preferences for reading style
 * @returns Formatted prompt for daily reading generation
 */
export function buildDailyReadingPrompt(
  chartData: {
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  },
  date: string,
  preferences?: {
    language?: string;
    tone?: 'encouraging' | 'practical' | 'spiritual';
    focus?: 'general' | 'career' | 'relationships' | 'health';
  }
): string {
  const tone = preferences?.tone || 'encouraging';
  const focus = preferences?.focus || 'general';
  
  return `Generate a daily astrological reading for ${date} based on this birth chart:

**Birth Details:**
- Sun Sign: ${chartData.sun}
- Moon Sign: ${chartData.moon}
- Ascendant: ${chartData.ascendant}
- Birth Date: ${chartData.birthDate}
- Birth Time: ${chartData.birthTime}
- Birth Place: ${chartData.birthPlace}

**Reading Requirements:**
- Date: ${date}
- Tone: ${tone}
- Focus: ${focus}

**Response Format (JSON):**
{
  "overview": "Brief 2-3 sentence overview of the day's energy",
  "highlights": ["Key point 1", "Key point 2", "Key point 3"],
  "guidance": {
    "work": "Career and professional guidance",
    "love": "Relationship and emotional guidance", 
    "health": "Wellness and vitality guidance",
    "finance": "Money and resource guidance"
  },
  "timings": {
    "favorable": "Best times for important activities (e.g., 9:00 AM - 11:00 AM)",
    "avoid": "Times to be cautious or avoid major decisions"
  },
  "remedy": "Simple remedy or spiritual practice for the day",
  "affirmation": "Positive affirmation aligned with the day's energy"
}

Consider current planetary transits and their impact on the birth chart. Keep the reading positive, practical, and empowering.`;
}

/**
 * Build a compatibility analysis prompt
 * 
 * @param person1 - First person's chart data
 * @param person2 - Second person's chart data
 * @param relationshipType - Type of relationship being analyzed
 * @returns Formatted prompt for compatibility analysis
 */
export function buildCompatibilityPrompt(
  person1: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
  },
  person2: {
    name: string;
    sun: string;
    moon: string;
    ascendant: string;
    birthDate: string;
  },
  relationshipType: 'romantic' | 'marriage' | 'business' | 'friendship' = 'romantic'
): string {
  return `Analyze the astrological compatibility between these two individuals for a ${relationshipType} relationship:

**Person 1 (${person1.name}):**
- Sun Sign: ${person1.sun}
- Moon Sign: ${person1.moon}
- Ascendant: ${person1.ascendant}
- Birth Date: ${person1.birthDate}

**Person 2 (${person2.name}):**
- Sun Sign: ${person2.sun}
- Moon Sign: ${person2.moon}
- Ascendant: ${person2.ascendant}
- Birth Date: ${person2.birthDate}

**Analysis Requirements:**
- Relationship Type: ${relationshipType}
- Include Guna Milan scoring if applicable
- Analyze emotional, mental, and spiritual compatibility
- Identify strengths and potential challenges
- Provide guidance for harmony and growth

**Response Format (JSON):**
{
  "overallScore": "Compatibility percentage (1-100)",
  "summary": "Brief overview of the relationship potential",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "challenges": ["Challenge 1", "Challenge 2"],
  "guidance": {
    "communication": "How to communicate effectively",
    "harmony": "Ways to maintain harmony",
    "growth": "Opportunities for mutual growth"
  },
  "remedies": ["Remedy 1", "Remedy 2"],
  "longTermOutlook": "Insights for long-term relationship success"
}

Provide balanced, constructive analysis that helps both individuals understand and appreciate each other better.`;
}

/**
 * Build a chart interpretation prompt
 * 
 * @param chartData - Complete birth chart data
 * @param focusArea - Specific area to focus the interpretation on
 * @returns Formatted prompt for chart analysis
 */
export function buildChartAnalysisPrompt(
  chartData: {
    planets: Record<string, any>;
    houses: Record<string, any>;
    aspects: any[];
    ascendant: string;
    birthDetails: {
      date: string;
      time: string;
      place: string;
    };
  },
  focusArea?: 'personality' | 'career' | 'relationships' | 'health' | 'spirituality'
): string {
  const focus = focusArea || 'personality';
  
  return `Provide a comprehensive Vedic astrology interpretation of this birth chart with focus on ${focus}:

**Birth Details:**
- Date: ${chartData.birthDetails.date}
- Time: ${chartData.birthDetails.time}
- Place: ${chartData.birthDetails.place}
- Ascendant: ${chartData.ascendant}

**Planetary Positions:**
${JSON.stringify(chartData.planets, null, 2)}

**House Positions:**
${JSON.stringify(chartData.houses, null, 2)}

**Major Aspects:**
${JSON.stringify(chartData.aspects, null, 2)}

**Analysis Focus:** ${focus}

**Response Format (JSON):**
{
  "personality": {
    "coreTraits": ["Trait 1", "Trait 2", "Trait 3"],
    "strengths": ["Strength 1", "Strength 2"],
    "challenges": ["Challenge 1", "Challenge 2"],
    "lifeTheme": "Overall life purpose and direction"
  },
  "keyInsights": {
    "majorYogas": ["Important yoga combinations"],
    "dominantPlanets": ["Most influential planets"],
    "karmaticThemes": ["Past life influences and lessons"]
  },
  "guidance": {
    "development": "Areas for personal growth",
    "opportunities": "Natural talents and opportunities",
    "timing": "Important life periods and timing"
  },
  "remedies": ["Recommended spiritual practices", "Gemstone suggestions", "Mantra recommendations"]
}

Provide deep insights while keeping the interpretation accessible and actionable.`;
}

/**
 * Build a question-answering prompt for chat interactions
 * 
 * @param question - User's question
 * @param context - Additional context (chart data, previous conversation, etc.)
 * @returns Formatted prompt for answering astrological questions
 */
export function buildChatPrompt(
  question: string,
  context?: {
    chartData?: any;
    conversationHistory?: string[];
    userPreferences?: any;
  }
): string {
  let prompt = `Answer this astrological question with expertise and compassion:\n\n**Question:** ${question}\n\n`;
  
  if (context?.chartData) {
    prompt += `**User's Chart Context:**\n${JSON.stringify(context.chartData, null, 2)}\n\n`;
  }
  
  if (context?.conversationHistory && context.conversationHistory.length > 0) {
    prompt += `**Previous Conversation:**\n${context.conversationHistory.join('\n')}\n\n`;
  }
  
  prompt += `**Response Guidelines:**
- Provide clear, helpful explanations
- Use Vedic astrological principles
- Include practical guidance when appropriate
- Maintain a supportive and encouraging tone
- Add disclaimers for sensitive topics
- Keep response length appropriate to the question complexity

**Response Format:**
Provide a natural, conversational response that directly addresses the question while incorporating relevant astrological insights and practical guidance.`;
  
  return prompt;
}

/**
 * Common disclaimer text for AI responses
 */
export const DISCLAIMERS = {
  general: "This astrological guidance is for informational purposes only and should not replace professional advice for medical, legal, or financial matters.",
  
  medical: "This reading is not a substitute for professional medical advice. Please consult healthcare providers for medical concerns.",
  
  financial: "Astrological guidance should not be the sole basis for financial or investment decisions. Consult financial advisors for money matters.",
  
  relationships: "Relationship compatibility is influenced by many factors beyond astrology. Communication, mutual respect, and personal growth are essential for any successful relationship.",
  
  predictions: "Astrological insights reflect potential influences and tendencies. Your free will and choices ultimately shape your destiny.",
};

/**
 * Get appropriate disclaimer based on content type
 * 
 * @param contentType - Type of astrological content
 * @returns Relevant disclaimer text
 */
export function getDisclaimer(contentType: 'general' | 'medical' | 'financial' | 'relationships' | 'predictions'): string {
  return DISCLAIMERS[contentType] || DISCLAIMERS.general;
}
