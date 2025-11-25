# 📋 Jyotish Drishti (PRD2) - Implementation Plan

**Document:** PRD2 Implementation Roadmap  
**Date:** October 23, 2025  
**Status:** Ready for Development  
**Total Tasks:** 41 (organized in 5 phases)

---

## 🎯 EXECUTIVE SUMMARY

### Current State (ChandraHoro v0.1.0)
- ✅ 46 features implemented (MVP complete)
- ⏳ 4 features partially implemented
- 📋 11 features planned
- **Status:** Production-ready chart generator

### Target State (Jyotish Drishti)
- Transform from chart generator → decision-support system
- Add intensity-based predictions (1-10 scale)
- Implement calibration tracking
- Enable multi-user synergy analysis
- Add corporate HR module
- Include experimental market research

### Transformation Scope
- **New Modules:** 4 (Individual, Synergy, Corporate, ShareMarks)
- **New Calculations:** Aspect intensities, calibration factors, synergy indices
- **New Database:** MySQL with 10+ new tables
- **New UI:** 20+ new pages/components
- **Timeline:** 20 weeks (5 phases)

---

## 📊 TASK SUMMARY

### Overall Statistics
| Category | Count | Status |
|----------|-------|--------|
| **Total Tasks** | 41 | - |
| **Completed** | 1 | ✅ |
| **In Progress** | 3 | ⏳ |
| **Not Started** | 37 | 📋 |
| **Completion %** | 9.8% | - |

### By Phase
| Phase | Tasks | Duration | Focus |
|-------|-------|----------|-------|
| **Phase 1** | 5 | Weeks 1-4 | Foundation |
| **Phase 2** | 6 | Weeks 5-8 | Individual |
| **Phase 3** | 10 | Weeks 9-12 | Synergy & Corporate |
| **Phase 4** | 10 | Weeks 13-16 | ShareMarks |
| **Phase 5** | 5 | Weeks 17-20 | Polish & Launch |

---

## 🔄 PHASE BREAKDOWN

### Phase 1: Foundation (Weeks 1-4) - 5 Tasks
**Goal:** Build core infrastructure for decision-support system

1. ✅ **1.2 Database Schema** - COMPLETE (partial)
   - Existing: Birth chart storage
   - Need: MySQL migration with full schema

2. ⏳ **1.3 Aspect Intensity Engine** - IN PROGRESS
   - Existing: Dasha, transits
   - Need: 1-10 scale calculations for 6 life aspects

3. ⏳ **1.4 Timeline Visualization** - IN PROGRESS
   - Existing: Dasha timeline
   - Need: Multi-aspect with confidence bands

4. 📋 **1.1 User Authentication & RBAC** - NOT STARTED
   - JWT + OAuth2
   - Roles: individual, corporate_manager, admin, analyst

5. 📋 **1.5 API Gateway & Middleware** - NOT STARTED
   - Auth, RBAC, rate limiting, logging

### Phase 2: Individual Module (Weeks 5-8) - 6 Tasks
**Goal:** Build personalized prediction system

1. ⏳ **2.1 Strength Attribute Scoring** - IN PROGRESS
   - Map Shadbala/Ashtakavarga to 8 attributes
   - 1-10 scale scoring

2. 📋 **2.2 Life Aspect Predictions** - NOT STARTED
   - 6 aspects: Wealth, Health, Business, Spouse, Kids, Career
   - Confidence bands

3. 📋 **2.3 Calibration System** - NOT STARTED
   - User self-ratings vs model predictions
   - Calibration factor calculation

4. 📋 **2.4 Journaling System** - NOT STARTED
   - Daily/weekly/monthly/event entries
   - Aspect ratings, event tracking, tags

5. 📋 **2.5 Timeline Dashboard** - NOT STARTED
   - Interactive multi-aspect visualization
   - Zoom, toggle, hover, event markers

6. 📋 **2.6 Comparison Dashboard** - NOT STARTED
   - Model vs user ratings
   - Calibration factors, accuracy

### Phase 3: Synergy & Corporate (Weeks 9-12) - 10 Tasks
**Goal:** Enable family and team synergy analysis

**Synergy Module (4 tasks):**
- Profile linking (spouse, partner, child, etc.)
- Synergy calculation (0-100 score)
- Timeline overlay & alignment windows
- Reports & export

