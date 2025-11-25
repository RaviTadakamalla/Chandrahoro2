#!/bin/bash

# SSL/HTTPS Fix Script for ChandraHoro
# Domain: jyotishdrishti.valuestream.in
# Purpose: Diagnose and fix SSL/HTTPS issues

set -e

DOMAIN="jyotishdrishti.valuestream.in"
EMAIL="admin@${DOMAIN}"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔒 SSL/HTTPS Fix Script for ChandraHoro"
echo "========================================"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Check DNS resolution
print_info "Step 1: Checking DNS resolution..."
IP=$(dig +short $DOMAIN | head -n1)
if [ -z "$IP" ]; then
    print_error "DNS not resolved. Please wait for DNS propagation."
    print_info "Configure DNS A record: $DOMAIN → Your VPS IP"
    exit 1
fi
print_success "DNS resolved to: $IP"
echo ""

# Step 2: Check if Nginx is running
print_info "Step 2: Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_warning "Nginx is not running. Starting Nginx..."
    systemctl start nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx started successfully"
    else
        print_error "Failed to start Nginx"
        exit 1
    fi
fi
echo ""

# Step 3: Check firewall
print_info "Step 3: Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "443.*ALLOW"; then
        print_success "Port 443 is allowed in UFW"
    else
        print_warning "Port 443 not allowed. Adding rule..."
        ufw allow 443/tcp
        print_success "Port 443 allowed"
    fi
else
    print_info "UFW not installed, skipping firewall check"
fi
echo ""

# Step 4: Check if certificates exist
print_info "Step 4: Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_success "SSL certificates already exist"
    
    # Check certificate expiry
    CERT_FILE="/etc/letsencrypt/live/$DOMAIN/cert.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        print_info "Certificate expires: $EXPIRY"
    fi
    
    RENEW_CERT=false
else
    print_warning "SSL certificates not found. Will obtain new certificate."
    RENEW_CERT=true
fi
echo ""

# Step 5: Obtain or renew SSL certificate
if [ "$RENEW_CERT" = true ]; then
    print_info "Step 5: Obtaining SSL certificate from Let's Encrypt..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_error "Certbot is not installed"
        print_info "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Run certbot
    print_info "Running certbot..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained successfully"
    else
        print_error "Failed to obtain SSL certificate"
        print_info "Check logs: /var/log/letsencrypt/letsencrypt.log"
        
        # Try standalone mode as fallback
        print_warning "Trying standalone mode..."
        systemctl stop nginx
        certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
        
        if [ $? -eq 0 ]; then
            print_success "SSL certificate obtained in standalone mode"
            systemctl start nginx
        else
            print_error "Failed to obtain SSL certificate in standalone mode"
            systemctl start nginx
            exit 1
        fi
    fi
else
    print_info "Step 5: SSL certificates already exist, skipping..."
fi
echo ""

# Step 6: Verify Nginx configuration includes SSL
print_info "Step 6: Verifying Nginx SSL configuration..."
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "listen 443 ssl" "$NGINX_CONFIG"; then
        print_success "Nginx is configured for SSL"
    else
        print_warning "Nginx SSL configuration missing. Certbot should have added it."
        print_info "If HTTPS still doesn't work, check: $NGINX_CONFIG"
    fi
else
    print_error "Nginx configuration file not found: $NGINX_CONFIG"
    exit 1
fi
echo ""

# Step 7: Test Nginx configuration
print_info "Step 7: Testing Nginx configuration..."
nginx -t 2>&1 | while read line; do
    if echo "$line" | grep -q "syntax is ok"; then
        print_success "Nginx syntax is OK"
    elif echo "$line" | grep -q "test is successful"; then
        print_success "Nginx test is successful"
    elif echo "$line" | grep -qi "error"; then
        print_error "$line"
    else
        print_info "$line"
    fi
done

if nginx -t > /dev/null 2>&1; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    exit 1
fi
echo ""

# Step 8: Reload Nginx
print_info "Step 8: Reloading Nginx..."
systemctl reload nginx
if [ $? -eq 0 ]; then
    print_success "Nginx reloaded successfully"
else
    print_error "Failed to reload Nginx"
    exit 1
fi
echo ""

# Step 9: Verify HTTPS is working
print_info "Step 9: Verifying HTTPS..."
sleep 2  # Give Nginx a moment to fully reload

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    print_success "HTTPS is working! (HTTP $HTTP_CODE)"
else
    print_warning "HTTPS returned HTTP $HTTP_CODE"
    print_info "This might be normal if the application is still starting"
fi
echo ""

# Step 10: Verify HTTP to HTTPS redirect
print_info "Step 10: Verifying HTTP → HTTPS redirect..."
REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --max-time 10 2>/dev/null || echo "000")
if [ "$REDIRECT" = "301" ] || [ "$REDIRECT" = "302" ]; then
    print_success "HTTP redirects to HTTPS (HTTP $REDIRECT)"
else
    print_warning "HTTP redirect not working properly (HTTP $REDIRECT)"
fi
echo ""

# Step 11: Check if port 443 is listening
print_info "Step 11: Checking if port 443 is listening..."
if netstat -tlnp | grep -q ":443"; then
    print_success "Port 443 is listening"
    netstat -tlnp | grep ":443"
elif ss -tlnp | grep -q ":443"; then
    print_success "Port 443 is listening"
    ss -tlnp | grep ":443"
else
    print_error "Port 443 is not listening"
fi
echo ""

# Step 12: Set up auto-renewal
print_info "Step 12: Setting up SSL auto-renewal..."
if systemctl is-enabled certbot.timer &> /dev/null; then
    print_success "Certbot auto-renewal is already enabled"
else
    systemctl enable certbot.timer
    systemctl start certbot.timer
    print_success "Certbot auto-renewal enabled"
fi

# Test renewal
print_info "Testing certificate renewal (dry-run)..."
if certbot renew --dry-run &> /dev/null; then
    print_success "Certificate renewal test passed"
else
    print_warning "Certificate renewal test failed (this might be OK if cert is new)"
fi
echo ""

# Final summary
echo "=========================================="
echo "🎉 SSL Setup Complete!"
echo "=========================================="
echo ""
print_success "Your application should now be accessible via HTTPS:"
echo "   🌐 https://$DOMAIN"
echo ""
print_info "Next steps:"
echo "   1. Open https://$DOMAIN in your browser"
echo "   2. Verify the SSL certificate (look for padlock icon)"
echo "   3. Test all application features"
echo "   4. Monitor logs: pm2 logs"
echo ""
print_info "Useful commands:"
echo "   • Check SSL certificate: certbot certificates"
echo "   • Renew certificate: certbot renew"
echo "   • Check Nginx status: systemctl status nginx"
echo "   • View Nginx logs: tail -f /var/log/nginx/error.log"
echo ""

