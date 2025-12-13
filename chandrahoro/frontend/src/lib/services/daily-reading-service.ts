import { sendClaudeRequest } from '@/lib/ai/claude-client';
import { buildReadingContext } from './reading-context-builder';
import { buildDailyReadingPrompt, buildSystemPrompt } from './reading-prompts';
import { parseReadingResponse } from './reading-parser';
import { prisma } from '@/lib/prisma';
import { getCachedReading, setCachedReading } from '@/lib/redis/cache';
import { checkQuota, incrementQuota } from '@/lib/ai/quota';
import { format } from 'date-fns';

export interface GenerateReadingOptions {
  userId: string;
  date: Date;
  forceRegenerate?: boolean;
}

export interface ReadingResult {
  id: string;
  userId: string;
  readingType: string;
  readingDate: Date;
  title: string;
  summary: string;
  content: any;
  highlights: string[];
  workReading: string;
  loveReading: string;
  healthReading: string;
  financeReading: string;
  auspiciousTimings: any[];
  aiModel: string;
  tokensUsed: number;
  generationTimeMs: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function generateDailyReading(options: GenerateReadingOptions): Promise<ReadingResult> {
  const { userId, date, forceRegenerate = false } = options;
  const dateStr = format(date, 'yyyy-MM-dd');
  
  console.log(`[Reading Service] Generating daily reading for ${userId} on ${dateStr}`);
  
  // 1. Check cache (unless force regenerate)
  if (!forceRegenerate) {
    const cached = await getCachedReading(userId, dateStr);
    if (cached) {
      console.log('[Reading Service] ✅ Cache hit');
      return cached;
    }
  }
  
  console.log('[Reading Service] Cache miss, generating new reading...');
  
  // 2. Check quota
  const quota = await checkQuota(userId);
  if (!quota.allowed) {
    throw new Error('AI_QUOTA_EXCEEDED');
  }
  
  console.log('[Reading Service] ✅ Quota check passed:', quota.requestsRemaining, 'remaining');
  
  // 3. Build context (chart + transits + preferences)
  console.log('[Reading Service] Building context...');
  const context = await buildReadingContext(userId, date);
  
  // 4. Build prompt
  const prompt = buildDailyReadingPrompt(context, dateStr);
  const systemPrompt = buildSystemPrompt(context.preferences.tone);
  
  console.log('[Reading Service] ✅ Context and prompts built');
  
  // 5. Call Claude API
  console.log('[Reading Service] Calling Claude API...');
  const startTime = Date.now();
  
  const response = await sendClaudeRequest({
    userId,
    prompt,
    systemPrompt,
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2000,
    context: { type: 'daily_reading', date: dateStr },
  });
  
  const generationTimeMs = Date.now() - startTime;
  
  console.log('[Reading Service] ✅ Claude API response received');
  console.log('[Reading Service] Tokens:', response.tokensTotal, '| Cost: $', response.costTotal.toFixed(4));
  console.log('[Reading Service] Generation time:', generationTimeMs, 'ms');
  
  // 6. Parse response
  console.log('[Reading Service] Parsing AI response...');
  const reading = parseReadingResponse(response.content);
  
  // 7. Validate structure
  if (!validateReading(reading)) {
    console.error('[Reading Service] ❌ Invalid reading structure:', reading);
    throw new Error('Invalid reading structure returned from AI');
  }
  
  console.log('[Reading Service] ✅ Reading parsed and validated');
  
  // 8. Save to database
  console.log('[Reading Service] Saving to database...');
  const saved = await prisma.reading.create({
    data: {
      userId,
      readingType: 'daily',
      readingDate: date,
      title: `Daily Reading for ${format(date, 'MMMM d, yyyy')}`,
      summary: reading.highlights.join('. '),
      content: reading as any, // Full JSON
      highlights: reading.highlights,
      workReading: reading.work,
      loveReading: reading.love,
      healthReading: reading.health,
      financeReading: reading.finance,
      auspiciousTimings: reading.timings,
      aiModel: response.model,
      tokensUsed: response.tokensTotal,
      generationTimeMs,
      status: 'published',
    },
  });
  
  console.log('[Reading Service] ✅ Saved to database:', saved.id);
  
  // 9. Update quota
  await incrementQuota(userId, response.tokensTotal, 1);
  console.log('[Reading Service] ✅ Quota updated');
  
  // 10. Cache for 24 hours
  await setCachedReading(userId, dateStr, saved, 86400);
  console.log('[Reading Service] ✅ Cached for 24 hours');
  
  console.log('[Reading Service] ✅ Complete');
  
  return saved as ReadingResult;
}

function validateReading(reading: any): boolean {
  const required = [
    Array.isArray(reading.highlights) && reading.highlights.length >= 3,
    typeof reading.work === 'string' && reading.work.length > 50,
    typeof reading.love === 'string' && reading.love.length > 50,
    typeof reading.health === 'string' && reading.health.length > 50,
    typeof reading.finance === 'string' && reading.finance.length > 50,
    Array.isArray(reading.timings) && reading.timings.length >= 2,
  ];
  
  const isValid = required.every(Boolean);
  
  if (!isValid) {
    console.error('[Reading Service] Validation failed:', {
      highlights: Array.isArray(reading.highlights) ? reading.highlights.length : 'not array',
      work: typeof reading.work === 'string' ? reading.work.length : 'not string',
      love: typeof reading.love === 'string' ? reading.love.length : 'not string',
      health: typeof reading.health === 'string' ? reading.health.length : 'not string',
      finance: typeof reading.finance === 'string' ? reading.finance.length : 'not string',
      timings: Array.isArray(reading.timings) ? reading.timings.length : 'not array',
    });
  }
  
  return isValid;
}
