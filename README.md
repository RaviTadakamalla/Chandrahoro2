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
