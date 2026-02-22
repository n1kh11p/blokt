-- Fix RLS policy on users table to allow users to view their own record
-- This fixes the issue where new users can't see their own record because they don't have an organization_id yet

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;

-- Create simple policy that allows viewing own record
-- (We'll handle organization-based viewing separately if needed)
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (user_id = auth.uid());

-- Add policy to view other users in same organization (non-recursive)
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (
    organization_id IS NOT NULL AND 
    organization_id = (
      SELECT u.organization_id 
      FROM auth.users au
      LEFT JOIN public.users u ON u.user_id = au.id
      WHERE au.id = auth.uid()
      LIMIT 1
    )
  );
