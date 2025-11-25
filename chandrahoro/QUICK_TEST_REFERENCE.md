# Guest Mode Testing - Quick Reference Guide

## 🚀 Quick Start

### Prerequisites
- Frontend running: http://localhost:3000
- Backend running: http://localhost:8000
- Browser DevTools available (F12)
- curl or Postman for API tests

---

## ⚡ 5-Minute Quick Test

### Step 1: Frontend Flow (2 minutes)
```
1. Go to http://localhost:3000/login
2. Click "Continue as Guest (Demo Mode)"
3. Verify redirected to home page
4. Verify amber banner appears
5. Fill form: Date=1990-06-15, Time=14:30, Location=New Delhi
6. Click "Generate Chart"
7. Verify chart displays
```

### Step 2: Backend API (2 minutes)
```bash
# Test 1: Chart with guest token
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer guest-mode-token" \
  -d '{"birth_details":{"name":"Test","date":"1990-06-15","time":"14:30:00","time_unknown":false,"latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata","location_name":"New Delhi"},"preferences":{"ayanamsha":"Lahiri","house_system":"Whole Sign","chart_style":"North Indian"}}'

# Expected: HTTP 200 with chart data
```

### Step 3: Verification (1 minute)
```
✅ Guest button visible
✅ Redirect works
✅ Banner displays
✅ Chart generates
✅ API returns 200
```

---

## 📋 Test Categories

### Category A: Frontend (8 tests)
| # | Test | Time | Pass |
|---|------|------|------|
| 1.1 | Guest button visible | 1m | [ ] |
| 1.2 | Redirect to home | 1m | [ ] |
| 1.3 | Banner displays | 1m | [ ] |
| 1.4 | Form accepts input | 2m | [ ] |
| 1.5 | Chart generates | 3m | [ ] |
| 1.6 | View chart details | 2m | [ ] |
| 1.7 | Export as PNG | 2m | [ ] |
| 1.8 | Sign in link works | 1m | [ ] |
| **Total** | | **15m** | |

### Category B: Backend (4 tests)
| # | Test | Time | Pass |
|---|------|------|------|
| 2.1 | Chart with token | 1m | [ ] |
| 2.2 | Chart without token | 1m | [ ] |
| 2.3 | PNG export | 1m | [ ] |
| 2.4 | Invalid token | 1m | [ ] |
| **Total** | | **4m** | |

### Category C: Security (4 tests)
| # | Test | Time | Pass |
|---|------|------|------|
| 6.1 | /charts redirect | 1m | [ ] |
| 6.2 | /settings redirect | 1m | [ ] |
| 6.3 | Disable guest mode | 2m | [ ] |
| 6.4 | Protected endpoints | 1m | [ ] |
| **Total** | | **5m** | |

### Category D: Data (2 tests)
| # | Test | Time | Pass |
|---|------|------|------|
| 5.1 | localStorage check | 2m | [ ] |
| 5.2 | Database check | 2m | [ ] |
| **Total** | | **4m** | |

---

## 🎯 Test Execution Order

### Recommended Order (30 minutes total)
1. **Frontend Flow** (15 min) - Tests 1.1-1.8
2. **Backend API** (4 min) - Tests 2.1-2.4
3. **Security** (5 min) - Tests 6.1-6.4
4. **Data Persistence** (4 min) - Tests 5.1-5.2
5. **Visual Verification** (2 min) - Tests 4.1-4.3

---

## 🔧 API Test Commands

### Test 2.1: Chart with Guest Token
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer guest-mode-token" \
  -d '{
    "birth_details": {
      "name": "Test",
      "date": "1990-06-15",
      "time": "14:30:00",
      "time_unknown": false,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi"
    },
    "preferences": {
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "North Indian"
    }
  }'
```
**Expected**: HTTP 200, `"success": true`

---

### Test 2.2: Chart without Token
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Test",
      "date": "1990-06-15",
      "time": "14:30:00",
      "time_unknown": false,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi"
    },
    "preferences": {
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "North Indian"
    }
  }'
```
**Expected**: HTTP 200, `"success": true`

---

