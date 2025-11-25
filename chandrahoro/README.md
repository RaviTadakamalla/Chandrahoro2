# ChandraHoro - Vedic Horoscope Chart Pack Application

<div align="center">

**Transform birth data into professional-grade Vedic horoscope charts with astronomical precision**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

</div>

## 🌟 Features

### Core Capabilities
- **Astronomical Precision**: Swiss Ephemeris integration for ±0.01" accuracy
- **Multiple Ayanamshas**: Lahiri (default), Raman, KP, Fagan/Bradley, Yukteshwar
- **Divisional Charts**: D1, D9, D10, and extended divisionals (D2-D60)
- **Dasha Systems**: Vimshottari dasha with Mahā/Antara/Pratyantara timelines
- **Planetary Strengths**: Shadbala and Ashtakavarga calculations
- **Yoga Detection**: Classical yoga identification with interpretations
- **Transit Analysis**: Current transits, Sade Sati, and 12-month forecasting
- **AI Insights**: Optional AI-powered interpretations (Phase 2)

### Export & Sharing
- **PDF Reports**: Professional 20-30 page chart packs
- **Image Exports**: High-resolution PNG (2400x2400px) and scalable SVG
- **JSON Data**: Complete chart data for API integrations
- **Responsive Design**: Mobile-first UI (320px-1536px+ breakpoints)

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+) with async support
- **Calculations**: Swiss Ephemeris (pyswisseph) for planetary positions
- **Location Services**: GeoNames API + timezonefinder for geocoding
- **PDF Generation**: ReportLab for professional reports
- **Caching**: Redis for session management (24-hour expiry)
- **Testing**: pytest with >85% coverage target

### Frontend
- **Framework**: Next.js 14 (React 18) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: Zustand (global) + React Query (API)
- **Charts**: Custom SVG components (North/South Indian layouts)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library

## 📁 Project Structure

```
chandrahoro/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── core/         # Calculation engines (ephemeris, dasha, strength)
│   │   ├── api/v1/       # API endpoints (chart, locations, transits)
│   │   ├── models/       # Pydantic data models
│   │   ├── services/     # Business logic (location, export, AI)
│   │   └── utils/        # Helpers (cache, validators)
│   └── tests/            # Unit and integration tests
├── frontend/             # Next.js application
│   └── src/
│       ├── components/   # UI components (ui, charts, forms, layout)
│       ├── pages/        # Next.js pages/routes
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities (API client, constants)
│       └── types/        # TypeScript definitions
├── docker/               # Docker Compose configuration
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Documentation (PRD, tasks, UI specs)
```

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **Redis**: 7+ (optional, for caching)
- **Docker**: Latest (optional, for containerized development)

### Quick Start (Local Development)

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# or
yarn dev
```

Frontend will be available at: http://localhost:3000

#### 3. Redis Setup (Optional)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally (macOS)
brew install redis
redis-server
```

### Docker Setup (Recommended)

```bash
# Start all services (backend, frontend, Redis)
docker-compose -f docker/docker-compose.yml up

# Stop all services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_ephemeris.py

# Run integration tests only
pytest -m integration
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Type checking
npm run type-check
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs (interactive API testing)
- **ReDoc**: http://localhost:8000/redoc (detailed documentation)

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chart/calculate` | POST | Generate complete chart |
| `/api/v1/chart/export/pdf` | POST | Export PDF report |
| `/api/v1/locations/search` | GET | Location autocomplete |
| `/api/v1/transits/current` | GET | Current planetary positions |
| `/health` | GET | Health check |

## 🛠️ Development Workflow

### Phase 1: MVP (Current)
1. ✅ Project structure setup
2. ⏳ Backend core calculations (ephemeris, dasha, houses)
3. ⏳ Frontend input forms and chart display
4. ⏳ API integration
5. ⏳ PDF export functionality

### Phase 2: Enhanced Features
- Extended divisional charts (D2-D60)
- AI interpretation integration
- Transit forecasting and heatmaps
- Advanced export options (PNG, SVG)

### Phase 3: Premium Features
- User accounts and authentication
- Chart saving and history
- Batch processing
- Payment integration

## 📖 Documentation

- **[PRD](docs/prd.md)**: Product Requirements Document
- **[Tasks](docs/tasks.md)**: Detailed task breakdown by phase
- **[UI Specs](docs/ui.md)**: UI/UX design specifications

## 🤝 Contributing

This is a proprietary project. For contribution guidelines, contact the development team.

## 📝 License

Proprietary - All rights reserved

## 🐛 Troubleshooting

### Backend Issues

**Import errors**: Ensure all directories have `__init__.py` files
```bash
find backend/app -type d -exec touch {}/__init__.py \;
```

**Swiss Ephemeris not found**: Install system dependencies
```bash
# macOS
brew install swisseph

# Ubuntu/Debian
sudo apt-get install libswe-dev
```

### Frontend Issues

**Module not found**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

**Tailwind not working**: Ensure PostCSS config is correct
```bash
npm install -D tailwindcss postcss autoprefixer
```

## 📞 Support

For questions or issues:
- Check existing documentation in `docs/`
- Review API documentation at `/docs`
- Contact the development team

## 🧪 Quick Test - Landing Page

To test the landing page immediately:

```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Start development server
npm run dev
```

Open http://localhost:3000 in your browser. You should see:
- ✅ Hero section with "Generate Your Complete Vedic Horoscope Chart"
- ✅ Features section with 3 cards
- ✅ Birth details form with name, date, time, location fields
- ✅ Responsive design (test on mobile viewport)
- ✅ Form submission with loading state (2-second simulation)

### What's Working
- Landing page UI with Tailwind CSS styling
- Responsive layout (mobile, tablet, desktop)
- Form validation and state management
- Loading states and animations
- shadcn/ui components (Button, Card, Input)

### What's Next
- Backend API integration
- Chart calculation and display
- Advanced form with location autocomplete
- Chart visualization components

---

**Built with ❤️ for Vedic Astrology enthusiasts and professionals**