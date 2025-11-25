#!/bin/bash

################################################################################
# ChandraHoro - Production Deployment Script for Hostinger VPS
# Domain: jyotishdrishti.valuestream.in
# Version: 2.1.0
# Description: Automated production deployment for Ubuntu 22.04 LTS
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${MAGENTA}[STEP]${NC} $1"
}

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ██████╗██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██████╗  ██████╗      ║
║  ██╔════╝██║  ██║██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔═══██╗     ║
║  ██║     ███████║███████║██╔██╗ ██║██║  ██║██████╔╝██║   ██║     ║
║  ██║     ██╔══██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║     ║
║  ╚██████╗██║  ██║██║  ██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝     ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝      ║
║                                                                   ║
║           Production Deployment - Hostinger VPS                  ║
║              jyotishdrishti.valuestream.in                       ║
║                    Version 2.1.0                                 ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run this script as root (use sudo)"
    exit 1
fi

# Configuration
DOMAIN="jyotishdrishti.valuestream.in"
APP_USER="chandrahoro"
APP_DIR="/home/$APP_USER/chandrahoro"
VAULT_DIR="/var/lib/chandrahoro/llm_vault"
REPO_URL="https://github.com/WhatTag/chandrahoro.git"
BRANCH="main"

# Get VPS IP
VPS_IP=$(curl -4 -s ifconfig.me)
log_info "VPS IP Address: $VPS_IP"
echo ""

# Prompt for configuration
log_step "Production Deployment Configuration"
echo ""
read -p "Enter your GeoNames username: " GEONAMES_USER
echo ""
read -p "Enter MySQL password for chandrahoro_user (leave empty to generate): " MYSQL_PASSWORD
if [ -z "$MYSQL_PASSWORD" ]; then
    MYSQL_PASSWORD=$(openssl rand -base64 24)
    log_info "Generated MySQL password: $MYSQL_PASSWORD"
fi
echo ""

# Optional API keys
log_info "Optional: Enter AI API keys (press Enter to skip)"
read -p "Perplexity API Key (optional): " PERPLEXITY_KEY
read -p "OpenAI API Key (optional): " OPENAI_KEY
read -p "Anthropic API Key (optional): " ANTHROPIC_KEY
echo ""

# Generate secrets
log_step "Generating security secrets..."
LLM_VAULT_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

log_success "Secrets generated successfully"
echo ""
log_warning "IMPORTANT: Save these secrets securely!"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo "LLM_VAULT_KEY: $LLM_VAULT_KEY"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "JWT_SECRET: $JWT_SECRET"
echo "MYSQL_PASSWORD: $MYSQL_PASSWORD"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Save secrets to file
SECRETS_FILE="/root/chandrahoro-secrets-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SECRETS_FILE" << EOL
ChandraHoro Production Secrets
Generated: $(date)
Domain: $DOMAIN

LLM_VAULT_KEY=$LLM_VAULT_KEY
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
JWT_SECRET=$JWT_SECRET
MYSQL_PASSWORD=$MYSQL_PASSWORD
GEONAMES_USERNAME=$GEONAMES_USER
PERPLEXITY_API_KEY=$PERPLEXITY_KEY
OPENAI_API_KEY=$OPENAI_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
EOL

chmod 600 "$SECRETS_FILE"
log_success "Secrets saved to: $SECRETS_FILE"
echo ""

read -p "Press Enter to continue with deployment..."
echo ""

# Phase 1: System Update
log_step "Phase 1: Updating system packages..."
apt update && apt upgrade -y
log_success "System updated"
echo ""

# Phase 2: Install Dependencies
log_step "Phase 2: Installing dependencies..."

# Node.js 18 LTS
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    log_success "Node.js installed: $(node --version)"
else
    log_success "Node.js already installed: $(node --version)"
fi

# Python 3.11
if ! command -v python3.11 &> /dev/null; then
    log_info "Installing Python 3.11..."
    apt install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt update
    apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
    log_success "Python 3.11 installed"
else
    log_success "Python 3.11 already installed"
fi

# System dependencies
log_info "Installing system dependencies..."
apt install -y build-essential libssl-dev libffi-dev python3-dev \
    libmysqlclient-dev pkg-config git curl wget unzip
log_success "System dependencies installed"
echo ""

# MySQL 8.0
if ! command -v mysql &> /dev/null; then
    log_info "Installing MySQL 8.0..."
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    log_success "MySQL installed"
else
    log_success "MySQL already installed"
fi

# Redis
if ! command -v redis-cli &> /dev/null; then
    log_info "Installing Redis..."
    apt install -y redis-server
    systemctl start redis
    systemctl enable redis
    log_success "Redis installed"
else
    log_success "Redis already installed"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    log_info "Installing Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_success "Nginx installed"
else
    log_success "Nginx already installed"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log_info "Installing PM2..."
    npm install -g pm2
    log_success "PM2 installed"
else
    log_success "PM2 already installed"
fi

# Certbot for SSL
if ! command -v certbot &> /dev/null; then
    log_info "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    log_success "Certbot installed"
