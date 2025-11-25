# 🚀 ChandraHoro - Step-by-Step Deployment Guide for Hostinger VPS

**VPS Configuration:**
- Operating System: Ubuntu 22.04 LTS (64-bit)
- Control Panel: None (Plain OS)
- Plan: Hostinger VPS 2 (2 vCPU, 4GB RAM, 50GB NVMe)

**Estimated Total Time:** 2.5 - 3 hours

---

## 📋 Pre-Deployment Checklist

### **Information You Need:**

- [ ] **VPS IP Address** - From Hostinger email
- [ ] **Root Password** - `Haritha#12Tadaka` (will change after first login)
- [ ] **Domain Name** - (optional) e.g., `chandrahoro.com`
- [ ] **Email Address** - For SSL certificate (if using domain)
- [ ] **GitHub Repository** - `https://github.com/WhatTag/chandrahoro.git`

### **API Keys to Prepare:**

- [ ] **Perplexity API Key** - For AI features (production key, different from localhost)
- [ ] **GeoNames Username** - For location data
- [ ] **Other LLM API Keys** - (optional) OpenAI, Anthropic, etc.

### **Secrets (Will be generated during deployment):**

- [ ] `LLM_VAULT_KEY` - For encrypting API keys
- [ ] `NEXTAUTH_SECRET` - For NextAuth.js authentication
- [ ] `JWT_SECRET` - For JWT token generation
- [ ] `MYSQL_PASSWORD` - For database user

---

## 🔐 PHASE 1: Initial VPS Access & Security (15 minutes)

### **Step 1.1: First SSH Connection**

Once you receive your VPS IP address from Hostinger, connect via SSH:

```bash
# Replace YOUR_VPS_IP with actual IP address
ssh root@YOUR_VPS_IP
```

**When prompted:**
- Type `yes` to accept the fingerprint
- Enter password: `Haritha#12Tadaka`

**Expected output:**
```
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-xxx-generic x86_64)
```

---

### **Step 1.2: Change Root Password (IMPORTANT!)**

```bash
passwd
```

**Enter a new strong password** (save it securely!)

**Recommended format:**
- At least 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `ChandraHoro2025!Prod#Secure`

---

### **Step 1.3: Update System**

```bash
apt update && apt upgrade -y
```

**This will take 5-10 minutes.** Wait for completion.

---

### **Step 1.4: Create Application User**

```bash
# Create user
adduser chandrahoro
```

**When prompted:**
- Password: Create a strong password (save it!)
- Full Name: `ChandraHoro Application`
- Other fields: Press Enter to skip

**Add user to sudo group:**
```bash
usermod -aG sudo chandrahoro
```

**Verify user creation:**
```bash
id chandrahoro
```

**Expected output:**
```
uid=1000(chandrahoro) gid=1000(chandrahoro) groups=1000(chandrahoro),27(sudo)
```

---

### **Step 1.5: Configure Firewall**

```bash
# Install UFW (if not installed)
apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### **Step 1.6: Install Essential Tools**

```bash
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    unzip \
    build-essential \
    software-properties-common \
    certbot \
    python3-certbot-nginx
```

---

### **Step 1.7: Switch to Application User**

```bash
su - chandrahoro
```

**You should now see:**
```
chandrahoro@hostname:~$
```

---

## ⚙️ PHASE 2: Install Core Dependencies (30 minutes)

### **Step 2.1: Install Node.js 18 LTS**

```bash
# Download and run NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

---

### **Step 2.2: Install Python 3.11**

```bash
# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Verify installation
python3.11 --version  # Should show Python 3.11.x
```

---

### **Step 2.3: Install System Dependencies**

```bash
sudo apt install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    libmysqlclient-dev \
    pkg-config
```

---

### **Step 2.4: Install MySQL 8.0**

```bash
# Install MySQL
sudo apt install -y mysql-server

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Verify MySQL is running
sudo systemctl status mysql
```

**Expected output:**
```
● mysql.service - MySQL Community Server
     Loaded: loaded
     Active: active (running)
```

Press `q` to exit.

---

### **Step 2.5: Secure MySQL Installation**

```bash
sudo mysql_secure_installation
```

