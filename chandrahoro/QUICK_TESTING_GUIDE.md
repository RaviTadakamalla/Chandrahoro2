# Quick Testing Guide - Three Features

## Setup
1. Frontend running on http://localhost:3000
2. Backend running on http://localhost:8000
3. Browser DevTools open (F12)

---

## Feature 1: My Charts Page

### Test 1: Navigate to Charts Page
1. Go to http://localhost:3000/charts
2. **Expected:** Should redirect to login if not authenticated
3. **Expected:** If authenticated, should show chart list or empty state

### Test 2: Create Test Charts (via Backend)
```bash
# Register a test user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "TestPassword123"
  }'

# Save the access_token from response
TOKEN="<access_token_from_response>"

# Create a test chart
curl -X POST http://localhost:8000/api/v1/charts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Chart 1",
    "birth_date": "1990-01-15",
    "birth_time": "14:30:00",
    "birth_latitude": 28.6139,
    "birth_longitude": 77.2090,
    "birth_timezone": "Asia/Kolkata",
    "birth_location": "New Delhi, India",
    "ayanamsha": "Lahiri",
    "house_system": "Whole Sign",
    "chart_style": "North Indian"
  }'
```

### Test 3: Search & Filter
1. Type in search box - should filter by name/location in real-time
2. Change sort dropdown - should sort by date or name
3. Clear search - should show all charts again

### Test 4: Delete Chart
1. Click delete button on a chart
2. **Expected:** Confirmation UI appears
3. Click "Delete" - chart should be removed
4. Click "Cancel" - should close confirmation

### Test 5: View Chart
1. Click "View" button
2. **Expected:** Should navigate to `/chart/{id}` page

### Test 6: Empty State
1. Delete all charts
2. **Expected:** Should show "You haven't created any charts yet"
3. **Expected:** "Create Your First Chart" button should appear

### Test 7: Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. **Expected:** Grid should be 1 column on mobile
4. **Expected:** All buttons should be touch-friendly
5. **Expected:** Text should be readable

---

## Feature 2: Navigation & Logout

### Test 1: User Dropdown (Desktop)
1. Login to the app
2. Look at top-right of navigation
3. **Expected:** Should see user avatar with first letter
4. **Expected:** Should see username next to avatar
5. Click avatar - **Expected:** Dropdown menu appears

### Test 2: Dropdown Menu Items
1. Click "My Charts" - **Expected:** Navigate to `/charts`
2. Go back, click avatar again
3. Click "Settings" - **Expected:** Navigate to `/settings`
4. Go back, click avatar again
5. Click "Logout" - **Expected:** Redirect to login page

### Test 3: Logout Functionality
1. Login to the app
2. Click avatar dropdown
3. Click "Logout"
4. **Expected:** Redirect to login page
5. **Expected:** localStorage should be cleared
6. **Expected:** Trying to access `/charts` should redirect to login

### Test 4: Mobile Menu
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Click hamburger menu
4. **Expected:** Should see user name and email
5. **Expected:** Should see "My Charts" and "Settings" links
6. **Expected:** Should see red "Logout" button
7. Click "My Charts" - **Expected:** Navigate to `/charts`
8. Open menu again, click "Logout" - **Expected:** Redirect to login

### Test 5: Sign In Button (Not Authenticated)
1. Logout completely
2. Go to http://localhost:3000/landing
3. **Expected:** Should see "Sign in" button in top-right
4. Click it - **Expected:** Navigate to login page

### Test 6: Dropdown Styling
1. Check dropdown styling in light mode
2. Toggle dark mode (moon icon)
3. **Expected:** Dropdown should be visible and readable in both modes
4. **Expected:** Text colors should have good contrast

---

## Feature 3: Settings Page

### Test 1: Load Settings Page
1. Login to the app
2. Navigate to http://localhost:3000/settings
3. **Expected:** Should load without errors
4. **Expected:** Should show all settings sections

### Test 2: Profile Settings
1. Scroll to "Profile Settings" section
2. **Expected:** Should show "Full Name" input field
3. **Expected:** Should show "Email" field (disabled/read-only)
4. Edit full name field
5. Click "Save Profile"
6. **Expected:** Should show success message
7. **Expected:** Message should disappear after 3 seconds

### Test 3: Password Change
1. Scroll to "Password" section
2. Click "Change Password" button
3. **Expected:** Form should appear with 3 password fields
4. Fill in current password, new password, confirm password
5. Click "Update Password"
6. **Expected:** Should show success message
7. **Expected:** Form should close
8. Click "Change Password" again - **Expected:** Form should reappear

### Test 4: Password Validation
1. Click "Change Password"
2. Enter passwords that don't match
3. Click "Update Password"
4. **Expected:** Should show error "New passwords do not match"
5. Enter password less than 8 characters
6. **Expected:** Should show error "Password must be at least 8 characters"

### Test 5: Theme Toggle
1. Scroll to "Appearance" section
2. Click "Dark" button
3. **Expected:** Page should switch to dark mode
4. Click "Light" button
5. **Expected:** Page should switch to light mode

### Test 6: Notification Toggle
1. Scroll to "Notifications" section
2. Click "Enabled" button
3. **Expected:** Should change to "Disabled"
4. Click "Disabled" button
5. **Expected:** Should change to "Enabled"

### Test 7: Privacy & Security
1. Scroll to "Privacy & Security" section
2. **Expected:** Should show "Make Charts Public" toggle
3. **Expected:** Should show "Export Data" button
4. **Expected:** Should show "Delete Account" button

### Test 8: Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. **Expected:** All sections should be readable
4. **Expected:** Form inputs should be full width
5. **Expected:** Buttons should be touch-friendly

### Test 9: Dark Mode
1. Toggle dark mode
2. Navigate to settings page
3. **Expected:** All text should be readable
4. **Expected:** Form inputs should have good contrast
5. **Expected:** Icons should be visible

---

## Common Issues & Solutions

### Issue: Charts page shows "Unauthorized"
**Solution:** Make sure you're logged in. Check localStorage for auth_token.

### Issue: Dropdown menu not appearing
**Solution:** Check browser console for errors. Make sure Radix UI is installed.

### Issue: Settings page not loading
**Solution:** Check if user is authenticated. Try logging in again.

### Issue: Logout not working
**Solution:** Check browser console for errors. Verify backend logout endpoint exists.

### Issue: Mobile menu not showing user options
**Solution:** Check if user is authenticated. Verify MainNav component is updated.

---

## Browser Console Checks

After each test, check browser console (F12 > Console tab):
- ✅ No red errors
- ✅ No hydration errors
- ✅ Only harmless warnings (like fetchPriority)

---

## Performance Checks

1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to `/charts` page
4. **Expected:** API call to `/api/v1/charts` should complete
5. **Expected:** Page should load in < 2 seconds
6. **Expected:** No failed requests

---

## Accessibility Checks

1. Tab through navigation - **Expected:** All interactive elements should be reachable
2. Use keyboard to navigate dropdown - **Expected:** Should work with arrow keys
3. Check color contrast - **Expected:** Text should be readable
4. Check form labels - **Expected:** All inputs should have labels

---

## Summary

If all tests pass:
- ✅ Feature 1: My Charts Page - WORKING
- ✅ Feature 2: Navigation & Logout - WORKING
- ✅ Feature 3: Settings Page - WORKING

Ready for backend integration and production deployment!

