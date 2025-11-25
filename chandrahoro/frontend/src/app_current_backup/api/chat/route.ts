/**
 * ChandraHoro V2.1 - Chat API with SSE Streaming
 * 
 * Main chat endpoint with Server-Sent Events streaming.
 * Integrates chart context, conversation management, and Claude AI.
 * 
 * Features:
 * - Real-time SSE streaming
 * - Chart context injection from MySQL
 * - Conversation history management
 * - Quota enforcement and tracking
 * - Error handling and recovery
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { streamClaudeResponse } from '@/lib/ai/claude-client';
import { buildChatContext, buildChatPrompt, optimizeContextForTokens } from '@/lib/services/chat-context-builder';
import { conversationManager } from '@/lib/services/conversation-manager';
import { checkQuota, incrementQuota } from '@/lib/ai/quota';
import { errorResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
  }
  
  try {
    const { conversationId, message, contextType = 'general' } = await request.json();
    const userId = session.user.id;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return errorResponse('INVALID_MESSAGE', 'Message is required', 400);
    }
    
    if (message.length > 4000) {
      return errorResponse('MESSAGE_TOO_LONG', 'Message too long (max 4000 characters)', 400);
    }
    
    // Check quota before processing
    const quota = await checkQuota(userId);
    if (!quota.allowed) {
      return Response.json(
        { 
          error: 'QUOTA_EXCEEDED',
          message: 'Daily chat quota exceeded. Please try again tomorrow.',
          quota: quota.current,
          limit: quota.limit,
        },
        { status: 429 }
      );
    }
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await conversationManager.get(conversationId, false);
      if (!conversation || conversation.userId !== userId) {
        return errorResponse('CONVERSATION_NOT_FOUND', 'Conversation not found', 404);
      }
    } else {
      conversation = await conversationManager.create(userId, {
        title: message.length > 60 ? message.substring(0, 57) + '...' : message,
        contextType,
      });
    }
    
    // Save user message
    const userMessage = await conversationManager.addMessage(
      conversation.id,
      userId,
      'user',
      message.trim()
    );
    
    // Build context (chart + conversation history)
    const context = await buildChatContext(userId, conversation.id, {
      maxMessages: 10,
      includeHouses: contextType === 'chart_analysis',
    });
    
    // Optimize context for token limits
    const optimizedContext = optimizeContextForTokens(context, 3500);
    
    // Build prompt
    const prompt = buildChatPrompt(message, optimizedContext, {
      includeFullChart: contextType === 'chart_analysis',
      maxTokens: 3500,
    });
    
    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          let tokensUsed = 0;
          const startTime = Date.now();
          
          // Send initial event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'start',
              conversationId: conversation.id,
            })}\n\n`)
          );
          
          // Stream from Claude
          const aiStream = streamClaudeResponse({
            userId,
            prompt,
            systemPrompt: getSystemPrompt(contextType, optimizedContext),
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.7,
            maxTokens: 2000,
            context: { 
              type: 'chat', 
              conversationId: conversation.id,
              contextType,
            },
          });
          
          // Process stream chunks
          for await (const chunk of aiStream) {
            if (typeof chunk === 'string') {
              fullResponse += chunk;
              
              // Send content chunk to client
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'content',
                  content: chunk,
                })}\n\n`)
              );
            } else if (chunk && typeof chunk === 'object') {
              // Handle metadata (tokens, etc.)
              if (chunk.usage) {
                tokensUsed = chunk.usage.total_tokens || tokensUsed;
              }
            }
          }
          
          const responseTime = Date.now() - startTime;
          
          // Estimate tokens if not provided
          if (tokensUsed === 0) {
            tokensUsed = Math.ceil((prompt.length + fullResponse.length) / 4);
          }
          
          // Save assistant message
          await conversationManager.addMessage(
            conversation.id,
            userId,
            'assistant',
            fullResponse,
            {
              aiModel: 'claude-3-5-sonnet-20241022',
              tokensUsed,
              responseTime,
            }
          );
          
          // Update quota
          await incrementQuota(userId, tokensUsed);
          
          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'done',
              conversationId: conversation.id,
              tokensUsed,
              responseTime,
              messageId: userMessage.id,
            })}\n\n`)
          );
          
          controller.close();
        } catch (error: any) {
          console.error('[ChatAPI] Streaming error:', error);
          
          // Send error event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error',
              error: error.message || 'An error occurred while processing your message',
              code: error.code || 'STREAM_ERROR',
            })}\n\n`)
          );
          
          // Save error message
          try {
            await conversationManager.addMessage(
              conversation.id,
              userId,
              'assistant',
              'I apologize, but I encountered an error while processing your message. Please try again.',
              { error: true }
            );
          } catch (saveError) {
            console.error('[ChatAPI] Error saving error message:', saveError);
          }
          
          controller.close();
        }
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[ChatAPI] Error:', error);
    return errorResponse('CHAT_ERROR', error.message, 500);
  }
}

/**
 * Get system prompt based on context type
 */
function getSystemPrompt(contextType: string, context: any): string {
  const basePrompt = `You are an expert Vedic astrology guide and counselor. You provide insightful, compassionate, and practical guidance based on Vedic astrological principles.

IMPORTANT GUIDELINES:
- Use the provided birth chart information to give personalized insights
- Explain astrological concepts in accessible, easy-to-understand language
- Be encouraging, constructive, and empathetic in your responses
- Focus on empowerment and positive guidance
- Avoid: medical diagnoses, legal advice, guaranteed predictions about death or disaster
- If asked about topics outside astrology, gently redirect to the astrological perspective
- Keep responses conversational and engaging (2-3 paragraphs unless detailed analysis is requested)
- Reference specific planetary positions and aspects when relevant
- Consider current Dasha periods and their influence`;

  switch (contextType) {
    case 'chart_analysis':
      return basePrompt + `

CHART ANALYSIS FOCUS:
- Provide detailed analysis of planetary positions and their meanings
- Explain house placements and their significance
- Discuss aspects between planets and their effects
- Consider the current Dasha period and its influence
- Offer practical insights for personal growth and life decisions`;

    case 'transit_reading':
      return basePrompt + `

TRANSIT READING FOCUS:
- Focus on current planetary transits and their effects
- Explain how transits interact with the natal chart
- Provide timing insights for important life events
- Offer guidance on how to work with current energies
- Suggest favorable periods for different activities`;

    case 'compatibility':
      return basePrompt + `

COMPATIBILITY FOCUS:
- Analyze relationship dynamics from an astrological perspective
- Consider planetary compatibility and challenges
- Discuss karmic connections and lessons
- Provide guidance for harmonious relationships
- Suggest ways to work with astrological differences`;

    default:
      return basePrompt + `

GENERAL GUIDANCE:
- Provide balanced insights combining chart analysis with practical wisdom
- Address the user's specific questions with astrological context
- Offer guidance that empowers personal growth and understanding
- Keep the conversation flowing naturally while staying focused on astrology`;
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
