/**
 * ChandraHoro V2.1 - Compatibility Report Component
 * 
 * React component for displaying comprehensive compatibility analysis results.
 * Shows compatibility score, Kuta breakdown, AI narrative, and actionable insights.
 * 
 * Features:
 * - Visual compatibility score display
 * - Detailed Kuta analysis breakdown
 * - AI-generated narrative report
 * - Strengths and challenges sections
 * - Responsive design with beautiful UI
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  Share2, 
  Download,
  Calendar,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

interface CompatibilityReportProps {
  report: {
    id: string;
    person1Name: string;
    person2Name: string;
    compatibilityScore: number;
    kutaScores: Record<string, { points: number; description: string }>;
    strengths: string[];
    challenges: string[];
    narrative: string;
    aiModel: string;
    tokensUsed: number;
    createdAt: Date;
  };
}

export function CompatibilityReport({ report }: CompatibilityReportProps) {
  const {
    person1Name,
    person2Name,
    compatibilityScore,
    kutaScores,
    strengths,
    challenges,
    narrative,
    createdAt,
  } = report;
  
  const getCompatibilityLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 8) return { 
      level: 'Excellent', 
      color: 'text-green-600 dark:text-green-400', 
      description: 'Outstanding compatibility with strong harmony' 
    };
    if (score >= 6.5) return { 
      level: 'Very Good', 
      color: 'text-blue-600 dark:text-blue-400', 
      description: 'Very compatible with great potential' 
    };
    if (score >= 5) return { 
      level: 'Good', 
      color: 'text-yellow-600 dark:text-yellow-400', 
      description: 'Good compatibility with some adjustments' 
    };
    if (score >= 3.5) return { 
      level: 'Fair', 
      color: 'text-orange-600 dark:text-orange-400', 
      description: 'Moderate compatibility requiring understanding' 
    };
    return { 
      level: 'Challenging', 
      color: 'text-red-600 dark:text-red-400', 
      description: 'Requires significant effort and understanding' 
    };
  };
  
  const compatibility = getCompatibilityLevel(compatibilityScore);
  
  const getKutaMaxPoints = (kuta: string): number => {
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
  };
  
  const totalKutaPoints = Object.values(kutaScores).reduce((sum, kuta) => sum + kuta.points, 0);
  const maxKutaPoints = 36;
  
  const formatNarrative = (text: string) => {
    // Split narrative into paragraphs and format
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <Users className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compatibility Analysis
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {person1Name} & {person2Name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Generated on {format(new Date(createdAt), 'MMMM d, yyyy')}
        </p>
      </div>
      
      {/* Compatibility Score */}
      <Card className="text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="text-6xl font-bold mb-2" style={{ color: compatibility.color.split(' ')[0] }}>
              {compatibilityScore.toFixed(1)}/10
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {compatibility.level}
            </Badge>
          </div>
          
          <Progress 
            value={compatibilityScore * 10} 
            className="h-4 mb-4"
          />
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {compatibility.description}
          </p>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            {formatNarrative(narrative)}
          </div>
        </CardContent>
      </Card>
      
      {/* Kuta Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Kuta Analysis ({totalKutaPoints}/{maxKutaPoints} points)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(kutaScores).map(([kuta, data]) => {
              const maxPoints = getKutaMaxPoints(kuta);
              const percentage = (data.points / maxPoints) * 100;
              
              return (
                <div key={kuta} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {kuta.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold">
                      {data.points}/{maxPoints}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <TrendingUp className="h-5 w-5" />
              Relationship Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Strengths analysis in progress...
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Challenges */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Growth Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {challenges.length > 0 ? (
              <ul className="space-y-3">
                {challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {challenge}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Challenges analysis in progress...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            This compatibility analysis is based on traditional Vedic astrology principles
            and is intended for guidance and self-reflection.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Report ID: {report.id} • Generated using AI • {report.tokensUsed} tokens used
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact version for dashboard/list view
export function CompatibilityReportCard({ 
  report, 
  onClick 
}: { 
  report: CompatibilityReportProps['report']; 
  onClick?: () => void;
}) {
  const compatibility = report.compatibilityScore >= 7 ? 'High' : 
                       report.compatibilityScore >= 5 ? 'Medium' : 'Low';
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">
              {report.person1Name} & {report.person2Name}
            </h3>
            <p className="text-sm text-gray-500">
              {format(new Date(report.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {report.compatibilityScore.toFixed(1)}
            </div>
            <Badge variant="secondary" className="text-xs">
              {compatibility}
            </Badge>
          </div>
        </div>
        
        <Progress value={report.compatibilityScore * 10} className="h-2" />
      </CardContent>
    </Card>
  );
}
