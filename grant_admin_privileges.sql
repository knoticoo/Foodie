-- Script to grant admin privileges to a specific user
-- This will make the user an admin so they can access the admin panel without needing an API key

-- Grant admin privileges to the specified user
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'emalinovskis@me.com';

-- Verify the change
SELECT email, is_admin, created_at 
FROM users 
WHERE email = 'emalinovskis@me.com';

-- Optional: List all admin users
SELECT email, is_admin, created_at 
FROM users 
WHERE is_admin = TRUE 
ORDER BY created_at;