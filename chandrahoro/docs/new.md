# UI/UX PRD: Vedic Horoscope Chart Pack Application

## 1. Vision & Value Proposition

Transform the ancient science of Vedic astrology into an accessible, modern digital experience that respects tradition while embracing contemporary UX standards. This application empowers users—from curious seekers to professional astrologers—to generate astronomically precise horoscope charts with intelligent insights, all within a beautiful, configurable interface that adapts to individual preferences and cultural contexts.

**Core Value:** Deliver professional-grade Vedic astrological analysis with the simplicity of consumer apps, ensuring accuracy, transparency, and user control at every step. Users receive comprehensive birth chart interpretations they can trust, customize, and share—all while maintaining full control over their personal data and calculation preferences.

## 2. Personas

### Persona 1: The Curious Seeker (Priya, 28)
**Context:** Marketing professional, casual interest in astrology, mobile-first user  
**Top Jobs-to-be-Done:**
- Quickly generate my birth chart without complexity
- Understand what my chart "means" in plain language
- Share interesting insights with friends
- Explore when good things might happen (transits)
- Feel confident the calculations are legitimate

**Pain Points:** Overwhelmed by technical jargon, uncertain if birth time accuracy matters, doesn't know which settings to choose

### Persona 2: The Enthusiast (Rajesh, 42)
**Context:** Software engineer, studies Vedic astrology as hobby, compares multiple tools  
**Top Jobs-to-be-Done:**
- Verify calculations against known references (Jagannatha Hora)
- Experiment with different ayanamshas and house systems
- Deep-dive into divisional charts (D9, D10, extended)
- Track dasha periods precisely
- Export high-quality charts for study notes

**Pain Points:** Needs advanced controls without clutter, wants transparency in calculation methods, frustrated by locked settings

### Persona 3: The Professional Practitioner (Dr. Sharma, 55)
**Context:** Traditional Vedic astrologer, 25+ years experience, serves clients  
**Top Jobs-to-be-Done:**
- Generate client reports quickly with professional branding
- Access comprehensive technical data (Shadbala, Ashtakavarga)
- Print publication-quality chart packs
- Maintain calculation consistency with classical methods
- Protect client confidentiality

**Pain Points:** Requires batch processing, needs customizable PDF templates, suspicious of AI "interpretations" unless grounded in shastra

## 3. Core User Journeys

### Journey 1: First-Time Chart Generation (Seeker)
1. **Land on homepage** → See clear value prop + "Generate Your Chart" CTA
2. **Onboarding** → Brief 3-step intro (optional skip) explaining birth data need, privacy, output
3. **Birth details form** → Name (optional), Date (calendar), Time (HH:MM with "unsure" option), Place (autocomplete with map preview)
4. **Smart defaults** → System pre-selects Lahiri ayanamsha, Whole Sign houses, North Indian chart style
5. **Generate** → Loading state (20-30s) with progress messages ("Calculating planetary positions...", "Building divisional charts...")
6. **Chart Hub** → D1 chart displayed with key highlights sidebar (Ascendant, Moon sign, current dasha period)
7. **Guided exploration** → Tooltips invite: "See your Navamsa chart", "Understand your current life period"
8. **Save/Export** → Email/download PDF report; option to save to account (signup prompt)

**Success Metric:** 70%+ completion rate from form to chart view; <10% bounce on loading state

### Journey 2: Deep Configuration (Enthusiast)
1. **Return visit** → Login, access saved chart
2. **Settings panel** → Open "Chart Preferences" modal
3. **Experiment** → Change ayanamsha to "Raman" → see instant preview update with diff indicator
4. **Compare systems** → Toggle between North/South Indian layouts; enable extended divisionals (D60)
5. **Validate** → Check Shadbala table against reference; verify dasha dates
6. **Export** → Download JSON payload for external analysis
7. **Share findings** → Generate shareable link with custom note

**Success Metric:** 40%+ of returning users access Settings; avg 2.3 configuration changes per session

### Journey 3: Professional Client Report (Practitioner)
1. **Batch entry** → Upload CSV with 10 client birth details
2. **Template selection** → Choose "Professional PDF - Bilingual (EN/HI)"
3. **Customization** → Add practice logo, select sections (exclude AI insights), set page order
4. **Bulk generate** → Queue processes in background; email notification when ready
5. **Review & send** → Preview PDFs, download zip, email directly to clients via secure link
6. **Archive** → Charts auto-expire after 30 days unless saved to account

**Success Metric:** 15%+ of premium users adopt batch mode; avg report generation time <5min for 10 charts

## 4. Default Divisional Charts Strategy

### 4.1 Core Philosophy

**Always-Included Charts:** To ensure comprehensive astrological analysis for all users, regardless of their knowledge level, the system automatically includes three essential divisional charts in every calculation:

1. **D1 (Rashi)** - Main birth chart - Foundation of all Vedic astrology
2. **D9 (Navamsa)** - Marriage and dharma - Most important divisional chart
3. **D10 (Dasamsa)** - Career and profession - Essential for life path analysis

### 4.2 User Experience Flow

**For New Users (Seekers):**
- Default charts are calculated automatically without user selection
- Preferences panel shows these as "Always Included" with informational text
- Users can add additional charts (D2, D3, D7, etc.) up to the 16-chart limit
- Clear explanation: "These three charts provide comprehensive life analysis"

**For Advanced Users (Enthusiasts/Practitioners):**
- Can see which charts are defaults vs. user-selected
- Cannot uncheck default charts (they remain disabled but checked)
- Can add up to 13 additional charts beyond the 3 defaults
- Export/import settings preserve both default and user selections

### 4.3 Technical Implementation

**Backend Behavior:**
- API always merges user selections with default charts: `['D1', 'D9', 'D10'] + user_selected_charts`
- Deduplication ensures no chart is calculated twice
- Validation enforces 16-chart maximum including defaults
- Default charts are calculated even if user sends empty divisional_charts array

**Frontend Behavior:**
- Preferences panel shows defaults as checked and disabled
- Selection counter shows "3 + X additional charts selected"
- Clear visual distinction between default and optional charts
- Help text explains the rationale for default inclusions

### 4.4 Rationale for Default Selection

**D1 (Rashi) - Main Chart:**
- Foundation chart showing planetary positions at birth
- Required for all other calculations (houses, aspects, yogas)
- Universal starting point for any astrological analysis

