# 🚀 Quick Start: Phase 1 - Authentication & Persistence

**Status:** Ready to implement  
**Estimated Time:** 4-6 hours  
**Priority:** CRITICAL

---

## 📋 What Needs to Be Done

### Task 1.1: Implement User Authentication (2-3 hours)

**Frontend Changes:**
1. Create `frontend/src/pages/login.tsx`
   - Email/password form
   - Submit to `/api/v1/auth/login`
   - Store JWT token in localStorage
   - Redirect to home on success

2. Create `frontend/src/pages/register.tsx`
   - Email/password/confirm password form
   - Submit to `/api/v1/auth/register`
   - Auto-login after registration
   - Redirect to home

3. Update `frontend/src/lib/api.ts`
   - Add JWT token to all requests
   - Handle 401 errors (redirect to login)
   - Refresh token if expired

4. Create `frontend/src/components/ProtectedRoute.tsx`
   - Check for JWT token
   - Redirect to login if missing
   - Wrap protected pages

5. Update `frontend/src/pages/index.tsx`
   - Require authentication
   - Show login prompt if not authenticated

**Backend Status:**
- ✅ `/api/v1/auth/register` endpoint exists
- ✅ `/api/v1/auth/login` endpoint exists
- ✅ JWT token generation working
- ✅ Password hashing with bcrypt

---

### Task 1.2: Implement Chart Persistence (1-2 hours)

**Backend Changes:**
1. Modify `backend/app/api/v1/chart.py`
   - Update `/chart/calculate` endpoint
   - Save chart to database after calculation
   - Return chart ID in response
   - Require authentication

2. Verify `backend/app/api/v1/charts.py`
   - POST `/charts` - Create chart ✅
   - GET `/charts` - List charts ✅
   - GET `/charts/{id}` - Get chart ✅
   - PUT `/charts/{id}` - Update chart ✅
   - DELETE `/charts/{id}` - Delete chart ✅

**Frontend Changes:**
1. Update `frontend/src/pages/index.tsx`
   - After chart calculation, save to database
   - Store chart ID instead of just data
   - Redirect to chart detail page

2. Update `frontend/src/pages/chart/result.tsx`
   - Load chart from database if ID provided
   - Display saved chart data
   - Show save/update options

3. Create `frontend/src/pages/chart/my-charts.tsx`
   - List user's saved charts
   - Allow delete/edit
   - Link to chart detail

---

### Task 1.3: Test End-to-End Workflow (1 hour)

**Manual Testing Steps:**
1. Register new user
   - Go to http://localhost:3000/register
   - Enter email, password, confirm password
   - Click register
   - Verify user created in database

2. Login with credentials
   - Go to http://localhost:3000/login
   - Enter email and password
   - Click login
   - Verify JWT token stored in localStorage

3. Create birth chart
   - Go to http://localhost:3000
   - Fill birth details form
   - Select location from autocomplete
   - Click "Generate Chart"
   - Verify chart calculated and displayed

4. Verify data saved
   - Check database: `SELECT * FROM birth_charts WHERE user_id = '<user_id>';`
   - Verify chart data stored
   - Verify user_id matches

5. Retrieve saved chart
   - Refresh page
   - Chart should still display
   - Data should load from database

6. Test persistence after restart
   - Restart backend: `cd backend && python3 -m uvicorn app.main:app --reload`
   - Refresh frontend
   - Chart should still display
   - Data should load from database

---

## 🔧 Implementation Order

### Step 1: Backend (30 minutes)
```bash
# Verify auth endpoints exist
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Verify chart endpoints exist
curl -X GET http://localhost:8000/api/v1/charts \
  -H "Authorization: Bearer <token>"
```

### Step 2: Frontend Authentication (1-2 hours)
1. Create login page
2. Create register page
3. Update API client with JWT handling
4. Create protected route component
5. Update home page to require auth

### Step 3: Frontend Chart Persistence (1 hour)
1. Update chart calculation to save to DB
2. Update chart display to load from DB
3. Create my-charts page
4. Add chart management UI

### Step 4: Testing (1 hour)
1. Register user
2. Login
3. Create chart
4. Verify saved
5. Test persistence

---

## 📝 Code Templates

### Login Page Template
```typescript
// frontend/src/pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.access_token);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
```

### API Client Update Template
```typescript
// frontend/src/lib/api.ts
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return response.json();
  },

  login(email: string, password: string) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
```

---

## ✅ Verification Checklist

- [ ] Login page created and working
- [ ] Register page created and working
- [ ] JWT token stored in localStorage
- [ ] Token sent with API requests
- [ ] Protected routes working
- [ ] Chart saved to database
- [ ] Chart retrieved from database
- [ ] End-to-end workflow tested
- [ ] Data persists after restart
- [ ] No errors in browser console
- [ ] No errors in backend logs

---

## 🎯 Success Criteria

✅ Users can register and login  
✅ Charts are saved to database  
✅ Charts can be retrieved from database  
✅ End-to-end workflow works  
✅ Data persists after backend restart  

---

## 📞 Need Help?

Check these files:
- `NEXT_DEVELOPMENT_TASKS.md` - Full action plan
- `INTEGRATION_TESTING_REPORT.md` - Test results
- `DATABASE_SETUP_COMPLETE.md` - Database info
- `TESTING_AND_NEXT_STEPS_SUMMARY.md` - Executive summary

---

*Ready to start Phase 1? Let's go! 🚀*

