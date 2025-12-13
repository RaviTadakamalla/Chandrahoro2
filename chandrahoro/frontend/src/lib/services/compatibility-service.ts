/**
 * ChandraHoro V2.1 - Compatibility Analysis Service
 * 
 * Orchestrates relationship compatibility analysis using Python backend
 * for Kuta calculations and Claude AI for narrative generation.
 * 
 * Features:
 * - Python backend integration for Vedic compatibility calculations
 * - AI-powered narrative report generation
 * - Comprehensive Kuta analysis (8 factors)
 * - Strengths and challenges identification
 * - Practical relationship guidance
 */

import { pythonAPI } from '@/lib/api/python-client';
import { sendClaudeRequest } from '@/lib/ai/claude-client';
import { prisma } from '@/lib/prisma';
import { transformBirthDataToPython } from '@/lib/transformers/chart-transformer';

export interface CompatibilityInput {
  person1: {
    name: string;
    birth_date: string;
    birth_time: string;
    birth_place: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  person2: {
    name: string;
    birth_date: string;
    birth_time: string;
    birth_place: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface CompatibilityResult {
  id: string;
  userId: string;
  person1Name: string;
  person2Name: string;
  compatibilityScore: number;
  kutaScores: any;
  strengths: string[];
  challenges: string[];
  narrative: string;
  aiModel: string;
  tokensUsed: number;
  createdAt: Date;
}

/**
 * Generate comprehensive compatibility report
 */
export async function generateCompatibilityReport(
  userId: string,
  input: CompatibilityInput
): Promise<CompatibilityResult> {
  try {
    console.log('[CompatibilityService] Starting compatibility analysis');
    
    // 1. Calculate compatibility via Python backend
    console.log('[CompatibilityService] Calling Python backend for calculations');
    const pythonResult = await pythonAPI.calculateCompatibility(
      input.person1,
      input.person2
    );
    
    console.log('[CompatibilityService] Python result:', {
      score: pythonResult.score,
      kutaPoints: pythonResult.kuta_points,
      strengthsCount: pythonResult.strengths?.length || 0,
      challengesCount: pythonResult.challenges?.length || 0,
    });
    
    // 2. Generate narrative with Claude
    console.log('[CompatibilityService] Generating AI narrative');
    const narrative = await generateCompatibilityNarrative(
      userId,
      pythonResult,
      input.person1.name,
      input.person2.name
    );
    
    // 3. Save report to database
    console.log('[CompatibilityService] Saving report to database');
    const report = await prisma.compatibilityReport.create({
      data: {
        userId,
        person1Name: input.person1.name,
        person2Name: input.person2.name,
        person1BirthData: input.person1 as any,
        person2BirthData: input.person2 as any,
        compatibilityScore: pythonResult.score,
        kutaScores: pythonResult.detailed_analysis || {},
        strengths: pythonResult.strengths || [],
        challenges: pythonResult.challenges || [],
        narrative: narrative.content,
        aiModel: narrative.model || 'claude-3-5-sonnet-20241022',
        tokensUsed: narrative.tokensTotal || 0,
        generationTimeMs: narrative.responseTime,
      },
    });
    
    console.log('[CompatibilityService] Report created with ID:', report.id);
    
    return {
      id: report.id,
      userId: report.userId,
      person1Name: report.person1Name,
      person2Name: report.person2Name,
      compatibilityScore: Number(report.compatibilityScore),
      kutaScores: report.kutaScores as any,
      strengths: report.strengths as string[],
      challenges: report.challenges as string[],
      narrative: report.narrative,
      aiModel: report.aiModel,
      tokensUsed: report.tokensUsed,
      createdAt: report.createdAt,
    };
  } catch (error: any) {
    console.error('[CompatibilityService] Error generating report:', error);
    throw new Error(`Failed to generate compatibility report: ${error.message}`);
  }
}

/**
 * Generate AI-powered narrative report
 */
async function generateCompatibilityNarrative(
  userId: string,
  pythonResult: any,
  person1Name: string,
  person2Name: string
): Promise<any> {
  const prompt = buildCompatibilityPrompt(pythonResult, person1Name, person2Name);
  const systemPrompt = getCompatibilitySystemPrompt();
  
  try {
    const response = await sendClaudeRequest({
      userId,
      prompt,
      systemPrompt,
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      maxTokens: 1500,
      context: { 
        type: 'compatibility',
        score: pythonResult.score,
        kutaPoints: pythonResult.kuta_points,
      },
    });
    
    return response;
  } catch (error: any) {
    console.error('[CompatibilityService] AI generation failed:', error);
    
    // Fallback to structured narrative
    return {
      content: generateFallbackNarrative(pythonResult, person1Name, person2Name),
      model: 'fallback',
      tokensTotal: 0,
      responseTime: 0,
    };
  }
}

/**
 * Build comprehensive prompt for AI narrative generation
 */
function buildCompatibilityPrompt(
  pythonResult: any,
  person1Name: string,
  person2Name: string
): string {
  const kutaBreakdown = Object.entries(pythonResult.detailed_analysis || {})
    .map(([kuta, data]: [string, any]) => `- ${kuta}: ${data.points}/${getMaxKutaPoints(kuta)} - ${data.description}`)
    .join('\n');
  
  return `Generate a comprehensive relationship compatibility report based on Vedic astrology analysis.

COMPATIBILITY OVERVIEW:
- Overall Score: ${pythonResult.score}/10
- Kuta Points: ${pythonResult.kuta_points}/36
- Compatibility Level: ${getCompatibilityLevel(pythonResult.score)}

DETAILED KUTA ANALYSIS:
${kutaBreakdown}

RELATIONSHIP STRENGTHS:
${pythonResult.strengths?.map((s: string) => `- ${s}`).join('\n') || '- Analysis in progress'}

GROWTH AREAS:
${pythonResult.challenges?.map((c: string) => `- ${c}`).join('\n') || '- Analysis in progress'}

Generate a 4-paragraph report for ${person1Name} and ${person2Name}:

1. **Overview** (2-3 sentences): Introduce the compatibility score and overall relationship potential. Mention the Kuta points achieved and what this means for their partnership.

2. **Strengths** (3-4 sentences): Highlight the positive aspects of their compatibility. Focus on areas where they naturally harmonize and support each other's growth.

3. **Growth Areas** (3-4 sentences): Address challenges constructively. Frame difficulties as opportunities for mutual understanding and growth rather than insurmountable obstacles.

4. **Guidance** (3-4 sentences): Provide practical advice for nurturing their relationship. Include timing considerations and specific recommendations based on their astrological compatibility.

Tone: Balanced, constructive, relationship-affirming, and encouraging. Avoid overly technical jargon while maintaining astrological authenticity.`;
}

/**
 * Get system prompt for compatibility analysis
 */
function getCompatibilitySystemPrompt(): string {
  return `You are an expert Vedic astrologer specializing in relationship compatibility analysis. Your role is to provide insightful, balanced, and constructive guidance based on traditional Kuta matching principles.

Key principles:
- Focus on growth potential rather than limitations
- Provide practical, actionable advice
- Maintain cultural sensitivity and respect for Vedic traditions
- Balance optimism with realistic expectations
- Emphasize mutual understanding and communication
- Consider both partners' perspectives equally

Your analysis should be:
- Comprehensive yet accessible
- Encouraging while honest
- Focused on relationship building
- Grounded in Vedic astrological principles
- Practical for modern relationships`;
}

/**
 * Generate fallback narrative when AI fails
 */
function generateFallbackNarrative(
  pythonResult: any,
  person1Name: string,
  person2Name: string
): string {
  const score = pythonResult.score || 0;
  const kutaPoints = pythonResult.kuta_points || 0;
  const level = getCompatibilityLevel(score);
  
  return `Compatibility Analysis for ${person1Name} and ${person2Name}

Your relationship shows ${level.toLowerCase()} compatibility with a score of ${score}/10 and ${kutaPoints}/36 Kuta points.

${score >= 7 ? 'This indicates strong natural harmony between you both.' : 
  score >= 5 ? 'This suggests good potential with some areas for growth.' : 
  'This highlights opportunities for mutual understanding and development.'}

${pythonResult.strengths?.length > 0 ? 
  `Your key strengths include: ${pythonResult.strengths.slice(0, 3).join(', ')}.` : 
  'Your relationship has unique strengths that support mutual growth.'}

${pythonResult.challenges?.length > 0 ? 
  `Areas for attention include: ${pythonResult.challenges.slice(0, 2).join(' and ')}.` : 
  'Focus on open communication and understanding each other\'s perspectives.'}

Remember that compatibility is about growing together and supporting each other's journey. Use this analysis as a guide for building a stronger, more harmonious relationship.`;
}

/**
 * Get compatibility level description
 */
function getCompatibilityLevel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6.5) return 'Very Good';
  if (score >= 5) return 'Good';
  if (score >= 3.5) return 'Fair';
  return 'Challenging';
}

/**
 * Get maximum points for each Kuta
 */
function getMaxKutaPoints(kuta: string): number {
  const maxPoints: Record<string, number> = {
    varna: 1,
    vashya: 2,
    tara: 3,
    yoni: 4,
    graha_maitri: 5,
    gana: 6,
    bhakoot: 7,
    nadi: 8,
  };
  
  return maxPoints[kuta] || 1;
}

/**
 * Get user's compatibility reports
 */
export async function getUserCompatibilityReports(
  userId: string,
  limit: number = 10
): Promise<CompatibilityResult[]> {
  const reports = await prisma.compatibilityReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return reports.map(report => ({
    id: report.id,
    userId: report.userId,
    person1Name: report.person1Name,
    person2Name: report.person2Name,
    compatibilityScore: Number(report.compatibilityScore),
    kutaScores: report.kutaScores as any,
    strengths: report.strengths as string[],
    challenges: report.challenges as string[],
    narrative: report.narrative,
    aiModel: report.aiModel,
    tokensUsed: report.tokensUsed,
    createdAt: report.createdAt,
  }));
}

/**
 * Get specific compatibility report
 */
export async function getCompatibilityReport(
  reportId: string,
  userId: string
): Promise<CompatibilityResult | null> {
  const report = await prisma.compatibilityReport.findFirst({
    where: { 
      id: reportId,
      userId,
    },
  });
  
  if (!report) return null;
  
  return {
    id: report.id,
    userId: report.userId,
    person1Name: report.person1Name,
    person2Name: report.person2Name,
    compatibilityScore: Number(report.compatibilityScore),
    kutaScores: report.kutaScores as any,
    strengths: report.strengths as string[],
    challenges: report.challenges as string[],
    narrative: report.narrative,
    aiModel: report.aiModel,
    tokensUsed: report.tokensUsed,
    createdAt: report.createdAt,
  };
}
