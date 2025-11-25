#!/bin/bash

# SSL Diagnostic Script for ChandraHoro
# Domain: jyotishdrishti.valuestream.in
# Purpose: Comprehensive SSL/HTTPS diagnostics

DOMAIN="jyotishdrishti.valuestream.in"

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🔍 SSL/HTTPS Diagnostic Report"
echo "Domain: $DOMAIN"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Function to print section headers
print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 1. DNS Resolution
print_section "1. DNS Resolution"
echo "Checking DNS for $DOMAIN..."
dig +short $DOMAIN
echo ""
echo "Full DNS query:"
dig $DOMAIN
echo ""

# 2. Certbot Certificates
print_section "2. Certbot Certificates"
if command -v certbot &> /dev/null; then
    certbot certificates
else
    echo -e "${RED}Certbot is not installed${NC}"
fi
echo ""

# 3. Certificate Files
print_section "3. Certificate Files"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$CERT_DIR" ]; then
    echo "Certificate directory exists: $CERT_DIR"
    ls -la $CERT_DIR
    echo ""
    echo "Certificate details:"
    if [ -f "$CERT_DIR/cert.pem" ]; then
        openssl x509 -in $CERT_DIR/cert.pem -noout -text | grep -A2 "Validity"
        echo ""
        openssl x509 -in $CERT_DIR/cert.pem -noout -subject -issuer
    fi
else
    echo -e "${RED}Certificate directory does not exist: $CERT_DIR${NC}"
fi
echo ""

# 4. Port 443 Status
print_section "4. Port 443 Status"
echo "Checking if port 443 is listening..."
if command -v netstat &> /dev/null; then
    netstat -tlnp | grep :443
elif command -v ss &> /dev/null; then
    ss -tlnp | grep :443
else
    echo "Neither netstat nor ss is available"
fi
echo ""

# 5. Nginx Status
print_section "5. Nginx Status"
systemctl status nginx --no-pager
echo ""

# 6. Nginx Configuration Test
print_section "6. Nginx Configuration Test"
nginx -t
echo ""

# 7. Nginx Configuration Content
print_section "7. Nginx Configuration for $DOMAIN"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
if [ -f "$NGINX_CONFIG" ]; then
    echo "Configuration file: $NGINX_CONFIG"
    echo ""
    cat $NGINX_CONFIG
else
    echo -e "${RED}Nginx configuration file not found: $NGINX_CONFIG${NC}"
    echo ""
    echo "Checking for alternative locations..."
    find /etc/nginx -name "*$DOMAIN*" 2>/dev/null
fi
echo ""

# 8. Nginx Enabled Sites
print_section "8. Nginx Enabled Sites"
ls -la /etc/nginx/sites-enabled/
echo ""

# 9. UFW Firewall Status
print_section "9. UFW Firewall Status"
if command -v ufw &> /dev/null; then
    ufw status verbose
else
    echo "UFW is not installed"
fi
echo ""

# 10. Recent Nginx Error Logs
print_section "10. Recent Nginx Error Logs (Last 30 lines)"
if [ -f "/var/log/nginx/error.log" ]; then
    tail -30 /var/log/nginx/error.log
else
    echo "Nginx error log not found"
fi
echo ""

# 11. Recent Nginx Access Logs
print_section "11. Recent Nginx Access Logs (Last 20 lines)"
if [ -f "/var/log/nginx/access.log" ]; then
    tail -20 /var/log/nginx/access.log
else
    echo "Nginx access log not found"
fi
echo ""

# 12. Recent Certbot Logs
print_section "12. Recent Certbot Logs (Last 30 lines)"
if [ -f "/var/log/letsencrypt/letsencrypt.log" ]; then
    tail -30 /var/log/letsencrypt/letsencrypt.log
else
    echo "Certbot log not found"
fi
echo ""

