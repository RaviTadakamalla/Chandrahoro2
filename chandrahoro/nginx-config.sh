#!/bin/bash
#
# Nginx Configuration Script
# Run this after complete-deployment.sh
#

set -e

DOMAIN="jyotishdrishti.valuestream.in"

echo "=========================================="
echo "Configuring Nginx for ChandraHoro"
echo "=========================================="
echo ""

# Remove default config
rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration
cat > /etc/nginx/sites-available/${DOMAIN} << 'EOFNGINX'
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

upstream chandrahoro_frontend {
    server localhost:3000;
    keepalive 32;
}

upstream chandrahoro_backend {
    server localhost:8000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name jyotishdrishti.valuestream.in;

    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    keepalive_timeout 65s;
    send_timeout 60s;

    access_log /var/log/nginx/chandrahoro_access.log;
    error_log /var/log/nginx/chandrahoro_error.log;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

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

    location /health {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    location /_next/static/ {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /_next/image {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 7d;
        add_header Cache-Control "public";
    }

    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

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

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOFNGINX

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo ""
echo "=== VERIFYING SERVICES ==="
sleep 3

systemctl is-active nginx && echo "✓ Nginx: Running" || echo "✗ Nginx: FAILED"
systemctl is-active mysql && echo "✓ MySQL: Running" || echo "✗ MySQL: FAILED"
systemctl is-active redis-server && echo "✓ Redis: Running" || echo "✗ Redis: FAILED"

echo ""
echo "=== PM2 STATUS ==="
pm2 status

echo ""
echo "=== TESTING ENDPOINTS ==="
echo -n "Backend health: "
curl -s http://localhost:8000/health && echo "✓ OK" || echo "✗ FAILED"

echo -n "Frontend: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo " ✓ OK" || echo " ✗ FAILED"

echo -n "Domain: "
curl -s -o /dev/null -w "%{http_code}" http://${DOMAIN} && echo " ✓ OK" || echo " ✗ FAILED"

echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Your application is now accessible at:"
echo "http://${DOMAIN}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check PM2 processes"
echo "  pm2 logs                - View all logs"
echo "  pm2 restart all         - Restart all processes"
echo "  systemctl status nginx  - Check Nginx status"
echo ""

