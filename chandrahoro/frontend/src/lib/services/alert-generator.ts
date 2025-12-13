/**
 * ChandraHoro V2.1 - Alert Generator Service
 * 
 * Generates AI-powered transit alerts using Claude API.
 * Creates personalized, actionable guidance based on detected transits.
 * 
 * Features:
 * - Context-aware alert generation
 * - Severity-based messaging
 * - Practical guidance and timing
 * - Vedic astrology principles
 * - User-friendly language
 */

import { sendClaudeRequest } from '@/lib/ai/claude-client';
import { prisma } from '@/lib/prisma';
import { TransitAlert } from './transit-detector';
import { format, addDays } from 'date-fns';

export interface GeneratedAlert {
  id: string;
  userId: string;
  alertType: 'transit';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
  expiresAt: Date;
  createdAt: Date;
}

export interface AlertGenerationOptions {
  includeRemedies?: boolean;
  includeTiming?: boolean;
  tone?: 'encouraging' | 'neutral' | 'cautious';
  maxLength?: number;
}

/**
 * Generate AI-powered transit alert
 */
export async function generateTransitAlert(
  userId: string,
  transit: TransitAlert,
  options: AlertGenerationOptions = {}
): Promise<GeneratedAlert> {
  try {
    const {
      includeRemedies = true,
      includeTiming = true,
      tone = 'encouraging',
      maxLength = 300,
    } = options;
    
    // Get user's profile for personalization
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        birthLocation: true,
        preferences: true,
      },
    });
    
    // Build context-aware prompt
    const prompt = buildAlertPrompt(transit, {
      userProfile,
      includeRemedies,
      includeTiming,
      tone,
      maxLength,
    });
    
    // Generate alert content with Claude
    const response = await sendClaudeRequest({
      userId,
      prompt,
      systemPrompt: getAlertSystemPrompt(transit.significance),
      model: 'claude-3-haiku-20240307', // Fast model for alerts
      temperature: 0.7,
      maxTokens: Math.ceil(maxLength / 3), // Rough token estimation
      context: { 
        type: 'transit_alert',
        transitType: transit.type,
        significance: transit.significance,
      },
    });
    
    // Generate appropriate title
    const title = generateAlertTitle(transit);
    
    // Calculate expiration date based on transit duration
    const expiresAt = calculateExpirationDate(transit);
    
    // Save alert to database
    const alert = await prisma.alert.create({
      data: {
        userId,
        alertType: 'transit',
        title,
        message: response.content.trim(),
        severity: transit.significance,
        metadata: {
          transit,
          generatedAt: new Date().toISOString(),
          model: 'claude-3-haiku-20240307',
          options,
        } as any,
        expiresAt,
      },
    });
    
    return alert as GeneratedAlert;
  } catch (error) {
    console.error('[AlertGenerator] Error generating transit alert:', error);
    
    // Fallback: Create basic alert without AI
    const fallbackAlert = await createFallbackAlert(userId, transit);
    return fallbackAlert;
  }
}

/**
 * Build context-aware prompt for alert generation
 */
