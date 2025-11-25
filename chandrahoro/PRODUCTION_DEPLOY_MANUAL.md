# ChandraHoro Production Deployment - Manual Guide

## 🚨 IMPORTANT: SSH Access Issue

SSH port 2222 is not accessible from external connections. You need to use **Hostinger Web Console** to deploy.

## 📋 Deployment Steps

### Step 1: Access Hostinger Web Console

1. Go to: https://hpanel.hostinger.com/vps
2. Login with your Hostinger credentials
3. Click on your VPS
4. Click **"Console"** or **"Web Terminal"** or **"Browser SSH"**
5. You should now have a terminal in your browser

---

### Step 2: Run Complete Deployment Script

Copy and paste this **ENTIRE SCRIPT** into the Hostinger web console:

```bash
#!/bin/bash

set -e

echo "=========================================="
echo "ChandraHoro Production Deployment"
echo "=========================================="
echo ""

# Configuration
DOMAIN="jyotishdrishti.valuestream.in"
APP_DIR="/var/www/chandrahoro"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DB_NAME="chandrahoro_prod"
DB_USER="chandrahoro_user"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32)

echo "Step 1: System Information..."
echo "OS: $(lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Disk Space: $(df -h / | tail -1 | awk '{print $4}')"
echo "Memory: $(free -h | grep Mem | awk '{print $4}')"
echo ""

echo "Step 2: Installing dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

# Install Node.js 20
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"

# Install Python 3.11
if ! command -v python3.11 &> /dev/null; then
    echo "Installing Python 3.11..."
    apt-get install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt-get update -qq
    apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
fi
echo "Python: $(python3.11 --version)"

# Install other dependencies
echo "Installing MySQL, Redis, Nginx, Git..."
apt-get install -y mysql-server redis-server nginx git curl build-essential libmysqlclient-dev pkg-config

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "PM2: $(pm2 -v)"

echo ""
echo "Step 3: Starting services..."
systemctl start mysql || true
systemctl enable mysql || true
systemctl start redis-server || true
systemctl enable redis-server || true
systemctl start nginx || true
systemctl enable nginx || true

echo ""
echo "Step 4: Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null || true
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "✓ Database: $DB_NAME"
echo "✓ User: $DB_USER"

echo ""
echo "Step 5: Cloning repository..."
mkdir -p $APP_DIR
cd $APP_DIR

if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
else
    echo "Cloning repository..."
    rm -rf * .* 2>/dev/null || true
    git clone https://github.com/ravitadakamalla/chandrahorov2.git .
fi

echo ""
echo "Step 6: Backend setup..."
cd $BACKEND_DIR

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install dependencies
pip install -r requirements.txt

# Generate Fernet key
FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Create .env
cat > .env << EOF
DATABASE_URL=mysql+aiomysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LLM_VAULT_KEY=${FERNET_KEY}
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=http://${DOMAIN},http://localhost:3000
HOST=0.0.0.0
PORT=8000
EOF

chmod 600 .env
echo "✓ Backend .env created"

# Run migrations
echo "Running database migrations..."
alembic upgrade head

deactivate

echo ""
echo "Step 7: Frontend setup..."
cd $FRONTEND_DIR

# Install dependencies
npm install

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://${DOMAIN}/api
NEXT_PUBLIC_APP_NAME=ChandraHoro
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo "✓ Frontend .env.production created"

# Build
echo "Building frontend (this may take a few minutes)..."
npm run build

echo ""
echo "=========================================="
echo "✓ Deployment Complete!"
echo "=========================================="
echo ""
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "SAVE THESE CREDENTIALS SECURELY!"
echo ""
echo "Next: Run the PM2 and Nginx configuration script"
echo ""
```

**IMPORTANT**: Save the database password and JWT secret that are displayed at the end!

---

### Step 3: Configure PM2 and Nginx

After the deployment script completes, run this script:

```bash
#!/bin/bash

set -e

DOMAIN="jyotishdrishti.valuestream.in"
APP_DIR="/var/www/chandrahoro"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "=========================================="
echo "Configuring PM2 and Nginx"
echo "=========================================="
echo ""

echo "Step 1: Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

echo ""
echo "Step 2: Starting backend with PM2..."
cd $BACKEND_DIR
pm2 start "venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000" --name chandrahoro-backend

echo ""
echo "Step 3: Starting frontend with PM2..."
cd $FRONTEND_DIR
pm2 start "npm run start" --name chandrahoro-frontend

echo ""
echo "Step 4: Saving PM2 configuration..."
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "Step 5: Configuring Nginx..."

# Remove default config
rm -f /etc/nginx/sites-enabled/default

# Create Nginx config
cat > /etc/nginx/sites-available/${DOMAIN} << 'EOFNGINX'
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

upstream chandrahoro_frontend {
    server localhost:3000;
    keepalive 32;
}

upstream chandrahoro_backend {
    server localhost:8000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name jyotishdrishti.valuestream.in;

    client_max_body_size 10M;

    access_log /var/log/nginx/chandrahoro_access.log;
    error_log /var/log/nginx/chandrahoro_error.log;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://chandrahoro_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo ""
echo "Step 6: Verifying services..."
sleep 5
systemctl is-active nginx && echo "✓ Nginx: Running" || echo "✗ Nginx: Not running"
systemctl is-active mysql && echo "✓ MySQL: Running" || echo "✗ MySQL: Not running"
systemctl is-active redis-server && echo "✓ Redis: Running" || echo "✗ Redis: Not running"
pm2 status

echo ""
echo "=========================================="
echo "✓ Configuration Complete!"
echo "=========================================="
echo ""
echo "Your application should be accessible at:"
echo "http://${DOMAIN}"
echo ""
```

---

### Step 4: Verify Deployment

Run these commands to verify everything is working:

```bash
# Check PM2 processes
pm2 status

# Check Nginx
systemctl status nginx

# Test backend
curl http://localhost:8000/health

# Test frontend
curl -I http://localhost:3000

# Test domain
curl -I http://jyotishdrishti.valuestream.in
```

---

## 🔧 Troubleshooting

### If backend fails to start:

```bash
cd /var/www/chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Check for errors
```

### If frontend fails to start:

```bash
cd /var/www/chandrahoro/frontend
npm run start
# Check for errors
```

### View PM2 logs:

```bash
pm2 logs chandrahoro-backend
pm2 logs chandrahoro-frontend
```

### View Nginx logs:

```bash
tail -50 /var/log/nginx/chandrahoro_error.log
```

---

## ✅ Success Criteria

- [ ] MySQL database created
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Nginx configured and running
- [ ] PM2 processes running
- [ ] Website accessible at http://jyotishdrishti.valuestream.in


