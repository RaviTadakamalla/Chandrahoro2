# 🔒 SSL/HTTPS Troubleshooting Guide
## ChandraHoro - jyotishdrishti.valuestream.in

**Issue**: HTTPS not working, only HTTP accessible  
**Expected**: HTTPS with valid SSL certificate and HTTP → HTTPS redirect

---

## 🔍 Step 1: Diagnostic Commands

Run these commands on your VPS to diagnose the issue:

```bash
# SSH into VPS
ssh root@<VPS_IP>

# 1. Check Nginx status
systemctl status nginx

# 2. Check if Certbot obtained certificates
certbot certificates

# 3. Check certificate files
ls -la /etc/letsencrypt/live/jyotishdrishti.valuestream.in/

# 4. Check Nginx error logs
tail -50 /var/log/nginx/error.log

# 5. Check if port 443 is open and listening
netstat -tlnp | grep :443
# OR
ss -tlnp | grep :443

# 6. Check DNS resolution
nslookup jyotishdrishti.valuestream.in
dig jyotishdrishti.valuestream.in

# 7. Check Nginx configuration syntax
nginx -t

# 8. View current Nginx configuration
cat /etc/nginx/sites-enabled/jyotishdrishti.valuestream.in
```

---

## 🛠️ Step 2: Common Issues & Fixes

### Issue A: DNS Not Fully Propagated

**Symptoms**: Certbot fails with "DNS resolution failed" or "Domain not found"

**Check**:
```bash
# Check if DNS resolves to your VPS IP
dig jyotishdrishti.valuestream.in +short
# Should return your VPS IP address
```

**Fix**: Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)

---

### Issue B: Certbot Failed During Deployment

**Symptoms**: No certificates in `/etc/letsencrypt/live/`

**Fix - Manual Certbot Run**:
```bash
# Stop Nginx temporarily
systemctl stop nginx

# Run Certbot in standalone mode
certbot certonly --standalone -d jyotishdrishti.valuestream.in --non-interactive --agree-tos --email admin@jyotishdrishti.valuestream.in

# Start Nginx
systemctl start nginx

# Update Nginx configuration to use certificates
# See Step 3 below
```

**OR - Use Nginx Plugin**:
```bash
# Certbot with Nginx plugin (Nginx stays running)
certbot --nginx -d jyotishdrishti.valuestream.in --non-interactive --agree-tos --email admin@jyotishdrishti.valuestream.in --redirect
```

---

### Issue C: Nginx Not Configured for SSL

**Symptoms**: Certificates exist but HTTPS still doesn't work

**Check**:
```bash
# View Nginx config
cat /etc/nginx/sites-enabled/jyotishdrishti.valuestream.in

# Look for:
# - listen 443 ssl http2;
# - ssl_certificate paths
```

**Fix**: See Step 3 below for complete Nginx SSL configuration

---

### Issue D: Port 443 Blocked by Firewall

**Symptoms**: `netstat -tlnp | grep :443` shows nothing

**Fix**:
```bash
# Check UFW status
ufw status

# Allow HTTPS (port 443)
ufw allow 443/tcp

# Reload UFW
ufw reload

# Verify
ufw status
```

---

## 🔧 Step 3: Manual SSL Configuration

If Certbot ran successfully but Nginx isn't configured, follow these steps:

### 3.1 Verify Certificates Exist

```bash
ls -la /etc/letsencrypt/live/jyotishdrishti.valuestream.in/
# Should show:
# - cert.pem
# - chain.pem
# - fullchain.pem
# - privkey.pem
```

### 3.2 Update Nginx Configuration

```bash
# Backup current config
cp /etc/nginx/sites-available/jyotishdrishti.valuestream.in /etc/nginx/sites-available/jyotishdrishti.valuestream.in.backup

# Edit Nginx config
nano /etc/nginx/sites-available/jyotishdrishti.valuestream.in
```

**Replace with this configuration**:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream servers
upstream chandrahoro_frontend {
    server localhost:3000;
}

upstream chandrahoro_backend {
    server localhost:8000;
}

