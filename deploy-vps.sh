#!/bin/bash

################################################################################
# ChandraHoro - Quick VPS Deployment Script
# Run this from your local machine after pushing changes to GitHub
################################################################################

set -e

# Configuration
VPS_USER="chandrahoro"
VPS_IP="72.61.174.232"
APP_DIR="/home/chandrahoro/chandrahoro"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ChandraHoro VPS Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${YELLOW}No SSH key found. You may need to enter password.${NC}"
fi

echo -e "${GREEN}Connecting to VPS and deploying...${NC}"
echo ""

ssh -t ${VPS_USER}@${VPS_IP} << 'ENDSSH'
set -e

echo "📦 Pulling latest code..."
cd ~/chandrahoro
git pull origin main

echo "🔨 Building frontend..."
cd frontend
npm run build

echo "🔄 Restarting services..."
pm2 restart all 2>/dev/null || echo "PM2 not running, skipping..."

# Restart backend if using systemd
if systemctl is-active --quiet chandrahoro-backend 2>/dev/null; then
    sudo systemctl restart chandrahoro-backend
    echo "✅ Backend service restarted"
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: https://jyotishdrishti.valuestream.in"
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
