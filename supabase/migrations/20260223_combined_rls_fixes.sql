-- ==========================================
-- COMBINED RLS FIXES
-- Run this in your Supabase SQL Editor
-- ==========================================

-- ------------------------------------------
-- 1. FIX ORGANIZATIONS POLICIES
-- ------------------------------------------
-- Drop old restrictive organization policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;

-- Recreate with proper permissions allowing creators to read their newly created orgs via user_ids
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM users WHERE user_id = auth.uid()) OR
    user_ids @> ARRAY[auth.uid()]
  );

CREATE POLICY "Users can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (SELECT organization_id FROM users WHERE user_id = auth.uid()) OR
    user_ids @> ARRAY[auth.uid()]
  );

-- Add missing INSERT policy
CREATE POLICY "Users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);


-- ------------------------------------------
-- 2. FIX USERS TABLE RECURSION
-- ------------------------------------------
-- Drop any previous restrictive policies built around the users table SELECT
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can view organization members" ON users;

-- Unrestrictive policy for self-view
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (user_id = auth.uid());

-- Create a SECURITY DEFINER function to bypass RLS for lookups
-- This ensures that looking up your own org doesn't trigger a recursive evaluation 
-- of the policies on the users table.
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy leveraging the secure function
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (
    organization_id IS NOT NULL AND 
    organization_id = public.get_current_user_org()
  );
