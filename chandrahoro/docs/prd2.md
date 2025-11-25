# Jyotish Drishti - Product Requirements Document (PRD)
## Enhancement & New Features

**Version:** 1.0  
**Date:** October 23, 2025  
**Status:** Draft for Development  
**Product Name:** Jyotish Drishti (evolved from ChandraHoro)  
**Type:** Web Application (Responsive UI)

---

## Executive Summary

This PRD defines the enhancement requirements to evolve ChandraHoro (currently 75% complete MVP) into Jyotish Drishti - a comprehensive astrological decision-support portal. The enhancement focuses on adding predictive analytics, calibration mechanisms, synergy analysis, corporate modules, and experimental market research capabilities.

**Bottom Line:** Transform from a chart generation tool to a decision-support system with intensity-based predictions (1-10 scale), calibration tracking, multi-user synergy analysis, and research-grade market backtesting.

---

## Table of Contents

1. [Gap Analysis Overview](#1-gap-analysis-overview)
2. [Vision & Objectives](#2-vision--objectives)
3. [Feature Enhancement Roadmap](#3-feature-enhancement-roadmap)
4. [Module 1: Individual Enhancement](#4-module-1-individual-enhancement)
5. [Module 2: Partner & Family Synergy](#5-module-2-partner--family-synergy)
6. [Module 3: Corporate Module](#6-module-3-corporate-module)
7. [Module 4: ShareMarks Research](#7-module-4-sharemarks-research)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Model](#9-data-model)
10. [API Specifications](#10-api-specifications)
11. [UI/UX Requirements](#11-uiux-requirements)
12. [Security & Compliance](#12-security--compliance)
13. [Implementation Phases](#13-implementation-phases)
14. [Success Metrics](#14-success-metrics)
15. [Appendix](#15-appendix)

---

## 1. Gap Analysis Overview

### 1.1 Current State (ChandraHoro v0.1.0)

**Implemented (46 features):**
- ✅ Core astrological calculations (Ephemeris, Houses, Dasha, Divisional Charts)
- ✅ Strength analysis (Shadbala, Ashtakavarga)
- ✅ Yoga detection (50+ yogas)
- ✅ Chart visualization (North & South Indian styles)
- ✅ Export capabilities (PDF, PNG, SVG, JSON)
- ✅ AI-powered interpretations
- ✅ Responsive UI with dark mode

**Partially Implemented (4 features):**
- ⏳ Transit comparison (UI ready, needs database)
- ⏳ User authentication (UI only, logic missing)
- ⏳ Shareable links (component created, backend pending)
- ⏳ Chart persistence (localStorage only)

**Planned but Not Started (11 features):**
- 📋 User management & chart history
- 📋 Extended divisional charts (D2-D60)
- 📋 Alternative dasha systems
- 📋 Prashna & Muhurta

### 1.2 Required State (Jyotish Drishti)

**New Modules Required:**
1. **Intensity-Based Prediction Engine** - Life aspects scored 1-10 over time
2. **Calibration System** - Compare user beliefs vs model predictions
3. **Journaling & Tracking** - User input for calibration refinement
4. **Partner/Family Synergy** - Multi-profile overlay and compatibility scoring
5. **Corporate Module** - Strength assessment, role fit, team synergy
6. **ShareMarks Research** - Market backtesting with astrological features

### 1.3 Gap Summary

| Category | Current | Required | Gap |
|----------|---------|----------|-----|
| User System | None | RBAC, Multi-tenant, MFA | HIGH |
| Prediction Engine | None | Aspect intensity scoring (1-10) | HIGH |
| Time-series Analysis | Partial (Dasha) | Full Dasha/Antardasha with intensities | MEDIUM |
| Calibration | None | Self-rating vs model comparison | HIGH |
| Journaling | None | Event tracking, tagging, analysis | HIGH |
| Multi-profile | None | Family/partner overlay & synergy | HIGH |
| Corporate Features | None | Role fit, team synergy, shortlists | HIGH |
| Market Research | None | Stock universe, backtest pipeline | HIGH |
| Database | None (localStorage) | MySQL 8.0+ with Prisma ORM | HIGH |

---

## 2. Vision & Objectives

### 2.1 Vision Statement

> "Turn uncertainty into calibrated, trackable expectations by mapping life aspects on a 1-10 intensity scale over time, enabling individuals, families, and organizations to make informed decisions with transparent astrological insights."

### 2.2 Core Philosophy

**"Predictability gives peace of mind; unpredictability pieces of mind."**

The application provides:
- Historical context (where you've been)
- Current state (where you are)
- Future trajectory (where you're going)
- Calibration mechanism (how accurate predictions are)

### 2.3 Key Objectives

1. **Transparency** - Show factor contributions to every score
2. **Calibration** - Learn from user feedback to improve predictions
3. **Multi-dimensional** - Support individual, family, and corporate use cases
4. **Research-grade** - Experimental features with proper disclaimers
5. **Privacy-first** - Consent-based, encrypted, minimal data collection
6. **Ethical** - Avoid determinism, provide ranges and confidence levels

---

## 3. Feature Enhancement Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Focus:** User system, database, core prediction engine

- User authentication & RBAC
- Database schema & migrations
- Aspect intensity calculation engine
- Basic timeline visualization

### Phase 2: Individual Module (Weeks 5-8)
**Focus:** Strength assessment, calibration, journaling

- Strength attribute scoring
- Life aspect predictions (1-10 scale)
- Calibration system
- Journaling with tags
- Timeline dashboard

### Phase 3: Synergy & Corporate (Weeks 9-12)
**Focus:** Multi-profile analysis

- Partner/family profile linking
- Synergy calculation engine
- Corporate candidate assessment
- Role fit mapping
- Team synergy analysis

### Phase 4: ShareMarks Research (Weeks 13-16)
**Focus:** Market research module

- Stock universe management
- Horoscope generation for stocks
- Feature extraction pipeline
- Backtesting engine
- Research dashboards

### Phase 5: Polish & Launch (Weeks 17-20)
**Focus:** Optimization, documentation, deployment

- Performance optimization
- Security audit
- Documentation
- Beta testing
- Production deployment

---

## 4. Module 1: Individual Enhancement

### 4.1 Overview

Transform the current single-use chart generator into a personalized, calibrated prediction system that tracks life aspects over time.

### 4.2 Strength Assessment

#### 4.2.1 Attributes

Track the following strength attributes on a 1-10 scale:

| Attribute | Description | Astrological Factors |
|-----------|-------------|---------------------|
| **Risk-Taking Ability** | Willingness to take calculated risks | 5th house strength, Mars placement, Rahu influence |
| **Loyalty** | Commitment and steadfastness | Venus, 7th house, Jupiter aspects |
| **Honesty** | Truthfulness and integrity | Sun strength, Jupiter placement, 9th house |
| **Hardworking** | Work ethic and perseverance | Saturn placement, 10th house strength, Mars aspects |
| **Logical** | Analytical and rational thinking | Mercury strength, 3rd house, Ketu aspects |
| **Creativity** | Innovative and artistic ability | Venus, 5th house, Moon placement |
| **Leadership** | Ability to guide and inspire | Sun strength, Leo influence, 10th house |
| **Adaptability** | Flexibility in changing situations | Mercury, Gemini/Virgo influence, 3rd house |

#### 4.2.2 Calculation Methodology

```python
def calculate_strength_attribute(attribute, birth_chart):
    """
    Calculate strength attribute score (1-10)
    
    Factors:
    - Primary planet strength (Shadbala)
    - House strength (Bhava Bala)
    - Aspects and yogas
    - Dignity (exaltation/debilitation)
    - Dasha influence
    """
    base_score = get_base_score(attribute, birth_chart)
    planetary_modifier = get_planetary_strength(attribute, birth_chart)
    house_modifier = get_house_strength(attribute, birth_chart)
    yoga_modifier = get_yoga_influence(attribute, birth_chart)
    dasha_modifier = get_dasha_influence(attribute, birth_chart)
    
    raw_score = (base_score * 0.3 + 
                 planetary_modifier * 0.3 + 
                 house_modifier * 0.2 + 
                 yoga_modifier * 0.1 + 
                 dasha_modifier * 0.1)
    
    # Normalize to 1-10 scale
    return min(10, max(1, round(raw_score, 1)))
```

### 4.3 Life Aspect Predictions

#### 4.3.1 Aspects Tracked

| Aspect | Description | Primary Houses | Key Planets |
|--------|-------------|----------------|-------------|
| **Wealth** | Financial prosperity | 2, 11, 9 | Jupiter, Venus, Mercury |
| **Health** | Physical well-being | 1, 6, 8 | Sun, Mars, Moon |
| **Business** | Entrepreneurial success | 5, 10, 11 | Mercury, Mars, Saturn |
| **Relationship with Spouse** | Marital harmony | 7, 8, 12 | Venus, Jupiter, Moon |
| **Relationship with Kids** | Parent-child bond | 5, 9, 11 | Jupiter, Moon, Sun |
| **Career** | Professional growth | 10, 2, 11 | Saturn, Sun, Mercury |

#### 4.3.2 Intensity Calculation Over Time

**Timeline:** Map intensity across Dasha/Antardasha periods

```python
def calculate_aspect_intensity(aspect, birth_chart, start_date, end_date):
    """
    Calculate aspect intensity (1-10) for a date range
    
    Returns:
    - Timeline data: [(date, intensity, factors), ...]
    - Confidence band: upper and lower bounds
    - Key events: [(date, description), ...]
    """
    timeline = []
    dasha_periods = get_dasha_periods(birth_chart, start_date, end_date)
    
    for period in dasha_periods:
        # Calculate intensity for this dasha period
        base_intensity = calculate_base_intensity(aspect, period)
        transit_impact = calculate_transit_impact(aspect, period)
        yoga_impact = calculate_yoga_impact(aspect, period)
        
        intensity = (base_intensity * 0.5 + 
                    transit_impact * 0.3 + 
                    yoga_impact * 0.2)
        
        # Calculate confidence band (±0.5 to ±2.0)
        confidence = calculate_confidence(aspect, period)
        
        timeline.append({
            'date': period.start_date,
            'intensity': round(intensity, 1),
            'confidence_lower': round(intensity - confidence, 1),
            'confidence_upper': round(intensity + confidence, 1),
            'factors': get_contributing_factors(aspect, period)
        })
    
    return timeline
```

#### 4.3.3 Detailed Reasoning Output

For each aspect intensity score, provide:

1. **Primary Factors** (house strengths, planet positions)
2. **Dasha Influence** (current Mahadasha/Antardasha)
3. **Transit Effects** (major planet transits)
4. **Yoga Contributions** (active yogas in the period)
5. **Historical Pattern** (similar periods in the past)

### 4.4 Calibration System

#### 4.4.1 User Self-Rating

Allow users to enter their current perception:

```typescript
interface SelfRating {
  userId: string;
  aspect: LifeAspect;
  selfScore: number; // 1-10
  modelScore: number; // calculated
  date: Date;
  notes?: string;
  tags?: string[];
}
```

#### 4.4.2 Calibration Factor Calculation

```python
def calculate_calibration_factor(user_id, aspect):
    """
    Calculate calibration factor for user's aspect predictions
    
    Formula: CF = avg(user_score / model_score) over time
    
    Returns:
    - calibration_factor: multiplicative adjustment
    - confidence: how reliable the calibration is
    - sample_size: number of data points
    - trend: improving/declining/stable
    """
    ratings = get_user_ratings(user_id, aspect)
    
    if len(ratings) < 3:
        return {
            'calibration_factor': 1.0,
            'confidence': 'low',
            'sample_size': len(ratings),
            'trend': 'insufficient_data'
        }
    
    ratios = [r.self_score / r.model_score for r in ratings if r.model_score > 0]
    calibration_factor = sum(ratios) / len(ratios)
    
    # Calculate trend (last 5 vs previous 5)
    recent_avg = sum(ratios[-5:]) / min(5, len(ratios[-5:]))
    older_avg = sum(ratios[:-5]) / max(1, len(ratios[:-5]))
    trend = 'improving' if recent_avg > older_avg * 1.1 else 'stable'
    
    return {
        'calibration_factor': round(calibration_factor, 2),
        'confidence': 'high' if len(ratings) > 20 else 'medium',
        'sample_size': len(ratings),
        'trend': trend,
        'rmse': calculate_rmse(ratings)
    }
```

#### 4.4.3 Calibrated Predictions

Apply calibration factor to future predictions:

```python
def get_calibrated_prediction(user_id, aspect, date):
    """
    Get calibrated prediction for future date
    """
    base_prediction = calculate_aspect_intensity(aspect, date)
    calibration = get_calibration_factor(user_id, aspect)
    
    calibrated_score = base_prediction * calibration.factor
    
    return {
        'date': date,
        'raw_prediction': base_prediction,
        'calibrated_prediction': calibrated_score,
        'calibration_factor': calibration.factor,
        'confidence': calibration.confidence
    }
```

### 4.5 Journaling System

#### 4.5.1 Journal Entry Structure

```typescript
interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'event';
  aspects: {
    [key in LifeAspect]?: {
      rating: number;
      notes: string;
    }
  };
  events: Event[];
  mood: string;
  tags: string[];
  attachments?: string[];
}

interface Event {
  title: string;
  category: EventCategory;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
  relatedAspects: LifeAspect[];
}
```

#### 4.5.2 Features

1. **Quick Entry** - Simple form for daily updates
2. **Event Tracking** - Tag significant life events
3. **Aspect Rating** - Rate multiple aspects per entry
4. **Tags & Search** - Categorize and find entries
5. **Analytics** - Visualize patterns over time
6. **Reminders** - Configurable notifications to journal

### 4.6 Timeline Visualization

#### 4.6.1 Multi-Aspect Timeline

Display multiple life aspects on a single timeline:

- X-axis: Time (years/months)
- Y-axis: Intensity (1-10)
- Multiple lines for different aspects
- Confidence bands (shaded areas)
- Markers for significant events
- Dasha period separators

#### 4.6.2 Interactive Features

- Zoom in/out
- Toggle aspects on/off
- Hover for detailed factors
- Click to add journal entry
- Export as image or PDF

### 4.7 Comparison Dashboard

Show side-by-side comparison:

| Aspect | Current Model | Your Self-Rating | Calibration Factor | Historical Accuracy |
|--------|---------------|------------------|-------------------|---------------------|
| Wealth | 7.5 | 8.0 | 1.07 | 85% |
| Health | 6.0 | 5.5 | 0.92 | 78% |
| Career | 8.0 | 7.5 | 0.94 | 82% |

---

## 5. Module 2: Partner & Family Synergy

### 5.1 Overview

Enable users to:
1. Link multiple profiles (partner, children, family members)
2. Overlay aspect timelines
3. Calculate synergy indices
4. Identify alignment and friction windows

### 5.2 Profile Linking

#### 5.2.1 Relationship Types

```typescript
enum RelationType {
  SPOUSE = 'spouse',
  PARTNER = 'partner',
  CHILD = 'child',
  PARENT = 'parent',
  SIBLING = 'sibling',
  FRIEND = 'friend',
  BUSINESS_PARTNER = 'business_partner'
}

interface ProfileLink {
  primaryUserId: string;
  linkedUserId: string;
  relationship: RelationType;
  since: Date;
  status: 'active' | 'inactive';
  notes?: string;
}
```

### 5.3 Synergy Calculation

#### 5.3.1 Compatibility Scoring

Calculate compatibility based on:

1. **House Synergy** - Key house alignments
   - 2nd (wealth), 5th (children), 7th (partnership)
   - 9th (fortune), 10th (career), 11th (gains)

2. **Planetary Affinity**
   - Venus-Mars alignment (romantic compatibility)
   - Moon-Moon harmony (emotional compatibility)
   - Mercury compatibility (communication)
   - Jupiter aspects (overall harmony)

3. **Strength Match** - Compare strength attributes
   - Complementary strengths vs similar strengths
   - Balance vs imbalance assessment

```python
def calculate_synergy_index(profile1, profile2):
    """
    Calculate overall synergy index (0-100)
    
    Components:
    - House synergy (30%)
    - Planetary compatibility (30%)
    - Strength alignment (20%)
    - Dasha alignment (10%)
    - Yoga compatibility (10%)
    """
    house_score = calculate_house_synergy(profile1, profile2)
    planet_score = calculate_planetary_compatibility(profile1, profile2)
    strength_score = calculate_strength_alignment(profile1, profile2)
    dasha_score = calculate_dasha_alignment(profile1, profile2)
    yoga_score = calculate_yoga_compatibility(profile1, profile2)
    
    synergy_index = (
        house_score * 0.30 +
        planet_score * 0.30 +
        strength_score * 0.20 +
        dasha_score * 0.10 +
        yoga_score * 0.10
    )
    
    return {
        'overall_synergy': round(synergy_index, 1),
        'breakdown': {
            'house_synergy': house_score,
            'planetary_compatibility': planet_score,
            'strength_alignment': strength_score,
            'dasha_alignment': dasha_score,
            'yoga_compatibility': yoga_score
        },
        'interpretation': get_synergy_interpretation(synergy_index)
    }
```

#### 5.3.2 Timeline Overlay

Overlay aspect timelines for 2+ profiles:

```typescript
interface SynergyTimeline {
  dateRange: [Date, Date];
  profiles: ProfileInfo[];
  aspects: {
    [key in LifeAspect]: {
      profiles: {
        [userId: string]: TimelinePoint[];
      };
      alignment: AlignmentWindow[];
    }
  };
}

interface AlignmentWindow {
  startDate: Date;
  endDate: Date;
  type: 'high_alignment' | 'moderate_alignment' | 'friction';
  score: number;
  factors: string[];
}
```

### 5.4 Alignment & Friction Windows

#### 5.4.1 Detection Algorithm

```python
def detect_alignment_windows(profile1_timeline, profile2_timeline, threshold=1.5):
    """
    Detect windows of alignment and friction
    
    Alignment: when both profiles have similar intensity trends
    Friction: when profiles have opposing trends
    """
    windows = []
    
    for i in range(len(profile1_timeline)):
        p1_intensity = profile1_timeline[i].intensity
        p2_intensity = profile2_timeline[i].intensity
        
        # Calculate difference and trend
        difference = abs(p1_intensity - p2_intensity)
        
        if difference < threshold:
            # High alignment
            type = 'high_alignment'
            score = 10 - difference
        elif difference < threshold * 2:
            # Moderate alignment
            type = 'moderate_alignment'
            score = 10 - difference * 0.5
        else:
            # Friction
            type = 'friction'
            score = difference
        
        windows.append({
            'date': profile1_timeline[i].date,
            'type': type,
            'score': round(score, 1),
            'p1_intensity': p1_intensity,
            'p2_intensity': p2_intensity,
            'factors': get_alignment_factors(profile1_timeline[i], profile2_timeline[i])
        })
    
    # Merge consecutive windows of same type
    return merge_windows(windows)
```

### 5.5 Export & Reports

Generate synergy reports:
- Overall compatibility score
- Strength comparison matrix
- Timeline overlays for all aspects
- Alignment windows calendar
- Recommendations for high-synergy periods

---

## 6. Module 3: Corporate Module

### 6.1 Overview

Enable HR and managers to:
1. Assess candidate/employee strengths
2. Match candidates to role requirements
3. Evaluate team synergy
4. Maintain shortlists and pipelines

### 6.2 Role Definition System

#### 6.2.1 Role Structure

```typescript
interface Role {
  id: string;
  title: string;
  department: string;
  level: 'entry' | 'mid' | 'senior' | 'executive';
  requiredStrengths: {
    [key in StrengthAttribute]: {
      weight: number; // 0-10
      minimumScore: number; // 1-10
    }
  };
  description: string;
  tags: string[];
}
```

#### 6.2.2 Predefined Role Templates

```typescript
const ROLE_TEMPLATES = {
  FINANCE_OPS: {
    title: 'Finance Operations',
    strengths: {
      honesty: { weight: 10, minimum: 7 },
      loyalty: { weight: 8, minimum: 7 },
      hardworking: { weight: 7, minimum: 6 },
      logical: { weight: 8, minimum: 7 },
      riskTaking: { weight: 3, minimum: 3 }
    }
  },
  SALES_EXECUTIVE: {
    title: 'Sales Executive',
    strengths: {
      riskTaking: { weight: 9, minimum: 7 },
      adaptability: { weight: 8, minimum: 7 },
      hardworking: { weight: 8, minimum: 6 },
      loyalty: { weight: 6, minimum: 5 },
      honesty: { weight: 7, minimum: 6 }
    }
  },
  CREATIVE_DESIGNER: {
    title: 'Creative Designer',
    strengths: {
      creativity: { weight: 10, minimum: 7 },
      adaptability: { weight: 7, minimum: 6 },
      logical: { weight: 6, minimum: 5 },
      hardworking: { weight: 7, minimum: 6 },
      riskTaking: { weight: 6, minimum: 5 }
    }
  }
  // Add more templates...
};
```

### 6.3 Candidate Assessment

#### 6.3.1 Strength Scoring for Candidates

```python
def assess_candidate(birth_chart, role):
    """
    Assess candidate fit for specific role
    
    Returns:
    - overall_fit_score: 0-100
    - strength_scores: individual strength ratings
    - role_match: how well strengths align with role
    - recommendations: hiring decision support
    """
    # Calculate all strength attributes
    strength_scores = {}
    for attribute in StrengthAttribute:
        strength_scores[attribute] = calculate_strength_attribute(attribute, birth_chart)
    
    # Calculate role fit
    role_fit = 0
    total_weight = 0
    gaps = []
    
    for attribute, requirements in role.required_strengths.items():
        candidate_score = strength_scores[attribute]
        weight = requirements.weight
        minimum = requirements.minimum_score
        
        # Score component
        if candidate_score >= minimum:
            component_score = (candidate_score / 10) * weight
        else:
            # Penalty for below minimum
            gap = minimum - candidate_score
            component_score = max(0, (candidate_score / 10) * weight - gap)
            gaps.append({
                'attribute': attribute,
                'required': minimum,
                'actual': candidate_score,
                'gap': gap
            })
        
        role_fit += component_score
        total_weight += weight
    
    overall_fit = (role_fit / total_weight) * 100 if total_weight > 0 else 0
    
    return {
        'overall_fit_score': round(overall_fit, 1),
        'strength_scores': strength_scores,
        'gaps': gaps,
        'recommendation': get_hiring_recommendation(overall_fit, gaps)
    }
```

#### 6.3.2 Hiring Recommendation Logic

```python
def get_hiring_recommendation(overall_fit, gaps):
    """
    Generate hiring recommendation
    """
    if overall_fit >= 85 and len(gaps) == 0:
        return {
            'decision': 'strong_hire',
            'confidence': 'high',
            'rationale': 'Excellent fit across all key attributes'
        }
    elif overall_fit >= 70 and len([g for g in gaps if g['gap'] > 2]) == 0:
        return {
            'decision': 'hire',
            'confidence': 'medium-high',
            'rationale': 'Good overall fit with manageable gaps'
        }
    elif overall_fit >= 55:
        return {
            'decision': 'conditional_hire',
            'confidence': 'medium',
            'rationale': 'Acceptable fit but requires development in key areas',
            'development_areas': [g['attribute'] for g in gaps]
        }
    else:
        return {
            'decision': 'not_recommended',
            'confidence': 'high',
            'rationale': 'Significant gaps in critical attributes'
        }
```

### 6.4 Team Synergy Analysis

#### 6.4.1 Team Composition

```typescript
interface Team {
  id: string;
  name: string;
  manager: string;
  members: TeamMember[];
  roles: Role[];
  projects: Project[];
}

interface TeamMember {
  userId: string;
  role: Role;
  joinedDate: Date;
  strengthProfile: StrengthProfile;
}
```

#### 6.4.2 Team Synergy Calculation

```python
def calculate_team_synergy(team, new_candidate=None):
    """
    Calculate team synergy score
    
    Factors:
    - Strength diversity (complementary skills)
    - Collaboration compatibility
    - Leadership-team fit
    - Potential friction points
    """
    members = team.members + ([new_candidate] if new_candidate else [])
    
    # Diversity score (higher is better for complementary teams)
    diversity_score = calculate_strength_diversity(members)
    
    # Pairwise compatibility
    compatibility_matrix = []
    for i, m1 in enumerate(members):
        for j, m2 in enumerate(members[i+1:], i+1):
            compat = calculate_pairwise_compatibility(m1, m2)
            compatibility_matrix.append(compat)
    
    avg_compatibility = sum(compatibility_matrix) / len(compatibility_matrix)
    
    # Leadership fit (if manager exists)
    leadership_fit = calculate_leadership_fit(team.manager, members)
    
    # Overall synergy
    synergy_score = (
        diversity_score * 0.30 +
        avg_compatibility * 0.40 +
        leadership_fit * 0.30
    )
    
    return {
        'overall_synergy': round(synergy_score, 1),
        'diversity_score': diversity_score,
        'avg_compatibility': avg_compatibility,
        'leadership_fit': leadership_fit,
        'friction_points': identify_friction_points(compatibility_matrix),
        'recommendations': generate_team_recommendations(synergy_score)
    }
```

### 6.5 Shortlist Management

#### 6.5.1 Candidate Pipeline

```typescript
enum CandidateStatus {
  SOURCED = 'sourced',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  ASSESSMENT = 'assessment',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected'
}

interface Candidate {
  id: string;
  name: string;
  birthData: BirthData;
  strengthProfile: StrengthProfile;
  targetRole: Role;
  fitScore: number;
  status: CandidateStatus;
  notes: Note[];
  interviews: Interview[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 6.5.2 Filtering & Sorting

Allow managers to:
- Filter by role fit score (e.g., >70)
- Filter by specific strengths (e.g., honesty >7)
- Sort by overall fit, individual strengths
- Tag candidates (high-potential, needs-development, etc.)
- Export shortlists to CSV/Excel

### 6.6 Corporate Dashboard

Display:
1. **Pipeline Overview** - Candidates by stage
2. **Role Fit Distribution** - Histogram of fit scores
3. **Strength Heatmap** - All candidates' strengths
4. **Team Synergy** - Current team composition
5. **Recommendations** - Top candidates for each role

### 6.7 Compliance & Ethics

#### 6.7.1 Consent Management

```typescript
interface CandidateConsent {
  candidateId: string;
  consentDate: Date;
  consentType: 'explicit' | 'implied';
  purpose: string;
  dataCategories: string[];
  retentionPeriod: number; // days
  withdrawalDate?: Date;
}
```

#### 6.7.2 Privacy Controls

- Minimize PII collection
- Encrypt birth data at rest
- Provide data export (GDPR)
- Provide right to deletion
- Audit log all access

#### 6.7.3 Bias Mitigation

- Avoid protected class inferences (age, gender, race)
- Transparent scoring methodology
- Human-in-the-loop for final decisions
- Regular bias audits

---

## 7. Module 4: ShareMarks Research

### 7.1 Overview

**Purpose:** Experimental, research-only module to correlate astrological features with market outcomes

**Critical Disclaimers:**
- NOT investment advice
- For educational/research purposes only
- No trading execution
- High uncertainty and risk

### 7.2 Stock Universe Management

#### 7.2.1 Universe Definition

```typescript
interface StockUniverse {
  id: string;
  name: string;
  description: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  stocks: Stock[];
  category: 'top_100' | 'bottom_100' | 'average_100' | 'custom';
  updatedAt: Date;
}

interface Stock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  marketCap?: number;
  addedDate: Date;
}
```

#### 7.2.2 Predefined Universes

```typescript
const DEFAULT_UNIVERSES = {
  NSE_TOP_100: {
    name: 'NSE Top 100 by Market Cap',
    exchange: 'NSE',
    category: 'top_100',
    tickers: ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', ...] // Top 100
  },
  NSE_BOTTOM_100: {
    name: 'NSE Bottom 100 by Market Cap',
    exchange: 'NSE',
    category: 'bottom_100',
    tickers: [...] // Bottom 100
  },
  NSE_AVERAGE_100: {
    name: 'NSE Average 100 by Market Cap',
    exchange: 'NSE',
    category: 'average_100',
    tickers: [...] // Middle 100
  }
};
```

### 7.3 Research Session

#### 7.3.1 Session Structure

```typescript
interface ResearchSession {
  id: string;
  userId: string;
  name: string;
  description: string;
  universe: StockUniverse;
  parameters: SessionParameters;
  results: SessionResult[];
  status: 'created' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

interface SessionParameters {
  seed: number; // For reproducibility
  dateRange: [Date, Date]; // Random date range
  timeRange: [string, string]; // e.g., ['00:00', '23:59']
  location: Location; // Random or fixed
  featureWeights: FeatureWeights;
  horizons: number[]; // e.g., [1, 5, 20] days
}
```

#### 7.3.2 Randomization for Backtesting

```python
def generate_random_horoscope_params(seed, date_range, time_range):
    """
    Generate random parameters for horoscope generation
    
    Uses seed for reproducibility
    """
    random.seed(seed)
    
    # Random date between date_range
    start_timestamp = date_range[0].timestamp()
    end_timestamp = date_range[1].timestamp()
    random_timestamp = random.uniform(start_timestamp, end_timestamp)
    random_date = datetime.fromtimestamp(random_timestamp)
    
    # Random time
    start_hour, start_min = map(int, time_range[0].split(':'))
    end_hour, end_min = map(int, time_range[1].split(':'))
    random_hour = random.randint(start_hour, end_hour)
    random_min = random.randint(0, 59)
    random_time = f"{random_hour:02d}:{random_min:02d}"
    
    # Random location (from predefined list)
    random_location = random.choice(LOCATIONS)
    
    return {
        'date': random_date,
        'time': random_time,
        'location': random_location
    }
```

### 7.4 Astrological Feature Extraction

#### 7.4.1 House Features

Focus on houses relevant to speculation and gains:

| House | Significance | Scoring |
|-------|--------------|---------|
| **2nd** | Accumulated wealth | Strength + lord placement |
| **5th** | Speculation, risk-taking | Strength + connections to 2nd/11th |
| **8th** | Sudden gains/losses, volatility | Strength (caution indicator) |
| **9th** | Luck, fortune | Strength + Jupiter influence |
| **10th** | Profession, career | Strength + connections to 5th/11th |
| **11th** | Income, gains | Strength + planetary yogas |
| **12th** | Losses, expenses | Weakness preferred |

#### 7.4.2 Planetary Features

Key planets for market analysis:

| Planet | Significance | Scoring |
|--------|--------------|---------|
| **Mercury** | Analysis, trading acumen | Strength + placement |
| **Jupiter** | Wealth, expansion | Strength + aspects to 2/5/11 |
| **Rahu** | Leverage, big swings | Position + aspects |
| **Moon** | Sentiment, speed | Strength + placement |
| **Venus** | Prosperity | Strength + dignity |
| **Mars** | Energy, action | Strength (moderate) |

#### 7.4.3 Supportive Yogas

Identify positive configurations:

1. **2-5-11 Network** - Connections among wealth houses
2. **Parivartan Yoga (2-11)** - Exchange of 2nd and 11th lords
3. **Dharma-Karma-Adhipati Yoga** - 9th-10th lord connection
4. **Jupiter in Lagna** - With favorable aspects
5. **5th in 2nd** - Speculation supporting wealth
6. **10th in 5th/11th** - Career in speculation

#### 7.4.4 Negative Configurations

Risk indicators:

1. **8th House Entanglement** - 8th lord affecting 2/5/10
2. **12th House Losses** - Strong 12th or 2-12 linkage
3. **6-8-12 Trik Houses** - Emphasis on dusthana
4. **Afflicted Moon** - Weak or afflicted mind/sentiment
5. **Sun-Rahu in 1/5/9** - Without Jupiter's saving grace

#### 7.4.5 Timing Cues

Dasha and transit triggers:

1. **Dasha of 5/9/10/11 Lords** - Favorable periods
2. **Double Transit on 2/5/9/10/11** - Jupiter + Saturn
3. **Eclipse Triggers** - On sensitive points
4. **Nodal Transits** - Rahu/Ketu over key planets
5. **8th House Triggers** - For entry/exit timing

### 7.5 Feature Aggregation & Scoring

#### 7.5.1 Weighted Score Formula

```python
def calculate_stock_astro_score(horoscope, weights):
    """
    Calculate aggregated astrological score (0-1)
    
    S = (Σ wi × fi) / (Σ wi)
    
    where:
    - wi = user-configurable weight for feature i
    - fi = normalized feature score (0-1)
    """
    features = {}
    
    # House features
    for house_num in [2, 5, 8, 9, 10, 11, 12]:
        features[f'house_{house_num}'] = calculate_house_feature(horoscope, house_num)
    
    # Planetary features
    for planet in ['mercury', 'jupiter', 'rahu', 'moon', 'venus', 'mars']:
        features[f'planet_{planet}'] = calculate_planet_feature(horoscope, planet)
    
    # Yoga features
    features['supportive_yogas'] = count_supportive_yogas(horoscope)
    features['negative_configs'] = count_negative_configs(horoscope)
    
    # Timing features
    features['dasha_favorability'] = calculate_dasha_favorability(horoscope)
    features['transit_support'] = calculate_transit_support(horoscope)
    
    # Weighted aggregation
    weighted_sum = 0
    total_weight = 0
    
    for feature_name, feature_value in features.items():
        weight = weights.get(feature_name, 1.0)
        weighted_sum += weight * feature_value
        total_weight += weight
    
    score = weighted_sum / total_weight if total_weight > 0 else 0.5
    
    return {
        'aggregate_score': round(score, 3),
        'features': features,
        'weights': weights,
        'interpretation': interpret_score(score)
    }
```

#### 7.5.2 AI-Assisted Scoring

```python
def get_ai_assisted_score(horoscope, features):
    """
    Use AI to generate score with explainability
    """
    prompt = f"""
    Given the following astrological features for a stock horoscope:
    {json.dumps(features, indent=2)}
    
    Provide:
    1. Overall score (0-1)
    2. Top 3 positive factors
    3. Top 3 risk factors
    4. Confidence level
    5. Reasoning
    
    Return as JSON.
    """
    
    ai_response = call_llm_api(prompt)
    
    return {
        'ai_score': ai_response['score'],
        'positive_factors': ai_response['positive_factors'],
        'risk_factors': ai_response['risk_factors'],
        'confidence': ai_response['confidence'],
        'reasoning': ai_response['reasoning']
    }
```

### 7.6 Outcome Tracking

#### 7.6.1 Price Data Fetching

```python
def fetch_stock_prices(ticker, dates):
    """
    Fetch historical stock prices
    
    Returns OHLC data for specified dates
    """
    prices = {}
    
    for date in dates:
        try:
            price_data = market_api.get_historical(ticker, date)
            prices[date] = {
                'open': price_data.open,
                'high': price_data.high,
                'low': price_data.low,
                'close': price_data.close,
                'volume': price_data.volume
            }
        except Exception as e:
            prices[date] = None
    
    return prices
```

#### 7.6.2 Return Calculation

```python
def calculate_returns(processing_date_price, horizon_prices):
    """
    Calculate returns over different horizons
    
    Returns:
    - returns: {horizon: return_pct}
    - direction: 'up' | 'down' | 'flat'
    """
    base_price = processing_date_price['close']
    returns = {}
    
    for horizon, price_data in horizon_prices.items():
        if price_data:
            future_price = price_data['close']
            return_pct = ((future_price - base_price) / base_price) * 100
            returns[f'T+{horizon}'] = round(return_pct, 2)
    
    # Overall direction
    avg_return = sum(returns.values()) / len(returns) if returns else 0
    direction = 'up' if avg_return > 0.5 else ('down' if avg_return < -0.5 else 'flat')
    
    return {
        'returns': returns,
        'avg_return': round(avg_return, 2),
        'direction': direction
    }
```

#### 7.6.3 Prediction Accuracy

```python
def evaluate_prediction_accuracy(predictions, actuals):
    """
    Calculate accuracy metrics
    
    Metrics:
    - Hit rate (% correct direction predictions)
    - RMSE (root mean squared error)
    - Sharpe ratio
    - Maximum drawdown
    """
    correct_directions = 0
    squared_errors = []
    
    for pred, actual in zip(predictions, actuals):
        # Direction accuracy
        pred_direction = 'up' if pred.score > 0.5 else 'down'
        actual_direction = 'up' if actual.return_pct > 0 else 'down'
        
        if pred_direction == actual_direction:
            correct_directions += 1
        
        # Error calculation (treating score as probability)
        expected_return = (pred.score - 0.5) * 100  # -50% to +50%
        error = (expected_return - actual.return_pct) ** 2
        squared_errors.append(error)
    
    hit_rate = (correct_directions / len(predictions)) * 100
    rmse = (sum(squared_errors) / len(squared_errors)) ** 0.5
    
    return {
        'hit_rate': round(hit_rate, 1),
        'rmse': round(rmse, 2),
        'sample_size': len(predictions),
        'correct_predictions': correct_directions
    }
```

### 7.7 Research Dashboards

#### 7.7.1 Session Dashboard

Display for each session:

1. **Overview**
   - Session name, date, status
   - Universe (which stocks)
   - Parameters (seed, date range, weights)

2. **Prediction Leaderboard**
   - Top 10 stocks by score
   - Bottom 10 stocks by score
   - Score distribution histogram

3. **Outcome Tracking**
   - Predictions vs actuals table
   - Accuracy metrics (hit rate, RMSE)
   - Return distribution

4. **Feature Analysis**
   - Most important features
   - Feature correlation with returns
   - Feature weight sensitivity

#### 7.7.2 Multi-Session Comparison

Compare multiple sessions:
- Hit rate trends over time
- Weight configuration impact
- Universe performance differences
- Best-performing features

### 7.8 Export Capabilities

Export research data:

1. **Session Export** - JSON with all session data
2. **Results CSV** - Ticker, Score, Features, Actual Returns
3. **Analysis Report** - PDF with charts and insights
4. **Feature Matrix** - Excel with all features for all stocks

### 7.9 Disclaimers & Safety

#### 7.9.1 Prominent Disclaimers

Display on every page:

```
⚠️ RESEARCH ONLY - NOT INVESTMENT ADVICE

This module is for educational and research purposes only. 
Astrological predictions have high uncertainty and should not 
be used as the sole basis for investment decisions. Past 
performance does not guarantee future results. You are 
responsible for your own investment decisions and any losses.

Markets involve significant risk of capital loss.
```

#### 7.9.2 Feature Gating

- Require explicit opt-in with checkbox
- Quiz on risk understanding
- Disable execution features (no buy/sell buttons)
- Rate limit session creation
- Watermark all exports as "RESEARCH ONLY"

---

## 8. Technical Architecture

### 8.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Individual│  │  Synergy │  │Corporate │  │ShareMarks│   │
│  │ Module   │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (FastAPI)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   RBAC   │  │Rate Limit│  │  Logging │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Calculation │  │  Prediction  │  │   Research   │
│    Engine    │  │    Engine    │  │    Engine    │
│  (Existing)  │  │    (New)     │  │    (New)     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                   │
        └──────────────────┼──────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (MySQL)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Charts  │  │ Sessions │  │  Market  │   │
│  │ Profiles │  │Timelines │  │ Results  │  │   Data   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Redis      │  │   S3/Blob    │  │  Market API  │
│   Cache      │  │   Storage    │  │   Adapter    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 8.2 Technology Stack

#### 8.2.1 Frontend
- **Framework:** Next.js 14+ (React)
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts / D3.js
- **State:** Zustand or Redux Toolkit
- **Forms:** React Hook Form + Zod

#### 8.2.2 Backend
- **Framework:** FastAPI (Python 3.11+)
- **Astrological:** Swiss Ephemeris (existing)
- **Authentication:** JWT + OAuth2
- **Task Queue:** Celery + Redis
- **API Docs:** OpenAPI / Swagger

#### 8.2.3 Database
- **Primary:** MySQL 8.0+
- **Cache:** Redis 7+
- **Search:** MySQL Full-Text Search or ElasticSearch
- **Time-series:** Native MySQL with partitioning (for timeline data)

#### 8.2.4 Infrastructure
- **Hosting:** AWS / GCP / Azure
- **Containers:** Docker + Docker Compose
- **Orchestration:** Kubernetes (optional for scale)
- **CDN:** CloudFlare
- **Storage:** S3 / Azure Blob (for exports)
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

### 8.3 Scalability Considerations

#### 8.3.1 Calculation Engine

- Cache frequently-used calculations (Redis)
- Batch processing for multiple predictions
- Async processing for long-running tasks
- Horizontal scaling with multiple workers

#### 8.3.2 Database

- Read replicas for heavy read operations
- Partition tables by date/user for time-series data
- Connection pooling (ProxySQL or MySQL built-in)
- Query optimization and indexing
- InnoDB storage engine for ACID compliance

#### 8.3.3 API

- Rate limiting per user/IP
- Request caching for identical queries
- Load balancing across multiple instances
- Circuit breakers for external APIs

---

## 9. Data Model

### 9.1 Core Tables

#### 9.1.1 Users & Authentication

```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role ENUM('individual', 'corporate_manager', 'admin', 'analyst') NOT NULL DEFAULT 'individual',
  status ENUM('active', 'inactive', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
  locale VARCHAR(10) DEFAULT 'en-US',
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_consents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  purpose TEXT,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_consents_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.2 Birth Charts & Profiles

```sql
CREATE TABLE birth_charts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255),
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_location_lat DECIMAL(10, 8),
  birth_location_lng DECIMAL(11, 8),
  birth_location_name VARCHAR(255),
  timezone VARCHAR(50),
  ayanamsa VARCHAR(50) DEFAULT 'lahiri',
  house_system VARCHAR(50) DEFAULT 'whole_sign',
  computed_data JSON, -- All calculated astrological data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_birth_charts_user (user_id),
  FULLTEXT idx_birth_charts_computed (computed_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.3 Strength Profiles

```sql
CREATE TABLE strength_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  birth_chart_id CHAR(36) NOT NULL,
  risk_taking DECIMAL(3,1) CHECK (risk_taking BETWEEN 1 AND 10),
  loyalty DECIMAL(3,1) CHECK (loyalty BETWEEN 1 AND 10),
  honesty DECIMAL(3,1) CHECK (honesty BETWEEN 1 AND 10),
  hardworking DECIMAL(3,1) CHECK (hardworking BETWEEN 1 AND 10),
  logical DECIMAL(3,1) CHECK (logical BETWEEN 1 AND 10),
  creativity DECIMAL(3,1) CHECK (creativity BETWEEN 1 AND 10),
  leadership DECIMAL(3,1) CHECK (leadership BETWEEN 1 AND 10),
  adaptability DECIMAL(3,1) CHECK (adaptability BETWEEN 1 AND 10),
  factors JSON, -- Contributing factors for each attribute
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (birth_chart_id) REFERENCES birth_charts(id) ON DELETE CASCADE,
  INDEX idx_strength_profiles_chart (birth_chart_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.4 Aspect Timelines

```sql
CREATE TABLE aspect_timelines (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  birth_chart_id CHAR(36) NOT NULL,
  aspect ENUM('wealth', 'health', 'business', 'spouse', 'kids', 'career') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  data JSON NOT NULL, -- Array of {date, intensity, confidence_upper, confidence_lower, factors}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (birth_chart_id) REFERENCES birth_charts(id) ON DELETE CASCADE,
  INDEX idx_aspect_timelines_chart (birth_chart_id),
  INDEX idx_aspect_timelines_dates (start_date, end_date),
  INDEX idx_aspect_timelines_aspect (aspect)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.5 Calibration Data

```sql
CREATE TABLE calibration_entries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  birth_chart_id CHAR(36) NOT NULL,
  aspect ENUM('wealth', 'health', 'business', 'spouse', 'kids', 'career') NOT NULL,
  date DATE NOT NULL,
  user_score DECIMAL(3,1) NOT NULL CHECK (user_score BETWEEN 1 AND 10),
  model_score DECIMAL(3,1) NOT NULL,
  calibration_factor DECIMAL(5,3),
  notes TEXT,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (birth_chart_id) REFERENCES birth_charts(id) ON DELETE CASCADE,
  INDEX idx_calibration_user_aspect (user_id, aspect),
  INDEX idx_calibration_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE calibration_factors (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  aspect ENUM('wealth', 'health', 'business', 'spouse', 'kids', 'career') NOT NULL,
  factor DECIMAL(5,3) NOT NULL,
  confidence VARCHAR(20), -- 'low', 'medium', 'high'
  sample_size INT,
  rmse DECIMAL(5,3),
  trend VARCHAR(20), -- 'improving', 'stable', 'declining'
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_aspect (user_id, aspect)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.6 Journal Entries

```sql
CREATE TABLE journal_entries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  entry_type ENUM('daily', 'weekly', 'monthly', 'event') NOT NULL DEFAULT 'daily',
  mood VARCHAR(50),
  content TEXT,
  aspects JSON, -- {aspect: {rating, notes}}
  events JSON, -- Array of events
  tags JSON,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_journal_user_date (user_id, date),
  FULLTEXT idx_journal_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.7 Profile Links (Synergy)

```sql
CREATE TABLE profile_links (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  primary_user_id CHAR(36) NOT NULL,
  linked_user_id CHAR(36) NOT NULL,
  relationship ENUM('spouse', 'partner', 'child', 'parent', 'sibling', 'friend', 'business_partner') NOT NULL,
  since DATE,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_profile_link (primary_user_id, linked_user_id),
  INDEX idx_profile_links_primary (primary_user_id),
  INDEX idx_profile_links_linked (linked_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE synergy_analyses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_link_id CHAR(36) NOT NULL,
  overall_synergy DECIMAL(5,2) CHECK (overall_synergy BETWEEN 0 AND 100),
  breakdown JSON, -- {house_synergy, planetary_compatibility, etc.}
  alignment_windows JSON, -- Array of alignment/friction windows
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_link_id) REFERENCES profile_links(id) ON DELETE CASCADE,
  INDEX idx_synergy_analyses_link (profile_link_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.8 Corporate Module

```sql
CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE corporate_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  level ENUM('entry', 'mid', 'senior', 'executive'),
  required_strengths JSON NOT NULL, -- {attribute: {weight, minimum}}
  description TEXT,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_corporate_roles_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id CHAR(36) NOT NULL,
  birth_chart_id CHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  target_role_id CHAR(36),
  fit_score DECIMAL(5,2),
  strength_profile_id CHAR(36),
  status ENUM('sourced', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected') DEFAULT 'sourced',
  notes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (birth_chart_id) REFERENCES birth_charts(id) ON DELETE SET NULL,
  FOREIGN KEY (target_role_id) REFERENCES corporate_roles(id) ON DELETE SET NULL,
  FOREIGN KEY (strength_profile_id) REFERENCES strength_profiles(id) ON DELETE SET NULL,
  INDEX idx_candidates_org (organization_id),
  INDEX idx_candidates_role (target_role_id),
  INDEX idx_candidates_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teams (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  manager_id CHAR(36),
  members JSON, -- Array of {user_id, role_id, joined_date}
  synergy_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_teams_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.9 ShareMarks Research

```sql
CREATE TABLE stock_universes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exchange VARCHAR(50),
  category ENUM('top_100', 'bottom_100', 'average_100', 'custom'),
  stocks JSON NOT NULL, -- Array of {ticker, name, sector}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stock_universes_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE research_sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  universe_id CHAR(36) NOT NULL,
  parameters JSON NOT NULL, -- seed, date_range, weights, etc.
  status ENUM('created', 'processing', 'completed', 'failed') DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (universe_id) REFERENCES stock_universes(id) ON DELETE CASCADE,
  INDEX idx_research_sessions_user (user_id),
  INDEX idx_research_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE astro_features (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id CHAR(36) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  birth_chart_id CHAR(36),
  features JSON NOT NULL, -- All extracted features
  aggregate_score DECIMAL(5,3) CHECK (aggregate_score BETWEEN 0 AND 1),
  ai_score DECIMAL(5,3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES research_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (birth_chart_id) REFERENCES birth_charts(id) ON DELETE SET NULL,
  INDEX idx_astro_features_session (session_id),
  INDEX idx_astro_features_ticker (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE price_snapshots (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ticker VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  open DECIMAL(12,4),
  high DECIMAL(12,4),
  low DECIMAL(12,4),
  close DECIMAL(12,4),
  volume BIGINT,
  source VARCHAR(50),
  UNIQUE KEY unique_ticker_date (ticker, date),
  INDEX idx_price_snapshots_ticker (ticker),
  INDEX idx_price_snapshots_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE predictions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id CHAR(36) NOT NULL,
  astro_feature_id CHAR(36) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  processing_date DATE NOT NULL,
  processing_price DECIMAL(12,4),
  horizons JSON, -- {1: price, 5: price, 20: price}
  returns JSON, -- {1: return_pct, 5: return_pct, 20: return_pct}
  direction VARCHAR(10), -- 'up', 'down', 'flat'
  accuracy_metrics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES research_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (astro_feature_id) REFERENCES astro_features(id) ON DELETE CASCADE,
  INDEX idx_predictions_session (session_id),
  INDEX idx_predictions_ticker (ticker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9.1.10 Audit & Compliance

```sql
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  actor_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id CHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_actor (actor_id),
  INDEX idx_audit_logs_timestamp (timestamp),
  INDEX idx_audit_logs_resource (resource_type, resource_id),
  INDEX idx_audit_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9.2 Relationships & Constraints

- Users can have multiple birth charts
- Each birth chart has one strength profile
- Each birth chart has multiple aspect timelines
- Users can have multiple calibration entries per aspect
- Profile links are bidirectional (primary-linked)
- Organizations have multiple teams and candidates
- Research sessions belong to users and reference universes
- Predictions reference sessions and astro features

---

## 10. API Specifications

### 10.1 API Versioning

Base URL: `https://api.jyotishdrishti.com/v1`

All endpoints use `/v1/` prefix for versioning.

### 10.2 Authentication

**Endpoints:**

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/verify-email
POST   /auth/reset-password
GET    /auth/me
```

**Example:**

```typescript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

// Response
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "individual"
  }
}
```

### 10.3 Individual Module Endpoints

```
# Birth Charts
POST   /charts/create
GET    /charts/:id
PUT    /charts/:id
DELETE /charts/:id
GET    /charts/user/:userId

# Strength Profiles
POST   /strength-profiles/calculate
GET    /strength-profiles/:chartId
PUT    /strength-profiles/:id

# Aspect Predictions
POST   /predictions/aspects
GET    /predictions/aspects/:chartId/:aspect
POST   /predictions/aspects/range

# Calibration
POST   /calibration/entries
GET    /calibration/entries/:userId/:aspect
GET    /calibration/factors/:userId
POST   /calibration/calculate-factor

# Journaling
POST   /journal/entries
GET    /journal/entries/:userId
GET    /journal/entries/:id
PUT    /journal/entries/:id
DELETE /journal/entries/:id
GET    /journal/search
```

**Example: Calculate Aspect Predictions**

```typescript
// POST /predictions/aspects
{
  "chart_id": "uuid",
  "aspects": ["wealth", "career", "health"],
  "start_date": "2025-01-01",
  "end_date": "2030-12-31",
  "include_confidence": true
}

// Response
{
  "chart_id": "uuid",
  "timelines": {
    "wealth": [
      {
        "date": "2025-01-01",
        "intensity": 7.5,
        "confidence_lower": 6.5,
        "confidence_upper": 8.5,
        "factors": {
          "dasha": "Jupiter-Venus (favorable)",
          "houses": "2nd house strong, 11th lord well-placed",
          "yogas": ["Dhana Yoga", "Raj Yoga"],
          "transits": "Jupiter aspecting 2nd house"
        }
      },
      // ... more timeline points
    ],
    "career": [...],
    "health": [...]
  },
  "calibration_applied": true,
  "generated_at": "2025-10-23T10:30:00Z"
}
```

### 10.4 Synergy Module Endpoints

```
# Profile Links
POST   /synergy/links
GET    /synergy/links/:userId
DELETE /synergy/links/:id

# Synergy Analysis
POST   /synergy/analyze
GET    /synergy/analysis/:linkId
GET    /synergy/timeline-overlay

# Alignment Windows
GET    /synergy/alignment-windows
POST   /synergy/alignment-windows/export
```

**Example: Analyze Synergy**

```typescript
// POST /synergy/analyze
{
  "primary_user_id": "uuid1",
  "linked_user_id": "uuid2",
  "aspects": ["wealth", "spouse", "career"],
  "date_range": ["2025-01-01", "2030-12-31"]
}

// Response
{
  "overall_synergy": 78.5,
  "breakdown": {
    "house_synergy": 82.0,
    "planetary_compatibility": 75.0,
    "strength_alignment": 80.0,
    "dasha_alignment": 70.0,
    "yoga_compatibility": 85.0
  },
  "alignment_windows": [
    {
      "start_date": "2025-03-01",
      "end_date": "2025-06-30",
      "type": "high_alignment",
      "score": 9.2,
      "aspects": ["wealth", "career"],
      "factors": ["Both in favorable dashas", "Jupiter transit benefiting both"]
    },
    // ... more windows
  ],
  "interpretation": "Strong overall compatibility with excellent house synergy..."
}
```

### 10.5 Corporate Module Endpoints

```
# Roles
POST   /corporate/roles
GET    /corporate/roles
GET    /corporate/roles/:id
PUT    /corporate/roles/:id
DELETE /corporate/roles/:id

# Candidates
POST   /corporate/candidates
GET    /corporate/candidates
GET    /corporate/candidates/:id
PUT    /corporate/candidates/:id
DELETE /corporate/candidates/:id
POST   /corporate/candidates/assess

# Teams
POST   /corporate/teams
GET    /corporate/teams
GET    /corporate/teams/:id
POST   /corporate/teams/synergy

# Shortlists
GET    /corporate/shortlists
POST   /corporate/shortlists/export
```

**Example: Assess Candidate**

```typescript
// POST /corporate/candidates/assess
{
  "candidate_id": "uuid",
  "role_id": "uuid"
}

// Response
{
  "candidate_id": "uuid",
  "role_id": "uuid",
  "overall_fit_score": 82.5,
  "strength_scores": {
    "risk_taking": 6.5,
    "loyalty": 8.0,
    "honesty": 9.0,
    "hardworking": 7.5,
    "logical": 8.5
  },
  "role_requirements": {
    "honesty": { "required": 7, "weight": 10, "met": true },
    "loyalty": { "required": 7, "weight": 8, "met": true },
    // ...
  },
  "gaps": [],
  "recommendation": {
    "decision": "strong_hire",
    "confidence": "high",
    "rationale": "Excellent fit across all key attributes, particularly strong in honesty and logical thinking"
  }
}
```

### 10.6 ShareMarks Research Endpoints

```
# Stock Universes
POST   /research/universes
GET    /research/universes
GET    /research/universes/:id

# Research Sessions
POST   /research/sessions
GET    /research/sessions
GET    /research/sessions/:id
POST   /research/sessions/:id/process
GET    /research/sessions/:id/results

# Predictions & Analysis
GET    /research/predictions/:sessionId
GET    /research/accuracy/:sessionId
POST   /research/export
```

**Example: Create Research Session**

```typescript
// POST /research/sessions
{
  "name": "Q1 2025 Top 100 Analysis",
  "description": "Testing new weight configuration",
  "universe_id": "uuid",
  "parameters": {
    "seed": 12345,
    "date_range": ["1950-01-01", "2025-01-01"],
    "time_range": ["00:00", "23:59"],
    "location": "random",
    "feature_weights": {
      "house_2": 0.15,
      "house_5": 0.20,
      "house_11": 0.20,
      "planet_mercury": 0.15,
      "planet_jupiter": 0.15,
      "supportive_yogas": 0.10,
      "negative_configs": -0.05
    },
    "horizons": [1, 5, 20]
  }
}

// Response
{
  "session_id": "uuid",
  "status": "created",
  "estimated_processing_time": "15-30 minutes",
  "message": "Session created. Processing will begin shortly."
}
```

### 10.7 Rate Limiting

| User Role | Requests per Minute | Daily Limit |
|-----------|---------------------|-------------|
| Individual | 60 | 5000 |
| Corporate Manager | 120 | 15000 |
| Analyst | 180 | 30000 |
| Admin | Unlimited | Unlimited |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634567890
```

### 10.8 Error Responses

```typescript
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Birth time is required",
    "details": {
      "field": "birth_time",
      "constraint": "not_null"
    },
    "request_id": "uuid",
    "timestamp": "2025-10-23T10:30:00Z"
  }
}
```

**Error Codes:**
- `INVALID_INPUT` - Validation error
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## 11. UI/UX Requirements

### 11.1 Design Principles

1. **Clarity** - Present complex astrological data in understandable formats
2. **Transparency** - Show factors contributing to every score
3. **Guidance** - Provide contextual help and tooltips
4. **Accessibility** - WCAG AA compliance
5. **Responsiveness** - Mobile-first design
6. **Performance** - Fast load times, optimistic updates

### 11.2 Navigation Structure

```
├── Dashboard (Home)
│   ├── Overview
│   ├── Quick Actions
│   └── Recent Activity
│
├── My Profile
│   ├── Birth Chart
│   ├── Strength Assessment
│   ├── Aspect Timelines
│   └── Calibration Dashboard
│
├── Predictions
│   ├── Timeline View
│   ├── Aspect Details
│   ├── Comparison (Self vs Model)
│   └── Export
│
├── Journal
│   ├── Entries List
│   ├── New Entry
│   ├── Calendar View
│   └── Analytics
│
├── Synergy (if linked profiles exist)
│   ├── My Connections
│   ├── Compatibility Analysis
│   ├── Timeline Overlay
│   └── Reports
│
├── Corporate (if corporate role)
│   ├── Candidates
│   ├── Roles
│   ├── Teams
│   └── Shortlists
│
├── Research (if analyst role)
│   ├── Sessions
│   ├── Universes
│   ├── Results & Analytics
│   └── Exports
│
└── Settings
    ├── Account
    ├── Preferences
    ├── Privacy & Consent
    └── Notifications
```

### 11.3 Key UI Components

#### 11.3.1 Timeline Visualization

**Multi-Aspect Timeline:**

```
Component: TimelineChart

Props:
- aspects: LifeAspect[]
- dateRange: [Date, Date]
- data: TimelineData
- showConfidenceBands: boolean
- showEvents: boolean
- calibrated: boolean

Features:
- Multi-line chart (one per aspect)
- Confidence bands (shaded areas)
- Event markers (journal entries)
- Dasha period separators
- Interactive tooltips with factor breakdown
- Zoom/pan controls
- Export as image
```

**Visual Example:**
```
   10 ┤                                        ╭─Career
    9 ┤                           ╭───╮      │  
    8 ┤       ╭──Wealth──╮       │    ╰─Health
    7 ┤      │           │      │         
    6 ┤──╮  │             ╰─Business       
    5 ┤   ╰╯                           
    4 ┤                                    
    3 ┤                                    
    2 ┤                                    
    1 ┤                                    
      └────────────────────────────────────
      2025  2026  2027  2028  2029  2030
      │     │     │     │     │     │
      Rahu  ───── Jupiter ──── Saturn ─────
```

#### 11.3.2 Calibration Dashboard

**Layout:**

```
┌──────────────────────────────────────────────────┐
│              Calibration Overview                │
├──────────────────────────────────────────────────┤
│  Overall Accuracy: 82%     Sample Size: 47       │
│  Last Updated: 2 days ago  Trend: ↗ Improving    │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Aspect         Model  You   Factor  Accuracy    │
├──────────────────────────────────────────────────┤
│  Wealth         7.5    8.0   1.07    85%  ████▒ │
│  Career         8.0    7.5   0.94    82%  ████░ │
│  Health         6.0    5.5   0.92    78%  ███▒░ │
│  Business       7.0    7.2   1.03    80%  ████░ │
│  Spouse         8.5    8.0   0.94    88%  ████▓ │
│  Kids           7.0    7.5   1.07    75%  ███░░ │
└──────────────────────────────────────────────────┘

[Add Entry]  [View History]  [Export Report]
```

#### 11.3.3 Synergy Visualization

**Compatibility Wheel:**

```
        Strength
         Match
         80%
           │
    House──┼──Planetary
   Synergy │  Compat.
    82%    │   75%
         │ │ │
    Dasha─┼─┼─Yoga
    70%  78.5  85%
         Overall
```

**Timeline Overlay:**

```
        Person 1 (You)    Person 2 (Partner)

Wealth    ────────          ────────
          \      /          \      /
           ╰────╯            ╰────╯
          High Alignment    Friction

          2025 ───────── 2030
```

#### 11.3.4 Corporate Dashboard

**Candidate List:**

```
┌────────────────────────────────────────────────────┐
│  Candidates for: Finance Operations Manager        │
│                                                    │
│  Filters: [Fit >70] [Honesty >7] [Available]      │
├────────────────────────────────────────────────────┤
│  Name          Fit    Key Strengths    Status     │
├────────────────────────────────────────────────────┤
│  John Doe      87%    Honesty(9)       Interview  │
│                       Loyalty(8)       [View]     │
│  ────────────────────────────────────────────────  │
│  Jane Smith    82%    Logical(9)       Assessment │
│                       Honesty(8)       [View]     │
│  ────────────────────────────────────────────────  │
│  ...                                              │
└────────────────────────────────────────────────────┘

[Export Shortlist]  [Add Candidate]  [Compare]
```

#### 11.3.5 Research Dashboard

**Session Results:**

```
┌──────────────────────────────────────────────────┐
│  Session: Q1 2025 Top 100 Analysis               │
│  Status: ✓ Completed                            │
│  Stocks Analyzed: 100  |  Seed: 12345            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Prediction Performance                          │
├──────────────────────────────────────────────────┤
│  Hit Rate (T+1):  64% ████████████████░░░░░░     │
│  Hit Rate (T+5):  58% ████████████▒░░░░░░░░░     │
│  Hit Rate (T+20): 52% ██████████░░░░░░░░░░░░     │
│  RMSE: 3.2%      Sharpe: 0.45                    │
└──────────────────────────────────────────────────┘

Top Predictions:
1. RELIANCE  Score: 0.85  Actual: +12.5%  ✓
2. TCS       Score: 0.82  Actual: +8.3%   ✓
3. INFY      Score: 0.79  Actual: -2.1%   ✗

[View Full Results]  [Export Data]  [Clone Session]
```

### 11.4 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Collapsible navigation
- Swipeable timelines
- Touch-friendly controls
- Simplified charts on small screens
- Bottom tab bar navigation

### 11.5 Accessibility

**Requirements:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus indicators
- Alt text for all images
- Semantic HTML
- ARIA labels where needed

### 11.6 Loading States

- Skeleton loaders for content
- Progressive loading for charts
- Background processing notifications
- Optimistic UI updates
- Retry mechanisms for failed requests

---

## 12. Security & Compliance

### 12.1 Authentication & Authorization

#### 12.1.1 Authentication Methods

1. **Email/Password** - Bcrypt hashed passwords
2. **OAuth2** - Google, GitHub, Apple
3. **MFA** - TOTP (Google Authenticator, Authy)
4. **API Keys** - For third-party integrations

#### 12.1.2 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Individual** | Own chart, predictions, calibration, journal, linked profiles |
| **Corporate Manager** | Candidates, roles, teams, shortlists within organization |
| **Analyst** | Research sessions, universes, predictions, exports |
| **Admin** | All resources, user management, system configuration |

#### 12.1.3 Token Management

- **Access Token:** JWT, 1 hour expiry
- **Refresh Token:** 30 days expiry, rotated on use
- **Token Blacklist:** Redis for logout/revocation

### 12.2 Data Security

#### 12.2.1 Encryption

- **At Rest:** AES-256 encryption for sensitive fields
- **In Transit:** TLS 1.3 for all connections
- **Birth Data:** Encrypted separately with user-specific keys
- **Backups:** Encrypted before storage

#### 12.2.2 Sensitive Data Handling

```python
# Encrypted fields
ENCRYPTED_FIELDS = [
    'birth_date',
    'birth_time',
    'birth_location',
    'full_name',
    'phone'
]

# PII minimization
- Store only necessary data
- Anonymize for analytics
- Regular data retention reviews
```

#### 12.2.3 Secrets Management

- **Vault:** HashiCorp Vault or AWS Secrets Manager
- **Environment:** No secrets in code or git
- **Rotation:** Regular key/secret rotation
- **Access:** Principle of least privilege

### 12.3 Privacy & Compliance

#### 12.3.1 GDPR Compliance

1. **Consent Management**
   - Explicit consent for data processing
   - Granular consent options
   - Easy withdrawal mechanism

2. **Data Subject Rights**
   - Right to access (export)
   - Right to rectification (edit)
   - Right to erasure (delete)
   - Right to portability (JSON/CSV export)

3. **Data Minimization**
   - Collect only what's needed
   - Pseudonymization where possible
   - Regular data audits

#### 12.3.2 Corporate Ethics

1. **Hiring Decisions**
   - Astrological scores as one factor only
   - Human review required for final decisions
   - Avoid protected class discrimination
   - Transparent methodology

2. **Consent for Corporate Module**
   - Explicit candidate consent required
   - Purpose clearly stated
   - Opt-out available
   - Data deletion on request

3. **ShareMarks Disclaimers**
   - Prominent "NOT INVESTMENT ADVICE" warnings
   - No trading execution features
   - Risk disclosures
   - User responsibility statements

### 12.4 Audit & Monitoring

#### 12.4.1 Audit Logging

Log all sensitive operations:
- User login/logout
- Chart creation/modification
- Profile linking/unlinking
- Candidate assessment
- Research session creation
- Data exports
- Permission changes

#### 12.4.2 Security Monitoring

- Failed login attempts tracking
- Anomalous API usage detection
- SQL injection attempt detection
- XSS attempt detection
- Rate limit violations
- Unusual data access patterns

#### 12.4.3 Incident Response

1. **Detection:** Automated alerts
2. **Containment:** Immediate blocking
3. **Eradication:** Fix vulnerability
4. **Recovery:** Restore services
5. **Post-Incident:** Review and improve

### 12.5 Compliance Checklist

- [ ] GDPR compliance documentation
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner
- [ ] Data processing agreements
- [ ] Security audit conducted
- [ ] Penetration testing completed
- [ ] Backup & disaster recovery tested
- [ ] Incident response plan documented
- [ ] User consent management implemented
- [ ] Data encryption implemented
- [ ] Access control tested
- [ ] Audit logging implemented
- [ ] GDPR data export implemented
- [ ] GDPR data deletion implemented

---

## 13. Implementation Phases

### Phase 1: Foundation (4 weeks)

**Goal:** Build core infrastructure and user system

#### Week 1-2: Backend Foundation
- [ ] Set up MySQL 8.0+ database
- [ ] Create all tables and relationships
- [ ] Implement database migrations (Alembic or similar)
- [ ] Set up Redis for caching
- [ ] Implement user authentication (JWT)
- [ ] Implement RBAC middleware
- [ ] Set up API gateway with rate limiting

#### Week 3-4: Prediction Engine Foundation
- [ ] Build aspect intensity calculation engine
- [ ] Implement Dasha/Antardasha timeline generation
- [ ] Create factor extraction system
- [ ] Build confidence band calculator
- [ ] Implement caching for calculations
- [ ] Unit tests for all calculation functions

**Deliverables:**
- Working authentication system
- Database schema deployed
- Basic prediction API endpoints
- 80%+ test coverage for calculations

---

### Phase 2: Individual Module (4 weeks)

**Goal:** Complete individual user features

#### Week 5-6: Strength & Predictions
- [ ] Implement strength attribute calculation
- [ ] Build aspect timeline generation
- [ ] Create prediction API endpoints
- [ ] Implement timeline storage
- [ ] Build calibration entry system
- [ ] Create calibration factor calculator

#### Week 7-8: Journaling & UI
- [ ] Build journal entry CRUD
- [ ] Implement journal search
- [ ] Create timeline visualization component
- [ ] Build calibration dashboard
- [ ] Create prediction comparison UI
- [ ] Implement journal entry form
- [ ] Add notification system for reminders

**Deliverables:**
- Complete individual module API
- Working timeline visualization
- Calibration system functional
- Journal entries working
- Responsive UI for all features

---

### Phase 3: Synergy & Corporate (4 weeks)

**Goal:** Multi-profile and corporate features

#### Week 9-10: Synergy Module
- [ ] Implement profile linking
- [ ] Build synergy calculation engine
- [ ] Create alignment window detection
- [ ] Build timeline overlay API
- [ ] Create synergy visualization
- [ ] Implement synergy reports

#### Week 11-12: Corporate Module
- [ ] Build role definition system
- [ ] Implement candidate assessment
- [ ] Create team synergy calculator
- [ ] Build shortlist management
- [ ] Create corporate dashboard
- [ ] Implement candidate pipeline
- [ ] Add consent management

**Deliverables:**
- Working synergy analysis
- Corporate module API complete
- Candidate assessment functional
- Team synergy calculator working
- Corporate dashboard deployed

---

### Phase 4: ShareMarks Research (4 weeks)

**Goal:** Market research module

#### Week 13-14: Data & Sessions
- [ ] Build stock universe management
- [ ] Implement randomization engine
- [ ] Create research session system
- [ ] Build astro feature extraction
- [ ] Implement feature aggregation
- [ ] Create AI-assisted scoring

#### Week 15-16: Backtesting & Analysis
- [ ] Integrate market data API
- [ ] Build price fetching system
- [ ] Implement return calculation
- [ ] Create accuracy metrics
- [ ] Build research dashboards
- [ ] Implement export functionality
- [ ] Add disclaimer system

**Deliverables:**
- Stock universe management working
- Research sessions functional
- Feature extraction pipeline complete
- Backtesting system operational
- Research dashboards deployed
- Export capabilities working

---

### Phase 5: Polish & Launch (4 weeks)

**Goal:** Production-ready deployment

#### Week 17-18: Optimization
- [ ] Performance optimization
- [ ] Database query optimization
- [ ] Frontend bundle optimization
- [ ] Implement CDN for static assets
- [ ] Add Redis caching for API responses
- [ ] Optimize calculation algorithms
- [ ] Load testing

#### Week 19: Security & Documentation
- [ ] Security audit
- [ ] Penetration testing
- [ ] Fix identified vulnerabilities
- [ ] Complete API documentation
- [ ] Write user guides
- [ ] Create admin documentation
- [ ] Record video tutorials

#### Week 20: Launch Preparation
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure logging (ELK)
- [ ] Set up backup automation
- [ ] Create runbooks for operations
- [ ] Beta testing with select users
- [ ] Fix beta feedback issues
- [ ] Prepare marketing materials
- [ ] Launch to production

**Deliverables:**
- Production deployment
- Monitoring & logging active
- Documentation complete
- Beta testing successful
- Public launch

---

## 14. Success Metrics

### 14.1 User Engagement Metrics

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Active Users | 100 | 5,000 |
| Charts Generated | 500 | 25,000 |
| Journal Entries | 200 | 10,000 |
| Calibration Entries | 50 | 5,000 |
| Synergy Analyses | 20 | 2,000 |

### 14.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Calibration Accuracy Improvement | +10% within 3 months |
| User Satisfaction (NPS) | > 50 |
| Prediction Confidence | 75%+ |
| API Response Time (p95) | < 1.5s |
| Uptime | > 99.5% |

### 14.3 Business Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| Corporate Accounts | 20 |
| Research Analysts | 50 |
| Conversion Rate (Free to Paid) | 5% |
| Monthly Recurring Revenue | $10K |
| Customer Lifetime Value | $500 |

### 14.4 Technical Metrics

| Metric | Target |
|--------|--------|
| Code Coverage | > 80% |
| Bug Fix Time (p95) | < 48 hours |
| API Error Rate | < 0.5% |
| Database Query Time (p95) | < 100ms |
| Deployment Frequency | Weekly |

---

## 15. Appendix

### 15.1 Glossary

| Term | Definition |
|------|------------|
| **Aspect (Life)** | A dimension of life tracked on 1-10 scale (Wealth, Health, Career, etc.) |
| **Calibration Factor** | Multiplicative adjustment based on user feedback vs model predictions |
| **Dasha** | Major planetary period in Vedic astrology (Vimshottari 120-year cycle) |
| **Antardasha** | Sub-period within a Dasha |
| **Synergy Index** | Overall compatibility score (0-100) between two profiles |
| **Strength Attribute** | Personal quality scored 1-10 (Honesty, Loyalty, Risk-Taking, etc.) |
| **Timeline** | Time-series data showing aspect intensities over years |
| **Confidence Band** | Upper and lower bounds around predictions showing uncertainty |
| **ShareMarks** | Research-only market analysis module |
| **Session** | A research backtest run with specific parameters |
| **Universe** | A predefined set of stocks for analysis |
| **Astro Features** | Extracted astrological data points for stock horoscopes |

### 15.2 Astrological References

**Houses:**
- 1st: Self, personality, body
- 2nd: Wealth, family, speech
- 3rd: Courage, siblings, communication
- 4th: Mother, home, happiness
- 5th: Children, speculation, creativity
- 6th: Enemies, health, service
- 7th: Spouse, partnerships, business
- 8th: Longevity, sudden events, occult
- 9th: Luck, father, dharma
- 10th: Career, profession, reputation
- 11th: Gains, friends, aspirations
- 12th: Losses, expenses, spirituality

**Planets:**
- Sun: Soul, father, authority, vitality
- Moon: Mind, mother, emotions, public
- Mars: Energy, courage, siblings, property
- Mercury: Intelligence, communication, business
- Jupiter: Wisdom, wealth, children, guru
- Venus: Love, beauty, marriage, arts
- Saturn: Discipline, delays, karma, longevity
- Rahu: Obsession, foreign, sudden gains
- Ketu: Detachment, spirituality, liberation

### 15.3 Market Research Disclaimer Template

```
⚠️ IMPORTANT DISCLAIMER - READ CAREFULLY

This ShareMarks research module is provided for EDUCATIONAL and 
RESEARCH purposes only. It is NOT investment advice, and should 
NOT be used as the sole basis for any investment decision.

Key Points:
1. HIGH UNCERTAINTY: Astrological predictions are speculative and 
   have inherent limitations and uncertainties.

2. NO GUARANTEES: Past performance does not guarantee future results. 
   Hit rates shown are historical and may not repeat.

3. MARKET RISK: All investments carry risk of capital loss. You could 
   lose your entire investment.

4. RESEARCH ONLY: This tool is for backtesting and analysis. It does 
   NOT execute trades or provide personalized recommendations.

5. YOUR RESPONSIBILITY: You are solely responsible for your investment 
   decisions and any resulting gains or losses.

6. SEEK PROFESSIONAL ADVICE: Consult a licensed financial advisor 
   before making investment decisions.

7. REGULATORY: This platform is not a registered investment advisor 
   and does not provide financial planning services.

By proceeding, you acknowledge that you understand these limitations 
and agree to use this tool for research purposes only.

[✓] I understand and agree to these terms

[Cancel] [Proceed to Research]
```

### 15.4 Sample Calculation Walkthrough

**Example: Wealth Aspect Intensity Calculation**

**Input:**
- Birth Chart: Libra Ascendant
- Date: January 1, 2026
- Current Dasha: Jupiter-Venus

**Step 1: Base House Analysis**
- 2nd House (Scorpio): Mars (lord) in 10th house = Strong (7/10)
- 11th House (Leo): Sun (lord) in 4th house = Moderate (6/10)
- Connection: Mars aspects 2nd house from 10th = Positive

**Step 2: Planetary Factors**
- Jupiter (wealth karaka): In 12th house = Weak (-1)
- Venus (2nd lord in D9): Exalted = Strong (+2)
- Mercury (11th lord in D9): Neutral (0)

**Step 3: Dasha Influence**
- Jupiter Mahadasha: Generally favorable for wealth (+1)
- Venus Antardasha: Excellent for 2nd house matters (+2)
- Combined: Jupiter-Venus = Peak wealth period (+3)

**Step 4: Transit Effects**
- Saturn transiting 2nd house: Slow accumulation (neutral)
- Jupiter transiting 11th house: Gains through networking (+1)

**Step 5: Yoga Contributions**
- Dhana Yoga (2nd-11th connection): Present (+1)
- Raj Yoga (9th-10th connection): Present (+0.5)

**Calculation:**
```
Base Score = (House_2 × 0.3) + (House_11 × 0.2)
           = (7 × 0.3) + (6 × 0.2)
           = 2.1 + 1.2 = 3.3

Modifiers = Planetary_Factors + Dasha + Transits + Yogas
          = (1) + (3) + (1) + (1.5)
          = 6.5

Raw Score = Base Score + Modifiers
          = 3.3 + 6.5 = 9.8

Normalized Score = min(10, max(1, 9.8)) = 9.8

Confidence = based on:
- Dasha certainty: High (±0.5)
- Transit predictability: Medium (±1.0)
- Yoga reliability: High (±0.5)

Final Output:
- Intensity: 9.8 / 10
- Confidence Band: [8.8, 10.0]
- Interpretation: "Exceptionally strong period for wealth accumulation"
```

**Contributing Factors Display:**
```json
{
  "intensity": 9.8,
  "confidence_lower": 8.8,
  "confidence_upper": 10.0,
  "factors": {
    "primary": [
      "Jupiter-Venus Dasha: Peak wealth period",
      "2nd lord Mars strong in 10th house",
      "Venus exalted in D9 chart"
    ],
    "supportive": [
      "Dhana Yoga present (2nd-11th connection)",
      "Jupiter transiting 11th house of gains",
      "Raj Yoga contributing overall strength"
    ],
    "cautions": [
      "Jupiter in 12th may cause some expenses",
      "Saturn transit suggests slow but steady growth"
    ]
  },
  "recommendations": [
    "Excellent time for investments and business expansion",
    "Focus on networking and partnerships (11th house)",
    "Avoid impulsive spending despite favorable period"
  ]
}
```

### 15.5 Technology Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|-------------------------|
| MySQL 8.0+ with Prisma ORM | User preference, proven RDBMS with excellent JSON support, widely deployed, good performance. Prisma provides type-safe database access and automatic migrations. | PostgreSQL (excellent but user chose MySQL), MongoDB (less suitable for complex relationships) |
| FastAPI | Modern Python framework, automatic API docs, high performance | Django (too heavy), Flask (less modern) |
| Next.js | React with SSR, excellent developer experience, SEO-friendly | Create React App (no SSR), Vue.js (team preference) |
| NextAuth.js | Flexible authentication framework with multiple providers, JWT-based sessions, works seamlessly with Next.js | Supabase Auth (requires Supabase infrastructure), Auth0 (third-party dependency) |
| Redis | High-performance caching, pub/sub for real-time | Memcached (less features), in-memory only (not persistent) |
| JWT | Stateless authentication, scalable | Session cookies (less scalable), OAuth only (more complex) |
| Recharts | React-native charts, good defaults | D3.js (more complex), Chart.js (less React-friendly) |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-23 | Product Team | Initial draft based on gap analysis |

---

## Sign-off

**Prepared By:**  
Product Management Team

**Reviewed By:**  
- Engineering Lead: ___________
- Design Lead: ___________
- Security Lead: ___________

**Approved By:**  
Product Owner: ___________ Date: ___________

---

**END OF DOCUMENT**