**Answer the prompts:**
1. **Validate Password Component?** → `y` (yes)
2. **Password Validation Policy?** → `2` (STRONG)
3. **Set root password?** → `y` (yes)
   - Enter a strong password (save it!)
4. **Remove anonymous users?** → `y` (yes)
5. **Disallow root login remotely?** → `y` (yes)
6. **Remove test database?** → `y` (yes)
7. **Reload privilege tables?** → `y` (yes)

---

### **Step 2.6: Install Redis**

```bash
# Install Redis
sudo apt install -y redis-server

# Start and enable Redis
sudo systemctl start redis
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
```

**Expected output:**
```
PONG
```

---

### **Step 2.7: Install Nginx**

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

### **Step 2.8: Install PM2 (Process Manager)**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify PM2 installation
pm2 --version
```

---

## 📦 PHASE 3: Clone Repository & Setup (20 minutes)

### **Step 3.1: Clone ChandraHoro Repository**

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/WhatTag/chandrahoro.git

# Navigate to project directory
cd chandrahoro

# Verify files
ls -la
```

**You should see:**
```
backend/
frontend/
docker-compose.yml
README.md
...
```

---

### **Step 3.2: Generate Production Secrets**

```bash
# Install cryptography package for LLM_VAULT_KEY generation
pip3 install cryptography

# Generate secrets
python3 << 'EOF'
from cryptography.fernet import Fernet
import secrets
import base64

print("\n" + "="*60)
print("PRODUCTION SECRETS - SAVE THESE SECURELY!")
print("="*60 + "\n")

# LLM_VAULT_KEY
llm_vault_key = Fernet.generate_key().decode()
print(f"LLM_VAULT_KEY={llm_vault_key}")

# NEXTAUTH_SECRET
nextauth_secret = base64.b64encode(secrets.token_bytes(32)).decode()
print(f"NEXTAUTH_SECRET={nextauth_secret}")

# JWT_SECRET
jwt_secret = base64.b64encode(secrets.token_bytes(32)).decode()
print(f"JWT_SECRET={jwt_secret}")

print("\n" + "="*60)
print("COPY THESE VALUES - YOU'LL NEED THEM IN THE NEXT STEP!")
print("="*60 + "\n")
EOF
```

**⚠️ IMPORTANT:** Copy and save these secrets in a secure location (password manager, encrypted file, etc.)

---

### **Step 3.3: Create LLM Vault Directory**

```bash
# Create vault directory with proper permissions
sudo mkdir -p /var/lib/chandrahoro/llm_vault
sudo chown -R chandrahoro:chandrahoro /var/lib/chandrahoro
sudo chmod 700 /var/lib/chandrahoro/llm_vault
```

---

## 🗄️ PHASE 4: Database Setup (15 minutes)

### **Step 4.1: Create Database and User**

```bash
# Login to MySQL as root
sudo mysql
```

**In MySQL prompt, run these commands:**

```sql
-- Create database
CREATE DATABASE chandrahoro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace YOUR_STRONG_PASSWORD with a strong password)
CREATE USER 'chandrahoro_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON chandrahoro_db.* TO 'chandrahoro_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify database
SHOW DATABASES;

-- Exit MySQL
EXIT;
```

**⚠️ Save the database password!** You'll need it for the backend `.env` file.

---

### **Step 4.2: Test Database Connection**

```bash
# Test connection (replace YOUR_STRONG_PASSWORD)
mysql -u chandrahoro_user -p chandrahoro_db
```

Enter the password you created. If successful, you'll see:
```
mysql>
```

Type `EXIT;` to exit.

---

## 🔧 PHASE 5: Configure Backend (FastAPI) (25 minutes)

### **Step 5.1: Navigate to Backend Directory**

```bash
cd ~/chandrahoro/backend
```

---

### **Step 5.2: Create Python Virtual Environment**

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify activation (you should see (venv) in prompt)
which python
```

**Expected output:**
```
/home/chandrahoro/chandrahoro/backend/venv/bin/python
```

---

### **Step 5.3: Install Python Dependencies**

```bash
# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

**This will take 5-10 minutes.**

---

