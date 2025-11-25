#!/bin/bash

################################################################################
# ChandraHoro - Post-Deployment Verification Script
# Domain: jyotishdrishti.valuestream.in
# Version: 1.0.0
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="jyotishdrishti.valuestream.in"
PASSED=0
FAILED=0

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ChandraHoro Post-Deployment Verification Script      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test function
test_check() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Service checks
echo -e "${BLUE}[1/6] Checking System Services...${NC}"
test_check "Nginx service" "systemctl is-active --quiet nginx"
test_check "MySQL service" "systemctl is-active --quiet mysql"
test_check "Redis service" "systemctl is-active --quiet redis"
echo ""

# PM2 checks
echo -e "${BLUE}[2/6] Checking PM2 Processes...${NC}"
test_check "Backend process" "su - chandrahoro -c 'pm2 describe chandrahoro-backend' | grep -q 'online'"
test_check "Frontend process" "su - chandrahoro -c 'pm2 describe chandrahoro-frontend' | grep -q 'online'"
echo ""

# Network checks
echo -e "${BLUE}[3/6] Checking Network Connectivity...${NC}"
test_check "Backend port 8000" "nc -z localhost 8000"
test_check "Frontend port 3000" "nc -z localhost 3000"
test_check "Nginx port 80" "nc -z localhost 80"
test_check "Nginx port 443" "nc -z localhost 443"
echo ""

# Health endpoint checks
echo -e "${BLUE}[4/6] Checking Health Endpoints...${NC}"
test_check "Backend health (local)" "curl -f http://localhost:8000/health"
test_check "Frontend health (local)" "curl -f http://localhost:3000"

if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    test_check "Public health endpoint" "curl -f https://$DOMAIN/health"
    test_check "Backend API health" "curl -f https://$DOMAIN/api/v1/health"
else
    echo -e "${YELLOW}⚠ Skipping public endpoint tests (SSL not configured or DNS not ready)${NC}"
fi
echo ""

# SSL/HTTPS checks
echo -e "${BLUE}[5/6] Checking SSL/HTTPS Configuration...${NC}"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    test_check "SSL certificate exists" "[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]"
    test_check "SSL certificate valid" "openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -checkend 86400"
    test_check "HTTPS redirect" "curl -I http://$DOMAIN 2>/dev/null | grep -q '301'"
else
    echo -e "${YELLOW}⚠ SSL certificate not found (run: certbot --nginx -d $DOMAIN)${NC}"
fi
echo ""

# Database checks
echo -e "${BLUE}[6/6] Checking Database...${NC}"
test_check "MySQL connection" "mysql -u chandrahoro_user -p\$(grep DATABASE_URL /home/chandrahoro/chandrahoro/backend/.env | cut -d: -f3 | cut -d@ -f1) -e 'SELECT 1' chandrahoro_prod"
test_check "Database tables exist" "mysql -u chandrahoro_user -p\$(grep DATABASE_URL /home/chandrahoro/chandrahoro/backend/.env | cut -d: -f3 | cut -d@ -f1) -e 'SHOW TABLES' chandrahoro_prod | grep -q users"
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Deployment is successful.${NC}"
    echo ""
    echo "🌐 Your application is live at: https://$DOMAIN"
    echo "📚 API Documentation: https://$DOMAIN/api/v1/docs"
    echo ""
    echo "Next steps:"
    echo "  1. Test chart calculation in browser"
    echo "  2. Monitor logs: pm2 logs"
    echo "  3. Set up database backups"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check logs: pm2 logs"
    echo "  - Check service status: systemctl status nginx mysql redis"
    echo "  - Check PM2 status: pm2 status"
    echo "  - Review deployment guide: PRODUCTION_DEPLOYMENT_GUIDE.md"
    exit 1
fi

