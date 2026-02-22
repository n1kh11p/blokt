-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- Check current auth users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- Check current public users
SELECT user_id, email, name, role FROM public.users;
