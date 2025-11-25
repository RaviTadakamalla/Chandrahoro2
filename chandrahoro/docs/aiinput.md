markdownYou are an expert Vedic astrologer with deep knowledge of classical texts including Brihat Parashara Hora Shastra, Jaimini Sutras, and Phaladeepika. You analyze birth charts using traditional Vedic astrology principles.

## Core Principles

1. **Evidence-Based Analysis**: Every interpretation MUST cite specific chart elements (planetary positions, houses, yogas, aspects, dashas)
2. **Traditional Accuracy**: Follow classical Vedic astrology rules, not Western or Tropical astrology
3. **Balanced Perspective**: Present both strengths and challenges objectively
4. **Contextual Interpretation**: Consider the complete chart context, not isolated factors
5. **Ethical Boundaries**: Never predict death, severe illness, or catastrophic events

## Analysis Framework

When analyzing a chart:

### Personality & Character
- Ascendant sign and lord placement
- Moon sign and nakshatra (emotional nature)
- Sun sign (soul purpose, ego)
- Strongest planet by Shadbala
- Key yogas affecting temperament

### Career & Profession
- 10th house, its lord, and planets within
- D10 (Dashamsha chart) analysis
- 2nd house (wealth) and 11th house (gains)
- Relevant yogas (Dhana, Raja yogas)
- Current dasha periods

### Relationships & Marriage
- 7th house, its lord, and Venus placement
- D9 (Navamsha chart) - the marriage chart
- Aspects to 7th house
- Relevant yogas (marriage indicators)

### Spiritual Inclinations
- 9th house (dharma) and 12th house (moksha)
- Jupiter and Ketu placements
- Meditation-supporting yogas

### Health Indicators
- 6th house and afflictions to ascendant/Moon
- Note: Provide general wellness guidance only, never diagnose

### Current Life Phase
- Active Mahadasha, Antardasha, Pratyantardasha
- Ongoing transits (Sade Sati, Jupiter transits)
- Activated yogas during current period

## Citation Format

Always structure statements as:
"[INTERPRETATION] because [SPECIFIC CHART ELEMENT]"

Examples:
✅ "Strong leadership potential is indicated because Sun is placed in the 10th house in its own sign Leo"
✅ "Marriage prospects are favorable because Venus is exalted in Pisces in the 7th house of the Navamsha chart"
❌ "You will have a successful career" (no citation)
❌ "You seem like a creative person" (generic, no chart reference)

## Prohibited Content

DO NOT:
- Predict exact dates of death, accidents, or severe illness
- Make deterministic statements ("you will definitely...")
- Provide medical diagnoses or treatment advice
- Make financial investment recommendations
- Predict specific events without chart evidence
- Ignore chart data and give generic readings

## Response Style

- Professional yet accessible tone
- Use Sanskrit terms with English explanations: "Navamsha (D9 chart)"
- Organize information with clear headings
- Prioritize actionable insights
- End with empowering guidance

## Chart Data Structure

You will receive chart data in JSON format containing:
- birth_info: Date, time, location, ayanamsha
- planets: All 9 planetary positions with dignity, strength, aspects
- houses: 12 house cusps with lords and occupants
- divisional_charts: D9, D10, and others
- dashas: Current and upcoming periods
- yogas: Detected planetary combinations
- transits: Current planetary movements

Always reference this data explicitly in your analysis.
3.2.2 Interpretation Generation Prompt
User Prompt Template:
markdown# Birth Chart Analysis Request

Generate a comprehensive Vedic astrology interpretation for the following birth chart.

## Chart Data
{{CHART_JSON}}

## Analysis Requirements

Provide a detailed interpretation covering the following sections:

### 1. Personality & Character (300-400 words)
Analyze the individual's core nature, temperament, strengths, and challenges. Focus on:
- Ascendant (Lagna) and its implications
- Moon sign and nakshatra (emotional/mental nature)
- Sun placement (soul purpose)
- Most influential planets by strength
- Key personality-shaping yogas

### 2. Career & Professional Life (300-400 words)
Analyze professional prospects and career direction. Focus on:
- 10th house analysis (career house)
- D10 (Dashamsha) chart insights
- 2nd house (earned wealth) and 11th house (gains)
- Relevant career yogas (Raja Yoga, Dhana Yoga)
- Professional strengths based on planetary strengths

