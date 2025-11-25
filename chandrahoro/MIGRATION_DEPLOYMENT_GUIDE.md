# 🚀 ChandraHoro - Parashara Core Migration Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Code Review ✅
- [x] All new files created successfully
- [x] No syntax errors in Python code
- [x] All imports working correctly
- [x] Models properly defined
- [x] API endpoints updated

### 2. Database Preparation
- [ ] Backup current database
  ```bash
  mysqldump -u chandrahoro -p chandrahoro > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify Alembic migration file exists
  ```bash
  ls -la chandrahoro/backend/alembic/versions/3130c5b24b3a_*.py
  ```
- [ ] Review migration SQL (dry run)
  ```bash
  cd chandrahoro/backend
  python3 -m alembic upgrade head --sql > migration_preview.sql
  cat migration_preview.sql
  ```

### 3. Environment Variables
- [ ] DATABASE_URL configured correctly
- [ ] REDIS_URL configured
- [ ] SECRET_KEY set
- [ ] All environment variables in `.env` file

---

## 🚀 Deployment Steps

### Step 1: Backup Everything
```bash
# Database backup
mysqldump -u chandrahoro -p chandrahoro > backup_before_migration.sql

# Code backup
cd /path/to/chandrahoro
tar -czf backup_code_$(date +%Y%m%d).tar.gz .

# Verify backups
ls -lh backup_*
```

### Step 2: Pull Latest Code
```bash
cd /path/to/chandrahoro
git status  # Check for uncommitted changes
git pull origin main
```

### Step 3: Install Dependencies (if any new)
```bash
cd chandrahoro/backend
pip3 install -r requirements.txt
```

### Step 4: Apply Database Migration
```bash
cd chandrahoro/backend

# Check current migration status
python3 -m alembic current

# Apply migration
python3 -m alembic upgrade head

# Verify migration applied
python3 -m alembic current
# Should show: 3130c5b24b3a (head)
```

### Step 5: Verify Database Schema
```bash
# Connect to MySQL
mysql -u chandrahoro -p chandrahoro

# Check new tables exist
SHOW TABLES;
# Should see: subscriptions, chart_cache, user_requests

# Check new columns in users table
DESCRIBE users;
# Should see: default_ayanamsha, default_house_system, default_chart_style, preferred_methodology

# Check new columns in birth_charts table
DESCRIBE birth_charts;
# Should see: methodology, chart_name

# Exit MySQL
EXIT;
```

### Step 6: Restart Backend Service
```bash
# If using systemd
sudo systemctl restart chandrahoro-backend
sudo systemctl status chandrahoro-backend

# OR if using PM2
pm2 restart chandrahoro-backend
pm2 logs chandrahoro-backend --lines 50

# Check for errors in logs
journalctl -u chandrahoro-backend -f
```

### Step 7: Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Test chart creation (replace YOUR_TOKEN)
curl -X POST http://localhost:8000/api/v1/charts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "birth_date": "1990-01-01",
    "birth_time": "12:00:00",
    "birth_latitude": 28.6139,
    "birth_longitude": 77.2090,
    "birth_timezone": "Asia/Kolkata",
    "birth_location": "New Delhi, India",
    "methodology": "parashara"
  }'

# Test chart retrieval
curl http://localhost:8000/api/v1/charts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 8: Monitor Performance
```bash
# Watch backend logs
journalctl -u chandrahoro-backend -f

# Monitor database connections
mysql -u chandrahoro -p -e "SHOW PROCESSLIST;"

# Check Redis cache
redis-cli
> KEYS *
> INFO stats
> EXIT
```

---

## 🧪 Post-Deployment Testing

### Functional Tests:
- [ ] Create a new chart
- [ ] Verify chart is cached (check chart_cache table)
- [ ] Retrieve chart (should be fast <50ms)
- [ ] List user charts
- [ ] Delete chart
- [ ] Verify subscription limits work
- [ ] Test with different methodologies (currently only parashara)

### Performance Tests:
- [ ] First chart creation: ~500-1000ms ✅
- [ ] Cached chart retrieval: <50ms ✅
- [ ] Database query time: <100ms ✅
- [ ] API response time: <200ms ✅

### Database Tests:
```sql
-- Check subscriptions table
SELECT * FROM subscriptions LIMIT 5;

-- Check chart_cache table
SELECT cache_type, COUNT(*) as count, 
       AVG(calculation_time_ms) as avg_time_ms
FROM chart_cache 
GROUP BY cache_type;

-- Check user_requests table
SELECT request_type, COUNT(*) as count,
       AVG(response_time_ms) as avg_response_ms
FROM user_requests
GROUP BY request_type;

-- Check methodology distribution
SELECT methodology, COUNT(*) as count
FROM birth_charts
GROUP BY methodology;
```

---

## 🔄 Rollback Plan (If Needed)

### If Migration Fails:
```bash
# Rollback migration
cd chandrahoro/backend
python3 -m alembic downgrade -1

# Restore database from backup
mysql -u chandrahoro -p chandrahoro < backup_before_migration.sql

# Restart backend
sudo systemctl restart chandrahoro-backend
```

---

## ✅ Success Criteria

- ✅ Migration applied successfully
- ✅ All new tables created
- ✅ Backend starts without errors
- ✅ Chart creation works with caching
- ✅ Cached charts retrieve in <50ms
- ✅ Subscription limits enforced
- ✅ Usage tracking increments correctly
- ✅ No errors in logs for 24 hours

---

**Deployment Status:** ⏳ **READY TO DEPLOY**

**Estimated Downtime:** < 5 minutes (for migration)

**Risk Level:** 🟢 **LOW** (backward compatible, rollback available)

