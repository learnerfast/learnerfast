-- Add password_hash column to website_users table
ALTER TABLE public.website_users 
ADD COLUMN password_hash TEXT;
