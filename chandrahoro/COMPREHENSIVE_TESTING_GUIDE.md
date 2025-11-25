# Comprehensive Testing Guide - ChandraHoro/Jyotish Drishti

---

## 🧪 MANUAL TESTING (Frontend)

### Test 1: Birth Chart Form
**Steps:**
1. Open http://localhost:3000
2. Fill in form:
   - Name: "Test User"
   - Date: "1980-01-01"
   - Time: "12:00"
   - Location: Type "Mumbai" → Select from dropdown
3. Click "Generate Chart"

**Expected Results:**
- ✅ Form accepts all inputs
- ✅ Location autocomplete shows suggestions
- ✅ Chart calculation completes (< 5 seconds)
- ✅ Redirects to chart result page

---

### Test 2: Chart Display
**Steps:**
1. After chart generation, verify all tabs:
   - Overview (basic info)
   - Planets (planetary positions)
   - Houses (house positions)
   - Dasha (planetary periods)
   - Divisional Charts (D9, D10)
   - Aspects (planetary aspects)
   - Shadbala (strength analysis)
   - Ashtakavarga (8-fold division)

**Expected Results:**
- ✅ All tabs load without errors
- ✅ Data displays correctly
- ✅ Charts render properly
- ✅ No console errors

---

### Test 3: Export Functionality
**Steps:**
1. Click "Export" button (FAB)
2. Test each format:
   - PDF
   - PNG
   - SVG
   - JSON

**Expected Results:**
- ✅ All formats download successfully
- ✅ Files are valid (can open PDF, PNG, etc.)
- ✅ JSON contains complete chart data

---

### Test 4: Location Autocomplete
**Steps:**
1. Go to home page
2. Click location field
3. Type: "New York"
4. Wait 300ms
5. Verify dropdown appears
6. Select a location

**Expected Results:**
- ✅ Dropdown appears with suggestions
- ✅ Shows city name, timezone, population
- ✅ Coordinates display correctly
- ✅ Form populates with selected location

---

### Test 5: Responsive Design
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test on:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Touch targets are 44x44px minimum
- ✅ Text is readable
- ✅ No horizontal scrolling

---

### Test 6: Dark Mode
**Steps:**
1. Click theme toggle (top right)
2. Verify colors change
3. Check readability

**Expected Results:**
- ✅ Dark mode activates
- ✅ All text readable
- ✅ Charts visible
- ✅ Preference persists on reload

---

## 🔌 API TESTING (Backend)

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{"status": "healthy", "service": "chandrahoro-api", "version": "0.1.0"}
```

---

### Test 2: Chart Calculation
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Test User",
      "date": "1980-01-01",
      "time": "12:00",
      "time_unknown": false,
      "latitude": 19.076,
      "longitude": 72.8777,
      "timezone": "Asia/Kolkata",
      "location_name": "Mumbai"
    },
    "preferences": {
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "North Indian",
      "divisional_charts": ["D1", "D9", "D10"],
      "enable_ai": false
    }
  }'
```

**Expected Response:**
- ✅ Status 200
- ✅ Contains birth_info, planets, houses, ascendant
- ✅ Calculation timestamp present

---

### Test 3: Location Search
```bash
curl "http://localhost:8000/api/v1/locations/search?q=Mumbai&limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "query": "Mumbai",
  "results": [
    {
      "name": "Mumbai, Maharashtra, India",
      "latitude": 19.076,
      "longitude": 72.8777,
      "timezone": "Asia/Kolkata",
      "country": "India",
      "admin1": "Maharashtra",
      "population": 20411000,
      "source": "builtin"
    }
  ],
  "count": 1
}
```

---

### Test 4: Strength Attributes
```bash
# First create a chart, then:
curl "http://localhost:8000/api/v1/profiles/{chart_id}/strength-attributes"
```

**Expected Response:**
- ✅ 8 strength attributes (Risk-Taking, Loyalty, etc.)
- ✅ Each with score (1-10), confidence, factors
- ✅ Overall score calculated

---

### Test 5: Predictions
```bash
curl "http://localhost:8000/api/v1/charts/{chart_id}/predictions/integrated"
```

**Expected Response:**
- ✅ 6 life aspects with predictions
- ✅ Timeline data with dates and scores
- ✅ Confidence bands included

---

## 🔄 INTEGRATION TESTING

### Workflow 1: Complete Chart Generation
1. Submit birth form
2. Verify chart calculation
3. Check all tabs load
4. Export to PDF
5. Verify file quality

**Success Criteria:** All steps complete without errors

---

### Workflow 2: Synergy Analysis
1. Create first chart
2. Create second chart
3. Link profiles
4. Analyze synergy
5. View compatibility score

**Success Criteria:** Synergy score calculated (0-100)

---

### Workflow 3: Calibration Tracking
1. Create chart
2. Add journal entry
3. Rate life aspects
4. View calibration metrics
5. Check accuracy trend

**Success Criteria:** Metrics calculated and displayed

---

## 📊 PERFORMANCE TESTING

### Load Test
```bash
# Install locust
pip install locust

# Create tests/load_test.py with:
from locust import HttpUser, task

class ChartUser(HttpUser):
    @task
    def calculate_chart(self):
        self.client.post("/api/v1/chart/calculate", json={...})

# Run
locust -f tests/load_test.py --host=http://localhost:8000
```

**Success Criteria:**
- ✅ Handle 100+ concurrent users
- ✅ Response time < 2 seconds (p95)
- ✅ Error rate < 1%

---

## 🔒 SECURITY TESTING

### Test 1: SQL Injection
```bash
curl "http://localhost:8000/api/v1/locations/search?q='; DROP TABLE users; --"
```

**Expected:** Error message, no data loss

### Test 2: CORS
```bash
curl -H "Origin: http://evil.com" http://localhost:8000/api/v1/health
```

**Expected:** CORS headers present, origin allowed/denied correctly

### Test 3: Rate Limiting
```bash
# Send 100 requests rapidly
for i in {1..100}; do curl http://localhost:8000/api/v1/health; done
```

**Expected:** 429 Too Many Requests after limit

---

## ✅ CHECKLIST

- [ ] All frontend pages load
- [ ] Location autocomplete works
- [ ] Chart calculation completes
- [ ] All export formats work
- [ ] Responsive design works
- [ ] Dark mode works
- [ ] All API endpoints respond
- [ ] Database persists data
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable
- [ ] Security checks pass

---

## 📈 METRICS TO TRACK

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | < 2s | ? |
| API Response Time | < 1s | ? |
| Chart Calc Time | < 5s | ? |
| Error Rate | < 1% | ? |
| Uptime | > 99% | ? |
| Test Coverage | > 80% | ? |

