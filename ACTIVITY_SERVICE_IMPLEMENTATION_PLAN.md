# Activity Service Implementation Plan

## Overview
Replace the hardcoded activity service in `frontend/src/services/activityService.js` with a real backend API implementation that tracks and retrieves user activities from the database.

## Current State
- **Frontend**: Hardcoded mock data in `activityService.js` with 3 static activities
- **Backend**: No activity tracking or endpoints exist
- **Database**: No activities table exists

## Implementation Plan

### Phase 1: Database Schema Setup

#### 1.1 Create Activities Table
**File**: `database/schema.sql` (add to existing schema)

Create a new `activities` table to store user activities:
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY to users)
- `action_type` (VARCHAR) - e.g., 'upload', 'update', 'delete', 'view'
- `entity_type` (VARCHAR) - e.g., 'document'
- `entity_id` (INTEGER) - ID of the affected entity (document_id)
- `description` (TEXT) - Human-readable activity description
- `metadata` (JSONB) - Additional context (document title, file name, etc.)
- `created_at` (TIMESTAMP)

**Indexes needed**:
- Index on `user_id` for user-specific queries
- Index on `created_at DESC` for recent activity queries
- Index on `entity_type` and `entity_id` for entity-specific queries

#### 1.2 Migration Strategy
- Add SQL migration script or update `schema.sql`
- Run migration on existing databases

---

### Phase 2: Backend Implementation

#### 2.1 Create Activity Controller
**File**: `backend/src/controllers/activityController.js` (NEW)

**Functions to implement**:
- `getRecentActivities(req, res)` - GET `/api/activities`
  - Query parameters: `limit` (default: 20), `offset` (default: 0), `user_id` (optional filter)
  - Returns: List of recent activities with user information
  - Join with users table to get user details (name, initials)

- `getActivitiesByUser(req, res)` - GET `/api/activities/user/:userId`
  - Returns activities for a specific user

- `getActivitiesByDocument(req, res)` - GET `/api/activities/document/:documentId`
  - Returns activities related to a specific document

**Response format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "initials": "JD"
      },
      "action": "uploaded a new document: Financial Report Q2.pdf",
      "action_type": "upload",
      "entity_type": "document",
      "entity_id": 123,
      "timestamp": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 20
}
```

#### 2.2 Create Activity Routes
**File**: `backend/src/routes/activityRoutes.js` (NEW)

**Routes**:
- `GET /api/activities` - Get recent activities (authenticated)
- `GET /api/activities/user/:userId` - Get user-specific activities (authenticated, admin or own user)
- `GET /api/activities/document/:documentId` - Get document-specific activities (authenticated)

**Middleware**: All routes require `authenticateToken`

#### 2.3 Create Activity Helper/Utility
**File**: `backend/src/utils/activityLogger.js` (NEW)

**Function**: `logActivity(userId, actionType, entityType, entityId, description, metadata)`
- Centralized function to log activities
- Can be called from any controller
- Handles database insertion

**Usage example**:
```javascript
const { logActivity } = require('../utils/activityLogger');

