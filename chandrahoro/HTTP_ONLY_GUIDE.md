# 🌐 HTTP-Only Configuration Guide
## ChandraHoro - Temporary HTTP Access

**Purpose**: Temporarily disable HTTPS and use HTTP-only access  
**Domain**: http://jyotishdrishti.valuestream.in  
**Status**: Temporary solution for testing

---

## ⚠️ IMPORTANT WARNING

**This configuration disables HTTPS/SSL and uses HTTP only.**

- ❌ **NOT SECURE** for production use
- ❌ Data transmitted in **plain text** (not encrypted)
- ❌ Vulnerable to **man-in-the-middle attacks**
- ✅ **OK for testing** and troubleshooting
- ✅ Should be **temporary** until HTTPS is fixed

**For production, always use HTTPS!**

---

## 🚀 Quick Setup (2 Minutes)

### Automated Setup ⭐ **RECOMMENDED**

```bash
# 1. Upload script to VPS
scp chandrahoro/revert-to-http.sh root@<VPS_IP>:/root/

# 2. SSH into VPS
ssh root@<VPS_IP>

# 3. Run the script
chmod +x /root/revert-to-http.sh
./revert-to-http.sh
```

The script will:
- ✅ Backup current Nginx configuration
- ✅ Create HTTP-only configuration
- ✅ Test configuration
- ✅ Reload Nginx
- ✅ Verify HTTP access works

---

## 📋 Manual Setup (5 Minutes)

If you prefer manual setup:

### Step 1: Backup Current Configuration

```bash
# Create backup directory
mkdir -p /root/nginx-backups

# Backup current config
cp /etc/nginx/sites-available/jyotishdrishti.valuestream.in \
   /root/nginx-backups/jyotishdrishti.valuestream.in_$(date +%Y%m%d_%H%M%S).conf
```

---

### Step 2: Upload HTTP-Only Configuration

```bash
# Upload the config file
scp chandrahoro/nginx-http-only.conf root@<VPS_IP>:/etc/nginx/sites-available/jyotishdrishti.valuestream.in
```

**OR** create it manually:

```bash
nano /etc/nginx/sites-available/jyotishdrishti.valuestream.in
```

Copy the content from `nginx-http-only.conf` file.

---

### Step 3: Test and Reload Nginx

```bash
# Test configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx

# Check Nginx status
systemctl status nginx
```

---

### Step 4: Verify HTTP Access

```bash
# Test HTTP access
curl -I http://jyotishdrishti.valuestream.in

# Should return: HTTP/1.1 200 OK (or 301/302)
```

---

## ✅ Verification Checklist

After applying the configuration, verify:

- [ ] Nginx configuration test passes: `nginx -t`
- [ ] Nginx reloaded successfully: `systemctl status nginx`
- [ ] Backend is running: `curl http://localhost:8000/health`
- [ ] Frontend is running: `curl http://localhost:3000`
- [ ] HTTP access works: `curl -I http://jyotishdrishti.valuestream.in`
- [ ] Application loads in browser: http://jyotishdrishti.valuestream.in
- [ ] All features work (create chart, view results, etc.)

---

## 🔍 Troubleshooting

### Issue: "Connection refused"

**Check if services are running**:
```bash
# Check PM2 processes
pm2 status

# Restart if needed
pm2 restart all
```

---

### Issue: "502 Bad Gateway"

**Backend or frontend not responding**:
```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check PM2 logs
pm2 logs
```

---

### Issue: "Nginx test failed"

**Configuration syntax error**:
```bash
# Check syntax
nginx -t

# View error details
tail -20 /var/log/nginx/error.log

# Restore backup
cp /root/nginx-backups/jyotishdrishti.valuestream.in_*.conf \
   /etc/nginx/sites-available/jyotishdrishti.valuestream.in
```

---

## 🔄 Restoring HTTPS Later

When you're ready to enable HTTPS again:

### Option 1: Use SSL Fix Script

```bash
./fix-ssl.sh
```

---

### Option 2: Restore Previous Configuration

```bash
# List backups
ls -la /root/nginx-backups/

# Restore a backup
cp /root/nginx-backups/jyotishdrishti.valuestream.in_YYYYMMDD_HHMMSS.conf \
   /etc/nginx/sites-available/jyotishdrishti.valuestream.in

# Test and reload
nginx -t
systemctl reload nginx
```

---

### Option 3: Run Certbot Again

```bash
# Obtain SSL certificate and configure Nginx
certbot --nginx -d jyotishdrishti.valuestream.in --redirect
```

---

## 📊 What Changed

### Before (HTTPS Configuration)
```nginx
# HTTP server - Redirect to HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/.../fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;
    # ... rest of config
}
```

### After (HTTP-Only Configuration)
```nginx
# HTTP server - No redirect, serves directly
server {
    listen 80;
    server_name jyotishdrishti.valuestream.in;
    
    # Backend API
    location /api/ {
        proxy_pass http://chandrahoro_backend;
    }
    
    # Frontend
    location / {
        proxy_pass http://chandrahoro_frontend;
    }
}

# No HTTPS server block
```

---

## 🛠️ Useful Commands

```bash
# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx (after config changes)
systemctl reload nginx

# Restart Nginx (if reload doesn't work)
systemctl restart nginx

# View Nginx error logs
tail -f /var/log/nginx/chandrahoro_error.log

# View Nginx access logs
tail -f /var/log/nginx/chandrahoro_access.log

# Check PM2 processes
pm2 status

# View PM2 logs
pm2 logs

# Restart all PM2 processes
pm2 restart all

# Test HTTP access
curl -I http://jyotishdrishti.valuestream.in

# Test backend
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000
```

---

## 📝 Configuration Details

### What's Included in HTTP-Only Config

✅ **Rate Limiting**
- API: 10 requests/second (burst 20)
- General: 30 requests/second (burst 50)

✅ **Proxy Configuration**
- Backend API: `/api/*` → `localhost:8000`
- Frontend: `/*` → `localhost:3000`

✅ **Caching**
- Static assets: 1 year
- Images: 7 days
- HTML: No cache

✅ **Compression**
- Gzip enabled for text/JSON

✅ **Security Headers** (basic)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

❌ **Not Included**
- SSL/TLS encryption
- HTTPS redirect
- HSTS header
- SSL certificates

---

## 🎯 Next Steps

1. **Test the application** thoroughly on HTTP
2. **Verify all features** work correctly
3. **Plan HTTPS setup** when ready:
   - Ensure DNS is fully propagated
   - Run `./fix-ssl.sh` to enable HTTPS
   - Test HTTPS access
   - Monitor for issues

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `tail -f /var/log/nginx/error.log`
2. **Check services**: `pm2 status`
3. **Test configuration**: `nginx -t`
4. **Restart services**: `pm2 restart all && systemctl reload nginx`

---

**Remember**: This is a temporary solution. For production, always use HTTPS for security! 🔒

