-- ============================================================================
-- ChandraHoro/Jyotish Drishti - Database Setup Script
-- ============================================================================
-- This script creates the database and user for ChandraHoro application
-- Run this with your root MySQL credentials
-- ============================================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS chandrahoro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Step 2: Create the dedicated user
-- Note: Using 'chandrahoro' as both username and password for consistency
-- In production, use a strong password: openssl rand -base64 32
CREATE USER IF NOT EXISTS 'chandrahoro'@'localhost' IDENTIFIED BY 'chandrahoro';

-- Step 3: Grant all privileges on the chandrahoro database to the user
GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'localhost';

-- Step 4: Grant privileges for remote connections (optional, for development)
-- Uncomment if you need to connect from other machines
-- CREATE USER IF NOT EXISTS 'chandrahoro'@'%' IDENTIFIED BY 'chandrahoro';
-- GRANT ALL PRIVILEGES ON chandrahoro.* TO 'chandrahoro'@'%';

-- Step 5: Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Step 6: Verify the setup
-- Run these commands to verify everything is set up correctly:
-- SELECT user, host FROM mysql.user WHERE user = 'chandrahoro';
-- SHOW GRANTS FOR 'chandrahoro'@'localhost';
-- USE chandrahoro;
-- SHOW TABLES;

-- ============================================================================
-- Setup Complete!
-- ============================================================================
-- Connection string for backend:
-- mysql+aiomysql://chandrahoro:chandrahoro@localhost:3306/chandrahoro
--
-- Next steps:
-- 1. Run migrations: cd backend && alembic upgrade head
-- 2. Verify tables: mysql -u chandrahoro -p chandrahoro -e "USE chandrahoro; SHOW TABLES;"
-- 3. Start backend: python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
-- ============================================================================

