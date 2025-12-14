# AI Reports Feature - Deployment Guide

## 🎯 What's Been Deployed

All code has been committed and pushed to GitHub (`main` branch). The following features are ready for deployment:

### Backend Changes
- ✅ AI report database models (`AiGeneratedReport`, `ReportShare`)
- ✅ Pydantic schemas for all report operations
- ✅ Service layer (`AiReportService`) with full CRUD operations
- ✅ API endpoints at `/api/v1/ai-reports/`
- ✅ Auto-save integration in AI interpretation endpoint
- ✅ Database migration (`aa963991c245_add_ai_generated_reports.py`)

### Frontend Changes
- ✅ Download & "My Reports" buttons in AI interpretation modal
- ✅ My Reports page (`/my-reports`) with filtering and pagination
- ✅ Navigation menu updated with "My Reports" link
- ✅ HTML report download functionality

## 📋 Deployment Steps

### Option 1: SSH Deployment (Recommended)

```bash
# 1. SSH into your VPS
ssh chandrahoro@72.61.174.232

# 2. Navigate to project directory
cd /home/chandrahoro/chandrahoro

# 3. Pull latest code
git pull origin main

# 4. Backend deployment
cd chandrahoro/backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head  # Run database migration
sudo systemctl restart chandrahoro-backend

# 5. Frontend deployment
cd ../frontend
npm install
npm run build
pm2 restart chandrahoro-frontend

# 6. Verify deployment
sudo systemctl status chandrahoro-backend
pm2 list | grep chandrahoro
```

### Option 2: If You Need to Deploy from Root User

```bash
# SSH as root
ssh root@72.61.174.232

# Navigate to project
cd /root/chandrahoro  # Or wherever your project is

# Follow same steps as above but with appropriate paths
git pull origin main
cd chandrahoro/backend
# ... continue with deployment steps
```

## 🗄️ Database Migration Details

The migration creates two new tables:

### `ai_generated_reports`
- Stores all AI-generated astrology reports
- Includes HTML content, birth details, versioning
- Tracks views, downloads, user ratings

### `ai_report_shares`
- Enables report sharing via unique tokens
- Supports expiration and view limits
- Tracks access statistics

**Migration file:** `backend/alembic/versions/aa963991c245_add_ai_generated_reports.py`

## ✅ Verification Steps

After deployment, verify the features work:

1. **Visit Application**
   - URL: https://jyotishdrishti.valuestream.in
   - Login with your account

2. **Test AI Report Generation**
   - Navigate to AI Insights
   - Generate a chart interpretation
   - Verify you see "Download" and "My Reports" buttons

3. **Test Download**
   - Click "Download" button
   - Verify HTML file is downloaded
   - Open HTML file in browser - should display nicely formatted report

4. **Test My Reports Page**
   - Click "My Reports" from user menu
   - Verify your generated report appears
   - Test filtering by report type
   - Test View, Download, and Delete actions

5. **Test Persistence**
   - Logout
   - Login again
   - Navigate to My Reports
   - Verify reports are still there

## 🔧 Troubleshooting

### Backend Issues

**Check backend logs:**
```bash
sudo journalctl -u chandrahoro-backend -n 50 --no-pager
```

**Check if backend is running:**
```bash
sudo systemctl status chandrahoro-backend
```

**Restart backend:**
```bash
sudo systemctl restart chandrahoro-backend
```

### Frontend Issues

**Check frontend logs:**
```bash
pm2 logs chandrahoro-frontend --lines 50
```

**Restart frontend:**
```bash
pm2 restart chandrahoro-frontend
```

### Database Issues

**Check migration status:**
```bash
cd /path/to/chandrahoro/backend
source venv/bin/activate
alembic current
alembic history
```

**Manually run migration:**
```bash
alembic upgrade head
```

### Common Issues

1. **"No module named 'app.api.v1.ai_reports'"**
   - Solution: Make sure you restarted the backend service

2. **"Table 'ai_generated_reports' doesn't exist"**
   - Solution: Run `alembic upgrade head`

3. **Downloads not working**
   - Check CORS settings in backend
   - Verify authorization token is being sent

4. **My Reports page shows 404**
   - Rebuild frontend: `npm run build`
   - Restart frontend: `pm2 restart chandrahoro-frontend`

## 📊 API Endpoints Reference

All endpoints require authentication (`Authorization: Bearer <token>`):

- `POST /api/v1/ai-reports/` - Save new report
- `GET /api/v1/ai-reports/` - List reports (with pagination & filters)
- `GET /api/v1/ai-reports/{id}` - Get specific report
- `GET /api/v1/ai-reports/{id}/download` - Download as HTML
- `PUT /api/v1/ai-reports/{id}` - Update report metadata
- `DELETE /api/v1/ai-reports/{id}` - Delete report
- `POST /api/v1/ai-reports/{id}/regenerate` - Regenerate report
- `POST /api/v1/ai-reports/{id}/share` - Create share link
- `GET /api/v1/ai-reports/stats/summary` - Get user statistics

## 🎨 Features Highlights

### Auto-Save
- Reports are automatically saved to database after AI generation
- No manual save action required
- Backend returns `report_id` in response

### HTML Output
- Default prompts generate complete HTML documents
- Embedded CSS for beautiful formatting
- Mobile-friendly and printable
- Ready for download and offline viewing

### Versioning
- Regenerating creates new version (1.0 → 1.1)
- Previous versions are preserved
- `is_latest` flag indicates current version

### Hybrid UX
- **In Modal:** Quick download and view buttons
- **My Reports Page:** Full management interface with filtering

## 📝 Git Commits

The following commits were made:

1. **HTML output and report models** (`3c1434c`)
   - Changed prompts to HTML format
   - Created database models

2. **Backend API system** (`fff750d`)
   - API endpoints
   - Service layer
   - Auto-save integration

3. **Frontend UI** (`c47500b`)
   - Download/view buttons
   - My Reports page
   - Navigation updates

4. **Database migration** (`1520172`)
   - Alembic migration file

## 🚀 Production Checklist

- [ ] Git pull completed
- [ ] Python dependencies installed
- [ ] Database migration run successfully
- [ ] Backend service restarted
- [ ] Frontend rebuilt
- [ ] Frontend service restarted
- [ ] Can access My Reports page
- [ ] Can generate and download reports
- [ ] Reports persist after logout/login
- [ ] All CRUD operations working

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review backend/frontend logs
3. Verify database migration completed
4. Ensure all services are running

---

**Deployment Date:** December 14, 2025
**Version:** v2.1 - AI Reports Management
**Production URL:** https://jyotishdrishti.valuestream.in
