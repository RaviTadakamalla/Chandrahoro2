# Implementation Details for Developer

## Overview
This document provides technical details about the three implemented features for developers who need to maintain or extend the code.

---

## Feature 1: My Charts Page (`frontend/src/pages/charts.tsx`)

### Architecture
- **Type:** Next.js Page Component
- **Authentication:** Required (redirects to login if not authenticated)
- **Data Source:** Backend API (`GET /api/v1/charts`)

### Key Components
1. **Chart List Grid**
   - Uses CSS Grid with responsive columns
   - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
   - Card-based layout using existing Card component

2. **Search & Filter**
   - Real-time filtering using `filterText` state
   - Filters by chart name and location (case-insensitive)
   - No debouncing (instant filtering)

3. **Sorting**
   - Two sort options: by date (newest first) or by name (A-Z)
   - Uses JavaScript array sort methods
   - No backend sorting (done client-side)

4. **Delete Functionality**
   - Two-step confirmation process
   - First click shows "Cancel" and "Delete" buttons
   - Second click calls `apiClient.deleteChart(chartId)`
   - Updates local state after successful deletion

### State Management
```typescript
const [charts, setCharts] = useState<BirthChart[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
const [filterText, setFilterText] = useState('');
const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

### API Calls
- `apiClient.listCharts(0, 100)` - Fetch all charts (skip=0, limit=100)
- `apiClient.deleteChart(chartId)` - Delete specific chart

### Error Handling
- Catches errors from API calls
- Displays error message to user
- Allows retry by reloading page

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints: `md:` for tablet/desktop
- Touch-friendly buttons (implicit 44x44px minimum)

---

## Feature 2: Navigation & Logout (`frontend/src/components/MainNav.tsx`)

### Architecture
- **Type:** React Functional Component
- **Used By:** All pages (index, landing, chart, settings, etc.)
- **State Management:** Local state + localStorage

### Key Components
1. **User Profile Dropdown (Desktop)**
   - Uses Radix UI DropdownMenu component
   - Shows user avatar with first letter of username
   - Displays full name and email in dropdown header
   - Three menu items: My Charts, Settings, Logout

2. **Mobile User Menu**
   - Integrated into existing mobile menu
   - Shows user name and email
   - Same navigation options as desktop
   - Red logout button for visual distinction

3. **Logout Handler**
   - Calls `apiClient.logout()` API endpoint
   - Clears tokens via `apiClient.clearTokens()`
   - Redirects to login page
   - Graceful error handling (redirects even if API fails)

### State Management
```typescript
const [user, setUser] = useState<UserInfo | null>(null);
const [isLoggingOut, setIsLoggingOut] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isDark, setIsDark] = useState(false);
```

### Key Functions
```typescript
const handleLogout = async () => {
  try {
    setIsLoggingOut(true);
    await apiClient.logout();
    setUser(null);
    router.push('/login');
  } catch (error) {
    // Still redirect even if logout API fails
    apiClient.clearTokens();
    setUser(null);
    router.push('/login');
  } finally {
    setIsLoggingOut(false);
  }
};
```

### Conditional Rendering
- Shows user dropdown if `user` is not null
- Shows "Sign in" button if `user` is null
- Mobile menu shows user options if authenticated

### Imports Added
- `useRouter` from 'next/router'
- `useEffect` from 'react'
- `apiClient`, `UserInfo` from '@/lib/api'
- Dropdown components from '@/components/ui/dropdown-menu'
- Icons from 'lucide-react'

---

## Feature 3: Settings Page (`frontend/src/pages/settings.tsx`)

### Architecture
- **Type:** Next.js Page Component
- **Authentication:** Required (redirects to login if not authenticated)
- **Data Source:** localStorage (user info), Backend API (for updates)

### Key Sections
1. **Profile Settings**
   - Full name input (editable)
   - Email display (read-only)
   - Save button with loading state

2. **Password Management**
   - Toggle form visibility with "Change Password" button
   - Three password fields: current, new, confirm
   - Validation: passwords must match, min 8 characters
   - Cancel button to close form

3. **Appearance Settings**
   - Theme toggle (Light/Dark)
   - Visual indicators for current theme
   - Buttons to switch themes

4. **Notification Settings**
   - Enable/Disable toggle
   - Description of notification types

5. **Privacy & Security**
   - Make charts public toggle
   - Export data button
   - Delete account button

6. **About Section**
   - Version information
   - Technology stack

### State Management
```typescript
const [user, setUser] = useState<UserInfo | null>(null);
const [fullName, setFullName] = useState('');
const [email, setEmail] = useState('');
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showPasswordForm, setShowPasswordForm] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
```

### Key Functions
```typescript
const handleSaveProfile = async (e: React.FormEvent) => {
  // TODO: Call API endpoint to update profile
  // Currently shows success message
};

