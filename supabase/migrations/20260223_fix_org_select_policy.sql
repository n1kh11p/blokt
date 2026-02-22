-- Drop old policies first
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;

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
