# Database Setup Guide - ChandraHoro/Jyotish Drishti

---

## 🗄️ MYSQL INSTALLATION

### macOS (Homebrew)
```bash
# Install MySQL 8.0
brew install mysql@8.0

# Start MySQL service
brew services start mysql@8.0

# Verify installation
mysql --version
mysql -u root -p
```

### macOS (Docker)
```bash
# Pull MySQL image
docker pull mysql:8.0

# Run container
docker run --name chandrahoro-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=chandrahoro \
  -e MYSQL_USER=chandrahoro \
  -e MYSQL_PASSWORD=chandrahoro \
  -p 3306:3306 \
  -d mysql:8.0

# Verify
docker ps
```

### Linux (Ubuntu/Debian)
```bash
# Install MySQL
sudo apt-get update
sudo apt-get install mysql-server

# Start service
sudo systemctl start mysql

# Verify
mysql --version
```

### Windows
1. Download MySQL installer from https://dev.mysql.com/downloads/mysql/
2. Run installer
3. Follow setup wizard
4. Start MySQL service

---

## 🔐 DATABASE & USER SETUP

### Step 1: Connect to MySQL
```bash
mysql -u root -p
# Enter root password (or leave blank if no password set)
```

### Step 2: Create Database
```sql
CREATE DATABASE chandrahoro;
```

### Step 3: Create User
```sql
CREATE USER 'chandrahoro'@'localhost' IDENTIFIED BY 'chandrahoro';
```

### Step 4: Grant Permissions
```sql
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';
FLUSH PRIVILEGES;
```

### Step 5: Verify Setup
```sql
-- Check database exists
SHOW DATABASES;

-- Check user exists
SELECT user, host FROM mysql.user;

-- Exit
EXIT;
```

---

## 🔄 DATABASE MIGRATIONS

### Step 1: Install Alembic (if not already installed)
```bash
cd backend
pip install alembic
```

### Step 2: Initialize Alembic (if not already done)
```bash
alembic init alembic
```

### Step 3: Configure Alembic
Edit `backend/alembic.ini`:
```ini
sqlalchemy.url = mysql+pymysql://chandrahoro:chandrahoro@localhost/chandrahoro
```

### Step 4: Run Migrations
```bash
# Apply all migrations
alembic upgrade head

# Check migration status
alembic current

# Verify tables created
mysql -u chandrahoro -p chandrahoro
USE chandrahoro;
SHOW TABLES;
```

---

## 📊 VERIFY DATABASE CONNECTION

### Method 1: MySQL CLI
```bash
mysql -u chandrahoro -p chandrahoro -h localhost
USE chandrahoro;
SHOW TABLES;
```

### Method 2: Python Script
```python
from sqlalchemy import create_engine, inspect

engine = create_engine('mysql+pymysql://chandrahoro:chandrahoro@localhost/chandrahoro')
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables: {tables}")
```

### Method 3: Backend Logs
```bash
# Start backend and check logs
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Look for: "Database initialized successfully"
# NOT: "Database initialization failed"
```

---

## 🌱 SEED TEST DATA

### Option 1: Automatic Seeding
```bash
cd backend
python3 scripts/seed_data.py
```

### Option 2: Manual SQL
```sql
-- Create test user
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('test@example.com', 'hashed_password', 'Test User', 'individual');

-- Create test chart
INSERT INTO birth_charts (user_id, birth_date, birth_time, latitude, longitude, timezone, location_name)
VALUES (1, '1980-01-01', '12:00:00', 19.076, 72.8777, 'Asia/Kolkata', 'Mumbai');
```

---

## 🔧 TROUBLESHOOTING

### Issue: "Access denied for user 'chandrahoro'@'localhost'"
**Solution:**
```bash
# Check MySQL is running
brew services list

# Restart MySQL
brew services restart mysql@8.0

# Verify credentials
mysql -u chandrahoro -p chandrahoro
```

### Issue: "Can't connect to MySQL server"
**Solution:**
```bash
# Check if MySQL is running
ps aux | grep mysql

# Start MySQL
brew services start mysql@8.0

# Check port 3306 is listening
lsof -i :3306
```

### Issue: "Database 'chandrahoro' doesn't exist"
**Solution:**
```bash
# Create database
mysql -u root -p
CREATE DATABASE chandrahoro;
```

### Issue: "Permission denied" on migrations
**Solution:**
```bash
# Check user permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📋 VERIFICATION CHECKLIST

- [ ] MySQL installed and running
- [ ] Database 'chandrahoro' created
- [ ] User 'chandrahoro' created
- [ ] User has all permissions
- [ ] Can connect: `mysql -u chandrahoro -p chandrahoro`
- [ ] Alembic configured
- [ ] Migrations applied: `alembic upgrade head`
- [ ] Tables created: `SHOW TABLES;`
- [ ] Backend starts without database error
- [ ] Test data seeded (optional)

---

## 🚀 NEXT STEPS

After database setup:

1. **Restart Backend**
   ```bash
   cd backend
   python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Verify Connection**
   - Check logs for "Database initialized successfully"
   - No "Database initialization failed" warning

3. **Test Data Persistence**
   - Create a chart
   - Restart backend
   - Chart should still exist

4. **Run Tests**
   ```bash
   cd backend
   pytest tests/ -v
   ```

---

## 📊 DATABASE SCHEMA

**Main Tables:**
- `users` - User accounts
- `birth_charts` - Birth chart data
- `strength_profiles` - Strength attributes
- `calibration_entries` - Calibration data
- `journal_entries` - Journal entries
- `profile_links` - Multi-profile relationships
- `organizations` - Corporate accounts
- `candidates` - Job candidates
- `teams` - Team data
- `research_sessions` - Research data

---

## 🔒 SECURITY NOTES

1. **Change Default Password**
   ```bash
   mysql -u chandrahoro -p
   ALTER USER 'chandrahoro'@'localhost' IDENTIFIED BY 'strong_password';
   ```

2. **Backup Database**
   ```bash
   mysqldump -u chandrahoro -p chandrahoro > backup.sql
   ```

3. **Restore Database**
   ```bash
   mysql -u chandrahoro -p chandrahoro < backup.sql
   ```

---

## ✅ SUCCESS INDICATORS

✅ Backend starts without database errors
✅ Can query tables: `SELECT COUNT(*) FROM users;`
✅ Data persists after restart
✅ All migrations applied successfully
✅ Test data accessible

