'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DailyReadingCard,
  DailyReadingCardSkeleton,
  DailyReadingCardError,
  DailyReadingCardEmpty,
  ReadingHighlights,
  ReadingTabs
} from '@/components/reading';
import type { Reading } from '@/types/reading';

/**
 * Test page for Daily Reading Card components
 * 
 * This page demonstrates all the reading components with mock data
 * to verify functionality, styling, and responsive behavior.
 */
export default function ReadingCardTestPage() {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  // Mock reading data
  const mockReading: Reading = {
    id: 'test-reading-1',
    userId: 'test-user',
    chartId: 'test-chart',
    readingType: 'daily',
    readingDate: new Date().toISOString(),
    title: 'Your Daily Cosmic Guidance',
    summary: 'Today brings a harmonious blend of opportunities and challenges. The planetary alignments suggest a day of growth, particularly in your professional and personal relationships.',
    content: {
      summary: 'A day of balance and opportunity awaits you.',
      overview: 'The cosmic energies today are particularly favorable for new beginnings and strengthening existing bonds.',
      keyThemes: ['Growth', 'Harmony', 'Opportunity', 'Balance'],
      work: {
        score: 8,
        title: 'Professional Excellence',
        description: 'Your career sector is illuminated with positive energy today. Expect recognition for your recent efforts.',
        advice: 'Take initiative on that project you\'ve been considering. The stars are aligned for professional advancement.',
        keyPoints: [
          'Excellent time for presentations and meetings',
          'Networking opportunities may arise unexpectedly',
          'Creative solutions will be well-received by colleagues'
        ],
        color: 'green'
      },
      love: {
        score: 6,
        title: 'Relationship Harmony',
        description: 'Venus brings gentle energy to your relationships today. Communication flows more easily.',
        advice: 'Express your feelings openly. Your loved ones are receptive to deeper conversations.',
        keyPoints: [
          'Good day for romantic gestures',
          'Family relationships may need attention',
          'Single? Someone interesting may enter your life'
        ],
        color: 'yellow'
      },
      health: {
        score: 7,
        title: 'Vitality and Wellness',
        description: 'Your energy levels are stable today. Focus on maintaining balance in all areas.',
        advice: 'Incorporate some gentle exercise and mindful breathing into your routine.',
        keyPoints: [
          'Morning meditation will set a positive tone',
          'Avoid overindulgence in rich foods',
          'Your intuition about health matters is particularly sharp'
        ],
        color: 'green'
      },
      finance: {
        score: 5,
        title: 'Financial Stability',
        description: 'Money matters require careful attention today. Avoid impulsive purchases.',
        advice: 'Review your budget and consider long-term financial goals. Small investments may prove beneficial.',
        keyPoints: [
          'Good day for financial planning',
          'Unexpected expenses may arise',
          'Seek advice before making major purchases'
        ],
        color: 'yellow'
      },
      spiritualGuidance: 'Trust in the natural flow of events today. Your intuition is heightened.',
      recommendations: [
        'Start your day with gratitude meditation',
        'Wear colors that make you feel confident',
        'Connect with nature during lunch break',
        'Journal your thoughts before bed'
      ],
      warnings: [
        'Avoid making important decisions when feeling rushed',
        'Be cautious with financial commitments'
      ],
      planetaryInfluences: [
        {
          planet: 'Venus',
          influence: 'positive',
          description: 'Enhances relationships and creativity',
          strength: 8
        },
        {
          planet: 'Mars',
          influence: 'neutral',
          description: 'Provides steady energy for work',
          strength: 6
        }
      ],
      currentTransits: [
        {
          planet: 'Moon',
          fromSign: 'Gemini',
          toSign: 'Cancer',
          date: new Date().toISOString(),
          impact: 'Emotional sensitivity increases'
        }
      ],
      dashaInfo: {
        currentMahadasha: 'Venus',
        currentAntardasha: 'Mercury',
        remainingPeriod: '2 years 3 months',
        influence: 'Favorable for creative and communication endeavors'
      }
    },
    highlights: [
      'Excellent day for professional advancement and recognition',
      'Venus brings harmony to your relationships and creative projects',
      'Financial planning and budgeting will serve you well today',
      'Your intuition is particularly sharp - trust your instincts',
      'Morning meditation will set a positive tone for the entire day'
    ],
    workReading: 'Professional excellence awaits...',
    loveReading: 'Relationship harmony flows...',
    healthReading: 'Vitality and wellness...',
    financeReading: 'Financial stability requires...',
    auspiciousTimings: [
      {
        window: '6:00 AM - 8:00 AM',
        activity: 'Meditation and planning',
        description: 'Perfect time for setting daily intentions',
        intensity: 'high'
      },
      {
        window: '11:00 AM - 1:00 PM',
        activity: 'Business meetings',
        description: 'Professional communications are favored',
        intensity: 'medium'
      },
      {
        window: '7:00 PM - 9:00 PM',
        activity: 'Creative pursuits',
        description: 'Artistic and creative energy peaks',
        intensity: 'high'
      }
    ],
    inauspiciousTimings: [
      {
        window: '3:00 PM - 4:00 PM',
        activity: 'Important decisions',
        description: 'Mental clarity may be clouded',
        severity: 'medium'
      }
    ],
    aiModel: 'claude-3-sonnet',
    tokensUsed: 2847,
    cost: 0.0142,
    isSaved: false,
    isRead: false,
    rating: undefined,
    userFeedback: undefined,
    generatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleSave = (reading: Reading) => {
    console.log('Save reading:', reading.id);
  };

  const handleShare = (reading: Reading) => {
    console.log('Share reading:', reading.id);
  };

  const handleMarkAsRead = (reading: Reading) => {
    console.log('Mark as read:', reading.id);
  };

  const handleGenerate = () => {
    console.log('Generate new reading');
    setShowEmpty(false);
  };

  const handleRetry = () => {
    console.log('Retry loading reading');
    setShowError(false);
  };

  if (showSkeleton) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Daily Reading Card - Loading State</h1>
          <Button onClick={() => setShowSkeleton(false)} variant="outline" size="sm">
            Show Actual Card
          </Button>
        </div>
        <DailyReadingCardSkeleton />
        <div className="mt-4">
          <DailyReadingCardSkeleton expanded />
        </div>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Daily Reading Card - Error State</h1>
          <Button onClick={() => setShowError(false)} variant="outline" size="sm">
            Show Actual Card
          </Button>
        </div>
        <DailyReadingCardError 
          error="Failed to load your daily reading. Please check your connection and try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Daily Reading Card - Empty State</h1>
          <Button onClick={() => setShowEmpty(false)} variant="outline" size="sm">
            Show Actual Card
          </Button>
        </div>
        <DailyReadingCardEmpty onGenerate={handleGenerate} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Daily Reading Card Components Test</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowSkeleton(true)} variant="outline" size="sm">
            Show Skeleton
          </Button>
          <Button onClick={() => setShowError(true)} variant="outline" size="sm">
            Show Error
          </Button>
          <Button onClick={() => setShowEmpty(true)} variant="outline" size="sm">
            Show Empty
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Daily Reading Card */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Daily Reading Card</h2>
          <DailyReadingCard
            reading={mockReading}
            onSave={handleSave}
            onShare={handleShare}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>

        {/* Individual Components */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Reading Highlights Component</h2>
          <div className="p-6 border rounded-lg">
            <ReadingHighlights highlights={mockReading.highlights} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Reading Tabs Component</h2>
          <div className="p-6 border rounded-lg">
            <ReadingTabs content={mockReading.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
