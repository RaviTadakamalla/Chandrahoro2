'use client';

import React, { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat';
import type { Conversation, Message, ChartReference } from '@/types/chat';

/**
 * Chat Test Page
 *
 * Comprehensive test page for the AI Chat Interface with mock data and streaming simulation.
 */

// Mock chart references for testing
const mockChartReferences: ChartReference[] = [
  {
    id: 'ref-1',
    type: 'planet',
    title: 'Mars in Aries',
    description: 'Strong placement in own sign',
    data: {
      sign: 'Aries',
      house: '1st House',
      degree: '15.5',
      strength: 85,
    },
    chartId: 'chart-1',
  },
  {
    id: 'ref-2',
    type: 'house',
    title: '7th House Analysis',
    description: 'Partnership and relationships',
    data: {
      lord: 'Venus',
      sign: 'Libra',
      planets: ['Venus', 'Mercury'],
    },
    chartId: 'chart-1',
  },
  {
    id: 'ref-3',
    type: 'dasha',
    title: 'Jupiter Mahadasha',
    description: 'Current major period',
    data: {
      planet: 'Jupiter',
      startDate: '2023-01-01',
      endDate: '2039-01-01',
      subPeriod: 'Jupiter-Saturn',
    },
    chartId: 'chart-1',
  },
];

// Mock conversations for testing
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user-1',
    title: 'Birth Chart Analysis',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isStarred: true,
    isArchived: false,
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Can you analyze my birth chart? I was born on March 15, 1990 at 2:30 PM in New York.',
        createdAt: new Date(Date.now() - 1000 * 60 * 35),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: `I'd be happy to analyze your birth chart! Based on your birth details:

**Birth Information:**
- Date: March 15, 1990
- Time: 2:30 PM
- Location: New York, NY

**Key Planetary Positions:**

Your **Sun in Pisces** indicates a compassionate and intuitive nature. You're likely very empathetic and have strong creative abilities.

**Mars in Aries** shows strong leadership qualities and initiative. This is an excellent placement for taking action and pursuing your goals.

**Moon placement** would depend on the exact time, but this gives you emotional depth and sensitivity.

Would you like me to dive deeper into any specific aspect of your chart?`,
        chartReferences: [mockChartReferences[0]],
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  },
  {
    id: 'conv-2',
    userId: 'user-1',
    title: 'Relationship Compatibility',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isStarred: false,
    isArchived: false,
    messages: [
      {
        id: 'msg-3',
        conversationId: 'conv-2',
        role: 'user',
        content: 'How compatible am I with someone born on July 22, 1988?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: 'msg-4',
        conversationId: 'conv-2',
        role: 'assistant',
        content: `Let me analyze the compatibility between you (Pisces Sun) and your partner (Cancer Sun).

**Sun Sign Compatibility: Excellent ⭐⭐⭐⭐⭐**

Pisces and Cancer are both water signs, creating a natural emotional connection:

- **Emotional Understanding**: Both signs are highly intuitive and empathetic
- **Communication**: You understand each other's emotional needs without words
- **Values**: Shared appreciation for home, family, and emotional security

**Key Strengths:**
- Deep emotional bond
- Mutual support and understanding
- Creative collaboration potential

**Areas to Watch:**
- Both can be overly sensitive at times
- Need to maintain some independence

Overall, this is a very harmonious pairing with strong potential for a lasting relationship.`,
        chartReferences: [mockChartReferences[1]],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  },
  {
    id: 'conv-3',
    userId: 'user-1',
    title: 'Career Guidance',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isStarred: false,
    isArchived: true,
    messages: [
      {
        id: 'msg-5',
        conversationId: 'conv-3',
        role: 'user',
        content: 'What career path would be best for me based on my chart?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
      {
        id: 'msg-6',
        conversationId: 'conv-3',
        role: 'assistant',
        content: `Based on your chart analysis, here are some career paths that align well with your planetary positions:

**Creative Fields** (Strong Pisces influence):
- Arts, music, writing, photography
- Film, theater, entertainment industry
- Graphic design, web design

**Helping Professions** (Compassionate nature):
- Psychology, counseling, therapy
- Healthcare, nursing, alternative medicine
- Social work, non-profit sector

**Leadership Roles** (Mars in Aries):
- Entrepreneurship, business leadership
- Project management
- Sports, fitness industry

Your current **Jupiter Dasha** period (until 2039) is excellent for education, teaching, and expanding your knowledge base.

Would you like me to analyze specific timing for career changes?`,
        chartReferences: [mockChartReferences[2]],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
];

export default function ChatTestPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [quotaUsed, setQuotaUsed] = useState(45);
  const [quotaLimit] = useState(100);

  // Simulate streaming response
  const simulateStreamingResponse = async (content: string): Promise<string> => {
    const responses = [
      `Thank you for your question about "${content.substring(0, 30)}...". Let me analyze this for you.

**Astrological Analysis:**

Based on the planetary positions and aspects in your chart, I can see several important patterns:

1. **Current Planetary Transits**: The recent movements suggest a period of transformation and growth.

2. **Dasha Periods**: Your current planetary period indicates favorable timing for the areas you're asking about.

3. **Strength Analysis**: The planetary strengths in your chart show both opportunities and challenges.

Would you like me to elaborate on any specific aspect of this analysis?`,

      `I understand you're looking for guidance on this matter. Let me provide some insights:

**Key Observations:**
- Your chart shows strong intuitive abilities
- There's emphasis on communication and relationships
- Career and financial sectors are highlighted

**Recommendations:**
- Focus on your natural strengths during this period
- Pay attention to opportunities in the coming weeks
- Trust your intuition when making decisions

**Timing Considerations:**
The current planetary alignments suggest this is a favorable time for new beginnings.

Is there a specific area you'd like me to focus on?`,

      `This is an interesting question that touches on several astrological factors:

**Planetary Influences:**
Your birth chart reveals unique patterns that influence this situation.

**Current Transits:**
The ongoing planetary movements are creating both opportunities and challenges.

**Practical Guidance:**
1. Consider the timing carefully
2. Trust your instincts
3. Seek balance in your approach

**Long-term Perspective:**
The astrological indicators suggest positive developments over the next few months.

Would you like me to provide more specific timing or additional details?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Mock API functions
  const handleSendMessage = async (conversationId: string, content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages: [...conv.messages, userMessage], lastMessageAt: new Date() }
        : conv
    ));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add AI response
    const aiResponse = await simulateStreamingResponse(content);
    const aiMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      conversationId,
      role: 'assistant',
      content: aiResponse,
      chartReferences: Math.random() > 0.5 ? [mockChartReferences[Math.floor(Math.random() * mockChartReferences.length)]] : undefined,
      createdAt: new Date(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages: [...conv.messages, aiMessage], lastMessageAt: new Date() }
        : conv
    ));

    // Update quota
    setQuotaUsed(prev => prev + 1);
  };

  const handleCreateConversation = async (title?: string): Promise<string> => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      userId: 'user-1',
      title: title || 'New Conversation',
      lastMessageAt: new Date(),
      isStarred: false,
      isArchived: false,
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleConversationDelete = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const handleConversationRename = (conversationId: string, newTitle: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, title: newTitle } : conv
    ));
  };

  const handleConversationArchive = (conversationId: string, archived: boolean) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: archived } : conv
    ));
  };

  const handleChartReferenceClick = (reference: ChartReference) => {
    console.log('Chart reference clicked:', reference);
    // In a real app, this would navigate to the chart view
    alert(`Opening chart: ${reference.title}`);
  };

  return (
    <div className="h-screen bg-background">
      <div className="container mx-auto h-full max-w-7xl">
        <div className="flex flex-col h-full">
          {/* Page Header */}
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">AI Chat Interface Test</h1>
            <p className="text-muted-foreground">
              Testing the complete chat system with streaming, markdown, and chart references
            </p>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            <ChatInterface
              conversations={conversations}
              activeConversationId={activeConversationId}
              quotaUsed={quotaUsed}
              quotaLimit={quotaLimit}
              onSendMessage={handleSendMessage}
              onConversationCreate={handleCreateConversation}
              onConversationSelect={handleConversationSelect}
              onConversationDelete={handleConversationDelete}
              onConversationRename={handleConversationRename}
              onConversationArchive={handleConversationArchive}
              onChartReferenceClick={handleChartReferenceClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
