/**
 * ChandraHoro V2.1 - Chat Context Builder
 * 
 * Builds comprehensive chat context by combining:
 * - User's birth chart data from MySQL (via Python backend integration)
 * - Conversation history (last 10 messages)
 * - Current planetary transits and Dasha information
 * 
 * Features:
 * - Chart data injection from MySQL/Prisma
 * - Conversation history management
 * - Context window optimization
 * - Token-aware prompt building
 * - Dasha calculations and timing
 */

import { prisma } from '@/lib/prisma';

export interface ChatContext {
  chart: {
    ascendant: string;
    sunSign: string;
    moonSign: string;
    planets: Record<string, any>;
    currentDasha: {
      planet: string;
      yearsRemaining: number;
      subPeriod?: string;
    };
    houses: Record<string, any>;
  } | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userProfile: {
    fullName?: string;
    birthLocation?: string;
    timezone?: string;
  } | null;
}

export interface ContextBuildOptions {
  includeTransits?: boolean;
  maxMessages?: number;
  includeHouses?: boolean;
  includeDivisionalCharts?: boolean;
}

/**
 * Build comprehensive chat context for AI conversation
 */
export async function buildChatContext(
  userId: string,
  conversationId: string,
  options: ContextBuildOptions = {}
): Promise<ChatContext> {
  const {
    maxMessages = 10,
    includeHouses = true,
    includeDivisionalCharts = false,
  } = options;
  
  try {
    // 1. Get user's primary birth chart from MySQL (saved from Python backend)
    const chart = await prisma.birthChart.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
      select: {
        ascendant: true,
        sunSign: true,
        moonSign: true,
        planets: true,
        houses: includeHouses,
        currentDasha: true,
        divisionalCharts: includeDivisionalCharts,
        createdAt: true,
      },
    });
    
    // 2. Get user profile information
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        birthLocation: true,
        timezone: true,
      },
    });
    
    // 3. Get conversation history (last N messages)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: maxMessages,
      select: {
        role: true,
        content: true,
        createdAt: true,
      },
    });
    
    // Reverse to get chronological order
    const conversationHistory = messages.reverse().map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
    }));
    
    // 4. Process chart data if available
    let chartContext = null;
    if (chart) {
      chartContext = await processChartData(chart);
    }
    
    return {
      chart: chartContext,
      conversationHistory,
      userProfile: userProfile || null,
    };
  } catch (error) {
    console.error('[ChatContextBuilder] Error building context:', error);
    
    // Return minimal context on error
    return {
      chart: null,
      conversationHistory: [],
      userProfile: null,
    };
  }
}

/**
 * Process raw chart data into structured format
 */
