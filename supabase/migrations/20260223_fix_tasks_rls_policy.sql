-- Drop restrictive tasks policies
DROP POLICY IF EXISTS "Users can view tasks they are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they are assigned to" ON tasks;

-- Create more permissive policies for authenticated users
CREATE POLICY "Users can view tasks"
  ON tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete tasks"
  ON tasks FOR DELETE
  USING (auth.uid() IS NOT NULL);