await logActivity(
  req.user.id,
  'upload',
  'document',
  document.id,
  `uploaded a new document: ${document.title}`,
  { file_name: document.file_name, file_type: document.file_type }
);
```

#### 2.4 Integrate Activity Logging into Document Controller
**File**: `backend/src/controllers/documentController.js` (MODIFY)

**Add activity logging to**:
1. `uploadDocument` - Log "upload" activity
2. `updateDocument` - Log "update" activity
3. `deleteDocument` - Log "delete" activity
4. `getDocumentById` - Optionally log "view" activity (if needed)

**Implementation**:
- Import `activityLogger` utility
- Call `logActivity()` after successful operations
- Include relevant metadata (document title, file name, etc.)

#### 2.5 Register Activity Routes
**File**: `backend/src/app.js` (MODIFY)

Add activity routes:
```javascript
const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activities', activityRoutes);
```

---

### Phase 3: Frontend Implementation

#### 3.1 Update Activity Service
**File**: `frontend/src/services/activityService.js` (MODIFY)

**Replace hardcoded implementation with**:
- Import `api` from `./api`
- `getRecentActivity(limit = 20)` - Calls `GET /api/activities?limit=${limit}`
- Transform API response to match existing component format
- Handle errors appropriately

**Transform function**:
- Convert `created_at` timestamp to relative time (e.g., "2 hours ago")
- Extract user initials from full name
- Format action description

#### 3.2 Update Activity Component (if needed)
**File**: `frontend/src/components/RecentActivity.jsx` (REVIEW)

**Check if modifications needed**:
- Verify data structure matches API response
- Add error handling for API failures
- Consider adding pagination or "load more" functionality
- Add refresh functionality

---

### Phase 4: Data Formatting & Utilities

#### 4.1 Create Time Formatting Utility
**File**: `frontend/src/utils/timeUtils.js` (NEW, optional)

**Function**: `formatRelativeTime(timestamp)`
- Converts ISO timestamp to relative time
- Examples: "2 hours ago", "1 day ago", "3 minutes ago"
- Can use a library like `date-fns` or implement custom logic

#### 4.2 User Initials Helper
**File**: `frontend/src/utils/userUtils.js` (NEW, optional)

**Function**: `getInitials(fullName)`
- Extract initials from full name
- Handle edge cases (single name, multiple names, etc.)

---

### Phase 5: Testing & Validation

#### 5.1 Backend Testing
- Test activity logging in document operations
- Test activity retrieval endpoints
- Test filtering and pagination
- Test authentication/authorization

#### 5.2 Frontend Testing
- Test activity service API calls
- Test error handling
- Test data transformation
- Verify UI displays correctly

#### 5.3 Integration Testing
- Upload document → verify activity logged
- Update document → verify activity logged
- Delete document → verify activity logged
- View recent activities → verify correct data displayed

---

## Implementation Order

1. **Database Schema** (Phase 1)
   - Create activities table
   - Run migration

2. **Backend Core** (Phase 2.1, 2.2, 2.3)
   - Create activity logger utility
   - Create activity controller
   - Create activity routes
   - Register routes in app.js

3. **Backend Integration** (Phase 2.4)
   - Add activity logging to document controller

4. **Frontend Service** (Phase 3.1)
   - Replace hardcoded service with API calls
   - Add data transformation

5. **Frontend Utilities** (Phase 4, optional)
   - Add time formatting utilities if needed

6. **Testing** (Phase 5)
   - Test all functionality
   - Fix any issues

---

## Files to Create

1. `backend/src/controllers/activityController.js` - NEW
2. `backend/src/routes/activityRoutes.js` - NEW
3. `backend/src/utils/activityLogger.js` - NEW
4. `frontend/src/utils/timeUtils.js` - NEW (optional)
5. `frontend/src/utils/userUtils.js` - NEW (optional)

## Files to Modify

1. `database/schema.sql` - Add activities table
2. `backend/src/app.js` - Register activity routes
3. `backend/src/controllers/documentController.js` - Add activity logging
4. `frontend/src/services/activityService.js` - Replace hardcoded data
5. `frontend/src/components/RecentActivity.jsx` - Review and update if needed

---

## API Endpoints Summary

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

## Data Flow

1. **Activity Creation**:
   - User performs action (upload/update/delete document)
   - Document controller calls `logActivity()`
   - Activity logged to database

2. **Activity Retrieval**:
   - Frontend calls `getRecentActivity()`
   - Service makes API call to `/api/activities`
   - Backend queries database, joins with users table
   - Response transformed and returned to component
   - Component displays activities

---

## Considerations

1. **Performance**:
   - Indexes on frequently queried columns
   - Limit default query results
   - Consider pagination for large datasets

2. **Privacy**:
   - Users should only see activities they have permission to view
   - Consider filtering sensitive information

3. **Scalability**:
   - Consider archiving old activities if table grows large
   - May need activity cleanup/retention policy

4. **Error Handling**:
   - Activity logging should not fail document operations
   - Log errors but don't throw
   - Frontend should handle API failures gracefully

5. **Backward Compatibility**:
   - Ensure frontend component still works with new data format
   - Maintain similar data structure if possible

---

## Success Criteria

- ✅ Activities are logged when documents are uploaded, updated, or deleted
- ✅ Recent activities are displayed in the dashboard
- ✅ Activities show correct user information
- ✅ Activities show correct timestamps (relative time)
- ✅ No hardcoded data remains in activity service
- ✅ All API endpoints work correctly
- ✅ Error handling is in place
- ✅ Performance is acceptable

---

## Estimated Implementation Time

- Database schema: 30 minutes
- Backend implementation: 2-3 hours
- Frontend implementation: 1-2 hours
- Testing and debugging: 1-2 hours
- **Total**: ~5-8 hours

