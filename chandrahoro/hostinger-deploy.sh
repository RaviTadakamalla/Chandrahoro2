#!/bin/bash

################################################################################
# ChandraHoro - Hostinger VPS Automated Deployment Script
# Version: 1.0.0
# Description: Automated deployment script for Hostinger VPS (Ubuntu 22.04 LTS)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██████╗  ██████╗ ║
║  ██╔════╝██║  ██║██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔═══██╗║
║  ██║     ███████║███████║██╔██╗ ██║██║  ██║██████╔╝██║   ██║║
║  ██║     ██╔══██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║║
║  ╚██████╗██║  ██║██║  ██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ║
║                                                           ║
║           Hostinger VPS Deployment Script                ║
║                    Version 1.0.0                         ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    log_error "Please do not run this script as root. Run as the chandrahoro user."
    exit 1
fi

# Configuration
APP_USER="chandrahoro"
APP_DIR="/home/$APP_USER/chandrahoro"
VAULT_DIR="/var/lib/chandrahoro/llm_vault"
REPO_URL="https://github.com/WhatTag/chandrahoro.git"

# Prompt for configuration
log_info "Starting ChandraHoro deployment configuration..."
echo ""

read -p "Enter your domain name (e.g., chandrahoro.com): " DOMAIN_NAME
read -p "Enter MySQL password for chandrahoro_user: " -s MYSQL_PASSWORD
echo ""
read -p "Enter GeoNames username: " GEONAMES_USER

# Generate secrets
log_info "Generating security secrets..."
LLM_VAULT_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

log_success "Secrets generated successfully"
echo ""
log_warning "IMPORTANT: Save these secrets securely!"
echo "LLM_VAULT_KEY: $LLM_VAULT_KEY"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "JWT_SECRET: $JWT_SECRET"
echo ""
read -p "Press Enter to continue after saving these secrets..."

# Phase 1: System Update
log_info "Phase 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
log_success "System updated"

# Phase 2: Install Dependencies
log_info "Phase 2: Installing dependencies..."

# Node.js
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    log_success "Node.js installed: $(node --version)"
else
    log_success "Node.js already installed: $(node --version)"
fi

# Python 3.11
if ! command -v python3.11 &> /dev/null; then
    log_info "Installing Python 3.11..."
    sudo apt install -y python3.11 python3.11-venv python3-pip
    log_success "Python 3.11 installed"
else
    log_success "Python 3.11 already installed"
fi

# System dependencies
log_info "Installing system dependencies..."
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev \
    libmysqlclient-dev pkg-config git curl wget
log_success "System dependencies installed"

# MySQL
if ! command -v mysql &> /dev/null; then
    log_info "Installing MySQL 8.0..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    log_success "MySQL installed"
else
    log_success "MySQL already installed"
fi

# Redis
if ! command -v redis-cli &> /dev/null; then
    log_info "Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis
    sudo systemctl enable redis
    log_success "Redis installed"
else
    log_success "Redis already installed"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    log_info "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    log_success "Nginx installed"
else
    log_success "Nginx already installed"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log_info "Installing PM2..."
    sudo npm install -g pm2
    log_success "PM2 installed"
else
    log_success "PM2 already installed"
fi

log_success "All dependencies installed"


