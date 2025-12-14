#!/bin/bash

# AI Reports Feature Deployment Script
# Deploys the new AI reports management system to VPS

set -e

echo "🚀 Starting AI Reports Feature Deployment..."

# VPS connection details
VPS_HOST="72.61.174.232"
VPS_USER="chandrahoro"
VPS_PASSWORD="Haritha#12Tadaka"
PROJECT_DIR="/home/chandrahoro/chandrahoro"

echo "📡 Connecting to VPS and deploying..."

# Execute deployment commands on VPS
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o PubkeyAuthentication=no $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

echo "📂 Navigating to project directory..."
cd /home/chandrahoro/chandrahoro

echo "🔄 Pulling latest code from GitHub..."
git pull origin main

echo "🐍 Activating Python virtual environment..."
cd chandrahoro/backend
source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
alembic upgrade head

echo "🔄 Restarting backend service..."
sudo systemctl restart chandrahoro-backend
sleep 3

echo "✅ Backend service status:"
sudo systemctl status chandrahoro-backend --no-pager | head -10

echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build

echo "🔄 Restarting frontend service..."
pm2 restart chandrahoro-frontend

echo "✅ Frontend service status:"
pm2 list | grep chandrahoro

echo "🎉 Deployment completed successfully!"
echo "🌐 Service available at: https://jyotishdrishti.valuestream.in"

ENDSSH

echo "✅ Deployment script finished!"
echo ""
echo "📝 New Features Deployed:"
echo "  ✓ HTML-only AI report output"
echo "  ✓ Auto-save reports to database"
echo "  ✓ My Reports page (/my-reports)"
echo "  ✓ Download reports as HTML files"
echo "  ✓ Report versioning and regeneration"
echo "  ✓ Persistent storage across logins"
echo ""
echo "🔍 To verify:"
echo "  1. Visit https://jyotishdrishti.valuestream.in"
echo "  2. Generate an AI chart interpretation"
echo "  3. Click 'Download' to save as HTML"
echo "  4. Navigate to 'My Reports' from the menu"
echo "  5. Verify reports are persisted after logout/login"
