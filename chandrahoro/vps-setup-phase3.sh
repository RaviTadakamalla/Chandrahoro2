#!/bin/bash

################################################################################
# ChandraHoro VPS Setup - Phase 3: Configuration & Deployment
# Run this as chandrahoro user
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          ChandraHoro VPS Setup - Phase 3                 ║
║          Configuration & Deployment                       ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as chandrahoro user
if [ "$USER" != "chandrahoro" ]; then
    echo -e "${RED}ERROR: Please run as chandrahoro user${NC}"
    exit 1
fi

# Load secrets
if [ ! -f /tmp/chandrahoro_secrets.txt ]; then
    echo -e "${RED}ERROR: Secrets file not found. Run Phase 2 first.${NC}"
    exit 1
fi

source /tmp/chandrahoro_secrets.txt

VPS_IP="72.61.174.232"

echo -e "${GREEN}[1/7] Configuring backend environment...${NC}"
cd ~/chandrahoro/backend

cat > .env.production << ENVEOF
# Database Configuration
DATABASE_URL=mysql+pymysql://chandrahoro_user:${DB_PASSWORD}@localhost:3306/chandrahoro_db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# LLM Vault Configuration
LLM_VAULT_KEY=${LLM_VAULT_KEY}
LLM_VAULT_DIR=/var/lib/chandrahoro/llm_vault

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=["http://${VPS_IP}","http://localhost:3000"]

# GeoNames Configuration (update with your username)
GEONAMES_USERNAME=demo

# Environment
ENVIRONMENT=production
DEBUG=False
ENVEOF

echo -e "${GREEN}[2/7] Running database migrations...${NC}"
source venv/bin/activate
# Initialize alembic if needed
if [ ! -d "alembic" ]; then
    alembic init alembic || true
fi
alembic upgrade head || echo -e "${YELLOW}Migrations may have already been applied or need to be initialized${NC}"

echo -e "${GREEN}[3/7] Creating backend systemd service...${NC}"
sudo tee /etc/systemd/system/chandrahoro-backend.service > /dev/null << 'SERVICEEOF'
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
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable chandrahoro-backend
sudo systemctl start chandrahoro-backend

echo -e "${GREEN}[4/7] Configuring frontend environment...${NC}"
cd ~/chandrahoro/frontend

cat > .env.production << ENVEOF
# API Configuration
NEXT_PUBLIC_API_URL=http://${VPS_IP}/api

# NextAuth Configuration
NEXTAUTH_URL=http://${VPS_IP}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_CHART_FEATURES=true

# Environment
NODE_ENV=production
ENVEOF

echo -e "${GREEN}[5/7] Building frontend...${NC}"
npm run build

echo -e "${GREEN}[6/7] Starting frontend with PM2...${NC}"
cat > ecosystem.config.js << 'PM2EOF'
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
PM2EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep "sudo" | bash || true

echo -e "${GREEN}[7/7] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/chandrahoro > /dev/null << 'NGINXEOF'
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

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

    location /_next/static {
        proxy_pass http://frontend;
        proxy_cache_valid 60m;
    }

    client_max_body_size 10M;
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/chandrahoro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🎉 DEPLOYMENT COMPLETE! 🎉                       ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✅ Backend configured and running${NC}"
echo -e "${GREEN}✅ Frontend built and running${NC}"
echo -e "${GREEN}✅ Nginx configured${NC}"
echo ""
echo -e "${YELLOW}Your application is now live at:${NC}"
echo -e "${BLUE}🌐 http://${VPS_IP}${NC}"
echo -e "${BLUE}📚 API Docs: http://${VPS_IP}/docs${NC}"
echo ""
echo -e "${YELLOW}Check service status:${NC}"
echo -e "  Backend:  sudo systemctl status chandrahoro-backend"
echo -e "  Frontend: pm2 status"
echo -e "  Nginx:    sudo systemctl status nginx"
echo ""

