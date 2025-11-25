# 🎯 Phase 1 Implementation Guide: Authentication & Persistence

**Objective:** Implement user authentication and chart persistence to enable end-to-end workflow  
**Duration:** 4-6 hours  
**Priority:** CRITICAL  
**Status:** Ready to implement

---

## 🎯 Phase 1 Overview

### What We're Building
1. **User Authentication System**
   - Login/Register pages
   - JWT token management
   - Protected routes
   - Session persistence

2. **Chart Persistence System**
   - Save charts to database
   - Retrieve saved charts
   - Chart management UI
   - Data integrity

### Why It's Critical
- ✅ Enables end-to-end workflow testing
- ✅ Allows data persistence
- ✅ Blocks Phase 2 (Bug Fixes)
- ✅ Required for production

---

## 📋 Task Breakdown

### Task 1.1: Frontend Authentication (2-3 hours)

**Files to Create:**
1. `frontend/src/pages/login.tsx` - Login page
2. `frontend/src/pages/register.tsx` - Register page
3. `frontend/src/components/ProtectedRoute.tsx` - Route protection

**Files to Modify:**
1. `frontend/src/lib/api.ts` - Add JWT handling
2. `frontend/src/pages/index.tsx` - Require authentication
3. `frontend/src/pages/_app.tsx` - Add auth context (optional)

**Key Features:**
- Email/password login
- Email/password registration
- JWT token storage
- Token refresh handling
- Redirect to login on 401
- Protected routes

**Testing:**
```bash
# Test register
curl -X POST http://localhost:3000/register

# Test login
curl -X POST http://localhost:3000/login

# Test protected route
curl -X GET http://localhost:3000 \
  -H "Authorization: Bearer <token>"
```

---

### Task 1.2: Backend Chart Persistence (1-2 hours)

**Files to Modify:**
1. `backend/app/api/v1/chart.py` - Save chart to DB
2. `backend/app/api/v1/charts.py` - Verify CRUD endpoints

**Key Changes:**
- Modify `/chart/calculate` to save to database
- Return chart ID in response
- Require authentication
- Store chart data as JSON

**Endpoints to Verify:**
```
POST   /api/v1/charts              - Create chart
GET    /api/v1/charts              - List charts
GET    /api/v1/charts/{id}         - Get chart
PUT    /api/v1/charts/{id}         - Update chart
DELETE /api/v1/charts/{id}         - Delete chart
POST   /api/v1/chart/calculate     - Calculate & save
```

**Testing:**
```bash
# Create chart
curl -X POST http://localhost:8000/api/v1/charts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...chart_data...}'

# List charts
curl -X GET http://localhost:8000/api/v1/charts \
  -H "Authorization: Bearer <token>"

# Get chart
curl -X GET http://localhost:8000/api/v1/charts/{id} \
  -H "Authorization: Bearer <token>"
```

---

### Task 1.3: Frontend Chart Persistence (1 hour)

**Files to Modify:**
1. `frontend/src/pages/index.tsx` - Save chart after calculation
2. `frontend/src/pages/chart/result.tsx` - Load from database
3. `frontend/src/lib/api.ts` - Add chart endpoints

**Files to Create:**
1. `frontend/src/pages/chart/my-charts.tsx` - Chart list page

**Key Features:**
- Save chart after calculation
- Load chart from database
- Display saved charts
- Delete charts
- Edit charts

**Testing:**
```bash
# Create chart
POST /api/v1/chart/calculate

# Verify saved
SELECT * FROM birth_charts WHERE user_id = '<user_id>';

# Retrieve chart
GET /api/v1/charts/{id}

# Verify data matches
```

---

## 🔄 Implementation Workflow

### Step 1: Verify Backend (15 minutes)
```bash
# Check auth endpoints
curl -s http://localhost:8000/docs | grep -i auth

# Check chart endpoints
curl -s http://localhost:8000/docs | grep -i chart

# Test health
curl -s http://localhost:8000/api/v1/health
```

### Step 2: Create Login Page (30 minutes)
```bash
# Create file
touch frontend/src/pages/login.tsx

# Add form with email/password
# Add submit handler
# Add error handling
# Add redirect to home on success
```

### Step 3: Create Register Page (30 minutes)
```bash
# Create file
touch frontend/src/pages/register.tsx

# Add form with email/password/confirm
# Add submit handler
# Add validation
# Add auto-login after registration
```

### Step 4: Update API Client (30 minutes)
```bash
# Modify frontend/src/lib/api.ts
# Add JWT token to requests
# Add 401 error handling
# Add login/register methods
# Add chart CRUD methods
```

### Step 5: Create Protected Routes (30 minutes)
```bash
# Create frontend/src/components/ProtectedRoute.tsx
# Check for JWT token
# Redirect to login if missing
# Wrap protected pages
```

### Step 6: Update Home Page (30 minutes)
```bash
# Modify frontend/src/pages/index.tsx
# Require authentication
# Show login prompt if not authenticated
# Save chart to database after calculation
```

### Step 7: Create Chart List Page (30 minutes)
```bash
# Create frontend/src/pages/chart/my-charts.tsx
# List user's saved charts
# Add delete/edit buttons
# Link to chart detail
```

### Step 8: Test End-to-End (1 hour)
```bash
# Register user
# Login
# Create chart
# Verify saved
# Retrieve chart
# Test persistence
```

---

## 🧪 Testing Checklist

### Authentication Testing
- [ ] Register new user
- [ ] Verify user created in database
- [ ] Login with credentials
- [ ] Verify JWT token stored
- [ ] Verify token sent with requests
- [ ] Test 401 error handling
- [ ] Test logout functionality

### Chart Persistence Testing
- [ ] Create chart
- [ ] Verify saved to database
- [ ] Retrieve chart
- [ ] Verify data matches
- [ ] Update chart
- [ ] Delete chart
- [ ] Test after backend restart

### End-to-End Testing
- [ ] Register → Login → Create Chart → Verify Saved
- [ ] Login → View Saved Charts → Edit Chart
- [ ] Login → Delete Chart → Verify Deleted
- [ ] Logout → Redirect to Login

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Login page working | ✅ | ⏳ |
| Register page working | ✅ | ⏳ |
| JWT token stored | ✅ | ⏳ |
| Charts saved to DB | ✅ | ⏳ |
| Charts retrieved from DB | ✅ | ⏳ |
| End-to-end workflow | ✅ | ⏳ |
| Data persists | ✅ | ⏳ |
| No errors | ✅ | ⏳ |

---

## 🚀 Next Steps After Phase 1

Once Phase 1 is complete:
1. Move to Phase 2: Bug Fixes & Error Handling
2. Implement form validation
3. Implement error handling
4. Test edge cases
5. Optimize performance

---

## 📞 Resources

- **Backend Auth:** `backend/app/api/v1/auth.py`
- **Backend Charts:** `backend/app/api/v1/charts.py`
- **Frontend API:** `frontend/src/lib/api.ts`
- **Database Schema:** `backend/alembic/versions/001_initial_schema.py`

---

## ⏱️ Time Estimate

| Task | Time | Status |
|------|------|--------|
| 1.1 Frontend Auth | 2-3 hrs | ⏳ |
| 1.2 Backend Persistence | 1-2 hrs | ⏳ |
| 1.3 E2E Testing | 1 hr | ⏳ |
| **Total** | **4-6 hrs** | **⏳** |

---

*Ready to implement Phase 1? Let's build! 🚀*