### **Step 5.4: Configure Backend Environment Variables**

```bash
# Create production .env file
cp .env .env.production

# Edit production .env file
nano .env.production
```

**Update these values in the file:**

```bash
# Database Configuration
DATABASE_URL=mysql+pymysql://chandrahoro_user:YOUR_DB_PASSWORD@localhost:3306/chandrahoro_db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# LLM Vault Configuration
LLM_VAULT_KEY=YOUR_GENERATED_LLM_VAULT_KEY
LLM_VAULT_DIR=/var/lib/chandrahoro/llm_vault

# JWT Configuration
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=["http://YOUR_DOMAIN","https://YOUR_DOMAIN"]

# GeoNames Configuration
GEONAMES_USERNAME=YOUR_GEONAMES_USERNAME

# API Keys (Optional - users can add their own via UI)
PERPLEXITY_API_KEY=YOUR_PRODUCTION_PERPLEXITY_KEY

# Environment
ENVIRONMENT=production
DEBUG=False
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 5.5: Run Database Migrations**

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run migrations
alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade -> xxx, initial migration
INFO  [alembic.runtime.migration] Running upgrade xxx -> yyy, add llm tables
...
```

---

### **Step 5.6: Create Systemd Service for Backend**

```bash
# Create systemd service file
sudo nano /etc/systemd/system/chandrahoro-backend.service
```

**Paste this content:**

```ini
[Unit]
Description=ChandraHoro FastAPI Backend
After=network.target mysql.service redis.service

[Service]
Type=simple
User=chandrahoro
Group=chandrahoro
WorkingDirectory=/home/chandrahoro/chandrahoro/backend
Environment="PATH=/home/chandrahoro/chandrahoro/backend/venv/bin"
EnvironmentFile=/home/chandrahoro/chandrahoro/backend/.env.production
ExecStart=/home/chandrahoro/chandrahoro/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 5.7: Start Backend Service**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable backend service
sudo systemctl enable chandrahoro-backend

# Start backend service
sudo systemctl start chandrahoro-backend

# Check status
sudo systemctl status chandrahoro-backend
```

**Expected output:**
```
● chandrahoro-backend.service - ChandraHoro FastAPI Backend
     Loaded: loaded
     Active: active (running)
```

Press `q` to exit.

---

### **Step 5.8: Test Backend API**

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test API docs
curl http://localhost:8000/docs
```

**Expected output:**
```json
{"status":"healthy"}
```

---

## 🎨 PHASE 6: Configure Frontend (Next.js) (25 minutes)

### **Step 6.1: Navigate to Frontend Directory**

```bash
cd ~/chandrahoro/frontend
```

---

### **Step 6.2: Install Node.js Dependencies**

```bash
# Install dependencies
npm install

# This will take 5-10 minutes
```

---

### **Step 6.3: Configure Frontend Environment Variables**

```bash
# Create production .env file
cp .env.local .env.production

# Edit production .env file
nano .env.production
```

**Update these values:**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN/api
# OR if using IP: NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8000

# NextAuth Configuration
NEXTAUTH_URL=https://YOUR_DOMAIN
# OR if using IP: NEXTAUTH_URL=http://YOUR_VPS_IP
NEXTAUTH_SECRET=YOUR_GENERATED_NEXTAUTH_SECRET

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_CHART_FEATURES=true

# Environment
NODE_ENV=production
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 6.4: Build Frontend for Production**

```bash
# Build Next.js application
npm run build

