# ChandraHoro Azure Deployment Checklist

## Pre-Deployment Phase

### GitHub Repository Setup
- [ ] Create GitHub repository (private)
- [ ] Clone repository locally
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/chandrahoro.git`
- [ ] Create initial commit with all code
- [ ] Push to main branch: `git push -u origin main`
- [ ] Create production branch: `git checkout -b production && git push -u origin production`
- [ ] Verify .gitignore is properly configured
- [ ] Add branch protection rules (require PR reviews for production)

### Azure Account Setup
- [ ] Verify Azure subscription is active
- [ ] Install Azure CLI: `brew install azure-cli`
- [ ] Login to Azure: `az login`
- [ ] Set default subscription: `az account set --subscription "YOUR_SUBSCRIPTION_ID"`
- [ ] Verify permissions (Contributor or Owner role)

### Secrets & API Keys Generation
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Generate JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate CRON_SECRET: `openssl rand -base64 32`
- [ ] Obtain Anthropic API key from https://console.anthropic.com
- [ ] Obtain Google Maps API key
- [ ] Obtain SendGrid API key (or alternative email service)
- [ ] Obtain Sentry DSN (optional, for error tracking)
- [ ] Store all secrets securely (password manager, Azure Key Vault)

### Environment Variables
- [ ] Copy `frontend/.env.production.example` to `frontend/.env.production`
- [ ] Copy `backend/.env.production.example` to `backend/.env.production`
- [ ] Fill in all required values in both files
- [ ] Verify DATABASE_URL format is correct
- [ ] Verify NEXTAUTH_URL matches your domain
- [ ] Verify NEXT_PUBLIC_API_URL points to backend
- [ ] Test environment variables locally with docker-compose

---

## Azure Resource Creation Phase

### Resource Group
- [ ] Create resource group: `az group create --name chandrahoro-prod --location eastus`
- [ ] Verify resource group created: `az group show --name chandrahoro-prod`

### App Service Plan
- [ ] Create App Service Plan: `az appservice plan create --name chandrahoro-plan --resource-group chandrahoro-prod --sku B2 --is-linux`
- [ ] Verify plan created and check pricing tier

### Database (MySQL)
- [ ] Create MySQL server with version 8.0+
- [ ] Create database: `chandrahoro`
- [ ] Configure firewall to allow Azure services
- [ ] Enable SSL enforcement
- [ ] Get connection string and verify format
- [ ] Test connection from local machine (optional)
- [ ] Note: Keep backup of connection string

### Storage Account
- [ ] Create storage account (globally unique name)
- [ ] Create blob container for backups
- [ ] Get connection string
- [ ] Configure access policies

### Key Vault
- [ ] Create Key Vault
- [ ] Add secrets:
  - [ ] NEXTAUTH_SECRET
  - [ ] JWT_SECRET
  - [ ] ANTHROPIC_API_KEY
  - [ ] DATABASE_URL
  - [ ] All other sensitive values
- [ ] Configure access policies for App Services

### Application Insights (Optional)
- [ ] Create Application Insights resource
- [ ] Link to App Services
- [ ] Configure alerts for errors and performance

---

## Application Deployment Phase

### Frontend Deployment
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Verify build succeeds with no errors
- [ ] Create App Service for frontend: `az webapp create --name chandrahoro-frontend --resource-group chandrahoro-prod --plan chandrahoro-plan --runtime "NODE|18-lts"`
- [ ] Configure environment variables in App Service
- [ ] Deploy code (via GitHub Actions, Azure DevOps, or manual zip)
- [ ] Verify frontend is accessible at https://chandrahoro-frontend.azurewebsites.net
- [ ] Check for any 404 or 500 errors

### Backend Deployment
- [ ] Build backend Docker image: `docker build -t chandrahoro-backend:latest ./backend`
- [ ] Create App Service for backend: `az webapp create --name chandrahoro-backend --resource-group chandrahoro-prod --plan chandrahoro-plan --runtime "PYTHON|3.11"`
- [ ] Configure environment variables in App Service
- [ ] Deploy code (via GitHub Actions, Azure DevOps, or manual zip)
- [ ] Verify backend is accessible at https://chandrahoro-backend.azurewebsites.net/health
- [ ] Check logs for any startup errors

### Database Migration
- [ ] Connect to Azure MySQL from local machine
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Verify all tables created successfully
- [ ] Seed database with initial data (if needed)
- [ ] Verify data integrity

---

## Configuration Phase

### Environment Variables in Azure
- [ ] Set all frontend environment variables in App Service config
- [ ] Set all backend environment variables in App Service config
- [ ] Verify variables are correctly set: `az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend`
- [ ] Restart App Services to apply changes

### Custom Domain (Optional)
- [ ] Add custom domain to frontend App Service
- [ ] Add custom domain to backend App Service
- [ ] Configure DNS records (CNAME or A record)
- [ ] Verify domain resolves correctly
- [ ] Create SSL certificate (Azure managed or custom)
- [ ] Enable HTTPS redirect

### CORS Configuration
- [ ] Update CORS settings in backend to allow frontend domain
- [ ] Test cross-origin requests from frontend
- [ ] Verify authentication works across domains

---

## Testing & Verification Phase

### Frontend Testing
- [ ] Access frontend URL in browser
- [ ] Verify page loads without errors
- [ ] Check browser console for JavaScript errors
- [ ] Test login functionality
- [ ] Test chart generation
- [ ] Test AI features (Daily Predictions, Yearly Predictions, Prashna)
- [ ] Verify responsive design on mobile
- [ ] Test dark mode toggle

### Backend Testing
- [ ] Access health endpoint: `/health`
- [ ] Test authentication endpoint: `/api/v1/auth/login`
- [ ] Test chart calculation endpoint: `/api/v1/charts/calculate`
- [ ] Test AI endpoint: `/api/v1/ai/interpret`
- [ ] Verify database connectivity
- [ ] Check backend logs for errors

### Integration Testing
- [ ] Test complete user flow: Register → Login → Generate Chart → View AI Insights
- [ ] Test all AI modules load correctly
- [ ] Test data persistence (create chart, refresh page, verify data still there)
- [ ] Test error handling (invalid inputs, network errors)
- [ ] Test performance (load times, API response times)

### Security Testing
- [ ] Verify HTTPS is enforced
- [ ] Test authentication (valid/invalid credentials)
- [ ] Verify API keys are not exposed in frontend
- [ ] Test CORS restrictions
- [ ] Verify database credentials are not in logs
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify sensitive data is encrypted

---

## Monitoring & Maintenance Phase

### Logging & Monitoring
- [ ] Configure Application Insights
- [ ] Set up alerts for errors
- [ ] Set up alerts for high CPU/memory usage
- [ ] Configure log retention policies
- [ ] Set up daily backup of database
- [ ] Configure auto-scaling if needed

### Performance Optimization
- [ ] Enable caching headers for static assets
- [ ] Configure CDN for static content (optional)
- [ ] Monitor API response times
- [ ] Optimize database queries if needed
- [ ] Enable compression for responses

### Backup & Disaster Recovery
- [ ] Configure automated database backups
- [ ] Test backup restoration process
- [ ] Document disaster recovery procedures
- [ ] Set up monitoring for backup failures

---

## Post-Deployment

### Documentation
- [ ] Document deployment architecture
- [ ] Document environment variables and their purposes
- [ ] Document how to scale resources
- [ ] Document how to rollback deployments
- [ ] Document troubleshooting procedures

### Team Communication
- [ ] Notify team of deployment completion
- [ ] Share production URLs
- [ ] Share monitoring dashboards
- [ ] Document access procedures

### Cleanup
- [ ] Remove local .env files with production secrets
- [ ] Remove any temporary test data from production
- [ ] Archive old deployment artifacts
- [ ] Update documentation with final URLs

---

## Rollback Procedures

If deployment fails:
1. [ ] Identify the issue from logs
2. [ ] Revert code to previous version: `git revert <commit-hash>`
3. [ ] Redeploy previous version
4. [ ] Verify rollback successful
5. [ ] Document issue and resolution
6. [ ] Fix issue in development environment
7. [ ] Test thoroughly before redeploying

---

## Success Criteria

✅ All items checked  
✅ Frontend accessible and functional  
✅ Backend API responding correctly  
✅ Database connected and migrated  
✅ Authentication working  
✅ AI features operational  
✅ Monitoring and logging configured  
✅ Backups configured  
✅ Team notified  

