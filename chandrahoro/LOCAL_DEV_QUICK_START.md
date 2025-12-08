# ChandraHoro - Local Development Quick Start

## ✅ Setup Complete!

Your local development environment is now running successfully!

## 🌐 Access URLs

- **Frontend (Next.js):** http://localhost:3000
- **Backend API (FastAPI):** http://localhost:8000
- **API Documentation (Swagger):** http://localhost:8000/docs
- **API Documentation (ReDoc):** http://localhost:8000/redoc

## 🚀 Running Servers

### Backend Server (Terminal ID: 12)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Status:** ✅ Running
- Database initialized successfully
- Registered methodologies: ['parashara', 'kp', 'jaimini', 'western']
- Application started

### Frontend Server (Terminal ID: 14)
```bash
cd frontend
npm run dev
```

**Status:** ✅ Running on http://localhost:3000

## 🛠️ Development Commands

### Backend Commands
```bash
# Activate virtual environment
cd backend && source venv/bin/activate

# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Format code
black .
isort .

# Lint code
flake8
mypy .
```

### Frontend Commands
```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Generate Prisma client
npm run db:generate

# Run linter
npm run lint

# Format code
npm run format
```

## 🧪 Testing the API

### Test Backend Health
```bash
curl http://localhost:8000/
```

Expected response:
```json
{"message":"Chandrahoro API","version":"0.1.0","docs":"/docs","status":"operational"}
```

### Test Methodologies Endpoint
```bash
curl http://localhost:8000/api/v1/methodologies/ | jq .
```

### Test Chart Calculation (requires authentication)
```bash
# First, register a user and get a token
# Then use the token to calculate a chart
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "birth_details": {
      "date": "1990-01-01",
      "time": "12:00:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi, India"
    }
  }'
```

## 📦 Services Status

- **MySQL:** ✅ Running on localhost:3306
- **Redis:** ✅ Running on localhost:6379
- **Backend:** ✅ Running on http://0.0.0.0:8000
- **Frontend:** ✅ Running on http://localhost:3000

## 🔧 Troubleshooting

### Backend not starting?
1. Check if virtual environment is activated: `which python` should show `backend/venv/bin/python`
2. Check if all dependencies are installed: `pip list`
3. Check database connection: `mysql -u chandrahoro -p'chandrahoro' chandrahoro`
4. Check Redis: `redis-cli ping`

### Frontend not starting?
1. Check if node_modules are installed: `ls frontend/node_modules`
2. Check Node.js version: `node --version` (should be 18+)
3. Check if .env.local exists: `cat frontend/.env.local`

### Database connection issues?
1. Verify MySQL is running: `brew services list | grep mysql`
2. Test connection: `mysql -u chandrahoro -p'chandrahoro' chandrahoro`
3. Check DATABASE_URL in `backend/.env`

## 📝 Next Steps

Now that your local development environment is running, you can:

1. **Explore the API:** Visit http://localhost:8000/docs
2. **Test the Frontend:** Visit http://localhost:3000
3. **Add New Features:** Start developing your new features!
4. **Run Tests:** Ensure everything works with `pytest` (backend) and `npm test` (frontend)

## 🎉 Happy Coding!

Your ChandraHoro local development environment is ready for feature development!

