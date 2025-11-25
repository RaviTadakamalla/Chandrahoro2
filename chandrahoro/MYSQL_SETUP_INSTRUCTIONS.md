# MySQL Database Setup Instructions - ChandraHoro/Jyotish Drishti

**Date:** October 23, 2025  
**Status:** Step-by-step setup guide for existing MySQL installation

---

## 📋 PREREQUISITES

✅ MySQL 8.0+ installed locally  
✅ Root credentials: `root` / `Haritha#12`  
✅ Backend code ready at `/Users/ravitadakamalla/chandrahoro/backend`

---

## 🚀 STEP 1: CREATE DATABASE & USER (5 minutes)

### Option A: Using MySQL CLI (Recommended)

**Step 1.1: Connect to MySQL with root credentials**
```bash
mysql -u root -p
# Enter password: Haritha#12
```

**Step 1.2: Run the setup SQL commands**

Copy and paste the following commands one by one:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS chandrahoro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create the dedicated user
CREATE USER IF NOT EXISTS 'chandrahoro'@'localhost' IDENTIFIED BY 'chandrahoro';

-- Grant all privileges
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify setup
SELECT user, host FROM mysql.user WHERE user = 'chandrahoro';
SHOW GRANTS FOR 'chandrahoro'@'localhost';
```

**Expected Output:**
```
Query OK, 1 row affected (0.01 sec)
Query OK, 0 rows affected (0.01 sec)
Query OK, 0 rows affected (0.00 sec)
Query OK, 0 rows affected (0.00 sec)
```

**Step 1.3: Exit MySQL**
```sql
EXIT;
```

---

### Option B: Using SQL Script File

**Step 1.1: Run the provided SQL script**
```bash
mysql -u root -p < DATABASE_SETUP.sql
# Enter password: Haritha#12
```

**Step 1.2: Verify the setup**
```bash
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user = 'chandrahoro';"
# Enter password: Haritha#12
```

---

## ✅ STEP 2: VERIFY DATABASE CONNECTION (5 minutes)

### Test 1: Connect with new user credentials
```bash
mysql -u chandrahoro -p chandrahoro -h localhost
```

**Expected:** MySQL prompt appears without errors

### Test 2: Check database exists
```bash
mysql -u chandrahoro -p chandrahoro -e "SHOW DATABASES;"
# Enter password: chandrahoro
```

**Expected Output:**
```
+--------------------+
| Database           |
+--------------------+
| chandrahoro        |
| information_schema |
+--------------------+
```

### Test 3: Verify user permissions
```bash
mysql -u chandrahoro -p chandrahoro -e "SHOW GRANTS FOR 'chandrahoro'@'localhost';"
# Enter password: chandrahoro
```

**Expected Output:**
```
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost'
```

---

## 🔧 STEP 3: CONFIGURE BACKEND (5 minutes)

### Step 3.1: Verify .env file exists
```bash
ls -la backend/.env
```

**Expected:** File exists at `backend/.env`

### Step 3.2: Verify database connection string
```bash
grep DATABASE_URL backend/.env
```

**Expected Output:**
```
DATABASE_URL=mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro
```

### Step 3.3: Verify Alembic configuration
```bash
grep "sqlalchemy.url" backend/alembic.ini
```

**Note:** If alembic.ini is empty, that's OK - it uses env.py instead

---

## 🗄️ STEP 4: RUN DATABASE MIGRATIONS (10 minutes)

### Step 4.1: Navigate to backend directory
```bash
cd /Users/ravitadakamalla/chandrahoro/backend
```

### Step 4.2: Check Alembic status
```bash
alembic current
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl MySQLImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
```

### Step 4.3: Run migrations
```bash
alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl MySQLImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.migration] Running upgrade  -> 001, Initial schema creation
```

### Step 4.4: Verify tables created
```bash
mysql -u chandrahoro -p chandrahoro -e "USE chandrahoro; SHOW TABLES;"
# Enter password: chandrahoro
```

**Expected Output (20+ tables):**
```
+---------------------------+
| Tables_in_chandrahoro     |
+---------------------------+
| users                     |
| permissions               |
| role_permissions          |
| birth_charts              |
| strength_profiles         |
| calibration_entries       |
| journal_entries           |
| profile_links             |
| organizations             |
| candidates                |
| teams                     |
| research_sessions         |
| ... (more tables)         |
+---------------------------+
```

---

## 🧪 STEP 5: TEST BACKEND CONNECTION (5 minutes)

### Step 5.1: Stop any running backend
```bash
# If backend is running, press Ctrl+C in the terminal
```

### Step 5.2: Start backend with fresh connection
```bash
cd /Users/ravitadakamalla/chandrahoro/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 5.3: Check logs for success message
**Look for:**
```
Database initialized successfully
Application started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**NOT:**
```
Database initialization failed
```

### Step 5.4: Test API endpoint
```bash
curl http://localhost:8000/api/v1/health
```

**Expected Response:**
```json
{"status": "healthy", "api_version": "v1"}
```

---

## 📊 STEP 6: VERIFY COMPLETE SETUP (5 minutes)

### Checklist:
- [ ] Database `chandrahoro` created
- [ ] User `chandrahoro` created with password `chandrahoro`
- [ ] User has ALL PRIVILEGES on chandrahoro database
- [ ] Can connect: `mysql -u chandrahoro -p chandrahoro`
- [ ] Alembic migrations ran successfully
- [ ] 20+ tables created in database
- [ ] Backend starts without database errors
- [ ] API health check returns 200

---

## 🔍 TROUBLESHOOTING

### Issue: "Access denied for user 'chandrahoro'@'localhost'"

**Solution:**
```bash
# Verify user exists
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user = 'chandrahoro';"

