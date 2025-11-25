#!/bin/bash

################################################################################
# ChandraHoro VPS Setup - Phase 1: Initial Setup & Dependencies
# Run this as root user on fresh Ubuntu VPS
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
║          ChandraHoro VPS Setup - Phase 1                 ║
║          Initial Setup & Dependencies                     ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}ERROR: Please run as root${NC}"
    exit 1
fi

echo -e "${GREEN}[1/8] Installing essential tools...${NC}"
apt install -y curl wget git vim htop unzip build-essential software-properties-common certbot python3-certbot-nginx

echo -e "${GREEN}[2/8] Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo -e "${GREEN}[3/8] Creating application user 'chandrahoro'...${NC}"
if ! id "chandrahoro" &>/dev/null; then
    useradd -m -s /bin/bash chandrahoro
    echo "chandrahoro:ChandraHoro2025!User#Pass" | chpasswd
    usermod -aG sudo chandrahoro
    echo -e "${YELLOW}Application user created with password: ChandraHoro2025!User#Pass${NC}"
    echo -e "${YELLOW}SAVE THIS PASSWORD!${NC}"
else
    echo -e "${YELLOW}User 'chandrahoro' already exists${NC}"
fi

echo -e "${GREEN}[4/8] Installing Node.js 18 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
echo -e "${BLUE}Node.js version: $(node --version)${NC}"
echo -e "${BLUE}npm version: $(npm --version)${NC}"

echo -e "${GREEN}[5/8] Installing Python (Ubuntu 24.04 uses Python 3.12)...${NC}"
apt install -y python3 python3-venv python3-pip python3-dev libssl-dev libffi-dev libmysqlclient-dev pkg-config
# Create symlink for compatibility
ln -sf /usr/bin/python3 /usr/bin/python3.11 || true
echo -e "${BLUE}Python version: $(python3 --version)${NC}"

echo -e "${GREEN}[6/8] Installing MySQL 8.0...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo -e "${GREEN}[7/8] Installing Redis...${NC}"
apt install -y redis-server
systemctl start redis
systemctl enable redis

echo -e "${GREEN}[8/8] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Installing Python cryptography library...${NC}"
pip3 install cryptography --break-system-packages

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Phase 1 Complete!                           ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✅ Essential tools installed${NC}"
echo -e "${GREEN}✅ Firewall configured${NC}"
echo -e "${GREEN}✅ Application user created: chandrahoro${NC}"
echo -e "${GREEN}✅ Node.js $(node --version) installed${NC}"
echo -e "${GREEN}✅ Python 3.11 installed${NC}"
echo -e "${GREEN}✅ MySQL installed and running${NC}"
echo -e "${GREEN}✅ Redis installed and running${NC}"
echo -e "${GREEN}✅ Nginx installed and running${NC}"
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT CREDENTIALS:${NC}"
echo -e "${YELLOW}Application user: chandrahoro${NC}"
echo -e "${YELLOW}Password: ChandraHoro2025!User#Pass${NC}"
echo ""
echo -e "${BLUE}Next: Switch to chandrahoro user and run Phase 2${NC}"
echo -e "${BLUE}Command: su - chandrahoro${NC}"
echo ""

