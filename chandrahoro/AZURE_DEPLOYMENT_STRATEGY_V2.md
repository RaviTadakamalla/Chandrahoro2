# Azure Deployment Strategy for ChandraHoro V2.1

**Version**: 2.1.2  
**Date**: October 29, 2025  
**Status**: Planning Phase  
**Repository**: WhatTag/chandrahoro

---

## Executive Summary

This document provides a comprehensive Azure deployment strategy for the ChandraHoro Vedic Astrology application, analyzing the current localhost setup and recommending optimal Azure services for production deployment.

### Quick Recommendation

**✅ RECOMMENDED ARCHITECTURE:**
- **Frontend**: Azure App Service (Web App for Containers) - NOT Static Web Apps
- **Backend**: Azure Container Apps - NOT Container Instances
- **Database**: Azure Database for MySQL - Flexible Server
- **Cache**: Azure Cache for Redis (Optional)
- **CDN**: Azure Front Door (for global distribution)

**💰 Estimated Monthly Cost**: $150-250 USD (Basic tier)

---

## 1. Current Localhost Architecture Analysis

### 1.1 Frontend Stack
```
Technology: Next.js 14.2.33
Runtime: Node.js v22.17.1
Framework: React 18.3.1, TypeScript 5.6.3
Port: 3000
Build Output: Hybrid (SSR + Static)
```

**Key Features Requiring Special Attention:**
- ✅ **Server-Side Rendering (SSR)**: Dynamic pages with `getServerSideProps`
- ✅ **API Routes**: Next.js API routes in `/api/*` directory
- ✅ **Middleware**: Authentication and security middleware (`src/middleware.ts`)
- ✅ **Rewrites**: API proxy to backend (`/api/:path*` → `http://localhost:8000/api/:path*`)
- ✅ **Image Optimization**: Next.js Image component with remote patterns
- ✅ **NextAuth.js**: Authentication with session management
- ✅ **Prisma ORM**: Database access from frontend API routes

### 1.2 Backend Stack
```
Technology: FastAPI
Runtime: Python 3.13 (Uvicorn ASGI server)
Port: 8000
Database: MySQL 8.4.6 (aiomysql async driver)
```

**Key Features:**
- ✅ **30+ API Endpoints**: Chart calculation, locations, transits, AI, auth, etc.
- ✅ **Swiss Ephemeris**: Astronomical calculations (native library)
- ✅ **Async Operations**: aiomysql for database, async/await patterns
- ✅ **CORS**: Configured for localhost origins
- ✅ **Rate Limiting**: Redis-based (optional)
- ✅ **File Generation**: PDF, PNG, SVG chart exports

### 1.3 Database
```
MySQL 8.4.6
Character Set: utf8mb4_unicode_ci
Tables: 25 tables
Size: ~50MB (estimated for production)
```

**Key Tables:**
- Users, birth_charts, predictions, journal_entries
- Astrology data: astro_features, aspect_timelines, strength_profiles
- AI/LLM: llm_configs, llm_audit_logs
- Research: research_sessions, calibration_entries
- Organizations: teams, corporate_roles, permissions

### 1.4 External Dependencies
```
✅ GeoNames API: Location search (GEONAMES_USERNAME required)
✅ Anthropic API: AI-powered insights (ANTHROPIC_API_KEY)
✅ OpenAI API: Alternative AI provider (OPENAI_API_KEY)
⚠️ Google Maps API: Frontend maps (optional)
```

---

## 2. Azure Service Evaluation

### 2.1 Frontend Deployment Options

#### Option A: Azure Static Web Apps ❌ **NOT RECOMMENDED**

**Why NOT Static Web Apps:**
```
❌ Limited SSR Support: Only supports Next.js static export
❌ No API Routes: Cannot run Next.js API routes
❌ No Middleware: Cannot execute Edge middleware
❌ No Rewrites: Limited rewrite capabilities
❌ No NextAuth: Cannot run server-side auth
❌ No Prisma: Cannot connect to database from frontend
```

**Verdict**: ❌ **INCOMPATIBLE** - ChandraHoro uses SSR, API routes, middleware, and NextAuth

---

#### Option B: Azure App Service (Web App for Containers) ✅ **RECOMMENDED**

**Why App Service:**
```
✅ Full Next.js Support: SSR, API routes, middleware, everything works
✅ Container Support: Deploy Docker image with all dependencies
✅ Auto-scaling: Scale based on traffic
✅ Custom Domains: Easy SSL/TLS setup
✅ Deployment Slots: Blue-green deployments
✅ Built-in Monitoring: Application Insights integration
✅ Environment Variables: Secure configuration management
✅ Managed Platform: No infrastructure management
```

