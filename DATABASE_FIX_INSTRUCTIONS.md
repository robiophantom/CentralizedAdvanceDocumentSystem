# Database Constraint Fix - Immediate Action Required

## Problem
The database still has the old role constraint that only allows `'admin'` and `'user'`, but the code is trying to insert `'student'`. This causes the error:
```
ERROR: 23514: new row for relation "users" violates check constraint "users_role_check"
```

## Solution

### Option 1: Run SQL Migration (Recommended)

Run this SQL script directly on your database:

```sql
-- Step 1: Update any existing 'user' roles to 'student'
UPDATE users SET role = 'student' WHERE role = 'user';

-- Step 2: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add the new constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'faculty', 'admin'));

-- Step 4: Update the default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
```

### Option 2: Using psql Command Line

If you have access to psql:

```bash
psql -U your_username -d your_database_name -f database/migrations/fix_roles_immediate.sql
```

### Option 3: Using Database GUI Tool

1. Open your database management tool (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Open a SQL query window
4. Copy and paste the SQL from `database/migrations/fix_roles_immediate.sql`
5. Execute the query

### Option 4: Using Node.js Script

Create a temporary script to run the migration:

```javascript
// fix_roles.js
const { query, pool } = require('./backend/src/config/database');
const fs = require('fs');

const fixRoles = async () => {
  try {
    const migration = fs.readFileSync('database/migrations/fix_roles_immediate.sql', 'utf8');
    await query(migration);
    console.log('✅ Role constraint updated successfully!');
  } catch (error) {
    console.error('❌ Error updating roles:', error);
  } finally {
    await pool.end();
  }
};

fixRoles();
```

Run it:
```bash
cd backend
node fix_roles.js
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_role_check';

-- Should show: CHECK (role IN ('student', 'faculty', 'admin'))
```

## Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Existing Users**: The migration will update any existing users with role 'user' to 'student'
3. **No Data Loss**: This migration only changes constraints and defaults, no data is deleted

## After Migration

Once the migration is complete:
- New registrations will default to 'student' role
- The constraint will accept 'student', 'faculty', and 'admin' roles
- The error should be resolved