function buildAlertPrompt(
  transit: TransitAlert,
  context: {
    userProfile?: any;
    includeRemedies: boolean;
    includeTiming: boolean;
    tone: string;
    maxLength: number;
  }
): string {
  const { userProfile, includeRemedies, includeTiming, tone, maxLength } = context;
  
  let prompt = `Generate a personalized transit alert for this astrological event:\n\n`;
  
  // Transit details
  prompt += `TRANSIT: ${transit.description}\n`;
  prompt += `TYPE: ${transit.type}\n`;
  prompt += `SIGNIFICANCE: ${transit.significance}\n`;
  prompt += `ORBS: ${transit.angle.toFixed(1)}° (within ${transit.orb}° orb)\n`;
  
  if (transit.duration) {
    prompt += `DURATION: ${transit.duration}\n`;
  }
  
  if (transit.aspectType) {
    prompt += `ASPECT: ${transit.aspectType}\n`;
  }
  
  // User context
  if (userProfile?.fullName) {
    prompt += `\nUSER: ${userProfile.fullName}\n`;
  }
  
  if (userProfile?.birthLocation) {
    prompt += `LOCATION: ${userProfile.birthLocation}\n`;
  }
  
  // Instructions
  prompt += `\nPLEASE PROVIDE:\n`;
  prompt += `1. Brief explanation of what this transit means (1-2 sentences)\n`;
  prompt += `2. Practical guidance for navigating this energy\n`;
  
  if (includeTiming) {
    prompt += `3. Timing considerations (when to act/be aware)\n`;
  }
  
  if (includeRemedies) {
    prompt += `4. Simple Vedic remedies or practices (optional)\n`;
  }
  
  // Tone and style guidelines
  prompt += `\nSTYLE GUIDELINES:\n`;
  prompt += `- Tone: ${tone} and supportive\n`;
  prompt += `- Length: Maximum ${maxLength} characters\n`;
  prompt += `- Language: Clear, accessible, non-technical\n`;
  prompt += `- Focus: Empowerment and practical wisdom\n`;
  prompt += `- Avoid: Fear-based language, medical advice, guarantees\n`;
  
  // Severity-specific instructions
  switch (transit.significance) {
    case 'critical':
      prompt += `- This is a major life transit - emphasize preparation and awareness\n`;
      break;
    case 'high':
      prompt += `- This is an important transit - provide clear guidance\n`;
      break;
    case 'medium':
      prompt += `- This is a moderate influence - offer balanced perspective\n`;
      break;
    case 'low':
      prompt += `- This is a subtle influence - keep it brief and positive\n`;
      break;
  }
  
  return prompt;
}

/**
 * Get system prompt based on alert significance
 */
function getAlertSystemPrompt(significance: TransitAlert['significance']): string {
  const basePrompt = `You are an expert Vedic astrologer creating personalized transit alerts. 

Your role is to:
- Translate complex astrological transits into practical guidance
- Provide encouraging, empowering insights
- Offer actionable advice for navigating planetary energies
- Use accessible language that non-astrologers can understand
- Focus on growth opportunities and conscious awareness

IMPORTANT GUIDELINES:
- Be supportive and constructive, never fear-based
- Avoid medical, legal, or financial advice
- Don't make absolute predictions about outcomes
- Emphasize free will and conscious choice
- Keep remedies simple and practical
- Use Vedic astrological principles and terminology appropriately`;

  switch (significance) {
    case 'critical':
      return basePrompt + `\n\nThis is a CRITICAL transit with major life implications. Emphasize:
- The transformative potential of this period
- Importance of conscious awareness and preparation
- Long-term perspective and patience
- Seeking guidance from mentors or spiritual practices`;

    case 'high':
      return basePrompt + `\n\nThis is a HIGH significance transit with important implications. Focus on:
- Clear, actionable guidance for navigating this energy
- Opportunities for growth and positive change
- Practical steps for alignment with planetary energies
- Balance between caution and optimism`;

    case 'medium':
      return basePrompt + `\n\nThis is a MEDIUM significance transit. Provide:
- Balanced perspective on the transit's influence
- Gentle guidance for working with this energy
- Encouragement to stay aware and conscious
- Simple practices for harmony`;

    case 'low':
      return basePrompt + `\n\nThis is a LOW significance transit with subtle influence. Keep it:
- Brief and positive
- Focused on awareness and mindfulness
- Encouraging about the gentle nature of this energy
- Simple and easy to understand`;

    default:
      return basePrompt;
  }
}

/**
 * Generate appropriate title for the alert
 */
function generateAlertTitle(transit: TransitAlert): string {
  const { type, planets, transitPlanet, natalPlanet, aspectType, significance } = transit;
  
  // Add significance indicator for high/critical alerts
  const urgencyPrefix = significance === 'critical' ? '🔴 ' : 
                       significance === 'high' ? '🟡 ' : '';
  
  switch (type) {
    case 'conjunction':
      return `${urgencyPrefix}${planets?.join(' & ')} Conjunction`;
    
    case 'return':
      return `${urgencyPrefix}${transitPlanet} Return`;
    
    case 'transit_to_natal':
      return `${urgencyPrefix}${transitPlanet} Transits Your ${natalPlanet}`;
    
    case 'aspect':
      const aspectName = aspectType ? aspectType.charAt(0).toUpperCase() + aspectType.slice(1) : 'Aspect';
      return `${urgencyPrefix}${transitPlanet} ${aspectName} Your ${natalPlanet}`;
    
    default:
      return `${urgencyPrefix}Planetary Transit Alert`;
  }
}