**Pricing:**
- **Basic (B1)**: $13/month - 1 core, 1.75GB RAM - Good for development
- **Standard (S1)**: $70/month - 1 core, 1.75GB RAM - Production ready
- **Premium (P1v3)**: $100/month - 2 cores, 8GB RAM - High performance

**Configuration:**
```yaml
Runtime: Docker Container
Image: ghcr.io/whattag/chandrahoro-frontend:latest
Port: 3000
Health Check: /api/health
Auto-scale: 1-3 instances (Standard tier)
```

**Verdict**: ✅ **HIGHLY RECOMMENDED** - Perfect fit for Next.js with all features

---

#### Option C: Azure Kubernetes Service (AKS) ⚠️ **OVERKILL**

**Why NOT AKS:**
```
⚠️ Complexity: Requires Kubernetes expertise
⚠️ Cost: Minimum $70/month + node costs
⚠️ Management: More operational overhead
⚠️ Overkill: Too complex for single frontend app
```

**Verdict**: ⚠️ **NOT RECOMMENDED** - Too complex for this use case

---

### 2.2 Backend Deployment Options

#### Option A: Azure Container Instances ❌ **NOT RECOMMENDED**

**Why NOT Container Instances:**
```
❌ No Auto-scaling: Manual scaling only
❌ No Load Balancing: Single instance or manual setup
❌ No Health Checks: Limited health monitoring
❌ No Managed Ingress: Requires manual networking
❌ No Zero-downtime: Deployments cause downtime
❌ Limited Monitoring: Basic metrics only
```

**Verdict**: ❌ **NOT SUITABLE** - Too basic for production API

---

#### Option B: Azure Container Apps ✅ **RECOMMENDED**

**Why Container Apps:**
```
✅ Auto-scaling: Scale to zero, scale based on HTTP traffic
✅ Managed Ingress: Built-in HTTPS, custom domains
✅ Health Checks: Liveness and readiness probes
✅ Zero-downtime: Rolling deployments
✅ Revisions: Traffic splitting, A/B testing
✅ Dapr Integration: Service-to-service communication
✅ Cost-effective: Pay only for what you use
✅ Simplified: Less complex than AKS
```

**Pricing:**
- **Consumption**: $0.000012/vCPU-second + $0.000002/GiB-second
- **Estimated**: $30-50/month for 1 vCPU, 2GB RAM, moderate traffic
- **Scale to Zero**: Save costs during low traffic

**Configuration:**
```yaml
Container: ghcr.io/whattag/chandrahoro-backend:latest
CPU: 0.5-1 vCPU
Memory: 1-2 GB
Min Replicas: 1 (or 0 for scale-to-zero)
Max Replicas: 5
Health Probe: /api/v1/health
Ingress: HTTPS enabled
```

**Verdict**: ✅ **HIGHLY RECOMMENDED** - Perfect for FastAPI microservices

---

#### Option C: Azure App Service (Web App for Containers) ✅ **ALTERNATIVE**

**Why App Service:**
```
✅ Simpler: Easier to configure than Container Apps
✅ Mature: Well-established service
✅ Monitoring: Built-in Application Insights
✅ Deployment Slots: Blue-green deployments
⚠️ Cost: Slightly more expensive than Container Apps
⚠️ Scaling: Less flexible than Container Apps
```

**Pricing:**
- **Basic (B1)**: $13/month - Good for development
- **Standard (S1)**: $70/month - Production ready

**Verdict**: ✅ **GOOD ALTERNATIVE** - Simpler but less cost-effective

---

#### Option D: Azure Kubernetes Service (AKS) ⚠️ **OVERKILL**

**Verdict**: ⚠️ **NOT RECOMMENDED** - Too complex for single backend API

---

### 2.3 Database Options

#### Option A: Azure Database for MySQL - Flexible Server ✅ **RECOMMENDED**

**Why Flexible Server:**
```
✅ MySQL 8.0 Compatible: Matches current MySQL 8.4.6
✅ Managed Service: Automated backups, patching, monitoring
✅ High Availability: Zone-redundant HA option
✅ Performance: Burstable, General Purpose, Memory Optimized tiers
✅ Security: SSL/TLS, firewall, private endpoints
✅ Scaling: Easy vertical and horizontal scaling
✅ Point-in-time Restore: Up to 35 days
```

