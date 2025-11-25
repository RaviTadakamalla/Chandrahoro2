# 📋 ChandraHoro Production Deployment Checklist
## Domain: jyotishdrishti.valuestream.in

---

## Pre-Deployment Checklist

### 1. DNS Configuration ✅
- [ ] Point domain `jyotishdrishti.valuestream.in` to VPS IP address
- [ ] Verify DNS propagation: `dig jyotishdrishti.valuestream.in`
- [ ] Wait for DNS to propagate (can take up to 48 hours, usually 1-2 hours)

### 2. VPS Access ✅
- [x] SSH access confirmed: `ssh root@<VPS_IP>`
- [x] Root password: Haritha#12Tadaka
- [ ] Firewall configured (ports 22, 80, 443 open)

### 3. Required Credentials 📝
- [ ] **GeoNames Username**: ________________
- [ ] **Perplexity API Key** (optional): ________________
- [ ] **OpenAI API Key** (optional): ________________
- [ ] **Anthropic API Key** (optional): ________________

### 4. Deployment Files Ready ✅
- [x] `production-deploy.sh` - Main deployment script
- [x] `.env.production.template` - Backend environment template
- [x] `.env.production.template` - Frontend environment template
- [x] `jyotishdrishti.valuestream.in.conf` - Nginx configuration

---

## Deployment Steps

### Step 1: Upload Deployment Script
```bash
# From your local machine
scp chandrahoro/production-deploy.sh root@<VPS_IP>:/root/
```
- [ ] Script uploaded successfully

### Step 2: Connect to VPS
```bash
ssh root@<VPS_IP>
```
- [ ] Connected to VPS

### Step 3: Run Deployment Script
```bash
chmod +x /root/production-deploy.sh
./production-deploy.sh
```
- [ ] Script execution started
- [ ] GeoNames username entered
- [ ] MySQL password generated/entered
- [ ] API keys entered (optional)
- [ ] Security secrets generated and saved
- [ ] System packages updated
- [ ] Dependencies installed (Node.js, Python, MySQL, Redis, Nginx, PM2)
- [ ] Application user created
- [ ] Repository cloned
- [ ] Database created and configured
- [ ] Backend configured and dependencies installed
- [ ] Database migrations completed
- [ ] Frontend configured and built
- [ ] PM2 configured and services started
- [ ] Nginx configured
- [ ] SSL certificate obtained (if DNS ready)

### Step 4: Verify DNS Before SSL
```bash
# Check if domain points to VPS
dig jyotishdrishti.valuestream.in

# Should show your VPS IP address
```
- [ ] DNS configured correctly

### Step 5: Configure SSL (if skipped during deployment)
```bash
certbot --nginx -d jyotishdrishti.valuestream.in
```
- [ ] SSL certificate obtained
- [ ] HTTPS redirect configured
- [ ] Auto-renewal tested

---

## Post-Deployment Verification

### 1. Service Status Checks
```bash
# Check all services
systemctl status nginx
systemctl status mysql
systemctl status redis

# Check PM2 processes
su - chandrahoro -c "pm2 status"
```
- [ ] Nginx running
- [ ] MySQL running
- [ ] Redis running
- [ ] Backend process running (PM2)
- [ ] Frontend process running (PM2)

### 2. Health Endpoint Tests
```bash
# Backend health
curl https://jyotishdrishti.valuestream.in/api/v1/health

# Frontend health
curl https://jyotishdrishti.valuestream.in/health

# API documentation
curl https://jyotishdrishti.valuestream.in/api/v1/docs
```
- [ ] Backend health check passes
- [ ] Frontend health check passes
- [ ] API documentation accessible

### 3. Browser Tests
Open in browser:
- [ ] https://jyotishdrishti.valuestream.in (Frontend loads)
- [ ] https://jyotishdrishti.valuestream.in/api/v1/docs (API docs load)
- [ ] SSL certificate valid (green padlock)
- [ ] No console errors

