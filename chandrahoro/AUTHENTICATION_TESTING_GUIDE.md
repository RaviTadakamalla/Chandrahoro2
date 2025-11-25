# 🧪 Authentication Testing Guide

**Quick reference for testing the new authentication system with guest mode**

---

## 🚀 Quick Start

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- MySQL database running with `chandrahoro` database
- Backend `.env` has `ALLOW_GUEST_MODE=true`

---

## 📝 Test Scenarios

### Scenario 1: Guest Mode (Demo)

**Objective:** Test guest mode functionality

**Steps:**
1. Open http://localhost:3000/login
2. Click "Continue as Guest (Demo Mode)" button
3. Should redirect to home page
4. Should see amber banner: "Demo Mode: You're using guest mode..."
5. Generate a chart with sample data
6. Check browser console: `localStorage.getItem('currentChart')` should have data
7. Refresh page - chart data should persist in localStorage

**Expected Results:**
- ✅ Guest mode banner visible
- ✅ Can generate charts
- ✅ Charts stored in localStorage
- ✅ No database entries created

---

### Scenario 2: User Registration

**Objective:** Test new user registration

**Steps:**
1. Open http://localhost:3000/register
2. Fill in form:
   - Email: `testuser@example.com`
   - Username: `testuser123`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
   - Full Name: `Test User` (optional)
3. Click "Create Account"
4. Should see success message
5. Should redirect to home page
6. Should NOT see guest mode banner

**Expected Results:**
- ✅ User created in database
- ✅ Auto-login after registration
- ✅ JWT token stored in localStorage
- ✅ User info stored in localStorage
- ✅ Redirected to home page

**Verify in Database:**
```sql
SELECT * FROM users WHERE email = 'testuser@example.com';
```

---

### Scenario 3: User Login

**Objective:** Test user login

**Steps:**
1. Open http://localhost:3000/login
2. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `TestPassword123`
3. Click "Sign In"
4. Should redirect to home page
5. Should NOT see guest mode banner

**Expected Results:**
- ✅ JWT token stored in localStorage
- ✅ User info stored in localStorage
- ✅ Redirected to home page
- ✅ Can access protected features

---

### Scenario 4: Chart Persistence (Authenticated)

**Objective:** Test chart saving to database

**Steps:**
1. Login with registered account (from Scenario 2 or 3)
2. Generate a chart with sample data
3. Check response: should include `chart_id`
4. Check browser console: `localStorage.getItem('currentChart')` should have data
5. Refresh page - chart data should still be available

**Expected Results:**
- ✅ Chart saved to database
- ✅ `chart_id` returned in response
- ✅ Message: "Chart calculated and saved successfully"
- ✅ Database entry created

**Verify in Database:**
```sql
SELECT id, user_id, name, birth_date FROM birth_charts 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com');
```

---

### Scenario 5: Chart Persistence (Guest)

**Objective:** Test chart handling in guest mode

**Steps:**
1. Continue as guest (Scenario 1)
2. Generate a chart
3. Check response: should NOT include `chart_id`
4. Check message: "Chart calculated successfully" (not "saved")
5. Check database: no entry should be created

**Expected Results:**
- ✅ Chart NOT saved to database
- ✅ No `chart_id` in response
- ✅ Chart stored in localStorage only
- ✅ No database entries created

**Verify in Database:**
```sql
SELECT COUNT(*) FROM birth_charts;
-- Should be same as before chart generation
```

---

### Scenario 6: Logout

**Objective:** Test logout functionality

**Steps:**
1. Login with registered account
2. Click logout button (in navigation)
3. Should redirect to login page
4. Check localStorage: tokens should be cleared
5. Try to access protected page: should redirect to login

**Expected Results:**
- ✅ Tokens cleared from localStorage
- ✅ User info cleared
- ✅ Redirected to login page
- ✅ Cannot access protected pages

---

### Scenario 7: Invalid Credentials

**Objective:** Test error handling for invalid login

**Steps:**
1. Open http://localhost:3000/login
2. Enter invalid credentials:
   - Email: `nonexistent@example.com`
   - Password: `WrongPassword123`
3. Click "Sign In"
4. Should see error message

**Expected Results:**
- ✅ Error message displayed
- ✅ Not redirected
- ✅ Can retry login

---

### Scenario 8: Password Validation

**Objective:** Test password validation on registration

**Steps:**
1. Open http://localhost:3000/register
2. Try to register with short password (< 8 chars)
3. Should see error: "Password must be at least 8 characters long"
4. Try with mismatched passwords
5. Should see error: "Passwords do not match"

**Expected Results:**
- ✅ Client-side validation works
- ✅ Error messages displayed
- ✅ Form not submitted

---

## 🔍 Browser DevTools Checks

### Check Stored Tokens
```javascript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('refresh_token')
localStorage.getItem('user_info')
```

### Check Current Chart
```javascript
// In browser console
JSON.parse(localStorage.getItem('currentChart'))
```

### Check API Requests
1. Open DevTools → Network tab
2. Generate a chart
3. Look for POST request to `/api/v1/chart/calculate`
4. Check request headers: should have `Authorization: Bearer <token>`
5. Check response: should include `chart_id` if authenticated

---

## 🐛 Troubleshooting

### Issue: "Unauthorized - please login again"
- **Cause:** Token expired or invalid
- **Solution:** Clear localStorage and login again
- **Command:** `localStorage.clear()`

### Issue: Guest mode not working
- **Cause:** `ALLOW_GUEST_MODE=false` in backend
- **Solution:** Set `ALLOW_GUEST_MODE=true` in `backend/.env`

### Issue: Charts not saving to database
- **Cause:** User not authenticated or database error
- **Solution:** Check backend logs for errors
- **Command:** `tail -f backend.log`

### Issue: CORS errors
- **Cause:** Frontend and backend on different origins
- **Solution:** Check `CORS_ORIGINS` in `backend/.env`
- **Should include:** `http://localhost:3000`

---

## ✅ Sign-Off Checklist

- [ ] Guest mode works
- [ ] Registration works
- [ ] Login works
- [ ] Chart persistence works (authenticated)
- [ ] Chart NOT persisted (guest)
- [ ] Logout works
- [ ] Error handling works
- [ ] Database entries created correctly
- [ ] Tokens stored in localStorage
- [ ] No console errors

---

*Testing guide for Authentication Implementation - October 23, 2025*

