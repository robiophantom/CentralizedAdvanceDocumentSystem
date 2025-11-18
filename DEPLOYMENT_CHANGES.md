# Deployment Changes for Activity Service Implementation

This document outlines all the changes that need to be made to deployed services to implement the real activity service.

## Summary
The hardcoded activity service has been replaced with a real backend API implementation. Activities are now tracked in the database and retrieved via API endpoints.

---

## 1. Database Changes

### 1.1 Run Database Migration

**Action Required**: Run the migration script to create the `activities` table.

**File**: `database/migrations/add_activities_table.sql`

**Command** (if using psql):
```bash
psql -U your_username -d your_database -f database/migrations/add_activities_table.sql
```

**Or via Node.js** (if you have a migration runner):
```javascript
const { query } = require('./src/config/database');
const fs = require('fs');
const migration = fs.readFileSync('database/migrations/add_activities_table.sql', 'utf8');
await query(migration);
```

**Note**: If your database already has the activities table (from schema.sql), you can skip this step. The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run.

---

## 2. Backend Deployment Changes

### 2.1 New Files to Deploy

Deploy these new files to your backend server:

1. **`backend/src/utils/activityLogger.js`**
   - Utility function for logging activities
   - No dependencies on new packages

2. **`backend/src/controllers/activityController.js`**
   - Controller for activity endpoints
   - No dependencies on new packages

3. **`backend/src/routes/activityRoutes.js`**
   - Routes for activity API endpoints
   - No dependencies on new packages

### 2.2 Modified Files to Deploy

Update these existing files:

1. **`backend/src/app.js`**
   - Added import: `const activityRoutes = require('./routes/activityRoutes');`
   - Added route: `app.use('/api/activities', activityRoutes);`
   - Updated root endpoint to include activities in endpoints list

2. **`backend/src/controllers/documentController.js`**
   - Added import: `const { logActivity } = require('../utils/activityLogger');`
   - Added activity logging in `uploadDocument()` function
   - Added activity logging in `updateDocument()` function
   - Added activity logging in `deleteDocument()` function

### 2.3 No New Dependencies Required

✅ All changes use existing dependencies (express, pg, etc.)
✅ No new npm packages need to be installed

### 2.4 Backend Deployment Steps

1. **Pull/upload new and modified files** to your backend server
2. **Restart the backend service** to load new routes and controllers
3. **Verify the new endpoint** is accessible:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://your-api-url/api/activities
   ```

---

## 3. Frontend Deployment Changes

### 3.1 New Files to Deploy

Deploy these new files to your frontend:

1. **`frontend/src/utils/timeUtils.js`**
   - Utility functions for time formatting and user initials
   - No dependencies on new packages

### 3.2 Modified Files to Deploy

Update these existing files:

1. **`frontend/src/services/activityService.js`**
   - **COMPLETELY REPLACED** - Removed all hardcoded mock data
   - Now makes real API calls to `/api/activities`
   - Uses `formatRelativeTime` utility for timestamp formatting

2. **`frontend/src/components/RecentActivity.jsx`**
   - Minor update: Added empty state handling
   - Improved loading state display
   - No breaking changes to component interface

### 3.3 No New Dependencies Required

✅ All changes use existing dependencies (axios, react, etc.)
✅ No new npm packages need to be installed

### 3.4 Frontend Deployment Steps

1. **Pull/upload new and modified files** to your frontend server
2. **Rebuild the frontend** (if using a build process):
   ```bash
   npm run build
   ```
3. **Restart frontend service** (if applicable)
4. **Clear browser cache** or do a hard refresh to load new JavaScript

---

## 4. API Endpoints Added

The following new API endpoints are now available:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/activities` | Get recent activities | Yes |
| GET | `/api/activities/user/:userId` | Get user-specific activities | Yes (admin or own) |
| GET | `/api/activities/document/:documentId` | Get document-specific activities | Yes |

