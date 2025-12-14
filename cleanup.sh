#!/bin/bash
set -e

echo "🧹 Cleaning up ChandraHoro project..."
echo "=================================="
echo ""

# Confirm before proceeding
read -p "This will delete old status reports and cache files. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "📄 Step 1: Removing old status reports from root..."
rm -fv AI_PROMPT_CONFIGURATION_GAP_ANALYSIS.md
rm -fv PERFORMANCE_FIXES_SUMMARY.md
rm -fv PERFORMANCE_FIX_QUICK_START.md
rm -fv VSCODE_PERFORMANCE_OPTIMIZATION_REPORT.md
rm -fv AI_PROMPT_BIRTH_DETAILS_GUIDE.md
rm -fv AI_REPORTS_SUMMARY.md
rm -fv DEPLOYMENT_GUIDE.md

echo ""
echo "📄 Step 2: Removing old status reports from chandrahoro/..."
cd chandrahoro
rm -fv AUTHENTICATION_TESTING_EXECUTION.md
rm -fv QUICK_VALIDATION_CHECKLIST.md
rm -fv LOCATION_NAME_FIX_SUMMARY.md
rm -fv S2_T3_CHART_VISUALIZATION_COMPLETE.md
rm -fv ASTROGYAN_CHECKMARK_REMOVED.md
rm -fv FINAL_FIXES_COMPLETE.md
rm -fv PHASE1_IMPLEMENTATION_PROGRESS.md
rm -fv COMPREHENSIVE_STATUS_REPORT.md
rm -fv S2_T6_AUTHENTICATION_FLOWS_COMPLETE.md
rm -fv DUAL_LICENSING_IMPLEMENTATION_STATUS_REPORT.md
rm -fv TESTING_AND_NEXT_STEPS_SUMMARY.md
rm -fv VALIDATION_DOCUMENTATION_INDEX.md
rm -fv HOME_NAVIGATION_UPDATE_QUICK_REFERENCE.md
rm -fv NEXT_TASKS_AFTER_HYDRATION_FIX.md
rm -fv HYDRATION_ERROR_TROUBLESHOOTING.md
rm -fv DASHA_COMPARISON_COMPLETE.md
rm -fv LAYOUT_CHANGES_SUMMARY.md
rm -fv HOME_PAGE_LAYOUT_UPDATE.md
rm -fv TAB_SWITCHING_VISUAL_COMPARISON.md
rm -fv AI_PROMPT_CONFIG_BEFORE_AFTER.md
rm -fv INTENSITY_ANALYSIS_FIXES_COMPLETE.md
rm -fv PHASE2_TASK_2_1_IMPLEMENTATION.md
rm -fv HOME_NAVIGATION_UPDATE_FINAL_SUMMARY.md
rm -fv NEXT_DEVELOPMENT_TASKS_PRIORITIZED.md
rm -fv BIRTH_DETAILS_FORM_TAB_CONSOLIDATION_TECHNICAL_GUIDE.md
rm -fv LOVEONE_BRANCH_COMMIT_SUMMARY.md
rm -fv LOCALHOST_READY.md
rm -fv HOME_NAVIGATION_UPDATE_COMPLETE.md
rm -fv BUILD_AND_DEPLOYMENT_PLAN.md
rm -fv DESIGN_SYSTEM_ROLLOUT_COMPLETE.md
rm -fv SITE_NAME_CHANGE_COMPLETE.md
rm -fv HYDRATION_ERROR_ROOT_CAUSE_FIXED.md
rm -fv CHANGES_SUMMARY.md
rm -fv deployment.log
cd ..

echo ""
echo "🐍 Step 3: Removing Python cache files..."
find chandrahoro/backend -type d -name "__pycache__" -exec rm -rfv {} + 2>/dev/null || true
find chandrahoro/backend -type f -name "*.pyc" -delete -print 2>/dev/null || true
find chandrahoro/backend -type f -name "*.pyo" -delete -print 2>/dev/null || true

echo ""
echo "📦 Step 4: Removing old webpack cache files..."
find chandrahoro/frontend/.next/cache -name "*.old" -delete -print 2>/dev/null || true

echo ""
echo "📁 Step 5: Creating organized docs structure..."
mkdir -p docs/guides
mkdir -p docs/references
mkdir -p docs/archive

# Move important documentation to organized structure
if [ -f "CLAUDE.md" ]; then
    echo "  Moving CLAUDE.md to docs/"
    mv CLAUDE.md docs/CLAUDE.md
fi

if [ -f "chandrahoro/HOSTINGER_VPS_DEPLOYMENT_COMPLETE_GUIDE.md" ]; then
    echo "  Moving deployment guide to docs/guides/"
    mv chandrahoro/HOSTINGER_VPS_DEPLOYMENT_COMPLETE_GUIDE.md docs/guides/DEPLOYMENT.md
fi

