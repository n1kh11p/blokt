-- Blokt Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('project_manager', 'foreman', 'field_worker', 'safety_manager', 'executive');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');
CREATE TYPE event_source AS ENUM ('video_ai', 'manual', 'verbal');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  procore_company_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'field_worker',
  organization_id UUID REFERENCES organizations(id),
  trade TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  status project_status DEFAULT 'active',
  organization_id UUID NOT NULL REFERENCES organizations(id),
  procore_project_id TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project members (junction table)
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Planned tasks (from lookahead schedules)
CREATE TABLE planned_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  planned_start DATE NOT NULL,
  planned_end DATE NOT NULL,
  location_context TEXT,
  trade TEXT,
  status task_status DEFAULT 'pending',
  procore_task_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video uploads
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration_seconds INTEGER,
  upload_date DATE DEFAULT CURRENT_DATE,
  recording_date DATE,
  processing_status processing_status DEFAULT 'pending',
  tagged_tasks TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Observed events (from AI or manual entry)
CREATE TABLE observed_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES profiles(id),
  task_id UUID REFERENCES planned_tasks(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  confidence_score DECIMAL(5,2),
  safety_flags TEXT[],
  source event_source DEFAULT 'manual',
  video_upload_id UUID REFERENCES video_uploads(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety alerts
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id),
  video_upload_id UUID REFERENCES video_uploads(id),
  violation_type TEXT NOT NULL,
  description TEXT,
  severity severity_level DEFAULT 'medium',
  confidence_score DECIMAL(5,2),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily summaries (aggregated metrics)
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  alignment_score DECIMAL(5,2),
  efficiency_score DECIMAL(5,2),
  safety_compliance_rate DECIMAL(5,2),
  tasks_planned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_labor_hours DECIMAL(10,2),
  safety_incidents INTEGER DEFAULT 0,
  weather_impact BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, date)
);

-- Create indexes for common queries
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_planned_tasks_project ON planned_tasks(project_id);
CREATE INDEX idx_planned_tasks_dates ON planned_tasks(planned_start, planned_end);
CREATE INDEX idx_video_uploads_project ON video_uploads(project_id);
CREATE INDEX idx_video_uploads_worker ON video_uploads(worker_id);
CREATE INDEX idx_observed_events_project ON observed_events(project_id);
CREATE INDEX idx_observed_events_worker ON observed_events(worker_id);
CREATE INDEX idx_safety_alerts_project ON safety_alerts(project_id);
CREATE INDEX idx_safety_alerts_severity ON safety_alerts(severity);
CREATE INDEX idx_daily_summaries_project_date ON daily_summaries(project_id, date);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE observed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all authenticated users full access

-- Profiles
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update profiles" ON profiles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (true);

-- Projects
CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE TO authenticated USING (true);

-- Project members
CREATE POLICY "Authenticated users can view project members" ON project_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert project members" ON project_members
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update project members" ON project_members
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete project members" ON project_members
  FOR DELETE TO authenticated USING (true);

-- Planned tasks
CREATE POLICY "Authenticated users can view tasks" ON planned_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks" ON planned_tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" ON planned_tasks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tasks" ON planned_tasks
  FOR DELETE TO authenticated USING (true);

-- Video uploads
CREATE POLICY "Authenticated users can view uploads" ON video_uploads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert uploads" ON video_uploads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update uploads" ON video_uploads
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete uploads" ON video_uploads
  FOR DELETE TO authenticated USING (true);

-- Observed events
CREATE POLICY "Authenticated users can view events" ON observed_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert events" ON observed_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" ON observed_events
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete events" ON observed_events
  FOR DELETE TO authenticated USING (true);

-- Safety alerts
CREATE POLICY "Authenticated users can view safety alerts" ON safety_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert safety alerts" ON safety_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update safety alerts" ON safety_alerts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete safety alerts" ON safety_alerts
  FOR DELETE TO authenticated USING (true);

-- Daily summaries
CREATE POLICY "Authenticated users can view daily summaries" ON daily_summaries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert daily summaries" ON daily_summaries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily summaries" ON daily_summaries
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete daily summaries" ON daily_summaries
  FOR DELETE TO authenticated USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'field_worker'::public.user_role)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_planned_tasks_updated_at BEFORE UPDATE ON planned_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_video_uploads_updated_at BEFORE UPDATE ON video_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_observed_events_updated_at BEFORE UPDATE ON observed_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
