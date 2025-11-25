# AGPL-3.0 Compliance Guide for ChandraHoro

## Required: Source Code Disclosure

As ChandraHoro is licensed under AGPL-3.0, you **must** provide access to the source code for all users interacting with the application over a network.

---

## Implementation Steps

### 1. Add Source Code Link to Footer

**Location:** `chandrahoro/frontend/src/components/layout/Footer.tsx` (or similar)

**Required Text:**
```
This application is licensed under AGPL-3.0.
Source code available at: [GitHub Repository URL]
```

**Example Implementation:**
```tsx
<footer className="app-footer">
  <div className="footer-content">
    <p>© 2025 ChandraHoro. Licensed under AGPL-3.0.</p>
    <p>
      <a href="https://github.com/[your-org]/chandrahoro" target="_blank" rel="noopener noreferrer">
        View Source Code
      </a>
      {' | '}
      <a href="/about/license">License Information</a>
    </p>
  </div>
</footer>
```

### 2. Create License Information Page

**Location:** `chandrahoro/frontend/src/pages/about/license.tsx`

**Required Content:**
- Full AGPL-3.0 license text
- Copyright notice
- Link to source code repository
- Installation instructions
- List of dependencies and their licenses

**Example:**
```tsx
export default function LicensePage() {
  return (
    <div className="license-page">
      <h1>License Information</h1>
      
      <section>
        <h2>ChandraHoro License</h2>
        <p>
          ChandraHoro is free software licensed under the 
          GNU Affero General Public License v3.0 (AGPL-3.0).
        </p>
        <p>
          <strong>Source Code:</strong>{' '}
          <a href="https://github.com/[your-org]/chandrahoro">
            https://github.com/[your-org]/chandrahoro
          </a>
        </p>
      </section>

      <section>
        <h2>What This Means</h2>
        <ul>
          <li>You can use, modify, and distribute this software</li>
          <li>You must provide source code to users</li>
          <li>Modifications must also be licensed under AGPL-3.0</li>
        </ul>
      </section>

      <section>
        <h2>Full License Text</h2>
        <pre>{/* Include full AGPL-3.0 text */}</pre>
      </section>
    </div>
  );
}
```

### 3. Add Copyright Notice to About Page

**Location:** `chandrahoro/frontend/src/pages/about/index.tsx`

**Required Content:**
```tsx
<section className="copyright">
  <h2>Copyright & License</h2>
  <p>Copyright © 2025 ChandraHoro Development Team</p>
  <p>
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
  </p>
  <p>
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Affero General Public License for more details.
  </p>
  <p>
    <a href="/about/license">View Full License</a>
  </p>
</section>
```

### 4. Add API Endpoint for License Information

**Location:** `chandrahoro/backend/app/api/v1/about.py`

**Purpose:** Provide license information via API

**Example:**
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/license")
async def get_license_info():
    """Get license information for AGPL-3.0 compliance."""
    return {
        "license": "AGPL-3.0",
        "license_url": "https://www.gnu.org/licenses/agpl-3.0.html",
        "source_code_url": "https://github.com/[your-org]/chandrahoro",
        "copyright": "Copyright © 2025 ChandraHoro Development Team",
        "warranty": "NO WARRANTY - See AGPL-3.0 license for details"
    }
```

---

## Checklist for AGPL-3.0 Compliance

### ✅ **Code Repository:**
- [x] LICENSE file in repository root
- [x] Copyright headers in source files
- [x] Public GitHub repository
- [ ] Installation instructions in README
- [ ] Contribution guidelines

### ✅ **Web Application:**
- [ ] "Source Code" link in footer
- [ ] License information page
- [ ] Copyright notice in About page
- [ ] API endpoint for license info
- [ ] No obfuscation of source code

### ✅ **Documentation:**
- [x] LICENSING_GUIDE.md created
- [x] AGPL_COMPLIANCE.md created
- [ ] README updated with license info
- [ ] API documentation includes license
- [ ] User documentation mentions AGPL-3.0

### ✅ **Deployment:**
- [ ] Source code URL in environment variables
- [ ] License file included in Docker images
- [ ] Copyright notices in build artifacts
- [ ] Installation instructions accessible

---

## Example Footer Component

Create this file: `chandrahoro/frontend/src/components/layout/Footer.tsx`

```tsx
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © 2025 ChandraHoro Development Team
            </p>
            <p className="text-xs text-gray-400">
              Licensed under AGPL-3.0
            </p>
          </div>
          
          <div className="flex gap-4 text-sm">
            <a 
              href="https://github.com/[your-org]/chandrahoro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-400"
            >
              📦 Source Code
            </a>
            <Link href="/about/license" className="hover:text-blue-400">
              📄 License
            </Link>
            <Link href="/about" className="hover:text-blue-400">
              ℹ️ About
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>
            This is free software, and you are welcome to redistribute it
            under certain conditions. See the{' '}
            <Link href="/about/license" className="underline">
              AGPL-3.0 license
            </Link>{' '}
            for details.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## Next Steps

1. **Update README.md** - Add license badge and section
2. **Create Footer Component** - Add source code link
3. **Create License Page** - Full AGPL-3.0 text
4. **Update About Page** - Add copyright notice
5. **Test Compliance** - Verify all links work
6. **Deploy** - Ensure license info is visible in production

---

**Important:** AGPL-3.0 compliance is a legal requirement, not optional. Failure to comply can result in loss of license rights.

