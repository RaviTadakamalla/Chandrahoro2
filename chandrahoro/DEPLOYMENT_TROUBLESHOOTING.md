# ChandraHoro Azure Deployment - Troubleshooting Guide

## Common Issues & Solutions

### 1. Frontend Not Loading (404 or Blank Page)

**Symptoms**: Frontend URL returns 404 or blank page

**Solutions**:
```bash
# Check frontend logs
az webapp log tail --resource-group chandrahoro-prod --name chandrahoro-frontend

# Verify environment variables
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend

# Restart app service
az webapp restart --resource-group chandrahoro-prod --name chandrahoro-frontend

# Check if Next.js build was successful
# Look for "ready - started server on 0.0.0.0:3000" in logs
```

**Common Causes**:
- Missing environment variables (NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET)
- Build failed during deployment
- Node.js version mismatch
- Missing dependencies

---

### 2. Backend API Not Responding (502 Bad Gateway)

**Symptoms**: Backend returns 502 or connection timeout

**Solutions**:
```bash
# Check backend logs
az webapp log tail --resource-group chandrahoro-prod --name chandrahoro-backend

# Verify Python version
az webapp config show --resource-group chandrahoro-prod --name chandrahoro-backend

# Check if FastAPI started correctly
# Look for "Uvicorn running on 0.0.0.0:8000" in logs

# Restart backend
az webapp restart --resource-group chandrahoro-prod --name chandrahoro-backend
```

**Common Causes**:
- Database connection failed
- Missing environment variables
- Python dependencies not installed
- Port 8000 not exposed

---

### 3. Database Connection Failed

**Symptoms**: "Connection refused" or "Access denied" errors

**Solutions**:
```bash
# Verify MySQL server is running
az mysql server show --resource-group chandrahoro-prod --name chandrahoro-mysql

# Check firewall rules
az mysql server firewall-rule list --resource-group chandrahoro-prod --name chandrahoro-mysql

# Allow Azure services
az mysql server firewall-rule create \
  --resource-group chandrahoro-prod \
  --server-name chandrahoro-mysql \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Test connection string format
# Should be: mysql://user:password@server.mysql.database.azure.com:3306/database?ssl=true

# Verify DATABASE_URL in app settings
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-backend | grep DATABASE_URL
```

**Common Causes**:
- Firewall blocking connection
- Incorrect connection string format
- Wrong username/password
- Database doesn't exist
- SSL not enabled

---

### 4. Authentication Not Working

**Symptoms**: Login fails, session not persisting

**Solutions**:
```bash
# Verify NEXTAUTH_SECRET is set
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend | grep NEXTAUTH_SECRET

# Verify NEXTAUTH_URL matches domain
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend | grep NEXTAUTH_URL

# Check if JWT_SECRET is set in backend
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-backend | grep JWT_SECRET

# Verify database has auth tables
# Connect to MySQL and check: SELECT * FROM users;
```

**Common Causes**:
- NEXTAUTH_SECRET not set or incorrect
- NEXTAUTH_URL doesn't match actual domain
- Database auth tables not created
- JWT_SECRET not set in backend

---

### 5. AI Features Not Working

**Symptoms**: AI endpoints return errors, Claude API not responding

**Solutions**:
```bash
# Verify Anthropic API key is set
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-backend | grep ANTHROPIC_API_KEY

# Check if API key is valid
# Test with: curl -H "Authorization: Bearer YOUR_KEY" https://api.anthropic.com/v1/models

# Check backend logs for API errors
az webapp log tail --resource-group chandrahoro-prod --name chandrahoro-backend

# Verify rate limits not exceeded
# Check Anthropic dashboard for usage
```

**Common Causes**:
- ANTHROPIC_API_KEY not set or invalid
- API key expired or revoked
- Rate limit exceeded
- Network connectivity issue

---

### 6. Static Assets Not Loading (CSS, Images)

**Symptoms**: Page loads but styling is broken, images missing

**Solutions**:
```bash
# Verify public folder is deployed
# Check if /public files are accessible

# Check Next.js build output
# Look for .next/static directory

# Verify NEXT_PUBLIC_APP_URL is correct
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend | grep NEXT_PUBLIC_APP_URL

# Clear browser cache and hard refresh (Ctrl+Shift+R)
```

**Common Causes**:
- Public folder not deployed
- Incorrect NEXT_PUBLIC_APP_URL
- Browser cache issue
- CDN not configured

---

### 7. High Memory Usage / App Crashes

**Symptoms**: App Service crashes, memory usage at 100%