else
    log_success "Certbot already installed"
fi

log_success "All dependencies installed"
echo ""

# Phase 3: Create Application User
log_step "Phase 3: Creating application user and directories..."

if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    log_success "User $APP_USER created"
else
    log_success "User $APP_USER already exists"
fi

# Create directories
mkdir -p "$VAULT_DIR"
mkdir -p /home/$APP_USER/ephemeris_data
chown -R $APP_USER:$APP_USER /var/lib/chandrahoro
chown -R $APP_USER:$APP_USER /home/$APP_USER/ephemeris_data
log_success "Directories created"
echo ""

# Phase 4: Clone Repository
log_step "Phase 4: Cloning repository..."

if [ -d "$APP_DIR" ]; then
    log_warning "Directory $APP_DIR already exists. Backing up..."
    mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d-%H%M%S)"
fi

su - $APP_USER -c "git clone -b $BRANCH $REPO_URL $APP_DIR"
log_success "Repository cloned"
echo ""

# Phase 5: Database Setup
log_step "Phase 5: Setting up MySQL database..."

mysql -u root << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS chandrahoro_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chandrahoro_user'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON chandrahoro_prod.* TO 'chandrahoro_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

log_success "Database created and user configured"
echo ""

# Phase 6: Backend Setup
log_step "Phase 6: Setting up backend..."

cd $APP_DIR/backend

# Create virtual environment
su - $APP_USER -c "cd $APP_DIR/backend && python3.11 -m venv venv"

# Install Python dependencies
su - $APP_USER -c "cd $APP_DIR/backend && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"

# Create production .env file
cat > $APP_DIR/backend/.env << EOL
# Application Settings
APP_NAME=ChandraHoro
APP_VERSION=2.1.0
ENVIRONMENT=production
DEBUG=False

# API Configuration
API_V1_PREFIX=/api/v1
CORS_ORIGINS=https://$DOMAIN,https://valuestream.in,http://$VPS_IP

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=mysql+aiomysql://chandrahoro_user:$MYSQL_PASSWORD@localhost:3306/chandrahoro_prod
SYNC_DATABASE_URL=mysql+pymysql://chandrahoro_user:$MYSQL_PASSWORD@localhost:3306/chandrahoro_prod
SQL_ECHO=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Swiss Ephemeris
EPHEMERIS_PATH=/home/$APP_USER/ephemeris_data

# Location Services
GEONAMES_USERNAME=$GEONAMES_USER

# LLM Vault
LLM_VAULT_KEY=$LLM_VAULT_KEY
LLM_VAULT_DIR=$VAULT_DIR

# Security
JWT_SECRET=$JWT_SECRET

# AI Services (Optional)
PERPLEXITY_API_KEY=$PERPLEXITY_KEY
OPENAI_API_KEY=$OPENAI_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_KEY

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
EOL

chown $APP_USER:$APP_USER $APP_DIR/backend/.env
chmod 600 $APP_DIR/backend/.env

log_success "Backend configured"
echo ""

# Run database migrations
log_info "Running database migrations..."
su - $APP_USER -c "cd $APP_DIR/backend && source venv/bin/activate && alembic upgrade head"
log_success "Database migrations completed"
echo ""

# Phase 7: Frontend Setup
log_step "Phase 7: Setting up frontend..."

cd $APP_DIR/frontend

# Create production .env file
cat > $APP_DIR/frontend/.env.production << EOL
# API Configuration
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Application Settings
NEXT_PUBLIC_APP_NAME=ChandraHoro
NEXT_PUBLIC_APP_VERSION=2.1.0

# Authentication
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
JWT_SECRET=$JWT_SECRET

# Database (for NextAuth)
DATABASE_URL=mysql://chandrahoro_user:$MYSQL_PASSWORD@localhost:3306/chandrahoro_prod

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# AI Services (Optional)
PERPLEXITY_API_KEY=$PERPLEXITY_KEY
OPENAI_API_KEY=$OPENAI_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
EOL

chown $APP_USER:$APP_USER $APP_DIR/frontend/.env.production
chmod 600 $APP_DIR/frontend/.env.production

# Install dependencies and build
log_info "Installing frontend dependencies..."
su - $APP_USER -c "cd $APP_DIR/frontend && npm ci --production=false"

log_info "Building frontend for production..."
su - $APP_USER -c "cd $APP_DIR/frontend && npm run build"

log_success "Frontend built successfully"
echo ""

# Phase 8: PM2 Configuration
log_step "Phase 8: Configuring PM2 process manager..."

# Backend PM2 config
cat > $APP_DIR/backend/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'chandrahoro-backend',
    script: 'venv/bin/uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/chandrahoro/chandrahoro/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/chandrahoro/logs/backend-error.log',
    out_file: '/home/chandrahoro/logs/backend-out.log',
    log_file: '/home/chandrahoro/logs/backend-combined.log',
    time: true
  }]
};
EOL

