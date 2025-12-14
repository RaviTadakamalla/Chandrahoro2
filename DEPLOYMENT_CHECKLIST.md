# 🚀 ChandraHoro Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Environment Configuration

#### Backend (.env)
```bash
cd chandrahoro/backend
cp .env.example .env
# Edit .env with production values
```

**Required Variables:**
- [ ] `DATABASE_URL` - MySQL connection string
- [ ] `SECRET_KEY` - Generate: `openssl rand -hex 32`
- [ ] `CORS_ORIGINS` - Your production domain(s)
- [ ] `ANTHROPIC_API_KEY` - For AI features (optional)
- [ ] `OPENAI_API_KEY` - For AI features (optional)
- [ ] `LLM_VAULT_KEY` - Generate: `openssl rand -hex 32`

#### Frontend (.env.local)
```bash
cd chandrahoro/frontend
cp .env.example .env.local
# Edit .env.local with production values
```

**Required Variables:**
- [ ] `NEXT_PUBLIC_API_URL` - Empty string for same-origin (nginx proxies)
- [ ] `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production URL

### 2. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE chandrahoro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
cd chandrahoro/backend
source venv/bin/activate
alembic upgrade head
```

### 3. Build & Test Locally

#### Backend
```bash
cd chandrahoro/backend
source venv/bin/activate

# Test server starts
uvicorn app.main:app --reload --port 8000

# Verify endpoints
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"chandrahoro-api","version":"0.1.0"}
```

#### Frontend
```bash
cd chandrahoro/frontend

# Build for production
NODE_ENV=production npm run build

# Test production build
npm start
```

## 🔧 Production Deployment

### 1. Server Setup (VPS/Cloud)

#### Install Dependencies
```bash
# System packages
sudo apt update
sudo apt install -y python3.11 python3.11-venv nginx mysql-server redis-server
sudo apt install -y nodejs npm

# PM2 for process management
sudo npm install -g pm2
```

#### Create Application User
```bash
sudo useradd -m -s /bin/bash chandrahoro
sudo su - chandrahoro
```

### 2. Deploy Backend

```bash
# Clone repository
git clone <your-repo-url> ~/chandrahoro
cd ~/chandrahoro/chandrahoro/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with production values

# Run migrations
alembic upgrade head

# Test backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Setup PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4" \
  --name chandrahoro-backend \
  --cwd ~/chandrahoro/chandrahoro/backend

pm2 save
pm2 startup
```

### 3. Deploy Frontend

```bash
cd ~/chandrahoro/chandrahoro/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local - set NEXT_PUBLIC_API_URL to empty string

# Build for production
NODE_ENV=production npm run build

# Start with PM2
pm2 start npm --name chandrahoro-frontend -- start
pm2 save
```

### 4. Configure Nginx

Create `/etc/nginx/sites-available/chandrahoro`:

```nginx
# Backend upstream
upstream backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

# Frontend upstream
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # API endpoints
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;

        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (Next.js)
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL/TLS Setup (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔒 Security Checklist

- [ ] Set strong `SECRET_KEY` (32+ random bytes)
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Set strong `LLM_VAULT_KEY`
- [ ] Database user has minimum required privileges
- [ ] CORS_ORIGINS set to production domains only
- [ ] Firewall configured (allow 80, 443; block 8000, 3000)
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Backup strategy in place

## 📊 Monitoring

### PM2 Status
```bash
pm2 status
pm2 logs chandrahoro-backend
pm2 logs chandrahoro-frontend
pm2 monit
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Application Health
```bash
# Backend health
curl https://your-domain.com/health

# API health
curl https://your-domain.com/api/v1/health
```

## 🔄 Update Deployment

```bash
# Pull latest changes
cd ~/chandrahoro
git pull origin main

# Update backend
cd chandrahoro/backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
pm2 restart chandrahoro-backend

# Update frontend
cd ../frontend
npm install
NODE_ENV=production npm run build
pm2 restart chandrahoro-frontend
```

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs chandrahoro-backend

# Check port
lsof -i :8000

# Test manually
cd ~/chandrahoro/chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend not starting
```bash
# Check logs
pm2 logs chandrahoro-frontend

# Check port
lsof -i :3000

# Rebuild
cd ~/chandrahoro/chandrahoro/frontend
rm -rf .next
NODE_ENV=production npm run build
```

### Database connection errors
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u chandrahoro -p chandrahoro

# Check DATABASE_URL in .env
```

### CORS errors
```bash
# Verify CORS_ORIGINS in backend/.env
# Should include your production domain

# Check nginx is proxying correctly
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Post-Deployment Verification

- [ ] Homepage loads: `https://your-domain.com`
- [ ] API responds: `https://your-domain.com/api/v1/health`
- [ ] Backend health: `https://your-domain.com/health`
- [ ] User registration works
- [ ] User login works
- [ ] Chart calculation works
- [ ] AI features work (if enabled)
- [ ] Toast notifications display correctly
- [ ] Error messages are user-friendly
- [ ] No console errors in browser
- [ ] PM2 processes running: `pm2 status`
- [ ] SSL certificate valid
- [ ] Monitoring/alerts configured

## 📝 Notes

- All environment variables are externalized
- No hardcoded URLs or absolute paths
- Error handling is comprehensive
- Toast notifications for user feedback
- Logs include full context and stack traces
- Ready for horizontal scaling

---

**Last Updated:** 2025-12-14
**Version:** 2.1.0