const handleChangePassword = async (e: React.FormEvent) => {
  // Validates passwords match and min 8 characters
  // TODO: Call API endpoint to change password
  // Currently shows success message
};
```

### Form Validation
- Password match validation
- Minimum password length (8 characters)
- Error messages displayed to user

### UI Components
- Card component for sections
- Input fields with Tailwind styling
- SaffronButton for actions
- Icons from lucide-react for visual distinction

---

## API Client Updates (`frontend/src/lib/api.ts`)

### New Type
```typescript
export interface BirthChart {
  id: string;
  user_id: string;
  name?: string;
  birth_date: string;
  birth_time?: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  birth_location: string;
  ayanamsha: string;
  house_system: string;
  chart_style: string;
  is_public: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### New Methods
```typescript
async listCharts(skip: number = 0, limit: number = 10): Promise<BirthChart[]>
async getChart(chartId: string): Promise<BirthChart>
async deleteChart(chartId: string): Promise<{ message: string }>
async updateChart(chartId: string, updates: Partial<BirthChart>): Promise<BirthChart>
```

---

## Backend Integration Needed

### Endpoints to Implement
1. **Profile Update**
   - `PUT /api/v1/auth/profile` - Update user profile
   - Request: `{ full_name: string }`
   - Response: Updated user info

2. **Password Change**
   - `POST /api/v1/auth/change-password` - Change password
   - Request: `{ current_password: string, new_password: string }`
   - Response: `{ message: string }`

3. **Export Data**
   - `GET /api/v1/auth/export-data` - Export user data
   - Response: JSON file with all user data

4. **Delete Account**
   - `DELETE /api/v1/auth/account` - Delete user account
   - Response: `{ message: string }`

---

## Testing Recommendations

### Unit Tests
- Test chart filtering logic
- Test password validation
- Test logout handler

### Integration Tests
- Test API calls to backend
- Test authentication flow
- Test error handling

### E2E Tests
- Test complete user flow (login → charts → settings → logout)
- Test responsive design on mobile
- Test dark mode functionality

---

## Performance Considerations

1. **Chart List**
   - Currently loads all charts (limit=100)
   - Consider pagination for large lists
   - Consider caching with React Query

2. **Search & Filter**
   - Currently done client-side
   - Consider debouncing for large lists
   - Consider server-side filtering

3. **API Calls**
   - Consider caching user info
   - Consider batch operations
   - Consider optimistic updates

---

## Security Considerations

1. **Authentication**
   - Always check `apiClient.isAuthenticated()` before showing protected content
   - Redirect to login if not authenticated

2. **Token Management**
   - Tokens stored in localStorage
   - Consider moving to secure cookies
   - Implement token refresh logic

3. **Password Change**
   - Require current password verification
   - Implement rate limiting on backend
   - Consider password strength requirements

---

## Future Enhancements

1. **My Charts Page**
   - Add pagination for large lists
   - Add chart filtering by date range
   - Add chart sorting by location
   - Add bulk delete functionality
   - Add chart sharing from this page

2. **Navigation**
   - Add user profile page
   - Add notification bell with count
   - Add quick actions menu

3. **Settings Page**
   - Add two-factor authentication
   - Add session management
   - Add API key management
   - Add data export scheduling
   - Add account recovery options

---

## Troubleshooting

### Charts page shows "Unauthorized"
- Check if user is authenticated
- Check localStorage for auth_token
- Try logging in again

### Dropdown menu not appearing
- Check browser console for errors
- Verify Radix UI is installed
- Check CSS for z-index issues

### Settings not saving
- Check browser console for errors
- Verify backend endpoints exist
- Check network tab for failed requests

---

## Code Quality

- ✅ TypeScript types for all data
- ✅ Error handling for all API calls
- ✅ Loading states for async operations
- ✅ Responsive design for all screen sizes
- ✅ Dark mode support throughout
- ✅ Accessibility considerations (ARIA labels, keyboard navigation)
- ✅ Consistent with existing design system