**Pricing:**
- **Burstable (B1ms)**: $12/month - 1 vCore, 2GB RAM - Development
- **General Purpose (D2ds_v4)**: $100/month - 2 vCores, 8GB RAM - Production
- **Storage**: $0.115/GB/month (20GB = $2.30/month)

**Configuration:**
```yaml
Version: MySQL 8.0
Tier: Burstable (dev) or General Purpose (prod)
Compute: B1ms (1 vCore, 2GB) or D2ds_v4 (2 vCores, 8GB)
Storage: 20-100 GB (auto-grow enabled)
Backup: 7-35 days retention
HA: Zone-redundant (production)
SSL: Required
Charset: utf8mb4_unicode_ci
```

**Verdict**: ✅ **HIGHLY RECOMMENDED** - Best fit for MySQL workloads

---

#### Option B: Azure SQL Database ⚠️ **NOT RECOMMENDED**

**Why NOT Azure SQL:**
```
⚠️ Different Engine: SQL Server, not MySQL
⚠️ Migration Required: Schema and query changes needed
⚠️ Cost: More expensive than MySQL
⚠️ Compatibility: May require code changes
```

**Verdict**: ⚠️ **NOT RECOMMENDED** - Stick with MySQL

---

### 2.4 Caching Options

#### Azure Cache for Redis ✅ **RECOMMENDED (Optional)**

**Why Redis Cache:**
```
✅ Managed Service: No maintenance required
✅ High Performance: Sub-millisecond latency
✅ Scalable: Multiple tiers available
✅ Secure: SSL/TLS, firewall, private endpoints
✅ Compatible: Works with existing Redis code
```

**Pricing:**
- **Basic C0**: $16/month - 250MB - Development
- **Standard C1**: $50/month - 1GB - Production
- **Premium P1**: $250/month - 6GB - High performance

**Verdict**: ✅ **RECOMMENDED** - Improves performance, optional for MVP

---

## 3. Recommended Architecture

### 3.1 Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Front Door                         │
│              (CDN + WAF + Global Load Balancer)             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  App Service     │    │ Container Apps   │
│  (Frontend)      │◄───┤  (Backend API)   │
│  Next.js 14      │    │  FastAPI         │
│  Port: 3000      │    │  Port: 8000      │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         │                       │
         ▼                       ▼
┌──────────────────────────────────────────┐
│   Azure Database for MySQL               │
│   Flexible Server (MySQL 8.0)            │
│   25 tables, utf8mb4_unicode_ci          │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│   Azure Cache for Redis (Optional)       │
│   Standard C1 (1GB)                      │
└──────────────────────────────────────────┘
```

### 3.2 Service Breakdown

| Component | Azure Service | Tier | Monthly Cost |
|-----------|---------------|------|--------------|
| **Frontend** | App Service (Web App) | Standard S1 | $70 |
| **Backend** | Container Apps | Consumption | $40 |
| **Database** | MySQL Flexible Server | General Purpose D2ds_v4 | $100 |
| **Cache** | Redis Cache | Standard C1 | $50 (optional) |
| **CDN** | Azure Front Door | Standard | $35 |
| **Storage** | Blob Storage | Standard | $5 |
| **Monitoring** | Application Insights | Pay-as-you-go | $10 |
| **Total (without Redis)** | | | **$260/month** |
| **Total (with Redis)** | | | **$310/month** |

**Development Environment** (Lower cost):
- Frontend: Basic B1 ($13)
- Backend: Container Apps Consumption ($20)
- Database: Burstable B1ms ($12)
- **Total**: **$45-60/month**

---

## 4. Deployment Issues & Solutions

### 4.1 Location Service Issue (Previous Problem)

**Problem**: Location input service failed in previous Azure deployment

**Root Cause Analysis**:
```python
# backend/app/api/v1/locations.py
geonames_username = os.getenv("GEONAMES_USERNAME")
```

**Issue**: GeoNames API requires username, likely not configured in Azure

**Solutions**:

1. **Configure Environment Variable** (Recommended):
```bash
# Azure Container Apps
az containerapp update \
  --name chandrahoro-backend \
  --set-env-vars GEONAMES_USERNAME=your_username
