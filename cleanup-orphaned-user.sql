-- Cleanup orphaned user from website_users table
-- Run this in Supabase SQL Editor to remove the user that was created without email confirmation

DELETE FROM website_users 
WHERE email = 'chayankkashyapgoldy@gmail.com' 
AND website_name = 'demo3';

-- Verify deletion
SELECT * FROM website_users 
WHERE email = 'chayankkashyapgoldy@gmail.com' 
AND website_name = 'demo3';
