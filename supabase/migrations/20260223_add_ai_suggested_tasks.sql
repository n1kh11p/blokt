-- ============================================
-- Add ai_suggested_tasks to videos table
-- ============================================

ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS ai_suggested_tasks TEXT[];