```

2. **Fallback to Multiple Providers**:
```python
# Already implemented in location_service.py
# Falls back to: GeoNames → Nominatim → Photon
```

3. **Use Azure Maps API** (Alternative):
```python
# Replace GeoNames with Azure Maps Search API
# More reliable, better integration with Azure
```

**Recommendation**: ✅ Use Azure Maps API for better Azure integration

---

### 4.2 Next.js SSR Configuration

**Issue**: Next.js requires proper configuration for Azure App Service

**Solution**:
```dockerfile
# frontend/Dockerfile (already correct)
CMD ["npm", "start"]  # Uses next start (production server)
```

**Azure App Service Configuration**:
```json
{
  "PORT": "3000",
  "NODE_ENV": "production",
  "NEXT_PUBLIC_API_URL": "https://chandrahoro-backend.azurecontainerapps.io",
  "DATABASE_URL": "mysql://user:pass@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro"
}
```

---

### 4.3 Python 3.13 Compatibility

**Issue**: Backend uses Python 3.13, Azure may not support it yet

**Solution**:
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim  # Change from 3.13 to 3.11

# All dependencies are compatible with Python 3.11
```

**Action Required**: Update Dockerfile to use Python 3.11

---

### 4.4 Database Connection

**Issue**: MySQL connection string format for Azure

**Solution**:
```python
# backend/.env
DATABASE_URL=mysql+aiomysql://chandrahoro:PASSWORD@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro?ssl_ca=/path/to/DigiCertGlobalRootCA.crt.pem
```

**Azure MySQL Flexible Server requires SSL**:
```python
# backend/app/core/database.py
engine = create_async_engine(
    database_url,
    echo=sql_echo,
    pool_pre_ping=True,
    connect_args={
        "ssl": {"ssl_mode": "REQUIRED"}
    }
)
```

---

## 5. Deployment Workflow

### 5.1 CI/CD Pipeline (GitHub Actions)

**Recommended Workflow**:
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push backend image
        run: |
          docker build -t ghcr.io/whattag/chandrahoro-backend:${{ github.sha }} ./backend
          docker push ghcr.io/whattag/chandrahoro-backend:${{ github.sha }}
      
      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: chandrahoro-backend
          resourceGroup: chandrahoro-prod
          imageToDeploy: ghcr.io/whattag/chandrahoro-backend:${{ github.sha }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push frontend image
        run: |
          docker build -t ghcr.io/whattag/chandrahoro-frontend:${{ github.sha }} ./frontend
          docker push ghcr.io/whattag/chandrahoro-frontend:${{ github.sha }}
      
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: chandrahoro-frontend
          images: ghcr.io/whattag/chandrahoro-frontend:${{ github.sha }}
```

---

## 6. Next Steps

### 6.1 Immediate Actions

1. ✅ **Create Azure Resources**:
   - Resource Group
   - MySQL Flexible Server
   - Container Apps Environment
   - App Service Plan
   - Container Registry (or use GitHub Container Registry)

2. ✅ **Update Dockerfiles**:
   - Change Python version from 3.13 to 3.11
   - Add SSL certificate handling for MySQL

3. ✅ **Configure Environment Variables**:
   - Database connection strings
   - API keys (GeoNames, Anthropic, OpenAI)
   - NextAuth secret
   - CORS origins

4. ✅ **Set up CI/CD**:
   - Create GitHub Actions workflow
   - Configure Azure credentials
   - Set up deployment slots

5. ✅ **Test Deployment**:
   - Deploy to development environment
   - Run integration tests
   - Verify all features work

### 6.2 Cost Optimization

**Development Environment** ($45-60/month):
- Use Burstable tiers
- Scale to zero when not in use
- Disable Redis cache

**Production Environment** ($260-310/month):
- Use auto-scaling
- Enable caching
- Monitor and optimize

---

## 7. Conclusion

### Final Recommendations

1. ✅ **Frontend**: Azure App Service (Web App for Containers) - $70/month
2. ✅ **Backend**: Azure Container Apps - $40/month
3. ✅ **Database**: Azure Database for MySQL Flexible Server - $100/month
4. ✅ **Cache**: Azure Cache for Redis (optional) - $50/month
5. ✅ **CDN**: Azure Front Door - $35/month

**Total**: $260-310/month for production-ready deployment

### Why This Architecture?

- ✅ **Simplified**: No Kubernetes complexity
- ✅ **Cost-effective**: Pay for what you use
- ✅ **Scalable**: Auto-scaling built-in
- ✅ **Managed**: Minimal operational overhead
- ✅ **Compatible**: Works with all Next.js features
- ✅ **Reliable**: High availability options
- ✅ **Secure**: Built-in security features

**Ready to proceed with deployment?**

