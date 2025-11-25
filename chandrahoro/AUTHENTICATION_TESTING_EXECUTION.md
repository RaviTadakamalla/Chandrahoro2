# 🧪 Authentication Testing Execution Plan

**Date:** October 24, 2025  
**Status:** READY FOR TESTING  
**Backend:** ✅ Running on http://localhost:8000  
**Frontend:** ✅ Running on http://localhost:3000

---

## 📋 Test Execution Steps

### Test 1: Guest Mode (Demo Access)

**Objective:** Verify guest mode allows full feature access without authentication

**Steps:**
1. Open http://localhost:3000/login in browser
2. Click "Continue as Guest (Demo Mode)" button
3. Should redirect to home page
4. Look for amber banner: "Demo Mode: You're using guest mode..."
5. Generate a chart with test data:
   - Name: "Test User"
   - Date: "1980-01-01"
   - Time: "12:00"
   - Location: Search for "New York"
6. Click "Generate Chart"
7. Verify chart is generated successfully

**Expected Results:**
- ✅ Guest mode banner visible
- ✅ Chart generated without errors
- ✅ No database entry created (guest mode)
- ✅ Chart data in localStorage

**Verification:**
```javascript
// In browser console
localStorage.getItem('auth_token')  // Should be 'guest-mode-token'
localStorage.getItem('user_info')   // Should have guest user
JSON.parse(localStorage.getItem('currentChart'))  // Should have chart data
```

---

### Test 2: User Registration

**Objective:** Verify new user registration works correctly

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
- ✅ Redirected to home page
- ✅ No guest mode banner

**Verification:**
```javascript
// In browser console
localStorage.getItem('auth_token')  // Should have JWT token
JSON.parse(localStorage.getItem('user_info'))  // Should have user data
```

**Database Check:**
```sql
SELECT * FROM users WHERE email = 'testuser@example.com';
```

---

### Test 3: User Login

**Objective:** Verify user login works correctly

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

**Verification:**
```javascript
// In browser console
localStorage.getItem('auth_token')  // Should have JWT token
JSON.parse(localStorage.getItem('user_info'))  // Should have user data
```

---

### Test 4: Chart Persistence (Authenticated User)

**Objective:** Verify charts are saved to database for authenticated users

**Steps:**
1. Login with registered account (from Test 2 or 3)
2. Generate a chart with test data
3. Check response message
4. Verify chart_id is returned
5. Check browser console for chart data

**Expected Results:**
- ✅ Chart saved to database
- ✅ `chart_id` returned in response
- ✅ Message: "Chart calculated and saved successfully"
- ✅ Database entry created

**Verification:**
```javascript
// In browser console - check response
// Should see chart_id in the response
```

**Database Check:**
```sql
SELECT id, user_id, name, birth_date FROM birth_charts 
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com');
```

---

### Test 5: Chart Persistence (Guest User)

**Objective:** Verify charts are NOT saved to database for guest users

**Steps:**
1. Continue as guest (Test 1)
2. Generate a chart
3. Check response message
4. Verify NO chart_id is returned
5. Check database - no new entries

**Expected Results:**
- ✅ Chart NOT saved to database
- ✅ No `chart_id` in response
- ✅ Message: "Chart calculated successfully" (not "saved")
- ✅ No database entries created

**Database Check:**
```sql
SELECT COUNT(*) FROM birth_charts WHERE user_id = 'guest-demo-user';
-- Should return 0
```

---

### Test 6: Invalid Credentials

**Objective:** Test error handling for invalid login

**Steps:**
1. Open http://localhost:3000/login
2. Enter invalid credentials:
   - Email: `nonexistent@example.com`
   - Password: `WrongPassword123`
3. Click "Sign In"
4. Should see error message
5. Should NOT redirect

**Expected Results:**
- ✅ Error message displayed
- ✅ Not redirected
- ✅ Can retry login

---

### Test 7: Password Validation

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
console.log('Auth Token:', localStorage.getItem('auth_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('User Info:', JSON.parse(localStorage.getItem('user_info')));
```

### Check Current Chart
```javascript
// In browser console
console.log('Current Chart:', JSON.parse(localStorage.getItem('currentChart')));
```

### Check API Requests
1. Open DevTools → Network tab
2. Generate a chart
3. Look for POST request to `/api/v1/chart/calculate`
4. Check request headers: should have `Authorization: Bearer <token>`
5. Check response: should include `chart_id` if authenticated

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Guest Mode | [ ] | |
| Registration | [ ] | |
| Login | [ ] | |
| Chart Persistence (Auth) | [ ] | |
| Chart Persistence (Guest) | [ ] | |
| Invalid Credentials | [ ] | |
| Password Validation | [ ] | |

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

### Issue: CORS errors
- **Cause:** Frontend and backend on different origins
- **Solution:** Check `CORS_ORIGINS` in `backend/.env`

---

*Testing Execution Plan - October 24, 2025*

