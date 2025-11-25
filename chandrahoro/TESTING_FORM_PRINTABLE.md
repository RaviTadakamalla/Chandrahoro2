# Guest Mode Testing Form - Printable

**Project**: ChandraHoro Vedic Astrology
**Feature**: Continue as Guest (Demo Mode)
**Date**: _______________
**Tester Name**: _______________
**Environment**: [ ] Local [ ] Staging [ ] Production

---

## SECTION 1: FRONTEND USER FLOW TESTS

### Test 1.1: Guest Button Visibility
**Objective**: Verify guest mode button is visible on login page

**Steps**:
1. Navigate to http://localhost:3000/login
2. Look for "Continue as Guest (Demo Mode)" button
3. Verify button styling and position

**Expected Result**: Button visible, properly labeled, distinct styling

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 1.2: Redirect to Home
**Objective**: Verify clicking guest button redirects to home page

**Steps**:
1. Click "Continue as Guest (Demo Mode)" button
2. Wait for page load
3. Check URL and page content

**Expected Result**: URL = http://localhost:3000/, no errors

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 1.3: Guest Mode Banner
**Objective**: Verify guest mode banner displays on home page

**Steps**:
1. Observe top of home page
2. Check banner content and styling
3. Verify banner is responsive

**Expected Result**: Amber banner with warning icon and text

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 1.4: Form Input
**Objective**: Verify birth details form accepts input

**Steps**:
1. Fill Name: "Test Guest User"
2. Fill Date: "1990-06-15"
3. Fill Time: "14:30"
4. Fill Location: "New Delhi, India"
5. Select Timezone: "Asia/Kolkata"

**Expected Result**: All fields accept input, no validation errors

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 1.5: Chart Generation
**Objective**: Verify chart generates successfully

**Steps**:
1. Click "Generate Chart" button
2. Wait for chart to generate
3. Verify redirect to result page

**Expected Result**: Chart displays, no errors, < 15 seconds

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Time Taken**: __________ seconds

**Notes**: _______________________________________________

---

### Test 1.6: Chart Details
**Objective**: Verify all chart tabs display correctly

**Steps**:
1. Click Overview tab
2. Click Planets tab
3. Click Houses tab
4. Click Aspects tab
5. Click Yogas tab
6. Click Dasha tab
7. Click Divisional Charts tab

**Expected Result**: All tabs load, data displays correctly

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 1.7: PNG Export
**Objective**: Verify PNG export works

**Steps**:
1. Click export button
2. Select "Export as PNG"
3. Wait for download
4. Verify PNG file created

**Expected Result**: PNG file downloads, > 10KB, can be opened

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**File Size**: __________ KB

**Notes**: _______________________________________________

---

### Test 1.8: Sign In Link
**Objective**: Verify sign in link in banner works

**Steps**:
1. Click "Sign in or create an account" link
2. Verify redirect to login page
3. Check URL

**Expected Result**: Redirected to /login, guest session cleared

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

## SECTION 2: BACKEND API TESTS

### Test 2.1: Chart with Guest Token
**Objective**: Verify chart calculation with guest token

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer guest-mode-token" \
  -d '{"birth_details":{"name":"Test","date":"1990-06-15","time":"14:30:00","time_unknown":false,"latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata","location_name":"New Delhi"},"preferences":{"ayanamsha":"Lahiri","house_system":"Whole Sign","chart_style":"North Indian"}}'
```

**Expected Result**: HTTP 200, "success": true, chart data returned

**HTTP Status**: __________

**Response Contains "success": true**: [ ] YES [ ] NO

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 2.2: Chart without Token
**Objective**: Verify chart calculation without token (guest mode enabled)

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birth_details":{"name":"Test","date":"1990-06-15","time":"14:30:00","time_unknown":false,"latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata","location_name":"New Delhi"},"preferences":{"ayanamsha":"Lahiri","house_system":"Whole Sign","chart_style":"North Indian"}}'
```

**Expected Result**: HTTP 200, "success": true, chart data returned

**HTTP Status**: __________

**Response Contains "success": true**: [ ] YES [ ] NO

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 2.3: PNG Export
**Objective**: Verify PNG export with guest token

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chart/export/png \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer guest-mode-token" \
  -d '{"birth_details":{"name":"Test","date":"1990-06-15","time":"14:30:00","time_unknown":false,"latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata","location_name":"New Delhi"},"preferences":{"ayanamsha":"Lahiri","house_system":"Whole Sign","chart_style":"North Indian"}}' -o test.png
