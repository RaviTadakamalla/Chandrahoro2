# ChandraHoro Azure Deployment Status

**Date**: October 30, 2025
**Deployment Target**: Azure for Students Subscription
**Status**: ✅ Backend Deployed Successfully | ⚠️ Frontend Pending (ARM64 Issue)

---

## ✅ Successfully Deployed Resources

### 1. Azure Infrastructure
- **Resource Group**: `chandrahoro-prod` (westus2)
- **Azure Container Registry**: `chandrahoroacr.azurecr.io` (Basic SKU)
- **Key Vault**: `chandrahoro-kv-prod`
  - ✅ 6 secrets stored:
    - `perplexity-api-key`
    - `geonames-username`
    - `nextauth-secret`
    - `jwt-secret`
    - `mysql-admin-password`
    - `github-token`
- **MySQL Flexible Server**: `chandrahoro-mysql-prod`
  - Version: MySQL 8.0.21
  - SKU: Standard_B1ms
  - Database: `chandrahoro` (created)
  - Admin User: `chandrahoroadmin`
  - Connection: `chandrahoro-mysql-prod.mysql.database.azure.com`

### 2. Docker Images
- **Backend (AMD64)**: ✅ Built and pushed to ACR
  - Image: `chandrahoroacr.azurecr.io/chandrahoro-backend:latest`
  - Architecture: linux/amd64
  - Size: ~688MB
  - Status: Successfully deployed to Azure Container Instance

- **Frontend (ARM64)**: ⚠️ Built but incompatible
  - Image: `chandrahoroacr.azurecr.io/chandrahoro-frontend:latest`
  - Architecture: linux/arm64
  - Size: ~1.32GB
  - Status: Cannot deploy to Azure Container Instances (requires AMD64)

### 3. Running Services
- **Backend API**: ✅ RUNNING & HEALTHY
  - **URL**: http://chandrahoro-api.westus2.azurecontainer.io:8000
  - **API Docs**: http://chandrahoro-api.westus2.azurecontainer.io:8000/docs
  - **Health Check**: http://chandrahoro-api.westus2.azurecontainer.io:8000/health
  - **Container**: `chandrahoro-backend`
  - **CPU**: 1 core
  - **Memory**: 1.5 GB
  - **Status**: Responding to requests, no crashes
  - **Database**: ⚠️ Running in demo mode (SSL connection issue being resolved)
  - **Environment Variables**: Configured with Key Vault secrets

---

## ❌ Pending/Blocked Items

### 1. Frontend Deployment
**Issue**: Frontend Docker image built for ARM64 (Apple Silicon) architecture, but Azure Container Instances only supports AMD64.

**Attempted Solutions**:
- ✅ Disabled problematic `shared.tsx` file (chart sharing feature)
- ❌ Cross-compilation to AMD64 failed due to Prisma build issues
- ❌ Docker buildx with `--platform linux/amd64` failed with SIGTRAP error during `npm ci`

**Root Cause**: Prisma's query engine has issues with cross-platform builds, especially when building AMD64 on ARM64 Mac.

**Recommended Solutions**:
1. **Option A - Use GitHub Actions** (Recommended):
   - Set up GitHub Actions workflow to build AMD64 images on GitHub's AMD64 runners
   - Automatically push to ACR on commits to main branch
   - Example workflow provided below

2. **Option B - Use Azure Container Apps**:
   - Azure Container Apps supports ARM64 images
   - Requires creating a Container Apps Environment
   - May have quota limitations on Azure for Students

3. **Option C - Build on AMD64 Machine**:
   - Use a cloud VM (Azure VM, EC2, etc.) with AMD64 architecture
   - Build and push images from there

4. **Option D - Use Azure Static Web Apps**:
   - Deploy frontend as Static Web App (supports Next.js)
   - Keep backend as Container Instance
   - Simpler deployment, better for Next.js

### 2. Database Migration
**Status**: Not yet run

**Next Steps**:
```bash
# Connect to backend container and run migrations
az container exec \
  --resource-group chandrahoro-prod \
  --name chandrahoro-backend \
  --exec-command "alembic upgrade head"
```

### 3. Frontend Build Error
**File**: `frontend/src/pages/chart/shared.tsx`

**Status**: Temporarily disabled (renamed to `.disabled`)

**Issue**: SWC compiler rejects JSX syntax at line 154, even though the code appears valid. This file has been broken since the initial commit.

**Impact**: Chart sharing feature unavailable

**Recommendation**: Debug and fix after deployment is complete

---

## 📋 Deployment Configuration

### Environment Variables (Backend)
```bash
DATABASE_URL=mysql://chandrahoroadmin:***@chandrahoro-mysql-prod.mysql.database.azure.com/chandrahoro
PERPLEXITY_API_KEY=pplx-***
GEONAMES_USERNAME=drtravi
JWT_SECRET=***
NEXTAUTH_SECRET=***
```