if [ -f "chandrahoro/PARASHARA_CORE_IMPLEMENTATION_GUIDE.md" ]; then
    echo "  Moving Parashara guide to docs/references/"
    mv chandrahoro/PARASHARA_CORE_IMPLEMENTATION_GUIDE.md docs/references/PARASHARA_CORE.md
fi

if [ -f "chandrahoro/DASHA_INTENSITY_USER_GUIDE.md" ]; then
    echo "  Moving Dasha guide to docs/guides/"
    mv chandrahoro/DASHA_INTENSITY_USER_GUIDE.md docs/guides/DASHA_INTENSITY.md
fi

if [ -f "chandrahoro/MULTI_METHODOLOGY_ROADMAP.md" ]; then
    echo "  Moving methodology roadmap to docs/references/"
    mv chandrahoro/MULTI_METHODOLOGY_ROADMAP.md docs/references/MULTI_METHODOLOGY_ROADMAP.md
fi

if [ -f "chandrahoro/KP_IMPLEMENTATION_STATUS.md" ]; then
    echo "  Moving KP implementation to docs/references/"
    mv chandrahoro/KP_IMPLEMENTATION_STATUS.md docs/references/KP_IMPLEMENTATION_STATUS.md
fi

if [ -f "chandrahoro/MYSQL_PRISMA_MIGRATION_GUIDE.md" ]; then
    echo "  Moving MySQL migration guide to docs/guides/"
    mv chandrahoro/MYSQL_PRISMA_MIGRATION_GUIDE.md docs/guides/MYSQL_MIGRATION.md
fi

if [ -f "chandrahoro/SUPABASE_TO_MYSQL_CONVERSION_COMPLETE.md" ]; then
    echo "  Moving Supabase conversion to docs/archive/"
    mv chandrahoro/SUPABASE_TO_MYSQL_CONVERSION_COMPLETE.md docs/archive/SUPABASE_CONVERSION.md
fi

if [ -f "chandrahoro/BACKEND_API_ENDPOINTS_IMPLEMENTATION.md" ]; then
    echo "  Moving API endpoints doc to docs/references/"
    mv chandrahoro/BACKEND_API_ENDPOINTS_IMPLEMENTATION.md docs/references/API_ENDPOINTS.md
fi

if [ -f "chandrahoro/ASTROGYAN_DOCUMENTATION_INDEX.md" ]; then
    echo "  Moving Astrogyan index to docs/references/"
    mv chandrahoro/ASTROGYAN_DOCUMENTATION_INDEX.md docs/references/ASTROGYAN_INDEX.md
fi

echo ""
echo "📝 Step 6: Creating README.md..."
cat > README.md << 'EOF'
# ChandraHoro - Vedic Astrology Platform

A production-ready Vedic astrology platform featuring astronomical calculations, multi-methodology support, AI-powered interpretations, and professional chart visualizations.

## Quick Links

- **[Setup Guide](docs/CLAUDE.md)** - Complete project overview and setup
- **[Deployment Guide](docs/guides/DEPLOYMENT.md)** - VPS deployment instructions
- **[API Reference](docs/references/API_ENDPOINTS.md)** - Backend API documentation

## Documentation Structure

```
docs/
├── CLAUDE.md                      # Main project guide
├── guides/                        # How-to guides
│   ├── DEPLOYMENT.md             # Production deployment
│   ├── MYSQL_MIGRATION.md        # Database setup
│   └── DASHA_INTENSITY.md        # Feature guides
├── references/                    # Technical references
│   ├── API_ENDPOINTS.md          # API documentation
│   ├── PARASHARA_CORE.md         # Calculation methods
│   └── MULTI_METHODOLOGY_ROADMAP.md
└── archive/                       # Historical documents
    └── SUPABASE_CONVERSION.md
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11+, Swiss Ephemeris
- **Database:** MySQL 8.0 + Prisma ORM
- **Cache:** Redis 7
- **AI:** Anthropic Claude, OpenAI

## Quick Start

### Backend
```bash
cd chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd chandrahoro/frontend
npm run dev
```

## Project Status

✅ Core astrology calculations (Parashara, KP, Jaimini, Western)
✅ AI-powered chart interpretations
✅ Dasha period analysis
✅ Production deployment on VPS
🚧 Refactoring for better error handling (in progress)

---

For detailed information, see [docs/CLAUDE.md](docs/CLAUDE.md)
EOF

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Summary of changes:"
echo "==================="
echo "✓ Removed 40+ old status report files"
echo "✓ Cleaned Python __pycache__ directories"
echo "✓ Removed old webpack cache files"
echo "✓ Organized documentation into docs/ structure"
echo "✓ Created new README.md"
echo ""
echo "Documentation is now organized in:"
echo "  docs/guides/     - How-to guides"
echo "  docs/references/ - Technical references"
echo "  docs/archive/    - Historical documents"
echo ""
echo "Next steps:"
echo "1. Review docs/ directory"
echo "2. Commit changes: git add . && git commit -m 'chore: cleanup old files and organize docs'"
echo "3. Continue with refactoring from the checklist"