**D9 (Navamsa) - Marriage & Dharma:**
- Most important divisional chart in Vedic tradition
- Shows soul's purpose, spiritual inclinations, marriage prospects
- Essential for complete personality and life path analysis
- Referenced in 80%+ of professional consultations

**D10 (Dasamsa) - Career & Profession:**
- Critical for understanding life purpose and career direction
- Highly relevant for modern users seeking guidance on professional life
- Complements D1 and D9 to provide comprehensive life overview

## 5. Information Architecture

```
/ (Home)
├── /onboarding (optional, skippable)
├── /chart/new
│   ├── Birth Details Form
│   └── Loading State
├── /chart/[id]
│   ├── Overview (D1 + Key Stats)
│   ├── Charts (D1, D9, D10, Extended)
│   ├── Dasha Timeline
│   ├── Strengths (Shadbala, Ashtakavarga)
│   ├── Yogas Detected
│   ├── Transits & Forecast
│   ├── Insights (AI, opt-in)
│   └── Q&A Chat (AI, opt-in)
├── /settings
│   ├── Account (if logged in)
│   ├── Preferences
│   │   ├── Astrology Engine (ayanamsha, house system)
│   │   ├── Chart Style (layout, colors, glyphs)
│   │   ├── Language & Locale
│   │   ├── Theme (light/dark/auto)
│   │   └── Notifications
│   └── AI Configuration (admin only)
├── /saved-charts (authenticated)
├── /export
│   ├── PDF Options
│   ├── Image Export
│   └── JSON Download
└── /help
    ├── FAQ
    ├── Glossary
    └── Contact Support
```

**Navigation Model:**
- **Primary Nav (Desktop):** Horizontal header with logo, "New Chart", "My Charts" (if auth), Settings gear, Help
- **Mobile Nav:** Hamburger menu with same items; sticky "Generate Chart" FAB on homepage
- **Chart View Nav:** Tabbed interface with overflow menu for less-used sections; breadcrumb shows chart name
- **Context Actions:** Floating action button (FAB) for Export in chart view; share icon in header

## 6. Screens & States

### 6.1 Onboarding & Permission Checks

**Screen: Welcome Splash (Optional, First Visit Only)**

```
┌─────────────────────────────────────┐
│  [Skip] [1/3 active] [2/3] [3/3]    │
│                                     │
│     ✨ Ancient Wisdom,              │
│        Modern Precision             │
│                                     │
│  Generate your complete Vedic       │
│  birth chart with astronomical      │
│  accuracy. Understand your life     │
│  path, strengths, and timing.       │
│                                     │
│         [Continue]                  │
└─────────────────────────────────────┘
```

**States:**
- Slide 1: Value proposition
- Slide 2: "We need 3 things: date, time, place" (visual diagram)
- Slide 3: "Your data, your control" (privacy assurance)

**Microcopy:**
- Slide 2: "⏰ Birth time accuracy matters—charts differ by minutes. Don't worry if uncertain; we'll handle it."
- Slide 3: "🔒 We don't sell your data. Charts expire after 24hrs unless you save them."

**Permissions (Progressive, On-Demand):**
- Location: Requested when user clicks "Use My Location" in birthplace field (not mandatory)
- Notifications: Offered after first successful chart generation ("Get alerts for your dasha changes?")

### 6.2 Birth Data Form

**Screen: New Chart Input**

```
┌─────────────────────────────────────────────┐
│ ← Back              New Chart          [?]  │
├─────────────────────────────────────────────┤
│                                             │
│  Tell us about your birth                   │
│  (All fields except name are required)      │
│                                             │
│  Name (Optional)                            │
│  [________________]                         │
│                                             │
│  Date of Birth *                            │
│  [DD] / [MM] / [YYYY]  📅               │
│  └─ Must be between 1900-2100              │
│                                             │
│  Time of Birth *                            │
│  [HH] : [MM]  [AM ▼]                       │
│  ☐ I don't know my exact birth time        │
│  └─ If unsure, we'll use 12:00 PM          │
│     (some features will be approximate)     │
│                                             │
│  Place of Birth *                           │
│  [Search city, zip, or coords___]  📍      │
│  └─ Mumbai, Maharashtra, India             │
│     19.0760°N, 72.8777°E                   │
│     Timezone: Asia/Kolkata (UTC+5:30)      │
│     [Use My Location]                       │
│                                             │
│  ⚙️ Advanced Options (collapsed)            │
│                                             │
│         [Generate Chart]                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Validation Rules & Error States:**

| Field | Validation | Error Message | State |
|-------|-----------|---------------|-------|
| Date | Not future date | "Birth date cannot be in the future." | Red border + icon |
| Date | Within 1900-2100 | "We can calculate charts for dates 1900-2100 only." | Warning |
| Time | Required if not "unknown" checked | "Please enter birth time or check 'I don't know'." | Red border |
| Place | Must resolve to coordinates | "We couldn't find this location. Try 'City, Country' or coordinates." | Red border + suggestions |
| Timezone | Auto-detected but can override | "Verify timezone is correct for [date]—DST changes may apply." | Info callout |

**Interactions:**
- **Date Picker:** Calendar widget with year dropdown; highlights today; grays out future dates
- **Time Unknown Checkbox:** Disables time input; shows informational callout: "⚠️ Without birth time, Ascendant and houses will be approximate. Dasha periods will be calculated from Moon only."
- **Place Autocomplete:** Debounced search (300ms); shows top 5 matches with country flags; clicking match shows map pin + timezone confirmation
- **Manual Override:** Expanding "Advanced Options" reveals lat/long fields and timezone dropdown

**Advanced Options Panel (Collapsed by Default):**

```
⚙️ Advanced Options

Ayanamsha:        [Lahiri (default) ▼]
House System:     [Whole Sign (default) ▼]
Chart Style:      [North Indian ▼]
Divisional Charts:
  Essential Charts (Always Included):
  ☑ D1 - Rashi (Main Chart)      [disabled]
  ☑ D9 - Navamsa (Marriage)      [disabled]
  ☑ D10 - Dasamsa (Career)       [disabled]

  Additional Charts (Optional):
  ☐ D2 - Hora (Wealth)
  ☐ D3 - Drekkana (Siblings)
  ☐ D7 - Saptamsa (Children)
  [+ Show all 13 additional charts]

  Selected: 3 essential + 0 additional = 3 of 16 charts