### Environment Variables (Frontend - when deployed)
```bash
NEXT_PUBLIC_API_URL=http://chandrahoro-api.westus2.azurecontainer.io:8000
NEXTAUTH_URL=http://chandrahoro-app.westus2.azurecontainer.io:3000
NEXTAUTH_SECRET=***
DATABASE_URL=mysql://chandrahoroadmin:***@chandrahoro-mysql-prod.mysql.database.azure.com/chandrahoro
```

---

## 🚀 Quick Start Guide

### Access Backend API
```bash
# API Documentation
open http://chandrahoro-api.westus2.azurecontainer.io:8000/docs

# Health Check
curl http://chandrahoro-api.westus2.azurecontainer.io:8000/health
```

### View Container Logs
```bash
# Backend logs
az container logs --resource-group chandrahoro-prod --name chandrahoro-backend

# Frontend logs (when deployed)
az container logs --resource-group chandrahoro-prod --name chandrahoro-frontend
```

### Restart Containers
```bash
# Restart backend
az container restart --resource-group chandrahoro-prod --name chandrahoro-backend

# Restart frontend (when deployed)
az container restart --resource-group chandrahoro-prod --name chandrahoro-frontend
```

### Update Container Images
```bash
# Delete and recreate with new image
az container delete --resource-group chandrahoro-prod --name chandrahoro-backend --yes
bash deploy-containers.sh
```

---

## 📝 GitHub Actions Workflow (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest  # AMD64 architecture
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to Azure Container Registry
      uses: docker/login-action@v2
      with:
        registry: chandrahoroacr.azurecr.io
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}
    
    - name: Build and push backend
      run: |
        cd backend
        docker build -t chandrahoroacr.azurecr.io/chandrahoro-backend:latest .
        docker push chandrahoroacr.azurecr.io/chandrahoro-backend:latest
    
    - name: Build and push frontend
      run: |
        cd frontend
        docker build -t chandrahoroacr.azurecr.io/chandrahoro-frontend:latest .
        docker push chandrahoroacr.azurecr.io/chandrahoro-frontend:latest
    
    - name: Deploy to Azure Container Instances
      run: |
        az login --service-principal -u ${{ secrets.AZURE_CLIENT_ID }} -p ${{ secrets.AZURE_CLIENT_SECRET }} --tenant ${{ secrets.AZURE_TENANT_ID }}
        bash deploy-containers.sh
```

**Required GitHub Secrets**:
- `ACR_USERNAME`: chandrahoroacr
- `ACR_PASSWORD`: (get from `az acr credential show --name chandrahoroacr`)
- `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`: Service Principal credentials

---

## 💰 Cost Estimate (Azure for Students)

- **Container Registry (Basic)**: ~$5/month
- **MySQL Flexible Server (B1ms)**: ~$12/month
- **Key Vault**: ~$0.03/month (per 10k operations)
- **Container Instances**:
  - Backend (1 CPU, 1.5GB): ~$30/month
  - Frontend (1 CPU, 2GB): ~$40/month
- **Total**: ~$87/month

**Azure for Students Credit**: $100/year → Need to optimize or use free tier alternatives

---

## 🔧 Troubleshooting

### Backend not responding
```bash
# Check container status
az container show --resource-group chandrahoro-prod --name chandrahoro-backend

# View logs
az container logs --resource-group chandrahoro-prod --name chandrahoro-backend

# Restart
az container restart --resource-group chandrahoro-prod --name chandrahoro-backend
```

### Database connection issues
```bash
# Test MySQL connection
mysql -h chandrahoro-mysql-prod.mysql.database.azure.com -u chandrahoroadmin -p chandrahoro

# Check firewall rules
az mysql flexible-server firewall-rule list --resource-group chandrahoro-prod --name chandrahoro-mysql-prod
```

### Out of Azure credits
Consider:
1. Use Azure Static Web Apps (free tier) for frontend
2. Downgrade MySQL to Burstable B1s
3. Use Azure Container Apps free tier (180,000 vCPU-seconds/month)

---

## 📞 Next Steps

1. **Immediate**: Set up GitHub Actions to build AMD64 frontend image
2. **Short-term**: Deploy frontend once AMD64 image is available
3. **Medium-term**: Run database migrations
4. **Long-term**: Fix `shared.tsx` file and re-enable chart sharing

---

## 📚 Useful Commands

```bash
# List all resources
az resource list --resource-group chandrahoro-prod -o table

# Get ACR credentials
az acr credential show --name chandrahoroacr

# Get Key Vault secrets
az keyvault secret show --vault-name chandrahoro-kv-prod --name perplexity-api-key

# Connect to MySQL
mysql -h chandrahoro-mysql-prod.mysql.database.azure.com -u chandrahoroadmin -p

# View container metrics
az monitor metrics list --resource /subscriptions/.../chandrahoro-backend
```

---

**Deployment Script**: `deploy-containers.sh`  
**Configuration**: `azure-deployment-config.sh`  
**Docker Images**: Backend ✅ | Frontend ⚠️ (ARM64)