# HTTP server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name jyotishdrishti.valuestream.in;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name jyotishdrishti.valuestream.in;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/jyotishdrishti.valuestream.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jyotishdrishti.valuestream.in/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Backend API - /api/*
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://chandrahoro_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Frontend - /*
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static assets
    location /_next/static/ {
        proxy_pass http://chandrahoro_frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and static files
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://chandrahoro_frontend;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

Save and exit (Ctrl+X, Y, Enter)

### 3.3 Test and Reload Nginx

```bash
# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx

# Check Nginx status
systemctl status nginx
```

---

## ✅ Step 4: Verification

```bash
# 1. Check if HTTPS is working
curl -I https://jyotishdrishti.valuestream.in

# 2. Check if HTTP redirects to HTTPS
curl -I http://jyotishdrishti.valuestream.in
# Should show: HTTP/1.1 301 Moved Permanently
# Location: https://jyotishdrishti.valuestream.in

# 3. Test SSL certificate
openssl s_client -connect jyotishdrishti.valuestream.in:443 -servername jyotishdrishti.valuestream.in

# 4. Check certificate expiry
echo | openssl s_client -connect jyotishdrishti.valuestream.in:443 -servername jyotishdrishti.valuestream.in 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔄 Step 5: Set Up Auto-Renewal

```bash
# Test auto-renewal
certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer

# Enable auto-renewal (if not enabled)
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## 🆘 Quick Fix Script

If you want to automate the SSL setup, save this as `fix-ssl.sh`:

```bash
#!/bin/bash

echo "🔒 SSL/HTTPS Fix Script for ChandraHoro"
echo "========================================"

DOMAIN="jyotishdrishti.valuestream.in"

# Check DNS
echo "1. Checking DNS resolution..."
IP=$(dig +short $DOMAIN | head -n1)
if [ -z "$IP" ]; then
    echo "❌ DNS not resolved. Please wait for DNS propagation."
    exit 1
fi
echo "✅ DNS resolved to: $IP"

# Check if certificates exist
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "✅ SSL certificates already exist"
else
    echo "2. Obtaining SSL certificate..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate obtained successfully"
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "Check logs: /var/log/letsencrypt/letsencrypt.log"
        exit 1
    fi
fi

# Test Nginx configuration
echo "3. Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration error"
    exit 1
fi

# Reload Nginx
echo "4. Reloading Nginx..."
systemctl reload nginx
echo "✅ Nginx reloaded"

# Verify HTTPS
echo "5. Verifying HTTPS..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ HTTPS is working! (HTTP $HTTP_CODE)"
else
    echo "⚠️  HTTPS returned HTTP $HTTP_CODE"
fi

echo ""
echo "🎉 SSL setup complete!"
echo "Visit: https://$DOMAIN"
```

Make it executable and run:
```bash
chmod +x fix-ssl.sh
./fix-ssl.sh
```

---

## 📞 Still Having Issues?

### Check These:

1. **Hostinger Firewall**: Check if Hostinger has a firewall in hPanel that might be blocking port 443
2. **VPS Firewall**: Ensure UFW allows port 443
3. **DNS**: Verify DNS is pointing to correct IP
4. **Certbot Logs**: Check `/var/log/letsencrypt/letsencrypt.log`
5. **Nginx Logs**: Check `/var/log/nginx/error.log`

### Get Detailed Diagnostics:

```bash
# Run this comprehensive diagnostic
cat > /root/ssl-diagnostic.sh << 'EOF'
#!/bin/bash
echo "=== SSL Diagnostic Report ==="
echo ""
echo "1. DNS Resolution:"
dig +short jyotishdrishti.valuestream.in
echo ""
echo "2. Certbot Certificates:"
certbot certificates
echo ""
echo "3. Certificate Files:"
ls -la /etc/letsencrypt/live/jyotishdrishti.valuestream.in/ 2>/dev/null || echo "No certificates found"
echo ""
echo "4. Port 443 Status:"
netstat -tlnp | grep :443
echo ""
echo "5. Nginx Status:"
systemctl status nginx --no-pager
echo ""
echo "6. Nginx Configuration Test:"
nginx -t
echo ""
echo "7. UFW Status:"
ufw status
echo ""
echo "8. Recent Nginx Errors:"
tail -20 /var/log/nginx/error.log
echo ""
echo "9. Recent Certbot Logs:"
tail -20 /var/log/letsencrypt/letsencrypt.log 2>/dev/null || echo "No certbot logs"
EOF

chmod +x /root/ssl-diagnostic.sh
./ssl-diagnostic.sh
```

Send me the output and I can provide specific fixes!

---

**Next Steps**: Run the diagnostic commands in Step 1 and share the output so I can provide targeted fixes.

