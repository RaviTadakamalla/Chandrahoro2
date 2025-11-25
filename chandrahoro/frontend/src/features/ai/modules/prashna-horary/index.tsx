/**
 * Prashna (Horary Astrology) AI Module
 * 
 * AI-powered question-based astrology with instant answers
 */

import React, { useState } from 'react';
import { MessageCircle, Send, Clock, Star, HelpCircle, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AiModuleMeta, AiModuleProps } from '@/lib/ai/types';

// Module metadata
export const meta: AiModuleMeta = {
  id: 'prashna-horary',
  title: 'Prashna (Horary Astrology)',
  description: 'Ask specific questions and get instant astrological answers based on the moment of inquiry using traditional Vedic Prashna techniques.',
  category: 'Prediction',
  requiresChart: false, // Prashna creates its own chart based on question time
  requiresAuth: true,
  featureFlag: 'prashna-horary',
  icon: MessageCircle,
  priority: 10,
};

interface PredefinedQuestion {
  id: string;
  question: string;
  category: string;
  popularity: number;
}

// Main component
export default function PrashnaHoraryModule({ chartData, birthDetails, onClose }: AiModuleProps) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Predefined popular questions
  const predefinedQuestions: PredefinedQuestion[] = [
    { id: '1', question: 'When will I get married?', category: 'Marriage', popularity: 95 },
    { id: '2', question: 'Will I get this job I applied for?', category: 'Career', popularity: 90 },
    { id: '3', question: 'Is this a good time to start a business?', category: 'Business', popularity: 85 },
    { id: '4', question: 'Will I have children?', category: 'Family', popularity: 80 },
    { id: '5', question: 'Should I invest in this property?', category: 'Finance', popularity: 75 },
    { id: '6', question: 'Will my health improve?', category: 'Health', popularity: 70 },
    { id: '7', question: 'Is my partner faithful to me?', category: 'Relationship', popularity: 85 },
    { id: '8', question: 'Will I get promoted this year?', category: 'Career', popularity: 80 },
    { id: '9', question: 'Should I relocate to another city?', category: 'Life Change', popularity: 65 },
    { id: '10', question: 'Will I recover my lost item?', category: 'Lost Objects', popularity: 60 },
    { id: '11', question: 'Is this person suitable for marriage?', category: 'Marriage', popularity: 75 },
    { id: '12', question: 'Will my legal case be successful?', category: 'Legal', popularity: 70 }
  ];

  // Mock preview response to show what the feature will include
  const previewResponse = {
    question: selectedQuestion || customQuestion || "When will I get married?",
    questionTime: new Date().toLocaleString(),
    prashnaChart: {
      lagna: "Gemini",
      lagnaLord: "Mercury",
      questionLord: "Venus",
      moonSign: "Libra",
      moonNakshatra: "Swati"
    },
    analysis: {
      answer: "Yes, with favorable timing",
      confidence: 85,
      timeframe: "Within 18 months",
      reasoning: [
        "Venus (significator of marriage) is well-placed in the 7th house",
        "Jupiter aspects the 7th house, indicating divine blessings",
        "Moon is in a favorable nakshatra for relationships",
        "Current dasha period supports matrimonial alliances"
      ]
    },
    planetaryPositions: [
      { planet: "Sun", sign: "Scorpio", house: 6, strength: "Medium" },
      { planet: "Moon", sign: "Libra", house: 5, strength: "Strong" },
      { planet: "Mars", sign: "Virgo", house: 4, strength: "Weak" },
      { planet: "Mercury", sign: "Scorpio", house: 6, strength: "Strong" },
      { planet: "Jupiter", sign: "Pisces", house: 10, strength: "Very Strong" },
      { planet: "Venus", sign: "Sagittarius", house: 7, strength: "Strong" },
      { planet: "Saturn", sign: "Aquarius", house: 9, strength: "Medium" }
    ],
    recommendations: [
      "Perform Venus-related remedies like wearing white on Fridays",
      "Chant Venus mantras for relationship harmony",
      "Consider matrimonial activities during Venus hora",
      "Avoid making major relationship decisions during Mercury retrograde"
    ]
  };

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    setCustomQuestion('');
    setShowPreview(true);
  };

  const handleCustomQuestionSubmit = () => {
    if (customQuestion.trim()) {
      setSelectedQuestion('');
      setShowPreview(true);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Marriage': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Career': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Family': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Finance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Health': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Relationship': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      'Life Change': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Lost Objects': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'Legal': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'very strong': return 'text-green-600 font-bold';
      case 'strong': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'weak': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="h-8 w-8 text-saffron-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Prashna (Horary Astrology)</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Ask specific questions and get instant astrological answers based on the moment of inquiry using traditional Vedic Prashna techniques
        </p>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="border-saffron-200 bg-saffron-50 dark:bg-saffron-950 dark:border-saffron-800">
        <Sparkles className="h-4 w-4 text-saffron-600" />
        <AlertDescription className="text-saffron-800 dark:text-saffron-200">
          <strong>Coming Soon!</strong> This feature is currently in development. Below is a preview of what you can expect.
        </AlertDescription>
      </Alert>

      {!showPreview ? (
        <>
          {/* Custom Question Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Ask Your Question
              </CardTitle>
              <CardDescription>
                Type your specific question or select from popular questions below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your question here... (e.g., 'Will I get the job I interviewed for last week?')"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleCustomQuestionSubmit}
                  disabled={!customQuestion.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Ask Question (Preview)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Questions</CardTitle>
              <CardDescription>
                Click on any question to see a preview of the Prashna analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predefinedQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleQuestionSelect(q.question)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium flex-1">{q.question}</p>
                      <Badge className={getCategoryColor(q.category)} variant="secondary">
                        {q.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">{q.popularity}% popular</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Question & Answer Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Prashna Analysis Preview
              </CardTitle>
              <CardDescription>
                Question asked at: {previewResponse.questionTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Question:</h4>
                  <p className="text-blue-700 dark:text-blue-300">{previewResponse.question}</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Answer:</h4>
                    <Badge variant="secondary">{previewResponse.analysis.confidence}% Confidence</Badge>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-lg font-medium mb-2">
                    {previewResponse.analysis.answer}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Timeframe: {previewResponse.analysis.timeframe}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prashna Chart Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prashna Chart Details
              </CardTitle>
              <CardDescription>
                Chart cast for the moment of your question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-sm">Lagna</h5>
                  <p className="text-saffron-600 font-bold">{previewResponse.prashnaChart.lagna}</p>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-sm">Lagna Lord</h5>
                  <p className="text-saffron-600 font-bold">{previewResponse.prashnaChart.lagnaLord}</p>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-sm">Question Lord</h5>
                  <p className="text-saffron-600 font-bold">{previewResponse.prashnaChart.questionLord}</p>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-sm">Moon Sign</h5>
                  <p className="text-saffron-600 font-bold">{previewResponse.prashnaChart.moonSign}</p>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h5 className="font-semibold text-sm">Moon Nakshatra</h5>
                  <p className="text-saffron-600 font-bold">{previewResponse.prashnaChart.moonNakshatra}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>Astrological Reasoning</CardTitle>
              <CardDescription>
                Why this answer was given based on planetary positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {previewResponse.analysis.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-saffron-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Planetary Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Planetary Positions at Question Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-2">Planet</th>
                      <th className="text-left p-2">Sign</th>
                      <th className="text-left p-2">House</th>
                      <th className="text-left p-2">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewResponse.planetaryPositions.map((planet, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="p-2 font-medium">{planet.planet}</td>
                        <td className="p-2">{planet.sign}</td>
                        <td className="p-2">{planet.house}</td>
                        <td className={`p-2 ${getStrengthColor(planet.strength)}`}>{planet.strength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations & Remedies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {previewResponse.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Ask Another Question
            </Button>
          </div>
        </>
      )}

      {/* Action Button */}
      {!showPreview && (
        <div className="text-center pt-4">
          <Button disabled className="bg-gray-400 cursor-not-allowed">
            Get Prashna Analysis (Coming Soon)
          </Button>
        </div>
      )}
    </div>
  );
}
