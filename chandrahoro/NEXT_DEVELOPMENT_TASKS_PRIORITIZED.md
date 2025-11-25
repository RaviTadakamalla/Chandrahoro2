# Next Development Tasks - Prioritized List

## Phase 2: Frontend-Backend Integration & User Features

### Priority 1: Frontend Integration Testing (2-3 hours)
**Objective:** Verify frontend can communicate with backend authentication system

**Tasks:**
1. Test login page with backend
   - Submit credentials to `/api/v1/auth/login`
   - Verify token storage in localStorage
   - Verify redirect to dashboard

2. Test registration page with backend
   - Submit registration form to `/api/v1/auth/register`
   - Verify auto-login after registration
   - Verify user data stored in database

3. Test chart calculation from UI
   - Submit birth details form
   - Verify chart calculation endpoint called
   - Verify chart_id returned and displayed

4. Test guest mode
   - Click "Continue as Guest" button
   - Verify guest banner displayed
   - Verify chart calculation works without authentication
   - Verify chart NOT saved to database

**Estimated Time:** 2-3 hours
**Blockers:** None - all backend endpoints ready

---

### Priority 2: "My Charts" Page Implementation (3-4 hours)
**Objective:** Allow users to view and manage their saved charts

**Tasks:**
1. Create `/api/v1/charts/list` endpoint
   - Fetch all charts for authenticated user
   - Return chart metadata (name, date, location)
   - Implement pagination

2. Create `/api/v1/charts/{chart_id}` endpoint
   - Fetch full chart data by ID
   - Verify user ownership

3. Create `/api/v1/charts/{chart_id}/delete` endpoint
   - Delete chart from database
   - Verify user ownership

4. Create frontend "My Charts" page
   - Display list of user's charts
   - Add delete button for each chart
   - Add click to view full chart
   - Add pagination controls

**Estimated Time:** 3-4 hours
**Dependencies:** Frontend integration testing (Priority 1)

---

### Priority 3: Navigation & Logout (1-2 hours)
**Objective:** Add logout functionality and improve navigation

**Tasks:**
1. Add logout button to navigation
   - Clear localStorage tokens
   - Redirect to login page
   - Show confirmation message

2. Update navigation based on auth state
   - Show "My Charts" link when authenticated
   - Show "Login/Register" when not authenticated
   - Show "Logout" when authenticated

3. Add user profile dropdown
   - Display username
   - Show "My Profile" link
   - Show "Logout" option

**Estimated Time:** 1-2 hours
**Dependencies:** Frontend integration testing (Priority 1)

---

### Priority 4: Password Reset & Email Verification (4-5 hours)
**Objective:** Implement secure password recovery and email verification

**Tasks:**
1. Create password reset flow
   - `/api/v1/auth/forgot-password` endpoint
   - Send reset link via email
   - `/api/v1/auth/reset-password` endpoint
   - Verify reset token

2. Create email verification flow
   - Send verification email on registration
   - `/api/v1/auth/verify-email` endpoint
   - Mark user as verified

3. Create frontend pages
   - Forgot password page
   - Reset password page
   - Email verification page

**Estimated Time:** 4-5 hours
**Dependencies:** Email service setup, Priority 1-3 complete

---

### Priority 5: User Profile Page (2-3 hours)
**Objective:** Allow users to view and edit their profile

**Tasks:**
1. Create `/api/v1/users/profile` endpoint
   - Get user profile data
   - Update user profile (name, email, etc.)

2. Create frontend profile page
   - Display user information
   - Edit form for profile updates
   - Change password form

**Estimated Time:** 2-3 hours
**Dependencies:** Priority 1-3 complete

---

### Priority 6: OAuth2 Integration (Optional, 3-4 hours)
**Objective:** Allow login via Google, GitHub, etc.

**Tasks:**
1. Implement Google OAuth2
2. Implement GitHub OAuth2
3. Create frontend OAuth buttons
4. Link OAuth accounts to existing users

**Estimated Time:** 3-4 hours
**Dependencies:** Priority 1-5 complete

---

## Summary

| Priority | Task | Time | Status |
|----------|------|------|--------|
| 1 | Frontend Integration Testing | 2-3h | Ready to Start |
| 2 | "My Charts" Page | 3-4h | Blocked by #1 |
| 3 | Navigation & Logout | 1-2h | Blocked by #1 |
| 4 | Password Reset & Email | 4-5h | Blocked by #1-3 |
| 5 | User Profile Page | 2-3h | Blocked by #1-3 |
| 6 | OAuth2 Integration | 3-4h | Optional |

**Total Estimated Time:** 15-21 hours (excluding optional OAuth2)

## Recommended Next Step

**Start with Priority 1: Frontend Integration Testing**

This will verify that the frontend can successfully communicate with the backend authentication system and is the foundation for all subsequent features.

Once Priority 1 is complete, you can proceed with Priorities 2-3 in parallel, as they are independent of each other.