### Test 2.3: PNG Export
```bash
curl -X POST http://localhost:8000/api/v1/chart/export/png \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer guest-mode-token" \
  -d '{
    "birth_details": {
      "name": "Test",
      "date": "1990-06-15",
      "time": "14:30:00",
      "time_unknown": false,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi"
    },
    "preferences": {
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "North Indian"
    }
  }' -o chart.png
```
**Expected**: HTTP 200, PNG file created (> 10KB)

---

### Test 2.4: Invalid Token
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{
    "birth_details": {
      "name": "Test",
      "date": "1990-06-15",
      "time": "14:30:00",
      "time_unknown": false,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi"
    },
    "preferences": {
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "North Indian"
    }
  }'
```
**Expected**: HTTP 401, error message

---

## 🔍 Browser DevTools Checks

### Check localStorage
```javascript
// In browser console (F12 > Console)
localStorage.getItem('guest-mode-token')
// Should return: "guest-mode-token"

localStorage.getItem('user-info')
// Should return: {"id":"guest-demo-user","email":"guest@demo.local",...}

localStorage.getItem('currentChart')
// Should return: {...chart data...}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Generate chart
4. Look for POST request to `/api/v1/chart/calculate`
5. Verify:
   - Status: 200
   - Authorization header: `Bearer guest-mode-token`
   - Response contains chart data

---

## ✅ Pass/Fail Criteria

### PASS Criteria
- ✅ All 8 frontend tests pass
- ✅ All 4 backend API tests pass
- ✅ All 4 security tests pass
- ✅ All 2 data persistence tests pass
- ✅ No error messages in console
- ✅ No 401/403 errors for guest operations
- ✅ Charts generate in < 15 seconds

### FAIL Criteria
- ❌ Any test fails
- ❌ 401 Unauthorized on guest operations
- ❌ Chart generation fails
- ❌ Banner doesn't display
- ❌ localStorage not populated
- ❌ PNG export fails
- ❌ Redirect doesn't work

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" on chart generation
**Solution**: 
- Check backend is running: `curl http://localhost:8000/api/v1/health`
- Check `.env` has `ALLOW_GUEST_MODE=true`
- Restart backend: `pkill -f uvicorn` then restart

### Issue: Guest button not visible
**Solution**:
- Check frontend is running: `curl http://localhost:3000`
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R

### Issue: Chart doesn't generate
**Solution**:
- Check browser console for errors (F12)
- Check network tab for failed requests
- Verify backend is responding: `curl http://localhost:8000/api/v1/health`

### Issue: Banner doesn't appear
**Solution**:
- Check localStorage has guest token: `localStorage.getItem('guest-mode-token')`
- Check user ID is 'guest-demo-user': `localStorage.getItem('user-info')`
- Hard refresh page: Ctrl+Shift+R

---

## 📊 Test Results Template

```
GUEST MODE TESTING RESULTS
==========================

Date: _______________
Tester: _______________

FRONTEND TESTS (8)
- Test 1.1: [ ] PASS [ ] FAIL
- Test 1.2: [ ] PASS [ ] FAIL
- Test 1.3: [ ] PASS [ ] FAIL
- Test 1.4: [ ] PASS [ ] FAIL
- Test 1.5: [ ] PASS [ ] FAIL
- Test 1.6: [ ] PASS [ ] FAIL
- Test 1.7: [ ] PASS [ ] FAIL
- Test 1.8: [ ] PASS [ ] FAIL

BACKEND TESTS (4)
- Test 2.1: [ ] PASS [ ] FAIL
- Test 2.2: [ ] PASS [ ] FAIL
- Test 2.3: [ ] PASS [ ] FAIL
- Test 2.4: [ ] PASS [ ] FAIL

SECURITY TESTS (4)
- Test 6.1: [ ] PASS [ ] FAIL
- Test 6.2: [ ] PASS [ ] FAIL
- Test 6.3: [ ] PASS [ ] FAIL
- Test 6.4: [ ] PASS [ ] FAIL

DATA TESTS (2)
- Test 5.1: [ ] PASS [ ] FAIL
- Test 5.2: [ ] PASS [ ] FAIL

OVERALL: [ ] PASS [ ] FAIL

Issues Found:
_________________________________
_________________________________

Sign-Off: _______________
```

---

**Quick Reference Version**: 1.0
**Last Updated**: 2025-10-24

