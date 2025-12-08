# AI Prompt Configuration - Quick Reference Card

## 🚀 **Quick Access**

**URL**: `http://localhost:3000/ai-prompt-config`

**Navigation**: Profile Icon → AI Prompt Config

---

## 📋 **Quick Actions**

### **First-Time Setup (Admin Only)**
```
1. Navigate to /ai-prompt-config
2. Click "Initialize Defaults"
3. Wait for confirmation ✅
```

### **Create Custom Prompt**
```
1. Find module → Click "Configure"
2. Toggle "Use Custom Prompt"
3. Edit prompt text
4. Click variable badges to insert
5. Click "Test Prompt" → Review preview
6. Click "Save" ✅
```

### **Edit Custom Prompt**
```
1. Click "Configure" on module with "Custom" badge
2. Edit prompt
3. Test changes
4. Save ✅
```

### **Reset to Default**
```
1. Click "Reset" on module
2. Confirm
3. Done ✅
```

---

## 🎯 **15 AI Modules**

| # | Module | Purpose |
|---|--------|---------|
| 1 | Chart Interpretation | Birth chart analysis |
| 2 | Dasha Predictions | Planetary periods |
| 3 | Transit Analysis | Current transits |
| 4 | Yoga Analysis | Planetary yogas |
| 5 | Remedial Measures | Personalized remedies |
| 6 | Compatibility Analysis | Relationship compatibility |
| 7 | Match Horoscope | Kundali Milan |
| 8 | Personality Insights | Personality analysis |
| 9 | Career Guidance | Career predictions |
| 10 | Relationship Insights | Relationship analysis |
| 11 | Health Analysis | Health predictions |
| 12 | Financial Predictions | Financial forecasts |
| 13 | Prashna (Horary) | Horary astrology |
| 14 | Daily Predictions | Daily forecasts |
| 15 | Chat | AI chat interactions |

---

## 🔧 **Template Variables**

| Variable | Description |
|----------|-------------|
| `{chart_data}` | Complete birth chart data |
| `{birth_info}` | Birth date, time, location |
| `{planets}` | Planetary positions |
| `{houses}` | House cusps and lords |
| `{aspects}` | Planetary aspects |
| `{current_dasha}` | Current dasha period |
| `{upcoming_dashas}` | Future dasha periods |
| `{current_transits}` | Current transits |
| `{yogas}` | Planetary yogas |
| `{primary_chart}` | Primary chart (compatibility) |
| `{partner_chart}` | Partner chart (compatibility) |
| `{question}` | User question (chat/prashna) |
| `{conversation_history}` | Chat history |
| `{focus_areas}` | Areas of interest |

---

## ⚙️ **Configuration Options**

| Setting | Range | Default | Purpose |
|---------|-------|---------|---------|
| Temperature | 0.0 - 2.0 | 0.7 | Creativity level |
| Max Tokens | 100 - 8000 | 2000 | Response length |
| Output Format | Markdown/Plain | Markdown | Response format |
| Enable/Disable | Toggle | Enabled | Activate prompt |

---

## 🧪 **Testing**

**Test Endpoint**: `POST /api/v1/ai-prompts/test`

**What You Get**:
- ✅ Filled prompt with sample data
- ✅ Template variables used
- ✅ Missing variables warnings
- ✅ General warnings

**When to Test**:
- Before saving new prompts
- After editing existing prompts
- When adding new variables
- To verify prompt structure

---

## 📊 **Page Sections**

```
┌─────────────────────────────────────┐
│ Header (Title + Status Badges)      │
├─────────────────────────────────────┤
│ Info Banner                         │
├─────────────────────────────────────┤
│ Admin Controls (Admin Only)         │
├─────────────────────────────────────┤
│ Search & Refresh                    │
├─────────────────────────────────────┤
│ Modules Grid (15 cards)             │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │ Mod │ │ Mod │ │ Mod │            │
│ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────┤
│ Footer (Privacy + Terms)            │
└─────────────────────────────────────┘
```

---

## 🎨 **Status Badges**

| Badge | Meaning |
|-------|---------|
| **Custom** | Using custom prompt |
| **System Default** | Using system default |
| **Admin Access** | Admin/owner user |

---

## 📁 **Key Files**

```
frontend/src/pages/ai-prompt-config.tsx
  → Main page (375 lines)

frontend/src/components/ai-prompts/
  → PromptModuleCard.tsx
  → PromptEditorDialog.tsx

frontend/src/lib/api/ai-prompts.ts
  → API client functions

frontend/src/types/ai-prompts.ts
  → TypeScript types
```

---

## 🔗 **API Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/ai-prompts/modules` | List all modules |
| GET | `/api/v1/ai-prompts/` | Get user prompts |
| POST | `/api/v1/ai-prompts/` | Create custom prompt |
| PUT | `/api/v1/ai-prompts/{id}` | Update prompt |
| DELETE | `/api/v1/ai-prompts/{id}` | Delete prompt |
| POST | `/api/v1/ai-prompts/{id}/reset` | Reset to default |
| POST | `/api/v1/ai-prompts/initialize-defaults` | Initialize defaults (admin) |
| POST | `/api/v1/ai-prompts/test` | Test prompt |

---

## 💡 **Tips**

1. **Always test before saving** - Use the Test Prompt button
2. **Use template variables** - Click badges to insert them
3. **Start with defaults** - View system defaults for inspiration
4. **Adjust temperature** - Lower for consistency, higher for creativity
5. **Set appropriate max_tokens** - Balance detail vs. cost
6. **Search to find modules** - Use the search bar for quick access
7. **Admin: Initialize first** - Run Initialize Defaults before users configure

---

## ⚠️ **Common Issues**

| Issue | Solution |
|-------|----------|
| No modules showing | Click "Initialize Defaults" (admin) |
| Test fails | Check template variables are correct |
| Can't save | Ensure you're logged in |
| Reset not working | Confirm you have a custom prompt |
| Search not working | Clear search and try again |

---

## 📞 **Documentation**

- **Full Guide**: `AI_PROMPT_CONFIG_PAGE.md`
- **Visual Guide**: `AI_PROMPT_CONFIG_VISUAL_GUIDE.md`
- **Summary**: `AI_PROMPT_CONFIG_SUMMARY.md`
- **API Docs**: `http://localhost:8000/docs`

---

**Last Updated**: 2025-11-26  
**Print this card for quick reference!** 📄

