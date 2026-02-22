-- Seed test users for development
-- Run this in Supabase SQL Editor

-- IMPORTANT: The profiles table has a foreign key to auth.users, so we need to:
-- 1. First create fake auth users
-- 2. Then insert the profiles

-- Step 1: Insert fake users into auth.users (bypassing auth)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'subhas.vikram@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222201', 'robert.smith@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222202', 'sarah.johnson@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222203', 'michael.williams@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333301', 'david.brown@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333302', 'jennifer.davis@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333303', 'carlos.martinez@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333304', 'emily.wilson@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333305', 'kevin.anderson@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444401', 'patricia.taylor@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444402', 'anthony.thomas@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('55555555-5555-5555-5555-555555555501', 'william.jackson@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
  ('55555555-5555-5555-5555-555555555502', 'elizabeth.white@blokt.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert profiles for these users (with varied roles)
INSERT INTO profiles (id, email, full_name, role, organization_id, trade, phone) VALUES
  ('11111111-1111-1111-1111-111111111101', 'subhas.vikram@blokt.com', 'Subhas Vikram', 'project_manager', NULL, NULL, '555-0101'),
  ('22222222-2222-2222-2222-222222222201', 'robert.smith@blokt.com', 'Robert Smith', 'foreman', NULL, 'General', '555-0201'),
  ('22222222-2222-2222-2222-222222222202', 'sarah.johnson@blokt.com', 'Sarah Johnson', 'safety_manager', NULL, 'Electrical', '555-0202'),
  ('22222222-2222-2222-2222-222222222203', 'michael.williams@blokt.com', 'Michael Williams', 'foreman', NULL, 'Plumbing', '555-0203'),
  ('33333333-3333-3333-3333-333333333301', 'david.brown@blokt.com', 'David Brown', 'field_worker', NULL, 'Carpentry', '555-0301'),
  ('33333333-3333-3333-3333-333333333302', 'jennifer.davis@blokt.com', 'Jennifer Davis', 'project_manager', NULL, 'HVAC', '555-0302'),
  ('33333333-3333-3333-3333-333333333303', 'carlos.martinez@blokt.com', 'Carlos Martinez', 'field_worker', NULL, 'Concrete', '555-0303'),
  ('33333333-3333-3333-3333-333333333304', 'emily.wilson@blokt.com', 'Emily Wilson', 'foreman', NULL, 'Electrical', '555-0304'),
  ('33333333-3333-3333-3333-333333333305', 'kevin.anderson@blokt.com', 'Kevin Anderson', 'field_worker', NULL, 'Framing', '555-0305'),
  ('44444444-4444-4444-4444-444444444401', 'patricia.taylor@blokt.com', 'Patricia Taylor', 'safety_manager', NULL, NULL, '555-0401'),
  ('44444444-4444-4444-4444-444444444402', 'anthony.thomas@blokt.com', 'Anthony Thomas', 'executive', NULL, NULL, '555-0402'),
  ('55555555-5555-5555-5555-555555555501', 'william.jackson@blokt.com', 'William Jackson', 'executive', NULL, NULL, '555-0501'),
  ('55555555-5555-5555-5555-555555555502', 'elizabeth.white@blokt.com', 'Elizabeth White', 'field_worker', NULL, NULL, '555-0502')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update any existing profiles that might have NULL names
UPDATE profiles SET full_name = 'Subhas Vikram', role = 'project_manager' WHERE id = '11111111-1111-1111-1111-111111111101';
UPDATE profiles SET full_name = 'Robert Smith', role = 'foreman' WHERE id = '22222222-2222-2222-2222-222222222201';
UPDATE profiles SET full_name = 'Sarah Johnson', role = 'safety_manager' WHERE id = '22222222-2222-2222-2222-222222222202';
UPDATE profiles SET full_name = 'Michael Williams', role = 'foreman' WHERE id = '22222222-2222-2222-2222-222222222203';
UPDATE profiles SET full_name = 'David Brown', role = 'field_worker' WHERE id = '33333333-3333-3333-3333-333333333301';
UPDATE profiles SET full_name = 'Jennifer Davis', role = 'project_manager' WHERE id = '33333333-3333-3333-3333-333333333302';
UPDATE profiles SET full_name = 'Carlos Martinez', role = 'field_worker' WHERE id = '33333333-3333-3333-3333-333333333303';
UPDATE profiles SET full_name = 'Emily Wilson', role = 'foreman' WHERE id = '33333333-3333-3333-3333-333333333304';
UPDATE profiles SET full_name = 'Kevin Anderson', role = 'field_worker' WHERE id = '33333333-3333-3333-3333-333333333305';
UPDATE profiles SET full_name = 'Patricia Taylor', role = 'safety_manager' WHERE id = '44444444-4444-4444-4444-444444444401';
UPDATE profiles SET full_name = 'Anthony Thomas', role = 'executive' WHERE id = '44444444-4444-4444-4444-444444444402';
UPDATE profiles SET full_name = 'William Jackson', role = 'executive' WHERE id = '55555555-5555-5555-5555-555555555501';
UPDATE profiles SET full_name = 'Elizabeth White', role = 'field_worker' WHERE id = '55555555-5555-5555-5555-555555555502';

-- Verify the results
SELECT id, full_name, email, role, trade FROM profiles ORDER BY role, full_name;