```

**Expected Result**: HTTP 200, PNG file created (> 10KB)

**HTTP Status**: __________

**File Created**: [ ] YES [ ] NO

**File Size**: __________ KB

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 2.4: Invalid Token
**Objective**: Verify invalid token is rejected

**Command**:
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"birth_details":{"name":"Test","date":"1990-06-15","time":"14:30:00","time_unknown":false,"latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata","location_name":"New Delhi"},"preferences":{"ayanamsha":"Lahiri","house_system":"Whole Sign","chart_style":"North Indian"}}'
```

**Expected Result**: HTTP 401, error message

**HTTP Status**: __________

**Error Message**: _______________________________________________

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

## SECTION 3: SECURITY TESTS

### Test 6.1: /charts Access Restriction
**Objective**: Verify guest users cannot access /charts

**Steps**:
1. As guest user, navigate to http://localhost:3000/charts
2. Observe page behavior

**Expected Result**: Redirected to /login

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 6.2: /settings Access Restriction
**Objective**: Verify guest users cannot access /settings

**Steps**:
1. As guest user, navigate to http://localhost:3000/settings
2. Observe page behavior

**Expected Result**: Redirected to /login

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 6.3: Guest Mode Disable
**Objective**: Verify guest mode can be disabled

**Steps**:
1. Set ALLOW_GUEST_MODE=false in .env
2. Restart backend
3. Try chart calculation without token

**Expected Result**: HTTP 401, "Authentication required"

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 6.4: Protected Endpoints
**Objective**: Verify guest token cannot access admin endpoints

**Command**:
```bash
curl -X GET http://localhost:8000/api/v1/organizations \
  -H "Authorization: Bearer guest-mode-token"
```

**Expected Result**: HTTP 403, error message

**HTTP Status**: __________

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

## SECTION 4: DATA PERSISTENCE TESTS

### Test 5.1: localStorage Verification
**Objective**: Verify guest charts stored in localStorage

**Steps**:
1. Generate chart as guest
2. Open DevTools (F12)
3. Go to Application > Local Storage
4. Check for "currentChart" and "chartRequest"

**Expected Result**: Both keys exist with valid JSON

**currentChart exists**: [ ] YES [ ] NO

**chartRequest exists**: [ ] YES [ ] NO

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 5.2: Database Verification
**Objective**: Verify guest charts NOT in database

**Steps**:
1. Query database: SELECT * FROM birth_charts WHERE user_id = 'guest-demo-user'
2. Check result

**Expected Result**: 0 rows returned

**Rows Returned**: __________

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

## SECTION 5: VISUAL VERIFICATION

### Test 4.1: Banner Styling
**Objective**: Verify banner has correct styling

**Checks**:
- [ ] Background color is amber
- [ ] Text is readable
- [ ] Icon is visible
- [ ] Banner is responsive

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 4.2: Navigation Bar
**Objective**: Verify navigation shows guest user info

**Checks**:
- [ ] User name/email displayed
- [ ] Profile menu clickable
- [ ] Logout option visible

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

### Test 4.3: Chart Result Page
**Objective**: Verify chart result page displays correctly

**Checks**:
- [ ] All tabs visible
- [ ] Chart data displayed
- [ ] Export button visible
- [ ] No save button or disabled
- [ ] Responsive on mobile

**Result**: [ ] PASS [ ] FAIL [ ] N/A

**Notes**: _______________________________________________

---

## SUMMARY

### Test Results
| Category | Tests | Passed | Failed | N/A |
|----------|-------|--------|--------|-----|
| Frontend | 8 | ___ | ___ | ___ |
| Backend | 4 | ___ | ___ | ___ |
| Security | 4 | ___ | ___ | ___ |
| Data | 2 | ___ | ___ | ___ |
| Visual | 3 | ___ | ___ | ___ |
| **TOTAL** | **21** | **___** | **___** | **___** |

### Overall Status
- [ ] ✅ ALL TESTS PASSED
- [ ] ⚠️ SOME TESTS FAILED
- [ ] ❌ CRITICAL FAILURES

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations
_______________________________________________
_______________________________________________
_______________________________________________

---

## SIGN-OFF

**Tested By**: _______________

**Date**: _______________

**Time Spent**: __________ minutes

**Environment**: [ ] Local [ ] Staging [ ] Production

**Browser**: _______________

**OS**: _______________

**Signature**: _______________

---

**Form Version**: 1.0
**Last Updated**: 2025-10-24

