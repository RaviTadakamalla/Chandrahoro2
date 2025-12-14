# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**ChandraHoro** is a production-ready Vedic astrology platform featuring astronomical calculations, multi-methodology support, AI-powered interpretations, and professional chart visualizations.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.6, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+, Swiss Ephemeris |
| **Database** | MySQL 8.0 + Prisma ORM |
| **Cache** | Redis 7 |
| **AI** | Anthropic Claude, OpenAI |
| **State** | Zustand (global), React Query (server), React Hook Form |
| **UI** | shadcn/ui + Radix UI |

## Project Structure

```
chandrahoro/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/    # API endpoints (38+ routes)
│   │   ├── core/      # Calculation engines (ephemeris, dasha, houses)
│   │   ├── services/  # Business logic layer
│   │   └── models/    # Database models
│   └── tests/
├── frontend/          # Next.js frontend
│   └── src/
│       ├── app/       # Next.js App Router pages
│       ├── components/# React components by domain
│       ├── hooks/     # Custom hooks (useChart, useDasha, etc.)
│       └── lib/       # Utilities and API client
├── docker/            # Docker Compose setup
└── nginx/             # Reverse proxy config
```

## Essential Commands

### Backend
```bash
cd chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000   # Run dev server
pytest                                       # Run tests
pytest --cov=app                            # Run with coverage
```

### Frontend
```bash
cd chandrahoro/frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm test             # Jest tests
```

### Docker
```bash
docker-compose -f docker/docker-compose.yml up      # Start all services
docker-compose -f docker/docker-compose.yml down    # Stop all
```

## Architecture Patterns

### Backend
- **Layered**: API → Service → Methodology Registry → Calculation Engine
- **Plugin System**: Methodology Registry for swappable calculation methods
  - Parashara, KP System, Jaimini, Western
- **Async-First**: FastAPI async/await throughout

### Frontend
- **Component Organization**: By domain (`/chart`, `/auth`, `/ai`, `/dashboard`)
- **API Client**: Centralized in `/src/lib/api.ts`
- **Hooks Pattern**: Domain hooks (`useChart`, `useDasha`, `useTransits`)

## Key Files

| Purpose | Location |
|---------|----------|
| API client | `frontend/src/lib/api.ts` |
| Main entry | `backend/app/main.py` |
| Ephemeris calculations | `backend/app/core/ephemeris.py` |
| Chart service | `backend/app/services/chart_service.py` |
| Type definitions | `frontend/src/types/` |
| Tailwind config | `frontend/tailwind.config.js` |
| Next.js config | `frontend/next.config.js` |

## Methodologies Supported

- **Parashara** - Traditional Vedic (primary)
- **KP System** - Krishnamurti Paddhati
- **Jaimini** - Jaimini Sutras
- **Western** - Tropical/Western astrology

## Ayanamsha Options

Lahiri, Raman, KP, Fagan/Bradley, Yukteshwar

## Code Conventions

- **Python**: PEP 8, type hints, async/await for I/O
- **TypeScript**: Strict mode, Zod for validation
- **Components**: Functional with hooks, co-located styles
- **API**: RESTful, versioned (`/api/v1/`)
- **Formatting**: Prettier (frontend), Black (backend)

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=mysql://user:pass@localhost:3306/chandrahoro
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SECRET_KEY=...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Database

- **ORM**: Prisma (frontend types), SQLAlchemy (backend)
- **Migrations**: Alembic for backend schema changes
- **Tables**: 21+ (users, charts, subscriptions, cache, audit_logs)

## Testing

### Backend
```bash
pytest tests/unit/              # Unit tests
pytest tests/integration/       # Integration tests
pytest -k "test_ephemeris"      # Specific tests
```

### Frontend
```bash
npm test                        # All tests
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage
```

## Common Tasks

### Add new API endpoint
1. Create route in `backend/app/api/v1/`
2. Add service logic in `backend/app/services/`
3. Register in `backend/app/api/v1/__init__.py`

### Add new frontend page
1. Create in `frontend/src/app/[route]/page.tsx`
2. Add components in `frontend/src/components/`
3. Create hooks if needed in `frontend/src/hooks/`

### Add new calculation method
1. Implement in `backend/app/core/`
2. Register with Methodology Registry
3. Add tests in `backend/tests/`

## Performance Notes

- Large `node_modules` (1.2GB) - excluded from VS Code indexing
- `.next` build cache (158MB) - regenerated on build
- Redis caching for natal positions, transits, dasha periods

## Production

- **Domain**: valuestream.in
- **VPS**: Hostinger (72.61.174.232)
- **Process**: PM2 (frontend), systemd (backend)
- **Proxy**: Nginx with SSL/TLS
