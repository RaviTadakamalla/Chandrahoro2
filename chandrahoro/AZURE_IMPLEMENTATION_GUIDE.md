# Azure Implementation Guide - ChandraHoro V2.1

**Version**: 2.1.2  
**Date**: October 29, 2025  
**Prerequisites**: Azure CLI, Docker, GitHub account  
**Estimated Time**: 2-3 hours

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Azure Resource Setup](#2-azure-resource-setup)
3. [Database Configuration](#3-database-configuration)
4. [Backend Deployment](#4-backend-deployment)
5. [Frontend Deployment](#5-frontend-deployment)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Testing & Verification](#7-testing--verification)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

### 1.1 Install Required Tools

```bash
# Install Azure CLI (macOS)
brew install azure-cli

# Verify installation
az --version

# Login to Azure
az login

# Set default subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Install Docker (if not already installed)
brew install --cask docker

# Verify Docker
docker --version
```

### 1.2 Environment Variables Needed

Create a file `azure-env-vars.txt` with the following:

```bash
# Database
DATABASE_URL=mysql+aiomysql://chandrahoro:PASSWORD@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro
SYNC_DATABASE_URL=mysql+pymysql://chandrahoro:PASSWORD@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro

# API Keys
GEONAMES_USERNAME=your_geonames_username
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# NextAuth
NEXTAUTH_SECRET=generate_random_32_char_string
NEXTAUTH_URL=https://chandrahoro-frontend.azurewebsites.net

# Frontend
NEXT_PUBLIC_API_URL=https://chandrahoro-backend.azurecontainerapps.io
NEXT_PUBLIC_APP_URL=https://chandrahoro-frontend.azurewebsites.net

# Backend
CORS_ORIGINS=https://chandrahoro-frontend.azurewebsites.net
```

---

## 2. Azure Resource Setup

### 2.1 Create Resource Group

```bash
# Variables
RESOURCE_GROUP="chandrahoro-prod"
LOCATION="eastus"  # or your preferred region

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

### 2.2 Create MySQL Flexible Server

```bash
# Variables
MYSQL_SERVER="chandrahoro-mysql"
MYSQL_ADMIN="chandrahoro"
MYSQL_PASSWORD="YourSecurePassword123!"  # Change this!
MYSQL_DATABASE="chandrahoro"

# Create MySQL Flexible Server
az mysql flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --location $LOCATION \
  --admin-user $MYSQL_ADMIN \
  --admin-password $MYSQL_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --version 8.0 \
  --public-access 0.0.0.0 \
  --backup-retention 7 \
  --storage-auto-grow Enabled

# Create database
az mysql flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $MYSQL_SERVER \
  --database-name $MYSQL_DATABASE

# Configure firewall (allow Azure services)
az mysql flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Configure SSL
az mysql flexible-server parameter set \
  --resource-group $RESOURCE_GROUP \
  --server-name $MYSQL_SERVER \
  --name require_secure_transport \
  --value ON
```

### 2.3 Create Container Apps Environment

```bash
# Variables
CONTAINERAPPS_ENV="chandrahoro-env"

# Create Container Apps environment
az containerapp env create \
  --name $CONTAINERAPPS_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 2.4 Create App Service Plan

```bash
# Variables
APP_SERVICE_PLAN="chandrahoro-plan"

# Create App Service Plan (Linux)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1  # Use S1 for production
```

### 2.5 Create Redis Cache (Optional)

```bash
# Variables
REDIS_NAME="chandrahoro-redis"

# Create Redis Cache
az redis create \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false

# Get Redis connection string
az redis list-keys \
  --resource-group $RESOURCE_GROUP \
  --name $REDIS_NAME
```

---

## 3. Database Configuration

### 3.1 Run Database Migrations

```bash
# Connect to MySQL from local machine
mysql -h chandrahoro-mysql.mysql.database.azure.com \
  -u chandrahoro \
  -p \
  --ssl-mode=REQUIRED

# Or use Azure Cloud Shell
az mysql flexible-server connect \
  --name chandrahoro-mysql \
  --admin-user chandrahoro \
  --admin-password YourSecurePassword123!

# Run migrations from local backend
cd backend
source venv/bin/activate

# Update .env with Azure MySQL connection
export DATABASE_URL="mysql+aiomysql://chandrahoro:YourSecurePassword123!@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro"
export SYNC_DATABASE_URL="mysql+pymysql://chandrahoro:YourSecurePassword123!@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro"

# Run migrations
alembic upgrade head
```

### 3.2 Verify Database

```bash
# Check tables
mysql -h chandrahoro-mysql.mysql.database.azure.com \
  -u chandrahoro \
  -p \
  --ssl-mode=REQUIRED \
  -e "USE chandrahoro; SHOW TABLES;"

# Should show 25 tables
```

---

## 4. Backend Deployment

### 4.1 Update Backend Dockerfile

```bash
# Edit backend/Dockerfile
# Change Python version from 3.13 to 3.11
```

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim as builder
# ... rest of the file
```

### 4.2 Build and Push Backend Image

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build backend image
cd backend
docker build -t ghcr.io/whattag/chandrahoro-backend:latest .

# Push to registry
docker push ghcr.io/whattag/chandrahoro-backend:latest
```

### 4.3 Deploy to Azure Container Apps

```bash
# Variables
BACKEND_APP="chandrahoro-backend"

# Create Container App
az containerapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINERAPPS_ENV \
  --image ghcr.io/whattag/chandrahoro-backend:latest \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --env-vars \
    DATABASE_URL="mysql+aiomysql://chandrahoro:YourSecurePassword123!@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro" \
    SYNC_DATABASE_URL="mysql+pymysql://chandrahoro:YourSecurePassword123!@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro" \
    GEONAMES_USERNAME="your_geonames_username" \
    ANTHROPIC_API_KEY="your_anthropic_key" \
    OPENAI_API_KEY="your_openai_key" \
    CORS_ORIGINS="https://chandrahoro-frontend.azurewebsites.net" \
    ENVIRONMENT="production" \
    DEBUG="False"

# Get backend URL
az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### 4.4 Test Backend

```bash
# Get backend URL
BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Test health endpoint
curl https://$BACKEND_URL/api/v1/health

# Should return: {"status":"healthy","api_version":"v1"}
```

---

## 5. Frontend Deployment

### 5.1 Build and Push Frontend Image

```bash
# Build frontend image
cd frontend
docker build -t ghcr.io/whattag/chandrahoro-frontend:latest .

# Push to registry
docker push ghcr.io/whattag/chandrahoro-frontend:latest
```

### 5.2 Create Web App

```bash
# Variables
FRONTEND_APP="chandrahoro-frontend"

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $FRONTEND_APP \
  --deployment-container-image-name ghcr.io/whattag/chandrahoro-frontend:latest

# Configure container settings
az webapp config container set \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name ghcr.io/whattag/chandrahoro-frontend:latest \
  --docker-registry-server-url https://ghcr.io

# Configure app settings
az webapp config appsettings set \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    WEBSITES_PORT=3000 \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL=https://$BACKEND_URL \
    NEXT_PUBLIC_APP_URL=https://$FRONTEND_APP.azurewebsites.net \
    DATABASE_URL="mysql://chandrahoro:YourSecurePassword123!@chandrahoro-mysql.mysql.database.azure.com:3306/chandrahoro" \
    NEXTAUTH_SECRET="your_32_char_secret" \
    NEXTAUTH_URL=https://$FRONTEND_APP.azurewebsites.net

# Enable HTTPS only
az webapp update \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --https-only true

# Configure health check
az webapp config set \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --health-check-path /api/health
```

### 5.3 Test Frontend

```bash
# Get frontend URL
FRONTEND_URL=$(az webapp show \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName \
  --output tsv)

# Open in browser
open https://$FRONTEND_URL

# Test API proxy
curl https://$FRONTEND_URL/api/v1/health
```

---

## 6. CI/CD Pipeline

### 6.1 Create GitHub Actions Workflow

Create `.github/workflows/deploy-azure-v2.yml`:

```yaml
name: Deploy to Azure (V2)

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: chandrahoro-backend
  FRONTEND_IMAGE: chandrahoro-frontend

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.BACKEND_IMAGE }}:latest
            ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: chandrahoro-backend
          resourceGroup: chandrahoro-prod
          imageToDeploy: ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: chandrahoro-frontend
          images: ${{ env.REGISTRY }}/${{ github.repository_owner }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}

  verify-deployment:
    runs-on: ubuntu-latest
    needs: [deploy-backend, deploy-frontend]
    
    steps:
      - name: Test backend health
        run: |
          curl -f https://chandrahoro-backend.azurecontainerapps.io/api/v1/health || exit 1

      - name: Test frontend
        run: |
          curl -f https://chandrahoro-frontend.azurewebsites.net || exit 1
```

### 6.2 Configure GitHub Secrets

```bash
# Create Azure service principal
az ad sp create-for-rbac \
  --name "chandrahoro-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/chandrahoro-prod \
  --sdk-auth

# Copy the JSON output and add to GitHub Secrets as AZURE_CREDENTIALS
```

---

## 7. Testing & Verification

### 7.1 Health Checks

```bash
# Backend health
curl https://chandrahoro-backend.azurecontainerapps.io/api/v1/health

# Frontend health
curl https://chandrahoro-frontend.azurewebsites.net/api/health

# Database connection
curl https://chandrahoro-backend.azurecontainerapps.io/api/v1/chart/test
```

### 7.2 Feature Testing

```bash
# Test location search
curl "https://chandrahoro-backend.azurecontainerapps.io/api/v1/locations/search?q=Mumbai&limit=5"

# Test chart calculation
curl -X POST https://chandrahoro-backend.azurecontainerapps.io/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Test User",
      "date": "1990-01-15",
      "time": "14:30:00",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "timezone": "Asia/Kolkata",
      "location_name": "Mumbai, India"
    }
  }'
```

---

## 8. Troubleshooting

### 8.1 Common Issues

**Issue**: Backend cannot connect to MySQL

**Solution**:
```bash
# Check firewall rules
az mysql flexible-server firewall-rule list \
  --resource-group chandrahoro-prod \
  --name chandrahoro-mysql

# Add Container Apps outbound IPs
az containerapp show \
  --name chandrahoro-backend \
  --resource-group chandrahoro-prod \
  --query properties.outboundIpAddresses
```

**Issue**: Frontend cannot reach backend

**Solution**:
```bash
# Check CORS configuration
az containerapp show \
  --name chandrahoro-backend \
  --resource-group chandrahoro-prod \
  --query properties.configuration.ingress

# Update CORS_ORIGINS environment variable
```

**Issue**: Location service not working

**Solution**:
```bash
# Verify GEONAMES_USERNAME is set
az containerapp show \
  --name chandrahoro-backend \
  --resource-group chandrahoro-prod \
  --query properties.template.containers[0].env

# Or use Azure Maps API instead
```

---

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure SSL certificate
3. ✅ Enable Application Insights
4. ✅ Set up alerts and monitoring
5. ✅ Configure auto-scaling rules
6. ✅ Set up backup and disaster recovery

**Deployment complete!** 🎉