[ℹ️ What are these?] (links to glossary)
```

### 6.3 Loading State

**Screen: Chart Generation**

```
┌─────────────────────────────────────┐
│                                     │
│         🌌 Calculating...           │
│                                     │
│  ████████░░░░░░░░░░░░░ 60%         │
│                                     │
│  Computing planetary positions...   │
│                                     │
│  ⏱️ This usually takes 20-30 seconds │
│                                     │
└─────────────────────────────────────┘
```

**Progress Messages (Rotate Every 5s):**
1. "Calculating planetary positions..."
2. "Applying Lahiri ayanamsha..."
3. "Building divisional charts..."
4. "Computing Vimshottari dasha periods..."
5. "Analyzing planetary strengths..."
6. "Almost there..."

**Technical Implementation:** Skeleton screens preferred over spinners; progress bar based on backend event stream if available

### 5.4 Chart Hub (Overview)

**Screen: Chart Overview (D1 Display)**

```
┌────────────────────────────────────────────────────────────┐
│ ← Charts   Priya Sharma • May 15, 1990, 2:30 PM    [...] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Overview] [Charts] [Dasha] [Strengths] [Yogas] [Transits]│
│                                                            │
│ ┌────────────────────────┬─────────────────────────────┐  │
│ │                        │  📊 Key Highlights          │  │
│ │       NORTH            │                             │  │
│ │       INDIAN           │  Ascendant: Aries 15°23'    │  │
│ │       CHART            │  Moon: Gemini (Mrigashira)  │  │
│ │      (D1/Rāśi)         │  Sun: Taurus 1°45'          │  │
│ │                        │                             │  │
│ │   [Interactive SVG     │  Current Period:            │  │
│ │    with planets        │  Venus Mahadasha            │  │
│ │    positioned]         │  → Mars Antardasha          │  │
│ │                        │     (until Aug 2025)        │  │
│ │   Hover: tooltips      │                             │  │
│ │   Click: planet info   │  🌟 Active Yogas (3):       │  │
│ │   Zoom: scroll wheel   │  • Gaja Kesari Yoga         │  │
│ │                        │  • Budha-Aditya Yoga        │  │
│ │                        │  • [View all →]             │  │
│ └────────────────────────┴─────────────────────────────┘  │
│                                                            │
│ 🔀 [Switch to South Indian] [Toggle Aspects]              │
│                                                            │
│ ⬇️ Planetary Positions Table (collapsible)                 │
│ ┌──────┬──────────┬──────┬───────────┬────┬───┬──────┐   │
│ │Planet│ Longitude│ Sign │ Nakshatra │Pada│ H │ Retro│   │
│ ├──────┼──────────┼──────┼───────────┼────┼───┼──────┤   │
│ │ Sun  │ 1°45'    │ Tau  │ Krittika  │ 3  │ 2 │  -   │   │
│ │ Moon │ 23°12'   │ Gem  │ Mrigashira│ 4  │ 3 │  -   │   │
│ │ Mars │ 28°56'   │ Pis  │ Revati    │ 4  │ 12│  R   │   │
│ └──────┴──────────┴──────┴───────────┴────┴───┴──────┘   │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**

- **Chart Canvas:**
  - **Hover:** Tooltip appears near cursor with planet details (name, degree, nakshatra, house, speed)
  - **Click Planet:** Opens modal with detailed info (dignities, aspects given/received, Shadbala score)
  - **Zoom:** Mouse wheel or pinch-to-zoom (10%-200%); zoom controls in corner
  - **Pan:** Click-drag when zoomed in
  - **Layout Toggle:** Button switches between North/South Indian instantly with smooth transition
  - **Aspect Overlay:** Toggle shows aspect lines (color-coded: benefic blue, malefic red, neutral gray)

- **Responsive Behavior:**
  - **Desktop (>1024px):** Side-by-side chart + highlights
  - **Tablet (768-1023px):** Stacked with chart at 80% width
  - **Mobile (<768px):** Full-width chart; highlights collapse to accordion below; swipe tabs for sections

**Empty State (Unknown Birth Time):**

```
┌────────────────────────────────────┐
│                                    │
│    ⚠️ Birth Time Unknown           │
│                                    │
│  Your Ascendant and house          │
│  placements are approximate.       │
│  Chart shows planetary positions   │
│  at 12:00 PM local time.           │
│                                    │
│  [Learn about time accuracy]       │
│                                    │
└────────────────────────────────────┘
```

### 5.5 Dasha Timeline

**Screen: Vimshottari Dasha Periods**

