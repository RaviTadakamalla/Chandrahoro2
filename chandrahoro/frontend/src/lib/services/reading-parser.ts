export interface ParsedReading {
  highlights: string[];
  work: string;
  love: string;
  health: string;
  finance: string;
  timings: Array<{
    window: string;
    activity: string;
    reason: string;
  }>;
}

export function parseReadingResponse(content: string): ParsedReading {
  console.log('[Reading Parser] Parsing AI response...');
  
  try {
    // Remove any markdown code blocks if present
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^```/gm, '')
      .replace(/```$/gm, '')
      .trim();
    
    console.log('[Reading Parser] Cleaned content length:', cleaned.length);
    
    // Parse JSON
    const json = JSON.parse(cleaned);
    
    // Validate and return
    const parsed: ParsedReading = {
      highlights: Array.isArray(json.highlights) ? json.highlights : [],
      work: typeof json.work === 'string' ? json.work : '',
      love: typeof json.love === 'string' ? json.love : '',
      health: typeof json.health === 'string' ? json.health : '',
      finance: typeof json.finance === 'string' ? json.finance : '',
      timings: Array.isArray(json.timings) ? json.timings : [],
    };
    
    console.log('[Reading Parser] ✅ Successfully parsed JSON response');
    return parsed;
  } catch (error) {
    console.error('[Reading Parser] Failed to parse reading JSON:', error);
    console.error('[Reading Parser] Content preview:', content.substring(0, 200));
    
    // Fallback: Try to extract from markdown format
    console.log('[Reading Parser] Attempting fallback markdown parsing...');
    return extractFromMarkdown(content);
  }
}

function extractFromMarkdown(content: string): ParsedReading {
  console.log('[Reading Parser] Using fallback markdown parser');
  
  // Fallback parser for non-JSON responses
  const reading: ParsedReading = {
    highlights: [],
    work: '',
    love: '',
    health: '',
    finance: '',
    timings: [],
  };
  
  try {
    // Extract sections using regex
    const sections = {
      highlights: /(?:highlights?|key\s+insights?):?\s*\n?((?:[-•*]\s*.+\n?){1,5})/i,
      work: /(?:work|career):?\s*\n?(.+?)(?=\n\n|love:|health:|finance:|timing|$)/is,
      love: /love:?\s*\n?(.+?)(?=\n\n|health:|finance:|timing|$)/is,
      health: /health:?\s*\n?(.+?)(?=\n\n|finance:|timing|$)/is,
      finance: /finance:?\s*\n?(.+?)(?=\n\n|timing|$)/is,
    };
    
    // Extract highlights
    const highlightsMatch = content.match(sections.highlights);
    if (highlightsMatch) {
      reading.highlights = highlightsMatch[1]
        .split('\n')
        .filter(l => l.match(/^[-•*]\s/))
        .map(l => l.replace(/^[-•*]\s/, '').trim())
        .filter(l => l.length > 0)
        .slice(0, 3);
    }
    
    // If no highlights found, try to extract first 3 sentences
    if (reading.highlights.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      reading.highlights = sentences.slice(0, 3).map(s => s.trim());
    }
    
    // Extract other sections
    for (const [key, regex] of Object.entries(sections)) {
      if (key === 'highlights') continue;
      const match = content.match(regex);
      if (match && match[1]) {
        reading[key as keyof typeof reading] = match[1].trim();
      }
    }
    
    // Extract timings if possible
    const timingPattern = /(\d{1,2}:\d{2}\s*(?:AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)[:\s]*(.+?)(?:\n|$)/gi;
    let timingMatch;
    while ((timingMatch = timingPattern.exec(content)) !== null && reading.timings.length < 3) {
      reading.timings.push({
        window: timingMatch[1].trim(),
        activity: timingMatch[2].trim().split('.')[0], // Take first sentence
        reason: 'Astrological timing',
      });
    }
    
    console.log('[Reading Parser] ✅ Fallback parsing completed');
    console.log('[Reading Parser] Extracted:', {
      highlights: reading.highlights.length,
      work: reading.work.length,
      love: reading.love.length,
      health: reading.health.length,
      finance: reading.finance.length,
      timings: reading.timings.length,
    });
    
    return reading;
  } catch (error) {
    console.error('[Reading Parser] Fallback parsing failed:', error);
    
    // Last resort: return minimal structure
    return {
      highlights: ['Unable to parse reading', 'Please try again', 'Contact support if issue persists'],
      work: 'Reading parsing failed. Please regenerate.',
      love: 'Reading parsing failed. Please regenerate.',
      health: 'Reading parsing failed. Please regenerate.',
      finance: 'Reading parsing failed. Please regenerate.',
      timings: [
        { window: '9:00 AM - 11:00 AM', activity: 'General activities', reason: 'Default timing' },
        { window: '2:00 PM - 4:00 PM', activity: 'General activities', reason: 'Default timing' },
      ],
    };
  }
}
