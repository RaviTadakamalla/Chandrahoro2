# 🚀 ChandraHoro Deployment - Quick Reference Card

**Print this page and keep it handy during deployment!**

---

## 📋 Pre-Deployment Information

### **VPS Credentials:**
```
VPS IP Address: _________________ (from Hostinger email)
Root Password:  Haritha#12Tadaka (CHANGE AFTER FIRST LOGIN!)
New Root Password: _________________ (save securely!)
Server Location: _________________ (from Hostinger)
```

### **Application User:**
```
Username: chandrahoro
Password: _________________ (create during setup)
```

### **Domain & SSL:**
```
Domain Name: _________________ (optional)
Email for SSL: _________________ (if using domain)
```

### **Database Credentials:**
```
MySQL Root Password: _________________ (create during setup)
Database Name: chandrahoro_db
Database User: chandrahoro_user
Database Password: _________________ (create during setup)
```

### **API Keys:**
```
GeoNames Username: _________________
Perplexity API Key: _________________
Other LLM Keys: _________________ (optional)
```

---

## 🔑 Generated Secrets (Save These!)

**Run this command to generate secrets:**
```bash
python3 << 'EOF'
from cryptography.fernet import Fernet
import secrets
import base64

print("\nLLM_VAULT_KEY=" + Fernet.generate_key().decode())
print("NEXTAUTH_SECRET=" + base64.b64encode(secrets.token_bytes(32)).decode())
print("JWT_SECRET=" + base64.b64encode(secrets.token_bytes(32)).decode())
EOF
```

**Copy the output here:**
```
LLM_VAULT_KEY=_________________________________________________
NEXTAUTH_SECRET=_______________________________________________
JWT_SECRET=____________________________________________________
```

---

## 📝 Deployment Checklist

### **Phase 1: Initial VPS Access (15 min)**
- [ ] SSH into VPS: `ssh root@YOUR_VPS_IP`
- [ ] Change root password: `passwd`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Create user: `adduser chandrahoro`
- [ ] Add to sudo: `usermod -aG sudo chandrahoro`
- [ ] Configure firewall: `ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Install tools: `apt install -y curl wget git vim htop certbot python3-certbot-nginx`
- [ ] Switch user: `su - chandrahoro`

### **Phase 2: Install Dependencies (30 min)**
- [ ] Node.js 18: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`
- [ ] Python 3.11: `sudo apt install -y python3.11 python3.11-venv python3-pip`
- [ ] System deps: `sudo apt install -y build-essential libssl-dev libffi-dev python3-dev libmysqlclient-dev pkg-config`
- [ ] MySQL: `sudo apt install -y mysql-server && sudo mysql_secure_installation`
- [ ] Redis: `sudo apt install -y redis-server`
- [ ] Nginx: `sudo apt install -y nginx`
- [ ] PM2: `sudo npm install -g pm2`

### **Phase 3: Clone & Setup (20 min)**
- [ ] Clone repo: `git clone https://github.com/WhatTag/chandrahoro.git && cd chandrahoro`
- [ ] Generate secrets (see above)
- [ ] Create vault dir: `sudo mkdir -p /var/lib/chandrahoro/llm_vault && sudo chown -R chandrahoro:chandrahoro /var/lib/chandrahoro`

### **Phase 4: Database Setup (15 min)**
- [ ] Login MySQL: `sudo mysql`
- [ ] Create database: `CREATE DATABASE chandrahoro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- [ ] Create user: `CREATE USER 'chandrahoro_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';`
- [ ] Grant privileges: `GRANT ALL PRIVILEGES ON chandrahoro_db.* TO 'chandrahoro_user'@'localhost';`
- [ ] Flush: `FLUSH PRIVILEGES;` then `EXIT;`

### **Phase 5: Backend Setup (25 min)**
- [ ] Navigate: `cd ~/chandrahoro/backend`
- [ ] Create venv: `python3.11 -m venv venv && source venv/bin/activate`
- [ ] Install deps: `pip install --upgrade pip && pip install -r requirements.txt`
- [ ] Configure .env: `cp .env .env.production && nano .env.production`
- [ ] Run migrations: `alembic upgrade head`
- [ ] Create systemd service: `sudo nano /etc/systemd/system/chandrahoro-backend.service`
- [ ] Start service: `sudo systemctl daemon-reload && sudo systemctl enable chandrahoro-backend && sudo systemctl start chandrahoro-backend`
- [ ] Test: `curl http://localhost:8000/health`