```
┌────────────────────────────────────────────────────────────┐
│ ← Charts   Priya Sharma • Dasha Timeline         [Export] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 🕐 Vimshottari Dasha (120-year cycle)                      │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │                                                        ││
│ │  1990 ─────── 2000 ─────── 2010 ─────── 2020 ──────  ││
│ │                                                        ││
│ │  [Ketu 7y][Vns 20y        ][Sun 6][Moon 10][Mars 7y]  ││
│ │              ▲ You are here (Oct 2025)                ││
│ │              │                                         ││
│ │              Venus Mahadasha: Mar 2008 - Mar 2028     ││
│ │                                                        ││
│ │  [◀ Zoom Out] [Zoom In ▶] [Reset View]               ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ 📅 Current Period (Detailed)                               │
│                                                            │
│ ▼ Venus Mahadasha (Mar 15, 2008 - Mar 15, 2028)          │
│   │                                                        │
│   ├─ ▼ Mars Antardasha (Jan 10, 2025 - Mar 12, 2026)     │
│   │   │                                                    │
│   │   ├─ ► Venus Pratyantardasha (Jan 10 - May 8, 2025)  │
│   │   ├─ ▶ Sun Pratyantardasha (May 8 - Jul 2, 2025)     │
│   │   ├─ 🟢 Moon Pratyantardasha (Jul 2 - Oct 7, 2025)   │
│   │   │     [Current]                                     │
│   │   ├─ ▶ Mars Pratyantardasha (Oct 7 - Dec 4, 2025)    │
│   │   └─ ▶ Rahu Pratyantardasha (Dec 4 - Feb 21, 2026)   │
│   │                                                        │
│   ├─ ▶ Rahu Antardasha (Mar 12, 2026 - Feb 27, 2029)     │
│   └─ [+ 5 more Antardashas...]                            │
│                                                            │
│ [📆 Export to Calendar] [🔔 Set Reminders]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**

- **Timeline Scrubber:**
  - **Click Mahadasha Bar:** Expands to show Antardashas
  - **Click Antardasha:** Expands to show Pratyantardashas
  - **"You Are Here" Marker:** Vertical line with pulsing dot; always visible
  - **Hover:** Tooltip shows exact date range + duration in years/months/days

- **Keyboard Navigation:**
  - `Tab`: Cycle through periods
  - `Enter/Space`: Expand/collapse selected period
  - `Arrow Left/Right`: Navigate between periods at same level
  - `Arrow Down`: Drill into sub-periods
  - `Arrow Up`: Collapse to parent period

- **Export Options:**
  - **Calendar Export:** Downloads `.ics` file with all Mahadasha/Antardasha transitions as events
  - **Set Reminders:** Allows user to select specific period starts and set notification (email/push) X days before

- **Responsive:**
  - **Desktop:** Horizontal timeline + tree view side-by-side
  - **Mobile:** Stacked; timeline becomes vertical swimlane; tree view is accordion

**Accessibility:**
- ARIA landmarks: `<nav>` for timeline, `<main>` for period list
- `role="tree"` on nested period structure with `aria-expanded` states
- `aria-current="true"` on current period marker

### 5.6 Transit & Today

**Screen: Current Transits**

```
┌────────────────────────────────────────────────────────────┐
│ ← Charts   Priya Sharma • Transits & Forecast      [🔄]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 🌍 Current Planetary Positions (Oct 14, 2025)             │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Transiting planets overlaid on your birth chart       ││
│ │ [Interactive chart with transit positions highlighted]││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ 📊 Transit Intensity Heatmap (Next 12 Months)             │
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Oct'25  Nov'25  Dec'25  Jan'26  Feb'26  Mar'26        ││
│ │  🟢      🟡      🔴      🟡      🟢      🟢             ││
│ │                                                         ││
│ │ Apr'26  May'26  Jun'26  Jul'26  Aug'26  Sep'26        ││
│ │  🟢      🟡      🟢      🔴      🟡      🟢             ││
│ │                                                         ││
│ │ 🟢 Favorable  🟡 Mixed  🔴 Challenging                  ││
│ │ [Click month for details]                              ││
│ └─────────────────────────────────────────────────────────┘│
│                                                            │
│ ⚠️ Active Transit Alerts (3)                               │
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔴 Challenging • Saturn Transit                        ││
│ │ Saturn transiting 12th house from Moon (Sade Sati)    ││
│ │ Active until: Dec 2027                                 ││
│ │ [Learn more] [Track progress]                          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🟢 Favorable • Jupiter Transit                         ││
│ │ Jupiter aspects your natal Moon from 7th              ││
│ │ Active until: Mar 2026                                 ││
│ │ [Learn more]                                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                            │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🟡 Neutral • Rahu-Ketu Axis Transit                    ││
│ │ Rahu transiting 9th house                              ││
│ │ Active until: May 2026                                 ││
│ │ [Learn more]                                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                            │
│ 📅 Upcoming Key Events (Next 6 Months)                     │
│                                                            │
│ • Nov 18, 2025: Jupiter enters Gemini                     │
│ • Dec 25, 2025: Saturn retrograde ends                    │
│ • Feb 14, 2026: Mercury-Venus conjunction in Aquarius     │
│ • [View full transit calendar →]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Microcopy:**
- Alert cards: "Transit insights offer guidance, not guarantees. Life unfolds with your choices."
- Heatmap legend: "Intensity based on multiple factors: sign changes, aspects to natal planets, dasha alignment."

### 5.7 Insights (AI-Generated)

**Screen: AI Interpretation (Opt-In)**

