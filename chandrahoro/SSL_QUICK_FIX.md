# 🔒 SSL/HTTPS Quick Fix Guide
## ChandraHoro - jyotishdrishti.valuestream.in

**Problem**: HTTPS not working, only HTTP accessible  
**Solution**: Follow these steps in order

---

## 🚀 Quick Fix (2 Minutes)

### Option 1: Automated Fix Script ⭐ **RECOMMENDED**

```bash
# SSH into your VPS
ssh root@<VPS_IP>

# Upload and run the fix script
scp chandrahoro/fix-ssl.sh root@<VPS_IP>:/root/
ssh root@<VPS_IP>
chmod +x /root/fix-ssl.sh
./fix-ssl.sh
```

The script will:
- ✅ Check DNS resolution
- ✅ Verify/obtain SSL certificates
- ✅ Configure Nginx for HTTPS
- ✅ Set up HTTP → HTTPS redirect
- ✅ Enable auto-renewal
- ✅ Verify everything works

---

### Option 2: Manual Fix (5 Minutes)

If the automated script doesn't work, follow these manual steps:

#### Step 1: Check DNS
```bash
dig +short jyotishdrishti.valuestream.in
# Should return your VPS IP
```

**If DNS not resolved**: Wait for DNS propagation (1-2 hours)

---

#### Step 2: Obtain SSL Certificate
```bash
# Method A: Certbot with Nginx plugin (recommended)
certbot --nginx -d jyotishdrishti.valuestream.in --non-interactive --agree-tos --email admin@jyotishdrishti.valuestream.in --redirect

# Method B: If Method A fails, use standalone mode
systemctl stop nginx
certbot certonly --standalone -d jyotishdrishti.valuestream.in --non-interactive --agree-tos --email admin@jyotishdrishti.valuestream.in
systemctl start nginx
```

---

#### Step 3: Verify Certificates
```bash
certbot certificates
ls -la /etc/letsencrypt/live/jyotishdrishti.valuestream.in/
```

Should show:
- `cert.pem`
- `chain.pem`
- `fullchain.pem`
- `privkey.pem`

---

#### Step 4: Update Nginx Configuration

```bash
# Edit Nginx config
nano /etc/nginx/sites-available/jyotishdrishti.valuestream.in
```

**Ensure it has these sections**:

```nginx
# HTTP server - Redirect to HTTPS
server {
    listen 80;
    server_name jyotishdrishti.valuestream.in;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name jyotishdrishti.valuestream.in;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/jyotishdrishti.valuestream.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jyotishdrishti.valuestream.in/privkey.pem;

    # ... rest of configuration
}
```

---

#### Step 5: Test and Reload Nginx
```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

#### Step 6: Verify HTTPS Works
```bash
# Test HTTPS
curl -I https://jyotishdrishti.valuestream.in

# Test HTTP redirect
curl -I http://jyotishdrishti.valuestream.in
# Should show: HTTP/1.1 301 Moved Permanently
```

---

## 🔍 Diagnostic Commands

Run these to diagnose the issue:

```bash
# 1. Run comprehensive diagnostic
./ssl-diagnostic.sh > ssl-report.txt
cat ssl-report.txt

# 2. Quick checks
certbot certificates                    # Check certificates
systemctl status nginx                  # Check Nginx
netstat -tlnp | grep :443              # Check port 443
tail -50 /var/log/nginx/error.log      # Check errors
```

---

## 🆘 Common Issues & Solutions

### Issue 1: "DNS resolution failed"
**Cause**: DNS not propagated yet  
**Fix**: Wait 1-2 hours, then run `certbot --nginx -d jyotishdrishti.valuestream.in`

---

### Issue 2: "Port 443 not listening"
**Cause**: Firewall blocking port 443  
**Fix**:
```bash
ufw allow 443/tcp
ufw reload
systemctl reload nginx
```

---

### Issue 3: "Certificate exists but HTTPS doesn't work"
**Cause**: Nginx not configured for SSL  
**Fix**:
```bash
# Re-run certbot with Nginx plugin
certbot --nginx -d jyotishdrishti.valuestream.in --redirect
systemctl reload nginx
```

---

### Issue 4: "Connection refused on HTTPS"
**Cause**: Nginx not listening on port 443  
**Fix**:
```bash
# Check Nginx config
nginx -t

# Check if SSL config is present
grep "listen 443" /etc/nginx/sites-enabled/jyotishdrishti.valuestream.in

# Reload Nginx
systemctl reload nginx
```

---

### Issue 5: "Certificate verification failed"
**Cause**: Certbot couldn't verify domain ownership  
**Fix**:
```bash
# Ensure port 80 is accessible
ufw allow 80/tcp

# Try again
certbot --nginx -d jyotishdrishti.valuestream.in
```

---

## 📋 Verification Checklist

After fixing, verify these:

- [ ] DNS resolves to VPS IP: `dig +short jyotishdrishti.valuestream.in`
- [ ] Certificates exist: `certbot certificates`
- [ ] Nginx running: `systemctl status nginx`
- [ ] Port 443 listening: `netstat -tlnp | grep :443`
- [ ] HTTPS works: `curl -I https://jyotishdrishti.valuestream.in`
- [ ] HTTP redirects: `curl -I http://jyotishdrishti.valuestream.in`
- [ ] Browser shows padlock: Open https://jyotishdrishti.valuestream.in
- [ ] Auto-renewal enabled: `systemctl status certbot.timer`

---

## 🔄 Enable Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Enable auto-renewal timer
systemctl enable certbot.timer
systemctl start certbot.timer

# Check timer status
systemctl status certbot.timer
```

---

## 📞 Still Not Working?

### Get Detailed Diagnostics

```bash
# Run diagnostic script
./ssl-diagnostic.sh > ssl-report.txt

# Share the output for help
cat ssl-report.txt
```

### Check Hostinger hPanel

1. Login to https://hpanel.hostinger.com/vps
2. Check if there's a firewall in hPanel blocking port 443
3. Ensure VPS is running and accessible

---

## 🎯 Expected Results

After successful fix:

✅ **HTTPS URL works**: https://jyotishdrishti.valuestream.in  
✅ **HTTP redirects to HTTPS**: http://jyotishdrishti.valuestream.in → https://...  
✅ **Browser shows padlock**: 🔒 Secure connection  
✅ **Certificate is valid**: Issued by Let's Encrypt  
✅ **Auto-renewal enabled**: Certificate renews automatically before expiry

---

## 📚 Additional Resources

- **Detailed Guide**: `SSL_TROUBLESHOOTING_GUIDE.md`
- **Diagnostic Script**: `./ssl-diagnostic.sh`
- **Fix Script**: `./fix-ssl.sh`
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## 💡 Pro Tips

1. **Always check DNS first**: SSL certificates require valid DNS
2. **Use certbot --nginx**: It configures Nginx automatically
3. **Test before reload**: Always run `nginx -t` before reloading
4. **Monitor logs**: Check `/var/log/nginx/error.log` for issues
5. **Enable auto-renewal**: Certificates expire every 90 days

---

**Need more help?** Run `./ssl-diagnostic.sh` and share the output!

