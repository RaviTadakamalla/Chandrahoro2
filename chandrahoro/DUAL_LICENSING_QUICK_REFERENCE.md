# ChandraHoro Dual Licensing - Quick Reference Guide

**Last Updated:** 2025-01-23

---

## 🎯 TL;DR - Can I Do This?

| Question | Answer | Why |
|----------|--------|-----|
| Can I keep AGPL core + proprietary extensions? | ✅ YES | Open Core model (GitLab, Nextcloud) |
| Can I charge for proprietary features? | ✅ YES | They're not AGPL-licensed |
| Can I use OpenAI/Claude in extensions? | ✅ YES | Extensions can use any libraries |
| Can I keep extension source code private? | ✅ YES | Only AGPL code must be public |
| Must I provide AGPL core source code? | ✅ YES | To users who access it over network |
| Can someone fork the AGPL core? | ✅ YES | But not your proprietary extensions |
| Can I sell managed hosting? | ✅ YES | AGPL allows commercial services |
| Can proprietary code import pyswisseph? | ❌ NO | Would make it AGPL derivative |
| Can I modify AGPL code and keep it private? | ❌ NO | Modifications must be AGPL |

---

## 📊 Feature Classification Cheat Sheet

### ✅ CAN BE PROPRIETARY (No AGPL dependency)

**AI & Analytics:**
- ✅ AI-powered interpretations (OpenAI/Claude)
- ✅ Advanced analytics dashboard
- ✅ Pattern recognition algorithms
- ✅ Predictive insights

**Reports & Export:**
- ✅ Premium PDF reports
- ✅ Custom branding/white-label
- ✅ Excel/CSV exports
- ✅ Email reports

**Collaboration:**
- ✅ Team workspaces
- ✅ Multi-user features
- ✅ Sharing & comments
- ✅ Role-based access

**Integrations:**
- ✅ Zapier integration
- ✅ Calendar sync
- ✅ Slack notifications
- ✅ Third-party APIs

**Mobile & UI:**
- ✅ Native mobile apps (iOS/Android)
- ✅ Advanced visualizations
- ✅ Interactive 3D charts
- ✅ Custom themes

**Business Features:**
- ✅ API access (rate limiting)
- ✅ Priority support
- ✅ SLA guarantees
- ✅ Enterprise SSO

### ❌ MUST BE AGPL (Uses pyswisseph)

**Core Calculations:**
- ❌ Planetary positions
- ❌ Ascendant/house calculations
- ❌ Jaimini Chara Karakas
- ❌ Chara Dasha
- ❌ Vimshottari Dasha
- ❌ KP Sub-lords
- ❌ Divisional charts (D1-D60)
- ❌ Yogas detection
- ❌ Aspects (Graha/Rashi Drishti)
- ❌ Panchanga calculations
- ❌ Muhurta selection

**Core Features:**
- ❌ Basic chart display
- ❌ Core API endpoints
- ❌ Database models
- ❌ Authentication/authorization

---

## 💰 Pricing Strategy

### Recommended Tiers

| Tier | Price | Features | Target Audience |
|------|-------|----------|-----------------|
| **Free** | $0/month | All AGPL features | Self-hosters, learners |
| **Pro** | $29/month | AI + Analytics + Reports | Serious practitioners |
| **Business** | $79/month | Pro + Team + Mobile | Astrology firms |
| **Enterprise** | $299/month | Business + White Label + API | Consultants, platforms |

### Revenue Projections (Conservative)

**Year 1:**
- 10,000 free users
- 500 Pro ($29) = $14,500/month
- 100 Business ($79) = $7,900/month
- 20 Enterprise ($299) = $5,980/month
- **Total: $340,560/year**

**Year 2:**
- 50,000 free users
- 2,500 Pro = $72,500/month
- 500 Business = $39,500/month
- 100 Enterprise = $29,900/month
- **Total: $1,702,800/year**

---

## 🏗️ Technical Architecture

### Directory Structure

