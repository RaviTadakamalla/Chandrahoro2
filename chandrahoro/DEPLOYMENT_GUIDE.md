# ChandraHoro Azure Deployment Guide

**Version**: 2.1.0
**Last Updated**: 2025-10-29
**Target Platform**: Microsoft Azure

## 📋 Pre-Deployment Checklist

### ✅ Application Status
- [x] Swiss Ephemeris integrated and working
- [x] Planetary position calculations verified (excellent accuracy)
- [x] Location search with geocoding APIs implemented
- [x] Frontend and backend fully functional
- [x] All core features implemented and tested
- [x] AI features (Daily Predictions, Yearly Predictions, Prashna) implemented
- [x] NextAuth.js v4 authentication configured
- [x] Prisma ORM with MySQL database schema

### ✅ Dependencies Status
- [x] Frontend: All dependencies in package.json (Next.js 14.2.15)
- [x] Backend: All dependencies in requirements.txt (FastAPI 0.104.1)
- [x] pyswisseph installed and verified
- [x] aiohttp installed for async API calls
- [x] Prisma Client configured for MySQL

---

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: Next.js 14.0.4 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand + React Query
- **Build Output**: Static + Server-side rendering

### Backend Stack
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.13
- **Async Runtime**: Uvicorn
- **Database**: MySQL 8.0+ with SQLAlchemy ORM
- **Caching**: Redis (optional, for performance)
- **Ephemeris**: Swiss Ephemeris (pyswisseph)

---

## 🚀 Azure Deployment Architecture

### Recommended Azure Setup

```
Azure Resource Group: chandrahoro-prod
├── App Service Plan (Linux, B2 or higher)
│   ├── Frontend App Service (Node.js 18+)
│   │   └── Next.js 14 application
│   └── Backend App Service (Python 3.11+)
│       └── FastAPI application
├── Azure Database for MySQL (8.0+)
│   └── Prisma ORM connection
├── Azure Storage Account
│   └── Static assets & backups
├── Azure Cache for Redis (optional)
│   └── Session & caching layer
├── Application Insights
│   └── Monitoring & logging
└── Key Vault
    └── Secrets management
```

### Prerequisites for Azure Deployment

1. **Azure Account**: Active subscription with sufficient credits
2. **Azure CLI**: Installed and authenticated (`az login`)
3. **GitHub Repository**: Code pushed to GitHub
4. **API Keys**: Anthropic, Google Maps, etc.
5. **Secrets**: Generated NEXTAUTH_SECRET, JWT_SECRET, etc.

---

## 📝 Part 1: GitHub Repository Setup

### Step 1.1: Initialize Git Repository

```bash
cd /Users/ravitadakamalla/chandrahoro
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 1.2: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `chandrahoro`
3. Choose: **Private** (recommended)
4. Do NOT initialize with README

### Step 1.3: Add Remote and Initial Commit

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/chandrahoro.git

# Create main branch
git branch -M main

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: ChandraHoro V2.1 - Full-stack Vedic Astrology application

- Frontend: Next.js 14 with Pages Router
- Backend: Python FastAPI with Swiss Ephemeris
- Database: MySQL 8.0+ with Prisma ORM
- Auth: NextAuth.js v4
- AI: Anthropic Claude integration"

# Push to GitHub
git push -u origin main
```

### Step 1.4: Create Production Branch

```bash
# Create production branch
git checkout -b production
git push -u origin production

# Switch back to main
git checkout main
```

---

## 🔍 Part 2: Azure Resource Analysis

**⏳ WAITING FOR YOUR SCREENSHOT**

Please provide a screenshot showing your existing Azure resources:
- Resource groups
- App Services
- Database instances
- Storage accounts
- Virtual networks
- Application Insights
- Key Vault

This will help identify reusable resources and optimize costs.

---

## 🏗️ Part 3: Deployment Architecture Details

### Frontend Deployment Options

#### Option 1: **Azure App Service** (Recommended for full control)
- **Pros**: Full control, integrated with Azure ecosystem, good for full-stack
- **Cons**: Requires more configuration than Vercel
- **Cost**: $15-50+/month depending on tier
- **Setup Time**: 30-45 minutes

