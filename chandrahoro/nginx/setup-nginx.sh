#!/bin/bash

# ChandraHoro Nginx Setup Script
# This script installs and configures Nginx with SSL for valuestream.in/horo

set -e  # Exit on error

echo "========================================="
echo "ChandraHoro Nginx Setup"
echo "========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for Let's Encrypt
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install additional tools
echo "🛠️  Installing additional tools..."
sudo apt install -y curl jq

# Create web root directory
echo "📁 Creating web root directory..."
sudo mkdir -p /var/www/html

# Copy landing page
echo "📄 Setting up landing page..."
sudo cp /tmp/index.html /var/www/html/index.html
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Copy Nginx configuration
echo "⚙️  Configuring Nginx..."
sudo cp /tmp/valuestream.conf /etc/nginx/sites-available/valuestream

# Create symlink to enable site
sudo ln -sf /etc/nginx/sites-available/valuestream /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check Nginx status
echo "📊 Nginx status:"
sudo systemctl status nginx --no-pager

echo ""
echo "========================================="
echo "✅ Nginx setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update DNS A record to point to this VM's IP"
echo "2. Wait for DNS propagation (15-60 minutes)"
echo "3. Run: sudo certbot --nginx -d valuestream.in -d www.valuestream.in"
echo "4. Follow the prompts to obtain SSL certificate"
echo ""
echo "VM Public IP: $(curl -s ifconfig.me)"
echo ""