**Solutions**:
```bash
# Check memory usage
az monitor metrics list \
  --resource /subscriptions/YOUR_SUB_ID/resourceGroups/chandrahoro-prod/providers/Microsoft.Web/sites/chandrahoro-frontend \
  --metric MemoryPercentage

# Increase App Service tier
az appservice plan update \
  --name chandrahoro-plan \
  --resource-group chandrahoro-prod \
  --sku B3  # Upgrade from B2 to B3

# Enable auto-scaling
az monitor autoscale create \
  --resource-group chandrahoro-prod \
  --resource-name-type app-service-plan \
  --resource-name chandrahoro-plan \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

**Common Causes**:
- App Service tier too small
- Memory leak in application
- Too many concurrent users
- Large file uploads

---

### 8. Slow Performance / Timeouts

**Symptoms**: API calls timing out, page loads slowly

**Solutions**:
```bash
# Check API response times
az monitor metrics list \
  --resource /subscriptions/YOUR_SUB_ID/resourceGroups/chandrahoro-prod/providers/Microsoft.Web/sites/chandrahoro-backend \
  --metric ResponseTime

# Enable caching
# Add cache headers in Next.js: Cache-Control: public, max-age=3600

# Optimize database queries
# Check slow query log in MySQL

# Enable Redis caching
# Update REDIS_URL in backend settings

# Increase timeout values
NEXT_PUBLIC_API_TIMEOUT=60000  # 60 seconds
```

**Common Causes**:
- Slow database queries
- No caching configured
- Network latency
- Insufficient resources

---

### 9. CORS Errors

**Symptoms**: "Access to XMLHttpRequest blocked by CORS policy"

**Solutions**:
```bash
# Update CORS settings in backend
# In FastAPI: add frontend URL to allowed origins

# Verify CORS headers in response
curl -i -X OPTIONS https://chandrahoro-backend.azurewebsites.net/api/v1/charts

# Check if credentials are being sent
# Frontend should include: credentials: 'include'

# Verify frontend and backend URLs match
NEXT_PUBLIC_API_URL=https://chandrahoro-backend.azurewebsites.net
```

**Common Causes**:
- Frontend and backend on different domains
- CORS not configured in backend
- Credentials not being sent
- Preflight request failing

---

### 10. Deployment Fails

**Symptoms**: GitHub Actions workflow fails, deployment doesn't complete

**Solutions**:
```bash
# Check GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/chandrahoro/actions

# Verify Azure credentials
# Check if AZURE_CREDENTIALS secret is set in GitHub

# Check Docker build logs
# Look for build errors in workflow output

# Verify app service can pull from registry
az webapp config container set \
  --resource-group chandrahoro-prod \
  --name chandrahoro-frontend \
  --docker-custom-image-name ghcr.io/YOUR_USERNAME/chandrahoro-frontend:latest \
  --docker-registry-server-url https://ghcr.io
```

**Common Causes**:
- Azure credentials expired
- Docker build failed
- Registry authentication failed
- App Service configuration incorrect

---

## Debugging Commands

```bash
# View real-time logs
az webapp log tail --resource-group chandrahoro-prod --name chandrahoro-frontend

# View application settings
az webapp config appsettings list --resource-group chandrahoro-prod --name chandrahoro-frontend

# SSH into app service (if available)
az webapp create-remote-connection --resource-group chandrahoro-prod --name chandrahoro-frontend

# Check app service status
az webapp show --resource-group chandrahoro-prod --name chandrahoro-frontend

# View deployment history
az webapp deployment list --resource-group chandrahoro-prod --name chandrahoro-frontend

# Restart app service
az webapp restart --resource-group chandrahoro-prod --name chandrahoro-frontend

# Stop app service
az webapp stop --resource-group chandrahoro-prod --name chandrahoro-frontend

# Start app service
az webapp start --resource-group chandrahoro-prod --name chandrahoro-frontend
```

---

## Getting Help

1. **Check Azure Portal**: https://portal.azure.com
2. **Review Application Insights**: Monitor → Application Insights
3. **Check GitHub Actions**: Actions tab in repository
4. **Review Logs**: `az webapp log tail` command
5. **Contact Azure Support**: If infrastructure issue
6. **Check API Documentation**: For API-specific issues

---

## Prevention Tips

- ✅ Always test locally with docker-compose before deploying
- ✅ Use environment variables for all configuration
- ✅ Enable monitoring and alerts
- ✅ Keep backups of database
- ✅ Document all changes
- ✅ Use version control for all code
- ✅ Test in staging before production
- ✅ Monitor logs regularly