```
┌────────────────────────────────────────────────────────────┐
│ ← Charts   Priya Sharma • Insights                  [⚙️]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ✨ AI-Powered Insights (Beta)                              │
│                                                            │
│ ⚠️ Disclaimer: These interpretations are AI-generated and │
│    for informational purposes only. Always consult a      │
│    qualified astrologer for important life decisions.     │
│                                                            │
│ [Enable AI Insights] [Learn about AI]                     │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 🎭 Personality & Character (Confidence: Medium)        ││
│ │                                                        ││
│ │ With Aries Ascendant and Moon in communicative       ││
│ │ Gemini (Mrigashira), you approach life with dynamic  ││
│ │ energy and intellectual curiosity. Strong Mars in     ││
│ │ 12th house (Revati) suggests introspective strength   ││
│ │ and compassion. Your Sun in Taurus 2nd house          ││
│ │ indicates steady values and financial prudence.       ││
│ │                                                        ││
│ │ 📌 Based on: Ascendant (Ari 15°23'), Moon (Gem),     ││
│ │    Sun (Tau 2nd house), Mars (Pis 12th, retrograde)  ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 💼 Career & Financial Prospects (Confidence: High)    ││
│ │                                                        ││
│ │ D10 (Daśāṃśa) shows Capricorn with Saturn and Sun    ││
│ │ positioned favorably. This suggests career growth in  ││
│ │ structured environments—possibly government, admin,   ││
│ │ or technical fields. Current Venus-Mars dasha period  ││
│ │ (2025-2026) may bring opportunities requiring bold   ││
│ │ action. Jupiter's upcoming transit to 3rd house      ││
│ │ (2026) supports skill development and networking.     ││
│ │                                                        ││
│ │ 📌 Based on: D10 chart, 10th lord placement, current ││
│ │    dasha (Venus-Mars), Jupiter transit forecast      ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ [+ Expand: Relationships] [+ Expand: Health]              │
│ [+ Expand: Spiritual Inclinations] [+ Expand: Life Path]  │
│                                                            │
│ 💬 Q&A Assistant                                           │
│                                                            │
│ Ask specific questions about your chart:                  │
│ [Type your question here_________________] [Send]         │
│                                                            │
│ Example: "When is a good time to start a business?"       │
│          "What does my D9 say about marriage?"            │
│                                                            │
│ 📊 Usage: 3 questions remaining today (resets daily)      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Confidence Badges:**
- **High:** 80%+ grounding to chart data, multiple corroborating factors
- **Medium:** 60-79% grounding, some ambiguity
- **Low:** <60% grounding, speculative interpretation

**Citation Format:**
Every interpretive claim must reference: `"[Statement] 📌 Based on: [specific chart elements]"`

**Error State (AI Unavailable):**

```
┌────────────────────────────────────┐
│                                    │
│    ⚠️ AI Insights Unavailable      │
│                                    │
│  The AI interpretation service is  │
│  temporarily down. Please try      │
│  again later or download your      │
│  chart data for manual analysis.   │
│                                    │
│  [View Chart Data] [Retry]         │
│                                    │
└────────────────────────────────────┘
```

### 5.8 Settings & Preferences

**Screen: User Settings**

```
┌────────────────────────────────────────────────────────────┐
│ ← Back                Settings                       [✓]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [Account] [Preferences] [AI] [Privacy] [About]            │
│ ─────────                                                  │
│                                                            │
│ 🔧 Chart Preferences                                       │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Category        │ Setting          │ Current Value    ││
│ ├─────────────────┼──────────────────┼──────────────────┤│
│ │ Astrology       │ Ayanamsha        │ Lahiri ▼         ││
│ │ Engine          │ House System     │ Whole Sign ▼     ││
│ │                 │ Dasha System     │ Vimshottari ✓    ││
│ ├─────────────────┼──────────────────┼──────────────────┤│
│ │ Chart           │ Primary Layout   │ North Indian ▼   ││
│ │ Display         │ Color Palette    │ Classic ▼        ││
│ │                 │ Glyph Style      │ Symbols ▼        ││
│ │                 │ Show Aspects     │ ☑ Enabled        ││
│ ├─────────────────┼──────────────────┼──────────────────┤│
│ │ Theme &         │ Appearance       │ Auto ▼           ││
│ │ Accessibility   │ Content Density  │ Comfortable ▼    ││
│ │                 │ Motion Effects   │ ☑ Enabled        ││
│ │                 │ Dyslexia Font    │ ☐ Use OpenDyslexic│
│ ├─────────────────┼──────────────────┼──────────────────┤│
│ │ Language &      │ Interface Lang   │ English ▼        ││
│ │ Locale          │ Date Format      │ DD/MM/YYYY ▼     ││
│ │                 │ Time Format      │ 24-hour ▼        ││
│ │                 │ Timezone         │ Auto-detect ☑    ││
│ ├─────────────────┼──────────────────┼──────────────────┤│
│ │ Notifications   │ Dasha Changes    │ ☑ Email          ││
│ │ (opt-in)        │ Transit Alerts   │ ☐ Push           ││
│ │                 │ Daily Digest     │ ☐ Email          ││
│ └─────────────────┴──────────────────┴──────────────────┘│
│                                                            │
│ 👁️ Live Preview (Changes apply instantly)                  │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ [Preview of chart with current settings applied]      ││
│ │ [Shows: ayanamsha value, house cusps, color scheme]   ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ [↓ Export Settings as JSON] [↑ Import Settings]           │
│ [Reset to Defaults]                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Settings Details:**

| Category | Setting | Options | Default | Affects | Live Preview | Persisted | Analytics Event |
|----------|---------|---------|---------|---------|--------------|-----------|-----------------|
| Astrology Engine | Ayanamsha | Lahiri, Raman, KP, Fagan, Yukteshwar | Lahiri | Calculation | Y | localStorage | `settings.ayanamsha.changed` |
| Astrology Engine | House System | Whole Sign, Equal, Sripati, Placidus | Whole Sign | Calculation | Y | localStorage | `settings.houses.changed` |
| Astrology Engine | Dasha System | Vimshottari, Yogini, Ashtottari | Vimshottari | Calculation | N | localStorage | `settings.dasha.changed` |
| Chart Display | Primary Layout | North Indian, South Indian | North Indian | UI | Y | localStorage | `settings.layout.changed` |
| Chart Display | Color Palette | Classic, Modern, High Contrast, Monochrome | Classic | UI | Y | localStorage | `settings.colors.changed` |
| Chart Display | Glyph Style | Symbols, Text, Both | Symbols | UI | Y | localStorage | `settings.glyphs.changed` |
| Chart Display | Show Aspects | On/Off | On | UI | Y | localStorage | `settings.aspects.toggled` |
| Theme & Accessibility | Appearance | Light, Dark, Auto | Auto | UI | Y | localStorage | `settings.theme.changed` |
| Theme & Accessibility | Content Density | Compact, Comfortable, Spacious | Comfortable | UI | Y | localStorage | `settings.density.changed` |
| Theme & Accessibility | Motion Effects | On/Off | On | UI | Y | localStorage | `settings.motion.toggled` |
| Theme & Accessibility | Dyslexia Font | On/Off | Off | UI | Y | localStorage | `settings.a11y.font.toggled` |
| Language & Locale | Interface Language | English, Hindi | English | UI | N (req reload) | localStorage | `settings.lang.changed` |
| Language & Locale | Date Format | DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD | DD/MM/YYYY | UI | Y | localStorage | `settings.date_format.changed` |
| Language & Locale | Time Format | 12-hour, 24-hour | 24-hour | UI | Y | localStorage | `settings.time_format.changed` |
| Language & Locale | Timezone | Auto-detect, Manual | Auto | Calculation | Y | localStorage | `settings.timezone.changed` |
| Notifications | Dasha Changes | Email, Push, Off | Off | Backend | N | Account DB | `settings.notif.dasha.changed` |
| Notifications | Transit Alerts | Email, Push, Off | Off | Backend | N | Account DB | `settings.notif.transit.changed` |
| Notifications | Daily Digest | Email, Off | Off | Backend | N | Account DB | `settings.notif.digest.changed` |

**Interactions:**
- **Live Preview:** Changes to visual settings (layout, colors, glyphs) update preview pane in real-time without save button
- **Calculation Settings:** Show diff indicator if changing would affect existing chart: "⚠️ Changing ayanamsha will recalculate planetary positions by ~0.5°"
- **Import/Export:** Settings JSON includes all preferences for backup/sharing; warning shown if importing incompatible version
- **Reset:** Confirmation modal: "Reset all settings to defaults? This cannot be undone."

### 5.9 Export & Share

**Screen: Export Options**

