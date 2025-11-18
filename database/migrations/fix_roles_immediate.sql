-- Immediate Fix: Update User Roles Constraint
-- Run this immediately if you're getting constraint violation errors

-- Step 1: Update any existing 'user' roles to 'student'
UPDATE users SET role = 'student' WHERE role = 'user';

-- Step 2: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Add the new constraint
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'faculty', 'admin'));

-- Step 4: Update the default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_role_check';