#### Option 2: **Vercel** (Recommended for Next.js)
- **Pros**: Native Next.js support, automatic deployments, edge functions
- **Cons**: Vendor lock-in, separate from backend
- **Cost**: Free tier available, $20+/month for production
- **Setup Time**: 5 minutes

#### Option 3: **Netlify**
- **Pros**: Easy setup, good free tier, serverless functions
- **Cons**: Less optimized for Next.js than Vercel
- **Cost**: Free tier available, $19+/month for production
- **Setup Time**: 10 minutes

#### Option 3: **Self-hosted (Docker)**
- **Pros**: Full control, no vendor lock-in
- **Cons**: Requires infrastructure management
- **Cost**: $5-20/month (VPS)
- **Setup Time**: 30 minutes

### Backend Deployment Options

#### Option 1: **Railway** (Recommended for FastAPI)
- **Pros**: Simple deployment, good free tier, MySQL 8.0+ included
- **Cons**: Smaller community than AWS
- **Cost**: Free tier available, $5+/month for production
- **Setup Time**: 10 minutes

#### Option 2: **Render**
- **Pros**: Easy setup, free tier, good documentation
- **Cons**: Cold starts on free tier
- **Cost**: Free tier available, $7+/month for production
- **Setup Time**: 10 minutes

#### Option 3: **AWS (EC2 + RDS)**
- **Pros**: Scalable, reliable, many services
- **Cons**: Complex setup, requires AWS knowledge
- **Cost**: $10-50+/month
- **Setup Time**: 1-2 hours

#### Option 4: **Google Cloud Run**
- **Pros**: Serverless, pay-per-use, good for APIs
- **Cons**: Cold starts, requires Docker
- **Cost**: Free tier available, $0.00002400/vCPU-second
- **Setup Time**: 30 minutes

---

## 📦 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Chandrahoro
```

### Backend (.env)
```
ENVIRONMENT=production
DEBUG=False
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
GEONAMES_USERNAME=your_username
OPENAI_API_KEY=your_key (optional)
ANTHROPIC_API_KEY=your_key (optional)
```

---

## 🔧 Production Build Steps

### Frontend Build
```bash
cd frontend
npm install
npm run build
npm run type-check
npm run test:ci
```

### Backend Build
```bash
cd backend
pip install -r requirements.txt
pytest
```

---

## 📊 Recommended Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Users (Browser)                       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────┐            ┌──────▼──────┐
    │ Vercel │            │   Railway   │
    │(Frontend)           │ (Backend)   │
    └────────┘            └──────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                ┌───▼────┐            ┌──────▼──────┐
                │MySQL 8.0+           │   Redis    │
                │(User Data)          │ (Cache)    │
                │(Prisma ORM)         │            │
                └────────┘            └────────────┘
```

---

---

## 🎯 Step-by-Step Deployment Guide

### Phase 1: Pre-Deployment Testing

#### 1.1 Test Frontend Production Build Locally
```bash
cd frontend
npm run build
npm run start
# Visit http://localhost:3000 and test all features
```

#### 1.2 Test Backend Production Mode Locally
```bash
cd backend
source venv/bin/activate
export ENVIRONMENT=production
export DEBUG=False
uvicorn app.main:app --host 0.0.0.0 --port 8001
# Test API endpoints with curl or Postman
```

#### 1.3 Verify Swiss Ephemeris
```bash
cd backend
python -c "import swisseph; print('Swiss Ephemeris available')"
```

#### 1.4 Test Location Search
```bash
curl -X POST http://localhost:8001/api/v1/location/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Mumbai"}'
```

---

### Phase 2: Deploy Backend to Railway

#### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

#### 2.2 Connect GitHub Repository
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Authorize Railway to access your GitHub
4. Select the chandrahoro repository

#### 2.3 Configure Backend Service
1. In Railway dashboard, click "Add Service"
2. Select "GitHub Repo"
3. Choose the chandrahoro repository
4. Set the root directory to `backend`