# This will take 5-10 minutes
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (pages)                              Size     First Load JS
┌ ○ /                                      5.2 kB          100 kB
├ ○ /404                                   3.1 kB           98 kB
...
```

---

### **Step 6.5: Configure PM2 for Frontend**

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Paste this content:**

```javascript
module.exports = {
  apps: [{
    name: 'chandrahoro-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/chandrahoro/chandrahoro/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 6.6: Start Frontend with PM2**

```bash
# Start frontend
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Copy and run the command that PM2 outputs** (it will look like):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u chandrahoro --hp /home/chandrahoro
```

---

### **Step 6.7: Verify Frontend is Running**

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs chandrahoro-frontend --lines 50

# Test frontend
curl http://localhost:3000
```

---

## 🌐 PHASE 7: Configure Nginx Reverse Proxy (20 minutes)

### **Step 7.1: Create Nginx Configuration**

```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/chandrahoro
```

**Paste this content (replace YOUR_DOMAIN with your actual domain or IP):**

```nginx
# Upstream servers
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

# HTTP Server (will redirect to HTTPS if domain is used)
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect to HTTPS (comment out if using IP only)
    # location / {
    #     return 301 https://$server_name$request_uri;
    # }

    # If using IP only, proxy to frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 60m;
    }

    # Client-side max body size
    client_max_body_size 10M;
}
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 7.2: Enable Nginx Site**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

**Expected output:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### **Step 7.3: Restart Nginx**

```bash
sudo systemctl restart nginx
```

---

### **Step 7.4: Test Application**

```bash
# Get your VPS IP
curl ifconfig.me

# Test application (replace YOUR_VPS_IP)
curl http://YOUR_VPS_IP
```

**You should see HTML output from Next.js!**

---

## 🔒 PHASE 8: SSL Certificate (Optional - If Using Domain) (15 minutes)

**⚠️ Skip this phase if you're using IP address only.**

### **Step 8.1: Point Domain to VPS**

Before proceeding, make sure your domain's DNS A record points to your VPS IP:

```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600
```

**Wait 5-15 minutes for DNS propagation.**

---

### **Step 8.2: Obtain SSL Certificate**

```bash
# Install SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

**Answer the prompts:**
1. **Email address:** Enter your email
2. **Terms of Service:** `Y` (yes)
3. **Share email:** `N` (no)
4. **Redirect HTTP to HTTPS:** `2` (yes, redirect)

---

### **Step 8.3: Test SSL Certificate**

```bash
# Test HTTPS
curl https://YOUR_DOMAIN
```

---

### **Step 8.4: Setup Auto-Renewal**

```bash
# Test renewal
sudo certbot renew --dry-run
```

**Expected output:**
```
Congratulations, all simulated renewals succeeded
```

---

## ✅ PHASE 9: Final Verification & Testing (15 minutes)

### **Step 9.1: Check All Services**

```bash
# Check backend
sudo systemctl status chandrahoro-backend

# Check frontend
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check MySQL
sudo systemctl status mysql

# Check Redis
sudo systemctl status redis
```

**All should show "active (running)"**

---

### **Step 9.2: Test Application Features**

**Open your browser and navigate to:**
- `http://YOUR_VPS_IP` (or `https://YOUR_DOMAIN`)

**Test these features:**
1. ✅ Homepage loads
2. ✅ User registration works
3. ✅ User login works
4. ✅ Chart calculation works
5. ✅ AI features work (after configuring API keys)

---

### **Step 9.3: Configure LLM API Keys (via UI)**

1. Login to your account
2. Navigate to Settings → AI Settings
3. Add your Perplexity API key (or other LLM providers)
4. Test connection
5. Try AI features (chart interpretation, compatibility analysis)

---

## 📊 Monitoring & Maintenance

### **View Logs:**

```bash
# Backend logs
sudo journalctl -u chandrahoro-backend -f

# Frontend logs
pm2 logs chandrahoro-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

### **Restart Services:**

```bash
# Restart backend
sudo systemctl restart chandrahoro-backend

# Restart frontend
pm2 restart chandrahoro-frontend

# Restart Nginx
sudo systemctl restart nginx
```

---

### **Update Application:**

```bash
# Navigate to project directory
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
```

---

## 🎉 Deployment Complete!

**Your ChandraHoro application is now live!**

**Access your application:**
- **URL:** `http://YOUR_VPS_IP` or `https://YOUR_DOMAIN`
- **API Docs:** `http://YOUR_VPS_IP/docs` or `https://YOUR_DOMAIN/docs`

---

## 📞 Need Help?

If you encounter any issues during deployment, check:

1. **Service logs** (see Monitoring section above)
2. **Firewall rules** (`sudo ufw status`)
3. **Port availability** (`sudo netstat -tulpn | grep LISTEN`)
4. **Environment variables** (check `.env.production` files)

---

**🚀 Happy Deploying!**