```
chandrahoro/
├── LICENSE                    # Dual licensing notice
├── LICENSE-AGPL-3.0          # Full AGPL text
│
├── backend/                   # AGPL-3.0
│   ├── LICENSE               # AGPL-3.0
│   ├── app/
│   │   ├── core/            # Calculation engines
│   │   ├── api/             # Core API
│   │   └── plugins/         # Plugin interface
│   └── requirements.txt     # AGPL-compatible only
│
├── frontend/                  # AGPL-3.0
│   ├── LICENSE               # AGPL-3.0
│   └── src/
│
└── extensions/                # PROPRIETARY
    ├── LICENSE-PROPRIETARY   # Proprietary license
    ├── ai_insights/          # AI interpretations
    ├── premium_reports/      # PDF generation
    ├── team_features/        # Collaboration
    └── analytics/            # Advanced analytics
```

### Plugin Interface Pattern

**AGPL Core defines interface:**
```python
# backend/app/plugins/interface.py (AGPL-3.0)
class ChandraHoroPlugin(ABC):
    @abstractmethod
    def process_chart(self, chart_data: Dict) -> Dict:
        pass
```

**Proprietary extension implements:**
```python
# extensions/ai_insights/plugin.py (PROPRIETARY)
class AIInsightsPlugin(ChandraHoroPlugin):
    def process_chart(self, chart_data: Dict) -> Dict:
        # Use OpenAI/Claude - proprietary code
        return {"ai_insights": interpretation}
```

**Key:** Communication only through API boundary, no direct imports.

---

## 📋 Compliance Checklist

### AGPL Core Requirements

- [ ] Add AGPL-3.0 LICENSE file to `backend/` and `frontend/`
- [ ] Add copyright headers to all AGPL source files
- [ ] Provide "Source Code" link in website footer
- [ ] Create `/license` page with full AGPL text
- [ ] Add "View Source" link to GitHub repository
- [ ] Document how to self-host in README

### Proprietary Extensions Requirements

- [ ] Add LICENSE-PROPRIETARY file to `extensions/`
- [ ] Add proprietary copyright headers to extension files
- [ ] Implement license validation system
- [ ] Create pricing page on website
- [ ] Add "Upgrade to Pro" CTAs in UI
- [ ] Document which features are proprietary

### Legal Protection

- [ ] Consult with open source licensing attorney
- [ ] Register "ChandraHoro" trademark
- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Create EULA for proprietary extensions

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Month 1-2)
- Create `extensions/` directory
- Implement plugin interface
- Add dual licensing notices
- Update documentation

### Phase 2: First Extension (Month 3-4)
- Build AI Insights plugin
- Implement license management
- Integrate Stripe payments
- Launch pricing page

### Phase 3: Growth (Month 5-12)
- Add more premium features
- Build mobile apps
- Launch affiliate program
- Scale to 10,000 users

---

## ⚠️ Common Pitfalls to Avoid

| Pitfall | Why It's Bad | Solution |
|---------|--------------|----------|
| Importing pyswisseph in extensions | Makes extension AGPL | Use plugin API only |
| Unclear licensing notices | Legal confusion | Clear headers in every file |
| Mixing AGPL and proprietary in same file | License violation | Strict separation |
| Not providing AGPL source | AGPL violation | GitHub link in footer |
| Calling AGPL functions directly | Creates derivative work | Use REST API boundary |

---

## 📚 Resources

**Documentation:**
- Full Strategy: `DUAL_LICENSING_STRATEGY.md`
- AGPL Compliance: `AGPL_COMPLIANCE.md`
- Licensing Guide: `LICENSING_GUIDE.md`

**Legal:**
- AGPL-3.0 License: https://www.gnu.org/licenses/agpl-3.0.html
- Open Core Model: https://en.wikipedia.org/wiki/Open-core_model
- FSF AGPL FAQ: https://www.gnu.org/licenses/agpl-3.0-faq.html

**Examples:**
- GitLab: https://about.gitlab.com/install/ce-or-ee/
- Nextcloud: https://nextcloud.com/pricing/
- Grafana: https://grafana.com/pricing/

---

## 🤝 Support

**Questions about licensing?**
- Email: licensing@chandrahoro.com
- Legal review: Consult open source attorney
- Community: GitHub Discussions

**Questions about implementation?**
- Technical docs: `DUAL_LICENSING_STRATEGY.md`
- Architecture: See diagrams in main document
- Code examples: See `backend/app/plugins/`

---

**Version:** 1.0  
**Last Updated:** 2025-01-23