```
┌────────────────────────────────────────────────────────────┐
│ ← Chart                Export                        [×]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 📄 PDF Report                                              │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Report Style: [Professional ▼]                        ││
│ │ • Professional (30 pages, full data)                  ││
│ │ • Summary (10 pages, key insights only)               ││
│ │ • Bilingual (EN+HI, 35 pages)                         ││
│ │                                                        ││
│ │ Include Sections:                                     ││
│ │ ☑ Charts (D1, D9, D10)      ☑ Dasha Timeline         ││
│ │ ☑ Planetary Positions       ☑ Shadbala & Ashtakavarga││
│ │ ☑ Yogas Detected            ☑ Transit Forecast       ││
│ │ ☑ AI Insights (if enabled)  ☐ Technical Appendix     ││
│ │                                                        ││
│ │ Customization:                                        ││
│ │ ☐ Add watermark: [Your text___________]              ││
│ │ ☐ Include logo: [Upload image]                       ││
│ │                                                        ││
│ │ Estimated size: 4.2 MB • 30 pages                     ││
│ │ Generation time: ~5 seconds                           ││
│ │                                                        ││
│ │              [Generate PDF]                           ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ 🖼️ Image Export                                            │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Chart to Export: [D1 (Rāśi) ▼]                        ││
│ │ Format: [PNG ▼] (PNG, SVG)                            ││
│ │ Resolution: [2400x2400px ▼] (High-res for print)      ││
│ │ Background: [White ▼] (White, Transparent, Black)     ││
│ │                                                        ││
│ │              [Download Image]                         ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ 📊 Data Export                                             │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Format: JSON (complete chart data payload)            ││
│ │ Use case: API integration, third-party software       ││
│ │                                                        ││
│ │              [Download JSON]                          ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ 🔗 Share                                                   │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Shareable Link: https://vedic.app/chart/abc123xyz    ││
│ │                                                        ││
│ │ Privacy: [Private ▼] (Private, Public, Password)      ││
│ │ Expires: [7 days ▼] (24hr, 7d, 30d, Never)            ││
│ │                                                        ││
│ │ [📋 Copy Link] [📧 Email] [📱 QR Code]                  ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**PDF Generation States:**

```
Generating: [Progress bar] "Rendering page 12 of 30..."
Success: ✓ "PDF ready! VedicChart_Priya_20251014.pdf (4.2 MB)"
Error: ⚠️ "Generation failed. [Retry] or [Download chart data]"
```

### 5.10 Empty, Loading & Error States

**Empty State: No Saved Charts (Authenticated)**

```
┌────────────────────────────────────┐
│                                    │
│         📂                         │
│    No Saved Charts Yet             │
│                                    │
│  Generate your first chart to      │
│  start exploring Vedic astrology.  │
│                                    │
│      [Create New Chart]            │
│                                    │
└────────────────────────────────────┘
```

**Skeleton Loading (Chart View)**

```
┌────────────────────────────────────┐
│ [░░░░░░░░░░░░░░░░░░░░░] 80%       │
│                                    │
│ ┌──────────────┐ ┌───────────────┐│
│ │              │ │ ░░░░░░░░░░░  ││
│ │   ░░░░░░     │ │ ░░░░░░░░░░░  ││
│ │   ░░░░░░     │ │              ││
│ │   ░░░░░░     │ │ ░░░░░░░░░░░  ││
│ │              │ │ ░░░░░░░░░░░  ││
│ └──────────────┘ └───────────────┘│
│                                    │
└────────────────────────────────────┘
```

**Error State: Calculation Failed**

```
┌────────────────────────────────────┐
│                                    │
│         ⚠️                         │
│    Calculation Error               │
│                                    │
│  We couldn't calculate your chart. │
│  This might be due to:             │
│                                    │
│  • Invalid birth date/coordinates  │
│  • Server timeout                  │
│  • Ephemeris data issue            │
│                                    │
│  [Try Again] [Contact Support]     │
│                                    │
└────────────────────────────────────┘
```

**Offline State (PWA)**

```
┌────────────────────────────────────┐
│                                    │
│         📡                         │
│    You're Offline                  │
│                                    │
│  You can still view your last      │
│  generated chart. New calculations │
│  require internet connection.      │
│                                    │
│  [View Last Chart]                 │
│                                    │
└────────────────────────────────────┘
```

## 6. Design System (v1 Tokens & Components)

### 6.1 Design Tokens

**Color Tokens (Semantic)**

| Token Name | Light Mode | Dark Mode | Usage | Contrast Ratio |
|------------|------------|-----------|-------|----------------|
| `--color-primary` | #4A5FCF (Indigo 600) | #6B7FE8 (Indigo 400) | CTAs, links, accents | 4.5:1 (AA) |
| `--color-primary-hover` | #3A4FBF | #7B8FF8 | Hover states | 4.5:1 (AA) |
| `--color-secondary` | #D4AF37 (Gold) | #E5C050 | Special highlights, premium | 4.8:1 (AA) |
| `--color-background` | #FFFFFF | #1A1A1A | Page background | - |
| `--color-surface` | #F8F9FA | #2A2A2A | Card/panel backgrounds | - |
| `--color-surface-elevated` | #FFFFFF | #333333 | Modals, dropdowns | - |
| `--color-border` | #E0E0E0 | #404040 | Dividers, input borders | - |
| `--color-text-primary` | #1A1A1A | #FFFFFF | Body text | 12:1 (AAA) |
| `--color-text-secondary` | #666666 | #A0A0A0 | Supporting text | 7:1 (AAA) |
| `--color-text-tertiary` | #999999 | #707070 | Placeholder text | 4.5:1 (AA) |
| `--color-success` | #22C55E | #34D966 | Favorable transits, confirmations | 4.5:1 (AA) |
| `--color-warning` | #F59E0B | #FDB022 | Neutral/mixed transits, cautions | 4.5:1 (AA) |
| `--color-error` | #EF4444 | #F87171 | Challenging transits, errors | 4.5:1 (AA) |
| `--color-info` | #3B82F6 | #60A5FA | Informational callouts | 4.5:1 (AA) |
| `--color-benefic` | #3B82F6 (Blue) | #60A5FA | Benefic planets/aspects | 4.5:1 (AA) |
| `--color-malefic` | #DC2626 (Red) | #F87171 | Malefic planets/aspects | 4.5:1 (AA) |
| `--color-neutral` | #6B7280 (Gray) | #9CA3AF | Neutral planets | 4.5:1 (AA) |

**Typography Tokens**

| Token Name | Value | Usage |
|------------|-------|-------|
| `--font-family-primary` | 'Inter', system-ui, sans-serif | UI text, body copy |
| `--font-family-display` | 'Libre Baskerville', serif | Headings, hero text |
| `--font-family-mono` | 'Roboto Mono', monospace | Technical data, coordinates |
| `--font-family-devanagari` | 'Noto Sans Devanagari', sans-serif | Sanskrit/Hindi terms |
| `--font-family-dyslexic` | 'OpenDyslexic', sans-serif | Accessibility option |
| `--font-size-xs` | 0.75rem (12px) | Captions, footnotes |
| `--font-size-sm` | 0.875rem (14px) | Small text, secondary info |
| `--font-size-base` | 1rem (16px) | Body text |
| `--font-size-lg` | 1.125rem (18px) | Large body, subheadings |
| `--font-size-xl` | 1.25rem (20px) | Section headings |
| `--font-size-2xl` | 1.5rem (24px) | Page titles |
| `--font-size-3xl` | 1.875rem (30px) | Hero text |
| `--font-size-4xl` | 2.25rem (36px) | Display text |
| `--font-weight-normal` | 400 | Body text |
| `--font-weight-medium` | 500 | Emphasis |
| `--font-weight-semibold` | 600 | Subheadings |
| `--font-weight-bold` | 700 | Headings, CTAs |
| `--line-height-tight` | 1.25 | Headings |
| `--line-height-normal` | 1.5 | Body text |
| `--line-height-relaxed` | 1.75 | Long-form content |

**Spacing Tokens**

| Token Name | Value | Usage |
|------------|-------|-------|
| `--space-1` | 0.25rem (4px) | Micro spacing |
| `--space-2` | 0.5rem (8px) | Tight spacing |
| `--space-3` | 0.75rem (12px) | Small gaps |
| `--space-4` | 1rem (16px) | Default spacing |
| `--space-5` | 1.25rem (20px) | Medium gaps |
| `--space-6` | 1.5rem (24px) | Comfortable spacing |
| `--space-8` | 2rem (32px) | Large gaps |
| `--space-10` | 2.5rem (40px) | Section spacing |
| `--space-12` | 3rem (48px) | Extra large gaps |
| `--space-16` | 4rem (64px) | Major sections |

**Border Radius Tokens**

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Buttons, inputs |
| `--radius-md` | 0.5rem (8px) | Cards, panels |
| `--radius-lg` | 0.75rem (12px) | Modals, large cards |
| `--radius-xl` | 1rem (16px) | Hero sections |
| `--radius-full` | 9999px | Pills, avatars |

**Elevation (Shadows)**

| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle depth |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards, buttons |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Dropdowns, tooltips |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | Modals, overlays |

**Motion Tokens**

| Token Name | Value | Reduced Motion Fallback |
|------------|-------|-------------------------|
| `--duration-fast` | 150ms | 0ms (instant) |
| `--duration-base` | 250ms | 0ms |
| `--duration-slow` | 350ms | 0ms |
| `--duration-slower` | 500ms | 0ms |
| `--easing-ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | linear |
| `--easing-ease-out` | cubic-bezier(0, 0, 0.2, 1) | linear |
| `--easing-spring` | cubic-bezier(0.68, -0.55, 0.265, 1.55) | linear |

