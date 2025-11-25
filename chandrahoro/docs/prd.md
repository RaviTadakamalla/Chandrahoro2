Product Requirements Document: Vedic Horoscope Chart Pack Application
1. Executive Summary
1.1 Product Vision
Build a comprehensive Vedic astrology application that transforms birth data (date, time, location) into professional-grade horoscope chart packs with accurate astronomical calculations, traditional Vedic interpretations, and modern AI-powered insights.
1.2 Target Users
•	Professional Vedic astrologers seeking computational tools
•	Astrology enthusiasts wanting detailed chart analysis
•	Researchers studying Vedic astrology correlations
•	API consumers building astrology-integrated applications
1.3 Core Value Proposition
Deliver astronomically precise, tradition-compliant Vedic charts with optional AI interpretation, supporting multiple calculation systems and export formats for professional and personal use.
 
2. Product Scope
2.1 In Scope
•	Multi-ayanamsha Vedic chart calculation engine
•	Divisional chart generation (D1, D9, D10, and extended divisionals)
•	Dasha period calculation with multi-level timelines
•	Planetary strength analysis (Shadbala, Ashtakavarga)
•	Yoga detection and transit forecasting
•	AI-powered interpretation layer (optional, configurable)
•	Multi-format export (PDF, PNG, SVG, JSON)
•	Responsive web application with mobile support
•	Secure API backend for integrations
2.2 Out of Scope (V1)
•	Progressed/solar return charts
•	Horary astrology modules
•	Compatibility/synastry analysis (consider for V2)
•	Mobile native apps (web-responsive initially)
•	Payment processing for premium features
•	User-generated content or social features
 
