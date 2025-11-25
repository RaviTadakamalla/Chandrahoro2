# 📦 ChandraHoro Production Deployment Package
## Hostinger VPS - jyotishdrishti.valuestream.in

This package contains everything you need to deploy ChandraHoro to production on your Hostinger VPS.

---

## 📁 Deployment Files Overview

### 🚀 Main Deployment Files

1. **`production-deploy.sh`** ⭐ **START HERE**
   - Automated deployment script
   - Installs all dependencies
   - Configures services
   - Sets up SSL
   - **Usage**: `./production-deploy.sh`

2. **`verify-deployment.sh`**
   - Post-deployment verification
   - Checks all services
   - Tests health endpoints
   - **Usage**: `./verify-deployment.sh`

### 📚 Documentation

3. **`QUICK_START_DEPLOYMENT.md`** ⭐ **READ THIS FIRST**
   - 5-minute quick start guide
   - Step-by-step instructions
   - Common issues & fixes
   - **Best for**: First-time deployment

4. **`PRODUCTION_DEPLOYMENT_GUIDE.md`**
   - Complete deployment guide
   - Detailed configuration
   - Monitoring & maintenance
   - Troubleshooting
   - **Best for**: Reference & advanced topics

5. **`PRODUCTION_DEPLOYMENT_CHECKLIST.md`**
   - Comprehensive checklist
   - Pre-deployment requirements
   - Verification steps
   - Security checks
   - **Best for**: Ensuring nothing is missed

### ⚙️ Configuration Files

6. **`backend/.env.production.template`**
   - Backend environment variables template
   - Replace placeholders with actual values
   - **Used by**: `production-deploy.sh`

7. **`frontend/.env.production.template`**
   - Frontend environment variables template
   - Replace placeholders with actual values
   - **Used by**: `production-deploy.sh`

8. **`nginx/jyotishdrishti.valuestream.in.conf`**
   - Nginx reverse proxy configuration
   - SSL/HTTPS setup
   - Rate limiting
   - Security headers
   - **Used by**: `production-deploy.sh`

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- ✅ Hostinger VPS with root access
- ✅ Domain: jyotishdrishti.valuestream.in
- ✅ DNS configured (A record pointing to VPS IP)
- ✅ GeoNames username (free at https://www.geonames.org/login)

### Deployment Steps

```bash
# 1. Upload deployment script to VPS
scp production-deploy.sh root@<VPS_IP>:/root/

# 2. SSH into VPS
ssh root@<VPS_IP>

# 3. Run deployment
chmod +x /root/production-deploy.sh
./production-deploy.sh

# 4. Verify deployment
./verify-deployment.sh

# 5. Open in browser
# https://jyotishdrishti.valuestream.in
```

**That's it!** Your application is now live! 🎉

---

## 📖 Detailed Documentation

### For First-Time Deployment
1. Read `QUICK_START_DEPLOYMENT.md`
2. Follow the 7 steps
3. Run `verify-deployment.sh`
4. Test in browser

### For Production Setup
1. Review `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
2. Prepare all required credentials
3. Run `production-deploy.sh`
4. Follow post-deployment steps

### For Troubleshooting
1. Check `PRODUCTION_DEPLOYMENT_GUIDE.md` → Troubleshooting section
2. Review logs: `pm2 logs`
3. Check service status: `pm2 status`
4. Run verification: `./verify-deployment.sh`

---

## 🔐 Security & Secrets

### Generated Secrets
The deployment script generates these secrets automatically:
- `LLM_VAULT_KEY` - Fernet encryption key
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `JWT_SECRET` - JWT token secret
- `MYSQL_PASSWORD` - Database password

**Important**: These are saved to `/root/chandrahoro-secrets-<timestamp>.txt`

### Manual Secret Generation
If you need to generate secrets manually:

```bash
# LLM_VAULT_KEY
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# NEXTAUTH_SECRET and JWT_SECRET
openssl rand -base64 32

# MySQL Password
openssl rand -base64 24
```

---

## 🛠️ What Gets Installed

### System Dependencies
- Node.js 18 LTS
- Python 3.11
- MySQL 8.0
- Redis 7
- Nginx
- PM2 (process manager)
- Certbot (SSL certificates)

### Application Components
- **Backend**: FastAPI (Python) on port 8000
- **Frontend**: Next.js (Node.js) on port 3000
- **Database**: MySQL on port 3306
- **Cache**: Redis on port 6379
- **Web Server**: Nginx on ports 80/443

---

## 📊 Service Management

### PM2 Commands
```bash
# View all services
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart chandrahoro-backend
pm2 restart chandrahoro-frontend
pm2 restart all

# Monitor processes
pm2 monit

# Stop services
pm2 stop all
```

### System Services
```bash
# Nginx
systemctl status nginx
systemctl restart nginx
systemctl reload nginx

# MySQL
systemctl status mysql
systemctl restart mysql

# Redis
systemctl status redis
systemctl restart redis
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# SSH into VPS
ssh chandrahoro@<VPS_IP>

# Pull latest code
cd /home/chandrahoro/chandrahoro
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# Update frontend
cd ../frontend
npm ci
npm run build

# Restart services
pm2 restart all
```

### Database Backups
```bash
# Manual backup
mysqldump -u chandrahoro_user -p chandrahoro_prod > backup_$(date +%Y%m%d).sql

# Automated backups (already configured by deployment script)
# Daily at 2 AM via cron
```

---

## 🌐 URLs & Endpoints

After deployment, your application will be available at:

- **Frontend**: https://jyotishdrishti.valuestream.in
- **API Docs**: https://jyotishdrishti.valuestream.in/api/v1/docs
- **Health Check**: https://jyotishdrishti.valuestream.in/health
- **Backend Health**: https://jyotishdrishti.valuestream.in/api/v1/health

---

## 📞 Support & Help

### Common Issues

**Issue**: SSL certificate failed
- **Cause**: DNS not propagated
- **Fix**: Wait for DNS, then run `certbot --nginx -d jyotishdrishti.valuestream.in`

**Issue**: Backend not starting
- **Fix**: Check logs with `pm2 logs chandrahoro-backend`

**Issue**: Frontend not loading
- **Fix**: Check logs with `pm2 logs chandrahoro-frontend`

### Getting Help
1. Check logs: `pm2 logs`
2. Run verification: `./verify-deployment.sh`
3. Review troubleshooting guide in `PRODUCTION_DEPLOYMENT_GUIDE.md`
4. Check service status: `pm2 status` and `systemctl status nginx mysql redis`

---

## ✅ Deployment Checklist

- [ ] DNS configured and propagated
- [ ] VPS access confirmed
- [ ] GeoNames username obtained
- [ ] Deployment script uploaded
- [ ] Deployment script executed successfully
- [ ] All services running (verified with `pm2 status`)
- [ ] SSL certificate obtained
- [ ] Frontend accessible via HTTPS
- [ ] API documentation accessible
- [ ] Test chart calculation works
- [ ] All 4 methodologies calculate correctly
- [ ] Database backups configured

---

## 🎉 Success!

Once all checkboxes are marked, your ChandraHoro application is successfully deployed to production!

**Next Steps**:
1. Monitor logs for the first 24 hours
2. Test all features thoroughly
3. Share with users
4. Set up monitoring/alerting (optional)

---

**For detailed instructions, see**:
- `QUICK_START_DEPLOYMENT.md` - Quick start guide
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete guide
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Detailed checklist

