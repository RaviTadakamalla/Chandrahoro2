# Guest Mode - Flow Diagrams & Visual Guides

## 1. Guest Mode User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    GUEST MODE USER JOURNEY                      │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─→ User visits http://localhost:3000/login
  │
  ├─→ Sees "Continue as Guest (Demo Mode)" button
  │
  ├─→ Clicks button
  │   │
  │   ├─→ Frontend: continueAsGuest() called
  │   │   ├─→ Sets localStorage['guest-mode-token'] = 'guest-mode-token'
  │   │   ├─→ Sets localStorage['user-info'] = guest user object
  │   │   └─→ Redirects to home page
  │   │
  │   └─→ Backend: No API call needed (token stored locally)
  │
  ├─→ User on home page (http://localhost:3000/)
  │   │
  │   ├─→ Guest mode banner displays (amber banner)
  │   ├─→ Birth details form visible
  │   └─→ User can fill form
  │
  ├─→ User fills birth details:
  │   ├─→ Name: "Test User"
  │   ├─→ Date: "1990-06-15"
  │   ├─→ Time: "14:30"
  │   ├─→ Location: "New Delhi, India"
  │   └─→ Timezone: "Asia/Kolkata"
  │
  ├─→ User clicks "Generate Chart"
  │   │
  │   ├─→ Frontend: Sends POST to /api/v1/chart/calculate
  │   │   ├─→ Includes Authorization header: "Bearer guest-mode-token"
  │   │   └─→ Includes birth details and preferences
  │   │
  │   ├─→ Backend: Receives request
  │   │   ├─→ Checks token: "guest-mode-token"
  │   │   ├─→ Recognizes as guest token (before JWT validation)
  │   │   ├─→ Checks ALLOW_GUEST_MODE = true
  │   │   ├─→ Creates temporary guest user object
  │   │   ├─→ Calculates chart
  │   │   └─→ Returns chart data (HTTP 200)
  │   │
  │   └─→ Frontend: Receives chart data
  │       ├─→ Stores in localStorage['currentChart']
  │       ├─→ Stores request in localStorage['chartRequest']
  │       └─→ Redirects to /chart/result
  │
  ├─→ User on chart result page
  │   │
  │   ├─→ Chart displays with all data:
  │   │   ├─→ Overview tab
  │   │   ├─→ Planets tab
  │   │   ├─→ Houses tab
  │   │   ├─→ Aspects tab
  │   │   ├─→ Yogas tab
  │   │   ├─→ Dasha tab
  │   │   └─→ Divisional Charts tab
  │   │
  │   └─→ User can export as PNG
  │       ├─→ Clicks "Export as PNG"
  │       ├─→ Frontend sends POST to /api/v1/chart/export/png
  │       ├─→ Backend generates PNG image
  │       └─→ PNG file downloads
  │
  ├─→ User clicks "Sign in" link in banner
  │   │
  │   ├─→ Frontend: Clears localStorage
  │   ├─→ Frontend: Redirects to /login
  │   └─→ User can now login or signup
  │
  └─→ END

```

---

## 2. Backend Token Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND TOKEN VALIDATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Request arrives at /api/v1/chart/calculate
  │
  ├─→ get_current_user_or_guest() called
  │
  ├─→ Check if credentials provided?
  │   │
  │   ├─→ YES: Extract token from Authorization header
  │   │   │
  │   │   ├─→ Is token == "guest-mode-token"?
  │   │   │   │
  │   │   │   ├─→ YES: Check ALLOW_GUEST_MODE
  │   │   │   │   │
  │   │   │   │   ├─→ TRUE: Create guest user object
  │   │   │   │   │   ├─→ id: "guest-demo-user"
  │   │   │   │   │   ├─→ email: "guest@demo.local"
  │   │   │   │   │   ├─→ role: "individual"
  │   │   │   │   │   └─→ Return guest user ✅
  │   │   │   │   │
  │   │   │   │   └─→ FALSE: Raise 401 Unauthorized ❌
  │   │   │   │
  │   │   │   └─→ NO: Try JWT validation
  │   │   │       │
  │   │   │       ├─→ Is valid JWT?
  │   │   │       │   │
  │   │   │       │   ├─→ YES: Get user from database
  │   │   │       │   │   └─→ Return authenticated user ✅
  │   │   │       │   │
  │   │   │       │   └─→ NO: Raise 401 Unauthorized ❌
  │   │   │       │
  │   │   │       └─→ User not found: Raise 401 ❌
  │   │
  │   └─→ NO: Check if ALLOW_GUEST_MODE
  │       │
  │       ├─→ TRUE: Create guest user object
  │       │   └─→ Return guest user ✅
  │       │
  │       └─→ FALSE: Raise 401 Unauthorized ❌
  │
  └─→ Endpoint executes with user object

```

---

## 3. Frontend localStorage Structure

```
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND LOCALSTORAGE STRUCTURE                    │
└─────────────────────────────────────────────────────────────────┘

localStorage = {
  
  // Authentication
  "guest-mode-token": "guest-mode-token",
  
  // User Info
  "user-info": {
    "id": "guest-demo-user",
    "email": "guest@demo.local",
    "username": "guest",
    "role": "individual"
  },
  
  // Current Chart Data
  "currentChart": {
    "birth_info": {
      "name": "Test User",
      "date": "1990-06-15",
      "time": "14:30:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi, India"
    },
    "ascendant": 250.5778666350917,
    "ascendant_sign": "Sagittarius",
    "planets": [...],
    "houses": [...],
    "aspects": [...],
    "yogas": [...],
    "dasha_timeline": {...},
    "divisional_charts": {...}
  },
  
  // Chart Request (for regeneration)
  "chartRequest": {
    "birth_details": {...},
    "preferences": {...}
  }
}

```

---

## 4. API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              API REQUEST/RESPONSE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND
   │                                 │
   ├─→ POST /api/v1/chart/calculate  │
   │   Headers:                       │
   │   - Content-Type: application/json
   │   - Authorization: Bearer guest-mode-token
   │   Body:                          │
   │   {                              │
   │     "birth_details": {...},      │
   │     "preferences": {...}         │
   │   }                              │
   │                                  ├─→ Validate token
   │                                  ├─→ Recognize guest token
   │                                  ├─→ Create guest user
   │                                  ├─→ Calculate chart
   │                                  │
   │   ←─ HTTP 200 OK                 │
   │   {                              │
   │     "success": true,             │
   │     "data": {                    │
   │       "birth_info": {...},       │
   │       "planets": [...],          │
   │       "houses": [...],           │
   │       "aspects": [...],          │
   │       "yogas": [...],            │
   │       "dasha_timeline": {...},   │
   │       "divisional_charts": {...} │
   │     }                            │
   │   }                              │
   │                                  │
   ├─→ Store in localStorage          │
   ├─→ Redirect to /chart/result      │
   │                                  │
   └─→ Display chart                  │

```

---

## 5. Guest Mode vs Authenticated User

```
┌─────────────────────────────────────────────────────────────────┐
│         GUEST MODE vs AUTHENTICATED USER COMPARISON             │
└─────────────────────────────────────────────────────────────────┘

FEATURE                    GUEST MODE          AUTHENTICATED
─────────────────────────────────────────────────────────────────
Generate Chart             ✅ YES              ✅ YES
View Chart Details         ✅ YES              ✅ YES
Export as PNG              ✅ YES              ✅ YES
Export as PDF              ✅ YES              ✅ YES
Save Chart                 ❌ NO               ✅ YES
Access /charts             ❌ NO               ✅ YES
Access /settings           ❌ NO               ✅ YES
Modify Profile             ❌ NO               ✅ YES
Change Password            ❌ NO               ✅ YES
View Saved Charts          ❌ NO               ✅ YES
Share Chart                ❌ NO               ✅ YES
AI Insights                ❌ NO               ✅ YES
─────────────────────────────────────────────────────────────────
Data Storage               localStorage        Database
Data Persistence           Session Only        Permanent
User ID                    guest-demo-user     UUID
Email                      guest@demo.local    User's Email
Role                       individual          individual/corporate/admin
─────────────────────────────────────────────────────────────────

```

---

## 6. Page Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              PAGE NAVIGATION FLOW                               │
└─────────────────────────────────────────────────────────────────┘

LOGIN PAGE (/login)
  │
  ├─→ [Sign In Button] → Authenticate → HOME PAGE (/)
  │
  ├─→ [Continue as Guest] → Set localStorage → HOME PAGE (/)
  │
  └─→ [Sign Up Link] → SIGNUP PAGE (/signup)

HOME PAGE (/)
  │
  ├─→ [Generate Chart] → Calculate → CHART RESULT PAGE (/chart/result)
  │
  ├─→ [Sign in link in banner] → Clear localStorage → LOGIN PAGE (/login)
  │
  ├─→ [My Charts] → Check auth → CHARTS PAGE (/charts) or LOGIN PAGE (/login)
  │
  └─→ [Settings] → Check auth → SETTINGS PAGE (/settings) or LOGIN PAGE (/login)

CHART RESULT PAGE (/chart/result)
  │
  ├─→ [Export as PNG] → Generate PNG → Download
  │
  ├─→ [Export as PDF] → Generate PDF → Download
  │
  ├─→ [Home] → HOME PAGE (/)
  │
  └─→ [Logout] → Clear localStorage → LOGIN PAGE (/login)

CHARTS PAGE (/charts)
  │
  ├─→ Requires authentication
  ├─→ If guest: Redirect to LOGIN PAGE (/login)
  └─→ If authenticated: Show saved charts

SETTINGS PAGE (/settings)
  │
  ├─→ Requires authentication
  ├─→ If guest: Redirect to LOGIN PAGE (/login)
  └─→ If authenticated: Show settings form

```

---

## 7. Test Execution Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│              TEST EXECUTION TIMELINE (30 minutes)               │
└─────────────────────────────────────────────────────────────────┘

0:00  ├─→ START
      │
0:01  ├─→ Test 1.1: Guest button visible (1 min)
0:02  ├─→ Test 1.2: Redirect to home (1 min)
0:03  ├─→ Test 1.3: Banner displays (1 min)
0:05  ├─→ Test 1.4: Form accepts input (2 min)
0:08  ├─→ Test 1.5: Chart generates (3 min)
0:10  ├─→ Test 1.6: View chart details (2 min)
0:12  ├─→ Test 1.7: Export as PNG (2 min)
0:13  ├─→ Test 1.8: Sign in link works (1 min)
      │
0:14  ├─→ Test 2.1: Chart with token (1 min)
0:15  ├─→ Test 2.2: Chart without token (1 min)
0:16  ├─→ Test 2.3: PNG export (1 min)
0:17  ├─→ Test 2.4: Invalid token (1 min)
      │
0:18  ├─→ Test 6.1: /charts redirect (1 min)
0:19  ├─→ Test 6.2: /settings redirect (1 min)
0:21  ├─→ Test 6.3: Disable guest mode (2 min)
0:22  ├─→ Test 6.4: Protected endpoints (1 min)
      │
0:24  ├─→ Test 5.1: localStorage check (2 min)
0:26  ├─→ Test 5.2: Database check (2 min)
      │
0:28  ├─→ Test 4.1-4.3: Visual verification (2 min)
      │
0:30  └─→ END - All tests complete

```

---

## 8. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ERROR HANDLING FLOW                                │
└─────────────────────────────────────────────────────────────────┘

ERROR SCENARIO                  RESPONSE              ACTION
─────────────────────────────────────────────────────────────────
Invalid token                   401 Unauthorized      Redirect to login
Guest mode disabled             401 Unauthorized      Show error message
Chart calculation fails         500 Server Error      Show error alert
Network error                   Network Error         Retry button
Missing birth details           400 Bad Request       Show validation error
Invalid date format             400 Bad Request       Show validation error
Location not found              400 Bad Request       Show location error
Timezone invalid                400 Bad Request       Show timezone error
─────────────────────────────────────────────────────────────────

```

---

## 9. Security Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│              SECURITY BOUNDARIES                                │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS (No auth required)
├─→ POST /api/v1/chart/calculate (with guest-mode-token)
├─→ POST /api/v1/chart/export/png (with guest-mode-token)
└─→ GET /api/v1/health

GUEST ACCESSIBLE (guest-mode-token or no token)
├─→ POST /api/v1/chart/calculate
└─→ POST /api/v1/chart/export/png

AUTHENTICATED ONLY (JWT token required)
├─→ GET /api/v1/charts (list user's charts)
├─→ POST /api/v1/charts (save chart)
├─→ GET /api/v1/charts/{id} (get chart)
├─→ PUT /api/v1/charts/{id} (update chart)
├─→ DELETE /api/v1/charts/{id} (delete chart)
├─→ GET /api/v1/auth/profile (get profile)
├─→ PUT /api/v1/auth/profile (update profile)
└─→ POST /api/v1/auth/change-password (change password)

ADMIN ONLY (Admin role required)
├─→ GET /api/v1/organizations
├─→ POST /api/v1/organizations
└─→ GET /api/v1/admin/users

```

---

**Diagram Version**: 1.0
**Last Updated**: 2025-10-24