# Frontend PM2 config
cat > $APP_DIR/frontend/ecosystem.config.js << 'EOL'
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
    },
    error_file: '/home/chandrahoro/logs/frontend-error.log',
    out_file: '/home/chandrahoro/logs/frontend-out.log',
    log_file: '/home/chandrahoro/logs/frontend-combined.log',
    time: true
  }]
};
EOL

# Create logs directory
mkdir -p /home/$APP_USER/logs
chown -R $APP_USER:$APP_USER /home/$APP_USER/logs

# Start services with PM2
log_info "Starting backend service..."
su - $APP_USER -c "cd $APP_DIR/backend && pm2 start ecosystem.config.js"

log_info "Starting frontend service..."
su - $APP_USER -c "cd $APP_DIR/frontend && pm2 start ecosystem.config.js"

# Save PM2 configuration
su - $APP_USER -c "pm2 save"

# Setup PM2 startup script
env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

log_success "PM2 configured and services started"
echo ""

# Phase 9: Nginx Configuration
log_step "Phase 9: Configuring Nginx reverse proxy..."

cat > /etc/nginx/sites-available/chandrahoro << 'NGINX_EOF'
# Upstream definitions
upstream chandrahoro_frontend {
    server localhost:3000;
    keepalive 32;
}

upstream chandrahoro_backend {
    server localhost:8000;
    keepalive 32;
}

# HTTP server (will redirect to HTTPS after SSL setup)
server {
    listen 80;
    listen [::]:80;
    server_name jyotishdrishti.valuestream.in;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Temporary: Allow HTTP during initial setup
    # After SSL is configured, this will redirect to HTTPS

    # Backend API
    location /api/ {
        proxy_pass http://chandrahoro_backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        proxy_buffering off;
    }

    # Frontend
    location / {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

log_success "Nginx configured"
echo ""

# Phase 10: SSL Configuration
log_step "Phase 10: Configuring SSL with Let's Encrypt..."

log_warning "Before proceeding with SSL, ensure:"
echo "  1. Domain $DOMAIN points to this server IP: $VPS_IP"
echo "  2. DNS propagation is complete (check with: dig $DOMAIN)"
echo ""
read -p "Is DNS configured correctly? (yes/no): " DNS_READY

if [ "$DNS_READY" = "yes" ]; then
    log_info "Obtaining SSL certificate..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

    # Test auto-renewal
    certbot renew --dry-run

    log_success "SSL certificate installed and auto-renewal configured"
else
    log_warning "Skipping SSL configuration. Run this command manually after DNS is configured:"
    echo "  certbot --nginx -d $DOMAIN"
fi
echo ""

# Phase 11: Final Verification
log_step "Phase 11: Verifying deployment..."

# Check services
log_info "Checking service status..."

if systemctl is-active --quiet nginx; then
    log_success "Nginx is running"
else
    log_error "Nginx is not running"
fi

if systemctl is-active --quiet mysql; then
    log_success "MySQL is running"
else
    log_error "MySQL is not running"
fi

if systemctl is-active --quiet redis; then
    log_success "Redis is running"
else
    log_error "Redis is not running"
fi

# Check PM2 processes
log_info "PM2 process status:"
su - $APP_USER -c "pm2 status"

# Test backend health
log_info "Testing backend health..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log_success "Backend is responding"
else
    log_warning "Backend health check failed (may need a moment to start)"
fi

# Test frontend
log_info "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend is responding"
else
    log_warning "Frontend health check failed (may need a moment to start)"
fi

echo ""
log_success "Deployment completed!"
echo ""

# Print summary
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ChandraHoro Production Deployment Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "🌐 Domain: https://$DOMAIN"
echo "📍 Server IP: $VPS_IP"
echo "👤 Application User: $APP_USER"
echo "📁 Application Directory: $APP_DIR"
echo "🔐 Secrets File: $SECRETS_FILE"
echo ""
echo "🔧 Services:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo "  - Nginx: Port 80/443"
echo "  - MySQL: Port 3306"
echo "  - Redis: Port 6379"
echo ""
echo "📊 Management Commands:"
echo "  - View logs: pm2 logs"
echo "  - Restart backend: pm2 restart chandrahoro-backend"
echo "  - Restart frontend: pm2 restart chandrahoro-frontend"
echo "  - View PM2 status: pm2 status"
echo "  - Monitor processes: pm2 monit"
echo ""
echo "🔒 SSL Certificate:"
if [ "$DNS_READY" = "yes" ]; then
    echo "  ✅ Installed and configured"
    echo "  - Auto-renewal: Enabled"
else
    echo "  ⚠️  Not configured yet"
    echo "  - Run: certbot --nginx -d $DOMAIN"
fi
echo ""
echo "🧪 Test Endpoints:"
echo "  - Health: https://$DOMAIN/health"
echo "  - API Docs: https://$DOMAIN/api/v1/docs"
echo "  - Frontend: https://$DOMAIN"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the application in your browser"
echo "  2. Create a test chart to verify multi-methodology calculation"
echo "  3. Configure monitoring and backups"
echo "  4. Review logs: pm2 logs"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
log_success "Deployment script completed successfully!"
echo ""