### **Phase 6: Frontend Setup (25 min)**
- [ ] Navigate: `cd ~/chandrahoro/frontend`
- [ ] Install deps: `npm install`
- [ ] Configure .env: `cp .env.local .env.production && nano .env.production`
- [ ] Build: `npm run build`
- [ ] Create PM2 config: `nano ecosystem.config.js`
- [ ] Start PM2: `pm2 start ecosystem.config.js && pm2 save && pm2 startup`
- [ ] Test: `curl http://localhost:3000`

### **Phase 7: Nginx Setup (20 min)**
- [ ] Create config: `sudo nano /etc/nginx/sites-available/chandrahoro`
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/`
- [ ] Remove default: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Test config: `sudo nginx -t`
- [ ] Restart: `sudo systemctl restart nginx`
- [ ] Test: `curl http://YOUR_VPS_IP`

### **Phase 8: SSL (Optional - 15 min)**
- [ ] Point domain DNS to VPS IP
- [ ] Install SSL: `sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN`
- [ ] Test renewal: `sudo certbot renew --dry-run`

### **Phase 9: Final Testing (15 min)**
- [ ] Check all services running
- [ ] Test homepage
- [ ] Test user registration
- [ ] Test user login
- [ ] Test chart features
- [ ] Configure AI settings via UI
- [ ] Test AI features

---

## 🔧 Common Commands

### **Service Management:**
```bash
# Backend
sudo systemctl status chandrahoro-backend
sudo systemctl restart chandrahoro-backend
sudo journalctl -u chandrahoro-backend -f

# Frontend
pm2 status
pm2 restart chandrahoro-frontend
pm2 logs chandrahoro-frontend

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql

# Redis
sudo systemctl status redis
redis-cli ping
```

### **View Logs:**
```bash
# Backend
sudo journalctl -u chandrahoro-backend -f

# Frontend
pm2 logs chandrahoro-frontend --lines 100

# Nginx Access
sudo tail -f /var/log/nginx/access.log

# Nginx Error
sudo tail -f /var/log/nginx/error.log
```

### **Database Access:**
```bash
# Login as root
sudo mysql

# Login as app user
mysql -u chandrahoro_user -p chandrahoro_db
```

---

## 🚨 Troubleshooting

### **Backend won't start:**
```bash
# Check logs
sudo journalctl -u chandrahoro-backend -n 50

# Check environment file
cat ~/chandrahoro/backend/.env.production

# Test manually
cd ~/chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### **Frontend won't start:**
```bash
# Check PM2 logs
pm2 logs chandrahoro-frontend --lines 50

# Test manually
cd ~/chandrahoro/frontend
npm run start
```

### **Nginx errors:**
```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Verify upstream servers
curl http://localhost:3000
curl http://localhost:8000/health
```

### **Database connection errors:**
```bash
# Test MySQL connection
mysql -u chandrahoro_user -p chandrahoro_db

# Check MySQL is running
sudo systemctl status mysql

# Check DATABASE_URL in .env.production
cat ~/chandrahoro/backend/.env.production | grep DATABASE_URL
```

### **Port already in use:**
```bash
# Check what's using port 8000
sudo lsof -i :8000

# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 PID
```

---

## 📊 System Health Check

```bash
# Check all services
sudo systemctl status chandrahoro-backend nginx mysql redis
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check CPU
htop

# Check network
sudo netstat -tulpn | grep LISTEN
```

---

## 🔄 Update Application

```bash
# Navigate to project
cd ~/chandrahoro

# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart chandrahoro-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart chandrahoro-frontend

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🎯 Quick Access URLs

```
Application: http://YOUR_VPS_IP or https://YOUR_DOMAIN
API Docs: http://YOUR_VPS_IP/docs or https://YOUR_DOMAIN/docs
Backend Health: http://YOUR_VPS_IP/api/health
```

---

**📞 For detailed instructions, see: `DEPLOYMENT_STEP_BY_STEP.md`**


