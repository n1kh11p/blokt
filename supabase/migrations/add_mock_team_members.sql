-- Mock Team Members for Procore Integration Demo
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Clean up old mock data completely (handle all FK dependencies)
DELETE FROM safety_alerts WHERE worker_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@blokt.com'
);
DELETE FROM project_members WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@blokt.com'
);
DELETE FROM planned_tasks WHERE assigned_to IN (
    SELECT id FROM auth.users WHERE email LIKE '%@blokt.com'
);
DELETE FROM profiles WHERE email LIKE '%@blokt.com';
DELETE FROM auth.users WHERE email LIKE '%@blokt.com';

-- Step 2: Create 15 unique mock team members with @blokt.com emails
DO $$
DECLARE
    org_id UUID;
    user_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    names TEXT[] := ARRAY[
        'Sarah Johnson', 'Mike Chen', 'David Lee', 'Maria Garcia', 'James Wilson',
        'Emily Davis', 'Robert Martinez', 'Jennifer Brown', 'Carlos Ramirez', 'Amanda Foster',
        'Kevin O''Brien', 'Lisa Park', 'Marcus Thompson', 'Rachel Kim', 'Brandon Scott'
    ];
    emails TEXT[] := ARRAY[
        'sarah.johnson@blokt.com', 'mike.chen@blokt.com', 'david.lee@blokt.com', 'maria.garcia@blokt.com', 'james.wilson@blokt.com',
        'emily.davis@blokt.com', 'robert.martinez@blokt.com', 'jennifer.brown@blokt.com', 'carlos.ramirez@blokt.com', 'amanda.foster@blokt.com',
        'kevin.obrien@blokt.com', 'lisa.park@blokt.com', 'marcus.thompson@blokt.com', 'rachel.kim@blokt.com', 'brandon.scott@blokt.com'
    ];
    roles user_role[] := ARRAY['project_manager', 'foreman', 'field_worker', 'safety_manager', 'foreman',
                                'safety_manager', 'field_worker', 'field_worker', 'foreman', 'field_worker',
                                'project_manager', 'field_worker', 'foreman', 'safety_manager', 'field_worker'];
    i INT;
    proj RECORD;
    proj_num INT := 0;
    member_start INT;
    member_count INT;
    assigned_role user_role;
    role_options user_role[] := ARRAY['project_manager', 'foreman', 'field_worker', 'safety_manager'];
BEGIN
    -- Get the first organization
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found. Create an organization first.';
    END IF;

    -- Create mock auth users (use upsert to handle any existing records)
    FOR i IN 1..15 LOOP
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (user_ids[i], '00000000-0000-0000-0000-000000000000', emails[i], '', NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
        ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id, updated_at = NOW();
        
        -- Update user_ids array with actual ID in case of conflict
        SELECT id INTO user_ids[i] FROM auth.users WHERE email = emails[i];
    END LOOP;

    -- Create corresponding profiles with full_name (use upsert)
    FOR i IN 1..15 LOOP
        INSERT INTO profiles (id, email, full_name, role, organization_id)
        VALUES (user_ids[i], emails[i], names[i], roles[i], org_id)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = EXCLUDED.email;
    END LOOP;

    -- Assign DIFFERENT team members to each project with randomized roles
    FOR proj IN SELECT id, name FROM projects WHERE organization_id = org_id ORDER BY created_at
    LOOP
        proj_num := proj_num + 1;
        
        -- Each project gets 4-6 different members, offset by project number
        member_start := ((proj_num - 1) * 3) % 15;
        member_count := 4 + (proj_num % 3); -- 4, 5, or 6 members
        
        FOR i IN 0..(member_count - 1) LOOP
            -- Rotate through members and assign randomized roles
            assigned_role := role_options[1 + ((i + proj_num) % 4)];
            
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (proj.id, user_ids[1 + ((member_start + i) % 15)], assigned_role)
            ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Created 15 mock team members and assigned varied teams to each project';
END $$;

-- Step 3: Verify the results - each project should have different team members
SELECT p.name as project, pr.full_name, pr.email, pm.role
FROM project_members pm
JOIN projects p ON p.id = pm.project_id
JOIN profiles pr ON pr.id = pm.user_id
ORDER BY p.name, pm.role, pr.full_name;
