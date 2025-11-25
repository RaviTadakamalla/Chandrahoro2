#!/bin/bash

# Revert to HTTP-Only Configuration Script
# Domain: jyotishdrishti.valuestream.in
# Purpose: Temporarily disable HTTPS and use HTTP only

set -e

DOMAIN="jyotishdrishti.valuestream.in"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
BACKUP_DIR="/root/nginx-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🔄 Reverting to HTTP-Only Configuration"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Step 1: Backup current Nginx configuration
echo -e "${BLUE}Step 1: Backing up current Nginx configuration...${NC}"
if [ -f "$NGINX_CONFIG" ]; then
    BACKUP_FILE="$BACKUP_DIR/${DOMAIN}_$(date +%Y%m%d_%H%M%S).conf"
    cp "$NGINX_CONFIG" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup saved to: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  No existing configuration found at: $NGINX_CONFIG${NC}"
fi
echo ""

# Step 2: Create HTTP-only configuration
echo -e "${BLUE}Step 2: Creating HTTP-only Nginx configuration...${NC}"

cat > "$NGINX_CONFIG" << 'EOF'
# Nginx Configuration for ChandraHoro - HTTP ONLY (Temporary)
# Domain: jyotishdrishti.valuestream.in
# WARNING: This is HTTP-only configuration for testing purposes
# For production, HTTPS should be enabled for security

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream servers
upstream chandrahoro_frontend {
    server localhost:3000;
    keepalive 32;
}

upstream chandrahoro_backend {
    server localhost:8000;
    keepalive 32;
}

# HTTP server - Main configuration
server {
    listen 80;
    listen [::]:80;
    server_name jyotishdrishti.valuestream.in;

    # Increase client body size for file uploads
    client_max_body_size 10M;

    # Timeouts
    client_body_timeout 60s;
    client_header_timeout 60s;
    keepalive_timeout 65s;
    send_timeout 60s;

    # Logging
    access_log /var/log/nginx/chandrahoro_access.log;
    error_log /var/log/nginx/chandrahoro_error.log;

    # Security headers (even for HTTP)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Backend API - /api/*
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://chandrahoro_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Frontend - Next.js static assets
    location /_next/static/ {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Frontend - Next.js image optimization
    location /_next/image {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 7d;
        add_header Cache-Control "public";
    }

    # Frontend - Static files
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    # Frontend - All other requests
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo -e "${GREEN}✅ HTTP-only configuration created${NC}"
echo ""

# Step 3: Enable the configuration
echo -e "${BLUE}Step 3: Enabling Nginx configuration...${NC}"
if [ ! -L "$NGINX_ENABLED" ]; then
    ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
    echo -e "${GREEN}✅ Configuration symlink created${NC}"
else
    echo -e "${GREEN}✅ Configuration already enabled${NC}"
fi
echo ""

# Step 4: Test Nginx configuration
echo -e "${BLUE}Step 4: Testing Nginx configuration...${NC}"
if nginx -t 2>&1 | tee /tmp/nginx-test.log; then
    echo -e "${GREEN}✅ Nginx configuration test passed${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$NGINX_CONFIG"
        echo -e "${GREEN}✅ Backup restored${NC}"
    fi
    exit 1
fi
echo ""

# Step 5: Reload Nginx
echo -e "${BLUE}Step 5: Reloading Nginx...${NC}"
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to reload Nginx${NC}"
    exit 1
fi
echo ""

# Step 6: Verify services are running
echo -e "${BLUE}Step 6: Verifying services...${NC}"

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed${NC}"
fi
echo ""

# Step 7: Test HTTP access
echo -e "${BLUE}Step 7: Testing HTTP access...${NC}"
sleep 2  # Give Nginx a moment

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP is working! (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP returned: $HTTP_CODE${NC}"
    echo -e "${YELLOW}   This might be normal if the application is still starting${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 HTTP-Only Configuration Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Your application is now accessible via HTTP:${NC}"
echo -e "   🌐 http://$DOMAIN"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
echo "   • This is HTTP-only (not secure for production)"
echo "   • HTTPS/SSL has been disabled temporarily"
echo "   • For production, you should enable HTTPS"
echo ""
echo -e "${BLUE}ℹ️  Configuration backup saved to:${NC}"
echo "   $BACKUP_FILE"
echo ""
echo -e "${BLUE}ℹ️  To restore HTTPS later:${NC}"
echo "   1. Fix SSL issues using: ./fix-ssl.sh"
echo "   2. Or restore backup: cp $BACKUP_FILE $NGINX_CONFIG"
echo "   3. Then reload Nginx: systemctl reload nginx"
echo ""
echo -e "${BLUE}ℹ️  Useful commands:${NC}"
echo "   • Check Nginx status: systemctl status nginx"
echo "   • View Nginx logs: tail -f /var/log/nginx/chandrahoro_error.log"
echo "   • Test configuration: nginx -t"
echo "   • Reload Nginx: systemctl reload nginx"
echo ""

