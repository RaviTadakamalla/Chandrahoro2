import { ReadingContext } from './reading-context-builder';

export const SYSTEM_PROMPTS = {
  dailyReading: `You are an expert Vedic astrologer providing daily readings. 
Be insightful, encouraging, and accessible. Use astrological terminology appropriately but remain understandable.
Never make medical, legal, or financial advice. Focus on guidance and self-awareness.
Always respond with valid JSON only - no markdown, no code blocks, just the JSON object.`,
};

export function buildDailyReadingPrompt(
  context: ReadingContext,
  date: string
): string {
  const { chart, transits, preferences } = context;
  
  // Build planets section with safe access
  const planetsSection = Object.entries(chart.planets)
    .filter(([_, data]) => data && typeof data === 'object')
    .map(([planet, data]: [string, any]) => {
      const degree = data.degree ? data.degree.toFixed(1) : '0.0';
      const house = data.house ? ` in House ${data.house}` : '';
      const sign = data.sign || 'Unknown';
      return `- ${planet}: ${sign} ${degree}°${house}`;
    })
    .join('\n');
  
  // Build transits section with safe access
  const transitsSection = Object.entries(transits.planets)
    .filter(([_, data]) => data && typeof data === 'object')
    .map(([planet, data]: [string, any]) => {
      const degree = data.degree ? data.degree.toFixed(1) : '0.0';
      const sign = data.sign || 'Unknown';
      return `- ${planet}: ${sign} ${degree}°`;
    })
    .join('\n');
  
  // Build aspects section
  const aspectsSection = transits.significantAspects.length > 0 
    ? transits.significantAspects.map(a => `- ${a}`).join('\n')
    : '- No major transits today';
  
  // Get Moon nakshatra info safely
  const moonData = chart.planets.Moon || {};
  const nakshatra = moonData.nakshatra || 'Unknown';
  const nakshatraPada = moonData.nakshatraPada || 1;
  
  return `Generate a personalized daily astrological reading for ${date}.

BIRTH CHART (Vedic/Sidereal):
- Sun: ${chart.sunSign}
- Moon: ${chart.moonSign}
- Ascendant: ${chart.ascendant}
- Current Dasha: ${chart.currentDasha.planet} (${chart.currentDasha.yearsRemaining} years remaining)
- Moon Nakshatra: ${nakshatra} (Pada ${nakshatraPada})

PLANETARY POSITIONS:
${planetsSection}

CURRENT TRANSITS (${date}):
${transitsSection}

SIGNIFICANT TRANSITING ASPECTS:
${aspectsSection}

USER PREFERENCES:
- Tone: ${preferences.tone} (mystic = spiritual/poetic, practical = grounded/actionable, playful = light/encouraging)
- Language: ${preferences.language}

INSTRUCTIONS:
1. Provide 3 key highlights - brief, memorable insights (1-2 sentences each)
2. Specific guidance for each life area (100-150 words each):
   - Work: Career, projects, professional relationships
   - Love: Romance, relationships, emotional connections
   - Health: Physical wellness, mental health, self-care
   - Finance: Money matters, investments, resources
3. Best timing windows (2-3 time slots):
   - Provide specific time ranges (e.g., "10:00 AM - 12:00 PM")
   - Suggest activities suited to that time
   - Brief astrological reason (planetary position/aspect)
4. Consider BOTH natal chart positions AND current transits
5. Use ${preferences.tone} tone consistently
6. Be encouraging, constructive, and empowering
7. Avoid: death predictions, medical diagnoses, guaranteed outcomes

CRITICAL: Format response as valid JSON only, no markdown:
{
  "highlights": ["insight 1", "insight 2", "insight 3"],
  "work": "work guidance paragraph",
  "love": "love guidance paragraph",
  "health": "health guidance paragraph",
  "finance": "finance guidance paragraph",
  "timings": [
    {"window": "HH:MM AM/PM - HH:MM AM/PM", "activity": "suggested activity", "reason": "brief reason"},
    {"window": "HH:MM AM/PM - HH:MM AM/PM", "activity": "suggested activity", "reason": "brief reason"}
  ]
}`;
}

export function buildSystemPrompt(tone: string): string {
  const toneDescriptions = {
    mystic: 'spiritual, poetic, and deeply intuitive',
    practical: 'grounded, actionable, and straightforward',
    playful: 'light-hearted, encouraging, and uplifting',
  };
  
  const toneDesc = toneDescriptions[tone as keyof typeof toneDescriptions] || 'practical';
  
  return `You are an expert Vedic astrologer providing daily readings. 
Be ${toneDesc}, insightful, and encouraging. 
Use astrological terminology appropriately but remain accessible to general audiences.
Never make medical, legal, or financial advice. Focus on guidance and self-awareness.
Always respond with valid JSON only - no markdown, no code blocks, just the JSON object.`;
}
