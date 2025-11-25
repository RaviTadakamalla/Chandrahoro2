#!/bin/bash
#
# ChandraHoro Complete Production Deployment Script
# Run this in Hostinger Web Console
#

set -e

echo "=========================================="
echo "ChandraHoro Production Deployment"
echo "Domain: jyotishdrishti.valuestream.in"
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

# System check
echo "=== SYSTEM INFORMATION ==="
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Disk: $(df -h / | tail -1 | awk '{print $4}') available"
echo "Memory: $(free -h | grep Mem | awk '{print $4}') available"
echo ""

# Update system
echo "=== UPDATING SYSTEM ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
echo "✓ System updated"
echo ""

# Install Node.js
echo "=== INSTALLING NODE.JS ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "✓ Node.js $(node -v)"
echo ""

# Install Python 3.11
echo "=== INSTALLING PYTHON 3.11 ==="
if ! command -v python3.11 &> /dev/null; then
    apt-get install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt-get update -qq
    apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
fi
echo "✓ Python $(python3.11 --version)"
echo ""

# Install system dependencies
echo "=== INSTALLING SYSTEM DEPENDENCIES ==="
apt-get install -y mysql-server redis-server nginx git curl build-essential libmysqlclient-dev pkg-config
echo "✓ MySQL, Redis, Nginx, Git installed"
echo ""

# Install PM2
echo "=== INSTALLING PM2 ==="
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "✓ PM2 $(pm2 -v)"
echo ""

# Start services
echo "=== STARTING SERVICES ==="
systemctl start mysql && systemctl enable mysql
systemctl start redis-server && systemctl enable redis-server
systemctl start nginx && systemctl enable nginx
echo "✓ Services started"
echo ""

# Configure MySQL
echo "=== CONFIGURING MYSQL DATABASE ==="
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null || true
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "✓ Database: $DB_NAME"
echo "✓ User: $DB_USER"
echo ""

# Clone repository
echo "=== CLONING REPOSITORY ==="
mkdir -p $APP_DIR
cd $APP_DIR
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
else
    echo "Cloning fresh repository..."
    rm -rf * .* 2>/dev/null || true
    git clone https://github.com/ravitadakamalla/chandrahorov2.git .
fi
echo "✓ Repository ready"
echo ""

# Setup backend
echo "=== SETTING UP BACKEND ==="
cd $BACKEND_DIR
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel -q
pip install -r requirements.txt -q

# Generate Fernet key
FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Create backend .env
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

# Run migrations
echo "Running database migrations..."
alembic upgrade head
deactivate
echo "✓ Backend configured"
echo ""

# Setup frontend
echo "=== SETTING UP FRONTEND ==="
cd $FRONTEND_DIR
npm install -q

# Create frontend .env
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://${DOMAIN}/api
NEXT_PUBLIC_APP_NAME=ChandraHoro
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo "Building frontend (this takes 2-3 minutes)..."
npm run build
echo "✓ Frontend built"
echo ""

# Configure PM2
echo "=== CONFIGURING PM2 ==="
pm2 delete all 2>/dev/null || true

cd $BACKEND_DIR
pm2 start "venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000" --name chandrahoro-backend

cd $FRONTEND_DIR
pm2 start "npm run start" --name chandrahoro-frontend

pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash
echo "✓ PM2 configured"
echo ""

# Configure Nginx - CONTINUED IN NEXT FILE
echo "=== CONFIGURING NGINX ==="
echo "Run the nginx-config.sh script next..."
echo ""

echo "=========================================="
echo "✓ DEPLOYMENT PHASE 1 COMPLETE!"
echo "=========================================="
echo ""
echo "🔐 SAVE THESE CREDENTIALS:"
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "Next: Run the nginx-config.sh script"
echo ""

