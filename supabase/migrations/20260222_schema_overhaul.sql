-- Schema Overhaul: Simplified database structur
-- This migration drops old tables and creates the new simplified schema

-- Drop old deprecated tables
DROP TABLE IF EXISTS daily_summaries CASCADE;
DROP TABLE IF EXISTS safety_alerts CASCADE;
DROP TABLE IF EXISTS video_uploads CASCADE;
DROP TABLE IF EXISTS planned_tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop new schema tables if they exist (for idempotency)
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS safety CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT UNIQUE,
  user_ids UUID[] DEFAULT '{}',
  project_ids UUID[] DEFAULT '{}',
  procore_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT,
  name TEXT,
  trade TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  project_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  date DATE,
  ended_date DATE,
  task_ids UUID[] DEFAULT '{}',
  user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SAFETY TABLE (created before tasks due to foreign key)
-- ============================================
CREATE TABLE safety (
  safety_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  uri TEXT,
  task_id UUID,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  safety_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_id UUID REFERENCES safety(safety_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  start DATE,
  "end" DATE,
  assignees UUID[] DEFAULT '{}',
  trade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. VIDEOS TABLE
-- ============================================
CREATE TABLE videos (
  video_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uri TEXT NOT NULL,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  start TIMESTAMPTZ,
  endtime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the task_id foreign key to safety table now that tasks exists
ALTER TABLE safety 
ADD CONSTRAINT safety_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_safety_task ON safety(task_id);
CREATE INDEX idx_safety_user ON safety(user_id);
CREATE INDEX idx_videos_user ON videos(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
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

CREATE POLICY "Users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Users can view organization members"
  ON users FOR SELECT
  USING (
    organization_id IS NOT NULL AND 
    organization_id = public.get_current_user_org()
  );

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Users can view projects they are assigned to"
  ON projects FOR SELECT
  USING (user_ids @> ARRAY[auth.uid()]);

CREATE POLICY "Users can update projects they are assigned to"
  ON projects FOR UPDATE
  USING (user_ids @> ARRAY[auth.uid()]);

CREATE POLICY "Users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (user_ids @> ARRAY[auth.uid()]);

CREATE POLICY "Users can delete projects they are assigned to"
  ON projects FOR DELETE
  USING (user_ids @> ARRAY[auth.uid()]);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks they are assigned to"
  ON tasks FOR SELECT
  USING (assignees @> ARRAY[auth.uid()]);

CREATE POLICY "Users can update tasks they are assigned to"
  ON tasks FOR UPDATE
  USING (assignees @> ARRAY[auth.uid()]);

CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete tasks they are assigned to"
  ON tasks FOR DELETE
  USING (assignees @> ARRAY[auth.uid()]);

-- RLS Policies for safety
CREATE POLICY "Users can view safety entries for their tasks"
  ON safety FOR SELECT
  USING (
    user_id = auth.uid() OR
    task_id IN (SELECT id FROM tasks WHERE assignees @> ARRAY[auth.uid()])
  );

CREATE POLICY "Users can insert safety entries"
  ON safety FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their safety entries"
  ON safety FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_updated_at
  BEFORE UPDATE ON safety
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Handle new user signup (link to auth.users)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'field_worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