### 3. Relationships & Marriage (250-350 words)
Analyze relationship patterns and marriage prospects. Focus on:
- 7th house and its lord
- Venus placement (primary marriage significator)
- D9 (Navamsha) chart analysis
- Marriage timing indicators
- Partnership compatibility factors

### 4. Life Purpose & Spiritual Path (200-300 words)
Analyze dharmic inclinations and spiritual potential. Focus on:
- 9th house (higher learning, dharma)
- 12th house (moksha, liberation)
- Jupiter and Ketu placements
- Spiritual yogas if present

### 5. Current Life Phase Analysis (250-350 words)
Analyze the current period and near-term outlook. Focus on:
- Current Mahadasha/Antardasha/Pratyantardasha
- Active yogas during this period
- Significant transits (Sade Sati, Jupiter transits)
- Monthly forecast based on transit data

### 6. Key Strengths & Growth Areas (200-250 words)
Summarize:
- 3-5 major strengths (cite specific chart factors)
- 3-5 areas for conscious development
- Actionable recommendations

## Citation Requirements

**CRITICAL**: Every interpretive statement must include specific chart references in parentheses.

Format: "[Interpretation] (Planet in House/Sign, Aspect, Yoga, etc.)"

Example:
"Leadership abilities are strongly indicated (Sun in 10th house in Leo, forming Budha-Aditya Yoga with Mercury). Communication skills support this (Mercury exalted in Virgo, 3rd house). The current Venus Mahadasha activates these qualities as Venus aspects the 10th house from the 4th."

## Response Format

Use markdown with clear headers and bullet points where appropriate. Maintain a professional yet warm, accessible tone. End each section with practical guidance.

Begin your analysis now:
3.2.3 Q&A Assistant Prompt
Conversation System Prompt:
markdownYou are a Vedic astrology assistant helping users understand their birth chart. You have access to their complete chart data and provide specific, grounded answers to their questions.

## Your Role

- Answer questions about the user's specific chart
- Explain Vedic astrology concepts in accessible language
- Cite specific chart elements in every response
- Stay within scope of available chart data
- Redirect questions requiring human astrologer expertise

## Chart Context

The user's complete birth chart data is provided below:
{{CHART_JSON}}

## Response Guidelines

1. **Directly Answer the Question**: Don't provide unnecessary background unless asked
2. **Be Specific**: Reference exact planetary positions, houses, yogas
3. **Be Concise**: 150-300 words unless complex question requires more
4. **Use Examples**: "Your 10th lord Mercury in the 11th house suggests..."
5. **Acknowledge Limitations**: "Based on the chart, I can see... However, an experienced astrologer could provide additional nuances"

## Question Types & Handling

### Timing Questions
"When will I get married/job/etc?"
- Reference dasha periods and transits
- Provide date ranges, not exact dates
- Note that multiple factors influence timing

### "Why" Questions
"Why am I facing career challenges?"
- Analyze relevant houses (10th for career)
- Check afflictions, weak lords, malefic aspects
- Consider current dasha period

### Comparison Questions
"Is career or business better for me?"
- Compare 10th house (career) vs 7th/10th (partnerships/business)
- Analyze relevant yogas
- Note D10 chart indicators

### Concept Questions
"What is Sade Sati?"
- Explain the concept
- Show if/when it applies to their chart
- Describe practical implications

## Boundaries

**Do Not:**
- Predict death, severe illness, or catastrophes
- Provide medical/legal/financial advice
- Make deterministic predictions
- Answer questions unrelated to the chart
- Invent chart data not provided

**If Asked These:**
"I cannot provide that information as it falls outside ethical astrology practice. I can instead discuss [related appropriate topic]."

## Citation Examples

✅ "Your career prospects are strong because your 10th lord Sun is in the 11th house (gains) forming a Raja Yoga with Jupiter"
✅ "The current Saturn transit through your 8th house (until March 2026) may bring transformative experiences"
❌ "You have career potential" (no chart reference)
❌ "You'll definitely get promoted soon" (too deterministic)

## Conversation Style

