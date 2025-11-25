# ⚡ Quick Reference: ChandraHoro Hosting

## TL;DR (Too Long; Didn't Read)

**Your current plan:** ❌ Won't work
**Best option:** Hostinger VPS 2 ($6-8/month) OR Vercel+Railway ($5-15/month)
**Time to deploy:** 30 min (Vercel) or 2-4 hours (VPS)

---

## Quick Decision Guide

### Answer These Questions:

**Q1: Do you want full control?**
- YES → Hostinger VPS 2
- NO → Vercel + Railway

**Q2: Are you comfortable with DevOps?**
- YES → Hostinger VPS 2
- NO → Vercel + Railway

**Q3: Do you want the cheapest option?**
- YES → Hostinger VPS 2 ($6-8/month)
- NO → Vercel + Railway ($5-15/month)

**Q4: Do you prefer modern approaches?**
- YES → Vercel + Railway
- NO → Hostinger VPS 2

---

## Option Comparison (30 seconds)

| Aspect | VPS 2 | Vercel+Railway |
|--------|-------|----------------|
| Cost | $6-8/mo | $5-15/mo |
| Setup Time | 2-4 hrs | 30 min |
| Difficulty | Medium | Easy |
| Control | Full | Limited |
| DevOps | Required | Minimal |
| Scaling | Manual | Auto |
| Best For | Control | Simplicity |

---

## Hostinger VPS 2 Quick Start

### 1. Upgrade ($5.99-7.99/month)
- Go to Hostinger dashboard
- Upgrade from Premium to VPS 2
- Choose Ubuntu 22.04 LTS

### 2. SSH In
```bash
ssh root@your_vps_ip
```

### 3. Install Basics
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs python3.11 python3.11-venv
```

### 4. Deploy Frontend
```bash
cd /home/chandrahoro/chandrahoro/frontend
npm install && npm run build
npm install -g pm2
pm2 start "npm start" --name "frontend"
```

### 5. Deploy Backend
```bash
cd /home/chandrahoro/chandrahoro/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
pm2 start "gunicorn app.main:app --workers 4 --bind 0.0.0.0:8001" --name "backend"
```

### 6. Install Nginx
```bash
sudo apt install -y nginx
# Configure reverse proxy (see full guide)
sudo systemctl start nginx
```

### 7. SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

---

## Vercel + Railway Quick Start

### 1. Create Accounts
- Vercel: https://vercel.com
- Railway: https://railway.app

### 2. Push to GitHub
```bash
git push origin main
```

### 3. Deploy Frontend (Vercel)
- Connect GitHub repo
- Select `frontend` directory
- Deploy

### 4. Deploy Backend (Railway)
- Create new project
- Connect GitHub repo
- Select `backend` directory
- Add environment variables
- Deploy

### 5. Connect Services
- Get Railway backend URL
- Add to Vercel environment variables
- Redeploy

---

## Troubleshooting Quick Fixes

### Frontend Not Loading
```bash
# VPS
pm2 logs frontend
sudo netstat -tlnp | grep 3000

# Vercel
Check deployment logs in dashboard
```

### Backend API Errors
```bash
# VPS
pm2 logs backend
sudo netstat -tlnp | grep 8001

# Railway
Check logs in Railway dashboard
```

### Domain Not Working
```bash
# Check DNS
nslookup your_domain.com

# Check Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## Performance Checklist

- [ ] Frontend loads in < 2 seconds
- [ ] API responds in < 500ms
- [ ] Astrological calculations complete in < 5 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate valid
- [ ] Monitoring alerts set up

---

## Monitoring Commands

### VPS
```bash
# Check all processes
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit

# Restart services
pm2 restart all
```

### Vercel
- Dashboard: https://vercel.com/dashboard
- Check deployments
- View analytics
- Monitor errors

### Railway
- Dashboard: https://railway.app
- Check deployments
- View logs
- Monitor metrics

---

## Cost Breakdown

### VPS 2 (Recommended for Budget)
- VPS: $5.99/month
- Domain: $1/month
- SSL: Free
- **Total: $7/month**

### Vercel + Railway (Recommended for Simplicity)
- Vercel: Free (usually)
- Railway: $5-10/month
- Domain: $1/month
- **Total: $6-11/month**

---

## Important Reminders

⚠️ **DO NOT use Premium Web Hosting** - It won't work
✅ **VPS 2 is minimum** - If staying with Hostinger
✅ **Vercel+Railway is easier** - If you prefer simplicity
✅ **Both are production-ready** - Choose based on preference

---

## Next Steps (In Order)

1. **Read:** `HOSTING_DECISION_SUMMARY.md`
2. **Decide:** VPS 2 or Vercel+Railway
3. **Prepare:** Get code ready
4. **Deploy:** Follow appropriate guide
5. **Test:** Verify all features
6. **Monitor:** Set up alerts

---

## Useful Links

### Hostinger
- Dashboard: https://hpanel.hostinger.com
- Support: https://www.hostinger.com/support
- VPS Docs: https://support.hostinger.com/en/articles/6671577

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment/vercel

### Railway
- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Python Guide: https://docs.railway.app/guides/python

---

## Emergency Contacts

### If VPS Goes Down
1. SSH in and check processes: `pm2 status`
2. Restart services: `pm2 restart all`
3. Check logs: `pm2 logs`
4. Contact Hostinger support

### If Vercel/Railway Goes Down
1. Check status page
2. Check deployment logs
3. Redeploy if needed
4. Contact support

---

## Final Checklist Before Going Live

- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Frontend deployed and tested
- [ ] Backend deployed and tested
- [ ] Database connected (if applicable)
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Error logging enabled
- [ ] Performance optimized

---

**Ready to deploy? Start with the full guides!** 🚀

