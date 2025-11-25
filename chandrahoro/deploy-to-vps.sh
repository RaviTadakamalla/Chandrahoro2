#!/bin/bash

################################################################################
# ChandraHoro - Complete VPS Deployment Script
# This script will deploy ChandraHoro to your Hostinger VPS in one command
# 
# Usage: 
#   1. SSH to your VPS as root: ssh root@72.61.174.232
#   2. Download this script: curl -O https://raw.githubusercontent.com/WhatTag/chandrahoro/main/deploy-to-vps.sh
#   3. Make it executable: chmod +x deploy-to-vps.sh
#   4. Run it: ./deploy-to-vps.sh
#
# Or run directly:
#   bash <(curl -s https://raw.githubusercontent.com/WhatTag/chandrahoro/main/deploy-to-vps.sh)
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

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
║              Complete VPS Deployment Script                       ║
║                     Version 1.0.0                                 ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}This script will:${NC}"
echo -e "  ${GREEN}✓${NC} Install all dependencies (Node.js, Python, MySQL, Redis, Nginx)"
echo -e "  ${GREEN}✓${NC} Create application user and configure security"
echo -e "  ${GREEN}✓${NC} Clone and setup ChandraHoro application"
echo -e "  ${GREEN}✓${NC} Configure database and generate secrets"
echo -e "  ${GREEN}✓${NC} Deploy backend (FastAPI) and frontend (Next.js)"
echo -e "  ${GREEN}✓${NC} Configure Nginx reverse proxy"
echo -e "  ${GREEN}✓${NC} Start all services"
echo ""
echo -e "${YELLOW}Estimated time: 15-20 minutes${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}ERROR: Please run as root${NC}"
    echo -e "${YELLOW}Run: sudo bash $0${NC}"
    exit 1
fi

VPS_IP=$(curl -s ifconfig.me)
echo -e "${BLUE}Detected VPS IP: ${VPS_IP}${NC}"
echo ""

# ============================================================================
# PHASE 1: System Setup & Dependencies
# ============================================================================

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PHASE 1: Installing Dependencies${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"

echo -e "${GREEN}[1/10] Installing essential tools...${NC}"
DEBIAN_FRONTEND=noninteractive apt install -y curl wget git vim htop unzip build-essential software-properties-common certbot python3-certbot-nginx > /dev/null 2>&1

echo -e "${GREEN}[2/10] Configuring firewall...${NC}"
ufw allow OpenSSH > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1

echo -e "${GREEN}[3/10] Creating application user...${NC}"
if ! id "chandrahoro" &>/dev/null; then
    useradd -m -s /bin/bash chandrahoro
    echo "chandrahoro:ChandraHoro2025!User#Pass" | chpasswd
    usermod -aG sudo chandrahoro
fi

echo -e "${GREEN}[4/10] Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
DEBIAN_FRONTEND=noninteractive apt install -y nodejs > /dev/null 2>&1

echo -e "${GREEN}[5/10] Installing Python 3.11...${NC}"
DEBIAN_FRONTEND=noninteractive apt install -y python3.11 python3.11-venv python3-pip python3-dev libssl-dev libffi-dev libmysqlclient-dev pkg-config > /dev/null 2>&1

echo -e "${GREEN}[6/10] Installing MySQL...${NC}"
DEBIAN_FRONTEND=noninteractive apt install -y mysql-server > /dev/null 2>&1
systemctl start mysql
systemctl enable mysql > /dev/null 2>&1

echo -e "${GREEN}[7/10] Installing Redis...${NC}"
DEBIAN_FRONTEND=noninteractive apt install -y redis-server > /dev/null 2>&1
systemctl start redis
systemctl enable redis > /dev/null 2>&1

echo -e "${GREEN}[8/10] Installing Nginx...${NC}"
DEBIAN_FRONTEND=noninteractive apt install -y nginx > /dev/null 2>&1
systemctl start nginx
systemctl enable nginx > /dev/null 2>&1

echo -e "${GREEN}[9/10] Installing PM2...${NC}"
npm install -g pm2 > /dev/null 2>&1

echo -e "${GREEN}[10/10] Installing Python cryptography...${NC}"
pip3 install cryptography --break-system-packages > /dev/null 2>&1

echo -e "${CYAN}✓ Phase 1 Complete${NC}"
echo ""

# ============================================================================
# PHASE 2: Application Setup (as chandrahoro user)
# ============================================================================

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PHASE 2: Setting Up Application${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"

# Generate secrets
echo -e "${GREEN}[1/6] Generating production secrets...${NC}"
SECRETS=$(sudo -u chandrahoro python3 << 'PYEOF'
from cryptography.fernet import Fernet
import secrets
import base64
llm_vault_key = Fernet.generate_key().decode()
nextauth_secret = base64.b64encode(secrets.token_bytes(32)).decode()
jwt_secret = base64.b64encode(secrets.token_bytes(32)).decode()
print(f"{llm_vault_key}|||{nextauth_secret}|||{jwt_secret}")
PYEOF
)

LLM_VAULT_KEY=$(echo $SECRETS | cut -d'|' -f1)
NEXTAUTH_SECRET=$(echo $SECRETS | cut -d'|' -f4)
JWT_SECRET=$(echo $SECRETS | cut -d'|' -f7)
DB_PASSWORD="ChandraHoro2025!DB#Pass"

# Save secrets
cat > /tmp/chandrahoro_secrets.txt << EOF
LLM_VAULT_KEY=$LLM_VAULT_KEY
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
VPS_IP=$VPS_IP
EOF

echo -e "${GREEN}[2/6] Creating vault directory...${NC}"
mkdir -p /var/lib/chandrahoro/llm_vault
chown -R chandrahoro:chandrahoro /var/lib/chandrahoro
chmod 700 /var/lib/chandrahoro/llm_vault

echo -e "${GREEN}[3/6] Setting up database...${NC}"
mysql << SQLEOF
CREATE DATABASE IF NOT EXISTS chandrahoro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chandrahoro_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON chandrahoro_db.* TO 'chandrahoro_user'@'localhost';
FLUSH PRIVILEGES;
SQLEOF

echo -e "${GREEN}[4/6] Cloning repository...${NC}"
sudo -u chandrahoro bash << 'USEREOF'
cd ~
if [ ! -d "chandrahoro" ]; then
    git clone https://github.com/WhatTag/chandrahoro.git > /dev/null 2>&1
fi
USEREOF

echo -e "${GREEN}[5/6] Installing backend dependencies...${NC}"
sudo -u chandrahoro bash << 'USEREOF'
cd ~/chandrahoro/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
USEREOF

echo -e "${GREEN}[6/6] Installing frontend dependencies...${NC}"
sudo -u chandrahoro bash << 'USEREOF'
cd ~/chandrahoro/frontend
npm install > /dev/null 2>&1
USEREOF

echo -e "${CYAN}✓ Phase 2 Complete${NC}"
echo ""

# Continue in next message due to length...

