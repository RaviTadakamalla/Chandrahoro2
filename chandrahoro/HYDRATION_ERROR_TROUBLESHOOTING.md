# Hydration Error - Troubleshooting Guide

## Quick Diagnosis

### Symptom 1: "Hydration failed because the initial UI does not match"
**Cause:** Server-rendered HTML doesn't match client-rendered HTML
**Solution:** Check for:
- Link components wrapping buttons
- Link components wrapping text
- useEffect hooks without proper SSR handling
- Conditional rendering based on client-only state

### Symptom 2: "Expected server HTML to contain a matching `<a>` in `<a>`"
**Cause:** Nested anchor tags
**Solution:** Check for:
- Link wrapping SaffronButton
- Link wrapping other Link components
- Link wrapping text inside paragraphs

### Symptom 3: "Expected server HTML to contain a matching `<button>`"
**Cause:** Button element mismatch
**Solution:** Check for:
- Conditional button rendering
- Button wrapped in Link
- Button with dynamic className

## Step-by-Step Troubleshooting

### Step 1: Clear All Caches
```bash
# Kill the dev server (Ctrl+C)

# Clear Next.js build cache
cd frontend
rm -rf .next

# Clear node_modules cache (if needed)
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"
4. Wait for page to fully reload

### Step 3: Check Console for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - Hydration errors
   - Nested anchor warnings
   - Type errors
   - Network errors

### Step 4: Identify Problem Component
If error persists:
1. Check Component Stack in error message
2. Look for the component name
3. Search for Link components in that file
4. Check for nested elements

### Step 5: Fix the Issue
Common fixes:
```tsx
// ❌ WRONG - Link wrapping button
<Link href="/path">
  <SaffronButton>Click</SaffronButton>
</Link>

// ✅ CORRECT - Button with onClick
<SaffronButton onClick={() => router.push('/path')}>
  Click
</SaffronButton>

// ❌ WRONG - Link wrapping text in paragraph
<p>
  Text <Link href="/path">link</Link> more text
</p>

// ✅ CORRECT - Anchor tag with onClick
<p>
  Text <a href="/path" onClick={(e) => {
    e.preventDefault();
    router.push('/path');
  }}>link</a> more text
</p>
```

## Advanced Debugging

### Enable Verbose Logging
```bash
# In _app.tsx, add:
useEffect(() => {
  console.log('App mounted on client');
}, []);
```

### Check Server vs Client Rendering
```tsx
// Add this to see if component renders differently
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return null; // Prevents hydration mismatch
}
```

### Inspect HTML Differences
1. Open DevTools
2. Go to Elements tab
3. Right-click element
4. Select "Inspect"
5. Compare server HTML with client HTML

## Common Issues and Solutions

### Issue: Hydration error on page load
**Solution:**
1. Check for useEffect without dependency array
2. Check for Math.random() or Date.now()
3. Check for window/document access in render
4. Wrap client-only code in useEffect

### Issue: Hydration error only on specific page
**Solution:**
1. Check that page's imports
2. Look for Link components
3. Check for conditional rendering
4. Verify all components are SSR-compatible

### Issue: Hydration error after navigation
**Solution:**
1. Check router.push() implementation
2. Verify Link components on target page
3. Check for state that changes on mount
4. Verify useEffect cleanup

### Issue: Hydration error in production but not dev
**Solution:**
1. Build and test locally: `npm run build && npm start`
2. Check for environment-specific code
3. Verify all dynamic imports are handled
4. Check for browser-only APIs

## Prevention Tips

1. **Always use Link for navigation:**
   ```tsx
   <Link href="/path">Text</Link>
   ```

2. **Never wrap buttons with Link:**
   ```tsx
   // Use onClick instead
   <button onClick={() => router.push('/path')}>Click</button>
   ```

3. **Wrap client-only code in useEffect:**
   ```tsx
   useEffect(() => {
     // Client-only code here
   }, []);
   ```

4. **Use suppressHydrationWarning for known mismatches:**
   ```tsx
   <div suppressHydrationWarning>
     {new Date().toLocaleString()}
   </div>
   ```

5. **Test SSR compatibility:**
   ```bash
   npm run build
   npm start
   ```

## Verification Checklist

- [ ] No hydration errors in console
- [ ] No nested anchor warnings
- [ ] All buttons navigate correctly
- [ ] All links work properly
- [ ] Page loads without warnings
- [ ] Mobile navigation works
- [ ] Desktop navigation works
- [ ] Smooth scrolling works
- [ ] All interactive elements functional

## Getting Help

If hydration errors persist:

1. **Check the error stack:**
   - Look at Component Stack
   - Identify the problematic component
   - Search for Link/button issues

2. **Search for similar issues:**
   - Next.js GitHub issues
   - Stack Overflow
   - Next.js Discord

3. **Minimal reproduction:**
   - Create a simple test case
   - Isolate the problem
   - Share with community

## Resources

- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Mismatch](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js Link Component](https://nextjs.org/docs/api-reference/next/link)
- [Next.js Router](https://nextjs.org/docs/api-reference/next/router)

---

**Last Updated:** 2025-10-24

