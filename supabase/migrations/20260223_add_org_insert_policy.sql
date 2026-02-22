-- Add missing INSERT policy to organizations table
CREATE POLICY "Users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);
