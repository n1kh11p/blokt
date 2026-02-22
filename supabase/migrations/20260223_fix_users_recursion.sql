-- Fix infinite recursion in users table RLS policy

-- Drop any previous restrictive policies built around the users table SELECT
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Users can view organization members" ON users;

-- 1. Unrestrictive policy for self-view
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (user_id = auth.uid());

-- 2. Create a SECURITY DEFINER function to bypass RLS for lookups
-- This ensures that looking up your own org doesn't trigger a recursive evaluation 
-- of the policies on the users table.
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Policy leveraging the secure function
CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (
    organization_id IS NOT NULL AND 
    organization_id = public.get_current_user_org()
  );
