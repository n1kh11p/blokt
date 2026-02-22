-- ============================================
-- Add action_annotations to videos table
-- ============================================

ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS action_annotations JSONB;
