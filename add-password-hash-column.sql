-- Add password_hash column to website_users table
ALTER TABLE website_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'website_users' 
AND column_name = 'password_hash';