**Corporate Module (6 tasks):**
- Role definition system
- Candidate assessment (0-100 fit score)
- Team synergy analysis
- Candidate pipeline management
- Corporate dashboard
- Consent & privacy controls

### Phase 4: ShareMarks Research (Weeks 13-16) - 10 Tasks
**Goal:** Experimental market research module

- Stock universe management
- Research session framework
- Horoscope generation for stocks
- Astrological feature extraction
- Feature aggregation & scoring
- Price data integration
- Prediction accuracy metrics
- Research dashboards
- Export capabilities
- Disclaimers & safety features

### Phase 5: Polish & Launch (Weeks 17-20) - 5 Tasks
**Goal:** Production readiness

- Performance optimization
- Security audit & hardening
- Comprehensive documentation
- Beta testing & QA
- Production deployment

---

## 🚀 IMPLEMENTATION PRIORITIES

### Critical Path (Must Complete First)
1. Phase 1: Foundation (all 5 tasks)
2. Phase 2.1-2.3: Core prediction engine
3. Phase 3.1-3.2: Synergy foundation
4. Phase 5: Deployment

### High Value (Early ROI)
- Phase 2: Individual module (calibration + journaling)
- Phase 3: Synergy module (family use case)

### Experimental (Lower Priority)
- Phase 4: ShareMarks research (research-only, disclaimers)

---

## 📈 DEPENDENCIES & SEQUENCING

### Hard Dependencies
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
(Foundation required for all modules)
```

### Parallel Work Possible
- Phase 2 & 3 can overlap after Phase 1 complete
- Phase 4 can start after Phase 1 complete
- Phase 5 starts after Phase 4 complete

---

## 💾 DATABASE CHANGES

### New Tables (10)
1. users (with RBAC)
2. user_consents
3. strength_profiles
4. aspect_timelines
5. calibration_entries & calibration_factors
6. journal_entries
7. profile_links & synergy_analyses
8. organizations, corporate_roles, candidates, teams
9. stock_universes, research_sessions, astro_features
10. price_snapshots, predictions
11. audit_logs

### Migration Strategy
- Create MySQL schema (Phase 1)
- Migrate existing localStorage data
- Implement data validation
- Set up backups

---

## 🎯 SUCCESS METRICS

### Phase 1 Completion
- ✅ User authentication working
- ✅ MySQL database operational
- ✅ Aspect intensity calculations accurate
- ✅ Timeline visualization functional

### Phase 2 Completion
- ✅ Strength attributes calculated
- ✅ Calibration system tracking
- ✅ Journal entries stored
- ✅ Predictions accurate within ±1.5 points

### Phase 3 Completion
- ✅ Synergy scores calculated
- ✅ Corporate assessments working
- ✅ Team synergy analysis functional
- ✅ Candidate pipeline operational

### Phase 4 Completion
- ✅ Research sessions running
- ✅ Backtesting results accurate
- ✅ Disclaimers prominent
- ✅ Safety features enforced

### Phase 5 Completion
- ✅ Performance: <500ms API response
- ✅ Security: Audit passed
- ✅ Documentation: Complete
- ✅ Production: Live and stable

---

## 📋 NEXT IMMEDIATE STEPS

### Week 1 Actions
1. ✅ Review PRD2 (DONE)
2. ✅ Create task list (DONE)
3. 📋 Set up MySQL database
4. 📋 Implement user authentication
5. 📋 Create API gateway middleware

### Week 2-4 Actions
1. Complete Phase 1 foundation
2. Begin Phase 2 individual module
3. Set up CI/CD pipeline
4. Establish testing framework

---

## 📞 RESOURCE REQUIREMENTS

### Team Composition
- **Backend:** 2-3 developers (Python/FastAPI)
- **Frontend:** 1-2 developers (Next.js/React)
- **DevOps:** 1 engineer (Infrastructure)
- **QA:** 1 tester (Testing)
- **PM:** 1 manager (Coordination)

### Infrastructure
- MySQL 8.0+ database
- Redis cache
- AWS/GCP/Azure hosting
- Docker containers
- CI/CD pipeline

### External APIs
- Market data API (stock prices)
- Location services (existing)
- AI providers (existing)

---

**Status:** Ready to begin Phase 1  
**Estimated Completion:** 20 weeks  
**Next Review:** After Phase 1 completion

