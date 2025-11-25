# ChandraHoro Localhost Testing Guide

## 🎯 Quick Start

Your ChandraHoro application is now running on localhost! Here's how to test it:

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

---

## 🧪 Testing Scenarios

### Scenario 1: Generate a Chart (Basic Test)

1. **Open the application**: http://localhost:3000
2. **Fill in birth details**:
   - Name: Your name
   - Date: Your birth date (YYYY-MM-DD)
   - Time: Your birth time (HH:MM:SS)
   - Location: Your birth location
3. **Click "Generate Chart"**
4. **Verify the chart displays** with:
   - Ascendant sign
   - Planetary positions
   - House placements
   - Nakshatra information

### Scenario 2: Test with Known Data (Chandra Vempati)

Use this verified test data:
- **Name**: Chandra Vempati
- **Date**: 1972-07-17
- **Time**: 02:17:00
- **Location**: Palakollu, West Godavari, Andhra Pradesh, India
- **Latitude**: 16.5062
- **Longitude**: 80.6480
- **Timezone**: Asia/Kolkata

**Expected Results**:
- Ascendant: ~118° (Cancer)
- Sun: ~91° (Cancer)
- Moon: ~167° (Virgo)
- Mars: ~108° (Cancer)

### Scenario 3: Test Location Search

1. **On the chart form**, start typing a location
2. **Verify autocomplete suggestions** appear
3. **Select a location** from the dropdown
4. **Verify coordinates are populated**

### Scenario 4: Test Chart Navigation

1. **After generating a chart**, verify you can:
   - View planetary positions
   - View divisional charts (D9, D10)
   - View dasha calculations
   - View ashtakavarga
   - View shadbala
   - Export as PDF
   - Share the chart

### Scenario 5: Test Settings Page

1. **Navigate to Settings** (http://localhost:3000/settings)
2. **Verify you can**:
   - Change theme (Light/Dark)
   - Toggle notifications
   - View about information

---

## 🔍 API Testing

### Test 1: Health Check
```bash
curl http://localhost:8001/api/v1/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "api_version": "v1"
}
```

### Test 2: Calculate Chart
```bash
curl -X POST http://localhost:8001/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {
      "name": "Test User",
      "date": "1990-01-01",
      "time": "12:00:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "Delhi, India"
    }
  }'
```

**Expected Response**: Chart data with planets, ascendant, houses

### Test 3: View API Documentation
```
Open: http://localhost:8001/docs
```

This shows all available API endpoints with:
- Request/response schemas
- Example data
- Try-it-out functionality

---

## 🐛 Debugging Tips

### Check Backend Logs
- Look at the terminal running the backend
- Watch for any error messages
- Check for Swiss Ephemeris warnings

### Check Frontend Logs
1. **Open browser DevTools**: Press F12
2. **Go to Console tab**
3. **Look for any errors or warnings**
4. **Check Network tab** for API calls

### Common Issues

**Issue**: Chart not generating
- **Solution**: Check backend is running on port 8001
- **Check**: http://localhost:8001/api/v1/health

**Issue**: Location search not working
- **Solution**: Verify GeoNames API key (if configured)
- **Check**: Browser console for errors

**Issue**: Incorrect planetary positions
- **Solution**: Verify Swiss Ephemeris is installed
- **Check**: Backend logs for ephemeris errors

---

## 📊 Test Data Sets

### Test Case 1: Delhi, India
```
Date: 1990-01-01
Time: 12:00:00
Latitude: 28.6139
Longitude: 77.2090
Timezone: Asia/Kolkata
```

### Test Case 2: Mumbai, India
```
Date: 1985-06-15
Time: 14:30:00
Latitude: 19.0760
Longitude: 72.8777
Timezone: Asia/Kolkata
```

### Test Case 3: Bangalore, India
```
Date: 1995-03-20
Time: 09:15:00
Latitude: 12.9716
Longitude: 77.5946
Timezone: Asia/Kolkata
```

---

## ✅ Verification Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:8001/api/v1/health
- [ ] Chart can be generated with test data
- [ ] Planetary positions are displayed
- [ ] Ascendant is calculated
- [ ] Location search works
- [ ] Settings page is accessible
- [ ] API documentation is available at /docs
- [ ] No console errors in browser
- [ ] No errors in backend terminal

---

## 🚀 Next Steps

After testing on localhost:

1. **Review the test results** in LOCALHOST_TEST_REPORT.md
2. **Check for any issues** and fix them
3. **Prepare for deployment** using QUICK_START_DEPLOYMENT.md
4. **Deploy to production** (Railway + Vercel)

---

## 📞 Support Resources

- **API Docs**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **Test Report**: LOCALHOST_TEST_REPORT.md
- **Deployment Guide**: QUICK_START_DEPLOYMENT.md
- **Build Status**: BUILD_AND_DEPLOYMENT_COMPLETE.md

---

## 🎉 You're All Set!

Your Chandrahoro application is running and ready for testing. Open http://localhost:3000 in your browser and start exploring!