/**
 * Calculate expiration date based on transit duration
 */
function calculateExpirationDate(transit: TransitAlert): Date {
  const now = new Date();
  
  // Parse duration string to determine expiration
  const duration = transit.duration || '1 week';
  
  if (duration.includes('hour')) {
    return addDays(now, 1); // Expire after 1 day for short transits
  } else if (duration.includes('day')) {
    const days = parseInt(duration.match(/\d+/)?.[0] || '7');
    return addDays(now, Math.max(days, 3)); // Minimum 3 days
  } else if (duration.includes('week')) {
    const weeks = parseInt(duration.match(/\d+/)?.[0] || '2');
    return addDays(now, weeks * 7);
  } else if (duration.includes('month')) {
    const months = parseInt(duration.match(/\d+/)?.[0] || '1');
    return addDays(now, months * 30);
  }
  
  // Default: 7 days
  return addDays(now, 7);
}

/**
 * Create fallback alert when AI generation fails
 */
async function createFallbackAlert(
  userId: string,
  transit: TransitAlert
): Promise<GeneratedAlert> {
  const title = generateAlertTitle(transit);
  const message = generateFallbackMessage(transit);
  const expiresAt = calculateExpirationDate(transit);
  
  const alert = await prisma.alert.create({
    data: {
      userId,
      alertType: 'transit',
      title,
      message,
      severity: transit.significance,
      metadata: {
        transit,
        fallback: true,
        generatedAt: new Date().toISOString(),
      } as any,
      expiresAt,
    },
  });
  
  return alert as GeneratedAlert;
}

/**
 * Generate fallback message when AI is unavailable
 */
function generateFallbackMessage(transit: TransitAlert): string {
  const { description, significance, duration } = transit;
  
  let message = `A ${significance} significance transit is occurring: ${description}.`;
  
  if (duration) {
    message += ` This influence is expected to last ${duration}.`;
  }
  
  switch (significance) {
    case 'critical':
      message += ' This is a major astrological event that may bring significant changes. Stay aware and consider seeking guidance.';
      break;
    case 'high':
      message += ' This is an important planetary influence. Pay attention to the themes this transit brings into your life.';
      break;
    case 'medium':
      message += ' This transit offers opportunities for growth and awareness. Stay mindful of its influence.';
      break;
    case 'low':
      message += ' This is a gentle planetary influence. Use this time for reflection and conscious awareness.';
      break;
  }
  
  return message;
}

/**
 * Batch generate alerts for multiple transits
 */
export async function generateMultipleAlerts(
  userId: string,
  transits: TransitAlert[],
  options: AlertGenerationOptions = {}
): Promise<GeneratedAlert[]> {
  const alerts: GeneratedAlert[] = [];
  
  // Process alerts in sequence to avoid rate limiting
  for (const transit of transits) {
    try {
      const alert = await generateTransitAlert(userId, transit, options);
      alerts.push(alert);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('[AlertGenerator] Error generating alert for transit:', transit, error);
    }
  }
  
  return alerts;
}

/**
 * Get alert generation statistics
 */
export async function getAlertStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: number;
}> {
  const alerts = await prisma.alert.findMany({
    where: { userId, alertType: 'transit' },
    select: {
      severity: true,
      metadata: true,
      createdAt: true,
    },
  });
  
  const now = new Date();
  const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  const stats = {
    total: alerts.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    recent: 0,
  };
  
  alerts.forEach(alert => {
    // Count by severity
    stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
    
    // Count by transit type
    const transitType = (alert.metadata as any)?.transit?.type || 'unknown';
    stats.byType[transitType] = (stats.byType[transitType] || 0) + 1;
    
    // Count recent alerts
    if (alert.createdAt > recentCutoff) {
      stats.recent++;
    }
  });
  
  return stats;
}
