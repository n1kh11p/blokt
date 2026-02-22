-- Add assigned_to column to planned_tasks table
ALTER TABLE planned_tasks 
ADD COLUMN assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_planned_tasks_assigned_to ON planned_tasks(assigned_to);
