#!/bin/bash

################################################################################
# ChandraHoro VPS Setup - Phase 2: Database & Application Setup
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
║          ChandraHoro VPS Setup - Phase 2                 ║
║          Database & Application Setup                     ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as chandrahoro user
if [ "$USER" != "chandrahoro" ]; then
    echo -e "${RED}ERROR: Please run as chandrahoro user${NC}"
    echo -e "${YELLOW}Run: su - chandrahoro${NC}"
    exit 1
fi

# Configuration
VPS_IP="72.61.174.232"
DB_PASSWORD="ChandraHoro2025!DB#Pass"

echo -e "${GREEN}[1/6] Generating production secrets...${NC}"
python3 << 'PYEOF'
from cryptography.fernet import Fernet
import secrets
import base64

print("\n" + "="*60)
print("PRODUCTION SECRETS - SAVE THESE!")
print("="*60)

llm_vault_key = Fernet.generate_key().decode()
nextauth_secret = base64.b64encode(secrets.token_bytes(32)).decode()
jwt_secret = base64.b64encode(secrets.token_bytes(32)).decode()

print(f"\nLLM_VAULT_KEY={llm_vault_key}")
print(f"NEXTAUTH_SECRET={nextauth_secret}")
print(f"JWT_SECRET={jwt_secret}")
print(f"\nDatabase Password: ChandraHoro2025!DB#Pass")
print("\n" + "="*60)
print("COPY THESE TO A SAFE PLACE!")
print("="*60 + "\n")

# Save to file for later use
with open('/tmp/chandrahoro_secrets.txt', 'w') as f:
    f.write(f"LLM_VAULT_KEY={llm_vault_key}\n")
    f.write(f"NEXTAUTH_SECRET={nextauth_secret}\n")
    f.write(f"JWT_SECRET={jwt_secret}\n")
    f.write(f"DB_PASSWORD=ChandraHoro2025!DB#Pass\n")
PYEOF

echo -e "${GREEN}[2/6] Creating LLM vault directory...${NC}"
sudo mkdir -p /var/lib/chandrahoro/llm_vault
sudo chown -R chandrahoro:chandrahoro /var/lib/chandrahoro
sudo chmod 700 /var/lib/chandrahoro/llm_vault

echo -e "${GREEN}[3/6] Setting up MySQL database...${NC}"
sudo mysql << 'SQLEOF'
CREATE DATABASE IF NOT EXISTS chandrahoro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chandrahoro_user'@'localhost' IDENTIFIED BY 'ChandraHoro2025!DB#Pass';
GRANT ALL PRIVILEGES ON chandrahoro_db.* TO 'chandrahoro_user'@'localhost';
FLUSH PRIVILEGES;
SQLEOF

echo -e "${GREEN}[4/6] Cloning ChandraHoro repository...${NC}"
cd ~
if [ -d "chandrahoro" ]; then
    echo -e "${YELLOW}Repository already exists, pulling latest changes...${NC}"
    cd chandrahoro
    git pull origin main || git pull origin master
else
    git clone https://github.com/WhatTag/chandrahoro.git
    cd chandrahoro
fi

echo -e "${GREEN}[5/6] Setting up backend...${NC}"
cd ~/chandrahoro/backend

# Create virtual environment (using system Python 3.12 on Ubuntu 24.04)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}[6/6] Setting up frontend...${NC}"
cd ~/chandrahoro/frontend
npm install

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Phase 2 Complete!                           ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✅ Production secrets generated${NC}"
echo -e "${GREEN}✅ LLM vault directory created${NC}"
echo -e "${GREEN}✅ MySQL database created${NC}"
echo -e "${GREEN}✅ Repository cloned${NC}"
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""
echo -e "${YELLOW}Secrets saved to: /tmp/chandrahoro_secrets.txt${NC}"
echo -e "${YELLOW}View secrets: cat /tmp/chandrahoro_secrets.txt${NC}"
echo ""
echo -e "${BLUE}Next: Run Phase 3 to configure and deploy${NC}"
echo -e "${BLUE}Command: bash ~/chandrahoro/vps-setup-phase3.sh${NC}"
echo ""