async function processChartData(chart: any): Promise<ChatContext['chart']> {
  try {
    const planets = chart.planets as any;
    const houses = chart.houses as any;
    const dashaData = chart.currentDasha as any;
    
    // Calculate Dasha years remaining
    let currentDasha = null;
    if (dashaData && dashaData.endDate) {
      const dashaEndDate = new Date(dashaData.endDate);
      const now = new Date();
      const yearsRemaining = (dashaEndDate.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      
      currentDasha = {
        planet: dashaData.planet || 'Unknown',
        yearsRemaining: Math.max(0, Math.round(yearsRemaining * 10) / 10),
        subPeriod: dashaData.subPeriod || undefined,
      };
    }
    
    return {
      ascendant: chart.ascendant || 'Unknown',
      sunSign: chart.sunSign || 'Unknown',
      moonSign: chart.moonSign || 'Unknown',
      planets: planets || {},
      currentDasha: currentDasha || {
        planet: 'Unknown',
        yearsRemaining: 0,
      },
      houses: houses || {},
    };
  } catch (error) {
    console.error('[ChatContextBuilder] Error processing chart data:', error);
    return null;
  }
}

/**
 * Build optimized prompt for Claude API
 */
export function buildChatPrompt(
  userMessage: string,
  context: ChatContext,
  options: { includeFullChart?: boolean; maxTokens?: number } = {}
): string {
  const { includeFullChart = false, maxTokens = 4000 } = options;
  
  let prompt = '';
  
  // Add user profile context
  if (context.userProfile?.fullName) {
    prompt += `User: ${context.userProfile.fullName}\n`;
  }
  
  // Add chart context if available
  if (context.chart) {
    prompt += `\nBirth Chart Information:\n`;
    prompt += `- Ascendant: ${context.chart.ascendant}\n`;
    prompt += `- Sun Sign: ${context.chart.sunSign}`;
    
    if (context.chart.planets.Sun?.degree) {
      prompt += ` (${context.chart.planets.Sun.degree.toFixed(1)}°)`;
    }
    prompt += `\n`;
    
    prompt += `- Moon Sign: ${context.chart.moonSign}`;
    if (context.chart.planets.Moon?.degree) {
      prompt += ` (${context.chart.planets.Moon.degree.toFixed(1)}°)`;
    }
    prompt += `\n`;
    
    // Add current Dasha information
    if (context.chart.currentDasha) {
      prompt += `- Current Dasha: ${context.chart.currentDasha.planet}`;
      if (context.chart.currentDasha.yearsRemaining > 0) {
        prompt += ` (${context.chart.currentDasha.yearsRemaining} years remaining)`;
      }
      if (context.chart.currentDasha.subPeriod) {
        prompt += ` - ${context.chart.currentDasha.subPeriod} sub-period`;
      }
      prompt += `\n`;
    }
    
    // Add key planetary positions if full chart requested
    if (includeFullChart && context.chart.planets) {
      prompt += `\nKey Planetary Positions:\n`;
      const keyPlanets = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
      
      keyPlanets.forEach(planet => {
        const planetData = context.chart!.planets[planet];
        if (planetData) {
          prompt += `- ${planet}: ${planetData.sign || 'Unknown'}`;
          if (planetData.degree) {
            prompt += ` ${planetData.degree.toFixed(1)}°`;
          }
          if (planetData.house) {
            prompt += ` (House ${planetData.house})`;
          }
          prompt += `\n`;
        }
      });
    }
    
    prompt += `\n`;
  }
  
  // Add conversation history
  if (context.conversationHistory.length > 0) {
    prompt += `Previous conversation:\n`;
    
    // Limit history to fit within token budget
    let historyTokens = 0;
    const maxHistoryTokens = Math.floor(maxTokens * 0.4); // 40% of budget for history
    
    for (let i = context.conversationHistory.length - 1; i >= 0; i--) {
      const msg = context.conversationHistory[i];
      const msgTokens = Math.ceil(msg.content.length / 4); // Rough token estimate
      
      if (historyTokens + msgTokens > maxHistoryTokens) {
        break;
      }
      
      historyTokens += msgTokens;
    }
    
    // Add messages that fit within token budget
    const messagesToInclude = context.conversationHistory.slice(-Math.min(context.conversationHistory.length, 8));
    
    messagesToInclude.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${msg.content}\n`;
    });
    
    prompt += `\n`;
  }
  
  // Add current message
  prompt += `User: ${userMessage}`;
  
  return prompt;
}

/**
 * Estimate token count for prompt
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Optimize context for token limits
 */
export function optimizeContextForTokens(
  context: ChatContext,
  maxTokens: number = 4000
): ChatContext {
  const optimized = { ...context };
  
  // Estimate current token usage
  let currentTokens = 0;
  
  // Chart context tokens (roughly fixed)
  if (context.chart) {
    currentTokens += 200; // Estimated chart context tokens
  }
  
  // Optimize conversation history
  const maxHistoryTokens = maxTokens - currentTokens - 500; // Reserve 500 for user message
  let historyTokens = 0;
  const optimizedHistory = [];
  
  for (let i = context.conversationHistory.length - 1; i >= 0; i--) {
    const msg = context.conversationHistory[i];
    const msgTokens = estimateTokenCount(msg.content);
    
    if (historyTokens + msgTokens <= maxHistoryTokens) {
      optimizedHistory.unshift(msg);
      historyTokens += msgTokens;
    } else {
      break;
    }
  }
  
  optimized.conversationHistory = optimizedHistory;
  
  return optimized;
}

/**
 * Get chart summary for quick context
 */
export function getChartSummary(chart: ChatContext['chart']): string {
  if (!chart) return 'No birth chart available';
  
  let summary = `${chart.ascendant} Ascendant, ${chart.sunSign} Sun, ${chart.moonSign} Moon`;
  
  if (chart.currentDasha) {
    summary += `, ${chart.currentDasha.planet} Dasha`;
    if (chart.currentDasha.yearsRemaining > 0) {
      summary += ` (${chart.currentDasha.yearsRemaining}y left)`;
    }
  }
  
  return summary;
}

/**
 * Check if user has complete chart data
 */
export async function hasCompleteChartData(userId: string): Promise<boolean> {
  try {
    const chart = await prisma.birthChart.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
      select: {
        ascendant: true,
        sunSign: true,
        moonSign: true,
        planets: true,
      },
    });
    
    return !!(chart && chart.ascendant && chart.sunSign && chart.moonSign && chart.planets);
  } catch (error) {
    console.error('[ChatContextBuilder] Error checking chart data:', error);
    return false;
  }
}
