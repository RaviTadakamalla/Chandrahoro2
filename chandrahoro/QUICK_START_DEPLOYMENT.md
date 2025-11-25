# 🚀 ChandraHoro - Quick Start Deployment Guide
## Deploy to Production in 5 Minutes!

**Target**: jyotishdrishti.valuestream.in
**Server**: Hostinger VPS
**Time**: ~5-10 minutes (excluding DNS propagation)

---

## Prerequisites

✅ **VPS Access**
- SSH access with root password: `Haritha#12Tadaka`
- VPS IP address from Hostinger hPanel

✅ **DNS Configuration**
- Point `jyotishdrishti.valuestream.in` to your VPS IP
- Wait for DNS propagation (1-2 hours typically)

✅ **Required Information**
- GeoNames username (get free at: https://www.geonames.org/login)
- Optional: AI API keys (Perplexity, OpenAI, Anthropic)

---

## Step 1: Get VPS IP Address

1. Login to Hostinger hPanel: https://hpanel.hostinger.com/vps
2. Find your VPS IP address
3. Save it for DNS configuration

---

## Step 2: Configure DNS

1. Go to your domain DNS settings
2. Add/Update A record:
   ```
   Type: A
   Name: jyotishdrishti
   Value: <YOUR_VPS_IP>
   TTL: 3600
   ```
3. Wait for DNS propagation (verify with: `dig jyotishdrishti.valuestream.in`)

---

## Step 3: Upload Deployment Script

From your local machine:

```bash
# Navigate to project directory
cd /path/to/chandrahoro

# Upload deployment script to VPS
scp production-deploy.sh root@<VPS_IP>:/root/

# Enter password when prompted: Haritha#12Tadaka
```

---

## Step 4: Run Deployment

```bash
# SSH into VPS
ssh root@<VPS_IP>
# Password: Haritha#12Tadaka

# Make script executable
chmod +x /root/production-deploy.sh

# Run deployment
./production-deploy.sh
```

The script will prompt you for:
1. **GeoNames username** - Required for location services
2. **MySQL password** - Press Enter to auto-generate
3. **API keys** - Optional, press Enter to skip

**Important**: The script will display generated secrets. Save them securely!

---

## Step 5: Wait for Deployment

The script will automatically:
- ✅ Update system packages
- ✅ Install Node.js, Python, MySQL, Redis, Nginx, PM2
- ✅ Create application user and directories
- ✅ Clone repository
- ✅ Set up database
- ✅ Configure backend and frontend
- ✅ Build production frontend
- ✅ Start services with PM2
- ✅ Configure Nginx
- ✅ Set up SSL (if DNS is ready)

**Duration**: 5-10 minutes

---

## Step 6: Verify Deployment

```bash
# Run verification script
./verify-deployment.sh
```

This will check:
- ✅ All services running
- ✅ Health endpoints responding
- ✅ SSL configured
- ✅ Database connected

---

## Step 7: Test in Browser

Open in your browser:

1. **Frontend**: https://jyotishdrishti.valuestream.in
2. **API Docs**: https://jyotishdrishti.valuestream.in/api/v1/docs
3. **Health Check**: https://jyotishdrishti.valuestream.in/health

Test functionality:
- ✅ Create a test chart
- ✅ Verify all 4 methodologies calculate (Parashara, KP, Jaimini, Western)
- ✅ Switch between methodology tabs
- ✅ Check all features display correctly

---

## 🎉 Deployment Complete!

Your ChandraHoro application is now live at:
**https://jyotishdrishti.valuestream.in**

---

## Common Issues & Quick Fixes

### Issue: SSL Certificate Failed

**Cause**: DNS not propagated yet

**Fix**:
```bash
# Wait for DNS propagation, then run:
certbot --nginx -d jyotishdrishti.valuestream.in
```

### Issue: Backend Not Starting

**Fix**:
```bash
# Check logs
pm2 logs chandrahoro-backend

# Restart
pm2 restart chandrahoro-backend
```

### Issue: Frontend Not Loading

**Fix**:
```bash
# Check logs
pm2 logs chandrahoro-frontend

# Restart
pm2 restart chandrahoro-frontend
```

### Issue: Database Connection Failed

**Fix**:
```bash
# Check MySQL status
systemctl status mysql

# Restart MySQL
systemctl restart mysql

# Restart backend
pm2 restart chandrahoro-backend
```

---

## Useful Commands

```bash
# View all logs
pm2 logs

# Check service status
pm2 status

# Restart all services
pm2 restart all

# Monitor processes
pm2 monit

# Check Nginx status
systemctl status nginx

# Reload Nginx
systemctl reload nginx

# View Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Next Steps

1. **Set up backups**:
   ```bash
   # Create backup script
   cat > /root/backup-database.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/home/chandrahoro/backups"
   DATE=$(date +%Y%m%d-%H%M%S)
   mkdir -p $BACKUP_DIR
   mysqldump -u chandrahoro_user -p chandrahoro_prod > $BACKUP_DIR/backup_$DATE.sql
   gzip $BACKUP_DIR/backup_$DATE.sql
   find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
   EOF

   chmod +x /root/backup-database.sh

   # Add to crontab (daily at 2 AM)
   (crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-database.sh") | crontab -
   ```

2. **Monitor logs** for the first 24 hours

3. **Test all features** thoroughly

4. **Share with users** and gather feedback!

---

## Support

For detailed documentation, see:
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Detailed checklist
- `production-deploy.sh` - Deployment script
- `verify-deployment.sh` - Verification script

**Need help?** Check the troubleshooting section in `PRODUCTION_DEPLOYMENT_GUIDE.md`