#### 2.4 Set Environment Variables
In Railway dashboard, go to Variables and add:
```
ENVIRONMENT=production
DEBUG=False
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
GEONAMES_USERNAME=your_geonames_username
OPENAI_API_KEY=your_key (optional)
ANTHROPIC_API_KEY=your_key (optional)
REDIS_HOST=redis_service_host
REDIS_PORT=6379
```

#### 2.5 Add MySQL Database (Optional)
1. Click "Add Service" → "Database" → "MySQL"
2. Railway will automatically set DATABASE_URL
3. Ensure MySQL 8.0+ is selected for JSON support

#### 2.6 Add Redis Cache (Optional)
1. Click "Add Service" → "Database" → "Redis"
2. Railway will automatically set REDIS_URL

#### 2.7 Deploy
1. Railway will automatically deploy on push to main branch
2. Get the backend URL from Railway dashboard (e.g., https://api.railway.app)

---

### Phase 3: Deploy Frontend to Vercel

#### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub

#### 3.2 Import Project
1. Click "New Project"
2. Select the chandrahoro repository
3. Vercel will auto-detect Next.js

#### 3.3 Configure Build Settings
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

#### 3.4 Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=Chandrahoro
NEXT_PUBLIC_ENABLE_AI_FEATURES=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### 3.5 Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Get the frontend URL (e.g., https://chandrahoro.vercel.app)

---

### Phase 4: Configure CORS and API Connection

#### 4.1 Update Backend CORS Settings
In `backend/.env`:
```
BACKEND_CORS_ORIGINS=["https://chandrahoro.vercel.app"]
```

#### 4.2 Update Frontend API URL
In Vercel dashboard, update:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
```

#### 4.3 Redeploy Both Services
- Push changes to trigger automatic redeployment
- Or manually trigger redeployment in both dashboards

---

### Phase 5: Configure Custom Domain (Optional)

#### 5.1 Frontend Custom Domain (Vercel)
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain (e.g., chandrahoro.com)
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

#### 5.2 Backend Custom Domain (Railway)
1. In Railway dashboard, go to Settings → Domains
2. Add your API domain (e.g., api.chandrahoro.com)
3. Update DNS records
4. SSL certificate auto-provisioned

---

### Phase 6: Post-Deployment Testing

#### 6.1 Smoke Tests
```bash
# Test frontend
curl https://chandrahoro.vercel.app

# Test backend health
curl https://api.railway.app/api/v1/health

# Test chart calculation
curl -X POST https://api.railway.app/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Test User",
      "date": "1990-01-01",
      "time": "12:00:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "Delhi, India"
    }
  }'
```

#### 6.2 Verify Features
- [ ] Chart generation works
- [ ] Location search works
- [ ] Divisional charts display correctly
- [ ] PDF export works
- [ ] Image export works
- [ ] Sharing functionality works
- [ ] No console errors in browser

#### 6.3 Performance Testing
- [ ] Frontend Lighthouse score > 80
- [ ] Backend response time < 2 seconds
- [ ] Chart calculation < 5 seconds

---

### Phase 7: Monitoring and Maintenance

#### 7.1 Set Up Monitoring
- **Vercel**: Built-in analytics and error tracking
- **Railway**: Built-in logs and monitoring
- Consider adding Sentry for error tracking

#### 7.2 Enable Logging
```bash
# Backend logs in Railway dashboard
# Frontend errors in Vercel dashboard
```

#### 7.3 Regular Maintenance
- Monitor API response times
- Check error rates
- Update dependencies monthly
- Review and optimize database queries

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Frontend production build successful
- [x] Backend dependencies verified
- [x] Swiss Ephemeris installed
- [x] Environment variables documented
- [x] CORS configuration ready
- [ ] GeoNames API key obtained
- [ ] Custom domain registered (optional)

### Deployment
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Custom domains configured (optional)
- [ ] SSL certificates verified

### Post-Deployment
- [ ] Smoke tests passed
- [ ] All features verified
- [ ] Performance acceptable
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Documentation updated

---

## 🔗 Useful Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Swiss Ephemeris**: https://www.astro.com/swisseph/

---

## 📞 Support

For deployment issues:
1. Check Railway and Vercel logs
2. Review environment variables
3. Verify CORS configuration
4. Test API endpoints with curl
5. Check browser console for errors

