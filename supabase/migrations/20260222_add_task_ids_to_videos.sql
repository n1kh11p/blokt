-- Add task_ids array to videos table
ALTER TABLE videos ADD COLUMN task_ids UUID[] DEFAULT '{}';

-- Create index for task_ids array queries
CREATE INDEX idx_videos_task_ids ON videos USING GIN(task_ids);
