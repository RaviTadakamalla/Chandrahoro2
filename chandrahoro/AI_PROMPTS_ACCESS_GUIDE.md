# How to Access AI Prompt Configuration

## 📍 **Correct Path to AI Prompts Settings**

The AI Prompt Configuration feature has been integrated into the existing Settings page.

### **Access Instructions:**

1. **Login to ChandraHoro**
   - Go to `http://localhost:3000` (or your deployed URL)
   - Login with your credentials

2. **Navigate to Settings**
   - Click on **"Settings"** in the navigation menu
   - Or go directly to: `http://localhost:3000/settings`

3. **Find AI Prompt Configuration**
   - Scroll down the Settings page
   - Look for the **"AI Prompt Configuration"** card
   - It has a **Sparkles icon** (✨) and is located between "Notification Settings" and "Privacy & Security"

## 🎨 **What You'll See**

The AI Prompt Configuration section includes:

- **Header**: "AI Prompt Configuration" with Sparkles icon
- **Description**: "Customize AI prompts for each insight module"
- **Statistics Dashboard**: Shows total modules, custom prompts, and defaults
- **Search Bar**: Filter modules by name or description
- **Module Grid**: All 15 AI modules displayed as cards
- **Admin Controls**: "Initialize Defaults" button (admin/owner only)

## 📋 **Settings Page Structure**

The Settings page (`/settings`) now contains these sections in order:

1. **Profile Settings** - Manage account information
2. **Password** - Change password
3. **Appearance** - Theme settings (Light/Dark)
4. **Notifications** - Notification preferences
5. **AI Prompt Configuration** ⭐ **NEW!**
6. **Privacy & Security** - Privacy settings
7. **About** - Application information

## 🔧 **Technical Details**

### File Structure:
```
frontend/src/pages/settings.tsx
  └── Imports AiPromptsSettings component
      └── Located at: frontend/src/components/settings/AiPromptsSettings.tsx
```

### Component Hierarchy:
```
settings.tsx (Page)
  └── AiPromptsSettings (Component)
      ├── Statistics Cards
      ├── Search Bar
      ├── Module Grid
      │   └── PromptModuleCard (for each module)
      └── PromptEditorDialog (modal)
```

## 🚀 **Quick Test**

To verify the feature is working:

```bash
# 1. Make sure backend is running
cd chandrahoro/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Make sure frontend is running
cd chandrahoro/frontend
npm run dev

# 3. Open browser
# Navigate to: http://localhost:3000/settings
# Scroll to "AI Prompt Configuration" section
```

## 📸 **Visual Guide**

### Location on Settings Page:
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ Profile Settings                    │
│ Password                            │
│ Appearance                          │
│ Notifications                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✨ AI Prompt Configuration      │ │ ← YOU ARE HERE
│ │ Customize AI prompts for each   │ │
│ │ insight module                  │ │
│ │                                 │ │
│ │ [Statistics Dashboard]          │ │
│ │ [Search Bar]                    │ │
│ │ [Module Grid - 15 modules]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Privacy & Security                  │
│ About                               │
└─────────────────────────────────────┘
```

## ❓ **Troubleshooting**

### "I don't see the AI Prompt Configuration section"

**Possible causes:**
1. **Frontend not rebuilt**: Run `npm run dev` or `npm run build`
2. **Browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Not logged in**: Make sure you're authenticated
4. **Component import error**: Check browser console for errors

**Solution:**
```bash
# Stop frontend
# Ctrl+C

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies (if needed)
npm install

# Restart frontend
npm run dev
```

### "I see the section but no modules are loading"

**Possible causes:**
1. **Backend not running**: Check if backend is accessible at `http://localhost:8000`
2. **API endpoint error**: Check browser console and network tab
3. **Authentication issue**: Make sure you're logged in with valid token

**Solution:**
```bash
# Check backend health
curl http://localhost:8000/health

# Check API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/ai-prompts/modules

# Check backend logs for errors
```

### "Initialize Defaults button doesn't appear"

**Cause:** You're not logged in as admin or owner

**Solution:** Login with an admin/owner account. Regular users won't see this button.

## 📞 **Need Help?**

- **Full Documentation**: See `AI_PROMPTS_UI_IMPLEMENTATION.md`
- **Quick Start Guide**: See `AI_PROMPTS_QUICK_START.md`
- **API Documentation**: Visit `http://localhost:8000/docs`

---

**Last Updated**: 2025-11-26
**Feature Status**: ✅ Complete and Integrated