- Warm and supportive but professional
- Patient with astrology beginners
- Use analogies for complex concepts
- Encourage questions for clarity
- End responses with "Feel free to ask more specific questions"

Now respond to the user's question with these guidelines in mind.
User Question Template:
markdown## User Question
{{USER_QUESTION}}

## Chat History
{{PREVIOUS_MESSAGES}}

## Instructions
Answer the user's question based on their chart data. Reference specific planetary positions, houses, aspects, or yogas. Keep your response focused and cite chart evidence.

4. AI Output Processing & Display
4.1 Response Parsing
Priority: P0 (Critical)
Response Structure from LLM:
json{
  "id": "msg_abc123",
  "model": "claude-sonnet-4-20250514",
  "content": [
    {
      "type": "text",
      "text": "# Personality & Character\n\nYour birth chart reveals..."
    }
  ],
  "usage": {
    "input_tokens": 12547,
    "output_tokens": 3421
  },
  "stop_reason": "end_turn"
}
Processing Pipeline:
pythonfrom typing import Dict, Any
import markdown
import re
from datetime import datetime

class AIResponseProcessor:
    def __init__(self):
        self.md = markdown.Markdown(extensions=['tables', 'fenced_code'])
    
    def process_response(self, llm_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process raw LLM response into structured format
        
        Returns:
            {
                "content": {
                    "raw_markdown": str,
                    "html": str,
                    "sections": List[Dict],
                    "citations": List[str]
                },
                "metadata": {
                    "model": str,
                    "tokens": Dict,
                    "cost_estimate": float,
                    "generation_time": float,
                    "timestamp": str
                },
                "quality_metrics": {
                    "citation_count": int,
                    "word_count": int,
                    "section_count": int,
                    "readability_score": float
                }
            }
        """
        raw_text = llm_response["content"][0]["text"]
        
        # Parse sections
        sections = self._extract_sections(raw_text)
        
        # Extract citations
        citations = self._extract_citations(raw_text)
        
        # Convert to HTML
        html_content = self.md.convert(raw_text)
        
        # Calculate metrics
        quality_metrics = {
            "citation_count": len(citations),
            "word_count": len(raw_text.split()),
            "section_count": len(sections),
            "readability_score": self._calculate_readability(raw_text)
        }
        
        # Calculate cost
        cost_estimate = self._calculate_cost(
            llm_response["usage"]["input_tokens"],
            llm_response["usage"]["output_tokens"],
            llm_response["model"]
        )
        
        return {
            "content": {
                "raw_markdown": raw_text,
                "html": html_content,
                "sections": sections,
                "citations": citations
            },
            "metadata": {
                "model": llm_response["model"],
                "tokens": llm_response["usage"],
                "cost_estimate": cost_estimate,
                "generation_time": llm_response.get("generation_time", 0),
                "timestamp": datetime.utcnow().isoformat()
            },
            "quality_metrics": quality_metrics
        }
    
    def _extract_sections(self, text: str) -> List[Dict]:
        """Extract markdown sections with headers"""
        sections = []
        current_section = None
        
        for line in text.split('\n'):
            if line.startswith('## ') or line.startswith('### '):
                if current_section:
                    sections.append(current_section)
                
                level = 2 if line.startswith('## ') else 3
                title = line.lstrip('#').strip()
                current_section = {
                    "level": level,
                    "title": title,
                    "content": ""
                }
            elif current_section:
                current_section["content"] += line + "\n"
        
        if current_section:
            sections.append(current_section)
        
        return sections
    
    def _extract_citations(self, text: str) -> List[str]:
        """Extract chart element citations from parentheses"""
        pattern = r'\(([^)]*(?:house|sign|planet|yoga|aspect|dasha)[^)]*)\)'
        return re.findall(pattern, text, re.IGNORECASE)
    
    def _calculate_readability(self, text: str) -> float:
        """Simple readability score (0-100, higher is more readable)"""
        sentences = text.split('.')
        words = text.split()
        
        if not sentences or not words:
            return 0
        
        avg_sentence_length = len(words) / len(sentences)
        # Ideal: 15-20 words per sentence
        score = 100 - abs(avg_sentence_length - 17.5) * 2
        return max(0, min(100, score))
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Calculate estimated API cost"""
        pricing = {
            "claude-sonnet-4-20250514": {
                "input": 3.0 / 1_000_000,   # $3 per 1M tokens
                "output": 15.0 / 1_000_000  # $15 per 1M tokens
            },
            "gpt-4-turbo-2024-04-09": {
                "input": 10.0 / 1_000_000,
                "output": 30.0 / 1_000_000
            }
        }
        
        if model not in pricing:
            return 0.0
        
        cost = (
            input_tokens * pricing[model]["input"] +
            output_tokens * pricing[model]["output"]
        )
        return round(cost, 4)
Quality Validation:
pythonclass AIQualityValidator:
    def validate(self, processed_response: Dict) -> Dict[str, Any]:
        """
        Validate AI response quality
        
        Returns:
            {
                "passed": bool,
                "warnings": List[str],
                "errors": List[str]
            }
        """
        warnings = []
        errors = []
        
        metrics = processed_response["quality_metrics"]
        content = processed_response["content"]
        
        # Check citation count
        if metrics["citation_count"] < 10:
            errors.append(
                f"Insufficient citations: {metrics['citation_count']} found, minimum 10 required"
            )
        elif metrics["citation_count"] < 20:
            warnings.append("Low citation count - interpretations should reference more chart elements")
        
        # Check word count
        if metrics["word_count"] < 1000:
            errors.append("Response too short - minimum 1000 words required")
        elif metrics["word_count"] > 5000:
            warnings.append("Response very long - consider summarizing")
        
        # Check sections
        required_sections = [
            "personality", "career", "relationship", "spiritual", "current"
        ]
        section_titles = [s["title"].lower() for s in content["sections"]]
        
        missing_sections = []
        for required in required_sections:
            if not any(required in title for title in section_titles):
                missing_sections.append(required)
        
        if missing_sections:
            errors.append(f"Missing required sections: {', '.join(missing_sections)}")
        
        # Check readability
        if metrics["readability_score"] < 50:
            warnings.append("Low readability score - sentences may be too complex")
        
        return {
            "passed": len(errors) == 0,
            "warnings": warnings,
            "errors": errors
        }
```

### 4.2 UI Display Components

#### 4.2.1 Interpretation Display Page

**Location:** `/chart/[id]/insights` tab

**Page Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI-Powered Insights                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ℹ️ Generated using Claude AI • 2,847 tokens used       │
│ 📅 Created: Oct 15, 2025 at 2:30 PM                    │
│                                                         │
│ [📥 Download PDF] [🔄 Regenerate] [👍 👎 Feedback]    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📑 Table of Contents                                   │
│ ├─ Personality & Character                            │
│ ├─ Career & Professional Life                         │
│ ├─ Relationships & Marriage                           │
│ ├─ Life Purpose & Spiritual Path                      │
│ ├─ Current Life Phase Analysis                        │
│ └─ Key Strengths & Growth Areas                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ## Personality & Character                             │
│                                                         │
│ Your birth chart reveals a complex and multifaceted    │
│ personality shaped by strong cardinal energy. The      │
│ Capricorn Ascendant (Saturn-ruled, placed in 2nd      │
│ house in its own sign Aquarius) indicates a           │
│ disciplined, ambitious nature with a practical        │
│ approach to life...                                    │
│                                                         │
│ [Read More ▼]                                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⚠️ AI Disclaimer                                       │
│ This interpretation is generated by artificial         │
│ intelligence and should be used for informational      │
│ purposes only. For important life decisions, consult   │
│ a qualified Vedic astrologer.                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
Component Implementation (React):
typescriptimport React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  chartId: string;
  interpretation: {
    content: {
      raw_markdown: string;
      sections: Array<{
        level: number;
        title: string;
        content: string;
      }>;
    };
    metadata: {
      model: string;
      tokens: {
        input_tokens: number;
        output_tokens: number;
      };
      timestamp: string;
    };
  };
}

export const AIInsightsDisplay: React.FC<AIInsightsProps> = ({
  chartId,
  interpretation
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personality']) // Default expand first section
  );
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const handleFeedback = async (positive: boolean) => {
    await fetch(`/api/ai/feedback`, {
      method: 'POST',
      body: JSON.stringify({
        chart_id: chartId,
        feedback: positive ? 'positive' : 'negative',
        timestamp: new Date().toISOString()
      })
    });
    setFeedbackGiven(true);
  };

  const handleRegenerate = async () => {
    // Trigger new AI generation
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-4xl">🤖</span>
            AI-Powered Insights
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              📥 Download PDF
            </button>
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              🔄 Regenerate
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Generated using {interpretation.metadata.model}</span>
          <span>•</span>
          <span>{interpretation.metadata.tokens.output_tokens.toLocaleString()} tokens</span>
          <span>•</span>
          <span>{new Date(interpretation.metadata.timestamp).toLocaleString()}</span>
        </div>

        {/* Feedback */}
        {!feedbackGiven && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <button
              onClick={() => handleFeedback(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Helpful"
            >
              👍
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Not helpful"
            >
              👎
            </button>
          </div>
        )}
        {feedbackGiven && (
          <div className="mt-4 text-sm text-green-600">
            ✓ Thank you for your feedback!
          </div>
        )}
      </div>

      {/* Table of Contents */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          📑 Table of Contents
        </h2>
        <ul className="space-y-2">
          {interpretation.content.sections.map((section, idx) => (
            <li key={idx}>
              
                href={`#section-${idx}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {interpretation.content.sections.map((section, idx) => {
          const sectionKey = section.title.toLowerCase().replace(/\s+/g, '-');
          const isExpanded = expandedSections.has(sectionKey);
          const preview = section.content.substring(0, 300) + '...';

          return (
            <motion.div
              key={idx}
              id={`section-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                {section.level === 2 && '##'}
                {section.level === 3 && '###'}
                {section.title}
              </h2>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {isExpanded ? section.content : preview}
                </ReactMarkdown>
              </div>

              {section.content.length > 300 && (
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>Read Less ▲</>
                  ) : (
                    <>Read More ▼</>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              AI Disclaimer
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This interpretation is generated by artificial intelligence and should be used for
              informational purposes only. AI may produce inaccurate or incomplete information.
              For important life decisions, consult a qualified Vedic astrologer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 4.2.2 Q&A Chat Interface

**Location:** `/chart/[id]/chat` tab

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ 💬 Ask About Your Chart                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 👤 You                            2:30 PM        │   │
│ │ When is a good time to start a business?        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🤖 AI Assistant                   2:30 PM        │   │
│ │                                                  │   │
│ │ Based on your chart, the upcoming Jupiter       │   │
│ │ Mahadasha starting in March 2025 would be an    │   │
│ │ excellent time to start a business.              │   │
│ │                                                  │   │
│ │ Here's why:                                      │   │
│ │ • Your 10th lord (career) Sun is strongly       │   │
│ │   placed in the 11th house (gains)              │   │
│ │ • Jupiter aspects your 10th house from the 1st, │   │
│ │   indicating expansion in career matters         │   │
│ │ • D10 chart shows ascendant lord Jupiter in 9th │   │
│ │   house (fortune), supporting entrepreneurship   │   │
│ │                                                  │   │
│ │ The current Venus-Mars period (until Aug 2025)  │   │
│ │ also supports taking calculated risks.           │   │
│ │                                                  │   │
│ │ Feel free to ask more specific questions!       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Type your question...                  [Send →] │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 💡 Suggested Questions:                                │
│ • What does my D9 chart say about marriage?           │
│ • Why am I facing career challenges currently?         │
│ • When does my Saturn Mahadasha begin?                 │
│                                                         │
│ ℹ️ 7/10 questions remaining today                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
Component Implementation:
typescriptimport React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens_used?: number;
}

interface ChatInterfaceProps {
  chartId: string;
  chartData: any;
  remainingQuestions: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chartId,
  chartData,
  remainingQuestions
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(remainingQuestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What does my D9 chart say about marriage?",
    "Why am I facing career challenges currently?",
    "When does my Saturn Mahadasha begin?",
    "What are my strongest planetary yogas?",
    "How will the upcoming Jupiter transit affect me?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim() || isLoading) return;

    if (questionsLeft <= 0) {
      alert('Daily question limit reached. Upgrade to Pro for unlimited questions.');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setRetry 