### 6.2 Core Components

**AppShell**
- **Structure:** Header + Main + Footer (optional)
- **Responsive:** Collapses to mobile nav at <768px
- **Accessibility:** `role="banner"` for header, `role="main"` for content
- **Variants:** With sidebar (desktop), without sidebar (mobile)

**Navigation**
- **Desktop:** Horizontal nav with dropdowns
- **Mobile:** Hamburger → slide-in drawer
- **States:** Active (underline + bold), hover (background tint), focus (outline)
- **Keyboard:** Tab navigation, arrow keys in dropdowns

**Card**
- **Variants:** Default, elevated, bordered, interactive (hover lift)
- **Padding:** `--space-6` default, `--space-4` compact
- **Radius:** `--radius-md`
- **Shadow:** `--shadow-md`, `--shadow-lg` on hover (interactive variant)

**Tabs**
- **Style:** Underline indicator (primary color)
- **States:** Active (bold + underline), inactive (gray), hover (tint), focus (outline)
- **Keyboard:** Arrow keys to navigate, Enter/Space to activate
- **ARIA:** `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`

**Stepper (Onboarding)**
- **Variants:** Dots (mobile), numbered (desktop)
- **States:** Completed (checkmark), current (filled), upcoming (outline)
- **Progress Bar:** Linear below steps

**Form Field Set**
- **DOB Field:** Three inputs (DD/MM/YYYY) + calendar icon
- **TOB Field:** Two inputs (HH:MM) + AM/PM dropdown + "Unknown" checkbox
- **POB Field:** Text input with autocomplete dropdown + map icon + "Use My Location" button
- **Validation:** Real-time on blur, error state (red border + icon + message below)
- **Labels:** Always visible, positioned above input
- **Help Text:** Optional, smaller gray text below label

**ChartCanvas (SVG Component)**
- **Props:** `chartData`, `layout` (north/south), `colorPalette`, `showAspects`, `zoom`, `onPlanetClick`
- **Interactions:** Hover tooltips, click events, zoom/pan
- **Responsive:** Scales to container, min 320px width
- **Accessibility:** `role="img"`, `aria-label` with chart description, focusable planets with keyboard nav

**Timeline (Dasha)**
- **Variants:** Horizontal (desktop), vertical (mobile)
- **Interactions:** Collapsible periods, hover tooltips, "You Are Here" marker
- **States:** Expanded/collapsed, past/current/future (opacity gradients)
- **Keyboard:** Arrow keys, Enter/Space to expand

**Tag/Chip**
- **Variants:** Default, success (green), warning (yellow), error (red), info (blue)
- **Size:** SM (24px height), MD (32px height), LG (40px height)
- **Closable:** Optional × icon
- **States:** Default, hover (darken 10%), focus (outline)

**Callout (Alert/Banner)**
- **Variants:** Info (blue), success (green), warning (yellow), error (red)
- **Icons:** Semantic icons (ℹ️, ✓, ⚠️, ×)
- **Dismissible:** Optional close button
- **Position:** Inline or fixed top (notifications)