3. Functional Requirements
3.1 User Input & Data Capture
3.1.1 Birth Information Input
Priority: P0 (Critical)
Requirements:
•	Date input with calendar picker (1900-2100 range)
•	Time input with hours:minutes format (24-hour or AM/PM toggleable)
•	Unknown birth time checkbox with fallback behavior: 
o	Default to 12:00 PM local time
o	Disable time-sensitive calculations (houses, ascendant-dependent dashas)
o	Display disclaimer about limited accuracy
•	Birthplace autocomplete with geocoding: 
o	Search by city name, zip/postal code, or coordinates
o	Support for 200,000+ global locations
o	Display timezone and coordinates for verification
o	Manual latitude/longitude override option
Validation Rules:
•	Birth date cannot be in the future
•	Birth time required unless explicitly marked unknown
•	Location must resolve to valid coordinates
•	Timezone must be determinable from location + date
3.1.2 Calculation Preferences
Priority: P0 (Critical)
Ayanamsha Selection:
•	Default: Lahiri (Chitrapaksha)
•	Optional systems: 
o	Raman
o	Krishnamurti Paddhati (KP)
o	Fagan/Bradley (Western Sidereal)
o	Yukteshwar
•	Display current ayanamsha value (e.g., "Lahiri: 24°10'33"") for selected date
Chart Style Preferences:
•	North Indian (diamond) layout - default
•	South Indian (square grid) layout
•	Both layouts available for all charts
Divisional Charts to Generate:
•	Always: D1 (Rāśi), D9 (Navāṃśa), D10 (Daśāṃśa)
•	Optional (user-selectable): 
o	D2 (Horā), D3 (Drekkāṇa), D4 (Chaturthāṃśa)
o	D7 (Saptāṃśa), D12 (Dvādaśāṃśa), D16 (Ṣoḍaśāṃśa)
o	D20 (Viṃśāṃśa), D24 (Siddhaṃśa), D27 (Bhaṃśa)
o	D30 (Triṃśāṃśa), D40 (Khavedāṃśa), D45 (Akṣavedāṃśa)
o	D60 (Ṣaṣṭyāṃśa)
3.2 Astronomical Calculations
3.2.1 Core Computational Engine
Priority: P0 (Critical)
Technical Stack:
•	Backend: Swiss Ephemeris library (swisseph)
•	Calculation precision: 0.01 arc-second accuracy
•	Timezone handling: IANA timezone database with historical DST rules
Planetary Positions:
•	Calculate tropical positions for: 
o	Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
o	Rahu (True Node), Ketu (180° from Rahu)
o	Uranus, Neptune, Pluto (optional display)
•	Apply selected ayanamsha to derive sidereal positions
•	Calculate: 
o	Longitude (0°-360°), latitude, distance
o	Retrograde status (mark with 'R')
o	Speed (degrees per day)
o	Nakshatra and pada placement
o	Rāśi (sign) and degree within sign
House Calculations:
•	System: Whole Sign Houses (Vedic standard)
•	Calculate 12 house cusps from Ascendant
•	Optional: Equal House, Sripati, Placidus (for research)
•	Store house cusps with sub-second precision
Special Lagnas:
•	Calculate additional sensitive points: 
o	Bhava Madhya (house midpoints)
o	Hora Lagna
o	Ghati Lagna
o	Vighati Lagna (optional)
3.2.2 Divisional Chart Computation
Priority: P0 (Critical)
D1 (Rāśi) - Birth Chart:
•	Standard 12-sign zodiac positions
•	Display planets, Ascendant, house cusps
D9 (Navāṃśa) - Ninth Harmonic:
•	Each sign divided into 9 parts (3°20' each)
•	Calculate navāṃśa positions for all planets
•	Determine navāṃśa Ascendant
•	Highlight vargottama planets (same sign in D1 and D9)
D10 (Daśāṃśa) - Tenth Harmonic:
•	Each sign divided into 10 parts (3° each)
•	Career and profession indicator
Extended Divisional Charts (Optional):
•	Implement formulae for all requested divisions (D2-D60)
•	Apply appropriate sign counting rules (movable/fixed/dual variations)
•	Cross-reference Parashara Hora Shastra formulae
Rendering Requirements:
•	Generate both North and South Indian layouts
•	Show planet symbols/abbreviations with degrees
•	Color-code functional benefic/malefic status
•	Indicate retrograde motion with 'R' suffix
3.3 Dasha System Calculations
3.3.1 Vimshottari Dasha
Priority: P0 (Critical)
Calculation Specifications:
•	120-year cycle distributed across 9 planets
•	Starting Mahādasha determined by Moon's nakshatra at birth
•	Proportional balance based on Moon's position within nakshatra
•	Planet order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
Dasha Periods:
•	Ketu: 7 years | Venus: 20 years | Sun: 6 years
•	Moon: 10 years | Mars: 7 years | Rahu: 18 years
•	Jupiter: 16 years | Saturn: 19 years | Mercury: 17 years
Timeline Breakdown:
•	Mahādasha: Top-level periods (display all 9 periods with date ranges)
•	Antaradasha: Sub-periods within Mahādasha (proportional subdivision)
•	Pratyantardasha: Sub-sub-periods within Antaradasha (further subdivision)
•	Optional (for future): Sookshma and Prana levels
Timeline Visualization:
•	Horizontal timeline with collapsible periods
•	"Today" marker showing current position in dasha cycle
•	Date range labels (e.g., "Venus-Mars: Jan 15, 2024 - Aug 23, 2024")
•	Color-coded by planet for easy identification
•	Expandable/collapsible tree structure for nested periods
3.3.2 Alternative Dasha Systems (Optional)
Priority: P2 (Nice-to-have)
•	Yogini Dasha (8 planet cycle)
•	Ashtottari Dasha (108-year cycle)
•	Conditional dasha based on chart configurations
3.4 Planetary Strength Analysis
3.4.1 Shadbala (Six-fold Strength)
Priority: P1 (High)
Components to Calculate:
1.	Sthana Bala (Positional Strength): 
o	Uccha Bala (exaltation strength)
o	Saptavargaja Bala (divisional chart strength)
o	Ojhayugmarasyamsa Bala (odd/even sign strength)
o	Kendra Bala (angular house strength)
o	Drekkana Bala (decanate strength)
2.	Dig Bala (Directional Strength): 
o	Jupiter/Mercury: strong in 1st house
o	Sun/Mars: strong in 10th house
o	Saturn: strong in 7th house
o	Moon/Venus: strong in 4th house
3.	Kala Bala (Temporal Strength): 
o	Nathonnatha Bala (diurnal/nocturnal)
o	Paksha Bala (lunar fortnight)
o	Tribhaga Bala (day/night portion)
o	Varsha-Masa-Dina-Hora Bala (cyclical periods)
o	Ayana Bala (declination)
o	Yuddha Bala (planetary war)
4.	Chesta Bala (Motional Strength): 
o	Based on planetary speed and retrograde motion
o	N/A for Sun and Moon
5.	Naisargika Bala (Natural Strength): 
o	Fixed values: Saturn (7), Jupiter (6.5), Mars (5), Sun (4.5), Venus (4), Mercury (3.5), Moon (3)
6.	Drik Bala (Aspectual Strength): 
o	Strength from aspects received from other planets
Output Format:
•	Table showing all six components per planet
•	Total Shadbala in Rupas (1 Rupa = 60 Shashtiamsas)
•	Required strength thresholds (Sun: 390, Moon: 360, Mars: 300, etc.)
•	Visual bar chart comparing actual vs. required strength
•	Strong/Weak classification for each planet
3.4.2 Ashtakavarga (Eight-fold Division)
Priority: P1 (High)
Calculation Method:
•	For each planet, calculate benefic dots (bindus) in all 12 signs
•	Contributions from 7 planets + Ascendant = 8 sources
•	Sarvashtakavarga: Sum of all individual ashtakavargas
Deliverables:
•	Individual Ashtakavarga charts for each planet (12-house grid showing bindu counts)
•	Sarvashtakavarga summary chart (total bindus per sign)
•	Heatmap visualization: signs with high bindus (>28) highlighted as auspicious
•	Transit interpretation: Current planet positions overlaid on Ashtakavarga for timing
3.5 Aspect & Relationship Analysis
3.5.1 Vedic Aspects (Drishti)
Priority: P0 (Critical)
Aspect Rules:
•	All planets aspect 7th house from their position (opposition - 100% strength)
•	Mars additionally aspects 4th and 8th houses (75% strength)
•	Jupiter additionally aspects 5th and 9th houses (75% strength)
•	Saturn additionally aspects 3rd and 10th houses (75% strength)
Aspect Table Output:
•	Matrix showing which planets aspect which houses
•	Indicate aspect type (full, three-quarter, special)
•	Highlight mutual aspects (planets aspecting each other)
•	Color-code benefic (blue) vs. malefic (red) aspects
3.5.2 Planetary Relationships
Priority: P1 (High)
Natural Relationships (Naisargika):
•	Permanent friends, neutrals, enemies per classical texts
Temporal Relationships (Tatkalika):
•	Based on house positions (2nd, 12th, 3rd-10th from each other)
Compound Relationships (Panchadha Maitri):
•	Combine natural + temporal = Adhi Mitra (best friend), Mitra, Sama, Satru, Adhi Satru (great enemy)
Functional Relationships:
•	Benefic/malefic classification by house lordship for Ascendant
3.6 Yoga Detection
3.6.1 Classical Yogas
Priority: P1 (High)
Raja Yogas (Royal Combinations):
•	Trikona lords (1, 5, 9) with Kendra lords (1, 4, 7, 10)
•	Dharma-Karma Adhipati Yoga
•	Viparita Raja Yogas (lords of 6, 8, 12 in specific conditions)
Dhana Yogas (Wealth Combinations):
•	2nd and 11th lord connections
•	Lakshmi Yoga (Venus + Jupiter combinations)
Planetary Yogas:
•	Gaja Kesari Yoga (Jupiter-Moon)
•	Hamsa, Malavya, Ruchaka, Bhadra, Shasha (Pancha Mahapurusha Yogas)
•	Budha-Aditya Yoga (Sun-Mercury conjunction)
Malefic Yogas:
•	Kemadruma Yoga (Moon isolated)
•	Graha Yuddha (planetary war)
•	Papa Kartari Yoga (hemmed by malefics)
Detection Logic:
•	Rule-based engine checking planet positions, aspects, lordships
•	Display active yogas with: 
o	Yoga name (Sanskrit + English)
o	Formation details (which planets, houses involved)
o	Classical interpretation (1-2 sentences)
o	Strength assessment (forming, strong, weak)
3.6.2 Yoga Strength Assessment
Priority: P2 (Nice-to-have)
•	Consider planetary strength (Shadbala)
•	House placement of yoga-forming planets
•	Activation via dasha periods
3.7 Transit (Gochara) Analysis
3.7.1 Current Transit Positions
Priority: P1 (High)
Requirements:
•	Calculate current positions of all planets (as of "today")
•	Display transit chart in same layout as birth chart
•	Show transit planets in relation to natal houses
•	Highlight significant transit aspects: 
o	Saturn transits (Sade Sati, Dhaiya)
o	Jupiter transits (benefits by house)
o	Rahu-Ketu axis transits
o	Slow planet (Sa, Ju, Ra/Ke) sign changes
3.7.2 Sade Sati Analysis
Priority: P1 (High)
Calculation:
•	Identify when Saturn transits 12th, 1st, and 2nd houses from natal Moon
•	Calculate entry/exit dates for each phase
•	Display current phase (if active) with progress indicator
•	Historical Sade Sati periods with date ranges
3.7.3 Transit Forecast & Heatmap
Priority: P1 (High)
Monthly Intensity Heatmap (Next 12 Months):
•	Calculate monthly "intensity score" based on: 
o	Number of planets changing signs
o	Saturn/Jupiter aspects to natal planets
o	Eclipse impacts
o	Dasha-transit synchronization
•	Visualization: Calendar heatmap with color intensity 
o	Green: favorable periods
o	Yellow: mixed
o	Orange/Red: challenging
•	Hover/tap for monthly summary
Upcoming Key Transits (Next 6-12 Months):
•	List major events: 
o	Planet ingress (sign changes) with dates
o	Retrogrades and stations
o	Eclipse dates and visibility
o	Benefic/malefic conjunctions
•	Display in timeline format with date + brief interpretation
3.8 AI-Powered Interpretation System
3.8.1 LLM Configuration & Provider Management
Priority: P0 (Critical for AI features)
Multi-Provider Architecture:
•	Primary Provider: Anthropic Claude 3.5 Sonnet (better safety, citations)
•	Secondary Provider: OpenAI GPT-4 Turbo (fallback, comparison)
•	Future: Local LLM via Ollama (privacy-focused deployment)
•	Custom API endpoint support for enterprise deployments
Backend Configuration:
•	Environment-based provider selection with runtime switching
•	Encrypted API key storage using Fernet symmetric encryption
•	Model parameter tuning (temperature: 0.3, max_tokens: 4000)
•	Request/response logging for quality monitoring
•	Cost tracking per request with daily/monthly limits
User Controls & Consent:
•	Explicit AI feature opt-in during chart generation
•	Cost estimate display before generation (token count × rate)
•	Data processing consent with clear privacy policy
•	Ability to disable AI features per session
•	Export AI interpretations separately from chart data
3.8.2 Comprehensive Chart Interpretation
Priority: P0 (Critical for AI features)
Input Context Preparation:
•	Complete chart JSON including: planetary positions, houses, divisional charts
•	Calculated strengths: Shadbala scores, Ashtakavarga points
•	Detected yogas with formation details and strength assessments
•	Current dasha periods (Maha/Antar/Pratyantardasha) with dates
•	Active transits and upcoming significant planetary movements
•	Birth details (anonymized: location → coordinates, name → "native")
Prompt Engineering Strategy:
•	System Prompt: Vedic astrology expert following BPHS principles
•	Context Injection: Chart data as structured JSON in system message
•	Output Format: Markdown with required sections and citation format
•	Safety Instructions: Ethical boundaries, no harmful predictions
•	Quality Requirements: Minimum 15 citations, 2000+ words
Structured Output Sections:
1.	Personality & Character (400-500 words)
   - Ascendant analysis with lord placement and aspects
   - Moon sign and nakshatra for emotional nature
   - Sun placement for soul purpose and ego expression
   - Strongest planet by Shadbala influencing temperament
   - Key personality yogas (Gaja Kesari, Pancha Mahapurusha, etc.)
2.	Career & Professional Life (400-500 words)
   - 10th house analysis: lord, occupants, aspects
   - D10 (Dashamsha) chart insights for career direction
   - 2nd house (earned wealth) and 11th house (gains) analysis
   - Relevant career yogas (Raja Yoga, Dhana Yoga formations)
   - Professional timing based on current dasha periods
3.	Relationships & Marriage (350-400 words)
   - 7th house comprehensive analysis
   - Venus placement and dignity for relationship patterns
   - D9 (Navamsha) chart analysis for marriage prospects
   - Marriage timing indicators and favorable periods
   - Partnership compatibility factors and challenges
4.	Spiritual Path & Life Purpose (300-350 words)
   - 9th house (dharma) and 12th house (moksha) analysis
   - Jupiter placement for wisdom and spiritual inclinations
   - Ketu placement for past-life karma and detachment
   - Spiritual yogas if present (Pravrajya, Moksha yogas)
   - Recommended spiritual practices based on chart
5.	Current Life Phase Analysis (350-400 words)
   - Active Mahadasha/Antardasha effects and themes
   - Activated yogas during current period
   - Significant transits (Sade Sati, Jupiter transits, eclipses)
   - Monthly forecast for next 6 months
   - Timing recommendations for major decisions
6.	Key Strengths & Growth Areas (300-350 words)
   - 5 major strengths with specific chart citations
   - 5 areas for conscious development and growth
   - Actionable recommendations and remedial measures
   - Gemstone/mantra suggestions based on weak planets
Citation Requirements & Quality Standards:
•	Format: "[Interpretation] (Specific chart element with house/sign/aspect)"
•	Example: "Leadership potential is strong (Sun exalted in Aries in 10th house, aspected by Jupiter from 6th house, forming Budha-Aditya Yoga with Mercury)"
•	Minimum 15 citations per interpretation
•	No generic statements without chart evidence
•	Cross-reference multiple chart factors for each claim
3.8.3 Interactive Q&A Assistant
Priority: P1 (High for user engagement)
Chat Interface Functionality:
•	Contextual question answering about specific chart elements
•	Session-based conversation history (5 message context)
•	Suggested questions based on chart highlights
•	Real-time typing indicators and response streaming
Question Categories & Examples:
•	Timing Questions: "When should I start a business?", "When will I get married?"
•	Explanatory Questions: "Why am I facing career challenges?", "What does my Moon in 8th house mean?"
•	Comparative Questions: "Should I focus on career or business?", "Is this a good time for investment?"
•	Yoga Questions: "What is Gaja Kesari Yoga in my chart?", "How strong is my Raja Yoga?"
Grounding & Context Management:
•	Full chart JSON included in every API call
•	Question classification to retrieve relevant chart sections
•	Mandatory chart element citations in all responses
•	Fallback responses for questions outside chart scope
•	Context window management for long conversations
Response Quality Controls:
•	150-300 word responses (concise but comprehensive)
•	Specific chart references in every answer
•	Acknowledgment of limitations when data insufficient
•	Redirect to human astrologer for complex interpretations
Rate Limiting & Usage Controls:
•	Free Tier: 10 questions per month
•	Premium Tier: 100 questions per month
•	Daily limit: 20 questions to prevent abuse
•	Session limit: 10 consecutive questions
•	Cool-down period: 30 seconds between questions
3.9 Export & Sharing
3.9.1 PDF Report Generation
Priority: P0 (Critical)
Report Contents (20-30 pages):
1.	Cover page with birth details
2.	Chart visualizations: 
o	D1 (both North/South styles)
o	D9, D10 (selected layout)
o	Optional divisional charts
3.	Planetary positions table (with nakshatras, speeds, retrogrades)
4.	Dasha timeline (Mahā + current Antardasha/Pratyantardasha)
5.	Shadbala table + bar chart
6.	Ashtakavarga summary + heatmap
7.	Aspect table + diagram
8.	Detected yogas with descriptions
9.	Transit forecast summary
10.	AI narrative insights (if enabled)
11.	Appendix: Calculation parameters (ayanamsha, coordinates, timezone)
Technical Implementation:
•	Library: ReportLab (Python) or Puppeteer (Node.js) for HTML-to-PDF
•	Styling: Professional LaTeX-inspired template with: 
o	Header/footer with page numbers
o	Table of contents
o	High-contrast, print-optimized colors
o	Embedded fonts (Devanagari for Sanskrit terms)
Output:
•	Filename: VedicChart_[Name]_[YYYYMMDD].pdf
•	File size: <5MB
•	Print-ready: 300 DPI, A4/Letter size
3.9.2 Image Exports
Priority: P1 (High)
PNG Charts:
•	Individual chart exports (D1, D9, D10, etc.)
•	Resolution: 2400x2400px (high-res for printing)
•	Transparent background option
•	Filename: D1_NorthIndian_[Name].png
SVG Charts:
•	Vector format for infinite scalability
•	Editable in design software
•	Include metadata (birth details as SVG comments)
3.9.3 JSON Data Export
Priority: P1 (High)
Full Chart Payload:
json
{
  "birth_info": {
    "date": "1990-05-15",
    "time": "14:30:00",
    "timezone": "Asia/Kolkata",
    "location": {...},
    "ayanamsha": "Lahiri",
    "ayanamsha_value": 23.85
  },
  "planets": [
    {
      "name": "Sun",
      "tropical_longitude": 54.23,
      "sidereal_longitude": 30.38,
      "sign": "Aries",
      "degree_in_sign": 0.38,
      "nakshatra": "Ashwini",
      "pada": 1,
      "house": 5,
      "retrograde": false,
      "speed": 0.9567
    },
    ...
  ],
  "houses": [...],
  "divisional_charts": {
    "D1": {...},
    "D9": {...}
  },
  "dashas": {...},
  "shadbala": {...},
  "ashtakavarga": {...},
  "yogas": [...],
  "transits": {...}
}
Use Cases:
•	API integrations
•	Third-party software import
•	Data archival
•	Research datasets
3.9.4 Shareable Links (Future)
Priority: P3 (Low)
•	Generate short URL (e.g., vedic.app/chart/abc123)
•	Privacy: Password-protect or time-limited links
•	Embed preview card for social sharing
 
4. Technical Architecture
4.1 Backend Specifications
4.1.1 Technology Stack
Priority: P0 (Critical)
Core Framework:
•	FastAPI (Python 3.11+) 
o	Async request handling
o	Auto-generated OpenAPI documentation
o	Built-in validation with Pydantic
Astronomical Calculations:
•	Swiss Ephemeris (pyswisseph) 
o	JPL DE431 ephemeris data
o	Precise planetary positions (±0.01" accuracy)
o	Built-in ayanamsha calculations
Additional Libraries:
•	Timezonefinder (location → timezone)
•	Geopy (geocoding for location search)
•	ReportLab (PDF generation)
•	NumPy (numerical computations for ashtakavarga, shadbala)
4.1.2 API Endpoints
POST /api/chart/calculate
•	Input: Birth details + preferences
•	Output: Complete chart JSON
•	Response time: <2 seconds (for D1-D10 + dashas)
POST /api/chart/export/pdf
•	Input: Chart ID or birth details
•	Output: PDF byte stream
•	Background task: Queue for heavy reports
POST /api/v1/ai/interpret
•	Input: Chart JSON + interpretation preferences
•	Output: Structured AI interpretation with sections
•	Rate limit: 10 req/day per user (free), unlimited (premium)
•	Response time: 15-30 seconds
•	Token usage: ~15,000 tokens per interpretation
POST /api/v1/ai/chat
•	Input: Chart context + user question + conversation history
•	Output: Contextual answer with chart citations
•	Rate limit: 20 req/day per user (free), 100 (premium)
•	Response time: 5-10 seconds
•	Token usage: ~3,000 tokens per question
POST /api/v1/ai/feedback
•	Input: Interpretation ID + feedback (positive/negative) + optional comments
•	Output: Feedback recorded confirmation
•	Purpose: Quality improvement and model fine-tuning
GET /api/v1/ai/usage
•	Output: User's AI usage statistics (tokens, requests, costs)
•	Rate limit: 100 req/hour
•	Purpose: Cost tracking and usage monitoring
POST /api/v1/ai/regenerate
•	Input: Chart JSON + section to regenerate (optional)
•	Output: New AI interpretation for specified section or full chart
•	Rate limit: 5 req/day per user
•	Purpose: Allow users to get alternative interpretations
GET /api/locations/search?q={query}
•	Input: City name or zip code
•	Output: List of matching locations with coordinates
•	Data source: GeoNames database
GET /api/transits/current
•	Output: Current planetary positions
•	Cache: 1-hour TTL (transits change slowly)
4.1.3 Data Models (Pydantic)
python
class BirthDetails(BaseModel):
    date: date
    time: Optional[time]
    time_unknown: bool = False
    latitude: float
    longitude: float
    timezone: str
    location_name: str

class ChartPreferences(BaseModel):
    ayanamsha: Literal["Lahiri", "Raman", "KP", "Fagan", "Yukteshwar"]
    chart_style: Literal["North", "South"]
    divisional_charts: List[str]  # ["D1", "D9", "D10", ...]
    enable_ai: bool = False
    ai_provider: Optional[str]

class PlanetPosition(BaseModel):
    name: str
    longitude: float
    sign: str
    nakshatra: str
    house: int
    retrograde: bool
    # ... (see JSON structure)
4.1.4 Calculation Engine Design
Modular Architecture:
•	core/ephemeris.py: Wrapper for Swiss Ephemeris calls
•	core/ayanamsha.py: Ayanamsha calculations
•	core/houses.py: House system calculations
•	core/divisional.py: Divisional chart generators
•	core/dasha.py: Vimshottari dasha engine
•	core/strength.py: Shadbala + Ashtakavarga
•	core/yogas.py: Yoga detection rules
•	core/transits.py: Gochara calculations
Caching Strategy:
•	Cache ephemeris data for +/-100 years
•	Memoize expensive calculations (ashtakavarga takes ~500ms)
•	Redis for session storage (chart data reuse)
4.1.5 AI Integration Layer
LLM Abstraction:
python
class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, context: dict) -> str:
        pass

class OpenAIProvider(LLMProvider):
    # Implementation using openai library

class ClaudeProvider(LLMProvider):
    # Implementation using anthropic library
Prompt Templates:
•	Stored in prompts/ directory as Jinja2 templates
•	Versioned for prompt engineering iterations
•	Include chart context as JSON in system prompt
Safety Measures:
•	Content filtering for harmful predictions
•	Prompt injection detection
•	Cost caps per user (token limits)
4.2 Frontend Specifications
4.2.1 Technology Stack
Priority: P0 (Critical)
Core Framework:
•	Next.js 14 (React 18) 
o	Server-side rendering for SEO
o	API routes for middleware
o	Built-in image optimization
UI Libraries:
•	Tailwind CSS (styling)
•	shadcn/ui (component primitives)
•	Recharts (strength graphs, heatmaps)
•	React SVG (chart rendering)
•	Framer Motion (animations)
State Management:
•	Zustand (lightweight global state)
•	React Query (API data fetching/caching)
4.2.2 Page Structure
1. Home/Input Page (/)
•	Hero section with value proposition
•	Birth details form (see 3.1.1)
•	Preferences accordion (ayanamsha, charts, AI toggle)
•	"Generate Chart" CTA button
2. Chart Display Page (/chart/[id])
•	Tabbed layout: 
o	Overview: D1 chart + key highlights
o	Divisional Charts: D9, D10, extended (tabbed sub-navigation)
o	Dashas: Timeline visualization
o	Strengths: Shadbala + Ashtakavarga tables/graphs
o	Yogas: Detected yogas list
o	Transits: Current + forecast
o	Insights: AI narrative (if enabled)
o	Q&A: Chat interface (if enabled)
•	Floating action button: Export menu (PDF, PNG, JSON)
•	Share button (copy link)
3. Settings Page (/settings)
•	Default preferences
•	AI provider configuration (admin only)
•	Language selection
•	Theme toggle (light/dark)
4.2.3 Chart Rendering Component
North Indian Layout:
•	SVG-based diamond grid
•	Planets positioned in houses with degree labels
•	Hover: Planet details tooltip
South Indian Layout:
•	SVG-based square grid (3x3 with center omitted)
•	Ascendant marker in fixed position
•	Planets in rāśi squares
Responsive Design:
•	Desktop: Side-by-side North/South comparison
•	Mobile: Swipeable carousel
4.2.4 Dasha Timeline Component
Visual Design:
•	Horizontal timeline with zoom controls
•	Nested accordion for Mahā → Antara → Pratyantara
•	"Today" vertical line with label
•	Color-coded by planet (Sun: orange, Moon: white, etc.)
Interactivity:
•	Click period: Expand to show sub-periods
•	Hover: Tooltip with date range + active yogas during that period
4.2.5 Heatmap Component
Calendar Layout:
•	12-month grid (3 rows x 4 columns)
•	Each month shows intensity score (0-100)
•	Color scale: Green (0-33) → Yellow (34-66) → Red (67-100)
Interaction:
•	Click month: Show detailed transit events
•	Legend: Explain scoring methodology
4.3 Security & Privacy
4.3.1 PII Protection
Priority: P0 (Critical)
Data Storage:
•	No persistent user database in V1 (stateless API)
•	Chart data stored in session only (Redis, 24-hour expiry)
•	Optional: User accounts for saved charts (V2)
Transmission:
•	HTTPS only (TLS 1.3)
•	API keys encrypted at rest (Fernet symmetric encryption)
Compliance:
•	GDPR: Right to deletion (clear session endpoint)
•	CCPA: Data export (JSON download)
•	No third-party analytics tracking birth details
4.3.2 AI Data Handling
LLM Provider Restrictions:
•	Anonymize birth details before sending to LLM 
o	Send only: "Ascendant Aries, Sun in 5th house..." (no dates/names)
•	Terms of Service: Users acknowledge AI processing
•	Option: Local LLM deployment (Ollama) for full privacy
4.3.3 Rate Limiting & Abuse Prevention
API Rate Limits:
•	10 chart calculations per hour per IP
•	100 AI interpretations per day per user
•	10 PDF exports per hour per IP
DDoS Protection:
•	Cloudflare in front of backend
•	Request size limits (10KB for birth data)
4.4 Timezone & DST Handling
4.4.1 Historical Timezone Lookup
Priority: P0 (Critical)
Implementation:
•	Use timezonefinder + pytz with historical DST data
•	For birth dates before 1970: Manual timezone DB (IANA historical)
•	Display timezone info to user for verification 
o	Example: "Kolkata (UTC+5:30, no DST)"
Edge Cases:
•	Locations with timezone changes (e.g., Samoa 2011)
•	Pre-1900 births: Approximate local mean time
4.4.2 Unknown Birth Time Handling
Default Behavior:
•	Set time to 12:00 PM local time
•	Disable house-dependent calculations: 
o	Ascendant → Show "Unknown"
o	House placements → Marked as "Approximate"
o	Dashas → Use Moon's nakshatra only (no Ascendant-based dashas)
UI Indicators:
•	Banner: "Birth time unknown - chart has limited accuracy"
•	Affected sections grayed out or hidden
 
5. Non-Functional Requirements
5.1 Performance
Response Times:
•	Chart calculation:
Retry
Claude does not have the ability to run the code it generates yet.
S
Continue
5.1 Performance (continued)
Response Times:
•	Chart calculation: <2 seconds (D1-D10 + Dashas + Strengths)
•	PDF generation: <5 seconds for 30-page report
•	AI interpretation: <15 seconds (depends on LLM provider)
•	Location search: <500ms
•	Page load (frontend): <1.5 seconds (Lighthouse score >90)
Scalability:
•	Backend: Handle 100 concurrent calculations
•	Horizontal scaling: Stateless API design enables load balancing
•	Database: Redis cluster for session storage (supports 10K+ concurrent users)
•	CDN: Static assets served via Cloudflare/Vercel Edge Network
Optimization Strategies:
•	Lazy load divisional charts (render on tab selection)
•	Compress API responses (gzip)
•	Progressive PDF rendering (stream pages as generated)
•	Background jobs for heavy computations (Celery queue)
5.2 Reliability
Availability:
•	Target: 99.5% uptime (excluding planned maintenance)
•	Health check endpoint: /api/health
•	Graceful degradation: If AI unavailable, show cached interpretations
Error Handling:
•	Ephemeris calculation failures: Fallback to approximate calculations
•	Invalid location: Return nearest valid coordinates with warning
•	AI timeout: Return partial results after 30 seconds
Logging & Monitoring:
•	Structured logging (JSON format)
•	Error tracking: Sentry integration
•	Metrics: Prometheus + Grafana dashboards 
o	Chart calculation duration
o	AI token usage
o	PDF generation success rate
Backup & Recovery:
•	Ephemeris data: Immutable files (no backup needed)
•	User sessions: 24-hour expiry (no long-term storage)
•	Application code: Git version control with CI/CD
5.3 Accessibility
WCAG 2.1 AA Compliance:
•	Color contrast: Minimum 4.5:1 for text
•	Keyboard navigation: All interactive elements accessible via Tab
•	Screen readers: ARIA labels for SVG charts
•	Focus indicators: Visible outlines on all controls
Responsive Design:
•	Mobile-first approach
•	Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
•	Touch targets: Minimum 44x44px
•	Orientation support: Portrait and landscape
Internationalization Ready:
•	UTF-8 encoding for Devanagari script
•	RTL layout support (future: Arabic/Hebrew)
•	Date/time formatting per locale
5.4 Usability
Onboarding:
•	First-time user tooltip tour (3-step intro)
•	Sample chart link for exploration without data entry
•	Help button with contextual tooltips
Error Prevention:
•	Input validation with clear error messages
•	Confirmation dialog before overwriting chart
•	Auto-save preferences to browser localStorage
Feedback Mechanisms:
•	Loading spinners with progress messages
•	Success toasts for actions (PDF downloaded, chart saved)
•	Error alerts with recovery suggestions
5.5 Browser Compatibility
Supported Browsers:
•	Chrome/Edge: Latest 2 versions
•	Firefox: Latest 2 versions
•	Safari: Latest 2 versions (iOS 15+)
•	No IE11 support (legacy)
Progressive Enhancement:
•	Core functionality without JavaScript (form submission)
•	SVG fallback to PNG for older browsers
•	Print CSS for direct browser printing
 
6. Multilingual Support
6.1 Initial Languages
Priority: P1 (High)
Supported Languages (V1):
1.	English (default)
2.	Hindi (Devanagari script)
3.	Sanskrit (for technical terms - transliteration + Devanagari)
Translation Scope:
•	UI labels and buttons
•	Planet/sign names
•	Yoga descriptions
•	Error messages
•	PDF report headers
Not Translated (V1):
•	AI-generated narratives (English only initially)
•	User-generated content
6.2 Implementation
i18n Framework:
•	react-i18next (frontend)
•	Babel (Python backend)
Translation Files:
•	JSON format: /locales/en/translation.json
•	Managed via Crowdin or Lokalise
•	Fallback: English if translation missing
Language Selection:
•	Browser language detection
•	Manual selector in header
•	Persist choice in localStorage
Special Considerations:
•	Sanskrit Terms: Provide both IAST transliteration and Devanagari 
o	Example: "Nakṣatra (नक्षत्र)"
•	Number Formatting: Respect locale (1,000.50 vs 1.000,50)
•	Calendar Systems: Gregorian display, note Indian calendar equivalents (optional)
6.3 Future Language Expansion (V2+)
Priority: P3 (Low)
•	Tamil, Telugu, Kannada, Bengali (Indian languages)
•	Spanish, Portuguese (global audience)
•	Chinese (simplified) for diaspora
 
7. PDF Report Detailed Specifications
7.1 Report Structure
Page 1: Cover Page
•	Title: "Vedic Horoscope Chart Pack"
•	Birth details in centered box: 
o	Name (optional field)
o	Date of Birth: May 15, 1990
o	Time of Birth: 2:30 PM IST
o	Place of Birth: Mumbai, Maharashtra, India
o	Coordinates: 19.0760° N, 72.8777° E
o	Ayanamsha: Lahiri (23°51'22")
•	Footer: Generation date + app branding
Page 2: Table of Contents
•	Hyperlinked sections (if PDF reader supports)
Pages 3-5: Chart Visualizations
•	Full-page D1 (Rāśi) chart - North Indian style
•	Full-page D1 (Rāśi) chart - South Indian style
•	Half-page D9 (Navāṃśa) + D10 (Daśāṃśa) side-by-side
Pages 6-7: Planetary Positions
•	Table with columns: 
o	Planet | Longitude | Sign | Nakshatra | Pada | House | Retrograde | Speed
•	Sub-table: Special Lagnas (Ascendant, Hora Lagna, etc.)
Pages 8-10: Vimshottari Dasha
•	Mahādasha timeline (visual bar chart spanning page width)
•	Current Mahā/Antara/Pratyantara highlighted
•	Table listing all periods with date ranges
Pages 11-13: Shadbala Analysis
•	Bar chart: Total Shadbala vs. Required Strength (all planets)
•	Detailed table: Six components breakdown per planet
•	Interpretation paragraph (2-3 sentences per planet)
Pages 14-15: Ashtakavarga
•	Sarvashtakavarga grid (12x12 heatmap)
•	Individual planet ashtakavargas (mini grids, 2 per page)
Pages 16-17: Aspects & Relationships
•	Aspect matrix (planets vs houses)
•	Planetary relationship table (Panchadha Maitri)
•	Aspect diagram (circular chart with lines)
Pages 18-20: Yogas Detected
•	List format: 
o	Gaja Kesari Yoga 
	Formation: Jupiter in 1st house aspects Moon in 7th house
	Strength: Strong (both planets have high Shadbala)
	Interpretation: Bestows wisdom, prosperity, and respected social position
•	Include 10-15 most significant yogas
Pages 21-23: Transit Forecast
•	Current planetary positions table
•	Sade Sati analysis (if applicable)
•	12-month heatmap (calendar visualization)
•	Upcoming key transits list (next 6 months)
Pages 24-28: AI Insights (If Enabled)
•	Section headers: 
o	Personality & Character
o	Career & Financial Prospects
o	Relationships & Marriage
o	Spiritual Inclinations
o	Life Path Analysis
•	Each section: 1-2 paragraphs with chart citations
Page 29: Calculation Parameters
•	Technical appendix: 
o	Ephemeris version
o	Ayanamsha formula
o	House system used
o	Coordinate precision
o	Timezone verification
o	Computation timestamp
Page 30: Glossary & Disclaimer
•	Key terms (Nakshatra, Dasha, Ayanamsha, etc.)
•	Legal disclaimer: 
o	"This report is for informational and educational purposes only"
o	"Astrological interpretations should not replace professional advice"
o	"AI-generated content may contain inaccuracies"
7.2 PDF Styling
Typography:
•	Headings: Libre Baskerville (serif), 18pt/14pt/12pt
•	Body: Open Sans (sans-serif), 10pt
•	Tables: Roboto Mono, 9pt
•	Sanskrit terms: Noto Serif Devanagari
Color Scheme:
•	Primary: Deep indigo (#2C3E50)
•	Accents: Gold (#D4AF37) for borders
•	Charts: Muted colors for print (avoid pure black or red)
Layout:
•	Margins: 0.75 inches all sides
•	Header: Page title + birth name (right-aligned)
•	Footer: Page number + logo (centered)
Print Optimization:
•	Avoid pure black (#000) → use #1A1A1A
•	No background images/gradients
•	Line weight: Minimum 0.5pt for visibility
 
8. Testing Requirements
8.1 Unit Testing
Backend (pytest):
•	Ephemeris calculations: Validate against known horoscopes (NASA data)
•	Ayanamsha accuracy: Compare with Lahiri 1 Jan 2025 value (24°10'49")
•	Dasha periods: Cross-check with traditional software (Jagannatha Hora)
•	Shadbala formulas: Test edge cases (planetary war, retrograde)
•	Yoga detection: Known chart samples with documented yogas
Coverage Target: >85% for core calculation modules
Frontend (Jest + React Testing Library):
•	Component rendering
•	Form validation
•	API response handling
•	Chart visualization snapshots
8.2 Integration Testing
API Endpoints:
•	Full chart calculation workflow (birth data → JSON → PDF)
•	AI interpretation pipeline (chart → LLM → response)
•	Export functionality (all formats)
End-to-End (Playwright):
•	User journey: Input birth details → View chart → Export PDF
•	Mobile responsiveness
•	Cross-browser compatibility
8.3 Validation Testing
Astronomical Accuracy:
•	Compare 100 random dates with Swiss Ephemeris CLI output
•	Verify timezone conversions for 50 global locations
•	Test historical dates (pre-1900)
Astrological Integrity:
•	Validate against published charts of famous personalities
•	Consult with Vedic astrologers for ruleset verification
•	Cross-reference with established software (Jhora, Parashara's Light)
8.4 Performance Testing
Load Testing (Locust):
•	100 concurrent chart calculations
•	500 PDF generations per hour
•	AI endpoint: 50 req/minute
Stress Testing:
•	Identify breaking point (max concurrent users)
•	Memory leak detection (long-running processes)
8.5 Security Testing
OWASP Top 10:
•	SQL injection (N/A - no SQL database in V1)
•	XSS prevention (input sanitization)
•	CSRF protection (token-based)
•	API rate limiting effectiveness
Penetration Testing:
•	Third-party security audit (before public launch)
8.6 User Acceptance Testing (UAT)
Beta Testing Group:
•	20-30 astrologers + enthusiasts
•	Feedback on accuracy, usability, feature completeness
•	Bug bounty program (optional)
Test Scenarios:
•	Generate charts for known birth details
•	Verify AI interpretations against human astrologer analysis
•	Test unknown birth time handling
•	Export and review PDF quality
 
9. Deployment & DevOps
9.1 Infrastructure
Hosting:
•	Backend: AWS EC2 (t3.medium) or DigitalOcean Droplet 
o	Alternative: Google Cloud Run (containerized FastAPI)
•	Frontend: Vercel (Next.js native hosting) 
o	Alternative: Netlify or AWS Amplify
•	Redis: Redis Cloud (managed) or self-hosted
Domain & DNS:
•	Primary domain: vedichoroscope.app (example)
•	CDN: Cloudflare (DDoS protection + caching)
Containerization:
•	Docker images for backend + ephemeris data
•	Docker Compose for local development
•	Kubernetes (optional, for large scale)
9.2 CI/CD Pipeline
GitHub Actions Workflow:
1.	On Push to main: 
o	Run tests (backend + frontend)
o	Build Docker image
o	Push to container registry
o	Deploy to staging environment
2.	On Tag (e.g., v1.0.0): 
o	Deploy to production
o	Create GitHub release with changelog
3.	Scheduled (Daily): 
o	Security vulnerability scan (Snyk/Dependabot)
o	Ephemeris data update check
Deployment Strategy:
•	Blue-green deployment (zero downtime)
•	Rollback capability within 5 minutes
9.3 Monitoring & Alerts
Application Monitoring:
•	Sentry: Error tracking with source maps
•	LogRocket: Session replay for frontend issues
•	Prometheus + Grafana: Metrics dashboards 
o	Chart calculation latency (p50, p95, p99)
o	AI token usage & costs
o	PDF generation queue depth
Infrastructure Monitoring:
•	Uptime Robot: Public endpoint availability checks (1-min intervals)
•	CloudWatch/Datadog: Server metrics (CPU, memory, disk)
Alerting Rules:
•	API error rate >5% → Slack notification
•	PDF generation queue >100 → Email alert
•	Ephemeris file corruption → PagerDuty incident
9.4 Backup & Disaster Recovery
Data Backup:
•	Ephemeris files: Version-controlled in Git LFS
•	User sessions (Redis): Not critical (24-hour expiry)
•	Application config: Stored in Git + AWS Secrets Manager
Disaster Recovery Plan:
•	RTO (Recovery Time Objective): 2 hours
•	RPO (Recovery Point Objective): 1 hour (session data acceptable loss)
•	Runbook: Documented procedure for server restoration
 
10. Compliance & Legal
10.1 Terms of Service
Key Clauses:
•	Service provided "as-is" without warranties
•	No liability for astrological decisions made based on reports
•	User retains ownership of birth data
•	Company right to terminate service for abuse
10.2 Privacy Policy
GDPR Compliance:
•	Right to access: JSON export
•	Right to deletion: Clear session button
•	Data portability: PDF/JSON downloads
•	No profiling or automated decision-making (except AI opt-in)
Data Retention:
•	Session data: 24 hours
•	Server logs: 30 days
•	Error reports: 90 days (anonymized)
10.3 Cookie Policy
Cookies Used:
•	Session ID (essential, HttpOnly, Secure)
•	Language preference (functional)
•	Theme choice (functional)
•	Analytics (optional, requires consent banner)
10.4 AI Disclaimer
Prominent Display (on AI-enabled pages):
"Interpretations generated by artificial intelligence are for informational purposes only and should not be considered professional astrological advice. AI may produce inaccurate or incomplete information. Always consult a qualified astrologer for important life decisions."
10.5 Intellectual Property
Open Source Components:
•	Respect Swiss Ephemeris GPL license (or purchase commercial license)
•	Attribute third-party libraries in footer
Original Content:
•	Yoga descriptions: Cite classical texts (Brihat Parashara Hora Shastra, etc.)
•	Code: MIT or Apache 2.0 license (if open-sourcing)
 
11. Success Metrics & KPIs
11.1 Product Metrics
Engagement:
•	Charts generated per month
•	Average time on chart page
•	Export rate (% of users who download PDF)
•	AI feature adoption (% enabling interpretations)
Quality:
•	AI interpretation satisfaction score (thumbs up/down)
•	PDF download completion rate
•	Error rate per 1000 calculations
Performance:
•	Average chart calculation time
•	95th percentile API response time
•	PDF generation success rate
11.2 Business Metrics (If Monetized)
Conversion:
•	Free to paid upgrade rate
•	Revenue per user
•	Churn rate
Cost:
•	AI token cost per chart
•	Infrastructure cost per 1000 charts
11.3 Technical Metrics
Reliability:
•	Uptime percentage
•	Error rate by endpoint
•	Mean time to recovery (MTTR)
Efficiency:
•	Ephemeris cache hit rate
•	Redis memory utilization
•	CDN bandwidth savings
 
12. Roadmap & Future Enhancements
12.1 Phase 1 (MVP) - Months 1-3
Status: Current Scope
•	Core calculation engine (D1, D9, D10)
•	Vimshottari Dasha (3 levels)
•	Shadbala & Ashtakavarga
•	Basic yoga detection (10 yogas)
•	PDF export
•	Responsive UI
•	Unknown birth time handling
12.2 Phase 2 (Enhanced Features) - Months 4-6
Priority: P1
•	Extended divisional charts (all D2-D60)
•	AI interpretation with multiple providers
•	Q&A assistant
•	Transit heatmap
•	Advanced yoga detection (50+ yogas)
•	Multilingual support (Hindi)
•	PNG/SVG chart exports
12.3 Phase 3 (Premium Features) - Months 7-9
Priority: P2
•	User accounts & saved charts
•	Compatibility/synastry analysis
•	Muhurta (electional astrology)
•	Prashna (horary) charts
•	Custom dasha systems (Yogini, Ashtottari)
•	API for developers (paid tier)
•	Mobile apps (React Native)
12.4 Phase 4 (Advanced Tools) - Months 10-12
Priority: P3
•	Annual varshaphal (solar return) charts
•	Progression charts
•	Rectification tools (birth time correction)
•	Research database (correlations)
•	Educational courses integration
•	Astrologer marketplace (paid readings)
12.5 Long-term Vision (12+ Months)
•	Global astrology community features (forums, chart sharing)
•	Machine learning for pattern recognition
•	Predictive modeling (life event likelihood)
•	Integration with calendar apps (transit alerts)
•	Voice assistant ("Alexa, check my transits")
 
13. Dependencies & Constraints
13.1 Critical Dependencies
Astronomical Data:
•	Swiss Ephemeris files (se_*.se1 files)
•	Must be bundled with application or downloadable on first run
•	Updates: Annual checks for new ephemeris releases
Geocoding Services:
•	GeoNames API (free tier: 1000 req/hour)
•	Fallback: Mapbox or Google Geocoding API
AI Providers (if enabled):
•	OpenAI API (rate limits: tier-dependent)
•	Anthropic API (similar constraints)
•	Local LLM: Requires 8GB+ RAM server
13.2 Technical Constraints
Browser Limitations:
•	SVG complexity: Max 10,000 nodes (performance)
•	PDF size: <10MB (download limits)
•	Session storage: 5MB limit (browser)
API Rate Limits:
•	LLM tokens: ~150K tokens/day (OpenAI tier 1)
•	Geocoding: 1000 requests/hour (GeoNames)
Computational Limits:
•	Ashtakavarga calculation: ~500ms for all planets
•	Full divisional chart pack (16 charts): ~3 seconds
13.3 Regulatory Constraints
Astrology Legal Status:
•	Disclaimer required in certain jurisdictions
•	Cannot make medical or financial predictions (legal risk)
•	Age restriction: 18+ for AI features (terms compliance)
Data Residency:
•	GDPR: EU user data may require EU server hosting (future)
•	India: Sensitive data localization (if storing PII)
 
14. Risks & Mitigation
14.1 Technical Risks
Risk	Likelihood	Impact	Mitigation
Swiss Ephemeris calculation errors	Low	High	Extensive testing; fallback to approximate calculations
AI hallucinations (inaccurate interpretations)	Medium	Medium	Grounding prompts; human review; prominent disclaimers
Timezone database inaccuracies	Low	High	Manual verification for pre-1970 dates; user confirmation UI
PDF generation timeout (large reports)	Medium	Low	Background job queue; progressive rendering
LLM API downtime	Medium	Low	Graceful degradation; cached responses; local LLM fallback
14.2 Business Risks
Risk	Likelihood	Impact	Mitigation
AI costs exceed budget	Medium	Medium	Token limits per user; cost tracking dashboard
Low user adoption	Medium	High	Beta testing; astrologer partnerships; SEO optimization
Copyright claims (yoga descriptions)	Low	Medium	Cite original sources; legal review of content
Competitor launches similar tool	High	Low	Focus on accuracy & depth; unique AI integration
14.3 Legal & Compliance Risks
Risk	Likelihood	Impact	Mitigation
GDPR non-compliance penalties	Low	High	Privacy-by-design; no persistent storage; legal counsel review
Liability for user decisions	Low	High	Clear disclaimers; terms prohibiting reliance on predictions
Accessibility lawsuits (US ADA)	Low	Medium	WCAG AA compliance; accessibility audit
 
15. Appendices
15.1 Glossary of Vedic Astrology Terms
•	Ayanamsha (अयनांश): Offset between tropical and sidereal zodiac (~24° in 2025)
•	Rāśi (राशि): Zodiac sign (12 signs of 30° each)
•	Nakshatra (नक्षत्र): Lunar mansion (27 divisions of 13°20' each)
•	Dasha (दशा): Planetary period system (Vimshottari = 120-year cycle)
•	Bhāva (भाव): House (12 divisions representing life areas)
•	Yoga (योग): Planetary combination indicating specific outcomes
•	Gochara (गोचर): Transit of planets
•	Shadbala (षड्बल): Six-fold planetary strength calculation
•	Ashtakavarga (अष्टकवर्ग): Eight-fold division system for strength
•	Vargottama (वर्गोत्तम): Planet in same sign in D1 and D9 (highly auspicious)
15.2 References & Resources
Classical Texts:
•	Brihat Parashara Hora Shastra (BPHS) - foundational text
•	Jaimini Sutras - alternative dasha systems
•	Phaladeepika - yoga interpretations
Modern Resources:
•	Ernst Wilhelm's "Vault of the Heavens" (calculation methodology)
•	K.N. Rao's "Learn Hindu Astrology Easily" (practical techniques)
•	Swiss Ephemeris documentation (https://www.astro.com/swisseph/)
Software References:
•	Jagannatha Hora (accuracy benchmark)
•	Parashara's Light (commercial standard)
•	Jhora (open-source Vedic software)
15.3 Sample Chart Data (for Testing)
Test Case 1: Sri Ramakrishna Paramahamsa
•	Date: February 18, 1836
•	Time: Unknown (use 12:00 PM)
•	Location: Kamarpukur, West Bengal, India (22.95°N, 87.63°E)
•	Expected: Vargottama Moon, strong Jupiter
Test Case 2: Mahatma Gandhi
•	Date: October 2, 1869
•	Time: 7:12 AM LMT
•	Location: Porbandar, Gujarat, India (21.64°N, 69.60°E)
•	Expected: Libra Ascendant, Mars-Saturn yoga
Test Case 3: Edge Case (Leap Day)
•	Date: February 29, 2000
•	Time: 11:59 PM
•	Location: Auckland, New Zealand (−36.85°S, 174.76°E)
•	Test: Southern hemisphere + date edge case
15.4 Competitive Analysis
Feature	Our App	Astro-Seek	Vedic Astrology App	Jagannatha Hora
Multi-ayanamsha	✅	✅	❌	✅
D1-D60 charts	✅	Partial	✅	✅
Shadbala	✅	❌	✅	✅
Ashtakavarga	✅	❌	✅	✅
AI interpretation	✅	❌	❌	❌
PDF export	✅	Limited	❌	✅
Mobile responsive	✅	✅	✅	❌ (desktop)
Price	Free/Freemium	Free	$9.99	Free
Differentiators:
•	Only app with AI-powered interpretation
•	Most comprehensive free tier
•	Modern UX (vs. dated desktop software)
•	API for developers
 
16. Acceptance Criteria
16.1 Definition of Done
A feature is considered complete when:
•	Code implemented and peer-reviewed
•	Unit tests written (>80% coverage)
•	Integration tests passed
•	Documented in user guide
•	Accessibility audit passed
•	Performance benchmarks met
•	Deployed to staging for QA
•	Product owner sign-off
16.2 Launch Checklist
Pre-Launch (1 week before):
•	All P0 and P1 features complete
•	Load testing completed (100 concurrent users)
•	Security audit passed
•	Legal review (T&C, Privacy Policy)
•	Backup/recovery tested
•	Monitoring dashboards configured
•	Support documentation finalized
Launch Day:
•	DNS propagation verified
•	SSL certificate active
•	CDN caching confirmed
•	Error tracking enabled
•	Announcement blog post published
•	Social media posts scheduled
•	Support team briefed
Post-Launch (1 week after):
•	Monitor error rates (target <1%)
•	User feedback collected
•	Performance metrics reviewed
•	Hot-fix deployment plan ready
 
17. Open Questions & Decisions Needed
17.1 Pending Decisions
1.	AI Provider Default: 
o	OpenAI (better accuracy) vs. Anthropic (better safety) vs. Local (privacy)?
o	Recommendation: Anthropic Claude for balance; OpenAI as alternative
2.	Monetization Strategy: 
o	Free tier limits: 5 charts/month? 10?
o	Premium pricing: $9.99/month or $99/year?
o	Decision needed: Market research on willingness to pay
3.	Yoga Database: 
o	Build custom DB (200+ yogas) or license existing?
o	Timeline impact: Custom = +4 weeks dev time
4.	Mobile App Priority: 
o	Delay V1 for native apps or launch web-only?
o	Recommendation: Web-responsive first; native apps in Phase 3
17.2 Assumptions to Validate
•	Users will trust AI interpretations (with disclaimers)
•	Astrologers will adopt tool despite automation fears
•	Demand exists for developer API (enterprise/apps)
•	80% of users will use mobile devices (responsive design critical)
17.3 Out-of-Scope Items Deferred
•	Real-time collaboration (shared chart editing)
•	Video consultation integration
•	Blockchain/NFT for chart certificates (trendy but unnecessary)
•	Vedic matchmaking/marriage compatibility (complex regulatory issues)
 
18. Contact & Approval
Product Manager: [Name]
Engineering Lead: [Name]
Design Lead: [Name]
Legal Counsel: [Name]
Approval Required From:
•	CEO/Founder
•	CTO
•	Head of Product
•	Lead Astrologer (consultant)
Document Version: 1.0
Last Updated: [Date]
Next Review: [Date + 3 months]
 
Document Change Log
Version	Date	Author	Changes
1.0	2025-01-XX	[PM Name]	Initial draft
1.1	TBD	[PM Name]	Post-stakeholder review updates
 
END OF PRODUCT REQUIREMENTS DOCUMENT

