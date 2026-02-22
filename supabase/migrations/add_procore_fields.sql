-- Add Procore integration fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS procore_id TEXT UNIQUE;

-- Add Procore RFI reference to planned_tasks
ALTER TABLE planned_tasks ADD COLUMN IF NOT EXISTS procore_rfi_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_procore_id ON projects(procore_id);
CREATE INDEX IF NOT EXISTS idx_planned_tasks_procore_rfi_id ON planned_tasks(procore_rfi_id);
