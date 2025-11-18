-- Migration: Update User Roles
-- This migration updates the users table to support student, faculty, and admin roles
-- Run this on existing databases that have the old constraint

-- First, update existing 'user' role to 'student'
UPDATE users SET role = 'student' WHERE role = 'user';

-- Drop the old constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'faculty', 'admin'));

-- Update default role to 'student' if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role' 
    AND column_default != '''student''::character varying'
  ) THEN
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
  END IF;
END $$;
