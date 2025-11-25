# 🚀 Hostinger VPS 2 Deployment Guide for ChandraHoro

## Prerequisites

- ✅ Hostinger VPS 2 account (Ubuntu 22.04 LTS recommended)
- ✅ SSH access to your VPS
- ✅ Domain name (optional but recommended)
- ✅ Git repository with your code

---

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS
```bash
ssh root@your_vps_ip_address
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Create Application User
```bash
adduser chandrahoro
usermod -aG sudo chandrahoro
su - chandrahoro
```

---

## Step 2: Install Node.js

### 2.1 Install Node.js 18 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 2.2 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## Step 3: Install Python

### 3.1 Install Python 3.11
```bash
sudo apt install -y python3.11 python3.11-venv python3-pip
python3.11 --version
```

### 3.2 Install System Dependencies
```bash
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev
```

---

## Step 4: Deploy Frontend (Next.js)

### 4.1 Clone Repository
```bash
cd /home/chandrahoro
git clone https://github.com/yourusername/chandrahoro.git
cd chandrahoro/frontend
```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Build Next.js
```bash
npm run build
```

### 4.4 Start with PM2
```bash
pm2 start "npm start" --name "chandrahoro-frontend" --cwd /home/chandrahoro/chandrahoro/frontend
pm2 save
```

### 4.5 Verify Frontend
```bash
pm2 logs chandrahoro-frontend
```

---

## Step 5: Deploy Backend (FastAPI)

### 5.1 Create Python Virtual Environment
```bash
cd /home/chandrahoro/chandrahoro/backend
python3.11 -m venv venv
source venv/bin/activate
```

### 5.2 Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3 Install Gunicorn
```bash
pip install gunicorn
```

### 5.4 Start Backend with PM2
```bash
pm2 start "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001" \
  --name "chandrahoro-backend" \
  --cwd /home/chandrahoro/chandrahoro/backend
pm2 save
```

### 5.5 Verify Backend
```bash
pm2 logs chandrahoro-backend
curl http://localhost:8001/docs
```

---

## Step 6: Install and Configure Nginx

### 6.1 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/chandrahoro
```

### 6.3 Add Configuration
```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:8001;
}

server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.4 Enable Configuration
```bash
sudo ln -s /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 7.3 Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 8: Environment Variables

### 8.1 Create .env File
```bash
nano /home/chandrahoro/chandrahoro/backend/.env
```

### 8.2 Add Variables
```
DATABASE_URL=your_database_url
API_PORT=8001
ENVIRONMENT=production
```

### 8.3 Load in Gunicorn
Update PM2 command to source .env before starting

---

## Step 9: Monitoring and Maintenance

### 9.1 Monitor Processes
```bash
pm2 monit
pm2 logs
pm2 status
```

### 9.2 Restart Services
```bash
pm2 restart all
pm2 restart chandrahoro-frontend
pm2 restart chandrahoro-backend
```

### 9.3 View Logs
```bash
pm2 logs chandrahoro-frontend --lines 100
pm2 logs chandrahoro-backend --lines 100
```

---

## Step 10: Firewall Configuration

### 10.1 Enable UFW
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 10.2 Verify
```bash
sudo ufw status
```

---

## Troubleshooting

### Frontend Not Loading
```bash
pm2 logs chandrahoro-frontend
# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000
```

### Backend API Errors
```bash
pm2 logs chandrahoro-backend
# Check if port 8001 is listening
sudo netstat -tlnp | grep 8001
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Performance Optimization

### 1. Enable Gzip Compression
Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Increase Worker Processes
```bash
# Update Gunicorn workers based on CPU cores
pm2 start "gunicorn app.main:app --workers 8 ..." --name "chandrahoro-backend"
```

### 3. Enable Caching
Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
```

---

## Backup Strategy

### 1. Database Backups
```bash
# Daily backup
0 2 * * * /home/chandrahoro/backup.sh
```

### 2. Application Backups
```bash
tar -czf /backups/chandrahoro-$(date +%Y%m%d).tar.gz /home/chandrahoro/chandrahoro
```

---

## Cost Summary

- **VPS 2:** $5.99-7.99/month
- **Domain:** $10-15/year
- **SSL:** Free (Let's Encrypt)
- **Total:** ~$6-8/month

---

## Next Steps

1. ✅ Upgrade to VPS 2
2. ✅ Follow this guide step-by-step
3. ✅ Test frontend and backend
4. ✅ Set up monitoring
5. ✅ Configure backups
6. ✅ Monitor performance