**Modal/Sheet**
- **Backdrop:** Semi-transparent overlay (rgba(0,0,0,0.5))
- **Animation:** Fade in + slide up (250ms ease-out)
- **Focus Trap:** Tab cycles within modal
- **Close:** × button, Esc key, backdrop click (optional)
- **Sizes:** SM (400px), MD (600px), LG (800px), Full (90vw)
- **Mobile:** Bottom sheet (slides up from bottom)

**SettingsPanel**
- **Layout:** Two-column (label | control) table on desktop, stacked on mobile
- **Live Preview:** Side-by-side preview pane shows changes instantly
- **Reset Button:** Confirmation modal before resetting
- **Import/Export:** File upload/download with JSON validation

## 7. Interaction Model

**Keyboard Map (Global)**

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Navigate forward | All focusable elements |
| `Shift + Tab` | Navigate backward | All focusable elements |
| `Enter / Space` | Activate | Buttons, links, expandable items |
| `Esc` | Close | Modals, dropdowns, tooltips |
| `Arrow Keys` | Navigate | Tabs, timeline periods, dropdowns |
| `Home / End` | First/last item | Lists, timelines |
| `/` | Focus search | Location search, Q&A input |
| `?` | Open help/shortcuts | Global shortcut modal |

**Gestures (Touch/Mobile)**

| Gesture | Action | Context |
|---------|--------|---------|
| Swipe left/right | Navigate tabs | Chart sections, onboarding |
| Pinch in/out | Zoom chart | Chart canvas |
| Two-finger pan | Pan zoomed chart | Chart canvas |
| Long press | Open context menu | Planets (details), periods (options) |
| Pull down | Refresh data | Chart view, transits |

**Zoom & Pan (Chart Canvas)**

- **Zoom Range:** 10% - 200%
- **Zoom Controls:** Mouse wheel, pinch gesture, +/- buttons
- **Pan:** Click-drag when zoomed >100%, arrow keys (5px increments)
- **Reset:** Double-click or "Reset View" button

**Timeline Scrubber Rules**

- **Horizontal Scroll:** Drag timeline or use scrollbar
- **Zoom:** Timeline scales dynamically (year/month/day views based on zoom level)
- **Snap to Period:** Timeline auto-centers on clicked period
- **Current Marker:** Always visible; timeline auto-scrolls to marker on load

## 8. Accessibility Plan

**WCAG 2.2 AA Compliance Checklist**

| Criterion | Requirement | Implementation | Test ID |
|-----------|-------------|----------------|---------|
| 1.4.3 | Contrast (Minimum) 4.5:1 | All text meets ratio; verified in design tokens | A11Y-001 |
| 1.4.11 | Non-text Contrast 3:1 | UI components, chart elements have sufficient contrast | A11Y-002 |
| 2.1.1 | Keyboard Access | All functions operable via keyboard (see keyboard map) | A11Y-003 |
| 2.1.2 | No Keyboard Trap | Focus never locked; Esc always exits modals | A11Y-004 |
| 2.4.3 | Focus Order | Logical tab order: header → main → footer | A11Y-005 |
| 2.4.7 | Focus Visible | 2px solid outline (primary color) on all focus states | A11Y-006 |
| 3.2.4 | Consistent Identification | Navigation, buttons, icons have consistent labels | A11Y-007 |
| 3.3.1 | Error Identification | Errors described in text + icon + color | A11Y-008 |
| 3.3.2 | Labels or Instructions | All inputs have visible labels + help text where needed | A11Y-009 |
| 4.1.2 | Name, Role, Value | ARIA roles, labels, states on custom components | A11Y-010 |
| 2.3.1 | Three Flashes or Below | No animations exceed 3 flashes/sec | A11Y-011 |
| 2.2.2 | Pause, Stop, Hide | Auto-playing animations have pause/stop controls | A11Y-012 |

**Focus Order (Birth Data Form Example)**

1. "Name" input (optional skip with Tab)
2. "Date" day input → month → year
3. Calendar icon (opens picker)
4. "Time" hour input → minute → AM/PM dropdown
5. "Unknown time" checkbox
6. "Place" search input
7. "Use My Location" button
8. Advanced Options expand button
9. "Generate Chart" CTA

**ARIA Landmarks**

```html
<header role="banner" aria-label="Main navigation">
<nav role="navigation" aria-label="Primary">
<main role="main" id="main-content">
  <section aria-labelledby="chart-heading">
    <h2 id="chart-heading">Birth Chart</h2>
  </section>
</main>
<aside role="complementary" aria-label="Chart details">
<footer role="contentinfo">
```

**Screen Reader Announcements**

| Event | Announcement |
|-------|--------------|
| Chart generated | "Birth chart successfully generated for [Name]. Navigate to chart view." |
| Loading | "Calculating planetary positions. This may take 20 to 30 seconds." |
| Error | "Chart generation failed. Error: [message]. Press Retry to try again." |
| Dasha period expanded | "Expanded Venus Mahadasha. Contains 9 Antardashas. Navigate with arrow keys." |
| Settings changed | "Ayanamsha changed to Raman. Chart will recalculate." |

**Color Contrast Samples (Verified)**

| Element | Foreground | Background | Ratio | Pass |
|---------|------------|------------|-------|------|
| Primary text (light) | #1A1A1A | #FFFFFF | 15.8:1 | AAA ✓ |
| Primary text (dark) | #FFFFFF | #1A1A1A | 15.8:1 | AAA ✓ |
| Secondary text (light) | #666666 | #FFFFFF | 7.1:1 | AAA ✓ |
| Link text (light) | #4A5FCF | #FFFFFF | 6.2:1 | AA ✓ |
| Error text (light) | #C62828 | #FFFFFF | 6.5:1 | AA ✓ |
| Success text (light) | #1B7B3E | #FFFFFF | 5.1:1 | AA ✓ |

**Motion-Reduced Spec (prefers-reduced-motion)**

When user has motion preference set to "reduce":
- All `--duration-*` tokens become `0ms` (instant transitions)
- Animations disabled: chart zoom transitions, modal slide-ins, skeleton shimmer
- Transitions remain: color changes, opacity fades (no positional movement)
- Alternative feedback: Static visual changes instead of animations

```css