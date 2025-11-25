/**
 * ChandraHoro V2 - React Component Examples
 * Built with React 18, TypeScript, and Tailwind CSS
 *
 * Database: MySQL 8.0+ with Prisma ORM
 * Authentication: NextAuth.js
 *
 * Example Prisma queries for data fetching:
 *
 * // Fetch daily reading for user
 * const reading = await prisma.reading.findFirst({
 *   where: { userId: session.user.id, readingDate: today },
 *   include: { segments: true, timings: true }
 * });
 *
 * // Fetch user's birth chart
 * const chart = await prisma.birthChart.findUnique({
 *   where: { id: chartId },
 *   include: { planets: true, houses: true }
 * });
 */

import React, { useState } from 'react';
import { 
  Sun, Moon, MessageCircle, Share2, Save, 
  ChevronRight, Calendar, Clock, TrendingUp 
} from 'lucide-react';
import { 
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

// ═══════════════════════════════════════════════════════════
// 1. DAILY READING CARD
// ═══════════════════════════════════════════════════════════

interface DailyReadingProps {
  date: string;
  highlights: string[];
  segments: Array<{
    topic: string;
    summary: string;
    icon: React.ReactNode;
  }>;
  timings: Array<{
    window: string;
    note: string;
  }>;
}

export const DailyReadingCard: React.FC<DailyReadingProps> = ({
  date,
  highlights,
  segments,
  timings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Today's Reading
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Save className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Key Highlights
        </h3>
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 mb-4"
      >
        {isExpanded ? 'Show Less' : 'Expand Full Reading'}
        <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 animate-slideDown">
          {/* Segment Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {segments.map((segment, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="mr-2">{segment.icon}</span>
                {segment.topic}
              </button>
            ))}
          </div>

          {/* Active Segment Content */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {segments[activeTab].summary}
            </p>
          </div>

          {/* Timings */}
          <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Best Timings
            </h4>
            {timings.map((timing, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {timing.window}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {timing.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-slate-600 pt-4 mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Powered by Claude Sonnet • 1,523 tokens
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 2. NATAL CHART COMPONENT (SVG)
// ═══════════════════════════════════════════════════════════

interface Planet {
  name: string;
  symbol: string;
  degree: number;
  house: number;
  sign: string;
  isRetrograde?: boolean;
}

interface NatalChartProps {
  planets: Planet[];
  style: 'north' | 'south';
}

export const NatalChart: React.FC<NatalChartProps> = ({ planets, style }) => {
  const size = 400;
  const center = size / 2;
  const radius = size / 2 - 40;

  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', color: '#E74C3C' },
    { name: 'Taurus', symbol: '♉', color: '#27AE60' },
    { name: 'Gemini', symbol: '♊', color: '#F39C12' },
    { name: 'Cancer', symbol: '♋', color: '#3498DB' },
    { name: 'Leo', symbol: '♌', color: '#E67E22' },
    { name: 'Virgo', symbol: '♍', color: '#16A085' },
    { name: 'Libra', symbol: '♎', color: '#9B59B6' },
    { name: 'Scorpio', symbol: '♏', color: '#C0392B' },
    { name: 'Sagittarius', symbol: '♐', color: '#8E44AD' },
    { name: 'Capricorn', symbol: '♑', color: '#2C3E50' },
    { name: 'Aquarius', symbol: '♒', color: '#1ABC9C' },
    { name: 'Pisces', symbol: '♓', color: '#3498DB' },
  ];

  // Calculate planet positions
  const getPlanetPosition = (planet: Planet) => {
    const angle = (planet.house - 1) * 30 + (planet.degree % 30);
    const radian = (angle - 90) * (Math.PI / 180);
    const x = center + radius * 0.7 * Math.cos(radian);
    const y = center + radius * 0.7 * Math.sin(radian);
    return { x, y };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Natal Chart
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            North Indian
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
            South Indian
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
        {/* Background gradient */}
        <defs>
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="url(#chartBg)" />

        {/* Outer circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-slate-600"
        />

        {/* House divisions */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30 - 90;
          const radian = angle * (Math.PI / 180);
          const x1 = center + radius * 0.85 * Math.cos(radian);
          const y1 = center + radius * 0.85 * Math.sin(radian);
          const x2 = center + radius * Math.cos(radian);
          const y2 = center + radius * Math.sin(radian);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-slate-700"
            />
          );
        })}

        {/* Zodiac signs */}
        {zodiacSigns.map((sign, i) => {
          const angle = i * 30 + 15 - 90;
          const radian = angle * (Math.PI / 180);
          const x = center + radius * 0.92 * Math.cos(radian);
          const y = center + radius * 0.92 * Math.sin(radian);

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold"
              fill={sign.color}
            >
              {sign.symbol}
            </text>
          );
        })}

        {/* Planets */}
        {planets.map((planet, i) => {
          const pos = getPlanetPosition(planet);
          return (
            <g key={i}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="16"
                fill="white"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-500 drop-shadow-md"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg"
              >
                {planet.symbol}
              </text>
              {planet.isRetrograde && (
                <text
                  x={pos.x + 12}
                  y={pos.y - 12}
                  className="text-xs fill-red-500 font-bold"
                >
                  R
                </text>
              )}
            </g>
          );
        })}

        {/* Center point */}
        <circle cx={center} cy={center} r="4" fill="currentColor" className="text-orange-500" />
      </svg>

      {/* Planet Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {planets.slice(0, 6).map((planet, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-lg">{planet.symbol}</span>
            <span className="text-gray-700 dark:text-gray-300">
              {planet.name} {planet.degree}°
              {planet.isRetrograde && <span className="text-red-500 ml-1">(R)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 3. STRENGTH METER COMPONENT
// ═══════════════════════════════════════════════════════════

interface StrengthData {
  planet: string;
  strength: number;
  symbol: string;
}

export const StrengthMeter: React.FC<{ data: StrengthData[] }> = ({ data }) => {
  const getStrengthColor = (strength: number) => {
    if (strength >= 67) return 'from-green-400 to-green-600';
    if (strength >= 34) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 67) return 'Strong';
    if (strength >= 34) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Planetary Strength (Shadbala)
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.symbol}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.planet}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.strength}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getStrengthLabel(item.strength)}
                </span>
              </div>
            </div>
            <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getStrengthColor(
                  item.strength
                )} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${item.strength}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 4. DASHA TIMELINE
// ═══════════════════════════════════════════════════════════

interface DashaPeriod {
  planet: string;
  symbol: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
}

export const DashaTimeline: React.FC<{ periods: DashaPeriod[] }> = ({ periods }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Vimshottari Dasha Timeline
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700" />

        {/* Periods */}
        <div className="flex justify-between relative">
          {periods.map((period, index) => (
            <div key={index} className="flex flex-col items-center relative group">
              {/* Planet icon */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                  period.isCurrent
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg scale-110 animate-pulse'
                    : 'bg-gray-200 dark:bg-slate-700 group-hover:scale-105'
                }`}
              >
                {period.symbol}
              </div>

              {/* Connecting dot */}
              <div
                className={`w-3 h-3 rounded-full mb-2 ${
                  period.isCurrent
                    ? 'bg-orange-500 animate-ping'
                    : 'bg-gray-400 dark:bg-slate-600'
                }`}
              />

              {/* Period info */}
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {period.planet}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {period.startYear}-{period.endYear}
                </div>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
                {period.isCurrent ? 'Current Period' : `${period.planet} Dasha`}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </div>
          ))}
        </div>

        {/* Current sub-period card */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-1">
            Current Sub-Period
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            Saturn - Saturn - Rahu
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Oct 2024 - Jan 2025
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 5. COMPATIBILITY GAUGE
// ═══════════════════════════════════════════════════════════

export const CompatibilityGauge: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'from-green-400 to-green-600';
    if (score >= 7) return 'from-yellow-400 to-yellow-600';
    if (score >= 5) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent Match';
    if (score >= 7) return 'Good Match';
    if (score >= 5) return 'Fair Match';
    return 'Challenging Match';
  };

  const percentage = (score / 10) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Compatibility Score
      </h3>

      <div className="relative w-64 h-32 mx-auto">
        {/* Arc background */}
        <svg viewBox="0 0 200 100" className="w-full">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-gray-200 dark:text-slate-700"
          />

          {/* Score arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-gray-700 dark:text-white"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '100px 80px',
              transition: 'transform 1s ease-out',
            }}
          />

          {/* Center dot */}
          <circle cx="100" cy="80" r="8" fill="currentColor" className="text-orange-500" />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{score.toFixed(1)}</div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < Math.round(score / 2) ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreColor(score)} text-white font-semibold`}>
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 6. AI CHAT INTERFACE
// ═══════════════════════════════════════════════════════════

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ type: string; data: any }>;
}

export const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Astro-Guide. Ask me anything about your chart, planets, or life areas.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on your chart, Saturn in your 10th house suggests a career path marked by discipline and steady progress...',
        timestamp: new Date(),
        sources: [
          { type: 'chart_data', data: { planet: 'Saturn', house: 10, strength: 78 } },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Astro-Guide</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.sources && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="text-xs opacity-80">
                    📊 Based on: Saturn in 10th house (78% strength)
                  </div>
                </div>
              )}
              <div className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 7. ASPECT RADAR CHART
// ═══════════════════════════════════════════════════════════

export const AspectRadarChart: React.FC = () => {
  const data = [
    { aspect: 'Work', score: 85, fullMark: 100 },
    { aspect: 'Love', score: 90, fullMark: 100 },
    { aspect: 'Health', score: 72, fullMark: 100 },
    { aspect: 'Finance', score: 65, fullMark: 100 },
    { aspect: 'Family', score: 88, fullMark: 100 },
    { aspect: 'Spiritual', score: 78, fullMark: 100 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Life Aspects Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="currentColor" className="text-gray-300 dark:text-slate-600" />
          <PolarAngleAxis dataKey="aspect" stroke="currentColor" className="text-gray-600 dark:text-gray-300" />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#F7931E"
            fill="#F7931E"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TAILWIND CONFIG
// ═══════════════════════════════════════════════════════════

/*
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B35',
        gold: '#F7931E',
        marigold: '#FDB827',
        celestial: {
          deep: '#1E3A5F',
          medium: '#2E5C8A',
          light: '#4A7BA7',
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        slideDown: 'slideDown 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
*/

// ═══════════════════════════════════════════════════════════
// PRISMA ORM DATA FETCHING PATTERNS
// ═══════════════════════════════════════════════════════════

/*
// Example: Fetch data for DailyReadingCard component
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getDailyReading(date: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const reading = await prisma.reading.findFirst({
    where: {
      userId: session.user.id,
      readingDate: new Date(date),
      readingType: 'daily'
    },
    include: {
      segments: true,
      timings: true
    }
  });

  return reading;
}

// Example: Fetch data for NatalChart component
export async function getNatalChart(chartId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const chart = await prisma.birthChart.findUnique({
    where: { id: chartId },
    include: {
      planets: true,
      houses: true,
      aspects: true
    }
  });

  // Verify ownership
  if (chart?.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  return chart;
}

// Example: Fetch data for StrengthMeter component
export async function getPlanetaryStrengths(chartId: string) {
  const chart = await getNatalChart(chartId);
  if (!chart) return [];

  const strengths = await prisma.planetaryStrength.findMany({
    where: { birthChartId: chartId },
    select: {
      planet: true,
      strength: true,
      symbol: true
    }
  });

  return strengths;
}

// Example: Fetch data for DashaTimeline component
export async function getDashaPeriods(profileId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      dashaPeriods: {
        orderBy: { startYear: 'asc' }
      }
    }
  });

  // Verify ownership
  if (profile?.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  return profile?.dashaPeriods || [];
}

// Example: Create a new reading
export async function createReading(data: {
  readingType: string;
  content: any;
  profileId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const reading = await prisma.reading.create({
    data: {
      userId: session.user.id,
      profileId: data.profileId,
      readingType: data.readingType,
      readingDate: new Date(),
      content: data.content
    }
  });

  return reading;
}

// Example: Update user profile
export async function updateProfile(profileId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  // Verify ownership
  const profile = await prisma.profile.findUnique({
    where: { id: profileId }
  });

  if (profile?.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.profile.update({
    where: { id: profileId },
    data: {
      birthTime: data.birthTime,
      birthLocation: data.birthLocation,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined
    }
  });

  return updated;
}
*/