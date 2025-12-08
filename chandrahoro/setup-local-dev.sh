#!/bin/bash

# ChandraHoro Local Development Setup Script
# This script sets up the complete local development environment

set -e  # Exit on error

echo "=========================================="
echo "ChandraHoro Local Development Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION found"
else
    print_error "Python 3.11+ is required but not found"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION found"
else
    print_error "Node.js 18+ is required but not found"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_success "MySQL found"
else
    print_error "MySQL is required but not found"
    echo "Install MySQL: https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Check Redis (optional)
if command -v redis-cli &> /dev/null; then
    print_success "Redis found"
else
    print_info "Redis not found (optional but recommended)"
fi

echo ""
echo "Step 2: Setting up MySQL database..."
echo ""

# Create database and user
mysql -u root -p << 'EOF' || print_info "Database may already exist"
CREATE DATABASE IF NOT EXISTS chandrahoro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chandrahoro'@'localhost' IDENTIFIED BY 'chandrahoro';
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Database setup complete"

echo ""
echo "Step 3: Setting up backend..."
echo ""

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
print_info "Installing Python dependencies (this may take a few minutes)..."
pip install -r requirements.txt --quiet

# Install flatlib sidereal branch
print_info "Installing flatlib sidereal branch..."
pip install git+https://github.com/diliprk/flatlib.git@sidereal#egg=flatlib --quiet

print_success "Backend dependencies installed"

# Run database migrations
print_info "Running database migrations..."
alembic upgrade head || print_info "Migrations may have already been applied"

print_success "Backend setup complete"

cd ..

echo ""
echo "Step 4: Setting up frontend..."
echo ""

cd frontend

# Install dependencies
print_info "Installing Node.js dependencies (this may take a few minutes)..."
npm install --silent

# Generate Prisma client
print_info "Generating Prisma client..."
npm run db:generate --silent

print_success "Frontend setup complete"

cd ..

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd $SCRIPT_DIR/backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd $SCRIPT_DIR/frontend"
echo "  npm run dev"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "=========================================="

