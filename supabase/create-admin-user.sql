-- Create Admin User for Daxow Agent Portal
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the auth user (this will create a user in auth.users table)
-- You'll need to do this via Supabase Dashboard → Authentication → Add User
-- OR run this function:

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users (you might need admin privileges)
  -- Note: It's better to create user via Supabase Dashboard first
  
  -- Get the user ID if already created, or create via Dashboard
  -- Email: admin@daxow.com
  -- Password: Admin@123
  
  -- For now, let's assume you created the user via Dashboard
  -- and get the UUID from auth.users
  
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = 'admin@daxow.com';
  
  -- If user doesn't exist, you need to create it via Supabase Dashboard first
  IF new_user_id IS NULL THEN
    RAISE NOTICE 'Please create user admin@daxow.com via Supabase Dashboard → Authentication → Add User with password: Admin@123';
    RAISE EXCEPTION 'User not found. Create via Dashboard first.';
  END IF;
  
  -- Step 2: Insert into user_profile table
  INSERT INTO public.user_profile (
    id,
    email,
    first_name,
    last_name,
    role_id,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    'admin@daxow.com',
    'Admin',
    'User',
    (SELECT id FROM public.roles WHERE name = 'Super Admin' LIMIT 1),  -- Get Super Admin role
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role_id = EXCLUDED.role_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
    
  RAISE NOTICE 'Admin user profile created/updated successfully for user ID: %', new_user_id;
END $$;

-- Verify the admin user was created
SELECT 
  up.id,
  up.email,
  up.first_name,
  up.last_name,
  r.name as role_name,
  up.is_active
FROM public.user_profile up
LEFT JOIN public.roles r ON up.role_id = r.id
WHERE up.email = 'admin@daxow.com';