# 13. HTTPS Connectivity Test
print_section "13. HTTPS Connectivity Test"
echo "Testing HTTPS connection to $DOMAIN..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN --max-time 10 2>&1)
echo "HTTPS Response Code: $HTTP_CODE"
echo ""
echo "Full HTTPS response headers:"
curl -I https://$DOMAIN --max-time 10 2>&1 || echo "HTTPS connection failed"
echo ""

# 14. HTTP to HTTPS Redirect Test
print_section "14. HTTP to HTTPS Redirect Test"
echo "Testing HTTP to HTTPS redirect..."
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --max-time 10 2>&1)
echo "HTTP Response Code: $HTTP_REDIRECT"
echo ""
echo "Full HTTP response headers:"
curl -I http://$DOMAIN --max-time 10 2>&1 || echo "HTTP connection failed"
echo ""

# 15. SSL Certificate Chain Test
print_section "15. SSL Certificate Chain Test"
echo "Testing SSL certificate chain..."
echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>&1 | head -50
echo ""

# 16. PM2 Process Status
print_section "16. PM2 Process Status"
if command -v pm2 &> /dev/null; then
    if [ -d "/home/chandrahoro" ]; then
        su - chandrahoro -c "pm2 status" 2>/dev/null || echo "Could not get PM2 status as chandrahoro user"
    else
        pm2 status 2>/dev/null || echo "PM2 not running or no processes"
    fi
else
    echo "PM2 is not installed"
fi
echo ""

# 17. Backend Health Check
print_section "17. Backend Health Check"
echo "Testing backend health endpoint..."
curl -s http://localhost:8000/health 2>&1 || echo "Backend health check failed"
echo ""
curl -s http://localhost:8000/api/v1/health 2>&1 || echo "Backend API health check failed"
echo ""

# 18. Frontend Health Check
print_section "18. Frontend Health Check"
echo "Testing frontend..."
curl -s -I http://localhost:3000 2>&1 | head -10 || echo "Frontend check failed"
echo ""

# 19. System Resources
print_section "19. System Resources"
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h
echo ""
echo "CPU load:"
uptime
echo ""

# 20. Certbot Timer Status
print_section "20. Certbot Auto-Renewal Timer"
if systemctl list-unit-files | grep -q certbot.timer; then
    systemctl status certbot.timer --no-pager
else
    echo "Certbot timer not found"
fi
echo ""

# Summary
print_section "📊 Diagnostic Summary"
echo ""

# Check DNS
DNS_IP=$(dig +short $DOMAIN | head -n1)
if [ -n "$DNS_IP" ]; then
    echo -e "${GREEN}✅ DNS Resolution: OK ($DNS_IP)${NC}"
else
    echo -e "${RED}❌ DNS Resolution: FAILED${NC}"
fi

# Check Certificates
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${GREEN}✅ SSL Certificates: Exist${NC}"
else
    echo -e "${RED}❌ SSL Certificates: Not Found${NC}"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: Running${NC}"
else
    echo -e "${RED}❌ Nginx: Not Running${NC}"
fi

# Check Port 443
if netstat -tlnp 2>/dev/null | grep -q ":443" || ss -tlnp 2>/dev/null | grep -q ":443"; then
    echo -e "${GREEN}✅ Port 443: Listening${NC}"
else
    echo -e "${RED}❌ Port 443: Not Listening${NC}"
fi

# Check HTTPS
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ HTTPS: Working (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ HTTPS: Not Working (HTTP $HTTP_CODE)${NC}"
fi

# Check HTTP Redirect
if [ "$HTTP_REDIRECT" = "301" ] || [ "$HTTP_REDIRECT" = "302" ]; then
    echo -e "${GREEN}✅ HTTP → HTTPS Redirect: Working${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP → HTTPS Redirect: Not Working (HTTP $HTTP_REDIRECT)${NC}"
fi

echo ""
echo "=========================================="
echo "📝 Diagnostic report complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the diagnostic output above"
echo "2. If issues found, run: ./fix-ssl.sh"
echo "3. For manual fixes, see: SSL_TROUBLESHOOTING_GUIDE.md"
echo ""