**Query Parameters for `/api/activities`**:
- `limit` (number, default: 20) - Number of activities to return
- `offset` (number, default: 0) - Pagination offset
- `user_id` (number, optional) - Filter by user ID

---

## 5. Testing After Deployment

### 5.1 Backend Testing

1. **Test activity logging**:
   - Upload a document → Check database for activity entry
   - Update a document → Check database for activity entry
   - Delete a document → Check database for activity entry

2. **Test activity retrieval**:
   ```bash
   # Get recent activities
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://your-api-url/api/activities?limit=10
   ```

3. **Verify database**:
   ```sql
   SELECT * FROM activities ORDER BY created_at DESC LIMIT 10;
   ```

### 5.2 Frontend Testing

1. **Check Dashboard**:
   - Navigate to dashboard
   - Verify "Recent Activity" section displays real activities
   - Verify timestamps show relative time (e.g., "2 hours ago")

2. **Test activity flow**:
   - Upload a document → Activity should appear in Recent Activity
   - Update a document → Activity should appear
   - Delete a document → Activity should appear

3. **Test error handling**:
   - If API fails, should show "No recent activity" instead of crashing

---

## 6. Rollback Plan (If Needed)

If you need to rollback:

1. **Frontend**: Revert `activityService.js` to previous version with mock data
2. **Backend**: Remove activity routes from `app.js` (optional, won't break if left)
3. **Database**: Activities table can remain (won't affect other functionality)

**Note**: The activity logging in document controller won't break anything if the activities table doesn't exist - it will just log errors to console.

---

## 7. Environment Variables

**No new environment variables required** ✅

All existing environment variables remain the same.

---

## 8. Performance Considerations

- **Database Indexes**: Already created in migration for optimal query performance
- **Default Limit**: Activities endpoint defaults to 20 items to prevent large payloads
- **Error Handling**: Activity logging failures won't break document operations

---

## 9. Security Considerations

- All activity endpoints require authentication (`authenticateToken` middleware)
- User-specific activities can only be accessed by the user themselves or admins
- Activity logging includes user context from authenticated requests

---

## 10. Checklist for Deployment

- [ ] Run database migration script
- [ ] Deploy new backend files (3 new files)
- [ ] Update modified backend files (2 files)
- [ ] Restart backend service
- [ ] Test backend API endpoints
- [ ] Deploy new frontend file (1 new file)
- [ ] Update modified frontend files (2 files)
- [ ] Rebuild frontend (if needed)
- [ ] Restart frontend service (if needed)
- [ ] Test frontend functionality
- [ ] Verify activities are being logged
- [ ] Verify activities are being displayed

---

## 11. Files Changed Summary

### Backend (5 files)
- ✅ **NEW**: `backend/src/utils/activityLogger.js`
- ✅ **NEW**: `backend/src/controllers/activityController.js`
- ✅ **NEW**: `backend/src/routes/activityRoutes.js`
- ✅ **MODIFIED**: `backend/src/app.js`
- ✅ **MODIFIED**: `backend/src/controllers/documentController.js`

### Frontend (3 files)
- ✅ **NEW**: `frontend/src/utils/timeUtils.js`
- ✅ **MODIFIED**: `frontend/src/services/activityService.js` (completely replaced)
- ✅ **MODIFIED**: `frontend/src/components/RecentActivity.jsx` (minor updates)

### Database (1 file)
- ✅ **NEW**: `database/migrations/add_activities_table.sql`

---

## 12. Support

If you encounter any issues:

1. Check backend logs for activity-related errors
2. Verify database migration ran successfully
3. Check that activities table exists: `SELECT * FROM activities LIMIT 1;`
4. Verify API endpoint is accessible and returns data
5. Check browser console for frontend errors
6. Verify authentication token is being sent with requests

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Status**: ☐ Pending | ☐ In Progress | ☐ Completed | ☐ Rolled Back

