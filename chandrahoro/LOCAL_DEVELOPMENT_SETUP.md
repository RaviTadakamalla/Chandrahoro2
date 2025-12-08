# ChandraHoro - Local Development Setup Guide

This guide will help you set up and run the ChandraHoro application on your local development machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **MySQL 8.0+**: [Download MySQL](https://dev.mysql.com/downloads/mysql/)
- **Redis 7+**: [Download Redis](https://redis.io/download) (Optional but recommended)
- **Git**: [Download Git](https://git-scm.com/downloads)

## Quick Start

### Step 1: Clone the Repository (if not already done)

```bash
cd ~/chandrahorov2/chandrahoro
```

### Step 2: Set Up MySQL Database

```bash
# Start MySQL (macOS with Homebrew)
brew services start mysql

# Or on Linux
sudo systemctl start mysql

# Create database and user
mysql -u root -p << 'EOF'
CREATE DATABASE IF NOT EXISTS chandrahoro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'chandrahoro'@'localhost' IDENTIFIED BY 'chandrahoro';
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Step 3: Set Up Redis (Optional but Recommended)

```bash
# macOS with Homebrew
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Or on Linux
sudo systemctl start redis
```

### Step 4: Set Up Backend (FastAPI)

```bash
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR on Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install flatlib sidereal branch (required for KP calculations)
pip install git+https://github.com/diliprk/flatlib.git@sidereal#egg=flatlib

# Verify .env file exists (already configured)
cat .env

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### Step 5: Set Up Frontend (Next.js)

Open a **NEW terminal window** and run:

```bash
cd ~/chandrahorov2/chandrahoro/frontend

# Install dependencies
npm install

# Verify .env.local file exists (already configured)
cat .env.local

# Generate Prisma client
npm run db:generate

# Start the frontend development server
npm run dev
```

The frontend will be available at:
- **Application**: http://localhost:3000

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/
# Expected: {"message":"Chandrahoro API","version":"0.1.0","docs":"/docs","status":"operational"}

curl http://localhost:8000/api/health
# Expected: {"status":"healthy"}
```

### 2. Check Frontend

Open your browser and navigate to:
- http://localhost:3000

You should see the ChandraHoro home page.

### 3. Test API Connection

```bash
# Test methodologies endpoint
curl http://localhost:8000/api/v1/methodologies/
```

## Development Workflow

### Running Both Services

You'll need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd ~/chandrahorov2/chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd ~/chandrahorov2/chandrahoro/frontend
npm run dev
```

### Stopping Services

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **MySQL**: `brew services stop mysql` (macOS) or `sudo systemctl stop mysql` (Linux)
- **Redis**: `brew services stop redis` (macOS) or `sudo systemctl stop redis` (Linux)

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
```

**Database connection error:**
```bash
# Verify MySQL is running
mysql -u chandrahoro -p'chandrahoro' -e "SELECT 1;"

# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL
```

### Frontend Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Module not found errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Once both services are running:

1. **Register a user**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Create a chart**: Navigate to the dashboard and create your first chart
4. **Explore API docs**: http://localhost:8000/docs

## Development Tips

- **Hot Reload**: Both backend and frontend support hot reload - changes will be reflected automatically
- **API Testing**: Use the Swagger UI at http://localhost:8000/docs for interactive API testing
- **Database GUI**: Use tools like MySQL Workbench or DBeaver to inspect the database
- **Redis GUI**: Use RedisInsight to inspect Redis cache

## Support

If you encounter any issues, check:
- Backend logs in the terminal
- Frontend logs in the browser console (F12)
- MySQL logs: `tail -f /usr/local/var/mysql/*.err` (macOS)

