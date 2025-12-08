# Debug Authentication Token Issue

## 🔍 **Check Your Token in Browser Console**

### **Step 1: Open Browser Console**

1. Press **F12** (or **Cmd+Option+I** on Mac)
2. Click the **Console** tab

### **Step 2: Check Current Token**

Paste this in the console and press Enter:

```javascript
// Check if token exists
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);
console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');

// Try to decode the token (will fail if malformed)
if (token) {
  try {
    const parts = token.split('.');
    console.log('Token parts:', parts.length, '(should be 3 for valid JWT)');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token expired:', Date.now() > payload.exp * 1000);
    } else {
      console.error('❌ INVALID TOKEN: Not enough segments!');
    }
  } catch (e) {
    console.error('❌ INVALID TOKEN: Cannot decode', e);
  }
}
```

### **Step 3: Clear Bad Token (if needed)**

If the token is invalid, run this:

```javascript
// Clear the bad token
localStorage.removeItem('access_token');
console.log('✅ Token cleared. Please refresh and login again.');
```

### **Step 4: Refresh and Login**

1. **Refresh the page** (Cmd+R or F5)
2. **Login again** with your credentials
3. **Navigate to** `/ai-prompt-config`

---

## 🧪 **Test API Call Manually**

After logging in, test the API call directly in the console:

```javascript
// Test the API call
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/api/v1/ai-prompts/modules', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ API Response:', data);
    console.log('Total modules:', data.total);
  })
  .catch(err => {
    console.error('❌ API Error:', err);
  });
```

**Expected Result:**
```json
{
  "modules": [...],
  "total": 15
}
```

---

## 🔧 **Quick Fix: Force Re-login**

Run this in the console to force a logout and redirect to login:

```javascript
// Force logout
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

---

## 📋 **Common Issues and Solutions**

### **Issue 1: "Token decode error: Not enough segments"**

**Cause:** Malformed JWT token in localStorage

**Solution:**
```javascript
localStorage.removeItem('access_token');
// Then refresh and login
```

### **Issue 2: "Invalid or expired token"**

**Cause:** Token has expired

**Solution:**
```javascript
localStorage.clear();
// Then refresh and login
```

### **Issue 3: "No modules found" but API works**

**Cause:** Frontend not sending token correctly

**Solution:**
1. Check Network tab in DevTools
2. Look for the `/api/v1/ai-prompts/modules` request
3. Check if `Authorization` header is present
4. If missing, clear localStorage and re-login

---

## 🎯 **Expected Behavior After Fix**

Once you have a valid token:

1. **Console should show:**
   ```
   Token exists: true
   Token length: 200+ characters
   Token parts: 3 (should be 3 for valid JWT)
   Token payload: { sub: "user-id", exp: 1732xxx, ... }
   Token expired: false
   ```

2. **API call should return:**
   ```json
   {
     "modules": [
       {
         "module_type": "chart_interpretation",
         "display_name": "AI Chart Interpretation",
         ...
       },
       ...
     ],
     "total": 15
   }
   ```

3. **Page should display:**
   - 15 Total Modules
   - Grid of 15 module cards
   - No "No modules found" message

---

## 🚨 **If Nothing Works**

Try this nuclear option:

```javascript
// Clear everything and force fresh start
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
window.location.href = '/login';
```

This will:
1. Clear all localStorage
2. Clear all sessionStorage
3. Clear all cookies
4. Redirect to login page

Then login fresh and try again.

---

**Last Updated:** 2025-11-26  
**Status:** Debugging authentication token issue