### 4. Functional Tests
- [ ] User registration works
- [ ] User login works
- [ ] Chart calculation works (test with sample data)
- [ ] Multi-methodology calculation works (all 4 methodologies)
- [ ] Methodology switching works (Parashara, KP, Jaimini, Western)
- [ ] All tabs display data correctly

### 5. Performance Tests
```bash
# Check response times
time curl https://jyotishdrishti.valuestream.in/api/v1/health

# Check memory usage
free -h

# Check disk usage
df -h

# Check PM2 metrics
su - chandrahoro -c "pm2 monit"
```
- [ ] Response times acceptable (<500ms for health check)
- [ ] Memory usage normal (<80%)
- [ ] Disk usage normal (<80%)
- [ ] No memory leaks in PM2

---

## Security Verification

### 1. SSL/TLS Configuration
```bash
# Test SSL configuration
curl -I https://jyotishdrishti.valuestream.in

# Should show:
# - HTTP/2 200
# - Strict-Transport-Security header
# - X-Frame-Options header
# - X-Content-Type-Options header
```
- [ ] HTTPS working
- [ ] Security headers present
- [ ] HTTP redirects to HTTPS

### 2. Firewall Configuration
```bash
ufw status
```
- [ ] Only ports 22, 80, 443 open
- [ ] Firewall enabled

### 3. File Permissions
```bash
# Check sensitive files
ls -la /home/chandrahoro/chandrahoro/backend/.env
ls -la /home/chandrahoro/chandrahoro/frontend/.env.production
ls -la /root/chandrahoro-secrets-*.txt
```
- [ ] .env files have 600 permissions
- [ ] Secrets file has 600 permissions
- [ ] Application files owned by chandrahoro user

---

## Backup & Monitoring Setup

### 1. Database Backup
```bash
# Create backup script
cat > /root/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/chandrahoro/backups"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u chandrahoro_user -p chandrahoro_prod > $BACKUP_DIR/chandrahoro_prod_$DATE.sql
gzip $BACKUP_DIR/chandrahoro_prod_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /root/backup-database.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-database.sh") | crontab -
```
- [ ] Backup script created
- [ ] Cron job configured

### 2. Log Rotation
```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```
- [ ] Log rotation configured

### 3. Monitoring
```bash
# Install monitoring tools (optional)
apt install -y htop iotop nethogs
```
- [ ] Monitoring tools installed

---

## Troubleshooting

### Common Issues

**Issue: Backend not starting**
```bash
# Check logs
su - chandrahoro -c "pm2 logs chandrahoro-backend"

# Check environment
su - chandrahoro -c "cd /home/chandrahoro/chandrahoro/backend && source venv/bin/activate && python -c 'import os; print(os.getenv(\"DATABASE_URL\"))'"
```

**Issue: Frontend not starting**
```bash
# Check logs
su - chandrahoro -c "pm2 logs chandrahoro-frontend"

# Rebuild frontend
su - chandrahoro -c "cd /home/chandrahoro/chandrahoro/frontend && npm run build"
```

**Issue: Database connection failed**
```bash
# Test MySQL connection
mysql -u chandrahoro_user -p chandrahoro_prod

# Check MySQL status
systemctl status mysql
```

**Issue: SSL certificate failed**
```bash
# Check DNS
dig jyotishdrishti.valuestream.in

# Try manual certificate
certbot certonly --standalone -d jyotishdrishti.valuestream.in
```

---

## Deployment Complete! 🎉

Once all checkboxes are marked, your ChandraHoro application is successfully deployed to production!

**Important Files to Save:**
- `/root/chandrahoro-secrets-*.txt` - Contains all secrets
- `/home/chandrahoro/chandrahoro/backend/.env` - Backend configuration
- `/home/chandrahoro/chandrahoro/frontend/.env.production` - Frontend configuration

**Next Steps:**
1. Monitor logs for the first 24 hours
2. Set up regular database backups
3. Configure monitoring/alerting
4. Test all features thoroughly
5. Share the URL with users!

