# 🚀 Deploy ChandraHoro NOW - Simple Guide

## ⚠️ SSH Issue

SSH port 2222 is not accessible from your local machine. You must use **Hostinger Web Console**.

---

## 📋 Step-by-Step Deployment

### Step 1: Access Hostinger Web Console

1. Open browser and go to: **https://hpanel.hostinger.com/vps**
2. Login with your Hostinger credentials
3. Click on your VPS
4. Look for and click: **"Console"** or **"Web Terminal"** or **"Browser SSH"**
5. A terminal window should open in your browser

---

### Step 2: Run Deployment Script (Part 1)

Copy this ENTIRE command block and paste it into the Hostinger web console:

```bash
curl -fsSL https://raw.githubusercontent.com/ravitadakamalla/chandrahorov2/main/chandrahoro/complete-deployment.sh -o /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh
```

**OR** if that doesn't work, manually copy and paste this script:

```bash
#!/bin/bash
set -e
DOMAIN="jyotishdrishti.valuestream.in"
APP_DIR="/var/www/chandrahoro"
DB_NAME="chandrahoro_prod"
DB_USER="chandrahoro_user"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32)

echo "=== ChandraHoro Deployment Starting ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

# Install Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install Python 3.11
if ! command -v python3.11 &> /dev/null; then
    apt-get install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt-get update -qq
    apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
fi

# Install dependencies
apt-get install -y mysql-server redis-server nginx git curl build-essential libmysqlclient-dev pkg-config

# Install PM2
npm install -g pm2 2>/dev/null || true

# Start services
systemctl start mysql && systemctl enable mysql
systemctl start redis-server && systemctl enable redis-server
systemctl start nginx && systemctl enable nginx

# Configure MySQL
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null || true
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Clone repository
mkdir -p $APP_DIR && cd $APP_DIR
if [ -d ".git" ]; then
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
else
    rm -rf * .* 2>/dev/null || true
    git clone https://github.com/ravitadakamalla/chandrahorov2.git .
fi

# Setup backend
cd $APP_DIR/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel -q
pip install -r requirements.txt -q
FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

cat > .env << EOF
DATABASE_URL=mysql+aiomysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LLM_VAULT_KEY=${FERNET_KEY}
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=http://${DOMAIN},http://localhost:3000
HOST=0.0.0.0
PORT=8000
EOF
chmod 600 .env

alembic upgrade head
deactivate

# Setup frontend
cd $APP_DIR/frontend
npm install -q
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://${DOMAIN}/api
NEXT_PUBLIC_APP_NAME=ChandraHoro
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
npm run build

# Configure PM2
pm2 delete all 2>/dev/null || true
cd $APP_DIR/backend
pm2 start "venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000" --name chandrahoro-backend
cd $APP_DIR/frontend
pm2 start "npm run start" --name chandrahoro-frontend
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🔐 SAVE THESE CREDENTIALS:"
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "Next: Configure Nginx (see Step 3)"
echo ""
```

**IMPORTANT**: When the script finishes, it will display database credentials. **SAVE THEM!**

---

### Step 3: Configure Nginx

After Step 2 completes, run this script:

```bash
#!/bin/bash
set -e
DOMAIN="jyotishdrishti.valuestream.in"

rm -f /etc/nginx/sites-enabled/default

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

    access_log /var/log/nginx/chandrahoro_access.log;
    error_log /var/log/nginx/chandrahoro_error.log;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://chandrahoro_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://chandrahoro_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✓ Nginx configured!"
pm2 status
curl -I http://${DOMAIN}
```

---

### Step 4: Verify Deployment

Run these commands to verify:

```bash
pm2 status
systemctl status nginx
curl http://localhost:8000/health
curl -I http://jyotishdrishti.valuestream.in
```

Then open in your browser:
**http://jyotishdrishti.valuestream.in**

---

## 🆘 If Something Fails

### View logs:
```bash
pm2 logs
tail -50 /var/log/nginx/chandrahoro_error.log
```

### Restart services:
```bash
pm2 restart all
systemctl restart nginx
```

---

## ✅ Success!

If you see your application at http://jyotishdrishti.valuestream.in, deployment is complete!


