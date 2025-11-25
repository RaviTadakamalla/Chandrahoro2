# 🚀 ChandraHoro Production Deployment Guide
## Hostinger VPS - jyotishdrishti.valuestream.in

**Deployment Date**: 2025-11-24  
**Target Domain**: jyotishdrishti.valuestream.in  
**Server**: Hostinger VPS (Ubuntu 22.04 LTS)  
**Status**: Ready for Production Deployment

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Access & Initial Setup](#server-access--initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Process Management](#process-management)
8. [Verification & Testing](#verification--testing)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## 🔐 Pre-Deployment Checklist

### Required Information
- [x] **VPS Access**: SSH with root access
- [x] **Domain**: jyotishdrishti.valuestream.in
- [x] **Root Password**: Haritha#12Tadaka
- [ ] **DNS Configuration**: Point domain to VPS IP
- [ ] **GeoNames Username**: (Required for location services)
- [ ] **API Keys**: Perplexity, OpenAI, Anthropic (optional)

### Generated Secrets (Save These Securely!)
```bash
# These will be generated during deployment:
LLM_VAULT_KEY=<generated-fernet-key>
NEXTAUTH_SECRET=<generated-32-byte-secret>
JWT_SECRET=<generated-32-byte-secret>
MYSQL_PASSWORD=<generated-strong-password>
```

---

## 🖥️ Server Access & Initial Setup

### Step 1: Connect to VPS via SSH

```bash
# From your local machine
ssh root@<VPS_IP_ADDRESS>
# Password: Haritha#12Tadaka
```

### Step 2: Get VPS IP Address

```bash
# On VPS, run:
curl -4 ifconfig.me
# Save this IP address for DNS configuration
```

### Step 3: Update System

```bash
# Update package lists and upgrade system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git vim htop ufw
```

### Step 4: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 🔧 Environment Configuration

### Production Environment Files

The deployment script will create these files automatically, but here's what they contain:

#### Backend `.env.production`
```bash
# Application Settings
APP_NAME=ChandraHoro
APP_VERSION=2.1.0
ENVIRONMENT=production
DEBUG=False

# API Configuration
API_V1_PREFIX=/api/v1
CORS_ORIGINS=https://jyotishdrishti.valuestream.in,https://valuestream.in

# Server
HOST=0.0.0.0
PORT=8000

# Database (MySQL)
DATABASE_URL=mysql+aiomysql://chandrahoro_user:<MYSQL_PASSWORD>@localhost:3306/chandrahoro_prod
SQL_ECHO=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Swiss Ephemeris
EPHEMERIS_PATH=/home/chandrahoro/ephemeris_data

# Location Services
GEONAMES_USERNAME=<YOUR_GEONAMES_USERNAME>

# LLM Vault
LLM_VAULT_KEY=<GENERATED_FERNET_KEY>
LLM_VAULT_DIR=/var/lib/chandrahoro/llm_vault

# Security
JWT_SECRET=<GENERATED_JWT_SECRET>

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

#### Frontend `.env.production`
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://jyotishdrishti.valuestream.in/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Settings
NEXT_PUBLIC_APP_NAME=ChandraHoro
NEXT_PUBLIC_APP_VERSION=2.1.0

# Authentication
NEXTAUTH_URL=https://jyotishdrishti.valuestream.in
NEXTAUTH_SECRET=<GENERATED_NEXTAUTH_SECRET>
JWT_SECRET=<GENERATED_JWT_SECRET>

# Database (for NextAuth)
DATABASE_URL=mysql://chandrahoro_user:<MYSQL_PASSWORD>@localhost:3306/chandrahoro_prod

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## 📊 Database Setup

### MySQL Configuration

```bash
# The deployment script will:
# 1. Install MySQL 8.0
# 2. Create database: chandrahoro_prod
# 3. Create user: chandrahoro_user
# 4. Grant privileges
# 5. Run migrations
```

### Manual Database Setup (if needed)

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE chandrahoro_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'chandrahoro_user'@'localhost' IDENTIFIED BY '<MYSQL_PASSWORD>';

-- Grant privileges
GRANT ALL PRIVILEGES ON chandrahoro_prod.* TO 'chandrahoro_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

---

## 🚀 Application Deployment

### Automated Deployment (Recommended)

```bash
# 1. Upload deployment script to VPS
scp chandrahoro/production-deploy.sh root@<VPS_IP>:/root/

# 2. SSH into VPS
ssh root@<VPS_IP>

# 3. Make script executable
chmod +x /root/production-deploy.sh

# 4. Run deployment script
./production-deploy.sh
```

The script will:
- ✅ Install all dependencies (Node.js, Python, MySQL, Redis, Nginx, PM2)
- ✅ Create application user and directories
- ✅ Clone repository
- ✅ Generate security secrets
- ✅ Configure environment variables
- ✅ Set up database
- ✅ Build frontend for production
- ✅ Configure Nginx reverse proxy
- ✅ Set up SSL with Let's Encrypt
- ✅ Start services with PM2
- ✅ Configure automatic startup

---

## 🔒 SSL/HTTPS Configuration

### Let's Encrypt SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d jyotishdrishti.valuestream.in

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
certbot renew --dry-run
```

---

## 🔄 Process Management

### PM2 Configuration

```bash
# Start backend
pm2 start /home/chandrahoro/chandrahoro/backend/ecosystem.config.js

# Start frontend
pm2 start /home/chandrahoro/chandrahoro/frontend/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Run the command it outputs

# View logs
pm2 logs

# Monitor processes
pm2 monit
```

---

## ✅ Verification & Testing

### Health Checks

```bash
# Backend API health
curl https://jyotishdrishti.valuestream.in/api/v1/health

# Frontend
curl https://jyotishdrishti.valuestream.in

# Check services
pm2 status
systemctl status nginx
systemctl status mysql
systemctl status redis
```

### Test Multi-Methodology Calculation

```bash
# Test chart calculation with all methodologies
curl -X POST https://jyotishdrishti.valuestream.in/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Production Test",
      "date": "1990-01-15",
      "time": "10:30:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi, India"
    },
    "preferences": {
      "methodology": "parashara",
      "ayanamsha": "Lahiri",
      "house_system": "Placidus",
      "chart_style": "north"
    }
  }'
```

---

## 📊 Monitoring & Maintenance

### Log Management

```bash
# View PM2 logs
pm2 logs

# View specific service logs
pm2 logs chandrahoro-backend
pm2 logs chandrahoro-frontend

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View MySQL logs
tail -f /var/log/mysql/error.log
```

### Performance Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn | grep LISTEN
```

### Database Backups

```bash
# Manual backup
mysqldump -u chandrahoro_user -p chandrahoro_prod > backup_$(date +%Y%m%d).sql

# Automated daily backups (add to crontab)
0 2 * * * /root/backup-database.sh
```

### Application Updates

```bash
# Pull latest code
su - chandrahoro
cd /home/chandrahoro/chandrahoro
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
pm2 restart chandrahoro-backend

# Update frontend
cd ../frontend
npm ci
npm run build
pm2 restart chandrahoro-frontend
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Backend not starting**
```bash
# Check logs
pm2 logs chandrahoro-backend

# Check environment variables
cat /home/chandrahoro/chandrahoro/backend/.env

# Test manually
cd /home/chandrahoro/chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Problem: Database connection failed**
```bash
# Test MySQL connection
mysql -u chandrahoro_user -p chandrahoro_prod

# Check DATABASE_URL in .env
grep DATABASE_URL /home/chandrahoro/chandrahoro/backend/.env

# Restart MySQL
systemctl restart mysql
```

### Frontend Issues

**Problem: Frontend not starting**
```bash
# Check logs
pm2 logs chandrahoro-frontend

# Rebuild frontend
cd /home/chandrahoro/chandrahoro/frontend
npm run build

# Restart
pm2 restart chandrahoro-frontend
```

**Problem: API calls failing**
```bash
# Check NEXT_PUBLIC_API_URL
grep NEXT_PUBLIC_API_URL /home/chandrahoro/chandrahoro/frontend/.env.production

# Should be: https://jyotishdrishti.valuestream.in/api
```

### SSL/HTTPS Issues

**Problem: SSL certificate not working**
```bash
# Check certificate
certbot certificates

# Renew certificate
certbot renew

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

**Problem: HTTP not redirecting to HTTPS**
```bash
# Check Nginx configuration
cat /etc/nginx/sites-enabled/chandrahoro

# Should have redirect in HTTP server block
# Reload Nginx
systemctl reload nginx
```

### Performance Issues

**Problem: High memory usage**
```bash
# Check PM2 memory
pm2 status

# Restart services
pm2 restart all

# Check for memory leaks
pm2 monit
```

**Problem: Slow response times**
```bash
# Check backend response time
time curl https://jyotishdrishti.valuestream.in/api/v1/health

# Check database performance
mysql -u chandrahoro_user -p chandrahoro_prod -e "SHOW PROCESSLIST;"

# Optimize database
mysql -u chandrahoro_user -p chandrahoro_prod -e "OPTIMIZE TABLE users, charts;"
```

---

## 🚨 Emergency Procedures

### Rollback Deployment

```bash
# Stop services
pm2 stop all

# Restore from backup
cd /home/chandrahoro
mv chandrahoro chandrahoro.failed
mv chandrahoro.backup.<timestamp> chandrahoro

# Restart services
pm2 restart all
```

### Restore Database

```bash
# Stop backend
pm2 stop chandrahoro-backend

# Restore database
mysql -u chandrahoro_user -p chandrahoro_prod < backup_<date>.sql

# Restart backend
pm2 start chandrahoro-backend
```

---

## 📞 Support & Resources

### Useful Commands Reference

```bash
# Service management
systemctl status nginx
systemctl restart nginx
systemctl status mysql
systemctl restart mysql

# PM2 management
pm2 status
pm2 restart all
pm2 logs
pm2 monit
pm2 save

# SSL management
certbot certificates
certbot renew
certbot renew --dry-run

# Database management
mysql -u chandrahoro_user -p chandrahoro_prod
mysqldump -u chandrahoro_user -p chandrahoro_prod > backup.sql

# Log viewing
tail -f /var/log/nginx/error.log
pm2 logs chandrahoro-backend --lines 100
```

### Important File Locations

```
/home/chandrahoro/chandrahoro/          - Application directory
/home/chandrahoro/chandrahoro/backend/  - Backend code
/home/chandrahoro/chandrahoro/frontend/ - Frontend code
/home/chandrahoro/logs/                 - Application logs
/var/lib/chandrahoro/llm_vault/         - Encrypted API keys
/etc/nginx/sites-available/chandrahoro  - Nginx configuration
/etc/letsencrypt/live/<domain>/         - SSL certificates
/root/chandrahoro-secrets-*.txt         - Deployment secrets
```

---

## ✅ Deployment Complete!

Your ChandraHoro application is now deployed to production at:
**https://jyotishdrishti.valuestream.in**

For detailed step-by-step instructions, see:
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `production-deploy.sh` - Automated deployment script
- `verify-deployment.sh` - Post-deployment verification

**Need Help?**
- Review logs: `pm2 logs`
- Check service status: `pm2 status`
- Run verification: `./verify-deployment.sh`