# If not found, create user again
mysql -u root -p < DATABASE_SETUP.sql
```

---

### Issue: "Can't connect to MySQL server on 'localhost'"

**Solution:**
```bash
# Check if MySQL is running
ps aux | grep mysql

# Start MySQL (macOS)
brew services start mysql@8.0

# Or restart
brew services restart mysql@8.0
```

---

### Issue: "Unknown database 'chandrahoro'"

**Solution:**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE chandrahoro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### Issue: "Alembic upgrade fails"

**Solution:**
```bash
# Check migration status
alembic current

# Try upgrade with verbose output
alembic upgrade head -v

# If stuck, check for syntax errors
alembic revision --autogenerate -m "check"
```

---

## 📈 NEXT STEPS

After successful setup:

1. **Seed test data (optional)**
   ```bash
   cd backend
   python3 scripts/seed_data.py
   ```

2. **Run tests**
   ```bash
   pytest tests/ -v
   ```

3. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test complete flow**
   - Open http://localhost:3000
   - Create a birth chart
   - Verify data persists after restart

---

## 📞 QUICK REFERENCE

**MySQL Connection:**
```bash
mysql -u chandrahoro -p chandrahoro -h localhost
```

**Backend Connection String:**
```
mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro
```

**Check Tables:**
```bash
mysql -u chandrahoro -p chandrahoro -e "USE chandrahoro; SHOW TABLES;"
```

**Backup Database:**
```bash
mysqldump -u chandrahoro -p chandrahoro chandrahoro > backup.sql
```

**Restore Database:**
```bash
mysql -u chandrahoro -p chandrahoro chandrahoro < backup.sql
```

---

## ✅ SUCCESS INDICATORS

✅ Backend logs show "Database initialized successfully"  
✅ No "Database initialization failed" warnings  
✅ API health check returns 200  
✅ Can query tables: `SELECT COUNT(*) FROM users;`  
✅ Data persists after backend restart

---

**Total Setup Time:** ~30 minutes  
**Status:** Ready for testing and development

